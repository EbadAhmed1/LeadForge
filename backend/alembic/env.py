"""
alembic/env.py
───────────────
Alembic migration environment.

Key design decisions:
  • Imports ALL SQLModel table models via `app.models` so autogenerate detects
    every table. Adding a new model only requires importing it in models/__init__.py.
  • Uses the SYNC database URL (psycopg2) because Alembic's standard runner is
    synchronous. The application uses asyncpg at runtime.
  • The DB URL is read from the SYNC_DATABASE_URL environment variable so that
    docker-compose can inject the correct host (db vs localhost).
"""
from __future__ import annotations

import os
from logging.config import fileConfig


from alembic import context
from sqlalchemy import engine_from_config, pool
from sqlmodel import SQLModel

# ─── Import ALL models so Alembic autogenerate sees them ──────────────────────
# This is the ONLY place all models need to be imported together.
import app.models  # noqa: F401 — side effect import to populate SQLModel.metadata

# ─── Alembic Config ───────────────────────────────────────────────────────────
config = context.config

# Override sqlalchemy.url from environment variable (set by docker-compose)
sync_db_url = os.environ.get(
    "SYNC_DATABASE_URL",
    "postgresql+psycopg2://postgres:postgres@localhost:5432/saas_db",
)
config.set_main_option("sqlalchemy.url", sync_db_url)

# Logging
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# ─── Metadata ─────────────────────────────────────────────────────────────────
# SQLModel uses SQLAlchemy's metadata under the hood.
target_metadata = SQLModel.metadata


# ─── Migration runners ────────────────────────────────────────────────────────

def run_migrations_offline() -> None:
    """
    Run migrations without a live DB connection (generates SQL scripts).
    Useful for reviewing DDL before applying to production.
    """
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        compare_type=True,  # Detect column type changes
        compare_server_default=True,
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """
    Run migrations against a live database connection.
    """
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,  # NullPool is best for migration scripts
    )
    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True,
            compare_server_default=True,
        )
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
