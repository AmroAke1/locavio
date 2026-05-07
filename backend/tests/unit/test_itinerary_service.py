import pytest
from datetime import date, timedelta
from app.services.itinerary_service import (
    create_itinerary,
    get_itinerary,
    update_itinerary,
    delete_itinerary,
    list_itineraries,
)
from app.schemas.itinerary import ItineraryCreate, ItineraryUpdate
from app.models.itinerary import ItineraryStatus


@pytest.mark.asyncio
async def test_create_itinerary_saves_to_db(test_db, mock_user):
    data = ItineraryCreate(title="Test Trip", location="Paris", date=date.today() + timedelta(days=10))
    result = await create_itinerary(test_db, mock_user.id, data, "en")
    assert result.id is not None
    assert result.title == "Test Trip"


@pytest.mark.asyncio
async def test_create_itinerary_with_future_date_sets_upcoming(test_db, mock_user):
    data = ItineraryCreate(title="Future", location="Rome", date=date.today() + timedelta(days=30))
    result = await create_itinerary(test_db, mock_user.id, data, "en")
    assert result.status == ItineraryStatus.upcoming


@pytest.mark.asyncio
async def test_get_itinerary_returns_correct(test_db, mock_user):
    data = ItineraryCreate(title="Find Me", location="London")
    created = await create_itinerary(test_db, mock_user.id, data, "en")
    found = await get_itinerary(test_db, created.id, "en")
    assert found is not None
    assert found.title == "Find Me"


@pytest.mark.asyncio
async def test_get_itinerary_returns_none_for_missing(test_db):
    result = await get_itinerary(test_db, 999999, "en")
    assert result is None


@pytest.mark.asyncio
async def test_update_itinerary_changes_fields(test_db, mock_user):
    data = ItineraryCreate(title="Old Title", location="Berlin")
    created = await create_itinerary(test_db, mock_user.id, data, "en")
    updated = await update_itinerary(test_db, created, ItineraryUpdate(title="New Title"), "en")
    assert updated.title == "New Title"


@pytest.mark.asyncio
async def test_delete_itinerary_removes_from_db(test_db, mock_user):
    data = ItineraryCreate(title="Delete Me", location="Tokyo")
    created = await create_itinerary(test_db, mock_user.id, data, "en")
    created_id = created.id
    await delete_itinerary(test_db, created)
    assert await get_itinerary(test_db, created_id, "en") is None


@pytest.mark.asyncio
async def test_list_itineraries_returns_user_trips(test_db, mock_user):
    data = ItineraryCreate(title="My Trip", location="NYC")
    await create_itinerary(test_db, mock_user.id, data, "en")
    results = await list_itineraries(test_db, mock_user.id, None, None, 1, 20, "en")
    assert len(results) >= 1