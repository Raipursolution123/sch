# syntax=docker/dockerfile:1

FROM node:22-alpine AS base

ARG GIT_SHA=unknown
ARG SOURCE_URL=https://github.com/Raipursolution123/sch

LABEL org.opencontainers.image.source="${SOURCE_URL}" \
      org.opencontainers.image.revision="${GIT_SHA}" \
      org.opencontainers.image.title="school-erp-frontend" \
      org.opencontainers.image.description="School ERP React SPA"

WORKDIR /app

# --- Dependencies ---
FROM base AS deps

COPY frontend/package.json frontend/package-lock.json* ./
RUN npm ci && npm cache clean --force

# --- Development ---
# Runs as root for Docker Desktop bind-mount compatibility (Vite writes under
# /app/node_modules). Production SPA serves via nginx:alpine (non-root nginx user).
FROM deps AS development

COPY frontend/ .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

# --- Build ---
FROM deps AS build

ARG VITE_API_BASE_URL=/api/v1
ARG VITE_APP_NAME=School ERP
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_APP_NAME=$VITE_APP_NAME

COPY frontend/ .
RUN npm run build

# --- Production static server ---
FROM nginx:1.28-alpine AS production

ARG GIT_SHA=unknown
ARG SOURCE_URL=https://github.com/Raipursolution123/sch

LABEL org.opencontainers.image.source="${SOURCE_URL}" \
      org.opencontainers.image.revision="${GIT_SHA}" \
      org.opencontainers.image.title="school-erp-frontend" \
      org.opencontainers.image.description="School ERP React SPA"

# Official nginx:alpine ships optional modules pinned to an older nginx-rX
# rebuild. Drop unused modules and upgrade nginx to a patched Alpine package.
# apk overwrites Docker's nginx.conf with Alpine's layout (conf.d at root
# context + http.d for vhosts), which breaks our SPA server block — restore it.
# Alpine also tightens /var/lib/nginx to 0700/0750; with compose cap_drop:ALL
# the master process loses DAC_OVERRIDE and cannot prepare temp/log paths.
RUN cp /etc/nginx/nginx.conf /tmp/nginx.conf.docker \
    && apk upgrade --no-cache \
    && apk del --no-network nginx-module-acme nginx-module-geoip \
         nginx-module-image-filter nginx-module-njs nginx-module-xslt \
    && apk add --no-cache --upgrade 'nginx>=1.28.3-r4' \
    && mv /tmp/nginx.conf.docker /etc/nginx/nginx.conf \
    && rm -rf /etc/nginx/http.d \
    && mkdir -p /var/log/nginx \
         /var/lib/nginx/tmp/client_body \
         /var/lib/nginx/tmp/proxy \
         /var/lib/nginx/tmp/fastcgi \
         /var/lib/nginx/tmp/uwsgi \
         /var/lib/nginx/tmp/scgi \
    && ln -sf /dev/stdout /var/log/nginx/access.log \
    && ln -sf /dev/stderr /var/log/nginx/error.log \
    && chown -R root:root /var/lib/nginx \
    && chown -R nginx:nginx /var/lib/nginx/tmp /var/log/nginx \
    && chmod 755 /var/lib/nginx /var/lib/nginx/tmp \
    && chmod -R 755 /var/lib/nginx/tmp

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx/frontend-spa.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
