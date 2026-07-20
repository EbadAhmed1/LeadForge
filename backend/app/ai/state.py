"""
app/ai/state.py
────────────────
LangGraph state definition for the lead processing pipeline.

The `LeadState` TypedDict is the single shared mutable object threaded
through every node in the graph.  Each node reads what it needs and writes
only its own output keys — this keeps nodes decoupled and individually
testable.

Field ownership:
  - tenant_id, target_url   → set externally before graph.invoke()
  - raw_scraped_text         → written by scraper_node
  - scraper_error            → written by scraper_node on failure
  - tenant_profile           → written by qualifier_node (fetched from DB)
  - is_qualified             → written by qualifier_node
  - qualification_reason     → written by qualifier_node (LLM chain-of-thought)
  - drafted_email            → written by drafter_node (None if not qualified)
  - pipeline_error           → written by any node that catches a fatal error
"""
from __future__ import annotations

from typing import Optional
from typing_extensions import TypedDict


class LeadState(TypedDict):
    # ─── Inputs (provided before graph.invoke) ───────────────────────────────
    tenant_id: str
    target_url: str

    # ─── Scraper node outputs ─────────────────────────────────────────────────
    raw_scraped_text: Optional[str]
    scraper_error: Optional[str]

    # ─── Qualifier node outputs ───────────────────────────────────────────────
    tenant_profile: Optional[dict]          # Serialised Tenant fields for the LLM prompt
    is_qualified: Optional[bool]            # True = proceed to drafting
    qualification_reason: Optional[str]     # LLM chain-of-thought explanation
    business_insights: Optional[dict]       # Extracted business insights (turnover, locations, hiring, contacts)

    # ─── Drafter node outputs ─────────────────────────────────────────────────
    drafted_email: Optional[str]            # The personalised cold email body

    # ─── Pipeline-level error ─────────────────────────────────────────────────
    pipeline_error: Optional[str]           # Set by any node to signal fatal failure


# ─── Structured LLM output schemas ───────────────────────────────────────────
# These Pydantic models are used with .with_structured_output() on LLM calls.
# They live here (not in schemas/) because they are AI-internal contracts,
# not API-facing types.

from pydantic import BaseModel, Field


class BusinessInsights(BaseModel):
    """Structured insights extracted about the target business."""

    annual_turnover: Optional[str] = Field(None, description="Annual turnover, revenue, or financial scale of the business.")
    locations: Optional[str] = Field(None, description="Geographic locations, headquarters, or regions they operate in.")
    active_hiring: Optional[str] = Field(None, description="Roles, teams, or departments they are actively hiring for.")
    dominated_sectors: Optional[str] = Field(None, description="Sectors, markets, or industries they dominate or lead in.")
    partnerships: Optional[str] = Field(None, description="Key partnerships, strategic alliances, or notable clients.")
    contact_email: Optional[str] = Field(None, description="Official contact email address(es) found on the page.")
    contact_phone: Optional[str] = Field(None, description="Official contact phone number(s) found on the page.")
    expanding_teams: Optional[str] = Field(None, description="Specific teams or divisions they are actively expanding.")


class QualificationResult(BaseModel):
    """Structured output from the qualifier_node LLM call."""

    is_qualified: bool = Field(
        description=(
            "True if the company described in the scraped text is a good "
            "prospect for the tenant based on their profile. "
            "False if it should be skipped."
        )
    )
    reason: str = Field(
        description=(
            "One or two sentences explaining the qualification decision. "
            "Be specific about which signals drove the verdict."
        )
    )
    confidence_score: float = Field(
        ge=0.0,
        le=1.0,
        description="Model's confidence in the is_qualified verdict (0.0–1.0).",
    )
    insights: BusinessInsights = Field(
        ...,
        description="Extracted key business insights from the scraped text."
    )


class DraftedEmailResult(BaseModel):
    """Structured output from the drafter_node LLM call."""

    subject_line: str = Field(
        description="Email subject line — concise, personalised, no spam triggers.",
        max_length=100,
    )
    email_body: str = Field(
        description=(
            "Full email body in plain text. "
            "Should be 3–5 short paragraphs: hook, value proposition, CTA. "
            "Maximum 200 words."
        )
    )
    tone: str = Field(
        description="Tone used: 'professional', 'conversational', or 'direct'.",
    )
