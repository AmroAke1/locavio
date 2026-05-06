from sqlalchemy import func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.models.community import Community
from app.models.membership import Membership, MembershipRole, MembershipStatus
from app.schemas.community import CommunityCreate, CommunityUpdate


async def list_communities(
    db: AsyncSession,
    location: str | None,
    category: str | None,
    search: str | None,
    page: int,
    limit: int,
    language: str,
) -> list[tuple[Community, int]]:
    """List communities with optional filters and pagination, including member counts.

    Args:
        db: Active database session.
        location: Optional location string filter (partial match).
        category: Optional category filter.
        search: Optional keyword search against name and description.
        page: 1-based page number.
        limit: Results per page.
        language: Request language code.

    Returns:
        List of (Community, member_count) tuples.
    """
    member_count_subq = (
        select(Membership.community_id, func.count(Membership.id).label("cnt"))
        .where(Membership.status == MembershipStatus.active)
        .group_by(Membership.community_id)
        .subquery()
    )

    query = (
        select(Community, func.coalesce(member_count_subq.c.cnt, 0).label("member_count"))
        .outerjoin(member_count_subq, Community.id == member_count_subq.c.community_id)
        .order_by(Community.created_at.desc())
        .offset((page - 1) * limit)
        .limit(limit)
    )

    if location:
        query = query.where(Community.location.ilike(f"%{location}%"))
    if category:
        query = query.where(Community.category == category)
    if search:
        query = query.where(
            Community.name.ilike(f"%{search}%")
            | Community.description.ilike(f"%{search}%")
        )

    result = await db.execute(query)
    return result.all()


async def get_community(
    db: AsyncSession, community_id: int, language: str
) -> tuple[Community, int] | None:
    """Fetch a single community with its member count.

    Args:
        db: Active database session.
        community_id: Primary key of the community.
        language: Request language code.

    Returns:
        (Community, member_count) tuple or None.
    """
    member_count_subq = (
        select(Membership.community_id, func.count(Membership.id).label("cnt"))
        .where(Membership.status == MembershipStatus.active)
        .group_by(Membership.community_id)
        .subquery()
    )

    result = await db.execute(
        select(Community, func.coalesce(member_count_subq.c.cnt, 0).label("member_count"))
        .outerjoin(member_count_subq, Community.id == member_count_subq.c.community_id)
        .where(Community.id == community_id)
    )
    row = result.first()
    return row if row else None


async def create_community(
    db: AsyncSession, user_id: int, data: CommunityCreate, language: str
) -> Community:
    """Create a new community and make the creator an admin member.

    Args:
        db: Active database session.
        user_id: ID of the user creating the community.
        data: Validated community creation payload.
        language: Request language code.

    Returns:
        Newly created Community ORM instance.
    """
    community = Community(created_by=user_id, **data.model_dump())
    db.add(community)
    await db.flush()

    membership = Membership(
        user_id=user_id,
        community_id=community.id,
        role=MembershipRole.admin,
        status=MembershipStatus.active,
    )
    db.add(membership)
    await db.commit()
    await db.refresh(community)
    return community


async def update_community(
    db: AsyncSession, community: Community, data: CommunityUpdate, language: str
) -> Community:
    """Apply a partial update to a community record.

    Args:
        db: Active database session.
        community: Community ORM instance to update.
        data: Pydantic schema with optional fields to overwrite.
        language: Request language code.

    Returns:
        Updated Community ORM instance.
    """
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(community, field, value)
    await db.commit()
    await db.refresh(community)
    return community


async def delete_community(db: AsyncSession, community: Community) -> None:
    """Delete a community and all its cascaded memberships.

    Args:
        db: Active database session.
        community: Community ORM instance to delete.
    """
    await db.delete(community)
    await db.commit()


async def join_community(
    db: AsyncSession, user_id: int, community_id: int, language: str
) -> Membership:
    """Create an active membership for a user in a community.

    Args:
        db: Active database session.
        user_id: ID of the joining user.
        community_id: ID of the community to join.
        language: Request language code.

    Returns:
        Newly created Membership ORM instance.
    """
    membership = Membership(
        user_id=user_id,
        community_id=community_id,
        role=MembershipRole.member,
        status=MembershipStatus.active,
    )
    db.add(membership)
    await db.commit()
    await db.refresh(membership)
    return membership


async def leave_community(
    db: AsyncSession, user_id: int, community_id: int
) -> bool:
    """Remove a user's membership from a community.

    Args:
        db: Active database session.
        user_id: ID of the leaving user.
        community_id: ID of the community to leave.

    Returns:
        True if membership was found and deleted, False otherwise.
    """
    result = await db.execute(
        select(Membership).where(
            Membership.user_id == user_id,
            Membership.community_id == community_id,
        )
    )
    membership = result.scalar_one_or_none()
    if membership is None:
        return False
    await db.delete(membership)
    await db.commit()
    return True


async def get_members(
    db: AsyncSession,
    community_id: int,
    page: int,
    limit: int,
    language: str,
) -> list[Membership]:
    """List paginated members of a community with user details.

    Args:
        db: Active database session.
        community_id: Primary key of the community.
        page: 1-based page number.
        limit: Results per page.
        language: Request language code.

    Returns:
        List of Membership ORM instances with user relationship loaded.
    """
    result = await db.execute(
        select(Membership)
        .where(Membership.community_id == community_id)
        .options(selectinload(Membership.user))
        .order_by(Membership.joined_at.asc())
        .offset((page - 1) * limit)
        .limit(limit)
    )
    return list(result.scalars().all())


async def get_membership(
    db: AsyncSession, user_id: int, community_id: int
) -> Membership | None:
    """Fetch a specific membership record.

    Args:
        db: Active database session.
        user_id: Member's user ID.
        community_id: Community ID.

    Returns:
        Membership ORM instance or None.
    """
    result = await db.execute(
        select(Membership).where(
            Membership.user_id == user_id,
            Membership.community_id == community_id,
        )
    )
    return result.scalar_one_or_none()
