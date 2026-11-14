import csv
import json
from pathlib import Path
from collections import defaultdict

folder = Path("output/full")

def load(name):
    with (folder / f"{name}.csv").open(encoding="utf-8-sig", newline="") as f:
        return list(csv.DictReader(f))

employees = load("employees")
departments = load("departments")
roles = load("roles")
managers = load("managers")
onboarding = load("onboarding_cases")
templates = load("task_templates")
tasks = load("task_instances")
assets = load("assets")
access = load("access_requests")
approvals = load("approvals")
offboarding = load("offboarding_cases")
ground_truth = load("ground_truth")

employee_ids = {e["employee_id"] for e in employees}
department_ids = {d["department_id"] for d in departments}
role_ids = {r["role_id"] for r in roles}
manager_ids = {m["manager_id"] for m in managers}
onboarding_ids = {c["onboarding_id"] for c in onboarding}
template_ids = {t["template_id"] for t in templates}
task_ids = {t["task_id"] for t in tasks}

checks = {}

checks["employee_department_fk"] = all(e["department_id"] in department_ids for e in employees)
checks["employee_role_fk"] = all(e["role_id"] in role_ids for e in employees)
checks["employee_manager_fk_or_labelled_exception"] = all(
    not e["manager_id"] or e["manager_id"] in manager_ids or
    any(g["entity_id"] == e["employee_id"] and g["issue_type"] == "manager_missing" for g in ground_truth)
    for e in employees
)
checks["onboarding_employee_fk"] = all(c["employee_id"] in employee_ids for c in onboarding)
checks["task_onboarding_fk"] = all(t["onboarding_id"] in onboarding_ids for t in tasks)
checks["task_template_fk"] = all(t["template_id"] in template_ids for t in tasks)
checks["task_dependency_fk"] = all(not t["depends_on_task_id"] or t["depends_on_task_id"] in task_ids for t in tasks)
checks["asset_employee_fk"] = all(not a["assigned_employee_id"] or a["assigned_employee_id"] in employee_ids for a in assets)
checks["access_employee_fk"] = all(a["employee_id"] in employee_ids for a in access)
checks["approval_employee_fk"] = all(a["employee_id"] in employee_ids for a in approvals)
checks["offboarding_employee_fk"] = all(o["employee_id"] in employee_ids for o in offboarding)

# Access must not be active without approval.
checks["access_approval_rule"] = all(
    a["access_status"] != "active" or a["approval_status"] == "approved"
    for a in access
)

# Every deliberate exception must have a ground-truth label.
checks["seven_anomaly_types_present"] = {
    "task_completed_before_prerequisite",
    "manager_missing",
    "asset_assigned_twice",
    "start_before_background_check",
    "offboarding_active_access",
    "overdue_task",
    "department_changed_mid_process"
}.issubset({g["issue_type"] for g in ground_truth})

# Verify task dependency graph is acyclic.
graph = defaultdict(list)
for task in tasks:
    if task["depends_on_task_id"]:
        graph[task["depends_on_task_id"]].append(task["task_id"])

visiting, visited = set(), set()
def visit(node):
    if node in visiting:
        return False
    if node in visited:
        return True
    visiting.add(node)
    for child in graph[node]:
        if not visit(child):
            return False
    visiting.remove(node)
    visited.add(node)
    return True

checks["dependency_graph_acyclic"] = all(visit(node) for node in task_ids)

# Check expected baseline row counts.
checks["required_baseline_volumes"] = (
    len(employees) == 500 and len(departments) == 8 and
    len(roles) == 12 and len(managers) == 50 and
    len(onboarding) == 500 and len(tasks) == 4000 and
    len(assets) == 600 and len(access) == 300
)

# Report known exceptions separately rather than hiding them.
terminated_ids = {e["employee_id"] for e in employees if e["status"] == "terminated"}
active_access_for_terminated = [
    a for a in access
    if a["employee_id"] in terminated_ids and a["access_status"] == "active"
]
checks["terminated_active_access_exceptions_labelled"] = all(
    any(g["entity_id"] == a["access_request_id"] and g["issue_type"] == "offboarding_active_access"
        for g in ground_truth)
    for a in active_access_for_terminated
)

result = {
    "checks": checks,
    "passed": sum(v is True for v in checks.values()),
    "total": len(checks),
    "failed_checks": [k for k, v in checks.items() if v is not True],
    "terminated_employees": len(terminated_ids),
    "offboarding_cases": len(offboarding),
    "active_access_for_terminated_employees": len(active_access_for_terminated),
    "overdue_open_tasks": sum(t["is_overdue"] == "true" and t["status"] != "completed" for t in tasks),
    "labelled_anomalies": len(ground_truth)
}

(folder / "extended_validation.json").write_text(json.dumps(result, indent=2), encoding="utf-8")
print(json.dumps(result, indent=2))
