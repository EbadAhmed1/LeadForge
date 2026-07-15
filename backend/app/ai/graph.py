"""
app/ai/graph.py
────────────────
The compiled LangGraph for the lead processing pipeline.

Graph topology:
  START
    │
    ▼
  scraper_node
    │
    ├── (scraper failed / empty text) ──────────────────────► END
    │
    ▼
  qualifier_node
    │
    ├── (is_qualified = False) ──────────────────────────────► END
    ├── (pipeline_error set)   ──────────────────────────────► END
    │
    ▼
  drafter_node
    │
    ▼
  END

Usage (from the arq task):
  from app.ai.graph import lead_pipeline

  final_state = await lead_pipeline.ainvoke(
      {"tenant_id": "...", "target_url": "https://..."},
      config=RunnableConfig(configurable={"session_factory": session_factory}),
  )

LangSmith tracing:
  All nodes are automatically traced when env vars are set:
    LANGCHAIN_TRACING_V2=true
    LANGCHAIN_API_KEY=<your key>
    LANGCHAIN_PROJECT=saas-lead-pipeline
  No code changes are needed — LangChain instruments automatically.
"""
from __future__ import annotations

from langgraph.graph import END, START, StateGraph

from app.ai.nodes.drafter_node import drafter_node
from app.ai.nodes.qualifier_node import qualifier_node
from app.ai.nodes.scraper_node import scraper_node
from app.ai.state import LeadState


# ─── Conditional edge routing functions ──────────────────────────────────────

def _after_scraper(state: LeadState) -> str:
    """
    Route after scraper_node:
      - If scraper failed or returned no text → END (nothing to process)
      - Otherwise → qualifier_node
    """
    if state.get("scraper_error") or not state.get("raw_scraped_text"):
        return END
    return "qualifier_node"


def _after_qualifier(state: LeadState) -> str:
    """
    Route after qualifier_node:
      - If pipeline_error is set → END (LLM failure; don't proceed)
      - If is_qualified is False → END (prospect not a fit)
      - If is_qualified is True → drafter_node
    """
    if state.get("pipeline_error"):
        return END
    if not state.get("is_qualified"):
        return END
    return "drafter_node"


# ─── Build the graph ──────────────────────────────────────────────────────────

def _build_graph() -> StateGraph:
    graph = StateGraph(LeadState)

    # ── Register nodes ────────────────────────────────────────────────────────
    graph.add_node("scraper_node", scraper_node)
    graph.add_node("qualifier_node", qualifier_node)
    graph.add_node("drafter_node", drafter_node)

    # ── Edges ─────────────────────────────────────────────────────────────────
    # START → scraper_node (unconditional)
    graph.add_edge(START, "scraper_node")

    # scraper_node → qualifier_node or END (conditional)
    graph.add_conditional_edges(
        "scraper_node",
        _after_scraper,
        {
            "qualifier_node": "qualifier_node",
            END: END,
        },
    )

    # qualifier_node → drafter_node or END (conditional)
    graph.add_conditional_edges(
        "qualifier_node",
        _after_qualifier,
        {
            "drafter_node": "drafter_node",
            END: END,
        },
    )

    # drafter_node → END (always)
    graph.add_edge("drafter_node", END)

    return graph


# ─── Compile the graph ────────────────────────────────────────────────────────
# Compiled once at module import time; shared across all arq job invocations
# within the same worker process.  Thread-safe for async invocations.
lead_pipeline = _build_graph().compile()
