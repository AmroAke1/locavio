from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.models.user import User
from app.schemas.user import UserUpdate


async def get_user_by_id(db: AsyncSession, user_id: int) -> User | None:
    """Fetch a user by primary key.

    Args:
        db: Active database session.
        user_id: Primary key of the user.

    Returns:
        User ORM instance or None if not found.
    """
    result = await db.execute(select(User).where(User.id == user_id))
    return result.scalar_one_or_none()


async def update_user(db: AsyncSession, user: User, data: UserUpdate) -> User:
    """Apply a partial update to a user record.

    Args:
        db: Active database session.
        user: The User ORM instance to update.
        data: Pydantic schema with optional fields to overwrite.

    Returns:
        The updated User ORM instance.
    """
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(user, field, value)
    await db.commit()
    await db.refresh(user)
    return user


async def delete_user(db: AsyncSession, user: User) -> None:
    """Permanently delete a user record from the database.

    Args:
        db: Active database session.
        user: The User ORM instance to delete.
    """
    await db.delete(user)
    await db.commit()
