import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from app.services.ai_service import generate_itinerary, _mock_itinerary


def test_mock_itinerary_returns_correct_structure():
    result = _mock_itinerary("Paris", "tourism", "2026-07-01")
    assert "title" in result
    assert "description" in result
    assert "activities" in result
    assert len(result["activities"]) > 0
    assert "Paris" in result["title"]


def test_mock_itinerary_without_date():
    result = _mock_itinerary("London", "business", "")
    assert "activities" in result
    assert len(result["activities"]) > 0


def test_mock_itinerary_activity_structure():
    result = _mock_itinerary("NYC", "tourism", "2026-01-01")
    act = result["activities"][0]
    for key in ("title", "description", "category", "location_name", "start_time", "duration_minutes", "order_index"):
        assert key in act


@pytest.mark.asyncio
async def test_generate_uses_mock_when_no_keys():
    with patch("app.services.ai_service.settings") as mock_settings:
        mock_settings.GEMINI_API_KEY = ""
        mock_settings.OPENAI_API_KEY = ""

        result = await generate_itinerary("Istanbul", "tourism", "2026-07-01", {}, "en")

    assert "title" in result
    assert "activities" in result


@pytest.mark.asyncio
async def test_generate_with_gemini_success():
    mock_response = MagicMock()
    mock_response.text = '{"title": "Gemini Day", "description": "AI-generated", "activities": []}'

    mock_gemini_client = MagicMock()
    mock_gemini_client.aio.models.generate_content = AsyncMock(return_value=mock_response)

    with patch("app.services.ai_service.settings") as mock_settings, \
         patch("app.services.ai_service._get_gemini_client", return_value=mock_gemini_client):
        mock_settings.GEMINI_API_KEY = "fake-key"
        mock_settings.OPENAI_API_KEY = ""

        result = await generate_itinerary("Paris", "tourism", "", {}, "en")

    assert result["title"] == "Gemini Day"


@pytest.mark.asyncio
async def test_generate_falls_back_to_mock_on_gemini_quota():
    from app.services.ai_service import _QuotaExceeded

    with patch("app.services.ai_service.settings") as mock_settings, \
         patch("app.services.ai_service._generate_with_gemini", new=AsyncMock(side_effect=_QuotaExceeded())):
        mock_settings.GEMINI_API_KEY = "fake-key"
        mock_settings.OPENAI_API_KEY = ""

        result = await generate_itinerary("Rome", "tourism", "", {}, "en")

    assert "activities" in result


@pytest.mark.asyncio
async def test_generate_with_openai_success():
    mock_choice = MagicMock()
    mock_choice.message.content = '{"title": "OpenAI Day", "description": "AI", "activities": []}'
    mock_response = MagicMock()
    mock_response.choices = [mock_choice]

    mock_openai_client = AsyncMock()
    mock_openai_client.chat.completions.create = AsyncMock(return_value=mock_response)

    with patch("app.services.ai_service.settings") as mock_settings, \
         patch("app.services.ai_service._get_openai_client", return_value=mock_openai_client):
        mock_settings.GEMINI_API_KEY = ""
        mock_settings.OPENAI_API_KEY = "fake-openai-key"

        result = await generate_itinerary("Berlin", "tourism", "", {}, "en")

    assert result["title"] == "OpenAI Day"