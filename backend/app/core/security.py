"""
app/core/security.py
─────────────────────
Security utilities — password hashing and JWT token handling.
This module is a STUB. Authentication logic (login, token refresh, etc.)
will be wired up in a future iteration.
"""
from __future__ import annotations

from datetime import datetime, timedelta, timezone

import bcrypt as _bcrypt
from jose import JWTError, jwt

from app.core.config import get_settings

settings = get_settings()

# ─── Password Hashing ─────────────────────────────────────────────────────────

def hash_password(plain_password: str) -> str:
    """Hash a plain-text password using bcrypt."""
    return _bcrypt.hashpw(plain_password.encode(), _bcrypt.gensalt()).decode()


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Return True if the plain password matches the stored hash."""
    return _bcrypt.checkpw(plain_password.encode(), hashed_password.encode())


# ─── JWT ──────────────────────────────────────────────────────────────────────
def create_access_token(subject: str, extra_claims: dict | None = None) -> str:
    """
    Create a signed JWT access token.

    Args:
        subject:      The token subject — typically the user's UUID.
        extra_claims: Additional claims to embed (e.g., {"tenant_id": "..."}).

    Returns:
        A signed JWT string.
    """
    expire = datetime.now(timezone.utc) + timedelta(
        minutes=settings.access_token_expire_minutes
    )
    payload: dict = {
        "sub": subject,
        "exp": expire,
        "iat": datetime.now(timezone.utc),
    }
    if extra_claims:
        payload.update(extra_claims)
    return jwt.encode(payload, settings.secret_key, algorithm=settings.algorithm)


def decode_access_token(token: str) -> dict:
    """
    Decode and validate an HS256 JWT access token.

    Raises:
        JWTError: If the token is invalid, expired, or signature doesn't match.
    """
    return jwt.decode(
        token,
        settings.secret_key,
        algorithms=[settings.algorithm],
        options={"verify_aud": False},
    )
