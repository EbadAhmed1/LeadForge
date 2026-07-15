"""
app/repositories/base.py
─────────────────────────
TenantRepository[ModelT] — the CENTREPIECE of multi-tenancy enforcement.

Security contract:
  • Every SELECT automatically appends WHERE tenant_id = :tenant_id
  • Every UPDATE locates the row via SELECT first (so the tenant_id check fires)
  • Every DELETE locates the row via SELECT first (so the tenant_id check fires)
  • create() injects tenant_id from the repository context — never from user input

No code outside this class should ever construct a raw query against a
tenant-scoped table. Services and routers ONLY call repository methods.
"""
from __future__ import annotations

import uuid
from typing import Any, Generic, Type, TypeVar

from fastapi import HTTPException, status
from pydantic import BaseModel
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import SQLModel

# Generic type variable bound to SQLModel table models
ModelT = TypeVar("ModelT", bound=SQLModel)


class TenantRepository(Generic[ModelT]):
    """
    Generic async CRUD repository with automatic tenant_id scoping.

    Usage:
        repo = TenantRepository(UserProfile, session, tenant_id)
        users = await repo.list()
    """

    def __init__(
        self,
        model: Type[ModelT],
        session: AsyncSession,
        tenant_id: str,
    ) -> None:
        self.model = model
        self.session = session
        self.tenant_id = tenant_id

    # ─── Internal helpers ─────────────────────────────────────────────────────

    def _base_query(self):
        """Base SELECT scoped to this tenant. ALL queries MUST start here."""
        return select(self.model).where(
            self.model.tenant_id == self.tenant_id  # type: ignore[attr-defined]
        )

    async def _get_or_404(self, id: uuid.UUID) -> ModelT:
        """
        Fetch a single row by id within the current tenant.
        Raises HTTP 404 if not found (prevents timing-based tenant enumeration).
        """
        result = await self.session.execute(
            self._base_query().where(self.model.id == id)  # type: ignore[attr-defined]
        )
        obj = result.scalars().first()
        if obj is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"{self.model.__name__} not found.",
            )
        return obj

    # ─── Public CRUD API ──────────────────────────────────────────────────────

    async def get(self, id: uuid.UUID) -> ModelT | None:
        """
        Return a single row by id, or None if not found.
        Tenant scoping is always enforced — returns None for cross-tenant ids.
        """
        result = await self.session.execute(
            self._base_query().where(self.model.id == id)  # type: ignore[attr-defined]
        )
        return result.scalars().first()

    async def get_or_404(self, id: uuid.UUID) -> ModelT:
        """Return a single row by id, or raise HTTP 404."""
        return await self._get_or_404(id)

    async def list(
        self,
        *,
        skip: int = 0,
        limit: int = 20,
        filters: dict[str, Any] | None = None,
    ) -> list[ModelT]:
        """
        Return a paginated list of rows for the current tenant.

        Args:
            skip:    Number of rows to skip (offset).
            limit:   Maximum rows to return.
            filters: Optional equality filters, e.g. {"status": "active"}.
        """
        query = self._base_query()

        if filters:
            for field_name, value in filters.items():
                column = getattr(self.model, field_name, None)
                if column is not None and value is not None:
                    query = query.where(column == value)

        query = query.offset(skip).limit(limit)
        result = await self.session.execute(query)
        return list(result.scalars().all())

    async def count(self, filters: dict[str, Any] | None = None) -> int:
        """Return total row count for the current tenant (for pagination metadata)."""
        query = select(func.count()).select_from(self.model).where(  # type: ignore[arg-type]
            self.model.tenant_id == self.tenant_id  # type: ignore[attr-defined]
        )
        if filters:
            for field_name, value in filters.items():
                column = getattr(self.model, field_name, None)
                if column is not None and value is not None:
                    query = query.where(column == value)

        result = await self.session.execute(query)
        return result.scalar_one()

    async def create(self, obj_in: BaseModel) -> ModelT:
        """
        Create a new row.
        tenant_id is ALWAYS sourced from the repository context (self.tenant_id),
        never from obj_in. This is the multi-tenancy enforcement point.
        """
        data = obj_in.model_dump(exclude_unset=False)
        # Force tenant_id — overrides anything user might have passed
        data["tenant_id"] = self.tenant_id

        db_obj = self.model(**data)
        self.session.add(db_obj)
        await self.session.flush()   # Gets the generated id without committing
        await self.session.refresh(db_obj)
        return db_obj

    async def update(self, id: uuid.UUID, obj_in: BaseModel) -> ModelT:
        """
        Partially update a row. Raises HTTP 404 if not found within this tenant.
        Only fields explicitly set in obj_in are updated (exclude_unset=True).
        """
        db_obj = await self._get_or_404(id)
        update_data = obj_in.model_dump(exclude_unset=True)

        # Defensive: never allow tenant_id to be changed via update
        update_data.pop("tenant_id", None)
        update_data.pop("id", None)

        for field, value in update_data.items():
            setattr(db_obj, field, value)

        self.session.add(db_obj)
        await self.session.flush()
        await self.session.refresh(db_obj)
        return db_obj

    async def delete(self, id: uuid.UUID) -> None:
        """
        Delete a row. Raises HTTP 404 if not found within this tenant.
        Uses SELECT-then-DELETE so the tenant_id check always fires.
        """
        db_obj = await self._get_or_404(id)
        await self.session.delete(db_obj)
        await self.session.flush()

    async def exists(self, id: uuid.UUID) -> bool:
        """Return True if a row with this id exists in the current tenant."""
        result = await self.session.execute(
            select(func.count()).select_from(self.model).where(  # type: ignore[arg-type]
                self.model.tenant_id == self.tenant_id,  # type: ignore[attr-defined]
                self.model.id == id,  # type: ignore[attr-defined]
            )
        )
        return result.scalar_one() > 0
