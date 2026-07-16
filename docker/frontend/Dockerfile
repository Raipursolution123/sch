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

# Pull latest Alpine security fixes for packages bundled in the base image.
RUN apk upgrade --no-cache

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx/frontend-spa.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
