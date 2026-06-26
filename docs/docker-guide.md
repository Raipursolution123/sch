# Docker Usage Guide

## Development

Start all services:

```bash
docker compose -f docker-compose.dev.yml up --build
```

Start in background:

```bash
docker compose -f docker-compose.dev.yml up -d --build
```

View logs:

```bash
docker compose -f docker-compose.dev.yml logs -f backend
```

Stop services:

```bash
docker compose -f docker-compose.dev.yml down
```

Reset volumes (destructive):

```bash
docker compose -f docker-compose.dev.yml down -v
```

## Production

```bash
cp .env.example .env
# Edit .env with production values (SECRET_KEY, passwords, ALLOWED_HOSTS, etc.)

docker compose -f docker-compose.prod.yml up -d --build
```

Production stack:

```
Client → Nginx (:80) → Frontend (static SPA)
                      → Backend (:8000) /api/*
                      → Static/Media volumes
```

## Services

| Service        | Dev Port | Description              |
|----------------|----------|--------------------------|
| frontend       | 5173     | Vite dev server          |
| backend        | 8000     | Django + DRF             |
| mysql          | 3306     | Primary database         |
| redis          | 6379     | Cache + Celery broker    |
| celery_worker  | —        | Async task processor     |
| celery_beat    | —        | Scheduled tasks          |
| nginx          | 80       | Production only          |

## Useful Commands

```bash
# Django management
docker compose -f docker-compose.dev.yml exec backend python manage.py migrate
docker compose -f docker-compose.dev.yml exec backend python manage.py shell

# Database shell
docker compose -f docker-compose.dev.yml exec mysql mysql -u school_erp -p school_erp
```

## Image Optimization

- Multi-stage builds for backend and frontend
- Alpine-based Node and Nginx images
- Slim Python base image
- `.dockerignore` excludes dev artifacts
