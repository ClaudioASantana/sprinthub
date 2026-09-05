# syntax=docker/dockerfile:1

FROM node:22-alpine AS base
WORKDIR /repo
RUN corepack enable && corepack prepare pnpm@11 --activate

FROM base AS deps
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY apps/backend/package.json apps/backend/package.json
COPY apps/frontend/package.json apps/frontend/package.json
COPY apps/sprinthub-admin/package.json apps/sprinthub-admin/package.json
RUN pnpm install --frozen-lockfile

FROM deps AS build
COPY apps/frontend apps/frontend
# Vars VITE_* são embutidas no bundle no momento do build, não dá pra trocar
# em runtime depois — por isso entram como build arg, não env do container.
ARG VITE_ALLOW_DEV_LOGIN=false
ENV VITE_ALLOW_DEV_LOGIN=$VITE_ALLOW_DEV_LOGIN
RUN pnpm --filter frontend build

FROM nginx:1.27-alpine AS runtime
COPY --from=build /repo/apps/frontend/dist /usr/share/nginx/html
COPY apps/frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
