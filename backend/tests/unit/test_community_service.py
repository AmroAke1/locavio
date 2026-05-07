import pytest
import uuid
from app.services.community_service import (
    create_community,
    join_community,
    leave_community,
    get_membership,
)
from app.schemas.community import CommunityCreate
from app.models.membership import MembershipRole


@pytest.mark.asyncio
async def test_create_community_saves_to_db(test_db, mock_user):
    data = CommunityCreate(name=f"Test Community {uuid.uuid4().hex[:6]}", location="Istanbul")
    community = await create_community(test_db, mock_user.id, data, "en")
    assert community.id is not None
    assert community.name.startswith("Test Community")


@pytest.mark.asyncio
async def test_create_community_makes_creator_admin(test_db, mock_user):
    data = CommunityCreate(name=f"Admin Test {uuid.uuid4().hex[:6]}", location="Paris")
    community = await create_community(test_db, mock_user.id, data, "en")
    membership = await get_membership(test_db, mock_user.id, community.id)
    assert membership is not None
    assert membership.role == MembershipRole.admin


@pytest.mark.asyncio
async def test_join_community_creates_membership(test_db, mock_user):
    from app.models.user import User, AuthProvider
    data = CommunityCreate(name=f"Join Test {uuid.uuid4().hex[:6]}", location="London")
    community = await create_community(test_db, mock_user.id, data, "en")
    # Create another user to join
    other_user = User(
        email=f"other-{uuid.uuid4().hex[:8]}@test.com",
        name="Other",
        auth_provider=AuthProvider.email,
        password_hash="x",
    )
    test_db.add(other_user)
    await test_db.commit()
    await test_db.refresh(other_user)
    membership = await join_community(test_db, other_user.id, community.id, "en")
    assert membership.id is not None


@pytest.mark.asyncio
async def test_leave_community_returns_true_when_found(test_db, mock_user):
    data = CommunityCreate(name=f"Leave Test {uuid.uuid4().hex[:6]}", location="Berlin")
    community = await create_community(test_db, mock_user.id, data, "en")
    # mock_user is admin via create_community, so they have a membership
    result = await leave_community(test_db, mock_user.id, community.id)
    assert result is True


@pytest.mark.asyncio
async def test_leave_community_returns_false_when_not_member(test_db, mock_user):
    data = CommunityCreate(name=f"No Membership {uuid.uuid4().hex[:6]}", location="NYC")
    community = await create_community(test_db, mock_user.id, data, "en")
    result = await leave_community(test_db, 999999, community.id)
    assert result is False