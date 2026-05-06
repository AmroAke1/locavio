import enum
from datetime import date, datetime

from sqlalchemy import Boolean, Date, DateTime, Enum, ForeignKey, DECIMAL, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class ItineraryPurpose(str, enum.Enum):
    tourism = "tourism"
    work = "work"
    local_life = "local_life"
    social = "social"


class ItineraryStatus(str, enum.Enum):
    draft = "draft"
    upcoming = "upcoming"
    active = "active"
    completed = "completed"
    wishlist = "wishlist"


class Itinerary(Base):
    __tablename__ = "itineraries"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    title: Mapped[str | None] = mapped_column(String(255), nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    purpose: Mapped[ItineraryPurpose] = mapped_column(
        Enum(ItineraryPurpose, name="itinerarypurpose"),
        default=ItineraryPurpose.tourism,
        nullable=False,
    )
    location: Mapped[str | None] = mapped_column(String(255), nullable=True)
    lat: Mapped[float | None] = mapped_column(DECIMAL(10, 6), nullable=True)
    lng: Mapped[float | None] = mapped_column(DECIMAL(10, 6), nullable=True)
    date: Mapped[date | None] = mapped_column(Date, nullable=True)
    status: Mapped[ItineraryStatus] = mapped_column(
        Enum(ItineraryStatus, name="itinerarystatus"),
        default=ItineraryStatus.draft,
        nullable=False,
    )
    generated_by_ai: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), onupdate=func.now(), nullable=True
    )

    user: Mapped["User"] = relationship("User", back_populates="itineraries")
    activities: Mapped[list["Activity"]] = relationship(
        "Activity", back_populates="itinerary", cascade="all, delete-orphan"
    )


from app.models.user import User  # noqa: E402
from app.models.activity import Activity  # noqa: E402
