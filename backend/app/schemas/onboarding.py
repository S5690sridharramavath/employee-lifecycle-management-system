
from datetime import date
from pydantic import BaseModel, ConfigDict


class OnboardingCreate(BaseModel):
    employee_id: int
    status: str = "not_started"
    start_date: date
    target_completion_date: date | None = None
    notes: str | None = None


class OnboardingResponse(OnboardingCreate):
    id: int
    model_config = ConfigDict(from_attributes=True)
