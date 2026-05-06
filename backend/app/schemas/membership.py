from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.models.membership import MembershipRole, MembershipStatus
from app.schemas.user import UserResponse


class MembershipCreate(BaseModel):
    community_id: int
    role: MembershipRole = MembershipRole.member
    status: MembershipStatus = MembershipStatus.active


class MembershipUpdate(BaseModel):
    role: MembershipRole | None = None
    status: MembershipStatus | None = None


class MembershipResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    community_id: int
    role: MembershipRole
    status: MembershipStatus
    joined_at: datetime
    user: UserResponse | None = None
