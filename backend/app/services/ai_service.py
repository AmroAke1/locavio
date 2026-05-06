async def generate_itinerary(
    location: str,
    purpose: str,
    date: str,
    preferences: dict,
    language: str,
) -> dict:
    """Generate an AI-powered itinerary for the given location and parameters.

    Args:
        location: Destination city or area name.
        purpose: One of 'tourism', 'work', 'local_life', 'social'.
        date: ISO date string for the itinerary day.
        preferences: User preference dict (categories, pace, etc.).
        language: BCP-47 language code for response language.

    Returns:
        Dict with 'title', 'description', and 'activities' list matching
        the ItineraryResponse structure.

    # TODO: replace this mock with a real LLM call (OpenAI/Gemini)
    """
    return {
        "title": f"A day in {location}",
        "description": (
            f"An AI-curated {purpose} itinerary for {location} on {date}. "
            "Enjoy a perfect blend of local highlights tailored to your interests."
        ),
        "activities": [
            {
                "title": "Morning coffee & local market",
                "description": "Start your day with a coffee at a local café and explore the nearby market.",
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
