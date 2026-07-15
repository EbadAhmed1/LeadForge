"""
app/schemas/job_status.py
──────────────────────────
Pydantic v2 schemas for the JobStatus resource and lead discovery API.
"""
from __future__ import annotations

import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field, HttpUrl, field_validator


# ─── Inbound (Lead Discovery Request) ────────────────────────────────────────

class LeadDiscoverRequest(BaseModel):
    """Body for POST /api/v1/leads/discover."""

    target_url: str = Field(
        ...,
        min_length=10,
        max_length=2048,
        description="URL of the company / page to scrape and generate leads from.",
        examples=["https://techcrunch.com/2024/01/15/acme-raises-series-b/"],
    )

    @field_validator("target_url")
    @classmethod
    def url_must_have_scheme(cls, v: str) -> str:
        if not v.startswith(("http://", "https://")):
            raise ValueError("target_url must start with http:// or https://")
        return v


# ─── Outbound (Enqueue Response) ─────────────────────────────────────────────

class LeadDiscoverResponse(BaseModel):
    """Returned immediately after enqueuing — before the job runs."""

    job_id: str = Field(description="Use this UUID to poll /leads/status/{job_id}")
    status: str = Field(default="pending")
    message: str = Field(
        default="Job enqueued. Poll /leads/status/{job_id} for updates."
    )


# ─── Outbound (Job Status) ────────────────────────────────────────────────────

class JobStatusRead(BaseModel):
    """Full job status — returned by GET /api/v1/leads/status/{job_id}."""

    id: uuid.UUID
    task_name: str
    status: str
    target_url: str
    result_data: Optional[str]
    error_detail: Optional[str]
    retry_count: int
    enqueued_at: datetime
    started_at: Optional[datetime]
    completed_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
