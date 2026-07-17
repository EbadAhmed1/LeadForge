"""
app/main.py
────────────
FastAPI application factory.
Wires together all routers, middleware, lifespan events, and error handlers.
"""
from __future__ import annotations

from contextlib import asynccontextmanager
from typing import AsyncGenerator

import structlog
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.arq_pool import create_arq_pool
from app.core.config import get_settings
from app.core.redis import close_redis_pool, get_redis_pool
from app.routers import generated_leads, health, target_companies, tenants, user_profiles

settings = get_settings()
logger = structlog.get_logger(__name__)

# ─── API Prefix ───────────────────────────────────────────────────────────────
API_V1_PREFIX = "/api/v1"


# ─── Lifespan ─────────────────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """
    Application lifespan context manager.
    Code before yield = startup. Code after yield = shutdown.
    """
    logger.info("Starting SaaS API", version=settings.app_version, env=settings.environment)

    # Warm up regular Redis connection pool (caching)
    get_redis_pool()
    logger.info("Redis pool initialised")

    # Create arq Redis pool for background task enqueueing
    app.state.arq_redis = await create_arq_pool()
    logger.info("Arq task queue pool initialised")

    yield

    # Graceful shutdown
    await close_redis_pool()
    if hasattr(app.state, "arq_redis") and app.state.arq_redis:
        await app.state.arq_redis.close()
    logger.info("All connection pools closed")


# ─── App Factory ──────────────────────────────────────────────────────────────
def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.app_name,
        version=settings.app_version,
        description=(
            "B2B SaaS API — production-ready FastAPI skeleton with strict "
            "row-level multi-tenancy, PostgreSQL, Redis, and async background "
            "task processing via arq."
        ),
        docs_url=f"{API_V1_PREFIX}/docs" if not settings.is_production else None,
        redoc_url=f"{API_V1_PREFIX}/redoc" if not settings.is_production else None,
        openapi_url=f"{API_V1_PREFIX}/openapi.json" if not settings.is_production else None,
        lifespan=lifespan,
    )

    # ─── CORS ─────────────────────────────────────────────────────────────────
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # ─── Global Exception Handler ─────────────────────────────────────────────
    @app.exception_handler(Exception)
    async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
        logger.error(
            "Unhandled exception",
            path=str(request.url),
            method=request.method,
            error=str(exc),
            exc_info=True,
        )
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"detail": "An unexpected error occurred. Please try again later."},
        )

    # ─── Routers ──────────────────────────────────────────────────────────────
    app.include_router(health.router, prefix=API_V1_PREFIX)
    app.include_router(tenants.router, prefix=API_V1_PREFIX)
    app.include_router(user_profiles.router, prefix=API_V1_PREFIX)
    app.include_router(target_companies.router, prefix=API_V1_PREFIX)
    app.include_router(generated_leads.router, prefix=API_V1_PREFIX)

    return app


# ─── WSGI/ASGI entrypoint ────────────────────────────────────────────────────
app = create_app()
