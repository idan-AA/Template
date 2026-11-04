# Render image for the API. Build context is the repository root:
#   dockerfilePath: ./apps/api/Dockerfile   dockerContext: .
# The bundle is built with --packages=external, so node_modules stays in the image.
FROM oven/bun:1.4.0

WORKDIR /app
COPY . .

# prisma generate needs the variable to exist to load prisma.config.ts. The value
# is never used to connect. Render's real DATABASE_URL is a runtime variable.
ENV DATABASE_URL="postgresql://build:build@localhost:5432/build?schema=public"
ENV NODE_ENV=production

RUN bun install --frozen-lockfile
RUN bun run db:generate
RUN bunx turbo run build --filter=api...

ENV DATABASE_URL=""
EXPOSE 10000
CMD ["bun", "apps/api/dist/main.js"]
