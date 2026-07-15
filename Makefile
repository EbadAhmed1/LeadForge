.PHONY: help up down build logs logs-worker shell worker-shell migrate revision downgrade reset-db lint format worker-up worker-down history typecheck

# ─── Config ────────────────────────────────────────────────────────────────────────────────
DOCKER_COMPOSE = docker compose
API_CONTAINER    = saas_api
WORKER_CONTAINER = saas_worker

help: ## Show this help message
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

# ─── Docker ───────────────────────────────────────────────────────────────────
up: ## Start all services (detached)
	$(DOCKER_COMPOSE) up -d --build

down: ## Stop all services
	$(DOCKER_COMPOSE) down

build: ## Rebuild images without cache
	$(DOCKER_COMPOSE) build --no-cache

shell: ## Open a bash shell in the API container
	$(DOCKER_COMPOSE) exec $(API_CONTAINER) bash

worker-shell: ## Open a bash shell in the worker container
	$(DOCKER_COMPOSE) exec $(WORKER_CONTAINER) bash

logs: ## Tail API logs
	$(DOCKER_COMPOSE) logs -f api

logs-worker: ## Tail worker logs (arq job processing)
	$(DOCKER_COMPOSE) logs -f worker

psql: ## Open psql inside the DB container
	$(DOCKER_COMPOSE) exec db psql -U postgres -d saas_db

# ─── Alembic ──────────────────────────────────────────────────────────────────
migrate: ## Apply all pending migrations (upgrade head)
	$(DOCKER_COMPOSE) exec $(API_CONTAINER) alembic upgrade head

revision: ## Create a new auto-generated migration (MSG required: make revision MSG="add users table")
	$(DOCKER_COMPOSE) exec $(API_CONTAINER) alembic revision --autogenerate -m "$(MSG)"

downgrade: ## Downgrade one migration step
	$(DOCKER_COMPOSE) exec $(API_CONTAINER) alembic downgrade -1

history: ## Show migration history
	$(DOCKER_COMPOSE) exec $(API_CONTAINER) alembic history --verbose

reset-db: ## ⚠️  Drop all tables and re-run migrations from scratch
	$(DOCKER_COMPOSE) exec $(API_CONTAINER) alembic downgrade base
	$(DOCKER_COMPOSE) exec $(API_CONTAINER) alembic upgrade head

# ─── Code Quality ─────────────────────────────────────────────────────────────
lint: ## Run ruff linter
	$(DOCKER_COMPOSE) exec $(API_CONTAINER) ruff check app/

format: ## Auto-format with ruff
	$(DOCKER_COMPOSE) exec $(API_CONTAINER) ruff format app/

typecheck: ## Run pyright type checks
	$(DOCKER_COMPOSE) exec $(API_CONTAINER) pyright app/

# ─── Frontend ─────────────────────────────────────────────────────────────────
frontend-install: ## Install frontend dependencies
	cd frontend && npm install

frontend-dev: ## Run frontend dev server locally
	cd frontend && npm run dev

frontend-build: ## Build frontend application
	cd frontend && npm run build
