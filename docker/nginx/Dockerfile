# syntax=docker/dockerfile:1

FROM nginx:1.28-alpine

ARG GIT_SHA=unknown
ARG SOURCE_URL=https://github.com/Raipursolution123/sch

LABEL org.opencontainers.image.source="${SOURCE_URL}" \
      org.opencontainers.image.revision="${GIT_SHA}" \
      org.opencontainers.image.title="school-erp-nginx" \
      org.opencontainers.image.description="School ERP reverse proxy (nginx)"

# Compose uses cap_drop: ALL + SETUID/SETGID. Pre-create temp dirs with
# permissive ownership so the master process can start workers safely.
RUN mkdir -p /var/lib/nginx/tmp/client_body \
         /var/lib/nginx/tmp/proxy \
         /var/lib/nginx/tmp/fastcgi \
         /var/lib/nginx/tmp/uwsgi \
         /var/lib/nginx/tmp/scgi \
    && chown -R root:root /var/lib/nginx \
    && chown -R nginx:nginx /var/lib/nginx/tmp /var/log/nginx \
    && chmod 755 /var/lib/nginx /var/lib/nginx/tmp \
    && chmod -R 755 /var/lib/nginx/tmp
