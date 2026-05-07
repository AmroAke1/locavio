import asyncio
from datetime import date as Date, datetime

from sqlalchemy import func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.models.activity import Activity
from app.models.itinerary import Itinerary, ItineraryPurpose, ItineraryStatus
from app.schemas.itinerary import ItineraryCreate, ItineraryGenerateRequest, ItineraryUpdate
from app.services import ai_service, geocoding_service


def _auto_status(date: Date | None) -> ItineraryStatus:
    if date and date >= Date.today():
        return ItineraryStatus.upcoming
    return ItineraryStatus.draft


async def list_itineraries(
    db: AsyncSession,
    user_id: int,
    status: ItineraryStatus | None,
    purpose: ItineraryPurpose | None,
    page: int,
    limit: int,
    language: str,
) -> list[Itinerary]:
    """List itineraries belonging to a user with optional filters and pagination."""
    query = (
        select(Itinerary)
        .where(Itinerary.user_id == user_id)
        .options(selectinload(Itinerary.activities))
        .order_by(Itinerary.created_at.desc())
        .offset((page - 1) * limit)
        .limit(limit)
    )
    if status:
        query = query.where(Itinerary.status == status)
    if purpose:
        query = query.where(Itinerary.purpose == purpose)

    result = await db.execute(query)
    return list(result.scalars().all())


async def get_itinerary(
    db: AsyncSession, itinerary_id: int, language: str
) -> Itinerary | None:
    """Fetch a single itinerary with its nested activities."""
    result = await db.execute(
        select(Itinerary)
        .where(Itinerary.id == itinerary_id)
        .options(selectinload(Itinerary.activities))
    )
    return result.scalar_one_or_none()


async def create_itinerary(
    db: AsyncSession, user_id: int, data: ItineraryCreate, language: str
) -> Itinerary:
    """Create a new itinerary manually."""
    fields = data.model_dump()

    if fields.get("location") and fields.get("lat") is None:
        coords = await geocoding_service.geocode(fields["location"])
        if coords:
            fields["lat"], fields["lng"] = coords[0], coords[1]

    fields["status"] = _auto_status(fields.get("date"))

    itinerary = Itinerary(user_id=user_id, **fields)
    db.add(itinerary)
    await db.commit()
    await db.refresh(itinerary)
    return itinerary


async def update_itinerary(
    db: AsyncSession, itinerary: Itinerary, data: ItineraryUpdate, language: str
) -> Itinerary:
    """Apply a partial update to an itinerary."""
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(itinerary, field, value)
    await db.commit()
    await db.refresh(itinerary)
    return await get_itinerary(db, itinerary.id, language)


async def delete_itinerary(db: AsyncSession, itinerary: Itinerary) -> None:
    """Delete an itinerary and its cascaded activities."""
    await db.delete(itinerary)
    await db.commit()


async def generate_ai_itinerary(
    db: AsyncSession,
    user_id: int,
    data: ItineraryGenerateRequest,
    language: str,
) -> Itinerary:
    """Generate an itinerary via AI, geocode destination + each activity, and persist.

    Geocodes data.location in parallel with AI generation so the parent
    Itinerary row gets lat/lng — required by TripOverviewMap on the dashboard.
    """
    date_str = data.date.isoformat() if data.date else ""
    ai_result, itinerary_coords = await asyncio.gather(
        ai_service.generate_itinerary(
            location=data.location,
            purpose=data.purpose.value,
            date=date_str,
            preferences=data.preferences,
            language=language,
        ),
        geocoding_service.geocode(data.location),
    )

    itinerary_lat = itinerary_coords[0] if itinerary_coords else None
    itinerary_lng = itinerary_coords[1] if itinerary_coords else None

    itinerary = Itinerary(
        user_id=user_id,
        title=ai_result["title"],
        description=ai_result["description"],
        purpose=data.purpose,
        location=data.location,
        lat=itinerary_lat,
        lng=itinerary_lng,
        date=data.date,
        status=_auto_status(data.date),
        generated_by_ai=True,
    )
    db.add(itinerary)
    await db.flush()

    for idx, act_data in enumerate(ai_result.get("activities", [])):
        coords = await geocoding_service.geocode(act_data.get("location_name", ""))
        lat = coords[0] if coords else None
        lng = coords[1] if coords else None

        start_time_str = act_data.get("start_time")
        start_time = None
        if start_time_str:
            from datetime import time as dt_time
            h, m = start_time_str.split(":")
            start_time = dt_time(int(h), int(m))

        activity = Activity(
            itinerary_id=itinerary.id,
            title=act_data["title"],
            description=act_data.get("description"),
            category=act_data.get("category"),
            location_name=act_data.get("location_name"),
            lat=lat,
            lng=lng,
            start_time=start_time,
            duration_minutes=act_data.get("duration_minutes"),
            order_index=act_data.get("order_index", idx),
        )
        db.add(activity)

    await db.commit()
    return await get_itinerary(db, itinerary.id, language)
