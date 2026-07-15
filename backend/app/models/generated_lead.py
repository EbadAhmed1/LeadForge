"""
app/models/generated_lead.py
──────────────────────────────
GeneratedLead — an individual contact/lead produced for a TargetCompany.
This is the primary output of the AI pipeline (implemented later).
"""
from __future__ import annotations

import uuid
from typing import Optional

from sqlalchemy import Column, String
from sqlmodel import Field

from app.models.base import TenantBase


class GeneratedLead(TenantBase, table=True):
    __tablename__ = "generated_leads"

    # ─── Relationship to TargetCompany ────────────────────────────────────────
    target_company_id: uuid.UUID = Field(
        sa_column=Column(String(36), nullable=False, index=True),
        description="The TargetCompany this lead was generated for.",
    )

    # ─── Contact Info ─────────────────────────────────────────────────────────
    first_name: str = Field(
        sa_column=Column(String(150), nullable=False),
    )
    last_name: str = Field(
        sa_column=Column(String(150), nullable=False),
    )
    email: Optional[str] = Field(
        default=None,
        sa_column=Column(String(320), nullable=True, index=True),
    )
    phone: Optional[str] = Field(
        default=None,
        sa_column=Column(String(50), nullable=True),
    )
    linkedin_url: Optional[str] = Field(
        default=None,
        sa_column=Column(String(512), nullable=True),
    )

    # ─── Role Info ────────────────────────────────────────────────────────────
    job_title: Optional[str] = Field(
        default=None,
        sa_column=Column(String(255), nullable=True),
    )
    seniority: Optional[str] = Field(
        default=None,
        sa_column=Column(String(100), nullable=True),
        description="e.g. C-Level, VP, Director, Manager, IC",
    )
    department: Optional[str] = Field(
        default=None,
        sa_column=Column(String(100), nullable=True),
    )

    # ─── Pipeline State ───────────────────────────────────────────────────────
    status: str = Field(
        default="new",
        sa_column=Column(
            String(50), nullable=False, server_default="new", index=True
        ),
        description="new | contacted | qualified | disqualified | converted",
    )

    # ─── AI Metadata ──────────────────────────────────────────────────────────
    confidence_score: Optional[float] = Field(
        default=None,
        description="AI model's confidence in this lead's accuracy (0.0–1.0).",
    )
    ai_reasoning: Optional[str] = Field(
        default=None,
        sa_column=Column(String, nullable=True),
        description="Chain-of-thought reasoning from the AI lead-gen model.",
    )
    source_model: Optional[str] = Field(
        default=None,
        sa_column=Column(String(100), nullable=True),
        description="Which AI model / version generated this lead.",
    )

    # ─── Notes ────────────────────────────────────────────────────────────────
    notes: Optional[str] = Field(
        default=None,
        sa_column=Column(String, nullable=True),
        description="Free-form sales rep notes.",
    )
