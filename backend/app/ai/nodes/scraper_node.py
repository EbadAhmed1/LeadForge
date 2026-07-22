"""
app/ai/nodes/scraper_node.py
──────────────────────────────
LangGraph node: scraper_node

Responsibility:
  - Call the real Firecrawl API to scrape raw markdown AND extract structured
    company intelligence from the target_url.
  - Apply sanitization / prompt-injection guardrails before the text
    reaches any LLM.
  - Write `raw_scraped_text` (on success) or `scraper_error` (on failure)
    back into the graph state.

Firecrawl integration:
  Uses `firecrawl-py` SDK (AsyncFirecrawlApp).
  Two-pass approach:
    1. Structured extract  — Firecrawl's LLM extracts a company intelligence
                             schema directly from the page content.
    2. Markdown fallback   — If extraction fails or returns empty, we fall back
                             to a plain markdown scrape so the qualifier LLM
                             still has something to work with.

  The structured extract result is formatted into a rich markdown report
  that feeds directly into the qualifier node's context window.

Rate-limit handling:
  HTTP 429 responses from Firecrawl are re-raised as TooManyRequestsError
  so tenacity (in lead_discovery.py) can apply exponential backoff + retry.

Environment variable required:
  FIRECRAWL_API_KEY=fc-your-key-here   (set in .env or server environment)
"""
from __future__ import annotations

import structlog

from app.ai.sanitizer import is_safe_url, sanitize_scraped_text
from app.ai.state import LeadState
from app.core.config import get_settings
from app.tasks.lead_discovery import TooManyRequestsError

logger = structlog.get_logger(__name__)
settings = get_settings()

# ─── Firecrawl extraction schema ─────────────────────────────────────────────
# These are the fields we ask Firecrawl's LLM extractor to pull from the page.
# Firecrawl uses this schema + a prompt to intelligently extract from any site.

_EXTRACT_SCHEMA = {
    "type": "object",
    "properties": {
        "company_name": {
            "type": "string",
            "description": "Official name of the company",
        },
        "company_overview": {
            "type": "string",
            "description": (
                "A concise overview of what the company does, their core product "
                "or service, and the market they serve."
            ),
        },
        "headquarters": {
            "type": "string",
            "description": "City and country where the company is headquartered.",
        },
        "office_locations": {
            "type": "array",
            "items": {"type": "string"},
            "description": "All known office or regional hub locations worldwide.",
        },
        "expansion_plans": {
            "type": "string",
            "description": (
                "Any stated expansion plans, new markets they are entering, "
                "or geographies they are growing into."
            ),
        },
        "domains_and_industries": {
            "type": "array",
            "items": {"type": "string"},
            "description": (
                "The industries, verticals, or business domains the company "
                "operates in or targets as customers."
            ),
        },
        "interests_and_focus_areas": {
            "type": "string",
            "description": (
                "Key strategic interests, technology bets, or focus areas "
                "the company has publicly stated."
            ),
        },
        "active_hiring": {
            "type": "array",
            "items": {"type": "string"},
            "description": (
                "List of professions, job titles, or departments the company "
                "is currently hiring for."
            ),
        },
        "pain_points_and_challenges": {
            "type": "string",
            "description": (
                "Publicly stated challenges, operational bottlenecks, or pain "
                "points the company is facing or has mentioned in interviews, "
                "blog posts, or press releases."
            ),
        },
        "founder_and_leadership": {
            "type": "string",
            "description": (
                "Name(s) of the founder(s), CEO, or key executives. Include "
                "their role and any notable background if mentioned."
            ),
        },
        "annual_revenue_or_turnover": {
            "type": "string",
            "description": (
                "Annual revenue, ARR, or turnover if publicly disclosed "
                "or mentioned in press releases / reports."
            ),
        },
        "funding_and_investors": {
            "type": "string",
            "description": (
                "Funding rounds, total capital raised, valuation, and key "
                "investors if publicly available."
            ),
        },
        "key_partnerships_and_clients": {
            "type": "array",
            "items": {"type": "string"},
            "description": (
                "Notable technology partners, strategic alliances, or "
                "publicly named enterprise clients."
            ),
        },
        "technology_stack": {
            "type": "array",
            "items": {"type": "string"},
            "description": (
                "Technologies, platforms, programming languages, or tools "
                "the company uses or builds on."
            ),
        },
        "employee_count": {
            "type": "string",
            "description": "Approximate headcount or team size if mentioned.",
        },
        "contact_email": {
            "type": "string",
            "description": "Official contact or sales email address if listed on the site.",
        },
        "contact_phone": {
            "type": "string",
            "description": "Official phone number if listed on the site.",
        },
        "recent_news_or_milestones": {
            "type": "string",
            "description": (
                "Recent company news, product launches, awards, or milestones "
                "mentioned on the site."
            ),
        },
    },
    "required": ["company_name", "company_overview"],
}

_EXTRACT_PROMPT = (
    "Extract comprehensive company intelligence from this website. "
    "Focus on: what the company does, where they are located, where they are expanding, "
    "which industries they serve, what professions they are currently hiring for, "
    "their leadership and founders, annual revenue or funding, key partnerships, "
    "and any pain points or challenges they have publicly discussed. "
    "Only include information that is explicitly stated on the page — do NOT guess or hallucinate values."
)


# ─── Helpers ─────────────────────────────────────────────────────────────────

def _format_extracted_data(data: dict) -> str:
    """
    Convert a structured Firecrawl extraction dict into a rich markdown string
    suitable for consumption by the qualifier LLM.
    """
    lines: list[str] = []

    def _section(title: str, value) -> None:
        if not value:
            return
        lines.append(f"\n## {title}")
        if isinstance(value, list):
            for item in value:
                if item:
                    lines.append(f"- {item}")
        else:
            lines.append(str(value))

    company = data.get("company_name", "Unknown Company")
    lines.append(f"# {company} — Company Intelligence Report")

    _section("Company Overview", data.get("company_overview"))
    _section("Headquarters", data.get("headquarters"))
    _section("Office Locations", data.get("office_locations"))
    _section("Expansion Plans & New Markets", data.get("expansion_plans"))
    _section("Industries & Domains", data.get("domains_and_industries"))
    _section("Strategic Interests & Focus Areas", data.get("interests_and_focus_areas"))
    _section("Active Hiring (Current Open Roles)", data.get("active_hiring"))
    _section("Pain Points & Challenges", data.get("pain_points_and_challenges"))
    _section("Leadership & Founders", data.get("founder_and_leadership"))
    _section("Annual Revenue / Turnover", data.get("annual_revenue_or_turnover"))
    _section("Funding & Investors", data.get("funding_and_investors"))
    _section("Key Partnerships & Clients", data.get("key_partnerships_and_clients"))
    _section("Technology Stack", data.get("technology_stack"))
    _section("Employee Count", data.get("employee_count"))
    _section("Recent News & Milestones", data.get("recent_news_or_milestones"))

    contact_parts = []
    if data.get("contact_email"):
        contact_parts.append(f"Email: {data['contact_email']}")
    if data.get("contact_phone"):
        contact_parts.append(f"Phone: {data['contact_phone']}")
    if contact_parts:
        lines.append("\n## Contact Information")
        for part in contact_parts:
            lines.append(f"- {part}")

    return "\n".join(lines)


# ─── Real Firecrawl call ─────────────────────────────────────────────────────

async def _call_firecrawl(url: str) -> str:
    """
    Call the real Firecrawl API to scrape and extract company intelligence.

    Strategy:
      1. Try structured extraction first (Firecrawl LLM extracts the schema).
      2. If extraction returns empty / fails, fall back to plain markdown scrape.

    Raises:
      TooManyRequestsError  — on HTTP 429 (tenacity will retry with backoff)
      RuntimeError          — on any other unrecoverable Firecrawl error
    """
    from firecrawl import AsyncFirecrawlApp  # type: ignore[import]

    api_key = settings.firecrawl_api_key
    if not api_key:
        raise RuntimeError(
            "FIRECRAWL_API_KEY is not set. "
            "Add it to your .env file or server environment variables."
        )

    app = AsyncFirecrawlApp(api_key=api_key)

    node_logger = logger.bind(url=url)

    # ── Pass 1: Structured extract ────────────────────────────────────────────
    try:
        node_logger.info("Calling Firecrawl structured extract")
        extract_result = await app.async_scrape_url(
            url,
            params={
                "formats": ["extract"],
                "extract": {
                    "schema": _EXTRACT_SCHEMA,
                    "prompt": _EXTRACT_PROMPT,
                },
                "timeout": 30000,  # 30s timeout
            },
        )

        extracted = {}
        if hasattr(extract_result, "extract") and extract_result.extract:
            extracted = extract_result.extract
        elif isinstance(extract_result, dict):
            extracted = extract_result.get("extract") or {}

        if extracted and extracted.get("company_name"):
            node_logger.info(
                "Structured extraction succeeded",
                company=extracted.get("company_name"),
                fields_populated=sum(1 for v in extracted.values() if v),
            )
            return _format_extracted_data(extracted)

        node_logger.warning(
            "Structured extraction returned empty — falling back to markdown scrape"
        )

    except Exception as exc:
        exc_str = str(exc).lower()
        if "429" in exc_str or "rate limit" in exc_str or "too many requests" in exc_str:
            raise TooManyRequestsError(f"Firecrawl rate-limited: {exc}") from exc
        node_logger.warning(
            "Structured extraction failed — falling back to markdown scrape",
            error=str(exc),
        )

    # ── Pass 2: Markdown fallback ─────────────────────────────────────────────
    try:
        node_logger.info("Calling Firecrawl markdown scrape (fallback)")
        scrape_result = await app.async_scrape_url(
            url,
            params={
                "formats": ["markdown"],
                "timeout": 30000,
            },
        )

        markdown = ""
        if hasattr(scrape_result, "markdown") and scrape_result.markdown:
            markdown = scrape_result.markdown
        elif isinstance(scrape_result, dict):
            markdown = scrape_result.get("markdown") or ""

        if markdown:
            node_logger.info("Markdown fallback succeeded", chars=len(markdown))
            return markdown

        raise RuntimeError("Firecrawl returned empty markdown content.")

    except TooManyRequestsError:
        raise  # propagate for tenacity

    except Exception as exc:
        exc_str = str(exc).lower()
        if "429" in exc_str or "rate limit" in exc_str or "too many requests" in exc_str:
            raise TooManyRequestsError(f"Firecrawl rate-limited: {exc}") from exc
        raise RuntimeError(f"Firecrawl markdown scrape failed: {exc}") from exc


# ─── LangGraph node ──────────────────────────────────────────────────────────

async def scraper_node(state: LeadState) -> dict:
    """
    LangGraph node: scrape the target URL via real Firecrawl API and sanitize output.

    Returns a partial state dict. LangGraph merges it into the full state.
    """
    url = state["target_url"]
    node_logger = logger.bind(node="scraper_node", url=url)

    # ── Safety check: reject dangerous URL schemes before making any call ─────
    if not is_safe_url(url):
        node_logger.error("Unsafe URL scheme rejected", url=url)
        return {
            "raw_scraped_text": None,
            "scraper_error": f"URL rejected by safety filter: {url}",
        }

    try:
        node_logger.info("Starting Firecrawl scrape")
        raw_content = await _call_firecrawl(url)

        if not raw_content or not raw_content.strip():
            node_logger.warning("Firecrawl returned empty content")
            return {
                "raw_scraped_text": None,
                "scraper_error": "Firecrawl returned empty content — no text to process.",
            }

        # ── Apply prompt injection guardrails ──────────────────────────────────
        sanitized = sanitize_scraped_text(raw_content)

        if not sanitized.strip():
            node_logger.warning("All content stripped by sanitizer")
            return {
                "raw_scraped_text": None,
                "scraper_error": "Sanitizer removed all content — possible injection attempt.",
            }

        node_logger.info(
            "Scraping complete",
            raw_chars=len(raw_content),
            sanitized_chars=len(sanitized),
        )
        return {
            "raw_scraped_text": sanitized,
            "scraper_error": None,
        }

    except TooManyRequestsError:
        raise  # Let tenacity handle retries

    except RuntimeError as exc:
        node_logger.error("Firecrawl scrape failed", error=str(exc))
        return {
            "raw_scraped_text": None,
            "scraper_error": str(exc),
        }

    except Exception as exc:
        node_logger.exception("Scraper node raised unexpected error", error=str(exc))
        return {
            "raw_scraped_text": None,
            "scraper_error": f"Scraper error: {exc}",
        }
