"""
app/routers/generated_leads.py
───────────────────────────────
Generated lead management endpoints, including async lead discovery via arq.

Endpoint summary:
  POST /leads/discover          — Enqueue a scrape_and_process_lead job; returns job_id immediately.
  GET  /leads/status/{job_id}   — Poll PostgreSQL for the job's current status.
  POST /leads/                  — Manually create a lead record.
  GET  /leads/                  — List tenant-scoped leads.
  GET  /leads/{lead_id}         — Fetch a single lead.
  PATCH /leads/{lead_id}        — Update lead status / notes.
  DELETE /leads/{lead_id}       — Delete a lead.
"""
from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.dependencies.auth import get_current_user
from app.dependencies.tenant import (
    get_arq_redis,
    get_current_tenant_id,
    get_generated_lead_repo,
    get_job_status_repo,
)
from app.models.job_status import JobStatus
from app.repositories.generated_lead import GeneratedLeadRepository
from app.repositories.job_status import JobStatusRepository
from app.schemas.generated_lead import (
    GeneratedLeadCreate,
    GeneratedLeadList,
    GeneratedLeadRead,
    GeneratedLeadUpdate,
)
from app.schemas.job_status import (
    JobStatusRead,
    LeadDiscoverRequest,
    LeadDiscoverResponse,
)
from app.services.generated_lead import GeneratedLeadService

router = APIRouter(
    prefix="/leads",
    tags=["Generated Leads"],
    dependencies=[Depends(get_current_user)],
)


def _service(
    repo: GeneratedLeadRepository = Depends(get_generated_lead_repo),
) -> GeneratedLeadService:
    return GeneratedLeadService(repo)


# ═══════════════════════════════════════════════════════════════════════════════
# Lead Discovery (Async Background Task)
# ═══════════════════════════════════════════════════════════════════════════════

@router.post(
    "/discover",
    response_model=LeadDiscoverResponse,
    status_code=status.HTTP_202_ACCEPTED,
    summary="Enqueue an async lead discovery job",
    description=(
        "Submits a URL for background scraping and lead generation. "
        "Returns a `job_id` immediately (HTTP 202). "
        "Poll `GET /leads/status/{job_id}` to track progress. "
        "The actual work is performed by the arq worker process."
    ),
)
async def discover_leads(
    data: LeadDiscoverRequest,
    tenant_id: str = Depends(get_current_tenant_id),
    job_status_repo: JobStatusRepository = Depends(get_job_status_repo),
    arq_redis=Depends(get_arq_redis),
) -> LeadDiscoverResponse:
    """
    Flow:
      1. Create a JobStatus row in PostgreSQL with status='pending'.
         The row's UUID id becomes the arq job ID.
      2. Enqueue the arq job with _job_id=str(job.id) so both systems share one ID.
      3. Return {job_id, status='pending'} to the client immediately (HTTP 202).
    """
    now = datetime.now(timezone.utc)

    # ── Step 1: Persist job record BEFORE enqueuing ──────────────────────────
    # Creating first ensures we have a stable ID even if arq enqueue fails.
    from pydantic import BaseModel

    class _JobCreate(BaseModel):
        task_name: str
        status: str
        target_url: str
        enqueued_at: datetime

    job_create_data = _JobCreate(
        task_name="scrape_and_process_lead",
        status="pending",
        target_url=data.target_url,
        enqueued_at=now,
    )
    job_record: JobStatus = await job_status_repo.create(job_create_data)
    job_id_str = str(job_record.id)

    # ── Step 2: Enqueue arq job using the DB row's UUID as the arq job ID ────
    try:
        job = await arq_redis.enqueue_job(
            "scrape_and_process_lead",           # Must match function.__name__
            _job_id=job_id_str,                  # Arq job ID == DB record ID
            tenant_id=tenant_id,
            target_url=data.target_url,
            job_status_id=job_id_str,            # Passed to worker so it can update the right row
        )
    except Exception as exc:
        # Arq enqueue failed — mark the job as failed immediately so it's not orphaned
        await job_status_repo.set_failed(
            job_record.id,
            error_detail=f"Failed to enqueue job: {exc}",
            retry_count=0,
        )
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Could not enqueue the background task. Please retry.",
        )

    if job is None:
        # arq returns None if a job with this ID is already queued (dedup guard)
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"A job with id {job_id_str} is already enqueued.",
        )

    return LeadDiscoverResponse(
        job_id=job_id_str,
        status="pending",
        message=f"Job enqueued. Poll /api/v1/leads/status/{job_id_str} for updates.",
    )


@router.get(
    "/status/{job_id}",
    response_model=JobStatusRead,
    summary="Poll the status of a lead discovery job",
    description=(
        "Returns the current state of a background job from PostgreSQL. "
        "Status values: pending → in_progress → completed | failed. "
        "The `result_data` field is populated on completion."
    ),
)
async def get_job_status(
    job_id: uuid.UUID,
    job_status_repo: JobStatusRepository = Depends(get_job_status_repo),
) -> JobStatusRead:
    """
    Reads job status from PostgreSQL (not Redis), providing a durable audit trail.
    Tenant scoping is enforced automatically — tenants cannot see each other's jobs.
    """
    job = await job_status_repo.get_by_job_id(job_id)
    if job is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found. It may belong to a different tenant.",
        )
    return JobStatusRead.model_validate(job)


# ═══════════════════════════════════════════════════════════════════════════════
# Standard Lead CRUD
# ═══════════════════════════════════════════════════════════════════════════════

@router.post(
    "/",
    response_model=GeneratedLeadRead,
    status_code=status.HTTP_201_CREATED,
    summary="Manually create a lead (AI pipeline will batch-create via background tasks)",
)
async def create_lead(
    data: GeneratedLeadCreate,
    svc: GeneratedLeadService = Depends(_service),
) -> GeneratedLeadRead:
    lead = await svc.create_lead(data)
    return GeneratedLeadRead.model_validate(lead)


@router.get(
    "/",
    response_model=GeneratedLeadList,
    summary="List generated leads",
)
async def list_leads(
    skip: int = 0,
    limit: int = 20,
    status: Optional[str] = Query(
        None,
        pattern=r"^(new|contacted|qualified|disqualified|converted)$",
    ),
    target_company_id: Optional[uuid.UUID] = Query(None),
    svc: GeneratedLeadService = Depends(_service),
) -> GeneratedLeadList:
    leads = await svc.list_leads(
        skip=skip,
        limit=limit,
        status=status,
        target_company_id=target_company_id,
    )
    total = await svc.count_leads(target_company_id=target_company_id)
    return GeneratedLeadList(
        items=[GeneratedLeadRead.model_validate(lead) for lead in leads],
        total=total,
    )


@router.get(
    "/{lead_id}",
    response_model=GeneratedLeadRead,
    summary="Get a single lead",
)
async def get_lead(
    lead_id: uuid.UUID,
    svc: GeneratedLeadService = Depends(_service),
) -> GeneratedLeadRead:
    lead = await svc.get_lead(lead_id)
    return GeneratedLeadRead.model_validate(lead)


@router.patch(
    "/{lead_id}",
    response_model=GeneratedLeadRead,
    summary="Update lead status or notes",
)
async def update_lead(
    lead_id: uuid.UUID,
    data: GeneratedLeadUpdate,
    svc: GeneratedLeadService = Depends(_service),
) -> GeneratedLeadRead:
    lead = await svc.update_lead(lead_id, data)
    return GeneratedLeadRead.model_validate(lead)


@router.delete(
    "/{lead_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a lead",
)
async def delete_lead(
    lead_id: uuid.UUID,
    svc: GeneratedLeadService = Depends(_service),
) -> None:
    await svc.delete_lead(lead_id)

