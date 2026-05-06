from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.models.activity import Activity
from app.models.itinerary import Itinerary
from app.schemas.activity import ActivityCreate, ActivityUpdate


async def get_activity(
    db: AsyncSession, activity_id: int, language: str
) -> Activity | None:
    """Fetch a single activity by primary key.

    Args:
        db: Active database session.
        activity_id: Primary key of the activity.
        language: Request language code.

    Returns:
        Activity ORM instance or None.
    """
    result = await db.execute(select(Activity).where(Activity.id == activity_id))
    return result.scalar_one_or_none()


async def get_itinerary_for_activity(
    db: AsyncSession, itinerary_id: int
) -> Itinerary | None:
    """Fetch the parent itinerary of an activity.

    Args:
        db: Active database session.
        itinerary_id: Primary key of the itinerary.

    Returns:
        Itinerary ORM instance or None.
    """
    result = await db.execute(
        select(Itinerary).where(Itinerary.id == itinerary_id)
    )
    return result.scalar_one_or_none()


async def create_activity(
    db: AsyncSession, data: ActivityCreate, language: str
) -> Activity:
    """Create a new activity inside an itinerary.

    Args:
        db: Active database session.
        data: Validated creation payload including itinerary_id.
        language: Request language code.

    Returns:
        Newly created Activity ORM instance.
    """
    activity = Activity(**data.model_dump())
    db.add(activity)
    await db.commit()
    await db.refresh(activity)
    return activity


async def update_activity(
    db: AsyncSession, activity: Activity, data: ActivityUpdate, language: str
) -> Activity:
    """Apply a partial update to an activity.

    Args:
        db: Active database session.
        activity: Activity ORM instance to update.
        data: Pydantic schema with optional fields to overwrite.
        language: Request language code.

    Returns:
        Updated Activity ORM instance.
    """
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(activity, field, value)
    await db.commit()
    await db.refresh(activity)
    return activity


async def delete_activity(db: AsyncSession, activity: Activity) -> None:
    """Delete an activity record.

    Args:
        db: Active database session.
        activity: Activity ORM instance to delete.
    """
    await db.delete(activity)
    await db.commit()


async def reorder_activity(
    db: AsyncSession, activity: Activity, order_index: int, language: str
) -> Activity:
    """Update only the order_index of an activity.

    Args:
        db: Active database session.
        activity: Activity ORM instance to reorder.
        order_index: New position index.
        language: Request language code.

    Returns:
        Updated Activity ORM instance.
    """
    activity.order_index = order_index
    await db.commit()
    await db.refresh(activity)
    return activity
