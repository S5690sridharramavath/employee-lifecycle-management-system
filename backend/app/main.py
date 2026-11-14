
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.api.routes.employees import router as employee_router
from app.api.routes.workflows import router as workflow_router
from app.api.routes.tasks import router as task_router
from app.api.routes.approvals import router as approval_router
from app.api.routes.assets import router as asset_router
from app.api.routes.access_requests import router as access_request_router

app = FastAPI(
    title=settings.app_name,
    description="Employee Onboarding and Offboarding Workflow Management System",
    version="1.0.0",
)

# Configure CORS for the React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register employee API routes
app.include_router(employee_router)
app.include_router(workflow_router)
app.include_router(task_router)
app.include_router(approval_router)
app.include_router(asset_router)
app.include_router(access_request_router)


@app.get("/")
def root():
    return {
        "message": "Welcome to the API",
        "status": "running",
        "version": "1.0.0",
    }


@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "Backend",
    }
