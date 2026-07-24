"""
app/ai/nodes/drafter_node.py
──────────────────────────────
LangGraph node: drafter_node

Responsibility:
  - Only runs if qualifier_node set `is_qualified = True`.
  - Uses the LLM with `.with_structured_output(DraftedEmailResult)` to write
    a personalised cold email from the scraped company context.
  - Writes `drafted_email` (the formatted email string) back into the graph state.

Tone configuration:
  The system prompt instructs the model to write in a professional but
  conversational tone — no generic openers ("I hope this email finds you well"),
  no pushy CTAs. The goal is authenticity over volume.
"""
from __future__ import annotations

import structlog
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_core.runnables import RunnableConfig

from app.ai.state import DraftedEmailResult, LeadState
from app.core.config import get_settings

logger = structlog.get_logger(__name__)
settings = get_settings()


def _build_drafter_llm():
    """
    Build the email drafter LLM with structured output.
    Uses slightly higher temperature than the qualifier for creative writing.
    """
    provider = settings.llm_provider.lower()

    if provider == "anthropic":
        from langchain_anthropic import ChatAnthropic
        base_llm = ChatAnthropic(
            model=settings.llm_model,
            api_key=settings.anthropic_api_key,
            temperature=0.4,
            max_tokens=1024,
        )
    else:
        from langchain_openai import ChatOpenAI
        base_llm = ChatOpenAI(
            model=settings.llm_model,
            api_key=settings.openai_api_key,
            temperature=0.4,
            max_tokens=1024,
        )

    return base_llm.with_structured_output(DraftedEmailResult)


_drafter_chain = _build_drafter_llm()

_DRAFTER_SYSTEM_PROMPT = """You are an expert B2B cold email copywriter.

Write a highly personalised, concise cold email based on the company research provided.

STRICT RULES:
1. Subject line: ≤10 words, specific to the company, no clickbait.
2. Opening: Reference something SPECIFIC from the research (recent news, pain point, hiring pattern).
   NEVER start with "I hope this email finds you well" or generic openers.
3. Body: 3 short paragraphs maximum.
   - Para 1: Personalised hook tied to their specific situation.
   - Para 2: ONE concrete value proposition (not a feature list).
   - Para 3: Soft CTA — a question, not a push for a meeting.
4. Total body: 120–180 words. Shorter is always better.
5. Tone: Professional but human. Write like a peer, not a vendor.
6. Do NOT mention price, ROI guarantees, or competitor bashing.
7. Do NOT invent facts not present in the research.
"""


async def drafter_node(
    state: LeadState,
    config: RunnableConfig | None = None,
) -> dict:
    """
    LangGraph node: draft a personalised cold email.

    Only called when `is_qualified` is True (enforced by conditional edge).

    Returns a partial state dict with `drafted_email`.
    """
    node_logger = logger.bind(node="drafter_node", tenant_id=state["tenant_id"])

    raw_text = state.get("raw_scraped_text") or ""
    web_search = state.get("web_search_results") or ""
    tenant_profile = state.get("tenant_profile") or {}
    qualification_reason = state.get("qualification_reason") or ""
    is_qualified = state.get("is_qualified")
    qual_status_str = "QUALIFIED" if is_qualified else "NOT QUALIFIED"

    # ── Build prompt with all available context ───────────────────────────────
    tenant_name = tenant_profile.get("name", "Our Company")
    
    company_research = []
    if raw_text.strip():
        company_research.append(f"WEBSITE SCRAPE:\n{raw_text}")
    if web_search.strip():
        company_research.append(f"WEB SEARCH INTELLIGENCE:\n{web_search}")
    
    research_summary = "\n\n".join(company_research)

    business_insights = state.get("business_insights") or {}
    insights_str = ""
    if isinstance(business_insights, dict) and business_insights:
        parts = []
        if business_insights.get("target_personas"):
            parts.append(f"Target Personas: {business_insights['target_personas']}")
        if business_insights.get("buying_triggers"):
            parts.append(f"Buying Triggers / Growth Signals: {business_insights['buying_triggers']}")
        if business_insights.get("current_vendors_and_displacement"):
            parts.append(f"Tech Displacement Angle: {business_insights['current_vendors_and_displacement']}")
        if parts:
            insights_str = "\n".join(parts)

    context = (
        f"SENDER (our client): {tenant_name}\n"
        f"PROSPECT EVALUATION STATUS: {qual_status_str}\n"
        f"QUALIFICATION REASON / NOTES: {qualification_reason}\n"
        + (f"SALES INTELLIGENCE HIGHLIGHTS:\n{insights_str}\n\n" if insights_str else "\n")
        + f"PROSPECT RESEARCH:\n{research_summary}\n\n"
        "Write a tailored, high-converting cold email now."
    )

    user_message = HumanMessage(content=context)

    lc_config = RunnableConfig(
        tags=["drafter_node", f"tenant:{state['tenant_id']}"],
        metadata={"tenant_id": state["tenant_id"], "target_url": state["target_url"]},
        run_name="cold-email-draft",
    )

    try:
        node_logger.info("Calling LLM for email drafting")
        result: DraftedEmailResult = await _drafter_chain.ainvoke(
            [SystemMessage(content=_DRAFTER_SYSTEM_PROMPT), user_message],
            config=lc_config,
        )

        # ── Format the structured output into a single readable string ────────
        email_text = (
            f"Subject: {result.subject_line}\n"
            f"Tone: {result.tone}\n"
            f"\n"
            f"{result.email_body}"
        )

        node_logger.info(
            "Email drafted",
            subject=result.subject_line,
            tone=result.tone,
            word_count=len(result.email_body.split()),
        )

        return {"drafted_email": email_text}

    except Exception as exc:
        node_logger.exception("Drafter LLM call failed", error=str(exc))
        # Non-fatal: the job still succeeded (we got qualification + insights);
        # we just failed to draft the email. Leave drafted_email as None
        # so the frontend can display "Email drafting did not complete".
        # Do NOT set pipeline_error — qualification data is still valid.
        return {
            "drafted_email": None,
        }
