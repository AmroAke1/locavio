from datetime import datetime

from sqlalchemy import func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.models.activity import Activity
from app.models.itinerary import Itinerary, ItineraryPurpose, ItineraryStatus
from app.schemas.itinerary import ItineraryCreate, ItineraryGenerateRequest, ItineraryUpdate
from app.services import ai_service, geocoding_service


async def list_itineraries(
    db: AsyncSession,
    user_id: int,
    status: ItineraryStatus | None,
    purpose: ItineraryPurpose | None,
    page: int,
    limit: int,
    language: str,
) -> list[Itinerary]:
    """List itineraries belonging to a user with optional filters and pagination.

    Args:
        db: Active database session.
        user_id: Owner's user ID.
        status: Optional status filter.
        purpose: Optional purpose filter.
        page: 1-based page number.
        limit: Results per page.
        language: Request language code (reserved for future i18n use).

    Returns:
        List of Itinerary ORM instances.
    """
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
    """Fetch a single itinerary with its nested activities.

    Args:
        db: Active database session.
        itinerary_id: Primary key of the itinerary.
        language: Request language code.

    Returns:
        Itinerary ORM instance with activities loaded, or None.
    """
    result = await db.execute(
        select(Itinerary)
        .where(Itinerary.id == itinerary_id)
        .options(selectinload(Itinerary.activities))
    )
    return result.scalar_one_or_none()


async def create_itinerary(
    db: AsyncSession, user_id: int, data: ItineraryCreate, language: str
) -> Itinerary:
    """Create a new itinerary manually.

    Args:
        db: Active database session.
        user_id: Owner's user ID.
        data: Validated creation payload.
        language: Request language code.

    Returns:
        Newly created Itinerary ORM instance.
    """
    itinerary = Itinerary(user_id=user_id, **data.model_dump())
    db.add(itinerary)
    await db.commit()
    await db.refresh(itinerary)
    return itinerary


async def update_itinerary(
    db: AsyncSession, itinerary: Itinerary, data: ItineraryUpdate, language: str
) -> Itinerary:
    """Apply a partial update to an itinerary.

    Args:
        db: Active database session.
        itinerary: Itinerary ORM instance to update.
        data: Pydantic schema with optional fields to overwrite.
        language: Request language code.

    Returns:
        Updated Itinerary ORM instance with activities loaded.
    """
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(itinerary, field, value)
    await db.commit()
    await db.refresh(itinerary)
    return await get_itinerary(db, itinerary.id, language)


async def delete_itinerary(db: AsyncSession, itinerary: Itinerary) -> None:
    """Delete an itinerary and its cascaded activities.

    Args:
        db: Active database session.
        itinerary: Itinerary ORM instance to delete.
    """
    await db.delete(itinerary)
    await db.commit()


async def generate_ai_itinerary(
    db: AsyncSession,
    user_id: int,
    data: ItineraryGenerateRequest,
    language: str,
) -> Itinerary:
    """Generate an itinerary via AI, geocode each activity, and persist to the database.

    Args:
        db: Active database session.
        user_id: Owner's user ID.
        data: Generation request payload (location, purpose, date, preferences).
        language: Request language code passed to the AI service.

    Returns:
        Newly created Itinerary ORM instance with activities loaded.
    """
    date_str = data.date.isoformat() if data.date else ""
    ai_result = await ai_service.generate_itinerary(
        location=data.location,
        purpose=data.purpose.value,
        date=date_str,
        preferences=data.preferences,
        language=language,
    )

    itinerary = Itinerary(
        user_id=user_id,
        title=ai_result["title"],
        description=ai_result["description"],
        purpose=data.purpose,
        location=data.location,
        date=data.date,
        status=ItineraryStatus.draft,
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
