# Development Setup Guide

## Prerequisites

- Docker Desktop 4.x+ (recommended)
- OR: Python 3.12+, Node.js 22+, MySQL 8.4+, Redis 7+

## Quick Start (Docker)

```bash
cp .env.example .env
docker compose -f docker-compose.dev.yml up --build
```

Access:

| Service  | URL                          |
|----------|------------------------------|
| Frontend | http://localhost:5173        |
| Backend  | http://localhost:8000        |
| API      | http://localhost:8000/api/v1 |
| Admin    | http://localhost:8000/admin  |

Create a superuser:

```bash
docker compose -f docker-compose.dev.yml exec backend python manage.py createsuperuser
```

## Local Development (without Docker)

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements/dev.txt
cp ../.env.example ../.env
python manage.py migrate
python manage.py runserver
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

### Celery (optional)

```bash
cd backend
celery -A config worker -l info
celery -A config beat -l info
```

## Frontend Hot Reload (HMR)

Vite hot module replacement can fail inside Docker on **Windows** and some **macOS** setups because bind-mounted volumes do not reliably propagate file-system watch events into the container.

### Full Docker stack (fixed)

`docker-compose.dev.yml` sets `CHOKIDAR_USEPOLLING`, `WATCHPACK_POLLING`, and `VITE_HMR_HOST` for the frontend service. `vite.config.ts` reads these and enables polling + correct HMR WebSocket routing to `localhost`.

After pulling these changes, recreate the frontend container once:

```bash
docker compose -f docker-compose.dev.yml up -d --force-recreate frontend
```

Edits under `frontend/src/` should then refresh in the browser without `docker compose down`.

### Recommended for UI work on Windows (fastest)

Run **backend in Docker**, **frontend on the host** for native file watching and instant HMR:

```bash
# Terminal 1 — API, DB, Redis, Celery
docker compose -f docker-compose.dev.yml up mysql redis backend celery_worker celery_beat

# Terminal 2 — Vite dev server (native HMR)
cd frontend
cp .env.example .env   # first time only
npm install            # first time only
npm run dev
```

Open http://localhost:5173 — API calls proxy to `http://localhost:8000` via `VITE_API_PROXY_TARGET`.

### Troubleshooting

| Symptom | Fix |
|---------|-----|
| Changes only appear after container restart | Recreate frontend: `docker compose -f docker-compose.dev.yml up -d --force-recreate frontend` |
| HMR connects but page is blank / WS errors | Ensure `VITE_HMR_HOST=localhost` and port matches `FRONTEND_PORT` (default 5173) |
| Slow reload in Docker on Windows | Use hybrid mode (frontend on host) above |

## Component architecture

Shared UI lives under `frontend/src/components/`:

- **`components/ui/`** — design tokens + primitives (`Button`, `Input`, `Table`, …). Import via `@components/ui` barrel for consistency.
- **`components/forms/`**, **`feedback/`**, **`layout/`** — composed patterns reused across features.
- **Theme** — CSS variables in `frontend/src/assets/styles/index.css`; Tailwind extends them in `tailwind.config.js`. Change colors/spacing in one place.

Settings sub-navigation is defined once in `frontend/src/constants/settings-nav.ts` and shared by the sidebar and settings layout.

## Pre-commit Hooks

```bash
pip install pre-commit
pre-commit install
pre-commit run --all-files
```

## Project Conventions

- Backend apps live in `backend/apps/`
- API versioning under `backend/api/v1/`
- Frontend features under `frontend/src/features/`
- Shared utilities in `backend/common/` and `backend/core/`
