from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models import Employee, Approval, AccessRequest, AuditEvent
from app.schemas.access_request import AccessRequestCreate, AccessRequestResponse

router = APIRouter(prefix="/api/access-requests", tags=["Access Requests"])


@router.post("/", response_model=AccessRequestResponse, status_code=201)
def create_access_request(data: AccessRequestCreate, db: Session = Depends(get_db)):
    employee = db.get(Employee, data.employee_id)
    if not employee:
        raise HTTPException(404, "Employee not found")

    if data.approval_id is not None:
        approval = db.get(Approval, data.approval_id)
        if not approval:
            raise HTTPException(404, "Approval not found")
        if approval.employee_id != data.employee_id:
            raise HTTPException(400, "Approval belongs to another employee")

    request = AccessRequest(
        employee_id=data.employee_id,
        approval_id=data.approval_id,
        system_name=data.system_name,
        status="requested",
        notes=data.notes,
    )
    db.add(request)
    db.commit()
    db.refresh(request)

    db.add(AuditEvent(
        employee_id=data.employee_id,
        entity_type="AccessRequest",
        entity_id=str(request.id),
        event_type="access_requested",
        new_value="requested",
        details=f"Access requested for {data.system_name}",
    ))
    db.commit()
    db.refresh(request)
    return request


@router.get("/", response_model=list[AccessRequestResponse])
def list_access_requests(db: Session = Depends(get_db)):
    return list(db.scalars(
        select(AccessRequest).order_by(AccessRequest.id.desc())
    ).all())


@router.post("/{request_id}/grant", response_model=AccessRequestResponse)
def grant_access(request_id: int, db: Session = Depends(get_db)):
    request = db.get(AccessRequest, request_id)
    if not request:
        raise HTTPException(404, "Access request not found")

    if request.status != "requested":
        raise HTTPException(400, "Only requested access can be granted")

    if not request.approval_id:
        raise HTTPException(400, "Access cannot be granted without an approval")

    approval = db.get(Approval, request.approval_id)
    if not approval or approval.status != "approved":
        raise HTTPException(400, "Access cannot be granted before approval")

    now = datetime.utcnow()
    old_status = request.status
    request.status = "active"
    request.granted_at = now

    db.add(AuditEvent(
        employee_id=request.employee_id,
        entity_type="AccessRequest",
        entity_id=str(request.id),
        event_type="access_granted",
        old_value=old_status,
        new_value="active",
        details=f"Access granted for {request.system_name}",
    ))

    db.commit()
    db.refresh(request)
    return request


@router.post("/{request_id}/revoke", response_model=AccessRequestResponse)
def revoke_access(request_id: int, db: Session = Depends(get_db)):
    request = db.get(AccessRequest, request_id)
    if not request:
        raise HTTPException(404, "Access request not found")

    if request.status != "active":
        raise HTTPException(400, "Only active access can be revoked")

    now = datetime.utcnow()
    old_status = request.status
    request.status = "revoked"
    request.revoked_at = now

    db.add(AuditEvent(
        employee_id=request.employee_id,
        entity_type="AccessRequest",
        entity_id=str(request.id),
        event_type="access_revoked",
        old_value=old_status,
        new_value="revoked",
        details=f"Access revoked for {request.system_name}",
    ))

    db.commit()
    db.refresh(request)
    return request
