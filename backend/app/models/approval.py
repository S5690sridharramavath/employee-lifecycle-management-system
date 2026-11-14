
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Approval(Base):
    __tablename__ = "approvals"

    id: Mapped[int] = mapped_column(primary_key=True)

    employee_id: Mapped[int] = mapped_column(
        ForeignKey("employees.id"), nullable=False
    )

    approval_type: Mapped[str] = mapped_column(
        String(50), nullable=False
    )

    requested_by: Mapped[str] = mapped_column(
        String(100), nullable=False
    )

    status: Mapped[str] = mapped_column(
        String(30), default="pending", nullable=False
    )

    comments: Mapped[str | None] = mapped_column(Text, nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )
