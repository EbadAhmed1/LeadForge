FROM python:3.12-slim

# ─── System dependencies ──────────────────────────────────────────────────────
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# ─── Working directory ────────────────────────────────────────────────────────
WORKDIR /app

# ─── Install Python dependencies ─────────────────────────────────────────────
# Copy pyproject.toml and create a minimal stub package so pip can build the
# wheel and install all dependencies.  The real source is copied afterwards.
COPY pyproject.toml ./
RUN mkdir -p app && touch app/__init__.py

RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir .

# ─── Copy application source ──────────────────────────────────────────────────
# (In dev mode the volume mount overrides this; in prod this is the real code)
COPY . .

# ─── Non-root user for security ──────────────────────────────────────────────
RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser
USER appuser

EXPOSE 8000

# ─── Default command (overridden in docker-compose for hot-reload) ────────────
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
