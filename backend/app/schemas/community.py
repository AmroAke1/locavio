from datetime import datetime

from pydantic import BaseModel, ConfigDict


class CommunityCreate(BaseModel):
    name: str
    description: str | None = None
    location: str | None = None
    lat: float | None = None
    lng: float | None = None
    category: str | None = None
    cover_image: str | None = None


class CommunityUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    location: str | None = None
    lat: float | None = None
    lng: float | None = None
    category: str | None = None
    cover_image: str | None = None


class CommunityResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_by: int | None
    name: str
    description: str | None
    location: str | None
    lat: float | None
    lng: float | None
    category: str | None
    cover_image: str | None
    created_at: datetime
    updated_at: datetime | None
    member_count: int = 0
