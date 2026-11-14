# Employee Lifecycle Management — Data Dictionary

All identifiers are immutable strings. Dates use ISO 8601 format (YYYY-MM-DD).

## 1. Department
| Field | Type | Required | Rule |
|---|---|---|---|
| department_id | String | Yes | Unique, DEPT-001 format |
| name | String | Yes | Required department name |
| location | String | Yes | Hyderabad, Bengaluru, Remote |

## 2. Role
| Field | Type | Required | Rule |
|---|---|---|---|
| role_id | String | Yes | Unique |
| title | String | Yes | Required role title |
| department_id | String | Yes | FK to Department |
| employment_type | String | Yes | permanent or contractor |

## 3. Manager
| Field | Type | Required | Rule |
|---|---|---|---|
| manager_id | String | Yes | Unique |
| name | String | Yes | Required |
| department_id | String | Yes | FK to Department |
| email | String | Yes | Unique email |

## 4. Employee
| Field | Type | Required | Rule |
|---|---|---|---|
| employee_id | String | Yes | Unique EMP-000001 format |
| name | String | Yes | Required |
| email | String | Yes | Unique |
| department_id | String | Yes | FK to Department |
| role_id | String | Yes | FK to Role |
| manager_id | String | Conditional | FK to Manager; missing-manager anomaly labelled |
| employment_type | String | Yes | permanent or contractor |
| work_location | String | Yes | remote, on_site or hybrid |
| joining_date | Date | Yes | ISO date |
| status | String | Yes | active or terminated |
| background_check_status | String | Optional | pending or completed |

## 5. OnboardingCase
| Field | Type | Required | Rule |
|---|---|---|---|
| onboarding_id | String | Yes | Unique ONB-YYYY-000001 |
| employee_id | String | Yes | FK to Employee |
| start_date | Date | Yes | ISO date |
| status | String | Yes | completed or in_progress |
| target_completion_date | Date | Yes | On or after start date |

## 6. TaskTemplate
| Field | Type | Required | Rule |
|---|---|---|---|
| template_id | String | Yes | Unique |
| title | String | Yes | Required task title |
| owner_role | String | Yes | HR, IT, Facilities or Manager |
| depends_on_template_id | String | Optional | FK to TaskTemplate |

## 7. TaskInstance
| Field | Type | Required | Rule |
|---|---|---|---|
| task_id | String | Yes | Unique TASK-ONB-case-step |
| onboarding_id | String | Yes | FK to OnboardingCase |
| employee_id | String | Yes | FK to Employee |
| template_id | String | Yes | FK to TaskTemplate |
| title | String | Yes | Required |
| owner | String | Yes | Responsible function |
| depends_on_task_id | String | Optional | FK to TaskInstance |
| status | String | Yes | pending or completed |
| due_date | Date | Yes | ISO date |
| completed_date | Date | Optional | Required when completed |
| is_overdue | Boolean | Yes | Derived from due date and status |

## 8. Asset
| Field | Type | Required | Rule |
|---|---|---|---|
| asset_id | String | Yes | Unique AST-LAP-000001 |
| asset_tag | String | Yes | Unique |
| asset_type | String | Yes | Laptop or Monitor |
| serial_number | String | Yes | Unique serial |
| status | String | Yes | assigned or available |
| assigned_employee_id | String | Optional | FK to Employee |
| purchase_date | Date | Yes | ISO date |

## 9. AccessRequest
| Field | Type | Required | Rule |
|---|---|---|---|
| access_request_id | String | Yes | Unique ACCREQ-YYYY-000001 |
| employee_id | String | Yes | FK to Employee |
| system_name | String | Yes | Email, HRMS, GitHub, VPN or CRM |
| requested_date | Date | Yes | ISO date |
| approval_status | String | Yes | approved or pending |
| access_status | String | Yes | active or not_provisioned |
| revoked_date | Date | Optional | Required after revocation |

## 10. Approval
| Field | Type | Required | Rule |
|---|---|---|---|
| approval_id | String | Yes | Unique |
| employee_id | String | Yes | FK to Employee |
| approval_type | String | Yes | onboarding |
| status | String | Yes | approved or pending |
| approver_id | String | Yes | FK to Manager |

## 11. AuditEvent
| Field | Type | Required | Rule |
|---|---|---|---|
| audit_id | String | Yes | Unique AUD-date-sequence |
| entity_type | String | Yes | Name of affected entity |
| entity_id | String | Yes | Reference to affected record |
| event_type | String | Yes | Event description |
| event_date | Date | Yes | ISO date |
| details | String | Yes | Event details |

## 12. OffboardingCase
| Field | Type | Required | Rule |
|---|---|---|---|
| offboarding_id | String | Yes | Unique |
| employee_id | String | Yes | FK to Employee |
| exit_date | Date | Yes | ISO date |
| status | String | Yes | in_progress or completed |

## Relationships and cardinality
- Department 1:N Employee
- Department 1:N Role
- Department 1:N Manager
- Role 1:N Employee
- Manager 1:N Employee (optional employee manager relationship)
- Employee 1:N OnboardingCase
- OnboardingCase 1:N TaskInstance
- TaskTemplate 1:N TaskInstance
- TaskInstance 0..1 prerequisite task; dependency graph must be acyclic
- Employee 1:N Asset assignments over time
- Employee 1:N AccessRequest
- Employee 1:N Approval
- Employee 1:N OffboardingCase
- Employee and AuditEvent have a polymorphic entity reference

## Generation and provenance
- Random seed: 20261022
- Generator: scripts/generate_synthetic_data.py
- Baseline volumes: 500 employees, 8 departments, 50 managers, 12 roles, 500 onboarding cases, 4,000 tasks, 600 assets and 300 access requests.
- All generated records are synthetic; no personal data is sourced from real employees.
- Known exceptions are labelled separately in ground_truth.csv.
- SHA-256 checksums are recorded in source_manifest.json.
