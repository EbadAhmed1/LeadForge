"""
app/routers/tenants.py
───────────────────────
Tenant management endpoints.
⚠️  In production these should be protected by a super-admin role, not just any tenant header.
"""
from __future__ import annotations

from fastapi import APIRouter, Depends, status

from app.dependencies.tenant import get_tenant_repo
from app.repositories.tenant import TenantCRUDRepository
from app.schemas.tenant import TenantCreate, TenantList, TenantRead, TenantUpdate
from app.services.tenant import TenantService

router = APIRouter(prefix="/tenants", tags=["Tenants"])


def _service(repo: TenantCRUDRepository = Depends(get_tenant_repo)) -> TenantService:
    return TenantService(repo)


@router.post(
    "/",
    response_model=TenantRead,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new tenant (organisation)",
)
async def create_tenant(
    data: TenantCreate,
    svc: TenantService = Depends(_service),
) -> TenantRead:
    tenant = await svc.create_tenant(data)
    return TenantRead.model_validate(tenant)


@router.get(
    "/",
    response_model=TenantList,
    summary="List all tenants",
)
async def list_tenants(
    skip: int = 0,
    limit: int = 50,
    svc: TenantService = Depends(_service),
) -> TenantList:
    tenants = await svc.list_tenants(skip=skip, limit=limit)
    return TenantList(items=[TenantRead.model_validate(t) for t in tenants], total=len(tenants))


from app.dependencies.tenant import get_current_tenant_id


@router.get(
    "/current",
    response_model=TenantRead,
    summary="Get the current user's tenant",
)
async def get_current_tenant(
    tenant_id: str = Depends(get_current_tenant_id),
    svc: TenantService = Depends(_service),
) -> TenantRead:
    tenant = await svc.get_tenant(tenant_id)
    return TenantRead.model_validate(tenant)


@router.patch(
    "/current",
    response_model=TenantRead,
    summary="Update the current user's tenant",
)
async def update_current_tenant(
    data: TenantUpdate,
    tenant_id: str = Depends(get_current_tenant_id),
    svc: TenantService = Depends(_service),
) -> TenantRead:
    tenant = await svc.update_tenant(tenant_id, data)
    return TenantRead.model_validate(tenant)


@router.get(
    "/{tenant_id}",
    response_model=TenantRead,
    summary="Get a single tenant by ID",
)
async def get_tenant(
    tenant_id: str,
    svc: TenantService = Depends(_service),
) -> TenantRead:
    tenant = await svc.get_tenant(tenant_id)
    return TenantRead.model_validate(tenant)


@router.patch(
    "/{tenant_id}",
    response_model=TenantRead,
    summary="Update a tenant",
)
async def update_tenant(
    tenant_id: str,
    data: TenantUpdate,
    svc: TenantService = Depends(_service),
) -> TenantRead:
    tenant = await svc.update_tenant(tenant_id, data)
    return TenantRead.model_validate(tenant)
