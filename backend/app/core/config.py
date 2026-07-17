"""
app/core/config.py
──────────────────
Central settings management using Pydantic v2 BaseSettings.
All values are read from environment variables (or a .env file).
"""
from __future__ import annotations

from functools import lru_cache
from typing import Literal

from pydantic import computed_field, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",  # silently ignore unknown env vars
    )

    # ─── Application ──────────────────────────────────────────────────────────
    app_name: str = "SaaS B2B API"
    app_version: str = "0.1.0"
    environment: Literal["development", "staging", "production"] = "development"
    debug: bool = False
    log_level: str = "INFO"

    # ─── Security ─────────────────────────────────────────────────────────────
    secret_key: str = "CHANGE_ME_in_production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30

    # ─── Database ─────────────────────────────────────────────────────────────
    # Async URL (asyncpg) — used by the FastAPI application at runtime
    database_url: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/saas_db"
    # Sync URL (psycopg2) — used by Alembic migration runner only
    sync_database_url: str = "postgresql+psycopg2://postgres:postgres@localhost:5432/saas_db"

    # SQLAlchemy engine options
    db_pool_size: int = 10
    db_max_overflow: int = 20
    db_pool_pre_ping: bool = True
    db_echo: bool = False  # Set True only in debug to log all SQL

    # ─── Redis ────────────────────────────────────────────────────────────────
    redis_url: str = "redis://:redispassword@localhost:6379/0"
    redis_max_connections: int = 20

    # ─── CORS ─────────────────────────────────────────────────────────────────
    allowed_origins: str = "http://localhost:3000,http://localhost:5173"

    @computed_field  # type: ignore[prop-decorator]
    @property
    def cors_origins(self) -> list[str]:
        return [o.strip() for o in self.allowed_origins.split(",") if o.strip()]

    # ─── Pagination ───────────────────────────────────────────────────────────
    default_page_size: int = 20
    max_page_size: int = 100

    # ─── LLM / AI Engine ────────────────────────────────────────────────────────────────────
    # Provider: "openai" | "anthropic"
    llm_provider: str = "openai"
    # Model name: "gpt-4o-mini" | "gpt-4o" | "claude-3-5-haiku-20241022" | etc.
    llm_model: str = "gpt-4o-mini"

    openai_api_key: str = ""     # OPENAI_API_KEY
    anthropic_api_key: str = ""  # ANTHROPIC_API_KEY

    # ─── LangSmith Tracing ─────────────────────────────────────────────────────────────────────
    # Set to "true" to enable LangSmith tracing (no code changes needed)
    langchain_tracing_v2: str = "false"
    langchain_api_key: str = ""          # LANGCHAIN_API_KEY
    langchain_project: str = "saas-lead-pipeline"  # LangSmith project name
    langchain_endpoint: str = "https://api.smith.langchain.com"

    # ─── Computed Fields ──────────────────────────────────────────────────────
    @computed_field  # type: ignore[prop-decorator]
    @property
    def is_production(self) -> bool:
        return self.environment == "production"

    @model_validator(mode="after")
    def enforce_secret_in_production(self) -> "Settings":
        if self.is_production and self.secret_key == "CHANGE_ME_in_production":
            raise ValueError("SECRET_KEY must be overridden in production.")
        return self


@lru_cache
def get_settings() -> Settings:
    """Return a cached Settings singleton. Use as a FastAPI dependency."""
    return Settings()
