"""
app/models/target_company.py
──────────────────────────────
TargetCompany — a company that a tenant is prospecting / targeting for leads.
"""
from __future__ import annotations

from typing import Optional

from sqlalchemy import Column, Integer, String
from sqlmodel import Field

from app.models.base import TenantBase


class TargetCompany(TenantBase, table=True):
    __tablename__ = "target_companies"

    # ─── Basic Info ───────────────────────────────────────────────────────────
    name: str = Field(
        sa_column=Column(String(255), nullable=False, index=True),
        description="Company name.",
    )
    domain: Optional[str] = Field(
        default=None,
        sa_column=Column(String(255), nullable=True, index=True),
        description="Primary web domain, e.g. acme.com",
    )
    industry: Optional[str] = Field(
        default=None,
        sa_column=Column(String(150), nullable=True),
    )

    # ─── Firmographics ────────────────────────────────────────────────────────
    employee_count_min: Optional[int] = Field(
        default=None,
        sa_column=Column(Integer, nullable=True),
    )
    employee_count_max: Optional[int] = Field(
        default=None,
        sa_column=Column(Integer, nullable=True),
    )
    annual_revenue_usd: Optional[int] = Field(
        default=None,
        sa_column=Column(Integer, nullable=True),
        description="Approximate annual revenue in USD.",
    )

    # ─── Geography ────────────────────────────────────────────────────────────
    country: Optional[str] = Field(
        default=None,
        sa_column=Column(String(100), nullable=True),
    )
    city: Optional[str] = Field(
        default=None,
        sa_column=Column(String(100), nullable=True),
    )

    # ─── Enrichment Status ────────────────────────────────────────────────────
    enrichment_status: str = Field(
        default="pending",
        sa_column=Column(
            String(50), nullable=False, server_default="pending", index=True
        ),
        description="pending | enriched | failed",
    )
    linkedin_url: Optional[str] = Field(
        default=None,
        sa_column=Column(String(512), nullable=True),
    )
    description: Optional[str] = Field(
        default=None,
        sa_column=Column(String, nullable=True),
        description="Short company description or AI-generated summary.",
    )
