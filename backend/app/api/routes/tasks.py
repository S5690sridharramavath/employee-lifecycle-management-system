from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models import Employee, Task
from app.models.audit_event import AuditEvent
from app.schemas.task import TaskCreate, TaskUpdate, TaskResponse

router = APIRouter(prefix="/api/tasks", tags=["Tasks"])


def validate_dependency(
    db: Session,
    employee_id: int,
    dependency_id: int | None,
    current_task_id: int | None = None,
):
    if dependency_id is None:
        return

    if dependency_id == current_task_id:
        raise HTTPException(400, "A task cannot depend on itself")

    dependency = db.get(Task, dependency_id)

    if not dependency:
        raise HTTPException(404, "Prerequisite task not found")

    if dependency.employee_id != employee_id:
        raise HTTPException(
            400, "Prerequisite task must belong to the same employee"
        )

    # Walk the dependency chain to prevent circular dependencies.
    visited = set()
    current = dependency

    while current:
        if current.id == current_task_id:
            raise HTTPException(400, "Circular task dependency detected")

        if current.id in visited:
            raise HTTPException(400, "Existing circular dependency detected")

        visited.add(current.id)

        if not current.depends_on_task_id:
            break

        current = db.get(Task, current.depends_on_task_id)


def check_can_complete(db: Session, task: Task):
    if task.depends_on_task_id is None:
        return

    prerequisite = db.get(Task, task.depends_on_task_id)

    if not prerequisite or prerequisite.status != "completed":
        raise HTTPException(
            400,
            "Cannot complete this task before its prerequisite is completed"
        )


def add_task_audit(
    db: Session,
    task: Task,
    event_type: str,
    old_value: str | None = None,
    new_value: str | None = None,
):
    db.add(
        AuditEvent(
            employee_id=task.employee_id,
            entity_type="task",
            entity_id=str(task.id),
            event_type=event_type,
            old_value=old_value,
            new_value=new_value,
            details=f"Task: {task.title}",
        )
    )


@router.post("/", response_model=TaskResponse, status_code=201)
def create_task(data: TaskCreate, db: Session = Depends(get_db)):
    if not db.get(Employee, data.employee_id):
        raise HTTPException(404, "Employee not found")

    validate_dependency(
        db,
        data.employee_id,
        data.depends_on_task_id,
    )

    if data.status == "completed" and data.depends_on_task_id:
        prerequisite = db.get(Task, data.depends_on_task_id)
        if not prerequisite or prerequisite.status != "completed":
            raise HTTPException(
                400, "Cannot create a completed task with an incomplete prerequisite"
            )

    task_data = data.model_dump()

    if task_data["status"] == "completed":
        task_data["completed_at"] = datetime.utcnow()

    task = Task(**task_data)
    db.add(task)
    db.flush()

    add_task_audit(db, task, "task_created", None, task.status)

    db.commit()
    db.refresh(task)
    return task


@router.get("/", response_model=list[TaskResponse])
def list_tasks(db: Session = Depends(get_db)):
    return list(db.scalars(select(Task).order_by(Task.id)).all())


@router.put("/{task_id}", response_model=TaskResponse)
def update_task(
    task_id: int,
    data: TaskUpdate,
    db: Session = Depends(get_db),
):
    task = db.get(Task, task_id)

    if not task:
        raise HTTPException(404, "Task not found")

    updates = data.model_dump(exclude_unset=True)

    new_dependency = updates.get(
        "depends_on_task_id", task.depends_on_task_id
    )

    validate_dependency(
        db,
        task.employee_id,
        new_dependency,
        current_task_id=task.id,
    )

    new_status = updates.get("status", task.status)

    if new_status == "completed" and task.status != "completed":
        # Check the proposed prerequisite before changing the task.
        if new_dependency is not None:
            prerequisite = db.get(Task, new_dependency)

            if not prerequisite or prerequisite.status != "completed":
                raise HTTPException(
                    400,
                    "Cannot complete this task before its prerequisite is completed",
                )

        task.completed_at = datetime.utcnow()

    elif new_status != "completed":
        task.completed_at = None

    old_status = task.status

    for field, value in updates.items():
        setattr(task, field, value)

    if old_status != task.status:
        add_task_audit(
            db,
            task,
            "task_status_changed",
            old_status,
            task.status,
        )

    db.commit()
    db.refresh(task)
    return task