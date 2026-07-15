"""
app/schemas/target_company.py
──────────────────────────────
Pydantic v2 schemas for TargetCompany.
"""
from __future__ import annotations

import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field, HttpUrl, field_validator


class TargetCompanyCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    domain: Optional[str] = Field(None, max_length=255)
    industry: Optional[str] = Field(None, max_length=150)
    employee_count_min: Optional[int] = Field(None, ge=0)
    employee_count_max: Optional[int] = Field(None, ge=0)
    annual_revenue_usd: Optional[int] = Field(None, ge=0)
    country: Optional[str] = Field(None, max_length=100)
    city: Optional[str] = Field(None, max_length=100)
    linkedin_url: Optional[str] = Field(None, max_length=512)
    description: Optional[str] = None

    @field_validator("domain")
    @classmethod
    def strip_protocol_from_domain(cls, v: Optional[str]) -> Optional[str]:
        """Normalise domain — strip https:// and trailing slashes."""
        if v:
            v = v.removeprefix("https://").removeprefix("http://").rstrip("/")
        return v


class TargetCompanyUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    domain: Optional[str] = Field(None, max_length=255)
    industry: Optional[str] = Field(None, max_length=150)
    employee_count_min: Optional[int] = Field(None, ge=0)
    employee_count_max: Optional[int] = Field(None, ge=0)
    annual_revenue_usd: Optional[int] = Field(None, ge=0)
    country: Optional[str] = Field(None, max_length=100)
    city: Optional[str] = Field(None, max_length=100)
    linkedin_url: Optional[str] = Field(None, max_length=512)
    description: Optional[str] = None
    enrichment_status: Optional[str] = Field(
        None, pattern=r"^(pending|enriched|failed)$"
    )


class TargetCompanyRead(BaseModel):
    id: uuid.UUID
    name: str
    domain: Optional[str]
    industry: Optional[str]
    employee_count_min: Optional[int]
    employee_count_max: Optional[int]
    annual_revenue_usd: Optional[int]
    country: Optional[str]
    city: Optional[str]
    linkedin_url: Optional[str]
    description: Optional[str]
    enrichment_status: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class TargetCompanyList(BaseModel):
    items: list[TargetCompanyRead]
    total: int
