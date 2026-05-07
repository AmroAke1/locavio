import pytest
import uuid
from app.services.user_service import get_user_by_id, update_user, delete_user
from app.schemas.user import UserUpdate
from app.models.user import User, AuthProvider


@pytest.mark.asyncio
async def test_get_user_by_id_returns_user(test_db, mock_user):
    result = await get_user_by_id(test_db, mock_user.id)
    assert result is not None
    assert result.id == mock_user.id


@pytest.mark.asyncio
async def test_get_user_by_id_returns_none_for_missing(test_db):
    result = await get_user_by_id(test_db, 999999)
    assert result is None


@pytest.mark.asyncio
async def test_update_user_changes_name(test_db):
    user = User(
        email=f"upd-{uuid.uuid4().hex[:8]}@example.com",
        name="Old Name",
        auth_provider=AuthProvider.email,
    )
    test_db.add(user)
    await test_db.commit()
    await test_db.refresh(user)

    result = await update_user(test_db, user, UserUpdate(name="New Name"))
    assert result.name == "New Name"


@pytest.mark.asyncio
async def test_update_user_location(test_db):
    user = User(
        email=f"loc-{uuid.uuid4().hex[:8]}@example.com",
        name="User",
        auth_provider=AuthProvider.email,
    )
    test_db.add(user)
    await test_db.commit()
    await test_db.refresh(user)

    result = await update_user(test_db, user, UserUpdate(location="Istanbul"))
    assert result.location == "Istanbul"


@pytest.mark.asyncio
async def test_delete_user_removes_from_db(test_db):
    user = User(
        email=f"del-{uuid.uuid4().hex[:8]}@example.com",
        name="Delete Me",
        auth_provider=AuthProvider.email,
    )
    test_db.add(user)
    await test_db.commit()
    await test_db.refresh(user)
    user_id = user.id

    await delete_user(test_db, user)
    result = await get_user_by_id(test_db, user_id)
    assert result is None