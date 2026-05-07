import pytest
import pytest_asyncio
import uuid
from app.models.itinerary import Itinerary, ItineraryStatus, ItineraryPurpose
from app.models.activity import Activity, ActivityCategory


@pytest_asyncio.fixture
async def itinerary_with_activity(test_db, mock_user):
    itin = Itinerary(
        user_id=mock_user.id,
        title=f"Act-Test-{uuid.uuid4().hex[:6]}",
        location="Paris",
        status=ItineraryStatus.draft,
        purpose=ItineraryPurpose.tourism,
        generated_by_ai=False,
    )
    test_db.add(itin)
    await test_db.flush()
    act = Activity(
        itinerary_id=itin.id,
        title="Morning Coffee",
        category=ActivityCategory.food,
        order_index=0,
    )
    test_db.add(act)
    await test_db.commit()
    await test_db.refresh(act)
    return itin, act


@pytest.mark.asyncio
async def test_create_activity_without_auth_returns_401(test_client, itinerary_with_activity):
    itin, _ = itinerary_with_activity
    resp = await test_client.post("/api/v1/activities/", json={
        "itinerary_id": itin.id, "title": "New Act", "order_index": 1
    })
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_create_activity_with_auth_returns_201(test_client, auth_headers, itinerary_with_activity):
    itin, _ = itinerary_with_activity
    resp = await test_client.post("/api/v1/activities/", headers=auth_headers, json={
        "itinerary_id": itin.id, "title": "New Act", "order_index": 1
    })
    assert resp.status_code == 201
    assert resp.json()["title"] == "New Act"


@pytest.mark.asyncio
async def test_create_activity_for_nonexistent_itinerary_returns_404(test_client, auth_headers):
    resp = await test_client.post("/api/v1/activities/", headers=auth_headers, json={
        "itinerary_id": 999999, "title": "Act", "order_index": 0
    })
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_create_activity_for_other_users_itinerary_returns_403(test_client, test_db):
    other_email = f"other-{uuid.uuid4().hex[:8]}@test.com"
    reg = await test_client.post("/api/v1/auth/register", json={
        "email": other_email, "password": "pass1234", "name": "Other"
    })
    other_token = reg.json()["access_token"]
    other_headers = {"Authorization": f"Bearer {other_token}"}

    itin_resp = await test_client.post("/api/v1/itineraries/", headers=other_headers, json={
        "title": "Other's Trip", "location": "X", "status": "draft"
    })
    itin_id = itin_resp.json()["id"]

    me_email = f"me-{uuid.uuid4().hex[:8]}@test.com"
    me_reg = await test_client.post("/api/v1/auth/register", json={
        "email": me_email, "password": "pass1234", "name": "Me"
    })
    me_headers = {"Authorization": f"Bearer {me_reg.json()['access_token']}"}

    resp = await test_client.post("/api/v1/activities/", headers=me_headers, json={
        "itinerary_id": itin_id, "title": "Steal", "order_index": 0
    })
    assert resp.status_code == 403


@pytest.mark.asyncio
async def test_get_activity_returns_200(test_client, auth_headers, itinerary_with_activity):
    _, act = itinerary_with_activity
    resp = await test_client.get(f"/api/v1/activities/{act.id}", headers=auth_headers)
    assert resp.status_code == 200
    assert resp.json()["id"] == act.id


@pytest.mark.asyncio
async def test_get_nonexistent_activity_returns_404(test_client, auth_headers):
    resp = await test_client.get("/api/v1/activities/999999", headers=auth_headers)
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_update_activity_returns_200(test_client, auth_headers, itinerary_with_activity):
    _, act = itinerary_with_activity
    resp = await test_client.put(f"/api/v1/activities/{act.id}", headers=auth_headers, json={
        "title": "Updated Title"
    })
    assert resp.status_code == 200
    assert resp.json()["title"] == "Updated Title"


@pytest.mark.asyncio
async def test_update_nonexistent_activity_returns_404(test_client, auth_headers):
    resp = await test_client.put("/api/v1/activities/999999", headers=auth_headers, json={
        "title": "X"
    })
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_delete_activity_returns_204(test_client, auth_headers, itinerary_with_activity):
    itin, _ = itinerary_with_activity
    create_resp = await test_client.post("/api/v1/activities/", headers=auth_headers, json={
        "itinerary_id": itin.id, "title": "Delete Me", "order_index": 2
    })
    act_id = create_resp.json()["id"]
    resp = await test_client.delete(f"/api/v1/activities/{act_id}", headers=auth_headers)
    assert resp.status_code == 204


@pytest.mark.asyncio
async def test_delete_nonexistent_activity_returns_404(test_client, auth_headers):
    resp = await test_client.delete("/api/v1/activities/999999", headers=auth_headers)
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_reorder_activity_returns_200(test_client, auth_headers, itinerary_with_activity):
    _, act = itinerary_with_activity
    resp = await test_client.patch(
        f"/api/v1/activities/{act.id}/reorder",
        headers=auth_headers,
        json={"order_index": 5},
    )
    assert resp.status_code == 200
    assert resp.json()["order_index"] == 5