"""
app/models/__init__.py
───────────────────────
Re-export all SQLModel table models so that:
  1. Alembic's env.py can import * from here and detect all tables.
  2. Application code has a single import location.
"""
from app.models.base import TenantBase
from app.models.generated_lead import GeneratedLead
from app.models.job_status import JobStatus
from app.models.target_company import TargetCompany
from app.models.tenant import Tenant
from app.models.user_profile import UserProfile

__all__ = [
    "TenantBase",
    "Tenant",
    "UserProfile",
    "TargetCompany",
    "GeneratedLead",
    "JobStatus",
]
