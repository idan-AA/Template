# Render image for the agent (private service). Build context is the repository root:
#   dockerfilePath: ./apps/agent/Dockerfile   dockerContext: .
FROM oven/bun:1.4.0

WORKDIR /app
COPY . .

ENV DATABASE_URL="postgresql://build:build@localhost:5432/build?schema=public"

RUN bun install --frozen-lockfile
RUN bun run db:generate
RUN bunx turbo run build --filter=agent...

ENV DATABASE_URL=""
ENV NODE_ENV=production
EXPOSE 10000
CMD ["bun", "apps/agent/scripts/start.ts"]
