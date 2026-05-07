import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from app.services.geocoding_service import geocode, _geocode_nominatim, _geocode_google, _geocode_opencage


def _make_httpx_response(json_data, status_code=200):
    mock_resp = MagicMock()
    mock_resp.status_code = status_code
    mock_resp.json.return_value = json_data
    mock_resp.raise_for_status = MagicMock()
    return mock_resp


@pytest.mark.asyncio
async def test_geocode_nominatim_returns_coords():
    nominatim_data = [{"lat": "48.8566", "lon": "2.3522"}]
    mock_resp = _make_httpx_response(nominatim_data)

    with patch("httpx.AsyncClient") as MockClient:
        mock_client = AsyncMock()
        mock_client.get = AsyncMock(return_value=mock_resp)
        MockClient.return_value.__aenter__ = AsyncMock(return_value=mock_client)
        MockClient.return_value.__aexit__ = AsyncMock(return_value=False)

        result = await _geocode_nominatim("Paris")

    assert result == (48.8566, 2.3522)


@pytest.mark.asyncio
async def test_geocode_nominatim_returns_none_for_empty_results():
    mock_resp = _make_httpx_response([])

    with patch("httpx.AsyncClient") as MockClient:
        mock_client = AsyncMock()
        mock_client.get = AsyncMock(return_value=mock_resp)
        MockClient.return_value.__aenter__ = AsyncMock(return_value=mock_client)
        MockClient.return_value.__aexit__ = AsyncMock(return_value=False)

        result = await _geocode_nominatim("Nonexistent Place XYZ")

    assert result is None


@pytest.mark.asyncio
async def test_geocode_uses_nominatim_when_no_api_keys():
    nominatim_data = [{"lat": "41.0082", "lon": "28.9784"}]
    mock_resp = _make_httpx_response(nominatim_data)

    with patch("app.services.geocoding_service.settings") as mock_settings, \
         patch("httpx.AsyncClient") as MockClient:
        mock_settings.GOOGLE_MAPS_API_KEY = ""
        mock_settings.OPENCAGE_API_KEY = ""

        mock_client = AsyncMock()
        mock_client.get = AsyncMock(return_value=mock_resp)
        MockClient.return_value.__aenter__ = AsyncMock(return_value=mock_client)
        MockClient.return_value.__aexit__ = AsyncMock(return_value=False)

        result = await geocode("Istanbul")

    assert result == (41.0082, 28.9784)


@pytest.mark.asyncio
async def test_geocode_google_returns_coords():
    google_data = {
        "status": "OK",
        "results": [{"geometry": {"location": {"lat": 48.8566, "lng": 2.3522}}}],
    }
    mock_resp = _make_httpx_response(google_data)

    with patch("httpx.AsyncClient") as MockClient:
        mock_client = AsyncMock()
        mock_client.get = AsyncMock(return_value=mock_resp)
        MockClient.return_value.__aenter__ = AsyncMock(return_value=mock_client)
        MockClient.return_value.__aexit__ = AsyncMock(return_value=False)

        result = await _geocode_google("Paris")

    assert result == (48.8566, 2.3522)


@pytest.mark.asyncio
async def test_geocode_google_returns_none_when_not_ok():
    mock_resp = _make_httpx_response({"status": "ZERO_RESULTS", "results": []})

    with patch("httpx.AsyncClient") as MockClient:
        mock_client = AsyncMock()
        mock_client.get = AsyncMock(return_value=mock_resp)
        MockClient.return_value.__aenter__ = AsyncMock(return_value=mock_client)
        MockClient.return_value.__aexit__ = AsyncMock(return_value=False)

        result = await _geocode_google("Nowhere")

    assert result is None


@pytest.mark.asyncio
async def test_geocode_opencage_returns_coords():
    opencage_data = {
        "results": [{"geometry": {"lat": 51.5074, "lng": -0.1278}}]
    }
    mock_resp = _make_httpx_response(opencage_data)

    with patch("httpx.AsyncClient") as MockClient:
        mock_client = AsyncMock()
        mock_client.get = AsyncMock(return_value=mock_resp)
        MockClient.return_value.__aenter__ = AsyncMock(return_value=mock_client)
        MockClient.return_value.__aexit__ = AsyncMock(return_value=False)

        result = await _geocode_opencage("London")

    assert result == (51.5074, -0.1278)


@pytest.mark.asyncio
async def test_geocode_opencage_returns_none_for_empty():
    mock_resp = _make_httpx_response({"results": []})

    with patch("httpx.AsyncClient") as MockClient:
        mock_client = AsyncMock()
        mock_client.get = AsyncMock(return_value=mock_resp)
        MockClient.return_value.__aenter__ = AsyncMock(return_value=mock_client)
        MockClient.return_value.__aexit__ = AsyncMock(return_value=False)

        result = await _geocode_opencage("Nowhere XYZ")

    assert result is None