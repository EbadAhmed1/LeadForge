"""
app/routers/target_companies.py
────────────────────────────────
Target company management endpoints.
"""
from __future__ import annotations

import uuid
from typing import Optional

from fastapi import APIRouter, Depends, Query, status

from app.dependencies.tenant import get_target_company_repo
from app.repositories.target_company import TargetCompanyRepository
from app.schemas.target_company import (
    TargetCompanyCreate,
    TargetCompanyList,
    TargetCompanyRead,
    TargetCompanyUpdate,
)
from app.services.target_company import TargetCompanyService

router = APIRouter(prefix="/companies", tags=["Target Companies"])


def _service(
    repo: TargetCompanyRepository = Depends(get_target_company_repo),
) -> TargetCompanyService:
    return TargetCompanyService(repo)


@router.post(
    "/",
    response_model=TargetCompanyRead,
    status_code=status.HTTP_201_CREATED,
    summary="Add a target company to prospect list",
)
async def create_company(
    data: TargetCompanyCreate,
    svc: TargetCompanyService = Depends(_service),
) -> TargetCompanyRead:
    company = await svc.create_company(data)
    return TargetCompanyRead.model_validate(company)


@router.get(
    "/",
    response_model=TargetCompanyList,
    summary="List target companies",
)
async def list_companies(
    skip: int = 0,
    limit: int = 20,
    enrichment_status: Optional[str] = Query(
        None, pattern=r"^(pending|enriched|failed)$"
    ),
    svc: TargetCompanyService = Depends(_service),
) -> TargetCompanyList:
    companies = await svc.list_companies(
        skip=skip, limit=limit, enrichment_status=enrichment_status
    )
    total = await svc.count_companies()
    return TargetCompanyList(
        items=[TargetCompanyRead.model_validate(c) for c in companies],
        total=total,
    )


@router.get(
    "/{company_id}",
    response_model=TargetCompanyRead,
    summary="Get a single target company",
)
async def get_company(
    company_id: uuid.UUID,
    svc: TargetCompanyService = Depends(_service),
) -> TargetCompanyRead:
    company = await svc.get_company(company_id)
    return TargetCompanyRead.model_validate(company)


@router.patch(
    "/{company_id}",
    response_model=TargetCompanyRead,
    summary="Update a target company",
)
async def update_company(
    company_id: uuid.UUID,
    data: TargetCompanyUpdate,
    svc: TargetCompanyService = Depends(_service),
) -> TargetCompanyRead:
    company = await svc.update_company(company_id, data)
    return TargetCompanyRead.model_validate(company)


@router.delete(
    "/{company_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a target company",
)
async def delete_company(
    company_id: uuid.UUID,
    svc: TargetCompanyService = Depends(_service),
) -> None:
    await svc.delete_company(company_id)
