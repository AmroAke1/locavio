from datetime import datetime, time

from pydantic import BaseModel, ConfigDict

from app.models.activity import ActivityCategory


class ActivityCreate(BaseModel):
    itinerary_id: int
    title: str
    description: str | None = None
    category: ActivityCategory | None = None
    location_name: str | None = None
    lat: float | None = None
    lng: float | None = None
    start_time: time | None = None
    duration_minutes: int | None = None
    order_index: int = 0


class ActivityUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    category: ActivityCategory | None = None
    location_name: str | None = None
    lat: float | None = None
    lng: float | None = None
    start_time: time | None = None
    duration_minutes: int | None = None
    order_index: int | None = None


class ActivityReorderRequest(BaseModel):
    order_index: int


class ActivityResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    itinerary_id: int
    title: str
    description: str | None
    category: ActivityCategory | None
    location_name: str | None
    lat: float | None
    lng: float | None
    start_time: time | None
    duration_minutes: int | None
    order_index: int
    created_at: datetime
