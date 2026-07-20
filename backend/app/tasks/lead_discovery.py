"""
app/tasks/lead_discovery.py
─────────────────────────────
Background task: scrape_and_process_lead

Phase 3 update: This task now executes the compiled LangGraph pipeline
instead of the mock sleep. The tenacity retry wrapper is retained on the
graph invocation to handle transient LLM / network 429 errors.

Pipeline flow (inside the graph):
  scraper_node → qualifier_node → drafter_node → END
  (with conditional exits after scraper and qualifier)

The arq task is responsible for:
  1. Marking the JobStatus row as `in_progress`.
  2. Invoking lead_pipeline.ainvoke() with the LangGraph state.
  3. Persisting the final state (drafted_email, result_data, retry_count)
     into the JobStatus row.
  4. Marking the row as `completed` or `failed`.

Retry strategy (tenacity):
  • Trigger:   TooManyRequestsError — raised by scraper when rate-limited.
  • Backoff:   Exponential — 2s, 4s, 8s, 16s, 30s (capped).
  • Max tries: 5 (including the first attempt).
  • On failure after all retries: job marked `failed`, exception re-raised
    so arq records a failure in Redis as well.
"""
from __future__ import annotations

import json
import uuid
from datetime import datetime, timezone
from typing import Any

import structlog
from langchain_core.runnables import RunnableConfig
from tenacity import (
    RetryCallState,
    retry,
    retry_if_exception_type,
    stop_after_attempt,
    wait_exponential,
)

from app.ai.graph import lead_pipeline

logger = structlog.get_logger(__name__)


# ─── Custom Exception for rate-limit simulation / real 429 handling ──────────

class TooManyRequestsError(Exception):
    """
    Raised when any HTTP 429 is encountered in the pipeline.
    Tenacity will catch this and apply exponential backoff.
    """


# ─── Tenacity retry callback ──────────────────────────────────────────────────

def _log_retry(retry_state: RetryCallState) -> None:
    """Structured log before each tenacity sleep."""
    exc = retry_state.outcome.exception() if retry_state.outcome else None
    logger.warning(
        "Retrying pipeline after rate-limit",
        attempt=retry_state.attempt_number,
        wait_seconds=round(retry_state.next_action.sleep, 2),  # type: ignore[union-attr]
        error=str(exc),
    )


# ─── Graph invocation with retry ─────────────────────────────────────────────

@retry(
    retry=retry_if_exception_type(TooManyRequestsError),
    wait=wait_exponential(multiplier=1, min=2, max=30),
    stop=stop_after_attempt(5),
    reraise=True,
    before_sleep=_log_retry,
)
async def _run_graph_with_retry(
    tenant_id: str,
    target_url: str,
    session_factory: Any,
    attempt_tracker: list[int],
) -> dict[str, Any]:
    """
    Execute the LangGraph pipeline with tenacity retry on TooManyRequestsError.

    The session_factory is passed via RunnableConfig.configurable so that
    qualifier_node can fetch the Tenant record from PostgreSQL without
    holding a DB connection at import time.

    Returns the final LangGraph state dict on success.
    Raises TooManyRequestsError for tenacity to retry.
    """
    attempt_tracker[0] += 1
    attempt = attempt_tracker[0]

    task_logger = logger.bind(
        tenant_id=tenant_id,
        target_url=target_url,
        attempt=attempt,
    )
    task_logger.info("Invoking lead_pipeline")

    # Inject session_factory so qualifier_node can query PostgreSQL
    graph_config = RunnableConfig(
        configurable={"session_factory": session_factory},
        tags=[f"tenant:{tenant_id}", f"attempt:{attempt}"],
        metadata={"tenant_id": tenant_id, "target_url": target_url},
        run_name=f"lead-pipeline-attempt-{attempt}",
    )

    try:
        final_state: dict[str, Any] = await lead_pipeline.ainvoke(
            {
                "tenant_id": tenant_id,
                "target_url": target_url,
                "raw_scraped_text": None,
                "scraper_error": None,
                "tenant_profile": None,
                "is_qualified": None,
                "qualification_reason": None,
                "drafted_email": None,
                "pipeline_error": None,
            },
            config=graph_config,
        )
        task_logger.info(
            "Pipeline complete",
            is_qualified=final_state.get("is_qualified"),
            has_email=bool(final_state.get("drafted_email")),
            pipeline_error=final_state.get("pipeline_error"),
        )
        return final_state

    except TooManyRequestsError:
        raise  # Let tenacity handle it

    except Exception as exc:
        # Wrap unexpected errors so they bubble up cleanly
        task_logger.exception("Pipeline raised unexpected error", error=str(exc))
        raise RuntimeError(f"Pipeline error on attempt {attempt}: {exc}") from exc


# ─── Main arq task ────────────────────────────────────────────────────────────

async def scrape_and_process_lead(
    ctx: dict,
    *,
    tenant_id: str,
    target_url: str,
    job_status_id: str,
) -> dict[str, Any]:
    """
    Arq task entry point.

    Args:
        ctx:            Worker context (injected by arq).
                        Expected keys: 'session_factory', 'logger'.
        tenant_id:      Owning tenant.
        target_url:     URL to scrape and process.
        job_status_id:  UUID of the JobStatus row to update.

    Returns:
        A dict that arq serialises and stores in Redis as the job result.

    Raises:
        Any exception after tenacity exhausts retries.
    """
    from sqlalchemy import select
    from app.models.job_status import JobStatus

    task_logger = ctx.get("logger", logger).bind(
        task="scrape_and_process_lead",
        tenant_id=tenant_id,
        job_status_id=job_status_id,
    )
    session_factory = ctx["session_factory"]
    job_uuid = uuid.UUID(job_status_id)

    # ── 1. Mark job as in_progress ────────────────────────────────────────────
    async with session_factory() as session:
        async with session.begin():
            result = await session.execute(
                select(JobStatus).where(JobStatus.id == job_uuid)
            )
            job = result.scalars().first()
            if job:
                job.status = "in_progress"
                job.started_at = datetime.now(timezone.utc)
                session.add(job)

    task_logger.info("Job marked in_progress — invoking LangGraph pipeline")

    # ── 2. Run the LangGraph pipeline (with tenacity retry) ───────────────────
    attempt_tracker: list[int] = [0]

    try:
        final_state = await _run_graph_with_retry(
            tenant_id=tenant_id,
            target_url=target_url,
            session_factory=session_factory,
            attempt_tracker=attempt_tracker,
        )
        retry_count = attempt_tracker[0] - 1

    except (TooManyRequestsError, RuntimeError) as exc:
        # All retries exhausted or unrecoverable error
        error_msg = f"Pipeline failed after {attempt_tracker[0]} attempt(s): {exc}"
        task_logger.error("Task failed — marking as failed in DB", error=error_msg)

        async with session_factory() as session:
            async with session.begin():
                result = await session.execute(
                    select(JobStatus).where(JobStatus.id == job_uuid)
                )
                job = result.scalars().first()
                if job:
                    job.status = "failed"
                    job.error_detail = error_msg
                    job.retry_count = attempt_tracker[0] - 1
                    job.completed_at = datetime.now(timezone.utc)
                    session.add(job)

        raise

    # ── 3. Persist the pipeline results to JobStatus ──────────────────────────
    result_payload = {
        "is_qualified": final_state.get("is_qualified"),
        "qualification_reason": final_state.get("qualification_reason"),
        "business_insights": final_state.get("business_insights"),
        "drafted_email": final_state.get("drafted_email"),
        "scraper_error": final_state.get("scraper_error"),
        "pipeline_error": final_state.get("pipeline_error"),
        "target_url": target_url,
        "tenant_id": tenant_id,
    }
    result_json = json.dumps(result_payload, default=str)

    # Determine job terminal status
    # - "failed" if there's a pipeline_error OR scraper completely failed
    # - "completed" for everything else (including disqualified — that's a valid outcome)
    has_hard_error = bool(
        final_state.get("pipeline_error") and not final_state.get("is_qualified")
        and not final_state.get("raw_scraped_text")
    )
    terminal_status = "failed" if has_hard_error else "completed"

    async with session_factory() as session:
        async with session.begin():
            result = await session.execute(
                select(JobStatus).where(JobStatus.id == job_uuid)
            )
            job = result.scalars().first()
            if job:
                job.status = terminal_status
                job.result_data = result_json
                job.retry_count = retry_count
                job.completed_at = datetime.now(timezone.utc)
                # Store the drafted email directly on the job record for easy retrieval
                if final_state.get("drafted_email"):
                    # We store it in result_data (already included above)
                    pass
                session.add(job)

    task_logger.info(
        "Task complete",
        terminal_status=terminal_status,
        is_qualified=final_state.get("is_qualified"),
        has_email=bool(final_state.get("drafted_email")),
        retries_used=retry_count,
    )

    return {
        "status": terminal_status,
        "job_status_id": job_status_id,
        **result_payload,
    }
