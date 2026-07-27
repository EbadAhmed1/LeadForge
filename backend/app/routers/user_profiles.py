"""
app/routers/user_profiles.py
──────────────────────────────
User profile management endpoints — all scoped to the authenticated tenant.
"""
from __future__ import annotations

import uuid

from pydantic import BaseModel, EmailStr
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_async_session
from app.core.security import hash_password, verify_password
from app.dependencies.tenant import get_user_profile_repo
from app.models.tenant import Tenant
from app.models.user_profile import UserProfile
from app.repositories.user_profile import UserProfileRepository
from app.schemas.user_profile import (
    UserProfileCreate,
    UserProfileList,
    UserProfileRead,
    UserProfileUpdate,
)
from app.services.user_profile import UserProfileService

router = APIRouter(prefix="/users", tags=["User Profiles"])


class UserRegisterSchema(BaseModel):
    email: EmailStr
    full_name: str
    password: str
    role: str = "member"


class UserLoginSchema(BaseModel):
    email: EmailStr
    password: str


@router.post(
    "/register",
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user profile in PostgreSQL database",
)
async def register_user(
    data: UserRegisterSchema,
    session: AsyncSession = Depends(get_async_session),
):
    email_clean = data.email.strip().lower()

    # Check if user already exists
    existing = await session.execute(
        select(UserProfile).where(UserProfile.email == email_clean)
    )
    if existing.scalars().first():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists. Please sign in.",
        )

    # Get or create default tenant workspace
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

    # Create new user in PostgreSQL
    new_user = UserProfile(
        id=uuid.uuid4(),
        tenant_id=tenant.id,
        email=email_clean,
        full_name=data.full_name,
        hashed_password=hash_password(data.password),
        role=data.role,
        is_active=True,
    )
    session.add(new_user)
    await session.commit()

    return {
        "id": str(new_user.id),
        "email": new_user.email,
        "full_name": new_user.full_name,
        "role": new_user.role,
        "signedIn": True,
    }


@router.post(
    "/login",
    status_code=status.HTTP_200_OK,
    summary="Authenticate a user against PostgreSQL database",
)
async def login_user(
    data: UserLoginSchema,
    session: AsyncSession = Depends(get_async_session),
):
    email_clean = data.email.strip().lower()

    res = await session.execute(
        select(UserProfile).where(UserProfile.email == email_clean)
    )
    user = res.scalars().first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No account found with this email. Please register first.",
        )

    if user.hashed_password and not verify_password(data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid password. Please try again.",
        )

    return {
        "id": str(user.id),
        "email": user.email,
        "full_name": user.full_name,
        "role": user.role,
        "signedIn": True,
    }


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
