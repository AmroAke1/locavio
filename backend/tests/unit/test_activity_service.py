import pytest
import uuid
from app.services.activity_service import (
    get_activity,
    get_itinerary_for_activity,
    create_activity,
    update_activity,
    delete_activity,
    reorder_activity,
)
from app.schemas.activity import ActivityCreate, ActivityUpdate
from app.models.itinerary import Itinerary, ItineraryStatus, ItineraryPurpose
from app.models.activity import Activity, ActivityCategory


@pytest.mark.asyncio
async def test_get_activity_returns_none_for_missing(test_db):
    result = await get_activity(test_db, 999999, "en")
    assert result is None


@pytest.mark.asyncio
async def test_get_itinerary_for_activity_returns_none_for_missing(test_db):
    result = await get_itinerary_for_activity(test_db, 999999)
    assert result is None


@pytest.mark.asyncio
async def test_create_activity_saves_to_db(test_db, mock_user):
    itin = Itinerary(
        user_id=mock_user.id,
        title=f"T-{uuid.uuid4().hex[:6]}",
        location="Paris",
        status=ItineraryStatus.draft,
        purpose=ItineraryPurpose.tourism,
        generated_by_ai=False,
    )
    test_db.add(itin)
    await test_db.flush()

    data = ActivityCreate(itinerary_id=itin.id, title="Visit Eiffel", order_index=0)
    result = await create_activity(test_db, data, "en")
    assert result.id is not None
    assert result.title == "Visit Eiffel"
    assert result.itinerary_id == itin.id


@pytest.mark.asyncio
async def test_update_activity_changes_fields(test_db, mock_user):
    itin = Itinerary(
        user_id=mock_user.id,
        title=f"U-{uuid.uuid4().hex[:6]}",
        location="Berlin",
        status=ItineraryStatus.draft,
        purpose=ItineraryPurpose.tourism,
        generated_by_ai=False,
    )
    test_db.add(itin)
    await test_db.flush()

    data = ActivityCreate(itinerary_id=itin.id, title="Old Title", order_index=0)
    activity = await create_activity(test_db, data, "en")

    updated = await update_activity(test_db, activity, ActivityUpdate(title="New Title"), "en")
    assert updated.title == "New Title"


@pytest.mark.asyncio
async def test_delete_activity_removes_from_db(test_db, mock_user):
    itin = Itinerary(
        user_id=mock_user.id,
        title=f"D-{uuid.uuid4().hex[:6]}",
        location="Rome",
        status=ItineraryStatus.draft,
        purpose=ItineraryPurpose.tourism,
        generated_by_ai=False,
    )
    test_db.add(itin)
    await test_db.flush()

    data = ActivityCreate(itinerary_id=itin.id, title="Delete Me", order_index=0)
    activity = await create_activity(test_db, data, "en")
    act_id = activity.id

    await delete_activity(test_db, activity)
    assert await get_activity(test_db, act_id, "en") is None


@pytest.mark.asyncio
async def test_reorder_activity_changes_order_index(test_db, mock_user):
    itin = Itinerary(
        user_id=mock_user.id,
        title=f"R-{uuid.uuid4().hex[:6]}",
        location="Tokyo",
        status=ItineraryStatus.draft,
        purpose=ItineraryPurpose.tourism,
        generated_by_ai=False,
    )
    test_db.add(itin)
    await test_db.flush()

    data = ActivityCreate(itinerary_id=itin.id, title="Reorder Me", order_index=0)
    activity = await create_activity(test_db, data, "en")

    result = await reorder_activity(test_db, activity, 5, "en")
    assert result.order_index == 5


@pytest.mark.asyncio
async def test_get_itinerary_for_activity_returns_itinerary(test_db, mock_user):
    itin = Itinerary(
        user_id=mock_user.id,
        title=f"Find-{uuid.uuid4().hex[:6]}",
        location="London",
        status=ItineraryStatus.draft,
        purpose=ItineraryPurpose.tourism,
        generated_by_ai=False,
    )
    test_db.add(itin)
    await test_db.commit()
    await test_db.refresh(itin)

    result = await get_itinerary_for_activity(test_db, itin.id)
    assert result is not None
    assert result.id == itin.id