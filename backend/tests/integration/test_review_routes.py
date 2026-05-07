import pytest
import pytest_asyncio
import uuid
from app.models.itinerary import Itinerary, ItineraryStatus, ItineraryPurpose
from app.models.activity import Activity, ActivityCategory


@pytest_asyncio.fixture
async def activity_id(test_db, mock_user):
    itin = Itinerary(
        user_id=mock_user.id,
        title=f"R {uuid.uuid4().hex[:6]}",
        location="X",
        status=ItineraryStatus.draft,
        purpose=ItineraryPurpose.tourism,
        generated_by_ai=False,
    )
    test_db.add(itin)
    await test_db.flush()
    act = Activity(
        itinerary_id=itin.id,
        title="Act",
        category=ActivityCategory.culture,
        order_index=0,
    )
    test_db.add(act)
    await test_db.commit()
    await test_db.refresh(act)
    return act.id


@pytest.mark.asyncio
async def test_create_review_without_auth_returns_401(test_client, activity_id):
    resp = await test_client.post("/api/v1/reviews/", json={
        "activity_id": activity_id, "rating": 4, "comment": "Good"
    })
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_create_review_with_auth_returns_201(test_client, auth_headers, activity_id):
    resp = await test_client.post("/api/v1/reviews/", headers=auth_headers, json={
        "activity_id": activity_id, "rating": 4, "comment": "Great activity"
    })
    assert resp.status_code == 201


@pytest.mark.asyncio
async def test_create_review_twice_returns_409(test_client, auth_headers, activity_id):
    first_resp = await test_client.post("/api/v1/reviews/", headers=auth_headers, json={
        "activity_id": activity_id, "rating": 5, "comment": "First"
    })
    assert first_resp.status_code == 201
    resp = await test_client.post("/api/v1/reviews/", headers=auth_headers, json={
        "activity_id": activity_id, "rating": 3, "comment": "Second"
    })
    assert resp.status_code == 409


@pytest.mark.asyncio
async def test_delete_review_as_author_returns_204(test_client, auth_headers, test_db, mock_user):
    itin = Itinerary(
        user_id=mock_user.id,
        title=f"Del {uuid.uuid4().hex[:6]}",
        location="X",
        status=ItineraryStatus.draft,
        purpose=ItineraryPurpose.tourism,
        generated_by_ai=False,
    )
    test_db.add(itin)
    await test_db.flush()
    act = Activity(
        itinerary_id=itin.id,
        title="A",
        category=ActivityCategory.food,
        order_index=0,
    )
    test_db.add(act)
    await test_db.commit()
    await test_db.refresh(act)
    create_resp = await test_client.post("/api/v1/reviews/", headers=auth_headers, json={
        "activity_id": act.id, "rating": 4, "comment": "Delete me"
    })
    assert create_resp.status_code == 201
    review_id = create_resp.json()["id"]
    resp = await test_client.delete(f"/api/v1/reviews/{review_id}", headers=auth_headers)
    assert resp.status_code == 204