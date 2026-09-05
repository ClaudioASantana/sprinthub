# syntax=docker/dockerfile:1

FROM node:22-alpine AS base
WORKDIR /repo
# Prisma precisa do OpenSSL real no Alpine — sem isso o schema engine
# quebra em runtime ("Could not parse schema engine response").
RUN apk add --no-cache openssl
RUN corepack enable && corepack prepare pnpm@11 --activate

# ---- deps: instala node_modules do monorepo inteiro (cache eficiente) ----
FROM base AS deps
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY apps/backend/package.json apps/backend/package.json
COPY apps/frontend/package.json apps/frontend/package.json
COPY apps/sprinthub-admin/package.json apps/sprinthub-admin/package.json
RUN pnpm install --frozen-lockfile

# ---- build: gera prisma client e compila o Nest ----
FROM deps AS build
COPY apps/backend apps/backend
RUN pnpm --filter backend exec prisma generate
RUN pnpm --filter backend build

# ---- runtime ----
# Mantém node_modules completo (não só --prod): `prisma db seed` usa
# ts-node, que é devDependency. Imagem fica maior, mas evita quebrar o
# `docker compose exec backend npx prisma db seed` na primeira subida.
FROM node:22-alpine AS runtime
WORKDIR /repo
ENV NODE_ENV=production
RUN apk add --no-cache openssl
RUN corepack enable && corepack prepare pnpm@11 --activate

COPY --from=build /repo/node_modules ./node_modules
COPY --from=build /repo/apps/backend ./apps/backend

WORKDIR /repo/apps/backend
EXPOSE 3005
# nest build gera dist/src/main.js (sem rootDir fixo, o tsc inclui
# prisma/seed.ts no cálculo da raiz de saída).
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/src/main"]
