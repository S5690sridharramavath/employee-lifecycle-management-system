
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class ApprovalCreate(BaseModel):
    employee_id: int
    approval_type: str
    requested_by: str
    comments: str | None = None


class ApprovalUpdate(BaseModel):
    status: str
    comments: str | None = None


class ApprovalResponse(ApprovalCreate):
    id: int
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
