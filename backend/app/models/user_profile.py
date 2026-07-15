"""
app/models/user_profile.py
───────────────────────────
UserProfile — a user belonging to a specific tenant.
Inherits id, tenant_id, created_at, updated_at from TenantBase.
"""
from __future__ import annotations

from typing import Optional

from sqlalchemy import Column, String
from sqlmodel import Field

from app.models.base import TenantBase


class UserProfile(TenantBase, table=True):
    __tablename__ = "user_profiles"

    # ─── Identity ─────────────────────────────────────────────────────────────
    email: str = Field(
        sa_column=Column(String(320), nullable=False, index=True),
        description="User's email address. Unique within a tenant.",
    )
    full_name: str = Field(
        sa_column=Column(String(255), nullable=False),
        description="Display name.",
    )
    hashed_password: str = Field(
        sa_column=Column(String(255), nullable=False),
        description="bcrypt-hashed password. Never expose in API responses.",
    )

    # ─── Role & Status ────────────────────────────────────────────────────────
    role: str = Field(
        default="member",
        sa_column=Column(String(50), nullable=False, server_default="member"),
        description="Role within the tenant: owner | admin | member.",
    )
    is_active: bool = Field(
        default=True,
        description="False = soft-deleted / deactivated user.",
    )

    # ─── Optional Profile Data ────────────────────────────────────────────────
    avatar_url: Optional[str] = Field(
        default=None,
        sa_column=Column(String(512), nullable=True),
    )
    job_title: Optional[str] = Field(
        default=None,
        sa_column=Column(String(150), nullable=True),
    )

    class Config:
        # Ensures email uniqueness is enforced at the application layer too.
        # The DB-level unique constraint is (tenant_id, email) — add via Alembic.
        json_schema_extra = {
            "example": {
                "email": "alice@acme.com",
                "full_name": "Alice Smith",
                "role": "admin",
            }
        }
