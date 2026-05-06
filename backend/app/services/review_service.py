from sqlalchemy import func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.models.activity import Activity
from app.models.review import Review
from app.schemas.review import ReviewCreate, ReviewUpdate


async def get_review(db: AsyncSession, review_id: int) -> Review | None:
    """Fetch a single review by primary key.

    Args:
        db: Active database session.
        review_id: Primary key of the review.

    Returns:
        Review ORM instance or None.
    """
    result = await db.execute(select(Review).where(Review.id == review_id))
    return result.scalar_one_or_none()


async def get_review_by_user_activity(
    db: AsyncSession, user_id: int, activity_id: int
) -> Review | None:
    """Check whether a user has already reviewed a given activity.

    Args:
        db: Active database session.
        user_id: Reviewer's user ID.
        activity_id: Activity being reviewed.

    Returns:
        Existing Review ORM instance or None.
    """
    result = await db.execute(
        select(Review).where(
            Review.user_id == user_id, Review.activity_id == activity_id
        )
    )
    return result.scalar_one_or_none()


async def create_review(
    db: AsyncSession, user_id: int, data: ReviewCreate, language: str
) -> Review:
    """Create a new review for an activity.

    Args:
        db: Active database session.
        user_id: ID of the reviewing user.
        data: Validated review creation payload.
        language: Request language code.

    Returns:
        Newly created Review ORM instance.
    """
    review = Review(user_id=user_id, **data.model_dump())
    db.add(review)
    await db.commit()
    await db.refresh(review)
    return review


async def list_reviews_for_activity(
    db: AsyncSession,
    activity_id: int,
    page: int,
    limit: int,
    language: str,
) -> tuple[list[Review], float | None]:
    """List reviews for an activity with average rating.

    Args:
        db: Active database session.
        activity_id: Primary key of the activity.
        page: 1-based page number.
        limit: Results per page.
        language: Request language code.

    Returns:
        Tuple of (list of Review ORM instances, average rating or None).
    """
    reviews_result = await db.execute(
        select(Review)
        .where(Review.activity_id == activity_id)
        .options(selectinload(Review.user))
        .order_by(Review.created_at.desc())
        .offset((page - 1) * limit)
        .limit(limit)
    )
    reviews = list(reviews_result.scalars().all())

    avg_result = await db.execute(
        select(func.avg(Review.rating)).where(Review.activity_id == activity_id)
    )
    avg_rating = avg_result.scalar_one_or_none()

    return reviews, float(avg_rating) if avg_rating is not None else None


async def update_review(
    db: AsyncSession, review: Review, data: ReviewUpdate, language: str
) -> Review:
    """Apply a partial update to a review.

    Args:
        db: Active database session.
        review: Review ORM instance to update.
        data: Pydantic schema with optional fields to overwrite.
        language: Request language code.

    Returns:
        Updated Review ORM instance.
    """
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(review, field, value)
    await db.commit()
    await db.refresh(review)
    return review


async def delete_review(db: AsyncSession, review: Review) -> None:
    """Delete a review record.

    Args:
        db: Active database session.
        review: Review ORM instance to delete.
    """
    await db.delete(review)
    await db.commit()
