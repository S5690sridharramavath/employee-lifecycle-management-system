# Employee Onboarding and Offboarding Workflow Management System

A full-stack employee lifecycle management system designed to streamline employee onboarding and offboarding processes, coordinate HR and IT activities, manage tasks and approvals, track company assets, and maintain an auditable record of employee lifecycle events.

The project also includes a reproducible synthetic data generation pipeline with relational data, labelled anomaly scenarios, validation checks, and CSV, JSON, and SQL exports.

## Table of Contents

- [Project Overview](#project-overview)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [System Architecture](#system-architecture)
- [Project Structure](#project-structure)
- [Database Design](#database-design)
- [Application Modules](#application-modules)
- [API Endpoints](#api-endpoints)
- [Synthetic Data Generation](#synthetic-data-generation)
- [Dataset Specifications](#dataset-specifications)
- [Anomaly Scenarios](#anomaly-scenarios)
- [Data Validation](#data-validation)
- [Reproducibility](#reproducibility)
- [Installation and Setup](#installation-and-setup)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Testing and Verification](#testing-and-verification)
- [Deliverables](#deliverables)

---

## Project Overview

Managing employee onboarding and offboarding involves multiple departments, including Human Resources, Information Technology, Facilities, and team managers.

Manual coordination can result in delayed tasks, incomplete approvals, unrevoked system access, missing company assets, and limited visibility into employee lifecycle activities.

This project provides a centralized system to manage these workflows.

The application supports:

- Employee and department management.
- Onboarding and offboarding case creation.
- Task assignment and prerequisite dependencies.
- Approval tracking.
- Company asset assignment and recovery.
- System access requests, provisioning, and revocation.
- Audit event tracking.
- Lifecycle status monitoring and reporting.

In addition to the application, a synthetic data pipeline generates realistic employee lifecycle datasets to support testing, validation, and analysis.

## Key Features

### 1. Employee Management
- Create, view, update, and delete employee records.
- Maintain employee information and employment status.
- Associate employees with departments and managers.
- Track joining and exit dates.

### 2. Onboarding Management
- Create onboarding cases for employees.
- Track onboarding activities and progress.
- Coordinate tasks across HR and IT.
- Maintain onboarding records.

### 3. Offboarding Management
- Create and process employee offboarding cases.
- Validate employee exit dates before processing.
- Revoke active system access.
- Cancel pending access requests.
- Mark assigned assets for recovery.
- Update employee lifecycle status to terminated.
- Automatically create IT follow-up tasks for access verification and asset recovery.

### 4. Task Management
- Create and manage employee lifecycle tasks.
- Assign tasks to responsible teams.
- Track pending and completed tasks.
- Define prerequisite relationships between tasks.
- Prevent completion before prerequisite tasks are completed.
- Prevent circular task dependencies.
- Record task status changes through audit events.

### 5. Approval Management
- Create and manage approval requests.
- Track approval statuses.
- Associate access requests with approvals.

### 6. Asset Management
- Register company assets.
- Assign assets to employees.
- Track asset status.
- Mark assets as pending recovery during offboarding.
- Record asset recovery.

### 7. Access Management
- Create system access requests.
- Associate access requests with approval records.
- Allow access provisioning only after approval.
- Track access grant and revocation timestamps.
- Maintain access-related audit events.

### 8. Audit Trail
- Record important employee lifecycle events.
- Track task status changes.
- Record access provisioning and revocation.
- Maintain asset recovery events.
- Preserve workflow history for traceability.

### 9. Dashboard and Reports
- View employee lifecycle information.
- Monitor workflow activity.
- Review task and approval information.
- Access application reporting views.

---

## Technology Stack

| Layer | Technologies |
|---|---|
| Frontend | React.js, Vite |
| Backend | Python, FastAPI |
| Database | PostgreSQL |
| ORM | SQLAlchemy |
| Database Migrations | Alembic |
| Data Validation | Pydantic |
| Data Generation | Python |
| Data Processing | CSV, JSON |
| API Documentation | Swagger / OpenAPI |
| Version Control | Git, GitHub |

---

## System Architecture

The application follows a frontend-backend-database architecture.

```text
                USER
                  |
                  v
          REACT FRONTEND
             (Vite)
                  |
                  | HTTP / REST API
                  v
          FASTAPI BACKEND
                  |
       +----------+----------+
       |          |          |
       v          v          v
   Employees   Workflows   Tasks
       |          |          |
       +----------+----------+
                  |
                  v
           SQLALCHEMY ORM
                  |
                  v
             POSTGRESQL
                  |
                  v
          AUDIT AND REPORTS


       SYNTHETIC DATA PIPELINE
                  |
                  v
          DATA GENERATOR
                  |
        +---------+---------+
        |         |         |
        v         v         v
       CSV       JSON      SQL
        |
        v
    VALIDATION
        |
        v
  SOURCE MANIFEST
```

---

## Project Structure

```text
employee_lifecycle_management/
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── routes/
│   │   │       ├── employees.py
│   │   │       ├── workflows.py
│   │   │       ├── tasks.py
│   │   │       ├── approvals.py
│   │   │       ├── assets.py
│   │   │       └── access_requests.py
│   │   │
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/
│   │   ├── db/
│   │   └── main.py
│   │
│   ├── migrations/
│   ├── scripts/
│   │   ├── generate_synthetic_data.py
│   │   ├── validate_dataset.py
│   │   └── export_seed_formats.py
│   │
│   ├── docs/
│   │   └── data_dictionary.md
│   │
│   ├── output/
│   │   ├── starter/
│   │   ├── full/
│   │   │   ├── json/
│   │   │   ├── *.csv
│   │   │   ├── seed.sql
│   │   │   ├── source_manifest.json
│   │   │   └── extended_validation.json
│   │   └── full_repeat/
│   │
│   ├── requirements.txt
│   └── alembic.ini
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

The structure above describes the main project organization. Additional configuration and source files may be present in individual folders.

---

## Database Design

The database uses relational entities to represent employee lifecycle information.

### Core Entities

| Entity | Purpose |
|---|---|
| Employee | Stores employee information |
| Department | Stores department details |
| Role | Defines employee roles |
| Manager | Maintains manager information |
| OnboardingCase | Tracks onboarding workflows |
| OffboardingCase | Tracks employee exits |
| Task | Stores lifecycle tasks |
| TaskTemplate | Defines reusable task templates |
| Approval | Stores approval records |
| Asset | Tracks company assets |
| AccessRequest | Manages system access |
| AuditEvent | Maintains event history |

### Relationship Overview

- An employee belongs to a department.
- An employee may have a manager.
- An employee can have onboarding and offboarding cases.
- An employee can have multiple tasks.
- A task can depend on another task.
- An employee can have multiple assigned assets.
- An employee can submit multiple access requests.
- Access requests can reference approval records.
- Audit events maintain a history of important operations.

Foreign keys and relational constraints are used to maintain data integrity.

---

## Application Modules

| Module | Main Responsibility |
|---|---|
| Employees | Employee record management |
| Onboarding | Employee joining workflows |
| Offboarding | Employee exit workflows |
| Tasks | Task assignment and dependencies |
| Approvals | Approval management |
| Assets | Asset assignment and recovery |
| Access Requests | System access lifecycle |
| Dashboard | Lifecycle overview |
| Reports | Workflow reporting |

---

## API Endpoints

The backend exposes REST APIs through FastAPI.

### Employees

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/employees/` | Create employee |
| GET | `/api/employees/` | List employees |
| GET | `/api/employees/{id}` | Get employee |
| PUT | `/api/employees/{id}` | Update employee |
| DELETE | `/api/employees/{id}` | Delete employee |

### Onboarding

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/onboarding/` | Create onboarding case |
| GET | `/api/onboarding/` | List onboarding cases |

### Offboarding

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/offboarding/` | Create offboarding case |
| GET | `/api/offboarding/` | List offboarding cases |
| POST | `/api/offboarding/{case_id}/process` | Process offboarding |

### Tasks

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/tasks/` | Create task |
| GET | `/api/tasks/` | List tasks |
| PUT | `/api/tasks/{task_id}` | Update task |

### Assets

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/assets/` | Create asset |
| GET | `/api/assets/` | List assets |
| GET | `/api/assets/{asset_id}` | Get asset |
| PUT | `/api/assets/{asset_id}` | Update asset |
| DELETE | `/api/assets/{asset_id}` | Delete asset |
| POST | `/api/assets/{asset_id}/recover` | Confirm asset recovery |

### Access Requests

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/access-requests/` | Create access request |
| GET | `/api/access-requests/` | List access requests |
| POST | `/api/access-requests/{id}/grant` | Grant approved access |
| POST | `/api/access-requests/{id}/revoke` | Revoke active access |

Approval APIs and dashboard/report APIs are also available through the backend.

---

## Synthetic Data Generation

The project includes a Python-based synthetic data generator.

It creates employee lifecycle records with configurable scale and random seed.

### Generator Command

Run from the backend directory:

```bash
python scripts/generate_synthetic_data.py --scale 1 --seed 20261022 --out output/full
```

### Starter Dataset

```bash
python scripts/generate_synthetic_data.py --scale 0.05 --seed 20261022 --out output/starter
```

### Parameters

| Parameter | Description |
|---|---|
| `--scale` | Controls dataset generation scale |
| `--seed` | Sets the random seed |
| `--out` | Defines the output directory |

Using the same seed and configuration allows the generated dataset to be reproduced.

---

## Dataset Specifications

The full dataset is designed around the following baseline volumes.

| Dataset | Expected Records |
|---|---:|
| Employees | 500 |
| Departments | 8 |
| Managers | 50 |
| Roles | 12 |
| Onboarding Cases | 500 |
| Task Instances | 4,000 |
| Assets | 600 |
| Access Requests | 300 |

The generator also produces approvals, offboarding cases, task templates, audit events, and anomaly ground-truth records.

### Generated CSV Files

- `employees.csv`
- `departments.csv`
- `managers.csv`
- `roles.csv`
- `onboarding_cases.csv`
- `offboarding_cases.csv`
- `task_templates.csv`
- `task_instances.csv`
- `assets.csv`
- `access_requests.csv`
- `approvals.csv`
- `audit_events.csv`
- `ground_truth.csv`

### JSON Exports

JSON files are generated in:

```text
output/full/json/
```

### SQL Export

The generated SQL seed file is:

```text
output/full/seed.sql
```

It provides a SQL export of the generated data in the export format produced by the export script. It should not be confused with the application's Alembic relational schema migrations.

---

## Anomaly Scenarios

The synthetic dataset includes seven anomaly scenarios for testing and validation.

| No. | Anomaly | Description |
|---|---|---|
| 1 | Task dependency violation | A task is completed before its prerequisite |
| 2 | Missing manager | An employee has no valid manager association |
| 3 | Duplicate asset assignment | An asset is assigned more than once |
| 4 | Background check violation | Employee start date precedes background check completion |
| 5 | Active access after termination | A terminated employee retains active access |
| 6 | Overdue tasks | Tasks remain open beyond their due dates |
| 7 | Department change during workflow | Employee department changes during an active lifecycle process |

The `ground_truth.csv` file contains the anomaly labels used for validation and analysis.

---

## Data Validation

The validation scripts check dataset consistency and workflow requirements.

### Run Basic Dataset Validation

```bash
python scripts/validate_dataset.py
```

### Run Extended Validation

```bash
python -c "import json; print(json.dumps(json.load(open('output/full/extended_validation.json')), indent=2))"
```

The extended validation report checks:

- Employee-to-department relationships.
- Employee-to-role relationships.
- Manager references and labelled exceptions.
- Onboarding and offboarding employee references.
- Task-to-onboarding relationships.
- Task-template references.
- Task dependency references.
- Asset-to-employee relationships.
- Access-request relationships.
- Approval relationships.
- Access approval rules.
- Presence of all seven anomaly types.
- Acyclic task dependency graphs.
- Required baseline dataset volumes.
- Labelled active-access exceptions for terminated employees.

### Validation Result

The recorded extended validation result is:

| Metric | Result |
|---|---:|
| Total checks | 16 |
| Passed checks | 16 |
| Failed checks | 0 |
| Labelled anomaly types | 7 |
| Terminated employees | 50 |
| Offboarding cases | 50 |
| Active-access exceptions | 1 |
| Overdue open tasks | 3,000 |

**Validation status: 16/16 checks passed.**

The active-access exception is intentionally labelled in the generated dataset and accepted by the corresponding validation rule.

---

## Reproducibility

The generator supports reproducibility through a fixed random seed.

Generate the full dataset:

```bash
python scripts/generate_synthetic_data.py --scale 1 --seed 20261022 --out output/full
```

Generate a second copy:

```bash
python scripts/generate_synthetic_data.py --scale 1 --seed 20261022 --out output/full_repeat
```

Compare the source manifests:

```powershell
$a = Get-Content .\output\full\source_manifest.json -Raw
$b = Get-Content .\output\full_repeat\source_manifest.json -Raw

if ($a -eq $b) {
    Write-Host "CSV MANIFESTS MATCH"
} else {
    Write-Host "CSV MANIFESTS DIFFER"
}
```

The source manifest records SHA-256 checksums and file sizes for generated CSV files.

The recorded reproducibility check returned:

```text
CSV MANIFESTS MATCH
```

---

## Installation and Setup

### Prerequisites

Install the following:

- Python 3.12
- Node.js and npm
- PostgreSQL
- Git

### 1. Clone the Repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd employee_lifecycle_management
```

### 2. Backend Setup

Navigate to the backend:

```bash
cd backend
```

Create a virtual environment:

```bash
python -m venv .venv
```

Activate it on Windows PowerShell:

```powershell
.\.venv\Scripts\Activate.ps1
```

Install dependencies:

```bash
pip install -r requirements.txt
```

### 3. Database Setup

Create a PostgreSQL database:

```sql
CREATE DATABASE employee_lifecycle_db;
```

Configure the database connection using the environment variable names and settings expected by the backend configuration.

Ensure PostgreSQL is running before starting the application.

### 4. Run Database Migrations

From the backend directory:

```bash
alembic upgrade head
```

This applies the database schema migrations.

### 5. Start the Backend

```bash
uvicorn app.main:app --reload
```

Backend URL:

```text
http://127.0.0.1:8000
```

### 6. Frontend Setup

Open a second terminal and navigate to the frontend directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open the local URL displayed by Vite, typically:

```text
http://localhost:5173
```

---

## Running the Application

Start the backend and frontend in separate terminals.

| Service | Default URL |
|---|---|
| Frontend | `http://localhost:5173` |
| Backend | `http://127.0.0.1:8000` |
| Swagger Documentation | `http://127.0.0.1:8000/docs` |
| OpenAPI Schema | `http://127.0.0.1:8000/openapi.json` |

---

## API Documentation

FastAPI automatically generates interactive API documentation.

After starting the backend, open:

```text
http://127.0.0.1:8000/docs
```

Use Swagger UI to:

- View available endpoints.
- Inspect request and response schemas.
- Execute API requests.
- Test employee lifecycle workflows.
- Verify task dependencies.
- Test access provisioning and revocation.
- Review asset operations.

---

## Testing and Verification

The project has been verified through the following checks:

- Backend model imports and database migrations.
- API endpoint availability through Swagger.
- Task prerequisite enforcement.
- Offboarding processing.
- Creation of IT follow-up tasks.
- Access and asset lifecycle operations.
- Synthetic dataset generation.
- Extended dataset validation.
- Fixed-seed reproducibility.
- CSV and SQL export generation.

### Offboarding Workflow Verification

A temporary test employee was processed through the offboarding workflow.

Recorded result:

```text
Employee Status: terminated
Offboarding Status: in_progress
Offboarding Tasks Created: 2
```

The two follow-up tasks are:

1. Verify employee system access revocation.
2. Verify company asset recovery.

Access revocation and asset recovery counts were zero in this test because no access requests or assets were assigned to the temporary test employee.

---

## Deliverables

The project includes:

1. Full-stack employee lifecycle management application.
2. FastAPI backend and React frontend.
3. PostgreSQL database models and Alembic migrations.
4. Employee onboarding and offboarding workflows.
5. Task dependency and approval management.
6. Asset and system access management.
7. Audit event tracking.
8. Synthetic data generation scripts.
9. Full and starter datasets.
10. CSV and JSON exports.
11. SQL seed export.
12. Data dictionary.
13. Anomaly ground-truth labels.
14. Dataset validation reports.
15. Source manifest with SHA-256 checksums.
16. Reproducibility verification.

---

## Conclusion

This project brings employee onboarding and offboarding activities into a centralized workflow management application.

It combines employee records, task coordination, approvals, asset tracking, access management, and audit history with a reproducible synthetic data pipeline.

The result is a practical system for managing employee lifecycle operations while supporting data integrity, workflow validation, traceability, and reproducible testing.

---

**Project:** Employee Onboarding and Offboarding Workflow Management System  
**Backend:** FastAPI  
**Frontend:** React.js  
**Database:** PostgreSQL  
**Data Pipeline:** Python, CSV, JSON, SQL
