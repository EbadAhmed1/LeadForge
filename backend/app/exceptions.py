"""
app/exceptions.py
──────────────────
Shared custom exceptions used across the application.
Kept in a standalone module to avoid circular imports between
app.tasks.lead_discovery and app.ai.nodes.scraper_node.
"""
from __future__ import annotations


class TooManyRequestsError(Exception):
    """
    Raised when any HTTP 429 is encountered in the pipeline (e.g. Firecrawl,
    OpenAI, or Anthropic rate-limits). Tenacity in lead_discovery.py catches
    this and applies exponential backoff before retrying.
    """
