import httpx
from fastapi import HTTPException, status

from app.core.config import settings


def _redirect_uri() -> str:
    return f"{settings.FRONTEND_URL}/auth/linkedin/callback"


async def exchange_code_for_token(code: str) -> str:
    """Exchange a LinkedIn authorization code for an access token."""
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            "https://www.linkedin.com/oauth/v2/accessToken",
            headers={"Content-Type": "application/x-www-form-urlencoded"},
            data={
                "grant_type": "authorization_code",
                "code": code,
                "redirect_uri": _redirect_uri(),
                "client_id": settings.LINKEDIN_CLIENT_ID,
                "client_secret": settings.LINKEDIN_CLIENT_SECRET,
            },
        )

    if resp.status_code != 200:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="LinkedIn authentication failed",
        )

    return resp.json()["access_token"]


async def get_linkedin_user(access_token: str) -> dict:
    """Fetch user profile from LinkedIn's OpenID Connect userinfo endpoint."""
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            "https://api.linkedin.com/v2/userinfo",
            headers={"Authorization": f"Bearer {access_token}"},
        )

    if resp.status_code != 200:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Failed to fetch LinkedIn user info",
        )

    data = resp.json()
    email = data.get("email")

    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "LinkedIn did not return an email address. "
                "Please ensure your LinkedIn account has a verified email."
            ),
        )

    return {
        "email": email,
        "name": data.get("name", ""),
        "avatar_url": data.get("picture", ""),
    }
