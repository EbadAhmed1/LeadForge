"""
app/core/arq_pool.py
─────────────────────
Arq Redis pool — used by FastAPI to enqueue background jobs.

This is separate from the generic redis.asyncio pool in core/redis.py.
Arq uses its own ArqRedis client with a different protocol layer
(it serialises job payloads using msgpack internally).

Architecture note:
  FastAPI process  →  core/arq_pool.py  →  Redis  ←  arq worker process
  The two processes share NO memory; Redis is the only coupling.
"""
from __future__ import annotations

from urllib.parse import urlparse

from arq.connections import ArqRedis, RedisSettings, create_pool

from app.core.config import get_settings

settings = get_settings()


def build_arq_redis_settings() -> RedisSettings:
    """
    Parse REDIS_URL (redis://:password@host:port/db) into arq's RedisSettings.

    arq does not accept a raw DSN string; it needs a RedisSettings object.
    We manually parse the URL to extract components.
    """
    parsed = urlparse(settings.redis_url)
    db_index = int(parsed.path.lstrip("/") or 0)
    return RedisSettings(
        host=parsed.hostname or "localhost",
        port=parsed.port or 6379,
        password=parsed.password or None,
        database=db_index,
    )


async def create_arq_pool() -> ArqRedis:
    """
    Create and return an arq Redis pool.
    Called once in the FastAPI lifespan on startup; stored in app.state.
    """
    return await create_pool(build_arq_redis_settings())
