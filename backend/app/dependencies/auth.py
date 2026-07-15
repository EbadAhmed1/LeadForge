"""
app/dependencies/auth.py
────────────────────────
Stateless JWT authentication dependency.
"""
from __future__ import annotations

import uuid
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_async_session
from app.core.security import decode_access_token

# OpenAPI security scheme definition (enables Authorize padlock button in swagger UI)
security_scheme = HTTPBearer(
    scheme_name="JWT Token",
    description="Enter your JWT Bearer token: `Bearer <token>`"
)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security_scheme),
    session: AsyncSession = Depends(get_async_session),
) -> dict:
    """
    Validate the incoming request's Bearer token.
    Extract the subject user ID and resolve/verify the tenant context.
    """
    token = credentials.credentials
    try:
        payload = decode_access_token(token)
    except JWTError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Could not validate credentials: {exc}",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token payload is missing subject (sub) claim.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Resolve tenant_id from claims (stateless Clerk/NextAuth pattern)
    tenant_id = payload.get("tenant_id") or payload.get("org_id")

    if not tenant_id:
        # Fallback: look up tenant_id in UserProfile database mapping
        try:
            user_uuid = uuid.UUID(user_id)
        except ValueError:
            user_uuid = None

        from sqlalchemy import select
        from app.models.user_profile import UserProfile

        if user_uuid:
            query = select(UserProfile).where(UserProfile.id == user_uuid)
        else:
            query = select(UserProfile).where(UserProfile.email == user_id)

        result = await session.execute(query)
        user = result.scalars().first()
        if not user or not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User profile inactive or not found.",
            )
        tenant_id = user.tenant_id

    if not tenant_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User not associated with a tenant.",
        )

    return {
        "user_id": user_id,
        "tenant_id": tenant_id,
        "payload": payload,
    }
