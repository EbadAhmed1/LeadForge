"""
app/repositories/user_profile.py
──────────────────────────────────
Concrete UserProfile repository — extends TenantRepository.
Adds domain-specific queries (e.g., lookup by email within a tenant).
"""
from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user_profile import UserProfile
from app.repositories.base import TenantRepository


class UserProfileRepository(TenantRepository[UserProfile]):
    def __init__(self, session: AsyncSession, tenant_id: str) -> None:
        super().__init__(UserProfile, session, tenant_id)

    async def get_by_email(self, email: str) -> UserProfile | None:
        """
        Look up a user by email within the current tenant.
        Tenant scoping is automatically applied via _base_query().
        """
        result = await self.session.execute(
            self._base_query().where(UserProfile.email == email.lower())
        )
        return result.scalars().first()

    async def email_exists(self, email: str) -> bool:
        """Return True if email is already registered in this tenant."""
        return await self.get_by_email(email) is not None

    async def list_active(self, *, skip: int = 0, limit: int = 20) -> list[UserProfile]:
        """Return only active (non-soft-deleted) users."""
        result = await self.session.execute(
            self._base_query()
            .where(UserProfile.is_active.is_(True))  # type: ignore[attr-defined]
            .offset(skip)
            .limit(limit)
        )
        return list(result.scalars().all())
