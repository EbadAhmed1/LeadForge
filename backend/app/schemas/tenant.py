"""
app/schemas/tenant.py
──────────────────────
Pydantic v2 request/response schemas for the Tenant resource.
Schemas never expose internal fields (e.g., raw DB ids to untrusted callers).
"""
from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field, field_validator


class TenantCreate(BaseModel):
    """Payload to create a new tenant (organisation)."""

    name: str = Field(..., min_length=2, max_length=255)
    slug: str = Field(
        ...,
        min_length=2,
        max_length=100,
        pattern=r"^[a-z0-9-]+$",
        description="Lowercase alphanumeric slug used in URLs.",
    )
    plan: str = Field(default="free", pattern=r"^(free|starter|growth|enterprise)$")

    @field_validator("slug")
    @classmethod
    def slug_must_be_lowercase(cls, v: str) -> str:
        return v.lower()


class TenantUpdate(BaseModel):
    """All fields optional — partial update (PATCH semantics)."""

    name: Optional[str] = Field(None, min_length=2, max_length=255)
    plan: Optional[str] = Field(None, pattern=r"^(free|starter|growth|enterprise)$")
    is_active: Optional[bool] = None
    metadata_: Optional[str] = Field(None, alias="metadata")

    model_config = {"populate_by_name": True}


class TenantRead(BaseModel):
    """Safe public representation of a Tenant."""

    id: str
    name: str
    slug: str
    plan: str
    is_active: bool
    metadata_: Optional[str] = Field(None, serialization_alias="metadata")
    created_at: datetime
    updated_at: datetime

    model_config = {
        "from_attributes": True,
        "populate_by_name": True,
    }


class TenantList(BaseModel):
    items: list[TenantRead]
    total: int
