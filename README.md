# LeadForge — Autonomous B2B Sales Intelligence & Lead Discovery Platform

LeadForge is an enterprise-grade, autonomous B2B lead discovery, web intelligence, ICP qualification, and personalized cold outreach platform. Built with a modern microservices architecture, LeadForge leverages a multi-node LangGraph agentic pipeline to scrape company websites, execute web-wide search intelligence, evaluate leads against customizable Ideal Customer Profiles (ICP), extract high-value sales battlecards, and automatically draft high-converting cold outreach emails.

---

## Technical Stack

### Frontend Application
- Framework: Next.js 16 (App Router with React 19)
- Language: TypeScript
- Styling: Tailwind CSS, CSS Modules
- UI Components & Icons: Custom design system with Lucide React icons
- Authentication: Clerk Authentication
- Hosting & Deployment: Vercel

### Backend Services
- Framework: FastAPI (Python 3.12)
- Database ORM: SQLModel (SQLAlchemy 2.0 Unified Pydantic Layer)
- Relational Database: PostgreSQL 16 with AsyncPG driver
- Task Queue & Caching: Redis 7 with arq (Async Redis Queue) for background lead discovery tasks
- Migration System: Alembic
- Logging: Structlog (Structured JSON logging)
- Hosting & Deployment: Hetzner Cloud VPS (Docker Compose containerized setup)

### AI Orchestration & Intelligence Engine
- Agentic Workflow Framework: LangGraph (StateGraph topology)
- LLM Providers: OpenAI (GPT-4o / GPT-4o-mini) and Anthropic Claude (Claude 3.5 Haiku)
- Web Scraping & Structured Extraction: Firecrawl API (Two-pass structured JSON schema extraction + Markdown fallback)
- Web-Wide Search Engine: Tavily Search API (Multi-query search intelligence for funding, hiring, and news)
- Security & Guardrails: Bleach HTML stripping and custom prompt-injection sanitization

---

## Agentic AI Pipeline Topology

LeadForge utilizes an asynchronous, multi-stage LangGraph workflow defined in `backend/app/ai/graph.py`. The execution flow proceeds through four specialized nodes:

```
[ START ]
    |
    v
[ search_node ] --------> Gathers web-wide intelligence via Tavily API
    |
    v
[ scraper_node ] -------> Scrapes domain content via Firecrawl API & sanitizes text
    |
    v
[ qualifier_node ] -----> Evaluates ICP fit & extracts 6 Sales Intelligence Modules
    |
    v
[ drafter_node ] -------> Generates personalized cold outreach emails
    |
    v
[ END ]
```

### Node Responsibilities

1. search_node (`backend/app/ai/nodes/search_node.py`):
   Executes concurrent web queries using the Tavily Search API to gather external intelligence about the prospect company, including market posture, leadership, recent funding, headcount expansion, and tech stack details.

2. scraper_node (`backend/app/ai/nodes/scraper_node.py`):
   Invokes the Firecrawl API using a two-pass strategy: structured JSON extraction first, followed by a raw markdown fallback. The resulting text is processed through prompt injection guardrails (`sanitizer.py`) to prevent malicious injection attacks.

3. qualifier_node (`backend/app/ai/nodes/qualifier_node.py`):
   Fetches the tenant's ICP criteria from PostgreSQL and invokes the LLM using Pydantic structured output (`with_structured_output(QualificationResult)`). It generates an overall qualification verdict, chain-of-thought reasoning, confidence score, and populates the 6 Sales Intelligence Modules.

4. drafter_node (`backend/app/ai/nodes/drafter_node.py`):
   Generates personalized, multi-tone cold emails using the target domain research, extracted sales triggers, and decision-maker personas.

---

## 6 Sales Intelligence Modules

During the qualification phase, LeadForge extracts 6 structured sales intelligence modules for every processed company:

1. Target Personas & LinkedIn Search Query: Recommended decision-maker titles (e.g., VP of Engineering, CTO) and a ready-to-use LinkedIn Boolean search string.
2. Buying Triggers ("Why Now?"): Identifies recent growth signals, funding rounds, leadership changes, or compliance milestones.
3. Tech Displacement Strategy: Detects competitor tools currently in use and suggests a tailored displacement pitch angle.
4. Sales Battlecard & Objection Handling: Provides custom conversation hooks for cold calls along with anticipated objections and handling strategies.
5. Estimated Budget & Sales Cycle: Projects the prospect's annual software budget range and expected sales cycle timeframe.
6. Multi-Factor Score Breakdown: Itemizes score metrics (0-25 each) across Industry Fit, Company Size Fit, Tech Stack Match, and Growth Signals.

---

## Infrastructure and Production Deployment

The LeadForge application operates in a hybrid production environment:

### Frontend (Vercel)
- Deployed on Vercel with automatic continuous deployment linked to the primary repository branch.
- Communicates with the backend API via secure HTTPS using `NEXT_PUBLIC_API_URL`.

### Backend & Database (Hetzner Cloud VPS)
- Hosted on a Hetzner Cloud VPS instance running Docker Compose (`docker-compose.prod.yml`).
- Containerized Services:
  - api: FastAPI ASGI application server running on Uvicorn workers.
  - worker: arq background worker process executing asynchronous lead discovery jobs.
  - postgres: PostgreSQL 16 database storing tenants, leads, and job statuses.
  - redis: Redis server managing the arq task queue and caching layer.
  - nginx: Reverse proxy handling SSL termination and routing traffic to the API.

---

## Automated CI/CD Deployment Pipeline

Backend updates are automated using a GitHub Actions workflow (`.github/workflows/deploy-backend.yml`).

### Workflow Trigger
The pipeline triggers automatically on every push to the `main` branch when changes occur in:
- `backend/**`
- `docker-compose.prod.yml`
- `.github/workflows/deploy-backend.yml`

### Execution Steps
1. SSH Connection: Authenticates securely with the Hetzner server using SSH private keys (`appleboy/ssh-action`).
2. Source Code Update: Cleans the server repository tree and pulls the latest code from `origin main`.
3. Container Rebuild: Rebuilds and updates the production Docker containers (`docker compose up -d --build api worker`).
4. Database Migrations: Executes pending Alembic database migrations (`docker compose exec -T api alembic upgrade head`).
5. Pruning: Removes unused Docker images to maintain server storage efficiency.

---

## Testing & Quality Assurance Methods

LeadForge implements multi-tiered testing and validation procedures to maintain code stability and reliability:

### Backend Testing Framework
- Pytest & Pytest-Asyncio: Automated test suite located in `backend/tests/` for testing API endpoints, database interactions, and graph node state transitions.
- Async Test Client (HTTPX): Simulates asynchronous client requests against FastAPI routes during integration testing.

### Code Quality & Static Analysis
- Python Compilation Validation: Verification of Python syntax across all nodes and models using `python -m py_compile`.
- Ruff Linter & Formatter: Enforces code style, import sorting, and syntax standards.
- Pyright: Static type checker validating TypeScript-like type safety in Python.

### Frontend Validation
- Next.js Production Build Validation: Local verification executing `npm run build` with Turbopack to ensure static and dynamic page route compilation, zero TypeScript type errors, and proper Clerk authentication provider integration.

---

## Environment Configuration

Copy `.env.example` to `.env` in the backend directory and supply the required API keys:

```env
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/saas_db
REDIS_URL=redis://:redispassword@localhost:6379/0

LLM_PROVIDER=openai
LLM_MODEL=gpt-4o-mini
OPENAI_API_KEY=your-openai-api-key

FIRECRAWL_API_KEY=fc-your-firecrawl-key
TAVILY_API_KEY=tvly-your-tavily-key

CLERK_SECRET_KEY=sk_test_your_clerk_key
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_key
```

---

## Local Development Setup

### Backend
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -e .[dev]
uvicorn app.main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```
