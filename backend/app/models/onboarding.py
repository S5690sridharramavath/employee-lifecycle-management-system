
from datetime import date

from sqlalchemy import Date, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class OnboardingCase(Base):
    __tablename__ = "onboarding_cases"

    id: Mapped[int] = mapped_column(primary_key=True)
    employee_id: Mapped[int] = mapped_column(
        ForeignKey("employees.id"), nullable=False
    )
    status: Mapped[str] = mapped_column(
        String(30), default="not_started", nullable=False
    )
    start_date: Mapped[date] = mapped_column(Date, nullable=False)
    target_completion_date: Mapped[date | None] = mapped_column(
        Date, nullable=True
    )
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
