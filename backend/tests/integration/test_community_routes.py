import pytest
import uuid


@pytest.mark.asyncio
async def test_list_communities_returns_200(test_client):
    resp = await test_client.get("/api/v1/communities/")
    assert resp.status_code == 200


@pytest.mark.asyncio
async def test_create_community_without_auth_returns_401(test_client):
    resp = await test_client.post("/api/v1/communities/", json={"name": "Test", "location": "X"})
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_create_community_with_auth_returns_201(test_client, auth_headers):
    resp = await test_client.post("/api/v1/communities/", headers=auth_headers, json={
        "name": f"My Community {uuid.uuid4().hex[:6]}", "location": "Istanbul"
    })
    assert resp.status_code == 201


@pytest.mark.asyncio
async def test_join_community_returns_201(test_client, auth_headers):
    create_resp = await test_client.post("/api/v1/communities/", headers=auth_headers, json={
        "name": f"Join Test {uuid.uuid4().hex[:6]}", "location": "Paris"
    })
    assert create_resp.status_code == 201
    community_id = create_resp.json()["id"]
    # Register a second user to join
    joiner_email = f"joiner-{uuid.uuid4().hex[:8]}@test.com"
    reg = await test_client.post("/api/v1/auth/register", json={
        "email": joiner_email, "password": "pass1234", "name": "Joiner"
    })
    assert reg.status_code == 201
    joiner_token = reg.json()["access_token"]
    joiner_headers = {"Authorization": f"Bearer {joiner_token}"}
    resp = await test_client.post(f"/api/v1/communities/{community_id}/join", headers=joiner_headers)
    assert resp.status_code == 201


@pytest.mark.asyncio
async def test_join_same_community_twice_returns_409(test_client, auth_headers):
    create_resp = await test_client.post("/api/v1/communities/", headers=auth_headers, json={
        "name": f"Double Join {uuid.uuid4().hex[:6]}", "location": "Tokyo"
    })
    assert create_resp.status_code == 201
    community_id = create_resp.json()["id"]
    double_email = f"double-{uuid.uuid4().hex[:8]}@test.com"
    reg = await test_client.post("/api/v1/auth/register", json={
        "email": double_email, "password": "pass1234", "name": "Double"
    })
    assert reg.status_code == 201
    tok = reg.json()["access_token"]
    h = {"Authorization": f"Bearer {tok}"}
    first_resp = await test_client.post(f"/api/v1/communities/{community_id}/join", headers=h)
    assert first_resp.status_code == 201
    resp = await test_client.post(f"/api/v1/communities/{community_id}/join", headers=h)
    assert resp.status_code == 409