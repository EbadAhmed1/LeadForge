from app.repositories.base import TenantRepository
from app.repositories.generated_lead import GeneratedLeadRepository
from app.repositories.job_status import JobStatusRepository
from app.repositories.target_company import TargetCompanyRepository
from app.repositories.tenant import TenantCRUDRepository
from app.repositories.user_profile import UserProfileRepository

__all__ = [
    "TenantRepository",
    "TenantCRUDRepository",
    "UserProfileRepository",
    "TargetCompanyRepository",
    "GeneratedLeadRepository",
    "JobStatusRepository",
]

