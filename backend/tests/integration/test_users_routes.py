import pytest
import uuid


@pytest.mark.asyncio
async def test_get_user_by_id_returns_200(test_client, mock_user):
    resp = await test_client.get(f"/api/v1/users/{mock_user.id}")
    assert resp.status_code == 200
    assert resp.json()["id"] == mock_user.id


@pytest.mark.asyncio
async def test_get_nonexistent_user_returns_404(test_client):
    resp = await test_client.get("/api/v1/users/999999")
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_update_own_user_returns_200(test_client, auth_headers, mock_user):
    resp = await test_client.put(
        f"/api/v1/users/{mock_user.id}",
        headers=auth_headers,
        json={"name": "Updated Name"},
    )
    assert resp.status_code == 200
    assert resp.json()["name"] == "Updated Name"


@pytest.mark.asyncio
async def test_update_other_user_returns_403(test_client, mock_user):
    other_email = f"other-{uuid.uuid4().hex[:8]}@test.com"
    reg = await test_client.post("/api/v1/auth/register", json={
        "email": other_email, "password": "pass1234", "name": "Other"
    })
    other_token = reg.json()["access_token"]
    other_headers = {"Authorization": f"Bearer {other_token}"}

    resp = await test_client.put(
        f"/api/v1/users/{mock_user.id}",
        headers=other_headers,
        json={"name": "Hacked"},
    )
    assert resp.status_code == 403


@pytest.mark.asyncio
async def test_update_without_auth_returns_401(test_client, mock_user):
    resp = await test_client.put(f"/api/v1/users/{mock_user.id}", json={"name": "X"})
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_delete_own_user_returns_204(test_client):
    email = f"del-{uuid.uuid4().hex[:8]}@test.com"
    reg = await test_client.post("/api/v1/auth/register", json={
        "email": email, "password": "pass1234", "name": "Del"
    })
    token = reg.json()["access_token"]
    user_id = reg.json()["user"]["id"]
    headers = {"Authorization": f"Bearer {token}"}
    resp = await test_client.delete(f"/api/v1/users/{user_id}", headers=headers)
    assert resp.status_code == 204


@pytest.mark.asyncio
async def test_delete_other_user_returns_403(test_client, mock_user):
    other_email = f"other-{uuid.uuid4().hex[:8]}@test.com"
    reg = await test_client.post("/api/v1/auth/register", json={
        "email": other_email, "password": "pass1234", "name": "Other"
    })
    other_token = reg.json()["access_token"]
    other_headers = {"Authorization": f"Bearer {other_token}"}

    resp = await test_client.delete(f"/api/v1/users/{mock_user.id}", headers=other_headers)
    assert resp.status_code == 403