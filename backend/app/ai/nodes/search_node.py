"""
app/ai/nodes/search_node.py
────────────────────────────
LangGraph node: search_node

Responsibility:
  - Perform web-wide search using the Tavily Search API for the target company/domain.
  - Run multiple targeted queries across the internet to gather external intelligence:
      1. Overview, business model, products, and funding/revenue.
      2. Tech stack, active hiring, and recent news/challenges.
  - Format results into clean Markdown, apply prompt-injection sanitization,
    and return `web_search_results` into the graph state.
  - Fail gracefully (log warning and return None) if TAVILY_API_KEY is not configured,
    ensuring single-page scraping still functions seamlessly.
"""
from __future__ import annotations

import asyncio
from typing import Any
import structlog
import httpx

from app.ai.sanitizer import sanitize_scraped_text
from app.ai.state import LeadState
from app.core.config import get_settings

logger = structlog.get_logger(__name__)
settings = get_settings()

TAVILY_SEARCH_URL = "https://api.tavily.com/search"


def _extract_company_name(url: str) -> str:
    """Extract clean company name from target URL (e.g. 'https://stripe.com/about' -> 'Stripe')."""
    clean = url.replace("https://", "").replace("http://", "").replace("www.", "").split("/")[0]
    base = clean.split(".")[0]
    return base.replace("-", " ").replace("_", " ").title()


async def _execute_tavily_search(client: httpx.AsyncClient, api_key: str, query: str) -> list[dict[str, Any]]:
    """Execute a single search query against Tavily REST API."""
    payload = {
        "api_key": api_key,
        "query": query,
        "search_depth": "advanced",
        "include_answer": False,
        "max_results": 3,
    }
    try:
        response = await client.post(TAVILY_SEARCH_URL, json=payload, timeout=15.0)
        if response.status_code == 200:
            data = response.json()
            return data.get("results", [])
        else:
            logger.warning("Tavily API search non-200 response", status=response.status_code, body=response.text)
            return []
    except Exception as exc:
        logger.warning("Tavily API search request failed", query=query, error=str(exc))
        return []


async def search_node(state: LeadState) -> dict:
    """
    LangGraph node: Gather web-wide intelligence via Tavily Search API.
    """
    url = state["target_url"]
    node_logger = logger.bind(node="search_node", url=url)

    api_key = settings.tavily_api_key
    if not api_key:
        node_logger.info("TAVILY_API_KEY not configured — skipping web search phase")
        return {
            "web_search_results": None,
            "search_error": "TAVILY_API_KEY not configured",
        }

    company_name = _extract_company_name(url)
    node_logger.info("Starting web-wide Tavily search", company_name=company_name)

    queries = [
        f'"{company_name}" company overview funding revenue leadership products',
        f'"{company_name}" technology stack active hiring engineering blog news',
    ]

    try:
        async with httpx.AsyncClient() as client:
            tasks = [_execute_tavily_search(client, api_key, q) for q in queries]
            results_nested = await asyncio.gather(*tasks)

        # Flatten and deduplicate by URL
        seen_urls: set[str] = set()
        deduped_results: list[dict[str, Any]] = []

        for results in results_nested:
            for item in results:
                item_url = item.get("url")
                if item_url and item_url not in seen_urls:
                    seen_urls.add(item_url)
                    deduped_results.append(item)

        if not deduped_results:
            node_logger.warning("Tavily search returned no results")
            return {
                "web_search_results": None,
                "search_error": "No search results returned from Tavily",
            }

        # Format results as structured markdown
        lines = [f"# Web Search Intelligence for {company_name}\n"]
        for res in deduped_results:
            title = res.get("title", "Untitled")
            res_url = res.get("url", "")
            content = res.get("content", "")
            lines.append(f"### [{title}]({res_url})")
            lines.append(f"{content}\n")

        raw_search_markdown = "\n".join(lines)
        sanitized_search_markdown = sanitize_scraped_text(raw_search_markdown)

        node_logger.info(
            "Web search completed successfully",
            total_sources=len(deduped_results),
            chars=len(sanitized_search_markdown),
        )

        return {
            "web_search_results": sanitized_search_markdown,
            "search_error": None,
        }

    except Exception as exc:
        node_logger.exception("Search node encountered unexpected error", error=str(exc))
        return {
            "web_search_results": None,
            "search_error": f"Search error: {exc}",
        }
