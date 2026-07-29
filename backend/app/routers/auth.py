"""
app/routers/auth.py
────────────────────
Auth utility endpoints.

GET /auth/me — resolves the current Clerk user into the DB (auto-provisions on
first call) and returns lightweight identity context.  The frontend calls this
immediately after sign-in so every authenticated user exists in PostgreSQL
before they interact with any other feature.
"""
from __future__ import annotations

from fastapi import APIRouter, Depends

from app.dependencies.auth import get_current_user

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.get(
    "/me",
    summary="Return (and auto-provision) the current user's identity context",
)
async def get_me(
    current_user: dict = Depends(get_current_user),
) -> dict:
    """
    Called by the frontend immediately after Clerk sign-in/sign-up.
    Triggers the auto-provision logic in get_current_user so that a
    UserProfile row is created in PostgreSQL on first login rather than
    waiting until the user fires a scrape job.

    Returns only safe, non-sensitive identity fields.
    """
    return {
        "user_id": current_user.get("user_id"),
        "tenant_id": current_user.get("tenant_id"),
    }
