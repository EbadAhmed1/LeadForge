"""
app/repositories/target_company.py
────────────────────────────────────
Concrete TargetCompany repository — extends TenantRepository.
"""
from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.target_company import TargetCompany
from app.repositories.base import TenantRepository


class TargetCompanyRepository(TenantRepository[TargetCompany]):
    def __init__(self, session: AsyncSession, tenant_id: str) -> None:
        super().__init__(TargetCompany, session, tenant_id)

    async def get_by_domain(self, domain: str) -> TargetCompany | None:
        """Find a company by domain within the current tenant."""
        result = await self.session.execute(
            self._base_query().where(TargetCompany.domain == domain.lower())
        )
        return result.scalars().first()

    async def list_by_enrichment_status(
        self,
        status: str,
        *,
        skip: int = 0,
        limit: int = 20,
    ) -> list[TargetCompany]:
        """Filter companies by enrichment pipeline status."""
        result = await self.session.execute(
            self._base_query()
            .where(TargetCompany.enrichment_status == status)
            .offset(skip)
            .limit(limit)
        )
        return list(result.scalars().all())

    async def domain_exists(self, domain: str) -> bool:
        """Return True if a company with this domain already exists in this tenant."""
        return await self.get_by_domain(domain) is not None
