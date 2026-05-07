import pytest
import pytest_asyncio
import uuid
from app.services.review_service import (
    create_review,
    get_review,
    delete_review,
    get_review_by_user_activity,
    list_reviews_for_activity,
)
from app.schemas.review import ReviewCreate
from app.models.itinerary import Itinerary, ItineraryStatus, ItineraryPurpose
from app.models.activity import Activity, ActivityCategory


@pytest_asyncio.fixture
async def test_activity(test_db, mock_user):
    itinerary = Itinerary(
        user_id=mock_user.id,
        title=f"Rev Test {uuid.uuid4().hex[:6]}",
        location="X",
        status=ItineraryStatus.draft,
        purpose=ItineraryPurpose.tourism,
        generated_by_ai=False,
    )
    test_db.add(itinerary)
    await test_db.flush()
    activity = Activity(
        itinerary_id=itinerary.id,
        title="Test Act",
        category=ActivityCategory.culture,
        order_index=0,
    )
    test_db.add(activity)
    await test_db.commit()
    await test_db.refresh(activity)
    return activity


@pytest.mark.asyncio
async def test_create_review_saves_to_db(test_db, mock_user, test_activity):
    data = ReviewCreate(activity_id=test_activity.id, rating=4, comment="Great!")
    review = await create_review(test_db, mock_user.id, data, "en")
    assert review.id is not None
    assert review.rating == 4


@pytest.mark.asyncio
async def test_get_review_returns_correct(test_db, mock_user, test_activity):
    data = ReviewCreate(activity_id=test_activity.id, rating=3, comment="OK")
    created = await create_review(test_db, mock_user.id, data, "en")
    found = await get_review(test_db, created.id)
    assert found is not None
    assert found.rating == 3


@pytest.mark.asyncio
async def test_get_review_returns_none_for_missing(test_db):
    assert await get_review(test_db, 999999) is None


@pytest.mark.asyncio
async def test_delete_review_removes_it(test_db, mock_user, test_activity):
    data = ReviewCreate(activity_id=test_activity.id, rating=5, comment="Excellent")
    review = await create_review(test_db, mock_user.id, data, "en")
    review_id = review.id
    await delete_review(test_db, review)
    assert await get_review(test_db, review_id) is None


@pytest.mark.asyncio
async def test_list_reviews_returns_avg_rating(test_db, mock_user, test_activity):
    data = ReviewCreate(activity_id=test_activity.id, rating=4, comment="Good")
    await create_review(test_db, mock_user.id, data, "en")
    reviews, avg = await list_reviews_for_activity(test_db, test_activity.id, 1, 20, "en")
    assert avg is not None
    assert 1 <= avg <= 5