"""
app/repositories/generated_lead.py
────────────────────────────────────
Concrete GeneratedLead repository — extends TenantRepository.
"""
from __future__ import annotations

import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.generated_lead import GeneratedLead
from app.repositories.base import TenantRepository


class GeneratedLeadRepository(TenantRepository[GeneratedLead]):
    def __init__(self, session: AsyncSession, tenant_id: str) -> None:
        super().__init__(GeneratedLead, session, tenant_id)

    async def list_for_company(
        self,
        target_company_id: uuid.UUID,
        *,
        skip: int = 0,
        limit: int = 20,
    ) -> list[GeneratedLead]:
        """Return all leads for a specific target company (within this tenant)."""
        result = await self.session.execute(
            self._base_query()
            .where(GeneratedLead.target_company_id == target_company_id)
            .offset(skip)
            .limit(limit)
        )
        return list(result.scalars().all())

    async def list_by_status(
        self,
        status: str,
        *,
        skip: int = 0,
        limit: int = 20,
    ) -> list[GeneratedLead]:
        """Filter leads by pipeline status."""
        result = await self.session.execute(
            self._base_query()
            .where(GeneratedLead.status == status)
            .offset(skip)
            .limit(limit)
        )
        return list(result.scalars().all())

    async def count_for_company(self, target_company_id: uuid.UUID) -> int:
        """Count leads generated for a specific company."""
        from sqlalchemy import func
        result = await self.session.execute(
            select(func.count()).select_from(GeneratedLead).where(
                GeneratedLead.tenant_id == self.tenant_id,
                GeneratedLead.target_company_id == target_company_id,
            )
        )
        return result.scalar_one()
