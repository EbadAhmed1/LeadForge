"""
app/ai/nodes/qualifier_node.py
────────────────────────────────
LangGraph node: qualifier_node

Responsibility:
  - Fetch the tenant's profile from PostgreSQL (name, plan, metadata_).
  - Use an LLM with `.with_structured_output(QualificationResult)` to analyse
    whether the scraped company matches the tenant's ICP (ideal customer profile).
  - Write `is_qualified`, `qualification_reason`, and `tenant_profile` back
    into the graph state.

Structured output guarantee:
  The LLM is instructed via `with_structured_output(QualificationResult)` which
  forces the model to return a JSON object that satisfies the Pydantic schema.
  If the model fails to produce valid JSON, LangChain raises a ValidationError
  which we catch and convert to a pipeline_error.

LangSmith tracing:
  All LLM calls in this node are automatically traced when
  LANGCHAIN_TRACING_V2=true is set. The run name and tags are set via
  RunnableConfig so you can filter runs in the LangSmith UI.
"""
from __future__ import annotations

import json

import structlog
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_core.runnables import RunnableConfig
from sqlalchemy import select

from app.ai.state import LeadState, QualificationResult
from app.core.config import get_settings

logger = structlog.get_logger(__name__)
settings = get_settings()


def _build_llm():
    """
    Build the LLM client based on the configured provider.
    Supports: openai (default), anthropic.

    The chain is wrapped with `.with_structured_output(QualificationResult)`
    which injects a JSON schema into the system prompt and validates the output.
    """
    provider = settings.llm_provider.lower()

    if provider == "anthropic":
        from langchain_anthropic import ChatAnthropic
        base_llm = ChatAnthropic(
            model=settings.llm_model,
            api_key=settings.anthropic_api_key,
            temperature=0.1,  # Low temp for factual classification
            max_tokens=512,
        )
    else:
        from langchain_openai import ChatOpenAI
        base_llm = ChatOpenAI(
            model=settings.llm_model,
            api_key=settings.openai_api_key,
            temperature=0.1,
            max_tokens=512,
        )

    return base_llm.with_structured_output(QualificationResult)


# Build once at import time (not per-request) to reuse the client connection.
_qualification_chain = _build_llm()

_QUALIFIER_SYSTEM_PROMPT = """You are an expert B2B sales qualification AI.

Your task is to evaluate whether a scraped company profile is a good prospect
for a SaaS product based on the tenant's profile.

QUALIFICATION CRITERIA — score positively if:
  - Company is in the software / technology / SaaS sector
  - Company size: 50–500 employees (sweet spot)
  - Company shows growth signals (hiring, recent funding, product launches)
  - Pain points align with what the tenant offers
  - Decision makers are reachable (SDR team exists, active on LinkedIn)

Score negatively if:
  - Company is in a legacy / non-tech sector with no digital transformation signals
  - Company explicitly stated they are not buying (cost-cutting, freeze)
  - Company is too small (<10 employees) or enterprise-only (Fortune 100+)
  - No identifiable pain points that the tenant's product can address

Be concise and specific. Base your verdict ONLY on the scraped text provided.
Do not hallucinate company details not present in the text.
"""


async def qualifier_node(
    state: LeadState,
    config: RunnableConfig | None = None,
) -> dict:
    """
    LangGraph node: qualify the lead using an LLM.

    Returns a partial state dict with:
      - tenant_profile
      - is_qualified
      - qualification_reason
    Or `pipeline_error` if the LLM call fails.
    """
    node_logger = logger.bind(node="qualifier_node", tenant_id=state["tenant_id"])

    raw_text = state.get("raw_scraped_text") or ""
    if not raw_text.strip():
        node_logger.warning("No scraped text available for qualification")
        return {
            "is_qualified": False,
            "qualification_reason": "No scraped content to analyse.",
            "tenant_profile": None,
        }

    # ── Fetch tenant profile from PostgreSQL ─────────────────────────────────
    # The session_factory is injected by the arq worker's on_startup hook
    # and passed via config["configurable"]["session_factory"].
    tenant_profile_dict: dict = {}
    session_factory = (config or {}).get("configurable", {}).get("session_factory")

    if session_factory:
        try:
            from app.models.tenant import Tenant
            async with session_factory() as session:
                result = await session.execute(
                    select(Tenant).where(Tenant.id == state["tenant_id"])
                )
                tenant = result.scalars().first()
                if tenant:
                    tenant_profile_dict = {
                        "name": tenant.name,
                        "plan": tenant.plan,
                        "metadata": tenant.metadata_ or "{}",
                    }
        except Exception as exc:
            node_logger.warning("Could not fetch tenant from DB", error=str(exc))
            # Non-fatal: continue with empty profile
    else:
        node_logger.warning(
            "No session_factory in config — tenant profile will be empty. "
            "Ensure session_factory is passed via RunnableConfig in production."
        )

    tenant_summary = (
        f"Tenant: {tenant_profile_dict.get('name', 'Unknown Tenant')} "
        f"(Plan: {tenant_profile_dict.get('plan', 'unknown')})"
    )

    # ── Build the LLM prompt ─────────────────────────────────────────────────
    user_message = HumanMessage(
        content=(
            f"TENANT PROFILE:\n{tenant_summary}\n\n"
            f"SCRAPED COMPANY CONTENT:\n{raw_text}\n\n"
            "Based on the above, is this company a good prospect for the tenant? "
            "Provide your qualification decision with a specific reason."
        )
    )

    # ── Call the LLM with structured output ──────────────────────────────────
    lc_config = RunnableConfig(
        tags=["qualifier_node", f"tenant:{state['tenant_id']}"],
        metadata={"tenant_id": state["tenant_id"], "target_url": state["target_url"]},
        run_name="lead-qualification",
    )

    try:
        node_logger.info("Calling LLM for qualification")
        result: QualificationResult = await _qualification_chain.ainvoke(
            [SystemMessage(content=_QUALIFIER_SYSTEM_PROMPT), user_message],
            config=lc_config,
        )

        node_logger.info(
            "Qualification complete",
            is_qualified=result.is_qualified,
            confidence=result.confidence_score,
            reason=result.reason[:80],
        )

        return {
            "tenant_profile": tenant_profile_dict,
            "is_qualified": result.is_qualified,
            "qualification_reason": (
                f"{result.reason} (confidence: {result.confidence_score:.0%})"
            ),
        }

    except Exception as exc:
        node_logger.exception("Qualifier LLM call failed", error=str(exc))
        return {
            "tenant_profile": tenant_profile_dict,
            "is_qualified": False,
            "qualification_reason": None,
            "pipeline_error": f"Qualifier LLM error: {exc}",
        }
