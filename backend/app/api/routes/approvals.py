
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models import Employee, Approval
from app.schemas.approval import (
    ApprovalCreate,
    ApprovalUpdate,
    ApprovalResponse,
)

router = APIRouter(prefix="/api/approvals", tags=["Approvals"])


@router.post("/", response_model=ApprovalResponse, status_code=201)
def create_approval(data: ApprovalCreate, db: Session = Depends(get_db)):
    if not db.get(Employee, data.employee_id):
        raise HTTPException(404, "Employee not found")

    approval = Approval(**data.model_dump())
    db.add(approval)
    db.commit()
    db.refresh(approval)
    return approval


@router.get("/", response_model=list[ApprovalResponse])
def list_approvals(db: Session = Depends(get_db)):
    return list(db.scalars(select(Approval).order_by(Approval.id)).all())


@router.patch("/{approval_id}", response_model=ApprovalResponse)
def update_approval(
    approval_id: int,
    data: ApprovalUpdate,
    db: Session = Depends(get_db),
):
    approval = db.get(Approval, approval_id)

    if not approval:
        raise HTTPException(404, "Approval not found")

    if approval.status != "pending":
        raise HTTPException(400, "This approval has already been processed")

    approval.status = data.status
    approval.comments = data.comments

    db.commit()
    db.refresh(approval)
    return approval
