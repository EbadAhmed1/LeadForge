"""
app/routers/webhooks.py
────────────────────────
Clerk webhook receiver.

When a user signs up or updates their profile through Clerk (Google, GitHub,
email, etc.) Clerk fires a POST to this endpoint.  We use that event to create
or update the UserProfile row with their *real* email address and display name
instead of the placeholder email (`clerk_user_id@clerk.user`) that the
auto-provision fallback uses.

Setup in Clerk Dashboard
─────────────────────────
1.  Configure → Webhooks → Add Endpoint
2.  URL: https://<your-backend-domain>/api/v1/webhooks/clerk
3.  Subscribe to events:  user.created   user.updated
4.  Copy the Signing Secret and add it to your .env:
        CLERK_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxx

Signature verification
──────────────────────
Svix (the delivery infra Clerk uses) signs each payload.  Full verification
requires the `svix` Python package.  Until that is added to dependencies the
endpoint falls back to a shared-secret header check:
    X-Webhook-Secret: <value of CLERK_WEBHOOK_SECRET>
Set the same value as a custom header in the Clerk webhook configuration.
"""
from __future__ import annotations

import uuid

import structlog
from fastapi import APIRouter, Depends, Header, HTTPException, Request, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.core.database import get_async_session
from app.models.tenant import Tenant
from app.models.user_profile import UserProfile

router = APIRouter(prefix="/webhooks", tags=["Webhooks"])
logger = structlog.get_logger(__name__)
settings = get_settings()


def _get_webhook_secret() -> str:
    """Return the configured webhook secret (may be empty for dev instances)."""
    return getattr(settings, "clerk_webhook_secret", "")


async def _ensure_default_tenant(session: AsyncSession) -> Tenant:
    """Return the default tenant, creating it if it does not exist."""
    result = await session.execute(select(Tenant).where(Tenant.slug == "default"))
    tenant = result.scalars().first()
    if not tenant:
        tenant = Tenant(
            id=str(uuid.uuid4()),
            name="Default Workspace",
            slug="default",
            plan="free",
        )
        session.add(tenant)
        await session.flush()
    return tenant


@router.post(
    "/clerk",
    status_code=status.HTTP_200_OK,
    summary="Receive Clerk lifecycle events and sync user data to the database",
)
async def clerk_webhook(
    request: Request,
    x_webhook_secret: str | None = Header(default=None),
    session: AsyncSession = Depends(get_async_session),
) -> dict:
    """
    Handles user.created and user.updated Clerk webhook events.

    On user.created  → create UserProfile with real email + full name.
    On user.updated  → patch email / name if they changed.
    All other events → acknowledged and ignored (HTTP 200).
    """
    # ── Optional shared-secret guard ─────────────────────────────────────────
    webhook_secret = _get_webhook_secret()
    if webhook_secret and x_webhook_secret != webhook_secret:
        logger.warning("Clerk webhook: invalid or missing secret header")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid webhook secret",
        )

    try:
        payload = await request.json()
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid JSON payload",
        )

    event_type: str = payload.get("type", "")
    if event_type not in ("user.created", "user.updated", "user.deleted"):
        return {"status": "ignored", "event": event_type}

    data: dict = payload.get("data", {})
    clerk_user_id: str = data.get("id", "")
    if not clerk_user_id:
        raise HTTPException(status_code=400, detail="Missing user id in webhook payload")

    # ── Handle deletion separately — no email extraction needed ──────────────
    if event_type == "user.deleted":
        await _handle_user_deleted(clerk_user_id, session)
        return {"status": "ok", "event": event_type}

    # ── Extract real email ────────────────────────────────────────────────────
    email_objects: list[dict] = data.get("email_addresses", [])
    primary_email_id: str = data.get("primary_email_address_id", "")
    primary_email: str = next(
        (
            e["email_address"]
            for e in email_objects
            if e.get("id") == primary_email_id
        ),
        email_objects[0]["email_address"] if email_objects else f"{clerk_user_id}@clerk.user",
    )

    first_name: str = data.get("first_name") or ""
    last_name: str = data.get("last_name") or ""
    full_name: str = f"{first_name} {last_name}".strip() or "Clerk User"
    avatar_url: str | None = data.get("image_url") or None

    # ── Look up existing user by real email OR placeholder email ──────────────
    placeholder_email = f"{clerk_user_id}@clerk.user"
    result = await session.execute(
        select(UserProfile).where(
            UserProfile.email.in_([primary_email, placeholder_email])
        )
    )
    user = result.scalars().first()

    if user:
        # Patch with real values received from Clerk
        user.email = primary_email
        user.full_name = full_name
        if avatar_url:
            user.avatar_url = avatar_url
        logger.info("Clerk webhook: updated user profile", clerk_id=clerk_user_id, email=primary_email)
    else:
        # First-ever registration for this Clerk user — create the profile
        tenant = await _ensure_default_tenant(session)
        user = UserProfile(
            tenant_id=tenant.id,
            email=primary_email,
            full_name=full_name,
            hashed_password="",
            role="admin",
            is_active=True,
            avatar_url=avatar_url,
        )
        session.add(user)
        logger.info("Clerk webhook: created user profile", clerk_id=clerk_user_id, email=primary_email)

    # session.commit() is handled by get_async_session after this handler returns
    return {"status": "ok", "event": event_type}


async def _handle_user_deleted(
    clerk_user_id: str,
    session: AsyncSession,
) -> None:
    """
    Soft-deletes the UserProfile matching this Clerk user.
    We keep the row (is_active=False) so that historical leads and job
    records that reference this user's tenant are not orphaned.
    """
    placeholder_email = f"{clerk_user_id}@clerk.user"
    result = await session.execute(
        select(UserProfile).where(
            UserProfile.email.like(f"%@clerk.user")
            | UserProfile.email.like(f"{clerk_user_id}%")
        )
    )
    # Narrow down: match by placeholder email pattern or find exact placeholder
    all_candidates = result.scalars().all()
    user = next(
        (u for u in all_candidates if u.email == placeholder_email or clerk_user_id in u.email),
        None,
    )
    if user:
        user.is_active = False
        logger.info("Clerk webhook: soft-deleted user profile", clerk_id=clerk_user_id, email=user.email)
    else:
        logger.warning("Clerk webhook: user.deleted — no matching profile found", clerk_id=clerk_user_id)
