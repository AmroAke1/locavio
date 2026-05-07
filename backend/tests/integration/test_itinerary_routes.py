import pytest


@pytest.mark.asyncio
async def test_list_itineraries_without_auth_returns_401(test_client):
    resp = await test_client.get("/api/v1/itineraries/")
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_list_itineraries_with_auth_returns_200(test_client, auth_headers):
    resp = await test_client.get("/api/v1/itineraries/", headers=auth_headers)
    assert resp.status_code == 200
    assert isinstance(resp.json(), list)


@pytest.mark.asyncio
async def test_create_itinerary_returns_201(test_client, auth_headers):
    resp = await test_client.post("/api/v1/itineraries/", headers=auth_headers, json={
        "title": "CI Trip", "location": "Paris", "purpose": "tourism", "status": "draft"
    })
    assert resp.status_code == 201
    assert resp.json()["title"] == "CI Trip"


@pytest.mark.asyncio
async def test_get_own_itinerary_returns_200(test_client, auth_headers):
    create_resp = await test_client.post("/api/v1/itineraries/", headers=auth_headers, json={
        "title": "Own Trip", "location": "Berlin", "purpose": "tourism", "status": "draft"
    })
    assert create_resp.status_code == 201
    itinerary_id = create_resp.json()["id"]
    resp = await test_client.get(f"/api/v1/itineraries/{itinerary_id}", headers=auth_headers)
    assert resp.status_code == 200


@pytest.mark.asyncio
async def test_delete_own_itinerary_returns_204(test_client, auth_headers):
    create_resp = await test_client.post("/api/v1/itineraries/", headers=auth_headers, json={
        "title": "Delete Me", "location": "NYC", "purpose": "tourism", "status": "draft"
    })
    assert create_resp.status_code == 201
    itinerary_id = create_resp.json()["id"]
    resp = await test_client.delete(f"/api/v1/itineraries/{itinerary_id}", headers=auth_headers)
    assert resp.status_code == 204