"""
app/routers/user_profiles.py
──────────────────────────────
User profile management endpoints — all scoped to the authenticated tenant.
"""
from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, status

from app.dependencies.tenant import get_user_profile_repo
from app.repositories.user_profile import UserProfileRepository
from app.schemas.user_profile import (
    UserProfileCreate,
    UserProfileList,
    UserProfileRead,
    UserProfileUpdate,
)
from app.services.user_profile import UserProfileService

router = APIRouter(prefix="/users", tags=["User Profiles"])


def _service(
    repo: UserProfileRepository = Depends(get_user_profile_repo),
) -> UserProfileService:
    return UserProfileService(repo)


@router.post(
    "/",
    response_model=UserProfileRead,
    status_code=status.HTTP_201_CREATED,
    summary="Create a user profile within the authenticated tenant",
)
async def create_user(
    data: UserProfileCreate,
    svc: UserProfileService = Depends(_service),
) -> UserProfileRead:
    user = await svc.create_user(data)
    return UserProfileRead.model_validate(user)


@router.get(
    "/",
    response_model=UserProfileList,
    summary="List users in the authenticated tenant",
)
async def list_users(
    skip: int = 0,
    limit: int = 20,
    active_only: bool = True,
    svc: UserProfileService = Depends(_service),
) -> UserProfileList:
    users = await svc.list_users(skip=skip, limit=limit, active_only=active_only)
    total = await svc.count_users()
    return UserProfileList(
        items=[UserProfileRead.model_validate(u) for u in users],
        total=total,
    )


@router.get(
    "/{user_id}",
    response_model=UserProfileRead,
    summary="Get a single user by ID",
)
async def get_user(
    user_id: uuid.UUID,
    svc: UserProfileService = Depends(_service),
) -> UserProfileRead:
    user = await svc.get_user(user_id)
    return UserProfileRead.model_validate(user)


@router.patch(
    "/{user_id}",
    response_model=UserProfileRead,
    summary="Update a user profile",
)
async def update_user(
    user_id: uuid.UUID,
    data: UserProfileUpdate,
    svc: UserProfileService = Depends(_service),
) -> UserProfileRead:
    user = await svc.update_user(user_id, data)
    return UserProfileRead.model_validate(user)


@router.delete(
    "/{user_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a user profile",
)
async def delete_user(
    user_id: uuid.UUID,
    svc: UserProfileService = Depends(_service),
) -> None:
    await svc.delete_user(user_id)
