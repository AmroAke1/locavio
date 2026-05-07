import pytest
import uuid


@pytest.mark.asyncio
async def test_register_returns_201(test_client):
    email = f"integration-{uuid.uuid4().hex[:8]}@test.com"
    resp = await test_client.post("/api/v1/auth/register", json={
        "email": email, "password": "pass1234", "name": "Int User"
    })
    assert resp.status_code == 201
    assert "access_token" in resp.json()


@pytest.mark.asyncio
async def test_login_returns_200(test_client):
    email = f"logintest-{uuid.uuid4().hex[:8]}@test.com"
    await test_client.post("/api/v1/auth/register", json={
        "email": email, "password": "pass1234", "name": "Login"
    })
    resp = await test_client.post("/api/v1/auth/login", json={
        "email": email, "password": "pass1234"
    })
    assert resp.status_code == 200
    assert "access_token" in resp.json()


@pytest.mark.asyncio
async def test_login_wrong_password_returns_401(test_client):
    email = f"wrong-{uuid.uuid4().hex[:8]}@test.com"
    await test_client.post("/api/v1/auth/register", json={
        "email": email, "password": "correct", "name": "W"
    })
    resp = await test_client.post("/api/v1/auth/login", json={
        "email": email, "password": "incorrect"
    })
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_get_me_with_valid_token(test_client, auth_headers):
    resp = await test_client.get("/api/v1/auth/me", headers=auth_headers)
    assert resp.status_code == 200
    assert resp.json()["email"] is not None


@pytest.mark.asyncio
async def test_get_me_without_token_returns_401(test_client):
    resp = await test_client.get("/api/v1/auth/me")
    assert resp.status_code == 401