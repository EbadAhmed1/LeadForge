"""
app/schemas/generated_lead.py
──────────────────────────────
Pydantic v2 schemas for GeneratedLead.
"""
from __future__ import annotations

import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field


class GeneratedLeadCreate(BaseModel):
    target_company_id: uuid.UUID
    first_name: str = Field(..., min_length=1, max_length=150)
    last_name: str = Field(..., min_length=1, max_length=150)
    email: Optional[EmailStr] = None
    phone: Optional[str] = Field(None, max_length=50)
    linkedin_url: Optional[str] = Field(None, max_length=512)
    job_title: Optional[str] = Field(None, max_length=255)
    seniority: Optional[str] = Field(None, max_length=100)
    department: Optional[str] = Field(None, max_length=100)
    notes: Optional[str] = None
    # AI fields — populated by the pipeline, optional on manual creation
    confidence_score: Optional[float] = Field(None, ge=0.0, le=1.0)
    ai_reasoning: Optional[str] = None
    source_model: Optional[str] = Field(None, max_length=100)


class GeneratedLeadUpdate(BaseModel):
    status: Optional[str] = Field(
        None,
        pattern=r"^(new|contacted|qualified|disqualified|converted)$",
    )
    email: Optional[EmailStr] = None
    phone: Optional[str] = Field(None, max_length=50)
    linkedin_url: Optional[str] = Field(None, max_length=512)
    job_title: Optional[str] = Field(None, max_length=255)
    notes: Optional[str] = None
    confidence_score: Optional[float] = Field(None, ge=0.0, le=1.0)
    ai_reasoning: Optional[str] = None


class GeneratedLeadRead(BaseModel):
    id: uuid.UUID
    target_company_id: uuid.UUID
    first_name: str
    last_name: str
    email: Optional[str]
    phone: Optional[str]
    linkedin_url: Optional[str]
    job_title: Optional[str]
    seniority: Optional[str]
    department: Optional[str]
    status: str
    confidence_score: Optional[float]
    ai_reasoning: Optional[str]
    source_model: Optional[str]
    notes: Optional[str]
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class GeneratedLeadList(BaseModel):
    items: list[GeneratedLeadRead]
    total: int
