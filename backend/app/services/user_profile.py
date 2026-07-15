"""
app/services/user_profile.py
──────────────────────────────
Business logic for UserProfile management.
"""
from __future__ import annotations

import uuid

from fastapi import HTTPException, status

from app.core.security import hash_password
from app.models.user_profile import UserProfile
from app.repositories.user_profile import UserProfileRepository
from app.schemas.user_profile import UserProfileCreate, UserProfileUpdate


class UserProfileService:
    def __init__(self, repo: UserProfileRepository) -> None:
        self.repo = repo

    async def create_user(self, data: UserProfileCreate) -> UserProfile:
        # Enforce email uniqueness within this tenant
        if await self.repo.email_exists(data.email.lower()):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="A user with this email already exists in your organisation.",
            )

        # Hash password before storing — never persist plain text
        from app.schemas.user_profile import UserProfileCreate as _Schema
        from pydantic import BaseModel

        class _DBCreate(BaseModel):
            email: str
            full_name: str
            hashed_password: str
            role: str
            job_title: str | None = None
            avatar_url: str | None = None

        db_data = _DBCreate(
            email=data.email.lower(),
            full_name=data.full_name,
            hashed_password=hash_password(data.password),
            role=data.role,
            job_title=data.job_title,
            avatar_url=data.avatar_url,
        )
        return await self.repo.create(db_data)

    async def get_user(self, user_id: uuid.UUID) -> UserProfile:
        return await self.repo.get_or_404(user_id)

    async def list_users(
        self, *, skip: int = 0, limit: int = 20, active_only: bool = True
    ) -> list[UserProfile]:
        if active_only:
            return await self.repo.list_active(skip=skip, limit=limit)
        return await self.repo.list(skip=skip, limit=limit)

    async def update_user(
        self, user_id: uuid.UUID, data: UserProfileUpdate
    ) -> UserProfile:
        return await self.repo.update(user_id, data)

    async def delete_user(self, user_id: uuid.UUID) -> None:
        await self.repo.delete(user_id)

    async def count_users(self) -> int:
        return await self.repo.count()
