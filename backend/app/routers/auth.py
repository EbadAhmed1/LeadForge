"""
app/routers/auth.py
────────────────────
Authentication endpoints:
  POST /auth/register          — create account, send verification email
  POST /auth/verify-email      — confirm code, activate account, return JWT
  POST /auth/login             — email + password login, return JWT
  GET  /auth/oauth/github      — redirect to GitHub OAuth
  GET  /auth/oauth/github/callback — exchange code, issue JWT, redirect to frontend
  GET  /auth/me                — return current user from JWT
"""
from __future__ import annotations

import asyncio
import random
import secrets
import string
from urllib.parse import urlencode

import httpx
import structlog
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import RedirectResponse
from pydantic import BaseModel, EmailStr, field_validator
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.core.database import get_async_session
from app.core.email import send_verification_email
from app.core.redis import get_redis
from app.core.security import create_access_token, hash_password, verify_password
from app.dependencies.auth import get_current_user
from app.models.tenant import Tenant
from app.models.user_profile import UserProfile

settings = get_settings()
logger = structlog.get_logger(__name__)
router = APIRouter(prefix="/auth", tags=["Auth"])

GITHUB_AUTHORIZE_URL = "https://github.com/login/oauth/authorize"
GITHUB_TOKEN_URL = "https://github.com/login/oauth/access_token"
GITHUB_USER_URL = "https://api.github.com/user"
GITHUB_EMAILS_URL = "https://api.github.com/user/emails"

VERIFY_TTL_SECONDS = 900  # 15 minutes


# ─── Request / Response Schemas ───────────────────────────────────────────────

class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str

    @field_validator("password")
    @classmethod
    def password_length(cls, v: str) -> str:
        if len(v.encode()) > 72:
            raise ValueError("Password must be 72 characters or fewer.")
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters.")
        return v


class VerifyEmailRequest(BaseModel):
    email: EmailStr
    code: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str

    @field_validator("password")
    @classmethod
    def password_length(cls, v: str) -> str:
        if len(v.encode()) > 72:
            raise ValueError("Password must be 72 characters or fewer.")
        return v


# ─── Helpers ──────────────────────────────────────────────────────────────────

async def _get_or_create_default_tenant(session: AsyncSession) -> Tenant:
    result = await session.execute(select(Tenant).where(Tenant.slug == "default"))
    tenant = result.scalars().first()
    if not tenant:
        tenant = Tenant(name="Default Workspace", slug="default", plan="free")
        session.add(tenant)
        await session.flush()
    return tenant


def _build_token_response(user: UserProfile) -> dict:
    token = create_access_token(
        subject=str(user.id),
        extra_claims={
            "email": user.email,
            "name": user.full_name,
            "tenant_id": str(user.tenant_id),
        },
    )
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": str(user.id),
            "email": user.email,
            "name": user.full_name,
            "avatar_url": user.avatar_url,
            "tenant_id": str(user.tenant_id),
        },
    }


# ─── Endpoints ────────────────────────────────────────────────────────────────

@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(
    body: RegisterRequest,
    session: AsyncSession = Depends(get_async_session),
    redis=Depends(get_redis),
):
    """Create an account. Sends a 6-digit code to the email for verification."""
    result = await session.execute(
        select(UserProfile).where(UserProfile.email == body.email)
    )
    existing = result.scalars().first()
    if existing:
        if existing.email_verified:
            raise HTTPException(status_code=400, detail="Email already registered.")
        # Resend verification code for unverified accounts
        code = "".join(random.choices(string.digits, k=6))
        await redis.setex(f"email_verify:{body.email}", VERIFY_TTL_SECONDS, code)
        await send_verification_email(body.email, existing.full_name, code)
        return {"message": "Verification email resent.", "email": body.email}

    tenant = await _get_or_create_default_tenant(session)
    user = UserProfile(
        tenant_id=tenant.id,
        email=body.email,
        full_name=body.name,
        hashed_password=hash_password(body.password),
        role="admin",
        is_active=False,
        email_verified=False,
    )
    session.add(user)
    await session.commit()

    code = "".join(random.choices(string.digits, k=6))
    await redis.setex(f"email_verify:{body.email}", VERIFY_TTL_SECONDS, code)
    await send_verification_email(body.email, body.name, code)

    return {"message": "Verification email sent.", "email": body.email}


@router.post("/verify-email")
async def verify_email(
    body: VerifyEmailRequest,
    session: AsyncSession = Depends(get_async_session),
    redis=Depends(get_redis),
):
    """Verify the 6-digit code. Returns a JWT on success."""
    stored = await redis.get(f"email_verify:{body.email}")
    if not stored or stored != body.code:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired verification code.",
        )

    result = await session.execute(
        select(UserProfile).where(UserProfile.email == body.email)
    )
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    user.is_active = True
    user.email_verified = True
    await session.commit()
    await redis.delete(f"email_verify:{body.email}")

    return _build_token_response(user)


@router.post("/login")
async def login(
    body: LoginRequest,
    session: AsyncSession = Depends(get_async_session),
):
    """Authenticate with email and password. Returns a JWT."""
    result = await session.execute(
        select(UserProfile).where(UserProfile.email == body.email)
    )
    user = result.scalars().first()

    if not user or not user.hashed_password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )
    if not verify_password(body.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )
    if not user.email_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Please verify your email before signing in.",
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deactivated.",
        )

    return _build_token_response(user)


@router.get("/oauth/github")
async def github_oauth_start():
    """Redirect the browser to GitHub's OAuth consent screen."""
    if not settings.github_client_id:
        raise HTTPException(status_code=501, detail="GitHub OAuth is not configured.")

    params = {
        "client_id": settings.github_client_id,
        "redirect_uri": (
            f"{settings.backend_url}/api/v1/auth/oauth/github/callback"
        ),
        "scope": "user:email",
        "state": secrets.token_urlsafe(16),
    }
    return RedirectResponse(f"{GITHUB_AUTHORIZE_URL}?{urlencode(params)}")


@router.get("/oauth/github/callback")
async def github_oauth_callback(
    code: str,
    state: str = "",
    session: AsyncSession = Depends(get_async_session),
):
    """Exchange GitHub code for a token, upsert the user, redirect with JWT."""
    async with httpx.AsyncClient(timeout=15.0) as client:
        # Exchange code → GitHub access token
        token_resp = await client.post(
            GITHUB_TOKEN_URL,
            json={
                "client_id": settings.github_client_id,
                "client_secret": settings.github_client_secret,
                "code": code,
                "redirect_uri": (
                    f"{settings.backend_url}/api/v1/auth/oauth/github/callback"
                ),
            },
            headers={"Accept": "application/json"},
        )
        gh_token = token_resp.json().get("access_token")
        if not gh_token:
            logger.error("GitHub token exchange failed", resp=token_resp.text)
            return RedirectResponse(
                f"{settings.frontend_url}/sign-in?error=github_oauth_failed"
            )

        auth_headers = {
            "Authorization": f"Bearer {gh_token}",
            "Accept": "application/vnd.github+json",
        }
        user_resp, emails_resp = await asyncio.gather(
            client.get(GITHUB_USER_URL, headers=auth_headers),
            client.get(GITHUB_EMAILS_URL, headers=auth_headers),
        )

    gh_user = user_resp.json()
    raw_emails = emails_resp.json()
    emails = raw_emails if isinstance(raw_emails, list) else []
    primary_email = next(
        (e["email"] for e in emails if e.get("primary") and e.get("verified")),
        gh_user.get("email"),
    )
    if not primary_email:
        return RedirectResponse(
            f"{settings.frontend_url}/sign-in?error=no_verified_email"
        )

    gh_id = str(gh_user.get("id", ""))
    full_name = gh_user.get("name") or gh_user.get("login") or "GitHub User"
    avatar_url = gh_user.get("avatar_url")

    result = await session.execute(
        select(UserProfile).where(UserProfile.email == primary_email)
    )
    user = result.scalars().first()

    if not user:
        tenant = await _get_or_create_default_tenant(session)
        user = UserProfile(
            tenant_id=tenant.id,
            email=primary_email,
            full_name=full_name,
            hashed_password="",
            role="admin",
            is_active=True,
            email_verified=True,
            oauth_provider="github",
            oauth_provider_id=gh_id,
            avatar_url=avatar_url,
        )
        session.add(user)
    else:
        user.is_active = True
        user.email_verified = True
        if not user.oauth_provider:
            user.oauth_provider = "github"
            user.oauth_provider_id = gh_id
        if avatar_url and not user.avatar_url:
            user.avatar_url = avatar_url

    await session.commit()

    jwt_token = _build_token_response(user)["access_token"]
    return RedirectResponse(
        f"{settings.frontend_url}/sso-callback?token={jwt_token}"
    )


@router.get("/me")
async def get_me(current_user: dict = Depends(get_current_user)) -> dict:
    """Return the authenticated user's identity from the JWT."""
    return {
        "user_id": current_user["user_id"],
        "email": current_user.get("email"),
        "name": current_user.get("name"),
        "tenant_id": current_user["tenant_id"],
    }

