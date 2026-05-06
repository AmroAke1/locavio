import httpx

from app.core.config import settings


async def geocode(location_name: str) -> tuple[float, float] | None:
    if settings.GOOGLE_MAPS_API_KEY:
        return await _geocode_google(location_name)
    if settings.OPENCAGE_API_KEY:
        return await _geocode_opencage(location_name)
    return None


async def _geocode_google(location_name: str) -> tuple[float, float] | None:
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            "https://maps.googleapis.com/maps/api/geocode/json",
            params={"address": location_name, "key": settings.GOOGLE_MAPS_API_KEY},
        )
        resp.raise_for_status()
        data = resp.json()

    if data.get("status") != "OK" or not data.get("results"):
        return None

    location = data["results"][0]["geometry"]["location"]
    return float(location["lat"]), float(location["lng"])


async def _geocode_opencage(location_name: str) -> tuple[float, float] | None:
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
