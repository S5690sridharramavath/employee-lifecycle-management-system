from datetime import date, datetime

from sqlalchemy import Date, DateTime, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Task(Base):
    __tablename__ = "tasks"

    id: Mapped[int] = mapped_column(primary_key=True)

    employee_id: Mapped[int] = mapped_column(
        ForeignKey("employees.id"), nullable=False
    )

    title: Mapped[str] = mapped_column(String(150), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)

    category: Mapped[str] = mapped_column(
        String(50), default="onboarding", nullable=False
    )

    status: Mapped[str] = mapped_column(
        String(30), default="pending", nullable=False
    )

    assigned_to: Mapped[str | None] = mapped_column(
        String(100), nullable=True
    )

    due_date: Mapped[date | None] = mapped_column(Date, nullable=True)

    depends_on_task_id: Mapped[int | None] = mapped_column(
        ForeignKey("tasks.id"), nullable=True
    )

    completed_at: Mapped[datetime | None] = mapped_column(
        DateTime, nullable=True
    )