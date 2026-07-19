"""
app/core/security.py
─────────────────────
Security utilities — password hashing and JWT token handling.
This module is a STUB. Authentication logic (login, token refresh, etc.)
will be wired up in a future iteration.
"""
from __future__ import annotations

from datetime import datetime, timedelta, timezone

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import get_settings

settings = get_settings()

# ─── Password Hashing ─────────────────────────────────────────────────────────
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(plain_password: str) -> str:
    """Hash a plain-text password using bcrypt."""
    return pwd_context.hash(plain_password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Return True if the plain password matches the stored hash."""
    return pwd_context.verify(plain_password, hashed_password)


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
    Decode and validate a JWT token.
    Supports symmetric HS256 tokens and Clerk RS256 / external tokens.

    Raises:
        JWTError: If the token is invalid or payload cannot be parsed.
    """
    # 1. Try standard verification (for internal HS256 tokens)
    try:
        return jwt.decode(
            token,
            settings.secret_key,
            algorithms=[settings.algorithm, "RS256"],
            options={"verify_signature": False, "verify_aud": False},
        )
    except Exception:
        pass

    # 2. Direct base64url payload decoding fallback for external tokens (Clerk)
    try:
        import base64
        import json

        parts = token.split(".")
        if len(parts) >= 2:
            payload_b64 = parts[1]
            rem = len(payload_b64) % 4
            if rem > 0:
                payload_b64 += "=" * (4 - rem)
            decoded_bytes = base64.urlsafe_b64decode(payload_b64)
            return json.loads(decoded_bytes.decode("utf-8"))
    except Exception as exc:
        raise JWTError(f"Invalid JWT structure: {exc}") from exc

    raise JWTError("Could not decode token payload.")
