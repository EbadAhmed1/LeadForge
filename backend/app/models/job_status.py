"""
app/models/job_status.py
─────────────────────────
JobStatus — tracks the lifecycle of an async background task (arq job).

The record's `id` (UUID from TenantBase) doubles as the arq job ID via
`_job_id=str(job_status.id)` at enqueue time. This gives the client a
single token to both identify the job in PostgreSQL and optionally
inspect it directly in arq/Redis.

Status lifecycle:
  pending ──► in_progress ──► completed
                          └──► failed
"""
from __future__ import annotations

from datetime import datetime
from typing import Optional

from sqlalchemy import Column, DateTime, Integer, String
from sqlmodel import Field

from app.models.base import TenantBase


class JobStatus(TenantBase, table=True):
    __tablename__ = "job_statuses"

    # ─── Task Identity ────────────────────────────────────────────────────────
    task_name: str = Field(
        sa_column=Column(String(150), nullable=False, index=True),
        description="Registered arq function name, e.g. 'scrape_and_process_lead'.",
    )
    status: str = Field(
        default="pending",
        sa_column=Column(
            String(50), nullable=False, server_default="pending", index=True
        ),
        description="pending | in_progress | completed | failed",
    )

    # ─── Task Input ───────────────────────────────────────────────────────────
    target_url: str = Field(
        sa_column=Column(String(2048), nullable=False),
        description="The URL that was submitted for scraping/processing.",
    )

    # ─── Task Output ──────────────────────────────────────────────────────────
    result_data: Optional[str] = Field(
        default=None,
        sa_column=Column(String, nullable=True),
        description="JSON-encoded result payload from the worker.",
    )
    error_detail: Optional[str] = Field(
        default=None,
        sa_column=Column(String, nullable=True),
        description="Error message if the task failed after all retries.",
    )
    retry_count: int = Field(
        default=0,
        sa_column=Column(Integer, nullable=False, server_default="0"),
        description="Number of tenacity retries consumed before success or failure.",
    )

    # ─── Timing ───────────────────────────────────────────────────────────────
    enqueued_at: datetime = Field(
        sa_column=Column(DateTime(timezone=True), nullable=False),
        description="When the job was enqueued by the FastAPI app.",
    )
    started_at: Optional[datetime] = Field(
        default=None,
        sa_column=Column(DateTime(timezone=True), nullable=True),
        description="When the arq worker first picked up the job.",
    )
    completed_at: Optional[datetime] = Field(
        default=None,
        sa_column=Column(DateTime(timezone=True), nullable=True),
        description="When the job reached a terminal state (completed or failed).",
    )
