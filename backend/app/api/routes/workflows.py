
from datetime import date, datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models import (
    Employee,
    OnboardingCase,
    OffboardingCase,
    AccessRequest,
    Asset,
    AuditEvent,
    Task,
)
from app.schemas.onboarding import OnboardingCreate, OnboardingResponse
from app.schemas.offboarding import OffboardingCreate, OffboardingResponse

router = APIRouter(tags=["Workflows"])


@router.post("/api/onboarding/", response_model=OnboardingResponse)
def create_onboarding(data: OnboardingCreate, db: Session = Depends(get_db)):
    if not db.get(Employee, data.employee_id):
        raise HTTPException(404, "Employee not found")

    case = OnboardingCase(**data.model_dump())
    db.add(case)
    db.commit()
    db.refresh(case)
    return case


@router.get("/api/onboarding/", response_model=list[OnboardingResponse])
def list_onboarding(db: Session = Depends(get_db)):
    return list(db.scalars(select(OnboardingCase)).all())


@router.post("/api/offboarding/", response_model=OffboardingResponse)
def create_offboarding(data: OffboardingCreate, db: Session = Depends(get_db)):
    employee = db.get(Employee, data.employee_id)

    if not employee:
        raise HTTPException(404, "Employee not found")

    existing = db.scalar(
        select(OffboardingCase).where(
            OffboardingCase.employee_id == data.employee_id,
            OffboardingCase.status != "completed",
        )
    )

    if existing:
        raise HTTPException(400, "An active offboarding case already exists")

    case = OffboardingCase(**data.model_dump())
    db.add(case)
    db.flush()

    db.add(AuditEvent(
        employee_id=employee.id,
        entity_type="OffboardingCase",
        entity_id=str(case.id),
        event_type="offboarding_created",
        new_value=case.status,
        details=f"Offboarding case created with exit date {case.exit_date}",
    ))

    db.commit()
    db.refresh(case)
    return case


@router.get("/api/offboarding/", response_model=list[OffboardingResponse])
def list_offboarding(db: Session = Depends(get_db)):
    return list(db.scalars(select(OffboardingCase)).all())


@router.post("/api/offboarding/{case_id}/process")
def process_offboarding(case_id: int, db: Session = Depends(get_db)):
    case = db.get(OffboardingCase, case_id)

    if not case:
        raise HTTPException(404, "Offboarding case not found")

    if case.status == "completed":
        raise HTTPException(400, "Offboarding case is already completed")

    if case.exit_date > date.today():
        raise HTTPException(
            400,
            f"Cannot process offboarding before exit date {case.exit_date}",
        )

    employee = db.get(Employee, case.employee_id)

    if not employee:
        raise HTTPException(404, "Employee not found")

    revoked_count = 0
    cancelled_count = 0
    recovery_count = 0
    tasks_created = 0
    now = datetime.utcnow()

    try:
        # 1. Revoke active access and cancel pending requests.
        requests = db.scalars(
            select(AccessRequest).where(
                AccessRequest.employee_id == employee.id
            )
        ).all()

        for request in requests:
            old_status = request.status

            if old_status == "active":
                request.status = "revoked"
                request.revoked_at = now
                revoked_count += 1

            elif old_status == "requested":
                request.status = "cancelled"
                cancelled_count += 1

            else:
                continue

            db.add(AuditEvent(
                employee_id=employee.id,
                entity_type="AccessRequest",
                entity_id=str(request.id),
                event_type="offboarding_access_update",
                old_value=old_status,
                new_value=request.status,
                details=f"Access update during offboarding case {case.id}",
            ))

        # 2. Mark assigned assets for recovery.
        assets = db.scalars(
            select(Asset).where(
                Asset.assigned_employee_id == employee.id,
                Asset.status == "assigned",
            )
        ).all()

        for asset in assets:
            old_status = asset.status
            asset.status = "recovery_pending"
            recovery_count += 1

            db.add(AuditEvent(
                employee_id=employee.id,
                entity_type="Asset",
                entity_id=str(asset.id),
                event_type="asset_recovery_requested",
                old_value=old_status,
                new_value=asset.status,
                details=f"Asset {asset.asset_tag} requires recovery",
            ))

        # 3. Terminate employee.
        old_employee_status = employee.status
        employee.status = "terminated"

        db.add(AuditEvent(
            employee_id=employee.id,
            entity_type="Employee",
            entity_id=str(employee.id),
            event_type="employee_terminated",
            old_value=old_employee_status,
            new_value=employee.status,
            details=f"Processed offboarding case {case.id}",
        ))

        # 4. Create IT access-revocation verification task.
        task_definitions = [
            {
                "title": "Verify employee system access revocation",
                "description": (
                    "Confirm all employee system accounts and "
                    "permissions have been revoked."
                ),
            },
            {
                "title": "Verify company asset recovery",
                "description": (
                    "Confirm all assigned company assets have been "
                    "returned and recorded."
                ),
            },
        ]

        for definition in task_definitions:
            existing_task = db.scalar(
                select(Task).where(
                    Task.employee_id == employee.id,
                    Task.category == "offboarding",
                    Task.title == definition["title"],
                )
            )

            if not existing_task:
                new_task = Task(
                    employee_id=employee.id,
                    title=definition["title"],
                    description=definition["description"],
                    category="offboarding",
                    status="pending",
                    assigned_to="IT",
                )

                db.add(new_task)
                db.flush()
                tasks_created += 1

                db.add(AuditEvent(
                    employee_id=employee.id,
                    entity_type="Task",
                    entity_id=str(new_task.id),
                    event_type="offboarding_task_created",
                    new_value="pending",
                    details=f"Created IT follow-up task: {new_task.title}",
                ))

        # 5. Update offboarding case.
        old_case_status = case.status
        case.status = "in_progress"

        db.add(AuditEvent(
            employee_id=employee.id,
            entity_type="OffboardingCase",
            entity_id=str(case.id),
            event_type="offboarding_processed",
            old_value=old_case_status,
            new_value=case.status,
            details=(
                f"Access revoked: {revoked_count}; "
                f"requests cancelled: {cancelled_count}; "
                f"assets awaiting recovery: {recovery_count}; "
                f"tasks created: {tasks_created}"
            ),
        ))

        db.commit()

    except Exception:
        db.rollback()
        raise

    return {
        "message": "Offboarding processed successfully. Follow-up tasks created or already exist.",
        "offboarding_case_id": case.id,
        "employee_id": employee.id,
        "employee_status": employee.status,
        "revoked_access_requests": revoked_count,
        "cancelled_access_requests": cancelled_count,
        "assets_pending_recovery": recovery_count,
        "offboarding_tasks_created": tasks_created,
        "offboarding_status": case.status,
    }
