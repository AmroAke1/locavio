import pytest
from fastapi import HTTPException
from app.services.auth_service import register_email_user, authenticate_email_user


@pytest.mark.asyncio
async def test_register_email_user_creates_user(test_db):
    import uuid
    email = f"newuser-{uuid.uuid4().hex[:8]}@example.com"
    user = await register_email_user(test_db, email, "password123", "New User")
    assert user.id is not None
    assert user.email == email
    assert user.name == "New User"


@pytest.mark.asyncio
async def test_register_duplicate_email_raises_409(test_db):
    import uuid
    email = f"dup-{uuid.uuid4().hex[:8]}@example.com"
    await register_email_user(test_db, email, "pass", "Dup")
    with pytest.raises(HTTPException) as exc_info:
        await register_email_user(test_db, email, "pass2", "Dup2")
    assert exc_info.value.status_code == 409


@pytest.mark.asyncio
async def test_authenticate_email_user_valid(test_db):
    import uuid
    email = f"auth-{uuid.uuid4().hex[:8]}@example.com"
    await register_email_user(test_db, email, "mypassword", "Auth User")
    user = await authenticate_email_user(test_db, email, "mypassword")
    assert user.email == email


@pytest.mark.asyncio
async def test_authenticate_email_user_wrong_password_raises_401(test_db):
    import uuid
    email = f"wrong-{uuid.uuid4().hex[:8]}@example.com"
    await register_email_user(test_db, email, "rightpass", "Wrong")
    with pytest.raises(HTTPException) as exc_info:
        await authenticate_email_user(test_db, email, "wrongpass")
    assert exc_info.value.status_code == 401


@pytest.mark.asyncio
async def test_authenticate_nonexistent_user_raises_401(test_db):
    with pytest.raises(HTTPException) as exc_info:
        await authenticate_email_user(test_db, "nobody-xyz@example.com", "pass")
    assert exc_info.value.status_code == 401