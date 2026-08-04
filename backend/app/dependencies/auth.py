"""
app/dependencies/auth.py
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
Stateless JWT authentication dependency.
"""
from __future__ import annotations

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError

from app.core.security import decode_access_token

# OpenAPI security scheme (enables Authorize button in Swagger UI)
security_scheme = HTTPBearer(
    scheme_name="JWT Token",
    description="Enter your JWT Bearer token: `Bearer <token>`",
    auto_error=False,
)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(security_scheme),
) -> dict:
    """Validate the Bearer JWT and return the decoded user context."""
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required.",
        )
    try:
        payload = decode_access_token(credentials.credentials)
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token.",
        )

    user_id: str | None = payload.get("sub")
    tenant_id: str | None = payload.get("tenant_id")
    if not user_id or not tenant_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token claims.",
        )

    return {
        "user_id": user_id,
        "tenant_id": tenant_id,
        "email": payload.get("email"),
        "name": payload.get("name"),
        "payload": payload,
    }
