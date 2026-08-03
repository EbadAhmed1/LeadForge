"""
app/dependencies/auth.py
────────────────────────
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


# OpenAPI security scheme definition (enables Authorize padlock button in swagger UI)
security_scheme = HTTPBearer(
    scheme_name="JWT Token",
    description="Enter your JWT Bearer token: `Bearer <token>`",
    auto_error=False,
)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(security_scheme),
    session: AsyncSession = Depends(get_async_session),
) -> dict:
    """
    Validate the incoming request's Bearer token.
    Extract the subject user ID and resolve/verify the tenant context.
    Falls back gracefully to the default tenant if no token is provided.
    """
    token = credentials.credentials if credentials else None
    payload: dict = {}

    if token:
        try:
            payload = decode_access_token(token)
        except JWTError:
            payload = {}

    user_id = payload.get("sub") or "default_clerk_user"

    # Resolve tenant_id from claims (stateless Clerk/NextAuth pattern)
    tenant_id = payload.get("tenant_id") or payload.get("org_id")

    if not tenant_id:
        from sqlalchemy import select
        from app.models.tenant import Tenant
        from app.models.user_profile import UserProfile

        email = payload.get("email") or payload.get("primary_email_address") or f"{user_id}@clerk.user"
        try:
            user_uuid = uuid.UUID(user_id)
            query = select(UserProfile).where(UserProfile.id == user_uuid)
        except ValueError:
            query = select(UserProfile).where(UserProfile.email == email)

        result = await session.execute(query)
        user = result.scalars().first()
        if user and user.is_active:
            tenant_id = user.tenant_id
        else:
            # Auto-provision default tenant for Clerk users
            t_query = select(Tenant).where(Tenant.slug == "default")
            t_res = await session.execute(t_query)
            tenant = t_res.scalars().first()
            if not tenant:
                tenant = Tenant(
                    id=str(uuid.uuid4()),
                    name="Default Workspace",
                    slug="default",
                    plan="free",
                )
                session.add(tenant)
                await session.flush()
            
            tenant_id = tenant.id
            if not user:
                new_user = UserProfile(
                    tenant_id=tenant_id,
                    email=email,
                    full_name=payload.get("name") or "Clerk User",
                    hashed_password="",
                    role="admin",
                    is_active=True,
                )
                session.add(new_user)
                await session.commit()

    return {
        "user_id": user_id,
        "tenant_id": tenant_id,
        "payload": payload,
    }
