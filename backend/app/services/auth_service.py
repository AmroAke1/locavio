from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.models.user import AuthProvider, User
from app.schemas.user import UserCreate


async def get_or_create_user(
    db: AsyncSession,
    email: str,
    name: str,
    avatar_url: str,
    auth_provider: AuthProvider,
) -> User:
    """Fetch an existing user by email or create one if they don't exist.

    Args:
        db: Active database session.
        email: User's email address (unique identifier).
        name: Display name from the OAuth provider.
        avatar_url: Profile picture URL from the OAuth provider.
        auth_provider: Which OAuth provider authenticated the user.

    Returns:
        The existing or newly created User ORM instance.
    """
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()

    if user is None:
        user = User(
            email=email,
            name=name,
            avatar_url=avatar_url,
            auth_provider=auth_provider,
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)

    return user
