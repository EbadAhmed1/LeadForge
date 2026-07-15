"""
app/core/redis.py
──────────────────
Redis connection pool for caching and future Arq task queue integration.
"""
from __future__ import annotations

from collections.abc import AsyncGenerator

import redis.asyncio as aioredis
from redis.asyncio import Redis

from app.core.config import get_settings

settings = get_settings()

# ─── Connection Pool ──────────────────────────────────────────────────────────
# Shared pool — created once at startup, reused across all requests.
_redis_pool: Redis | None = None


def get_redis_pool() -> Redis:
    """Return the shared Redis connection pool (call after app startup)."""
    global _redis_pool
    if _redis_pool is None:
        _redis_pool = aioredis.from_url(
            settings.redis_url,
            encoding="utf-8",
            decode_responses=True,
            max_connections=settings.redis_max_connections,
        )
    return _redis_pool


async def close_redis_pool() -> None:
    """Close the Redis pool on application shutdown."""
    global _redis_pool
    if _redis_pool is not None:
        await _redis_pool.aclose()
        _redis_pool = None


async def get_redis() -> AsyncGenerator[Redis, None]:
    """
    FastAPI dependency that yields the shared Redis client.
    Does NOT create a new connection per request — it uses the pool.
    """
    client = get_redis_pool()
    try:
        yield client
    finally:
        pass  # Pool manages connection lifecycle; no per-request teardown needed
