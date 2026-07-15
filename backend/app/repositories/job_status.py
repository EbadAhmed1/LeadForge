"""
app/repositories/job_status.py
───────────────────────────────
JobStatusRepository — tenant-scoped CRUD for job tracking.

All queries are automatically filtered by tenant_id via TenantRepository.
Workers update records directly via their own DB sessions; the API only reads.
"""
from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.job_status import JobStatus
from app.repositories.base import TenantRepository


class JobStatusRepository(TenantRepository[JobStatus]):
    def __init__(self, session: AsyncSession, tenant_id: str) -> None:
        super().__init__(JobStatus, session, tenant_id)

    async def get_by_job_id(self, job_id: uuid.UUID) -> JobStatus | None:
        """
        Look up a job by its UUID (= TenantBase.id = arq job ID).
        Tenant scoping is automatically enforced via _base_query().
        """
        return await self.get(job_id)

    async def set_in_progress(
        self,
        job_id: uuid.UUID,
        *,
        session: Optional[AsyncSession] = None,
    ) -> Optional[JobStatus]:
        """
        Mark a job as in_progress and record started_at.
        Called by the worker when it first picks up the job.
        Uses the provided session if given (worker's own session).
        """
        _session = session or self.session
        result = await _session.execute(
            select(JobStatus).where(JobStatus.id == job_id)
        )
        job = result.scalars().first()
        if job is None:
            return None
        job.status = "in_progress"
        job.started_at = datetime.now(timezone.utc)
        _session.add(job)
        await _session.flush()
        await _session.refresh(job)
        return job

    async def set_completed(
        self,
        job_id: uuid.UUID,
        result_data: str,
        retry_count: int,
        *,
        session: Optional[AsyncSession] = None,
    ) -> Optional[JobStatus]:
        """Mark a job as completed with its result payload."""
        _session = session or self.session
        result = await _session.execute(
            select(JobStatus).where(JobStatus.id == job_id)
        )
        job = result.scalars().first()
        if job is None:
            return None
        job.status = "completed"
        job.result_data = result_data
        job.retry_count = retry_count
        job.completed_at = datetime.now(timezone.utc)
        _session.add(job)
        await _session.flush()
        await _session.refresh(job)
        return job

    async def set_failed(
        self,
        job_id: uuid.UUID,
        error_detail: str,
        retry_count: int,
        *,
        session: Optional[AsyncSession] = None,
    ) -> Optional[JobStatus]:
        """Mark a job as failed with the final error."""
        _session = session or self.session
        result = await _session.execute(
            select(JobStatus).where(JobStatus.id == job_id)
        )
        job = result.scalars().first()
        if job is None:
            return None
        job.status = "failed"
        job.error_detail = error_detail
        job.retry_count = retry_count
        job.completed_at = datetime.now(timezone.utc)
        _session.add(job)
        await _session.flush()
        await _session.refresh(job)
        return job
