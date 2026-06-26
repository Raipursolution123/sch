# Environment Variables Guide

Copy `.env.example` to `.env` at the repository root.

## Django Core

| Variable               | Required | Default        | Description                          |
|------------------------|----------|----------------|--------------------------------------|
| `SECRET_KEY`           | Yes      | —              | Django secret key (use strong value) |
| `DEBUG`                | Yes      | `False`        | Debug mode (never `True` in prod)    |
| `ALLOWED_HOSTS`        | Yes      | —              | Comma-separated hostnames            |
| `DJANGO_SETTINGS_MODULE` | No     | `config.settings.local` | Settings module           |
| `TIME_ZONE`            | No       | `UTC`          | Application timezone                 |
| `LOG_LEVEL`            | No       | `INFO`         | Logging verbosity                    |

## Database

| Variable       | Required | Default      | Description        |
|----------------|----------|--------------|--------------------|
| `DB_NAME`      | Yes      | `school_erp` | MySQL database     |
| `DB_USER`      | Yes      | —            | MySQL user         |
| `DB_PASSWORD`  | Yes      | —            | MySQL password     |
| `DB_HOST`      | Yes      | `localhost`  | MySQL host         |
| `DB_PORT`      | No       | `3306`       | MySQL port         |
| `MYSQL_ROOT_PASSWORD` | Docker only | —   | MySQL root password |

## Redis & Celery

| Variable                | Required | Default                    | Description          |
|-------------------------|----------|----------------------------|----------------------|
| `REDIS_URL`             | Yes      | `redis://localhost:6379/0` | Cache connection     |
| `CELERY_BROKER_URL`     | No       | Same as REDIS              | Celery broker        |
| `CELERY_RESULT_BACKEND` | No       | Same as REDIS              | Celery results       |

## JWT

| Variable                          | Default | Description              |
|-----------------------------------|---------|--------------------------|
| `JWT_ACCESS_TOKEN_LIFETIME_MINUTES` | 30    | Access token TTL         |
| `JWT_REFRESH_TOKEN_LIFETIME_DAYS`   | 7     | Refresh token TTL        |

## CORS

| Variable              | Description                    |
|-----------------------|--------------------------------|
| `CORS_ALLOWED_ORIGINS` | Comma-separated frontend URLs |

## Frontend (Vite)

| Variable                | Default     | Description              |
|-------------------------|-------------|--------------------------|
| `VITE_API_BASE_URL`     | `/api/v1`   | API base URL             |
| `VITE_APP_NAME`         | `School ERP`| Application display name |
| `VITE_API_PROXY_TARGET` | —           | Vite dev proxy target    |

## Production Security

| Variable              | Default | Description                |
|-----------------------|---------|----------------------------|
| `SECURE_SSL_REDIRECT` | `True`  | Force HTTPS in production  |

## Docker Ports

| Variable        | Default | Description        |
|-----------------|---------|--------------------|
| `BACKEND_PORT`  | 8000    | Backend host port  |
| `FRONTEND_PORT` | 5173    | Frontend host port |
| `HTTP_PORT`     | 80      | Nginx host port    |

## Security Notes

- Never commit `.env` to version control
- Rotate `SECRET_KEY` and database passwords in production
- Use strong, unique passwords for `MYSQL_ROOT_PASSWORD` and `DB_PASSWORD`
- Set `DEBUG=False` in production
- Configure `ALLOWED_HOSTS` with your actual domain names
