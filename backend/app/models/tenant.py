"""
app/models/tenant.py
─────────────────────
Tenant — the top-level account/organisation entity.

This model is NOT tenant-scoped itself (it IS the tenant).
It lives outside TenantBase intentionally.
"""
from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import Column, DateTime, String
from sqlalchemy import text as sa_text
from sqlmodel import Field, SQLModel


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


class Tenant(SQLModel, table=True):
    __tablename__ = "tenants"

    id: str = Field(
        default_factory=lambda: str(uuid.uuid4()),
        primary_key=True,
        description="Tenant identifier — used as tenant_id on all child rows.",
    )
    name: str = Field(
        sa_column=Column(String(255), nullable=False),
        description="Human-readable organisation name.",
    )
    slug: str = Field(
        sa_column=Column(String(100), nullable=False, unique=True, index=True),
        description="URL-safe unique identifier for the tenant.",
    )
    is_active: bool = Field(default=True, description="Soft-disable a tenant.")
    plan: str = Field(
        default="free",
        sa_column=Column(String(50), nullable=False, server_default="free"),
        description="Subscription plan identifier.",
    )
    metadata_: Optional[str] = Field(
        default=None,
        sa_column=Column("metadata", String, nullable=True),
        description="Free-form JSON string for extensible tenant metadata.",
    )

    created_at: datetime = Field(
        default_factory=_utcnow,
        sa_column=Column(
            DateTime(timezone=True),
            nullable=False,
            server_default=sa_text("NOW()"),
        ),
    )
    updated_at: datetime = Field(
        default_factory=_utcnow,
        sa_column=Column(
            DateTime(timezone=True),
            nullable=False,
            server_default=sa_text("NOW()"),
            onupdate=_utcnow,
        ),
    )
