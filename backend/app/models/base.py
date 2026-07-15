"""
app/models/base.py
───────────────────
TenantBase — the shared base class for every tenant-scoped table.

Design choices:
  • id         — UUID primary key, generated server-side (never from user input).
  • tenant_id  — Plain string (not FK-constrained at DB level yet) so it can
                 hold any opaque tenant identifier (JWT sub, Stripe ID, etc.).
                 An index is added so all tenant-scoped queries remain O(log n).
  • created_at — Immutable; set once at INSERT time.
  • updated_at — Automatically updated on every UPDATE via SQLAlchemy `onupdate`.
"""
from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, String
from sqlalchemy import text as sa_text
from sqlmodel import Field, SQLModel


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


class TenantBase(SQLModel):
    """
    Abstract base — do NOT set table=True here.
    Concrete subclasses set table=True and inherit all columns.

    NOTE: We use `sa_type` + `sa_column_kwargs` instead of `sa_column`
    because `sa_column` creates a *single* Column object that cannot be
    shared across multiple tables. `sa_column_kwargs` lets SQLModel
    construct a fresh Column for each concrete subclass.
    """

    id: uuid.UUID = Field(
        default_factory=uuid.uuid4,
        primary_key=True,
        nullable=False,
        description="Globally unique row identifier.",
    )

    tenant_id: str = Field(
        ...,
        nullable=False,
        sa_type=String,
        sa_column_kwargs={
            "index": True,
            "comment": "Tenant this row belongs to. All queries MUST filter by this.",
        },
        description="Owning tenant identifier.",
    )

    created_at: datetime = Field(
        default_factory=_utcnow,
        nullable=False,
        sa_type=DateTime(timezone=True),
        sa_column_kwargs={
            "server_default": sa_text("NOW()"),
        },
        description="UTC timestamp of row creation.",
    )

    updated_at: datetime = Field(
        default_factory=_utcnow,
        nullable=False,
        sa_type=DateTime(timezone=True),
        sa_column_kwargs={
            "server_default": sa_text("NOW()"),
            "onupdate": _utcnow,
        },
        description="UTC timestamp of last modification.",
    )
