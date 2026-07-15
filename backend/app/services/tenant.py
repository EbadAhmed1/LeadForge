"""
app/services/tenant.py
───────────────────────
Business logic for Tenant management.
"""
from __future__ import annotations

from fastapi import HTTPException, status

from app.models.tenant import Tenant
from app.repositories.tenant import TenantCRUDRepository
from app.schemas.tenant import TenantCreate, TenantRead, TenantUpdate


class TenantService:
    def __init__(self, repo: TenantCRUDRepository) -> None:
        self.repo = repo

    async def create_tenant(self, data: TenantCreate) -> Tenant:
        if await self.repo.slug_exists(data.slug):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Tenant with slug '{data.slug}' already exists.",
            )
        return await self.repo.create(data)

    async def get_tenant(self, tenant_id: str) -> Tenant:
        tenant = await self.repo.get_by_id(tenant_id)
        if not tenant:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Tenant not found.",
            )
        return tenant

    async def list_tenants(self, *, skip: int = 0, limit: int = 50) -> list[Tenant]:
        return await self.repo.list(skip=skip, limit=limit)

    async def update_tenant(self, tenant_id: str, data: TenantUpdate) -> Tenant:
        tenant = await self.get_tenant(tenant_id)
        return await self.repo.update(tenant, data)
