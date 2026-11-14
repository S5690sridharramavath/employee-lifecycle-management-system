
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.employee import Employee
from app.schemas.employee import EmployeeCreate, EmployeeUpdate


def create_employee(db: Session, employee_data: EmployeeCreate):
    employee = Employee(**employee_data.model_dump())

    db.add(employee)
    db.commit()
    db.refresh(employee)

    return employee


def get_employee(db: Session, employee_id: int):
    statement = select(Employee).where(Employee.id == employee_id)
    return db.scalar(statement)


def get_employees(db: Session, skip: int = 0, limit: int = 100):
    statement = (
        select(Employee)
        .offset(skip)
        .limit(limit)
        .order_by(Employee.id)
    )

    return list(db.scalars(statement).all())


def update_employee(
    db: Session,
    employee: Employee,
    employee_data: EmployeeUpdate,
):
    update_data = employee_data.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(employee, field, value)

    db.commit()
    db.refresh(employee)

    return employee


def delete_employee(db: Session, employee: Employee):
    db.delete(employee)
    db.commit()

    return True
