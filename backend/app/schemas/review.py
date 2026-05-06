from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.user import UserResponse


class ReviewCreate(BaseModel):
    activity_id: int
    rating: int = Field(..., ge=1, le=5)
    comment: str | None = None


class ReviewUpdate(BaseModel):
    rating: int | None = Field(default=None, ge=1, le=5)
    comment: str | None = None


class ReviewResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    activity_id: int
    rating: int
    comment: str | None
    created_at: datetime
    user: UserResponse | None = None


class ActivityReviewsResponse(BaseModel):
    reviews: list[ReviewResponse]
    avg_rating: float | None
    total: int
