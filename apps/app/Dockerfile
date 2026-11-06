# Render image for the web app. Build context is the repository root:
#   dockerfilePath: ./apps/app/Dockerfile   dockerContext: .
# Render turns service environment variables into build arguments. API_URL is
# baked into the browser bundle (next.config.ts), so it must be set before the
# first build. NEXT_PUBLIC_API_URL is set from it here because the app's turbo
# build task passes NEXT_PUBLIC_API_URL through but hides API_URL.
FROM oven/bun:1.4.0

WORKDIR /app
COPY . .

ARG API_URL
ARG APP_URL
ARG CLIENT_ID
ENV API_URL=${API_URL}
ENV NEXT_PUBLIC_API_URL=${API_URL}
ENV APP_URL=${APP_URL}
ENV CLIENT_ID=${CLIENT_ID}
ENV DATABASE_URL="postgresql://build:build@localhost:5432/build?schema=public"
# better-auth refuses to load without a secret while pages prerender at build.
# This placeholder is only for `next build`, is never used to sign anything, and
# Render's real BETTER_AUTH_SECRET (runtime) replaces it.
ENV BETTER_AUTH_SECRET="build-only-placeholder-not-a-real-secret-0000"
ENV NEXT_TELEMETRY_DISABLED=1

RUN bun install --frozen-lockfile
RUN bun run db:generate
# The web app's tRPC types come from apps/api/src/generated/server.ts. Regenerate it
# from the routers so a router added without a local run still builds (owner decision
# 2026-11-06: nothing runs locally). Fails the build if a router does not parse.
RUN bun run --cwd apps/api trpc:generate
RUN bunx turbo run build --filter=app...

ENV DATABASE_URL=""
ENV BETTER_AUTH_SECRET=""
ENV NODE_ENV=production
EXPOSE 10000
CMD ["bun", "run", "--cwd", "apps/app", "start"]
