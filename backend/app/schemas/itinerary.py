from datetime import date, datetime

from pydantic import BaseModel, ConfigDict

from app.models.itinerary import ItineraryPurpose, ItineraryStatus
from app.schemas.activity import ActivityResponse


class ItineraryCreate(BaseModel):
    title: str | None = None
    description: str | None = None
    purpose: ItineraryPurpose = ItineraryPurpose.tourism
    location: str | None = None
    lat: float | None = None
    lng: float | None = None
    date: date | None = None
    status: ItineraryStatus = ItineraryStatus.draft


class ItineraryUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    purpose: ItineraryPurpose | None = None
    location: str | None = None
    lat: float | None = None
    lng: float | None = None
    date: date | None = None
    status: ItineraryStatus | None = None


class ItineraryGenerateRequest(BaseModel):
    location: str
    purpose: ItineraryPurpose = ItineraryPurpose.tourism
    date: date | None = None
    preferences: dict = {}


class ItineraryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    title: str | None
    description: str | None
    purpose: ItineraryPurpose
    location: str | None
    lat: float | None
    lng: float | None
    date: date | None
    status: ItineraryStatus
    generated_by_ai: bool
    created_at: datetime
    updated_at: datetime | None
    activities: list[ActivityResponse] = []
