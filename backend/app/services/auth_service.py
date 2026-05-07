from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.core.security import hash_password, verify_password
from app.models.user import AuthProvider, User
from app.schemas.user import UserCreate


async def register_email_user(db: AsyncSession, email: str, password: str, name: str) -> User:
    result = await db.execute(select(User).where(User.email == email))
    if result.scalar_one_or_none() is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")

    user = User(
        email=email,
        name=name or email.split("@")[0],
        avatar_url=None,
        auth_provider=AuthProvider.email,
        password_hash=hash_password(password),
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


async def authenticate_email_user(db: AsyncSession, email: str, password: str) -> User:
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()
    if user is None or user.password_hash is None or not verify_password(password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")
    return user


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
