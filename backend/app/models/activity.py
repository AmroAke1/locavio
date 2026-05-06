import enum
from datetime import datetime, time

from sqlalchemy import DateTime, Enum, ForeignKey, Integer, DECIMAL, String, Text, Time, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class ActivityCategory(str, enum.Enum):
    food = "food"
    culture = "culture"
    sport = "sport"
    social = "social"
    nature = "nature"
    shopping = "shopping"


class Activity(Base):
    __tablename__ = "activities"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    itinerary_id: Mapped[int] = mapped_column(
        ForeignKey("itineraries.id", ondelete="CASCADE"), nullable=False
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    category: Mapped[ActivityCategory | None] = mapped_column(
        Enum(ActivityCategory, name="activitycategory"), nullable=True
    )
    location_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    lat: Mapped[float | None] = mapped_column(DECIMAL(10, 6), nullable=True)
    lng: Mapped[float | None] = mapped_column(DECIMAL(10, 6), nullable=True)
    start_time: Mapped[time | None] = mapped_column(Time, nullable=True)
    duration_minutes: Mapped[int | None] = mapped_column(Integer, nullable=True)
    order_index: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    itinerary: Mapped["Itinerary"] = relationship("Itinerary", back_populates="activities")
    reviews: Mapped[list["Review"]] = relationship(
        "Review", back_populates="activity", cascade="all, delete-orphan"
    )


from app.models.itinerary import Itinerary  # noqa: E402
from app.models.review import Review  # noqa: E402
