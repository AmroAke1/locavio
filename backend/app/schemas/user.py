from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr

from app.models.user import AuthProvider


class UserCreate(BaseModel):
    email: EmailStr
    name: str | None = None
    avatar_url: str | None = None
    auth_provider: AuthProvider
    location: str | None = None
    preferences: dict | None = None


class UserUpdate(BaseModel):
    name: str | None = None
    avatar_url: str | None = None
    location: str | None = None
    preferences: dict | None = None


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: str
    name: str | None
    avatar_url: str | None
    auth_provider: AuthProvider
    location: str | None
    preferences: dict | None
    created_at: datetime
    updated_at: datetime | None
