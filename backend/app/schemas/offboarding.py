
from datetime import date
from pydantic import BaseModel, ConfigDict


class OffboardingCreate(BaseModel):
    employee_id: int
    status: str = "initiated"
    exit_date: date
    reason: str | None = None
    notes: str | None = None


class OffboardingResponse(OffboardingCreate):
    id: int
    model_config = ConfigDict(from_attributes=True)
