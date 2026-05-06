import httpx

from app.core.config import settings


async def geocode(location_name: str) -> tuple[float, float] | None:
    """Geocode a location name to (lat, lng) coordinates.

    Uses OpenCage if OPENCAGE_API_KEY is configured, otherwise returns None.

    Args:
        location_name: Human-readable location string to geocode.

    Returns:
        A (latitude, longitude) float tuple, or None if geocoding is unavailable
        or the location could not be resolved.

    # TODO: also support Google Maps Geocoding API as a fallback provider
    """
    if not settings.OPENCAGE_API_KEY:
        return None

    async with httpx.AsyncClient() as client:
        resp = await client.get(
            "https://api.opencagedata.com/geocode/v1/json",
            params={
                "q": location_name,
                "key": settings.OPENCAGE_API_KEY,
                "limit": 1,
                "no_annotations": 1,
            },
        )
        resp.raise_for_status()
        data = resp.json()

    results = data.get("results", [])
    if not results:
        return None

    geometry = results[0].get("geometry", {})
    lat = geometry.get("lat")
    lng = geometry.get("lng")

    if lat is None or lng is None:
        return None

    return float(lat), float(lng)
