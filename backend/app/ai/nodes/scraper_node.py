"""
app/ai/nodes/scraper_node.py
──────────────────────────────
LangGraph node: scraper_node

Responsibility:
  - "Call" the Firecrawl MCP tool to scrape raw markdown from target_url.
  - Apply sanitization / prompt-injection guardrails before the text
    reaches any LLM.
  - Write `raw_scraped_text` (on success) or `scraper_error` (on failure)
    back into the graph state.

Current implementation: MOCK (returns deterministic dummy markdown).
Production swap: Replace the body of `_call_firecrawl()` with the real
MCP Firecrawl call, e.g.:
    from mcp import Client
    async with Client("firecrawl") as mcp:
        result = await mcp.call_tool("scrape", {"url": url})
        return result.content

Why sanitize HERE (not in the LLM nodes)?
  The scraper is the trust boundary.  Any text that passes this node
  is considered "clean enough to pass to the LLM prompt".  Nodes
  downstream should not need to re-sanitize.
"""
from __future__ import annotations

import asyncio
import random
from datetime import datetime, timezone

import structlog

from app.ai.sanitizer import is_safe_url, sanitize_scraped_text
from app.ai.state import LeadState

logger = structlog.get_logger(__name__)

# ─── Mock Firecrawl content library ──────────────────────────────────────────
# Deterministic enough for testing; varied enough to exercise the qualifier.

_MOCK_MARKDOWN_TEMPLATES = [
    """# {company} | AI-Powered B2B Sales Platform

## About Us
{company} is a fast-growing Series B SaaS company helping mid-market B2B sales
teams close deals faster using AI-driven lead scoring and automated outreach.

## Our Stack & Team
- 120 employees, 40% in engineering
- Tech stack: Python, React, PostgreSQL, AWS
- Headquarters: San Francisco, CA

## Recent News
We just raised $28M Series B led by Sequoia Capital (Jan 2025).
Looking to expand our go-to-market team from 15 to 35 AEs this year.

## Pain Points (visible on their blog)
Their VP of Sales mentioned in a recent webinar: "We are drowning in unqualified
leads. Our SDRs spend 60% of their time on research instead of selling."

## Ideal customer profile signals
- Revenue: $10M–$50M ARR
- Sales team: 10–50 reps
- Currently using Salesforce CRM
""",
    """# {company} — Enterprise Data Management Solutions

## Company Overview
{company} provides on-premise data warehousing solutions for Fortune 500
manufacturing companies. Founded in 1998, they operate in a legacy market.

## Key Facts
- 500+ employees, headquarters in Detroit, MI
- Primarily serves automotive and heavy industry
- 95% of revenue from multi-year maintenance contracts on existing installs
- CEO quoted: "We have no plans to move to the cloud."

## Technology
Still running Oracle 11g and COBOL-based ETL pipelines.
No modern API infrastructure.

## Sales signals
No outbound SDR team. All sales via channel partners.
No public pricing. RFP-only procurement process.
""",
    """# {company} — Growth Marketing Agency

## What We Do
{company} is a boutique performance marketing agency specialising in
paid social and SEO for e-commerce DTC brands.

## Team
12-person agency, all remote. Founded 2021.
Average client size: $500k–$2M annual ad spend.

## Tech stack
HubSpot, Klaviyo, Google Analytics 4, Shopify.

## Recent content
Blog post: "How we scaled a skincare brand from $1M to $10M with TikTok ads."

## Signals
Hiring 2 junior account managers. Active on LinkedIn.
Posted 3 job openings in the last 30 days.
""",
]


async def _call_firecrawl(url: str) -> str:
    """
    Mock MCP Firecrawl call.

    In production, replace this with:
        async with firecrawl_mcp_client as mcp:
            result = await mcp.call_tool("scrape", {"url": url, "formats": ["markdown"]})
            return result.content[0].text

    The mock simulates realistic I/O latency (0.5–1.5 s) and returns varied
    markdown so the qualifier node exercises different code paths.
    """
    await asyncio.sleep(random.uniform(0.5, 1.5))  # simulate network I/O

    # Extract a pseudo-company name from the URL domain for variety
    domain = url.split("//")[-1].split("/")[0].replace("www.", "")
    company = domain.split(".")[0].replace("-", " ").title()

    template = random.choice(_MOCK_MARKDOWN_TEMPLATES)
    return template.format(company=company)


async def scraper_node(state: LeadState) -> dict:
    """
    LangGraph node: scrape the target URL and sanitize the output.

    Returns a partial state dict.  LangGraph merges it into the full state.
    """
    url = state["target_url"]
    node_logger = logger.bind(node="scraper_node", url=url)

    # ── Safety check: reject dangerous URL schemes before making any call ────
    if not is_safe_url(url):
        node_logger.error("Unsafe URL scheme rejected", url=url)
        return {
            "raw_scraped_text": None,
            "scraper_error": f"URL rejected by safety filter: {url}",
        }

    try:
        node_logger.info("Scraping target URL (mock Firecrawl MCP)")
        raw_markdown = await _call_firecrawl(url)

        if not raw_markdown or not raw_markdown.strip():
            node_logger.warning("Scraper returned empty content")
            return {
                "raw_scraped_text": None,
                "scraper_error": "Scraper returned empty content — no text to process.",
            }

        # ── Apply prompt injection guardrails ────────────────────────────────
        sanitized = sanitize_scraped_text(raw_markdown)

        if not sanitized.strip():
            node_logger.warning("All content stripped by sanitizer")
            return {
                "raw_scraped_text": None,
                "scraper_error": "Sanitizer removed all content — possible injection attempt.",
            }

        node_logger.info(
            "Scraping complete",
            raw_chars=len(raw_markdown),
            sanitized_chars=len(sanitized),
        )
        return {
            "raw_scraped_text": sanitized,
            "scraper_error": None,
        }

    except Exception as exc:
        node_logger.exception("Scraper node raised unexpected error", error=str(exc))
        return {
            "raw_scraped_text": None,
            "scraper_error": f"Scraper error: {exc}",
        }
