import pytest
import uuid


@pytest.mark.asyncio
async def test_get_community_by_id_returns_200(test_client, auth_headers):
    create_resp = await test_client.post("/api/v1/communities/", headers=auth_headers, json={
        "name": f"GetMe-{uuid.uuid4().hex[:6]}", "location": "Tokyo"
    })
    community_id = create_resp.json()["id"]
    resp = await test_client.get(f"/api/v1/communities/{community_id}")
    assert resp.status_code == 200
    assert resp.json()["id"] == community_id


@pytest.mark.asyncio
async def test_get_nonexistent_community_returns_404(test_client):
    resp = await test_client.get("/api/v1/communities/999999")
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_update_community_by_creator_returns_200(test_client, auth_headers):
    create_resp = await test_client.post("/api/v1/communities/", headers=auth_headers, json={
        "name": f"Update-{uuid.uuid4().hex[:6]}", "location": "Berlin"
    })
    community_id = create_resp.json()["id"]
    resp = await test_client.put(f"/api/v1/communities/{community_id}", headers=auth_headers, json={
        "name": "Updated Name"
    })
    assert resp.status_code == 200
    assert resp.json()["name"] == "Updated Name"


@pytest.mark.asyncio
async def test_update_community_by_non_creator_returns_403(test_client, auth_headers):
    create_resp = await test_client.post("/api/v1/communities/", headers=auth_headers, json={
        "name": f"Protected-{uuid.uuid4().hex[:6]}", "location": "Madrid"
    })
    community_id = create_resp.json()["id"]

    other_email = f"other-{uuid.uuid4().hex[:8]}@test.com"
    reg = await test_client.post("/api/v1/auth/register", json={
        "email": other_email, "password": "pass1234", "name": "Other"
    })
    other_headers = {"Authorization": f"Bearer {reg.json()['access_token']}"}

    resp = await test_client.put(f"/api/v1/communities/{community_id}", headers=other_headers, json={
        "name": "Hacked"
    })
    assert resp.status_code == 403


@pytest.mark.asyncio
async def test_delete_community_by_creator_returns_204(test_client, auth_headers):
    create_resp = await test_client.post("/api/v1/communities/", headers=auth_headers, json={
        "name": f"Del-{uuid.uuid4().hex[:6]}", "location": "Rome"
    })
    community_id = create_resp.json()["id"]
    resp = await test_client.delete(f"/api/v1/communities/{community_id}", headers=auth_headers)
    assert resp.status_code == 204


@pytest.mark.asyncio
async def test_delete_community_by_non_creator_returns_403(test_client, auth_headers):
    create_resp = await test_client.post("/api/v1/communities/", headers=auth_headers, json={
        "name": f"NoDel-{uuid.uuid4().hex[:6]}", "location": "Seoul"
    })
    community_id = create_resp.json()["id"]

    other_email = f"other-{uuid.uuid4().hex[:8]}@test.com"
    reg = await test_client.post("/api/v1/auth/register", json={
        "email": other_email, "password": "pass1234", "name": "Other"
    })
    other_headers = {"Authorization": f"Bearer {reg.json()['access_token']}"}

    resp = await test_client.delete(f"/api/v1/communities/{community_id}", headers=other_headers)
    assert resp.status_code == 403


@pytest.mark.asyncio
async def test_leave_community_returns_204(test_client, auth_headers):
    creator_email = f"creator-{uuid.uuid4().hex[:8]}@test.com"
    creator_reg = await test_client.post("/api/v1/auth/register", json={
        "email": creator_email, "password": "pass1234", "name": "Creator"
    })
    creator_headers = {"Authorization": f"Bearer {creator_reg.json()['access_token']}"}
    create_resp = await test_client.post("/api/v1/communities/", headers=creator_headers, json={
        "name": f"Leave-{uuid.uuid4().hex[:6]}", "location": "NYC"
    })
    community_id = create_resp.json()["id"]

    join_resp = await test_client.post(f"/api/v1/communities/{community_id}/join", headers=auth_headers)
    assert join_resp.status_code == 201

    resp = await test_client.delete(f"/api/v1/communities/{community_id}/leave", headers=auth_headers)
    assert resp.status_code == 204


@pytest.mark.asyncio
async def test_leave_nonexistent_membership_returns_404(test_client, auth_headers):
    create_resp = await test_client.post("/api/v1/communities/", headers=auth_headers, json={
        "name": f"NoLeave-{uuid.uuid4().hex[:6]}", "location": "Oslo"
    })
    community_id = create_resp.json()["id"]

    other_email = f"other-{uuid.uuid4().hex[:8]}@test.com"
    reg = await test_client.post("/api/v1/auth/register", json={
        "email": other_email, "password": "pass1234", "name": "Other"
    })
    other_headers = {"Authorization": f"Bearer {reg.json()['access_token']}"}

    resp = await test_client.delete(f"/api/v1/communities/{community_id}/leave", headers=other_headers)
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_list_members_returns_200(test_client, auth_headers):
    create_resp = await test_client.post("/api/v1/communities/", headers=auth_headers, json={
        "name": f"Members-{uuid.uuid4().hex[:6]}", "location": "Cairo"
    })
    community_id = create_resp.json()["id"]
    resp = await test_client.get(f"/api/v1/communities/{community_id}/members")
    assert resp.status_code == 200
    assert isinstance(resp.json(), list)


@pytest.mark.asyncio
async def test_list_members_nonexistent_community_returns_404(test_client):
    resp = await test_client.get("/api/v1/communities/999999/members")
    assert resp.status_code == 404