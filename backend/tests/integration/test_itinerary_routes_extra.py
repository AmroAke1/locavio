import pytest
import uuid
from unittest.mock import patch, AsyncMock


@pytest.mark.asyncio
async def test_get_nonexistent_itinerary_returns_404(test_client, auth_headers):
    resp = await test_client.get("/api/v1/itineraries/999999", headers=auth_headers)
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_get_other_users_itinerary_returns_403(test_client, auth_headers):
    other_email = f"other-{uuid.uuid4().hex[:8]}@test.com"
    reg = await test_client.post("/api/v1/auth/register", json={
        "email": other_email, "password": "pass1234", "name": "Other"
    })
    other_headers = {"Authorization": f"Bearer {reg.json()['access_token']}"}
    create_resp = await test_client.post("/api/v1/itineraries/", headers=other_headers, json={
        "title": "Other's Trip", "location": "X", "status": "draft"
    })
    itin_id = create_resp.json()["id"]

    resp = await test_client.get(f"/api/v1/itineraries/{itin_id}", headers=auth_headers)
    assert resp.status_code == 403


@pytest.mark.asyncio
async def test_update_itinerary_returns_200(test_client, auth_headers):
    create_resp = await test_client.post("/api/v1/itineraries/", headers=auth_headers, json={
        "title": "Old", "location": "Paris", "status": "draft"
    })
    itin_id = create_resp.json()["id"]
    resp = await test_client.put(f"/api/v1/itineraries/{itin_id}", headers=auth_headers, json={
        "title": "New Title"
    })
    assert resp.status_code == 200
    assert resp.json()["title"] == "New Title"


@pytest.mark.asyncio
async def test_update_other_users_itinerary_returns_403(test_client, auth_headers):
    other_email = f"other-{uuid.uuid4().hex[:8]}@test.com"
    reg = await test_client.post("/api/v1/auth/register", json={
        "email": other_email, "password": "pass1234", "name": "Other"
    })
    other_headers = {"Authorization": f"Bearer {reg.json()['access_token']}"}
    create_resp = await test_client.post("/api/v1/itineraries/", headers=other_headers, json={
        "title": "Other", "location": "X", "status": "draft"
    })
    itin_id = create_resp.json()["id"]

    resp = await test_client.put(f"/api/v1/itineraries/{itin_id}", headers=auth_headers, json={
        "title": "Hacked"
    })
    assert resp.status_code == 403


@pytest.mark.asyncio
async def test_delete_other_users_itinerary_returns_403(test_client, auth_headers):
    other_email = f"other-{uuid.uuid4().hex[:8]}@test.com"
    reg = await test_client.post("/api/v1/auth/register", json={
        "email": other_email, "password": "pass1234", "name": "Other"
    })
    other_headers = {"Authorization": f"Bearer {reg.json()['access_token']}"}
    create_resp = await test_client.post("/api/v1/itineraries/", headers=other_headers, json={
        "title": "Other", "location": "X", "status": "draft"
    })
    itin_id = create_resp.json()["id"]

    resp = await test_client.delete(f"/api/v1/itineraries/{itin_id}", headers=auth_headers)
    assert resp.status_code == 403


@pytest.mark.asyncio
async def test_generate_itinerary_returns_201(test_client, auth_headers):
    mock_result = {
        "title": "A Day in London",
        "description": "Great day",
        "activities": [
            {
                "title": "Visit Big Ben",
                "description": "See the famous clock",
                "category": "culture",
                "location_name": "Westminster, London",
                "start_time": "10:00",
                "duration_minutes": 60,
                "order_index": 0,
            }
        ],
    }
    with patch(
        "app.services.ai_service.generate_itinerary",
        new=AsyncMock(return_value=mock_result),
    ):
        resp = await test_client.post(
            "/api/v1/itineraries/generate",
            headers=auth_headers,
            json={"location": "London", "purpose": "tourism"},
        )
    assert resp.status_code == 201
    assert resp.json()["title"] == "A Day in London"