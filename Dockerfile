# Container image for hosts that run Docker (RumptyCloud, Fly, a VM). Vercel ignores it.
# Env vars (DATABASE_URL, PV_MASTER_KEY, PV_DEMO_AUTH, Supabase keys...) are read at runtime.
# Maintenance runs in-app from traffic (lib/server/maintenance.ts), so no scheduler is needed.
FROM node:24-slim AS deps
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/protocol/package.json packages/protocol/
COPY packages/countries/package.json packages/countries/
RUN pnpm install --frozen-lockfile

FROM deps AS build
COPY . .
# Baked into static pages (sitemap, metadata); set to the public URL of this deployment.
ARG NEXT_PUBLIC_SITE_URL=https://payvault.rumptycloud.app
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL NEXT_OUTPUT=standalone NEXT_TELEMETRY_DISABLED=1
RUN pnpm build
# The migration script runs outside the Next bundle and needs the postgres driver (no deps).
RUN mkdir -p /migrate/node_modules && cp -rL node_modules/postgres /migrate/node_modules/postgres

FROM node:24-slim AS run
WORKDIR /app
ENV NODE_ENV=production HOSTNAME=0.0.0.0 PORT=8080 NEXT_TELEMETRY_DISABLED=1
COPY --from=build --chown=node:node /app/.next/standalone ./
COPY --from=build --chown=node:node /app/.next/static ./.next/static
COPY --from=build --chown=node:node /app/public ./public
COPY --from=build --chown=node:node /app/scripts/migrate.mjs ./scripts/migrate.mjs
COPY --from=build --chown=node:node /migrate/node_modules ./scripts/node_modules
COPY --from=build --chown=node:node /app/supabase/migrations ./supabase/migrations
USER node
EXPOSE 8080
# Applies pending migrations (each once), then serves. A failed migration stops the release.
CMD ["sh", "-c", "node scripts/migrate.mjs && node server.js"]
