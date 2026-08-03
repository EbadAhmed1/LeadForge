"""add_email_verified_oauth_fields

Revision ID: a8f3c2d1e9b4
Revises: 31ae83e40c68
Create Date: 2026-07-21 00:01:00.000000+00:00

Adds email_verified, oauth_provider, oauth_provider_id columns to user_profiles.
Existing rows are backfilled with email_verified=true (they authenticated via
Clerk and are already verified).
"""
from __future__ import annotations

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

# Revision identifiers
revision: str = "a8f3c2d1e9b4"
down_revision: Union[str, None] = "31ae83e40c68"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "user_profiles",
        sa.Column("email_verified", sa.Boolean(), nullable=False, server_default="false"),
    )
    op.add_column(
        "user_profiles",
        sa.Column("oauth_provider", sa.String(length=50), nullable=True),
    )
    op.add_column(
        "user_profiles",
        sa.Column("oauth_provider_id", sa.String(length=255), nullable=True),
    )
    # Backfill: mark existing users as verified (they were imported from Clerk)
    op.execute("UPDATE user_profiles SET email_verified = true")


def downgrade() -> None:
    op.drop_column("user_profiles", "oauth_provider_id")
    op.drop_column("user_profiles", "oauth_provider")
    op.drop_column("user_profiles", "email_verified")
