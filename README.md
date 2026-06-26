# School ERP

Enterprise-grade, multi-school ERP platform foundation. This repository contains the production-ready architecture scaffold — authentication, infrastructure, and development tooling — without business modules.

## Tech Stack

| Layer          | Technologies                                              |
|----------------|-----------------------------------------------------------|
| Frontend       | React 19, TypeScript, Vite, Tailwind, TanStack Query, Zustand |
| Backend        | Django 5, DRF, SimpleJWT, Celery                          |
| Data           | MySQL 8.4, Redis 7                                        |
| Infrastructure | Docker, Nginx, GitHub Actions                             |

## Quick Start

```bash
cp .env.example .env
docker compose -f docker-compose.dev.yml up --build
```

| Service  | URL                          |
|----------|------------------------------|
| Frontend | http://localhost:5173        |
| Backend  | http://localhost:8000        |
| API      | http://localhost:8000/api/v1/ |

```bash
docker compose -f docker-compose.dev.yml exec backend python manage.py createsuperuser
```

## Repository Structure

```
school-erp/
├── backend/                 # Django API application
│   ├── apps/                # Django domain apps (accounts, future modules)
│   ├── api/                 # API versioning & URL routing
│   ├── core/                # Shared domain primitives (models, permissions, middleware)
│   ├── common/              # Cross-cutting utilities (pagination, responses, exceptions)
│   ├── config/              # Django project settings, Celery, WSGI/ASGI
│   ├── requirements/        # Python dependencies (base, dev, prod)
│   ├── media/               # User-uploaded files (gitignored in prod)
│   └── static/              # Development static assets
├── frontend/                # React SPA
│   └── src/
│       ├── app/             # App shell, providers, query client
│       ├── routes/          # React Router configuration
│       ├── layouts/         # Page layouts (auth, dashboard, main)
│       ├── features/        # Feature modules (auth, dashboard, home)
│       ├── components/      # Shared UI components
│       ├── services/        # API client & service layer
│       ├── hooks/           # Custom React hooks
│       ├── store/           # Zustand state stores
│       ├── types/           # TypeScript type definitions
│       ├── constants/       # App constants & env config
│       └── assets/          # Styles, images, fonts
├── nginx/                   # Nginx reverse proxy configs
├── docker/                  # Dockerfiles & entrypoint scripts
├── docs/                    # Documentation
├── scripts/                 # Dev helper scripts
├── .github/workflows/       # CI/CD pipelines
├── docker-compose.dev.yml   # Development orchestration
├── docker-compose.prod.yml  # Production orchestration
└── .env.example             # Environment variable template
```

## Folder Guide

| Folder | Purpose |
|--------|---------|
| `backend/apps/` | Business domain Django apps. Currently `accounts` (User, Role, Permission). Future: `schools`, `students`, etc. |
| `backend/api/` | Versioned API entry points. Add `v2/` when breaking changes are needed. |
| `backend/core/` | Framework-level shared code: base models, RBAC permissions, health checks, Celery tasks. |
| `backend/common/` | Reusable API utilities not tied to a domain. |
| `backend/config/` | Django settings split by environment (`base`, `local`, `production`). |
| `frontend/src/features/` | Feature-based modules — each owns pages, hooks, and feature-specific components. |
| `frontend/src/services/` | Axios client with JWT refresh interceptor and typed API services. |
| `docker/` | Multi-stage Dockerfiles optimized for dev and prod. |
| `nginx/` | Production reverse proxy: API routing, static/media, security headers, gzip. |
| `scripts/` | Shell helpers for common dev operations. |
| `docs/` | Setup guides and environment reference. |

## Architecture

```
                    ┌─────────────┐
                    │   Client    │
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │    Nginx    │  (production)
                    └──────┬──────┘
              ┌────────────┼────────────┐
              │                         │
       ┌──────▼──────┐          ┌──────▼──────┐
       │  Frontend   │          │   Backend   │
       │  (React)    │          │  (Django)   │
       └─────────────┘          └──────┬──────┘
                                       │
                              ┌────────┼────────┐
                              │                 │
                       ┌──────▼──────┐  ┌──────▼──────┐
                       │    MySQL    │  │    Redis    │
                       └─────────────┘  └──────┬──────┘
                                                │
                                    ┌───────────┼───────────┐
                                    │                       │
                             ┌──────▼──────┐        ┌───────▼───────┐
                             │Celery Worker│        │ Celery Beat   │
                             └─────────────┘        └───────────────┘
```

## API Endpoints (Foundation)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register/` | User registration |
| POST | `/api/v1/auth/login/` | Login (returns JWT) |
| POST | `/api/v1/auth/logout/` | Blacklist refresh token |
| GET/PATCH | `/api/v1/auth/me/` | Current user profile |
| POST | `/api/v1/auth/token/` | JWT token obtain |
| POST | `/api/v1/auth/token/refresh/` | Refresh access token |
| GET | `/health/` | Health check |
| GET | `/health/ready/` | Readiness check (DB) |

## Authentication Foundation

- **Custom User model** — email-based authentication with UUID primary key
- **JWT** — access + refresh tokens with rotation and blacklisting
- **RBAC foundation** — `Role`, `Permission`, `RolePermission`, `UserRole` models
- **Permission classes** — `IsSuperAdmin`, `HasRolePermission` ready for module integration

## Development

See [docs/development-setup.md](docs/development-setup.md) for detailed instructions.

```bash
# Pre-commit hooks
pip install pre-commit
pre-commit install

# Backend lint
cd backend && black . && isort . && flake8 .

# Frontend lint
cd frontend && npm run lint && npm run format:check
```

## Docker

See [docs/docker-guide.md](docs/docker-guide.md).

```bash
# Development
docker compose -f docker-compose.dev.yml up -d

# Production
docker compose -f docker-compose.prod.yml up -d --build
```

## Environment Variables

See [docs/environment-variables.md](docs/environment-variables.md).

## CI/CD

GitHub Actions workflow (`.github/workflows/ci.yml`):

- Backend: Black, isort, Flake8, pytest
- Frontend: ESLint, Prettier, TypeScript, Vite build
- Docker: multi-stage image builds

## Next Steps (Recommended)

1. **Schools module** — multi-tenancy with `school_id` scoping on all models
2. **Seed roles** — management command for default platform/school roles
3. **API documentation** — drf-spectacular for OpenAPI/Swagger
4. **Monitoring** — Sentry, structured logging, Prometheus metrics
5. **HTTPS** — Let's Encrypt certificates in production Nginx config

## License

Proprietary — All rights reserved.
