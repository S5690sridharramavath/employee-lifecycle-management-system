from datetime import date, datetime

from pydantic import BaseModel, ConfigDict


class TaskCreate(BaseModel):
    employee_id: int
    title: str
    description: str | None = None
    category: str = "onboarding"
    status: str = "pending"
    assigned_to: str | None = None
    due_date: date | None = None
    depends_on_task_id: int | None = None


class TaskUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    category: str | None = None
    status: str | None = None
    assigned_to: str | None = None
    due_date: date | None = None
    depends_on_task_id: int | None = None


class TaskResponse(BaseModel):
    id: int
    employee_id: int
    title: str
    description: str | None
    category: str
    status: str
    assigned_to: str | None
    due_date: date | None
    depends_on_task_id: int | None
    completed_at: datetime | None

    model_config = ConfigDict(from_attributes=True)