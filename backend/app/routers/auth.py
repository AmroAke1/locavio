from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_active_user
from app.core.security import create_access_token, verify_apple_token, verify_google_token
from app.models.user import AuthProvider, User
from app.schemas.user import UserResponse
from app.services import auth_service

router = APIRouter(prefix="/api/v1/auth", tags=["Authentication"])


class TokenRequest(BaseModel):
    token: str


class EmailRegisterRequest(BaseModel):
    email: EmailStr
    password: str
    name: str | None = None


class EmailLoginRequest(BaseModel):
    email: EmailStr
    password: str


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


@router.post("/google", response_model=AuthResponse, status_code=status.HTTP_200_OK)
async def google_auth(body: TokenRequest, db: AsyncSession = Depends(get_db)):
    try:
        google_data = await verify_google_token(body.token)
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(exc))

    user = await auth_service.get_or_create_user(
        db=db,
        email=google_data["email"],
        name=google_data.get("name", ""),
        avatar_url=google_data.get("picture", ""),
        auth_provider=AuthProvider.google,
    )

    token = create_access_token({"sub": str(user.id)})
    return AuthResponse(access_token=token, user=UserResponse.model_validate(user))


@router.post("/apple", response_model=AuthResponse, status_code=status.HTTP_200_OK)
async def apple_auth(body: TokenRequest, db: AsyncSession = Depends(get_db)):
    try:
        apple_data = await verify_apple_token(body.token)
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(exc))

    user = await auth_service.get_or_create_user(
        db=db,
        email=apple_data["email"],
        name=apple_data.get("name", ""),
        avatar_url="",
        auth_provider=AuthProvider.apple,
    )

    token = create_access_token({"sub": str(user.id)})
    return AuthResponse(access_token=token, user=UserResponse.model_validate(user))


@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def email_register(body: EmailRegisterRequest, db: AsyncSession = Depends(get_db)):
    user = await auth_service.register_email_user(db, body.email, body.password, body.name or "")
    token = create_access_token({"sub": str(user.id)})
    return AuthResponse(access_token=token, user=UserResponse.model_validate(user))


@router.post("/login", response_model=AuthResponse)
async def email_login(body: EmailLoginRequest, db: AsyncSession = Depends(get_db)):
    user = await auth_service.authenticate_email_user(db, body.email, body.password)
    token = create_access_token({"sub": str(user.id)})
    return AuthResponse(access_token=token, user=UserResponse.model_validate(user))


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_active_user)):
    return current_user
