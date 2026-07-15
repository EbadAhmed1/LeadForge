"""
app/dependencies/tenant.py
───────────────────────────
Tenant identity resolution — the single injection point for multi-tenancy.

Current implementation: reads `X-Tenant-ID` request header.

Future implementation (JWT):
  Replace the header read with JWT decoding:
    token = Depends(oauth2_scheme)
    payload = decode_access_token(token)
    tenant_id = payload["tenant_id"]

Because all repositories receive tenant_id via this dependency,
swapping auth strategy requires changing ONLY this file.
"""
from __future__ import annotations

from fastapi import Depends, Header, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_async_session
from app.dependencies.auth import get_current_user
from app.repositories.generated_lead import GeneratedLeadRepository
from app.repositories.job_status import JobStatusRepository
from app.repositories.target_company import TargetCompanyRepository
from app.repositories.tenant import TenantCRUDRepository
from app.repositories.user_profile import UserProfileRepository


async def get_current_tenant_id(
    current_user: dict = Depends(get_current_user),
) -> str:
    """
    Resolve and validate the current tenant identifier from the request.
    This utilizes stateless JWT validation under the hood.
    """
    return current_user["tenant_id"]


# ─── Repository Dependencies ──────────────────────────────────────────────────
# Each function wires together session + tenant_id into a concrete repository.
# Routers declare these as Depends() — they never construct repos themselves.

async def get_tenant_repo(
    session: AsyncSession = Depends(get_async_session),
) -> TenantCRUDRepository:
    return TenantCRUDRepository(session)


async def get_user_profile_repo(
    session: AsyncSession = Depends(get_async_session),
    tenant_id: str = Depends(get_current_tenant_id),
) -> UserProfileRepository:
    return UserProfileRepository(session, tenant_id)


async def get_target_company_repo(
    session: AsyncSession = Depends(get_async_session),
    tenant_id: str = Depends(get_current_tenant_id),
) -> TargetCompanyRepository:
    return TargetCompanyRepository(session, tenant_id)


async def get_generated_lead_repo(
    session: AsyncSession = Depends(get_async_session),
    tenant_id: str = Depends(get_current_tenant_id),
) -> GeneratedLeadRepository:
    return GeneratedLeadRepository(session, tenant_id)


async def get_job_status_repo(
    session: AsyncSession = Depends(get_async_session),
    tenant_id: str = Depends(get_current_tenant_id),
) -> JobStatusRepository:
    return JobStatusRepository(session, tenant_id)


async def get_arq_redis(request: Request):
    """
    Return the ArqRedis pool stored on app.state by the lifespan hook.
    Raises HTTP 503 if the pool is not yet available.
    """
    pool = getattr(request.app.state, "arq_redis", None)
    if pool is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Task queue not available — arq pool is not initialised.",
        )
    return pool
