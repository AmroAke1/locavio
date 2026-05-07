from datetime import datetime, timedelta, timezone

import bcrypt
import httpx
from jose import jwt as jose_jwt

from app.core.config import settings


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode(), hashed.encode())


def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode["exp"] = expire
    return jose_jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def decode_access_token(token: str) -> dict:
    return jose_jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])


async def verify_google_token(token: str) -> dict:
    """Verify a Google ID token and return email, name, and picture."""
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"https://oauth2.googleapis.com/tokeninfo?id_token={token}"
        )
        resp.raise_for_status()
        data = resp.json()

    if data.get("aud") != settings.GOOGLE_CLIENT_ID:
        raise ValueError("Google token audience mismatch")

    return {
        "email": data["email"],
        "name": data.get("name", ""),
        "picture": data.get("picture", ""),
    }


