"""
app/core/database.py
─────────────────────
Async SQLAlchemy 2.0 engine and session factory.
All application database I/O goes through the AsyncSession yielded here.
Alembic uses a separate synchronous engine (see alembic/env.py).
"""
from __future__ import annotations

from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

from app.core.config import get_settings

settings = get_settings()

# ─── Async Engine ─────────────────────────────────────────────────────────────
# One engine per process — shared across all requests via the session factory.
engine = create_async_engine(
    settings.database_url,
    echo=settings.db_echo,
    pool_size=settings.db_pool_size,
    max_overflow=settings.db_max_overflow,
    pool_pre_ping=settings.db_pool_pre_ping,
    # pool_recycle avoids stale connections after DB restarts
    pool_recycle=1800,
)

# ─── Session Factory ──────────────────────────────────────────────────────────
# expire_on_commit=False: prevent lazy-load errors after commit in async context
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


async def get_async_session() -> AsyncGenerator[AsyncSession, None]:
    """
    FastAPI dependency that yields a single AsyncSession per request.
    The session is automatically committed on success and rolled back on error.
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
