
from datetime import date

from pydantic import BaseModel, ConfigDict


class EmployeeBase(BaseModel):
    employee_code: str
    first_name: str
    last_name: str
    email: str
    phone: str | None = None
    job_title: str
    employment_type: str = "full_time"
    status: str = "active"
    date_of_joining: date
    date_of_exit: date | None = None
    department_id: int
    manager_id: int | None = None


class EmployeeCreate(EmployeeBase):
    pass


class EmployeeUpdate(BaseModel):
    employee_code: str | None = None
    first_name: str | None = None
    last_name: str | None = None
    email: str | None = None
    phone: str | None = None
    job_title: str | None = None
    employment_type: str | None = None
    status: str | None = None
    date_of_joining: date | None = None
    date_of_exit: date | None = None
    department_id: int | None = None
    manager_id: int | None = None


class EmployeeResponse(EmployeeBase):
    id: int

    model_config = ConfigDict(from_attributes=True)
