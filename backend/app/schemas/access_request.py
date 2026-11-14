from datetime import datetime
from pydantic import BaseModel, ConfigDict

class AccessRequestCreate(BaseModel):
    employee_id: int
    system_name: str
    approval_id: int | None = None
    notes: str | None = None

class AccessRequestResponse(BaseModel):
    id: int
    employee_id: int
    approval_id: int | None
    system_name: str
    status: str
    requested_at: datetime
    granted_at: datetime | None
    revoked_at: datetime | None
    notes: str | None

    model_config = ConfigDict(from_attributes=True)
