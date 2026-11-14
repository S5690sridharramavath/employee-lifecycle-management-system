
from datetime import date

from sqlalchemy import Date, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Employee(Base):
    __tablename__ = "employees"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    employee_code: Mapped[str] = mapped_column(
        String(30), unique=True, nullable=False
    )

    first_name: Mapped[str] = mapped_column(String(100), nullable=False)
    last_name: Mapped[str] = mapped_column(String(100), nullable=False)
    email: Mapped[str] = mapped_column(
        String(255), unique=True, nullable=False
    )

    phone: Mapped[str | None] = mapped_column(String(20), nullable=True)
    job_title: Mapped[str] = mapped_column(String(100), nullable=False)

    employment_type: Mapped[str] = mapped_column(
        String(30), default="full_time", nullable=False
    )

    status: Mapped[str] = mapped_column(
        String(30), default="active", nullable=False
    )

    date_of_joining: Mapped[date] = mapped_column(Date, nullable=False)
    date_of_exit: Mapped[date | None] = mapped_column(Date, nullable=True)

    department_id: Mapped[int] = mapped_column(
        ForeignKey("departments.id"), nullable=False
    )

    manager_id: Mapped[int | None] = mapped_column(
        ForeignKey("employees.id"), nullable=True
    )

    department = relationship("Department", back_populates="employees")

    manager = relationship(
        "Employee",
        remote_side="Employee.id",
        back_populates="team_members",
    )

    team_members = relationship(
        "Employee",
        back_populates="manager",
    )
