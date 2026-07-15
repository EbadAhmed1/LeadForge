"""
app/routers/health.py
──────────────────────
Health check endpoint — pings both PostgreSQL and Redis.
Used by docker-compose healthcheck and load balancer probes.
"""
from __future__ import annotations

from fastapi import APIRouter, Depends, status
from redis.asyncio import Redis
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.redis import get_redis
from app.dependencies.db import get_async_session

router = APIRouter(tags=["Health"])


@router.get(
    "/health",
    status_code=status.HTTP_200_OK,
    summary="Service health check",
    description="Checks connectivity to PostgreSQL and Redis. Returns 200 if healthy.",
)
async def health_check(
    session: AsyncSession = Depends(get_async_session),
    redis: Redis = Depends(get_redis),
) -> dict:
    results: dict = {"status": "ok", "services": {}}

    # ─── PostgreSQL ───────────────────────────────────────────────────────────
    try:
        await session.execute(text("SELECT 1"))
        results["services"]["database"] = "ok"
    except Exception as exc:
        results["services"]["database"] = f"error: {exc}"
        results["status"] = "degraded"

    # ─── Redis ────────────────────────────────────────────────────────────────
    try:
        await redis.ping()
        results["services"]["redis"] = "ok"
    except Exception as exc:
        results["services"]["redis"] = f"error: {exc}"
        results["status"] = "degraded"

    return results
