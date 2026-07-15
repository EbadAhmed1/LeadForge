"""
app/services/generated_lead.py
───────────────────────────────
Business logic for GeneratedLead management.
"""
from __future__ import annotations

import uuid

from app.models.generated_lead import GeneratedLead
from app.repositories.generated_lead import GeneratedLeadRepository
from app.schemas.generated_lead import GeneratedLeadCreate, GeneratedLeadUpdate


class GeneratedLeadService:
    def __init__(self, repo: GeneratedLeadRepository) -> None:
        self.repo = repo

    async def create_lead(self, data: GeneratedLeadCreate) -> GeneratedLead:
        return await self.repo.create(data)

    async def get_lead(self, lead_id: uuid.UUID) -> GeneratedLead:
        return await self.repo.get_or_404(lead_id)

    async def list_leads(
        self,
        *,
        skip: int = 0,
        limit: int = 20,
        status: str | None = None,
        target_company_id: uuid.UUID | None = None,
    ) -> list[GeneratedLead]:
        if target_company_id:
            return await self.repo.list_for_company(
                target_company_id, skip=skip, limit=limit
            )
        if status:
            return await self.repo.list_by_status(status, skip=skip, limit=limit)
        return await self.repo.list(skip=skip, limit=limit)

    async def update_lead(
        self, lead_id: uuid.UUID, data: GeneratedLeadUpdate
    ) -> GeneratedLead:
        return await self.repo.update(lead_id, data)

    async def delete_lead(self, lead_id: uuid.UUID) -> None:
        await self.repo.delete(lead_id)

    async def count_leads(self, target_company_id: uuid.UUID | None = None) -> int:
        if target_company_id:
            return await self.repo.count_for_company(target_company_id)
        return await self.repo.count()
