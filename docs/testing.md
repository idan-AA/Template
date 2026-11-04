# Running the tests for real

The suite is integration tests that write and delete real rows. It refuses to start
without `TEST_DATABASE_URL`, and the database name must end in `_test`. Without it,
61 tests fail for that reason alone, which proves nothing. Use a throwaway Postgres,
never the dev database.

## One time: start the throwaway database

```bash
docker run -d --name template-test-pg -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=template_test -p 55432:5432 postgres:17-alpine
```

Port 55432 so it cannot collide with the compose Postgres on 5432. If the container
exists already: `docker start template-test-pg`.

## Every run (set in your own shell, never in a committed file, never read `.env`)

```bash
export DATABASE_URL="postgresql://postgres:postgres@localhost:55432/template_test?schema=public"
export TEST_DATABASE_URL="$DATABASE_URL"
export ALLOWED_SIGN_IN=example.com BETTER_AUTH_SECRET=ci-only-secret-regenerate-for-any-real-deployment
export API_URL=http://localhost:3001 APP_URL=http://localhost:3000
export GOOGLE_CLIENT_ID=ci-only-google-client-id GOOGLE_CLIENT_SECRET=ci-only-google-client-secret
bun run db:deploy
bunx turbo run test --concurrency=1 --continue
```

`--continue` matters: without it turbo stops at the first failing package and hides the rest.
The values are the ones `.github/workflows/ci.yml` uses.

## Baseline on 2026-11-04 (Windows, before any feature work)

About 1,390 tests, 4 failures, all present before our changes:

| Test | Cause |
|---|---|
| telemetry: "hands back the same UUID to two separate processes" | Windows only. `Bun.spawn(["bun", "-e", ...])` hits bun.cmd and rejects a cmd.exe special character. |
| api: "Auth (e2e)" (2 entries) | The `beforeEach` hook times out after 25s, then `app.close` is undefined. Not yet diagnosed. |
| agent: "retireExhausted > retires no more rows than the limit allows" | Returns 3 rows with a limit of 2. Fails when run alone, so it is not order dependent. Not yet diagnosed. |

A change is clean when it adds no failure to this list.

## Other checks (cold, before calling work done)

```bash
bun run check-types
bun run lint
bun run lint:dead
```

`bun run lint` works on Windows since `.gitattributes` forces LF.
