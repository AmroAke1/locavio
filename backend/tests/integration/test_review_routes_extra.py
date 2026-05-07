import pytest
import pytest_asyncio
import uuid
from app.models.itinerary import Itinerary, ItineraryStatus, ItineraryPurpose
from app.models.activity import Activity, ActivityCategory


@pytest_asyncio.fixture
async def review_activity(test_db, mock_user):
    itin = Itinerary(
        user_id=mock_user.id,
        title=f"R2-{uuid.uuid4().hex[:6]}",
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
async def test_list_reviews_for_activity_returns_200(test_client, auth_headers, review_activity):
    resp = await test_client.get(f"/api/v1/reviews/activity/{review_activity}")
    assert resp.status_code == 200
    assert "reviews" in resp.json()


@pytest.mark.asyncio
async def test_update_own_review_returns_200(test_client, auth_headers, review_activity):
    create_resp = await test_client.post("/api/v1/reviews/", headers=auth_headers, json={
        "activity_id": review_activity, "rating": 3, "comment": "Okay"
    })
    review_id = create_resp.json()["id"]
    resp = await test_client.put(f"/api/v1/reviews/{review_id}", headers=auth_headers, json={
        "rating": 5, "comment": "Actually great"
    })
    assert resp.status_code == 200
    assert resp.json()["rating"] == 5


@pytest.mark.asyncio
async def test_update_other_users_review_returns_403(test_client, auth_headers, review_activity):
    create_resp = await test_client.post("/api/v1/reviews/", headers=auth_headers, json={
        "activity_id": review_activity, "rating": 4, "comment": "Good"
    })
    review_id = create_resp.json()["id"]

    other_email = f"other-{uuid.uuid4().hex[:8]}@test.com"
    reg = await test_client.post("/api/v1/auth/register", json={
        "email": other_email, "password": "pass1234", "name": "Other"
    })
    other_headers = {"Authorization": f"Bearer {reg.json()['access_token']}"}

    resp = await test_client.put(f"/api/v1/reviews/{review_id}", headers=other_headers, json={
        "rating": 1
    })
    assert resp.status_code == 403


@pytest.mark.asyncio
async def test_delete_nonexistent_review_returns_404(test_client, auth_headers):
    resp = await test_client.delete("/api/v1/reviews/999999", headers=auth_headers)
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_delete_other_users_review_returns_403(test_client, auth_headers, review_activity):
    create_resp = await test_client.post("/api/v1/reviews/", headers=auth_headers, json={
        "activity_id": review_activity, "rating": 4, "comment": "Mine"
    })
    review_id = create_resp.json()["id"]

    other_email = f"other-{uuid.uuid4().hex[:8]}@test.com"
    reg = await test_client.post("/api/v1/auth/register", json={
        "email": other_email, "password": "pass1234", "name": "Other"
    })
    other_headers = {"Authorization": f"Bearer {reg.json()['access_token']}"}

    resp = await test_client.delete(f"/api/v1/reviews/{review_id}", headers=other_headers)
    assert resp.status_code == 403