from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_active_user, get_language
from app.models.user import User
from app.schemas.activity import (
    ActivityCreate,
    ActivityReorderRequest,
    ActivityResponse,
    ActivityUpdate,
)
from app.services import activity_service

router = APIRouter(prefix="/api/v1/activities", tags=["Activities"])


@router.post("/", response_model=ActivityResponse, status_code=status.HTTP_201_CREATED)
async def create_activity(
    data: ActivityCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
    language: str = Depends(get_language),
):
    itinerary = await activity_service.get_itinerary_for_activity(db, data.itinerary_id)
    if itinerary is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Itinerary not found")
    if itinerary.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    return await activity_service.create_activity(db, data, language)


@router.get("/{activity_id}", response_model=ActivityResponse)
async def get_activity(
    activity_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
    language: str = Depends(get_language),
):
    activity = await activity_service.get_activity(db, activity_id, language)
    if activity is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Activity not found")
    return activity


@router.put("/{activity_id}", response_model=ActivityResponse)
async def update_activity(
    activity_id: int,
    data: ActivityUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
    language: str = Depends(get_language),
):
    activity = await activity_service.get_activity(db, activity_id, language)
    if activity is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Activity not found")

    itinerary = await activity_service.get_itinerary_for_activity(db, activity.itinerary_id)
    if itinerary is None or itinerary.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    return await activity_service.update_activity(db, activity, data, language)


@router.delete("/{activity_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_activity(
    activity_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
    language: str = Depends(get_language),
):
    activity = await activity_service.get_activity(db, activity_id, language)
    if activity is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Activity not found")

    itinerary = await activity_service.get_itinerary_for_activity(db, activity.itinerary_id)
    if itinerary is None or itinerary.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    await activity_service.delete_activity(db, activity)


@router.patch("/{activity_id}/reorder", response_model=ActivityResponse)
async def reorder_activity(
    activity_id: int,
    data: ActivityReorderRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
    language: str = Depends(get_language),
):
    activity = await activity_service.get_activity(db, activity_id, language)
    if activity is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Activity not found")

    itinerary = await activity_service.get_itinerary_for_activity(db, activity.itinerary_id)
    if itinerary is None or itinerary.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    return await activity_service.reorder_activity(db, activity, data.order_index, language)
