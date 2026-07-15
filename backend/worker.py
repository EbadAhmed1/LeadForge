"""
worker.py
──────────
Arq worker entry point.

Run with:
  arq worker.WorkerSettings          # in Docker / production
  arq worker.WorkerSettings --watch  # in development (hot-reload on code change)

This module is intentionally kept thin. All task logic lives in app/tasks/.
The worker runs as a SEPARATE PROCESS from the FastAPI web server. They share
only the Redis broker and the PostgreSQL database. No in-process state is shared.

Context dict keys populated by on_startup:
  • 'db_engine'        — AsyncEngine (disposed on shutdown)
  • 'session_factory'  — async_sessionmaker for creating DB sessions in tasks
  • 'logger'           — structlog logger bound with context
"""
from __future__ import annotations

import os
import sys

import structlog
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

# ─── Ensure the backend directory is on the Python path ─────────────────────
# When run as `arq worker.WorkerSettings` from /app (Docker working dir),
# Python needs to find the `app` package.
sys.path.insert(0, os.path.dirname(__file__))

from app.core.arq_pool import build_arq_redis_settings
from app.core.config import get_settings
from app.tasks.lead_discovery import scrape_and_process_lead  # noqa: F401

settings = get_settings()
logger = structlog.get_logger("worker")


# ─── Worker Lifecycle Hooks ───────────────────────────────────────────────────

async def on_startup(ctx: dict) -> None:
    """
    Called once when the worker process starts.
    Creates a long-lived async DB engine and session factory for the tasks.
    """
    logger.info("Worker starting", environment=settings.environment)

    # The worker uses asyncpg (same async driver as the web app) but manages
    # its own pool — no sharing with the FastAPI process.
    engine = create_async_engine(
        settings.database_url,
        echo=settings.db_echo,
        pool_size=5,          # Worker needs fewer connections than the web app
        max_overflow=5,
        pool_pre_ping=True,
        pool_recycle=1800,
    )
    session_factory = async_sessionmaker(
        bind=engine,
        expire_on_commit=False,
        autocommit=False,
        autoflush=False,
    )

    ctx["db_engine"] = engine
    ctx["session_factory"] = session_factory
    ctx["logger"] = logger

    logger.info("Worker ready — DB pool initialised")


async def on_shutdown(ctx: dict) -> None:
    """
    Called once when the worker process shuts down.
    Disposes the DB engine to release all pooled connections.
    """
    logger.info("Worker shutting down — disposing DB engine")
    engine = ctx.get("db_engine")
    if engine is not None:
        await engine.dispose()
    logger.info("Worker shutdown complete")


# ─── Worker Settings ──────────────────────────────────────────────────────────

class WorkerSettings:
    """
    Arq worker configuration.

    Arq reads this class to know which functions to register,
    how to connect to Redis, and what lifecycle hooks to call.
    """

    # ── Task Registry ────────────────────────────────────────────────────────
    # Every async function listed here becomes a callable arq job.
    # The string name used in enqueue_job() MUST match the function __name__.
    functions = [scrape_and_process_lead]

    # ── Redis ────────────────────────────────────────────────────────────────
    redis_settings = build_arq_redis_settings()

    # ── Lifecycle ────────────────────────────────────────────────────────────
    on_startup = on_startup
    on_shutdown = on_shutdown

    # ── Concurrency & Timeouts ────────────────────────────────────────────────
    max_jobs = 10                # Max concurrent jobs in this worker process
    job_timeout = 300            # Seconds before arq declares a job timed out
    keep_result = 86_400         # Keep job results in Redis for 24 h
    keep_result_forever = False

    # ── Health / Observability ───────────────────────────────────────────────
    health_check_interval = 30   # Seconds between Redis health pings
    health_check_key = "arq:worker:health"

    # ── Retry on crash ───────────────────────────────────────────────────────
    # arq-level retry: if the worker CRASHES mid-job (OOM, SIGKILL etc.),
    # arq will re-enqueue the job up to this many times.
    # This is separate from the tenacity retry inside the task.
    max_tries = 1  # No arq-level retry — tenacity handles transient errors
