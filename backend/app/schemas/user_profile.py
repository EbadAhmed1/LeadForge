"""
app/schemas/user_profile.py
────────────────────────────
Pydantic v2 schemas for UserProfile.
IMPORTANT: hashed_password is NEVER included in any read schema.
"""
from __future__ import annotations

import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field


class UserProfileCreate(BaseModel):
    email: EmailStr
    full_name: str = Field(..., min_length=1, max_length=255)
    password: str = Field(..., min_length=8, description="Plain-text; hashed before storage.")
    role: str = Field(default="member", pattern=r"^(owner|admin|member)$")
    job_title: Optional[str] = Field(None, max_length=150)
    avatar_url: Optional[str] = Field(None, max_length=512)


class UserProfileUpdate(BaseModel):
    full_name: Optional[str] = Field(None, min_length=1, max_length=255)
    role: Optional[str] = Field(None, pattern=r"^(owner|admin|member)$")
    job_title: Optional[str] = Field(None, max_length=150)
    avatar_url: Optional[str] = Field(None, max_length=512)
    is_active: Optional[bool] = None


class UserProfileRead(BaseModel):
    """
    Safe read schema — hashed_password is intentionally omitted.
    tenant_id is omitted too (callers already know their own tenant).
    """

    id: uuid.UUID
    email: str
    full_name: str
    role: str
    job_title: Optional[str]
    avatar_url: Optional[str]
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class UserProfileList(BaseModel):
    items: list[UserProfileRead]
    total: int
