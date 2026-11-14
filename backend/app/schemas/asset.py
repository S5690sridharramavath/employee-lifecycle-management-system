
from datetime import date

from pydantic import BaseModel, ConfigDict


class AssetCreate(BaseModel):
    asset_tag: str
    name: str
    asset_type: str
    serial_number: str | None = None
    status: str = "available"
    assigned_employee_id: int | None = None
    purchase_date: date | None = None


class AssetUpdate(BaseModel):
    asset_tag: str | None = None
    name: str | None = None
    asset_type: str | None = None
    serial_number: str | None = None
    status: str | None = None
    assigned_employee_id: int | None = None
    purchase_date: date | None = None


class AssetResponse(BaseModel):
    id: int
    asset_tag: str
    name: str
    asset_type: str
    serial_number: str | None
    status: str
    assigned_employee_id: int | None
    purchase_date: date | None

    model_config = ConfigDict(from_attributes=True)
