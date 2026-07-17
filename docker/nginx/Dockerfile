# syntax=docker/dockerfile:1

FROM nginx:1.28-alpine

ARG GIT_SHA=unknown
ARG SOURCE_URL=https://github.com/Raipursolution123/sch

LABEL org.opencontainers.image.source="${SOURCE_URL}" \
      org.opencontainers.image.revision="${GIT_SHA}" \
      org.opencontainers.image.title="school-erp-nginx" \
      org.opencontainers.image.description="School ERP reverse proxy (nginx)"

# Compose uses cap_drop: ALL + SETUID/SETGID. The official entrypoint chowns
# /var/cache/nginx/* at startup; without CHOWN/DAC_OVERRIDE that fails unless
# paths are pre-created with correct ownership (same pattern as frontend image).
RUN mkdir -p /var/lib/nginx/tmp/client_body \
         /var/lib/nginx/tmp/proxy \
         /var/lib/nginx/tmp/fastcgi \
         /var/lib/nginx/tmp/uwsgi \
         /var/lib/nginx/tmp/scgi \
         /var/cache/nginx/client_temp \
         /var/cache/nginx/proxy_temp \
         /var/cache/nginx/fastcgi_temp \
         /var/cache/nginx/uwsgi_temp \
         /var/cache/nginx/scgi_temp \
    && chown -R root:root /var/lib/nginx /var/cache/nginx \
    && chown -R nginx:nginx /var/lib/nginx/tmp /var/cache/nginx /var/log/nginx \
    && chmod 755 /var/lib/nginx /var/lib/nginx/tmp /var/cache/nginx \
    && chmod -R 755 /var/lib/nginx/tmp /var/cache/nginx

COPY docker/nginx/entrypoint.sh /entrypoint.sh
RUN sed -i 's/\r$//' /entrypoint.sh && chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
