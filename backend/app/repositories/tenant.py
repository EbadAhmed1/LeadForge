"""
app/repositories/tenant.py
───────────────────────────
TenantRepository (non-scoped) — Tenant is the root entity; it has no tenant_id.
"""
from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.tenant import Tenant
from app.schemas.tenant import TenantCreate, TenantUpdate


class TenantCRUDRepository:
    """
    Non-tenant-scoped repository for the Tenant model.
    This is the only repository that does NOT extend TenantRepository.
    Access should be restricted to admin / system-level operations only.
    """

    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def get_by_id(self, tenant_id: str) -> Tenant | None:
        result = await self.session.execute(
            select(Tenant).where(Tenant.id == tenant_id)
        )
        return result.scalars().first()

    async def get_by_slug(self, slug: str) -> Tenant | None:
        result = await self.session.execute(
            select(Tenant).where(Tenant.slug == slug)
        )
        return result.scalars().first()

    async def list(self, *, skip: int = 0, limit: int = 50) -> list[Tenant]:
        result = await self.session.execute(
            select(Tenant).offset(skip).limit(limit)
        )
        return list(result.scalars().all())

    async def create(self, obj_in: TenantCreate) -> Tenant:
        db_obj = Tenant(**obj_in.model_dump())
        self.session.add(db_obj)
        await self.session.flush()
        await self.session.refresh(db_obj)
        return db_obj

    async def update(self, tenant: Tenant, obj_in: TenantUpdate) -> Tenant:
        update_data = obj_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(tenant, field, value)
        self.session.add(tenant)
        await self.session.flush()
        await self.session.refresh(tenant)
        return tenant

    async def slug_exists(self, slug: str) -> bool:
        result = await self.session.execute(
            select(Tenant).where(Tenant.slug == slug)
        )
        return result.scalars().first() is not None
