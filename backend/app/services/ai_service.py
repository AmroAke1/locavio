import json
import logging

from fastapi import HTTPException, status
from openai import AsyncOpenAI, RateLimitError, APIError as OpenAIError
from google import genai
from google.genai import types, errors as genai_errors

from app.core.config import settings

logger = logging.getLogger("locavio")

_openai_client: AsyncOpenAI | None = None
_gemini_client: genai.Client | None = None


class _QuotaExceeded(Exception):
    """Raised internally when a provider hits its rate/quota limit."""


def _get_openai_client() -> AsyncOpenAI:
    global _openai_client
    if _openai_client is None:
        _openai_client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
    return _openai_client


def _get_gemini_client() -> genai.Client:
    global _gemini_client
    if _gemini_client is None:
        _gemini_client = genai.Client(api_key=settings.GEMINI_API_KEY)
    return _gemini_client


async def generate_itinerary(
    location: str,
    purpose: str,
    date: str,
    preferences: dict,
    language: str,
) -> dict:
    prompt = f"""Generate a detailed one-day travel itinerary.

Location: {location}
Purpose: {purpose}
Date: {date if date else "flexible"}
Preferences: {json.dumps(preferences) if preferences else "none"}
Response language: {language}

Return ONLY valid JSON with this exact structure:
{{
  "title": "catchy itinerary title",
  "description": "2-3 sentence overview of the day",
  "activities": [
    {{
      "title": "activity name",
      "description": "1-2 sentence description",
      "category": "one of: food, culture, nature, social, shopping, transport",
      "location_name": "specific venue name and city",
      "start_time": "HH:MM",
      "duration_minutes": 60,
      "order_index": 0
    }}
  ]
}}

Include 5-7 activities spread from morning to evening. All text must be in the {language} language."""

    # Try each provider in order; fall through to the next on quota errors.
    if settings.GEMINI_API_KEY:
        try:
            return await _generate_with_gemini(prompt)
        except _QuotaExceeded:
            logger.warning("Gemini quota exceeded - falling back to OpenAI")

    if settings.OPENAI_API_KEY:
        try:
            return await _generate_with_openai(prompt)
        except _QuotaExceeded:
            logger.warning("OpenAI quota exceeded - falling back to mock")

    logger.warning("All AI providers exhausted or unconfigured - using mock itinerary")
    return _mock_itinerary(location, purpose, date)


async def _generate_with_gemini(prompt: str) -> dict:
    client = _get_gemini_client()
    try:
        response = await client.aio.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                temperature=0.7,
            ),
        )
    except genai_errors.ClientError as e:
        if e.code == 429:
            raise _QuotaExceeded() from e
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"AI service error: {e}",
        )
    return json.loads(response.text)


async def _generate_with_openai(prompt: str) -> dict:
    client = _get_openai_client()
    try:
        response = await client.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"},
            temperature=0.7,
        )
    except RateLimitError as e:
        raise _QuotaExceeded() from e
    except OpenAIError as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"AI service error: {e}",
        )
    return json.loads(response.choices[0].message.content)


def _mock_itinerary(location: str, purpose: str, date: str) -> dict:
    return {
        "title": f"A day in {location}",
        "description": (
            f"An AI-curated {purpose} itinerary for {location}"
            + (f" on {date}" if date else "") + ". "
            "Enjoy a perfect blend of local highlights tailored to your interests."
        ),
        "activities": [
            {
                "title": "Morning coffee & local market",
                "description": "Start your day with a coffee at a local cafe and explore the nearby market.",
                "category": "food",
                "location_name": f"Central Market, {location}",
                "start_time": "09:00",
                "duration_minutes": 60,
                "order_index": 0,
            },
            {
                "title": "City history museum",
                "description": "Dive into the rich history and culture of the city.",
                "category": "culture",
                "location_name": f"City History Museum, {location}",
                "start_time": "10:30",
                "duration_minutes": 90,
                "order_index": 1,
            },
            {
                "title": "Lunch at a local restaurant",
                "description": "Enjoy authentic local cuisine at a highly rated neighbourhood restaurant.",
                "category": "food",
                "location_name": f"Old Town Restaurant, {location}",
                "start_time": "12:30",
                "duration_minutes": 60,
                "order_index": 2,
            },
            {
                "title": "Riverside walk",
                "description": "Take a relaxing stroll along the riverside promenade.",
                "category": "nature",
                "location_name": f"Riverside Promenade, {location}",
                "start_time": "14:00",
                "duration_minutes": 60,
                "order_index": 3,
            },
            {
                "title": "Evening rooftop bar",
                "description": "Wind down the day with panoramic views and local drinks.",
                "category": "social",
                "location_name": f"Rooftop Bar, {location}",
                "start_time": "19:00",
                "duration_minutes": 120,
                "order_index": 4,
            },
        ],
    }
