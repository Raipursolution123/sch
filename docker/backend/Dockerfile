# syntax=docker/dockerfile:1

FROM python:3.12-slim AS base

ARG GIT_SHA=unknown
ARG SOURCE_URL=https://github.com/Raipursolution123/sch

LABEL org.opencontainers.image.source="${SOURCE_URL}" \
      org.opencontainers.image.revision="${GIT_SHA}" \
      org.opencontainers.image.title="school-erp-backend" \
      org.opencontainers.image.description="School ERP Django API"

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /app

# Compile Python dependencies (mysqlclient requires a C toolchain).
FROM base AS builder

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    default-libmysqlclient-dev \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

COPY backend/requirements/ requirements/
RUN pip install --upgrade pip \
    && pip install --prefix=/install -r requirements/prod.txt

# Runtime image: application libs only (no compiler toolchain).
FROM base AS runtime

ARG GIT_SHA=unknown
ARG SOURCE_URL=https://github.com/Raipursolution123/sch

LABEL org.opencontainers.image.source="${SOURCE_URL}" \
      org.opencontainers.image.revision="${GIT_SHA}" \
      org.opencontainers.image.title="school-erp-backend" \
      org.opencontainers.image.description="School ERP Django API"

RUN apt-get update && apt-get install -y --no-install-recommends \
    default-libmysqlclient-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY --from=builder /install /usr/local

# Dev-only dependency layer (kept separate so production never installs dev tools).
FROM builder AS development-deps

COPY backend/requirements/dev.txt requirements/
RUN pip install --prefix=/install -r requirements/dev.txt

FROM runtime AS development

COPY --from=development-deps /install /usr/local

COPY backend/ .
COPY docker/backend/entrypoint.sh /entrypoint.sh
COPY docker/backend/celery_healthcheck.sh /celery_healthcheck.sh
RUN sed -i 's/\r$//' /entrypoint.sh /celery_healthcheck.sh \
    && chmod +x /entrypoint.sh /celery_healthcheck.sh

RUN adduser --disabled-password --gecos '' appuser && chown -R appuser:appuser /app
USER appuser

EXPOSE 8000
ENTRYPOINT ["/entrypoint.sh"]
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]

FROM runtime AS production

COPY backend/ .
COPY docker/backend/entrypoint.sh /entrypoint.sh
COPY docker/backend/celery_healthcheck.sh /celery_healthcheck.sh
RUN sed -i 's/\r$//' /entrypoint.sh /celery_healthcheck.sh \
    && chmod +x /entrypoint.sh /celery_healthcheck.sh

RUN adduser --disabled-password --gecos '' appuser \
    && mkdir -p /app/staticfiles /app/media /app/logs \
    && chown -R appuser:appuser /app

USER appuser

EXPOSE 8000
ENTRYPOINT ["/entrypoint.sh"]
CMD ["gunicorn", "config.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "4", "--threads", "2", "--timeout", "120"]
