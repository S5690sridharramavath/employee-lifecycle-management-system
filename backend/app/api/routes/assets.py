
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.asset import Asset
from app.models.employee import Employee
from app.schemas.asset import AssetCreate, AssetUpdate, AssetResponse
from datetime import datetime
from app.models.audit_event import AuditEvent

router = APIRouter(prefix="/api/assets", tags=["Assets"])


@router.post("/", response_model=AssetResponse, status_code=status.HTTP_201_CREATED)
def create_asset(payload: AssetCreate, db: Session = Depends(get_db)):
    if db.query(Asset).filter(Asset.asset_tag == payload.asset_tag).first():
        raise HTTPException(status_code=400, detail="Asset tag already exists")

    if payload.assigned_employee_id is not None:
        employee = db.query(Employee).filter(
            Employee.id == payload.assigned_employee_id
        ).first()

        if not employee:
            raise HTTPException(status_code=404, detail="Employee not found")

    asset = Asset(**payload.model_dump())
    db.add(asset)
    db.commit()
    db.refresh(asset)

    return asset


@router.get("/", response_model=list[AssetResponse])
def get_assets(db: Session = Depends(get_db)):
    return db.query(Asset).order_by(Asset.id.desc()).all()


@router.get("/{asset_id}", response_model=AssetResponse)
def get_asset(asset_id: int, db: Session = Depends(get_db)):
    asset = db.query(Asset).filter(Asset.id == asset_id).first()

    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")

    return asset


@router.put("/{asset_id}", response_model=AssetResponse)
def update_asset(
    asset_id: int,
    payload: AssetUpdate,
    db: Session = Depends(get_db)
):
    asset = db.query(Asset).filter(Asset.id == asset_id).first()

    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")

    updates = payload.model_dump(exclude_unset=True)

    if "asset_tag" in updates:
        duplicate = db.query(Asset).filter(
            Asset.asset_tag == updates["asset_tag"],
            Asset.id != asset_id
        ).first()

        if duplicate:
            raise HTTPException(status_code=400, detail="Asset tag already exists")

    if updates.get("assigned_employee_id") is not None:
        employee = db.query(Employee).filter(
            Employee.id == updates["assigned_employee_id"]
        ).first()

        if not employee:
            raise HTTPException(status_code=404, detail="Employee not found")

    for field, value in updates.items():
        setattr(asset, field, value)

    db.commit()
    db.refresh(asset)

    return asset


@router.delete("/{asset_id}")
def delete_asset(asset_id: int, db: Session = Depends(get_db)):
    asset = db.query(Asset).filter(Asset.id == asset_id).first()

    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")

    db.delete(asset)
    db.commit()

    return {"message": "Asset deleted successfully"}


@router.post("/{asset_id}/recover")
def recover_asset(asset_id: int, db: Session = Depends(get_db)):
    asset = db.query(Asset).filter(Asset.id == asset_id).first()

    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")

    if asset.status != "recovery_pending":
        raise HTTPException(
            status_code=400,
            detail="Asset is not awaiting recovery"
        )

    employee_id = asset.assigned_employee_id
    old_status = asset.status

    asset.status = "available"
    asset.assigned_employee_id = None

    db.add(AuditEvent(
        employee_id=employee_id,
        entity_type="Asset",
        entity_id=str(asset.id),
        event_type="asset_recovered",
        old_value=old_status,
        new_value="available",
        details=f"Asset {asset.asset_tag} successfully recovered"
    ))

    db.commit()
    db.refresh(asset)

    return {
        "message": "Asset successfully recovered",
        "asset_id": asset.id,
        "asset_tag": asset.asset_tag,
        "status": asset.status
    }

