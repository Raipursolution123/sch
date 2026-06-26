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
