import argparse
import csv
import hashlib
import json
import random
from pathlib import Path
from datetime import date, timedelta

DEPARTMENTS = ["Engineering", "Human Resources", "Finance", "IT", "Operations", "Marketing", "Sales", "Facilities"]
ROLES = [
    "Software Engineer", "Senior Software Engineer", "Data Analyst", "Data Scientist",
    "HR Executive", "IT Support Engineer", "Finance Analyst", "Product Manager",
    "QA Engineer", "DevOps Engineer", "Sales Executive", "Facilities Coordinator"
]
TASK_TITLES = [
    ("Identity verification", "HR", None),
    ("Background check", "HR", None),
    ("Create company account", "IT", 0),
    ("Configure laptop", "IT", 0),
    ("Grant application access", "IT", 2),
    ("Prepare workstation", "Facilities", None),
    ("Manager introduction", "Manager", None),
    ("Complete orientation", "HR", 1),
]
SEED = 20261022
BASE_DATE = date(2026, 1, 1)


def write_csv(folder, name, rows):
    path = folder / f"{name}.csv"
    if not rows:
        path.write_text("", encoding="utf-8")
        return
    with path.open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=sorted({key for row in rows for key in row}))
        writer.writeheader()
        writer.writerows(rows)


def main():
    parser = argparse.ArgumentParser(description="Generate deterministic employee lifecycle data")
    parser.add_argument("--scale", type=float, default=1.0, help="Dataset scale, e.g. 0.05 or 1")
    parser.add_argument("--seed", type=int, default=SEED)
    parser.add_argument("--out", default="output/synthetic")
    args = parser.parse_args()

    if not 0 < args.scale <= 1:
        raise SystemExit("--scale must be greater than 0 and at most 1")

    rng = random.Random(args.seed)
    out = Path(args.out)
    out.mkdir(parents=True, exist_ok=True)

    def count(n):
        return max(1, int(n * args.scale))

    departments = [
        {"department_id": f"DEPT-{i:03d}", "name": name, "location": rng.choice(["Hyderabad", "Bengaluru", "Remote"])}
        for i, name in enumerate(DEPARTMENTS, 1)
    ]
    roles = [
        {"role_id": f"ROLE-{i:03d}", "title": title, "department_id": departments[(i - 1) % 8]["department_id"],
         "employment_type": "permanent" if i % 3 else "contractor"}
        for i, title in enumerate(ROLES, 1)
    ]

    managers = []
    for i in range(1, count(50) + 1):
        managers.append({
            "manager_id": f"MGR-{i:06d}", "name": f"Manager {i:03d}",
            "department_id": departments[(i - 1) % 8]["department_id"],
            "email": f"manager{i}@example.com"
        })

    employees = []
    for i in range(1, count(500) + 1):
        role = roles[(i - 1) % len(roles)]
        manager = managers[(i - 1) % len(managers)]
        start = BASE_DATE + timedelta(days=rng.randint(0, 300))
        employees.append({
            "employee_id": f"EMP-{i:06d}",
            "name": f"Employee {i:04d}",
            "email": f"employee{i}@example.com",
            "department_id": role["department_id"],
            "role_id": role["role_id"],
            "manager_id": manager["manager_id"],
            "employment_type": role["employment_type"],
            "work_location": rng.choice(["remote", "on_site", "hybrid"]),
            "joining_date": start.isoformat(),
            "status": "terminated" if i % 10 == 0 else "active",
        })

    onboarding = []
    for i, employee in enumerate(employees, 1):
        onboarding.append({
            "onboarding_id": f"ONB-2026-{i:06d}",
            "employee_id": employee["employee_id"],
            "start_date": employee["joining_date"],
            "status": "completed" if i % 4 == 0 else "in_progress",
            "target_completion_date": (date.fromisoformat(employee["joining_date"]) + timedelta(days=7)).isoformat()
        })

    templates = [
        {"template_id": f"TMPL-{i:03d}", "title": title, "owner_role": owner,
         "depends_on_template_id": f"TMPL-{dependency + 1:03d}" if dependency is not None else ""}
        for i, (title, owner, dependency) in enumerate(TASK_TITLES, 1)
    ]

    tasks = []
    task_lookup = {}
    task_number = 0
    for case_index, case in enumerate(onboarding, 1):
        case_tasks = []
        for step, (title, owner, dependency) in enumerate(TASK_TITLES, 1):
            task_number += 1
            task_id = f"TASK-ONB-{case_index:06d}-{step:03d}"
            due = date.fromisoformat(case["start_date"]) + timedelta(days=step + 2)
            status = "completed" if (case_index + step) % 4 == 0 else "pending"
            task = {
                "task_id": task_id, "onboarding_id": case["onboarding_id"],
                "employee_id": case["employee_id"], "template_id": f"TMPL-{step:03d}",
                "title": title, "owner": owner, "depends_on_task_id": "",
                "status": status, "due_date": due.isoformat(),
                "completed_date": (due - timedelta(days=1)).isoformat() if status == "completed" else "",
                "is_overdue": str(status != "completed" and due < date(2026, 11, 14)).lower()
            }
            if dependency is not None:
                task["depends_on_task_id"] = case_tasks[dependency]["task_id"]
            case_tasks.append(task)
            tasks.append(task)
        task_lookup[case["employee_id"]] = case_tasks

    assets = []
    for i in range(1, count(600) + 1):
        assigned = employees[(i - 1) % len(employees)] if i % 5 else None
        assets.append({
            "asset_id": f"AST-LAP-{i:06d}",
            "asset_tag": f"AST-LAP-{i:06d}",
            "asset_type": "Laptop" if i % 2 else "Monitor",
            "serial_number": f"SERIAL-{i:06d}",
            "status": "assigned" if assigned else "available",
            "assigned_employee_id": assigned["employee_id"] if assigned else "",
            "purchase_date": (BASE_DATE + timedelta(days=i % 200)).isoformat()
        })

    access_requests = []
    for i in range(1, count(300) + 1):
        employee = employees[(i - 1) % len(employees)]
        access_requests.append({
            "access_request_id": f"ACCREQ-2026-{i:06d}",
            "employee_id": employee["employee_id"],
            "system_name": ["Email", "HRMS", "GitHub", "VPN", "CRM"][i % 5],
            "requested_date": employee["joining_date"],
            "approval_status": "approved" if i % 4 else "pending",
            "access_status": "active" if i % 4 == 1 else "not_provisioned",
            "revoked_date": ""
        })

    approvals = [
        {"approval_id": f"APR-{i:06d}", "employee_id": e["employee_id"],
         "approval_type": "onboarding", "status": "approved" if i % 4 else "pending",
         "approver_id": managers[(i - 1) % len(managers)]["manager_id"]}
        for i, e in enumerate(employees, 1)
    ]

    offboarding = []
    for i, employee in enumerate(employees, 1):
        if employee["status"] == "terminated":
            offboarding.append({
                "offboarding_id": f"OFF-{i:06d}", "employee_id": employee["employee_id"],
                "exit_date": (date.fromisoformat(employee["joining_date"]) + timedelta(days=90)).isoformat(),
                "status": "in_progress"
            })

    audit_events = []
    for i, employee in enumerate(employees, 1):
        audit_events.append({
            "audit_id": f"AUD-{BASE_DATE.isoformat()}-{i:06d}",
            "entity_type": "Employee", "entity_id": employee["employee_id"],
            "event_type": "employee_created", "event_date": employee["joining_date"],
            "details": "Synthetic employee record generated"
        })

    # Inject labelled anomalies after creating baseline records.
    ground_truth = []

    def label(issue_type, entity_type, entity_id, expected):
        ground_truth.append({
            "issue_type": issue_type, "entity_type": entity_type,
            "entity_id": entity_id, "expected_decision": expected
        })

    if len(tasks) >= 3:
        tasks[2]["completed_date"] = tasks[0]["due_date"]
        tasks[2]["status"] = "completed"
        tasks[2]["anomaly"] = "completed_before_prerequisite"
        label("task_completed_before_prerequisite", "TaskInstance", tasks[2]["task_id"],
              "Flag dependency violation")

    if employees:
        employees[0]["manager_id"] = ""
        label("manager_missing", "Employee", employees[0]["employee_id"],
              "Flag missing manager relationship")

    if len(assets) >= 2:
        assets[1]["assigned_employee_id"] = assets[0]["assigned_employee_id"]
        assets[1]["status"] = "assigned"
        assets[1]["anomaly"] = "duplicate_asset_assignment"
        label("asset_assigned_twice", "Asset", assets[1]["asset_id"],
              "Flag duplicate employee asset assignment")

    if len(employees) >= 2:
        employees[1]["joining_date"] = (BASE_DATE - timedelta(days=1)).isoformat()
        employees[1]["background_check_status"] = "pending"
        label("start_before_background_check", "Employee", employees[1]["employee_id"],
              "Flag start before background check completion")

    terminated = next((e for e in employees if e["status"] == "terminated"), None)
    if terminated:
        access = next((a for a in access_requests if a["employee_id"] == terminated["employee_id"]), None)
        if access:
            access["access_status"] = "active"
            access["anomaly"] = "active_access_after_termination"
            label("offboarding_active_access", "AccessRequest", access["access_request_id"],
                  "Revoke access and create audit event")

    overdue = next((t for t in tasks if t["status"] != "completed"), None)
    if overdue:
        overdue["due_date"] = (date(2026, 11, 14) - timedelta(days=10)).isoformat()
        overdue["is_overdue"] = "true"
        overdue["anomaly"] = "overdue_task"
        label("overdue_task", "TaskInstance", overdue["task_id"],
              "Flag SLA breach and escalate")

    if len(employees) >= 3:
        old_department = employees[2]["department_id"]
        new_department = departments[(departments.index(next(d for d in departments if d["department_id"] == old_department)) + 1) % 8]["department_id"]
        employees[2]["previous_department_id"] = old_department
        employees[2]["department_id"] = new_department
        label("department_changed_mid_process", "Employee", employees[2]["employee_id"],
              "Preserve department change history")

    datasets = {
        "departments": departments, "roles": roles, "managers": managers,
        "employees": employees, "onboarding_cases": onboarding,
        "task_templates": templates, "task_instances": tasks,
        "assets": assets, "access_requests": access_requests,
        "approvals": approvals, "offboarding_cases": offboarding,
        "audit_events": audit_events, "ground_truth": ground_truth
    }

    for name, rows in datasets.items():
        write_csv(out, name, rows)

    # Basic integrity and reproducibility report.
    checks = {
        "employee_count": len(employees),
        "department_count": len(departments),
        "role_count": len(roles),
        "manager_count": len(managers),
        "onboarding_case_count": len(onboarding),
        "task_count": len(tasks),
        "asset_count": len(assets),
        "access_request_count": len(access_requests),
        "ground_truth_count": len(ground_truth),
        "employee_ids_unique": len({e["employee_id"] for e in employees}) == len(employees),
        "onboarding_employee_references_valid": all(c["employee_id"] in {e["employee_id"] for e in employees} for c in onboarding),
        "task_onboarding_references_valid": all(t["onboarding_id"] in {c["onboarding_id"] for c in onboarding} for t in tasks),
        "task_dependency_references_valid": all(not t["depends_on_task_id"] or any(x["task_id"] == t["depends_on_task_id"] for x in tasks) for t in tasks),
        "seed": args.seed,
        "scale": args.scale
    }
    checks["basic_integrity_passed"] = all(v for k, v in checks.items() if isinstance(v, bool))

    manifest = {}
    for path in sorted(out.glob("*.csv")):
        content = path.read_bytes()
        manifest[path.name] = {
            "sha256": hashlib.sha256(content).hexdigest(),
            "bytes": len(content)
        }

    (out / "validation_summary.json").write_text(json.dumps(checks, indent=2), encoding="utf-8")
    (out / "source_manifest.json").write_text(json.dumps(manifest, indent=2), encoding="utf-8")

    print(json.dumps(checks, indent=2))
    print(f"\nGenerated files: {out.resolve()}")


if __name__ == "__main__":
    main()

