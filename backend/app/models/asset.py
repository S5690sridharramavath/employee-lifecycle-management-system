
from datetime import date

from sqlalchemy import Date, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Asset(Base):
    __tablename__ = "assets"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    asset_tag: Mapped[str] = mapped_column(
        String(50), unique=True, nullable=False
    )

    name: Mapped[str] = mapped_column(String(150), nullable=False)

    asset_type: Mapped[str] = mapped_column(
        String(50), nullable=False
    )

    serial_number: Mapped[str | None] = mapped_column(
        String(100), nullable=True
    )

    status: Mapped[str] = mapped_column(
        String(30), default="available", nullable=False
    )

    assigned_employee_id: Mapped[int | None] = mapped_column(
        ForeignKey("employees.id"), nullable=True
    )

    purchase_date: Mapped[date | None] = mapped_column(
        Date, nullable=True
    )
