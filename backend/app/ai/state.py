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

    # ─── Search node outputs ───────────────────────────────────────────────────
    web_search_results: Optional[str]
    search_error: Optional[str]

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


from typing import Any, Optional
from typing_extensions import TypedDict
from pydantic import BaseModel, Field, field_validator


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
    
    # ── 6 New Sales Intelligence Modules ───────────────────────────────────────
    target_personas: Optional[str] = Field(None, description="Recommended decision-maker titles to target (e.g. VP Engineering, CTO).")
    linkedin_search_query: Optional[str] = Field(None, description="Ready-to-use LinkedIn Boolean search query for finding decision makers.")
    buying_triggers: Optional[str] = Field(None, description="Recent growth signals, funding, leadership hires, or compliance milestones ('Why Now?').")
    current_vendors_and_displacement: Optional[str] = Field(None, description="Identified competitor tools/vendors used & recommended displacement pitch angle.")
    conversation_starters: Optional[str] = Field(None, description="Top personalized talking hooks for cold calling or email opening.")
    objection_handling: Optional[str] = Field(None, description="Anticipated objections and strategic handles for sales reps.")
    estimated_budget_and_sales_cycle: Optional[str] = Field(None, description="Estimated annual software budget range and expected sales cycle timeframe.")
    industry_fit_score: Optional[Any] = Field("20", description="Itemized score for Industry Fit (0-25).")
    size_fit_score: Optional[Any] = Field("20", description="Itemized score for Company Size Fit (0-25).")
    tech_match_score: Optional[Any] = Field("20", description="Itemized score for Tech Stack Match (0-25).")
    growth_signal_score: Optional[Any] = Field("20", description="Itemized score for Growth Signals & Timing (0-25).")


class QualificationResult(BaseModel):
    """Structured output from the qualifier_node LLM call."""

    is_qualified: bool = Field(
        True,
        description=(
            "True if the company described in the scraped text is a good "
            "prospect for the tenant based on their profile. "
            "False if it should be skipped."
        )
    )
    reason: str = Field(
        "Evaluated company profile against Ideal Customer Profile criteria.",
        description=(
            "One or two sentences explaining the qualification decision. "
            "Be specific about which signals drove the verdict."
        )
    )
    confidence_score: Optional[Any] = Field(
        0.85,
        description="Model's confidence in the is_qualified verdict (0.0–1.0).",
    )
    insights: BusinessInsights = Field(
        default_factory=BusinessInsights,
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
