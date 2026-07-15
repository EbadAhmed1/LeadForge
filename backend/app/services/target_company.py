"""
app/services/target_company.py
───────────────────────────────
Business logic for TargetCompany management.
"""
from __future__ import annotations

import uuid

from fastapi import HTTPException, status

from app.models.target_company import TargetCompany
from app.repositories.target_company import TargetCompanyRepository
from app.schemas.target_company import TargetCompanyCreate, TargetCompanyUpdate


class TargetCompanyService:
    def __init__(self, repo: TargetCompanyRepository) -> None:
        self.repo = repo

    async def create_company(self, data: TargetCompanyCreate) -> TargetCompany:
        # Prevent duplicates by domain within the same tenant
        if data.domain and await self.repo.domain_exists(data.domain):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"A company with domain '{data.domain}' already exists.",
            )
        return await self.repo.create(data)

    async def get_company(self, company_id: uuid.UUID) -> TargetCompany:
        return await self.repo.get_or_404(company_id)

    async def list_companies(
        self,
        *,
        skip: int = 0,
        limit: int = 20,
        enrichment_status: str | None = None,
    ) -> list[TargetCompany]:
        if enrichment_status:
            return await self.repo.list_by_enrichment_status(
                enrichment_status, skip=skip, limit=limit
            )
        return await self.repo.list(skip=skip, limit=limit)

    async def update_company(
        self, company_id: uuid.UUID, data: TargetCompanyUpdate
    ) -> TargetCompany:
        return await self.repo.update(company_id, data)

    async def delete_company(self, company_id: uuid.UUID) -> None:
        await self.repo.delete(company_id)

    async def count_companies(self) -> int:
        return await self.repo.count()
