# Setup and local development

Operational detail moved out of the rule docs. `api.md`, `agent.md` and
`environment.md` are what agents read before changing code; this is what a person
reads once.

## First run

```sh
cp .env.example .env        # fill DATABASE_URL, BETTER_AUTH_SECRET, ALLOWED_SIGN_IN
docker compose up -d        # Postgres, matching .env.example
bun run db:migrate && bun run db:seed
bun run dev                 # app :3000, api :3001, agent :2000
```

Prisma from the repo root: `db:generate`, `db:migrate`, `db:push`, `db:reset`,
`db:seed`, `db:studio`, `db:deploy`.

`dev` depends on `^dev:prepare`, so every start applies pending migrations and
regenerates the Prisma client before a single server boots. That is why the first
run needs `db:migrate` only for the seed that follows it. When the database and
`schema.prisma` have diverged past what `migrate deploy` can reconcile,
`dev:prepare` stops the whole run rather than starting servers against a schema
they do not match — reconcile with `db:migrate`, or `db:reset` when the divergence
is an edited migration that has already been applied.

## Google Cloud

- **Enable the Gmail API and the Google Calendar API** on the project.
- **Set the consent screen to User type: Internal** if you are on Workspace.
  `gmail.readonly` is a *restricted* scope, so an External app needs OAuth
  verification plus an annual CASA assessment. Going External later means the full
  review — a decision, not a checkbox.

## The agent bridge

```sh
AGENT_URL="http://127.0.0.1:2000"   # 127.0.0.1, not localhost: eve dev is IPv4-only
AGENT_BRIDGE_SECRET="$(openssl rand -base64 32)"
```

| Agent tab error | Cause |
| --- | --- |
| `503` | `AGENT_BRIDGE_SECRET` unset in the app's process |
| `401` | The two processes hold different secrets, **or** `passThroughEnv` in `apps/app/turbo.json` / `apps/agent/turbo.json` is missing the pair (Turbo is strict-env) |
| `502` | Agent not running, or `AGENT_URL` wrong |

`localDev()` accepts any loopback request, so `curl 127.0.0.1` proves nothing about
the bridge — send `-H 'Host: agent.example.com'`. `GET /eve/v1/info` is the whole
inventory, including a `diagnostics` count that finds files eve silently ignored.

## Running the agent

The agent package's default `dev` command is interactive `eve dev`. The root
Turbo task marks it interactive, so select the agent pane and press Enter before
using the eve TUI. Run `turbo run dev:headless --filter=agent` when a terminal
cannot render the TUI; that uses `eve dev --no-ui`, and the Turbo pane is the
record because only interactive development writes `.eve/logs/` for `eve logs`.
Reach for the Turbo task rather than `bun run --filter=agent dev:headless`: the
package script alone skips `dev:prepare`, so the agent would start against
unmigrated tables.

`hooks/activity.ts` is the replacement narration, **to stderr** (the TUI hides
stdout), printing shape everywhere and argument contents outside production only. It
is **not the audit trail** — `hooks/audit.ts` writes `AgentEvent` regardless.

- A second `bun run dev` fails the whole turbo run.
- An orphaned agent holds the port: `lsof -nP -iTCP:2000 -sTCP:LISTEN`.

### Nothing is researching, and the queue only grows

**`eve dev` never fires schedules on their cron cadence**, and everything visible
still works — the row is written, the sheet says *Queued*, and `dispatch.ts` is never
called. The poke covers this **only when `AGENT_BRIDGE_SECRET` is set**; unset,
`poke()` returns silently and the queue looks exactly like a slow agent.

Tasks the API did not write (`schedule_recheck`) and anything queued while the agent
was down still need a manual run:

```sh
bun run --filter=agent dispatch    # exact production path, both lanes, real credits
```

Its printed `sessionIds` are research rows only, so a run that resolved forty logos
prints an empty list and was not idle. `eve start` (so every Render deploy) does run the schedule.

## Never point a laptop at a client database

`.env.local` is the override the loader reads *last*. If a client's Render
`DATABASE_URL` is ever pasted into it, every process silently points at that client:
`bun run dev` works perfectly against the live database, and `db:migrate` rewrites it.

1. **Do not copy a Render connection string to a laptop.** If you must look at client
   data, use Render's own shell or a one-off `psql` session, never `.env` or `.env.local`.
   If a file is unavoidable, keep it somewhere inert such as `.env.render`, which the
   loader does not read.
2. **`packages/db/scripts/require-local-db.ts` guards `db:migrate`, `db:push`,
   `db:reset`, `db:seed`** and takes `ALLOW_REMOTE_DB=1`. `db:deploy` is unguarded on
   purpose: it is what Render runs. It reads the root files directly rather than
   `process.env`, because Bun auto-loads the working directory's `.env` while Prisma's
   CLI only sees `@app/env/load`.

## Where the app runs: Render

One client is four Render resources, all in one region, all created from one Blueprint
file, `clients/<id>/render.yaml`, written by `bun run new-client <id>` from
`render.yaml.template`:

| Resource | Type | What it is |
| --- | --- | --- |
| `<id>-db` | Postgres | The client's own database. No pooler, so `DATABASE_URL` is the only URL. |
| `<id>-api` | web service, Docker | NestJS API. Also runs the five scheduled jobs itself. |
| `<id>-app` | web service, Docker | The Next.js app. |
| `<id>-agent` | private service, Docker | The research agent, with a 1 GB disk for its workflow state. |

There are no Render cron services. The API runs mailbox sync, exchange rates, the
telemetry rollup, tracking retention and the archive prune on its own, behind a
Postgres advisory lock, and remembers each job's last success in `SchedulerRun` so a
job missed during downtime runs once when the API is back. `docs/environment.md` has
the details.

### Migrations run before each API deploy, and nowhere else

The API service's `preDeployCommand` is `bun run db:deploy && bun
apps/api/scripts/check-schema-drift.mjs`. Render runs it in the freshly built image
before traffic moves, so the schema changes together with the code that needs it. If it
fails, the deploy is cancelled and the old version keeps serving. Only the API runs
migrations; the app and the agent never do.

Every service has `autoDeployTrigger: "off"`: a push never reaches a client by itself.
A migration is forward-only on every client database, so you deploy clients one at a
time, a canary first, from the Render dashboard (Manual Deploy).

### `migrate deploy` is not proof the schema is right

The pre-deploy command follows the migration with `prisma migrate diff --exit-code`
against the Prisma schema (the file `packages/db/prisma/schema.prisma`, or the folder
`prisma/schema` if the schema has been split) and prints a loud warning in the deploy
log when they disagree. **`No pending migrations to apply` only means `_prisma_migrations`
has a row for every file**: it says nothing about what the tables actually look like.

They came apart once, on the earlier host. A `prisma db push` shaped a live database
from a laptop, the migration rows were recorded as applied without their SQL ever
running, and a column went missing in production while every deploy reported nothing
pending. The tell is an object in the database that no migration defines.

Reconciling is one command, and it is worth reading before running:

```sh
DATABASE_URL="..." bunx prisma migrate diff \
  --from-config-datasource --to-schema prisma/schema --script
```

## Deploy a new client

Target: about 15 minutes of hands-on time and no code edits per client. Practice and
first deploys go in the owner's own Render account. Work from the repository root.

**You need before you start**

- Render access to the owner's workspace: a browser login, or `RENDER_API_KEY` set as
  an environment variable (never pasted into a chat, a file or a command line).
- A Google or Microsoft OAuth client id and secret for sign-in (set as a pair).
- `AI_GATEWAY_API_KEY` (a Vercel AI Gateway key; the one Vercel dependency left).
- The sign-in allow-list, `ALLOWED_SIGN_IN` (whole domains or single addresses).
- Ideally a custom domain per client: `app.<client>.com` and `api.<client>.com`.

**Steps**

1. **Make the client.** Run `bun run new-client <id>`. It writes
   `clients/<id>/render.yaml`, copies `client.config.ts` and `brand/` from
   `clients/default` if they do not exist yet, and adds the client to
   `clients/registry.ts`. The id is 2 to 24 characters: lowercase letters, digits and
   hyphens, starting with a letter. It refuses (and writes nothing) if the id is already
   registered or `render.yaml` exists. Then edit `clients/<id>/client.config.ts` (brand,
   modules, currency, timezone), replace the logos in `clients/<id>/brand/`, and commit and
   push to the branch Render deploys (the owner approves pushes). `CLIENT_ID` is read at
   build time too, so it is passed to the app image as a build argument; Render turns
   service environment variables into Docker build arguments, and the `<id>-shared` group
   carries it.
2. **Choose the URLs first.** The web app bakes `API_URL` into the browser bundle when
   it is built, so `API_URL` and `APP_URL` must be right *before* the first build. With a
   custom domain, use it. For a smoke test without one, use the predicted
   `https://<id>-api.onrender.com` and `https://<id>-app.onrender.com`; if Render appends
   a suffix because the name was taken, set the real values afterwards and redeploy
   `<id>-app`.
3. **Create the Blueprint.** Render dashboard, New, Blueprint, pick the repository, set
   **Blueprint Path** to `clients/<id>/render.yaml`. Do not point two Blueprints at the
   same resources.
4. **Fill the prompts** (the variables marked `sync: false`): `API_URL`, `APP_URL`,
   `AUTH_COOKIE_DOMAIN` (only for custom domains on one parent, for example
   `.client.com`, otherwise leave blank), `ALLOWED_SIGN_IN`, `GOOGLE_CLIENT_ID` and
   `GOOGLE_CLIENT_SECRET` (or the Microsoft pair), `AI_GATEWAY_API_KEY`. Render only
   asks during this first creation; later changes are made in the service's
   Environment tab. Secrets, the database URL, the bridge secret, the cron secret and
   the encryption keys are generated or wired by the Blueprint: do not type them.
5. **Apply.** Render creates the database, then builds the three images. The API's
   pre-deploy runs the migrations and the drift check. Expect each build to take several
   minutes.
6. **Custom domains.** Add `api.<client>.com` to `<id>-api` and `app.<client>.com` to
   `<id>-app`. Then make sure `API_URL`, `APP_URL` and `AUTH_COOKIE_DOMAIN` hold those
   values and redeploy `<id>-app` (its URL is baked at build). On raw `onrender.com`
   hosts the app and the API are different sites, so the session cookie is not shared and
   sign-in completes with an empty session: use them for smoke tests only.
7. **OAuth redirect.** In Google Cloud (or Entra) add `API_URL/api/auth/callback/google`
   (or `/microsoft`) as an authorised redirect URI.
8. **Verify** with the checklist below.

## Verify a new client deploy

Tick every line; any miss means the deploy is not done.

- [ ] `<id>-api` log shows `Scheduler started` listing five jobs, and within about a
      minute five `Scheduled job ran` lines (the first run after a fresh database).
- [ ] `GET <API_URL>/health` returns 200 with the database up.
- [ ] `GET <APP_URL>/api/health` returns 200 with no redirect to sign-in.
- [ ] `<id>-agent` log shows eve started, and one line per minute with
      `"event":"agent.dispatch.tick"` (counts of what it found, `durationMs`, and an
      `error` field if the tick failed).
- [ ] `AGENT_SHELL` is `1` in the `<id>-shared` group (the Blueprint sets it), so Chat, the
      agent builder and team agents work. The tick line shows `"shell":"on"`. Know what it
      means: the agent can run code on the agent server, and the sandbox has no network
      isolation. To switch those features off for a client, set `AGENT_SHELL=0` in the
      shared group and redeploy the api and the agent; the app then shows "Not available
      on this deployment", the tick line shows `"shell":"off"`, and the agent log says why
      once at start.
- [ ] Sign in as a user covered by `ALLOWED_SIGN_IN`. The page loads with a session (not
      bounced back to `/sign-in`).
- [ ] The Agent tab answers (a 503 means `AGENT_BRIDGE_SECRET` is missing on the app, a
      401 means the two services hold different secrets, a 502 means `AGENT_URL` is wrong
      or the agent is down).
- [ ] One manual job route works: `curl -X POST -H "Authorization: Bearer $CRON_SECRET"
      <API_URL>/internal/sync/rates` returns 200 (read `CRON_SECRET` from the
      `<id>-shared` group in the dashboard; do not paste it anywhere).
- [ ] `SchedulerRun` has one row per job with `lastError` empty (Render shell on the
      database, `select job, "lastSuccessAt", "lastError" from "SchedulerRun"`).
- [ ] The client's `CLIENT_ID` shown in the `<id>-shared` group matches the folder
      under `clients/`.

## Secrets hygiene

`.gitignore` ignores `.env` and `.env.*` with one negation for `.env.example`, so
`.env.bak` is ignored too. `.env.example` ships no secret — placeholders are empty
strings, asserted by `packages/env/test/root.spec.ts`. **Generate your own secret**;
never reuse one from an example, a tutorial, or another environment.

## Tests

```sh
bun run --filter=api test
bun run --filter=agent test    # integration specs need DATABASE_URL + real Postgres
```

### The test database rebuilds itself when it drifts

`bun run db:test` creates `crm_test` and runs `migrate deploy` on it. The database
name must end in `_test`; the suite deletes rows it expects to put back, so it
refuses anything else.

**`migrate deploy` only applies migrations that are missing. It never removes a
table, a column or a constraint the database has and the schema does not.** A
`crm_test` built on a branch that was later abandoned therefore keeps that branch's
objects forever, and `db:test` used to report `already exists` and move on. The
extra objects are invisible until one of them rejects a write, and then the failure
names a constraint that appears in no migration and in no schema — a stray
`trackedEvent_visitorId_fkey` once failed seven tracking specs this way, on every
branch, for as long as the database survived.

So `db:test` now checks the database it found and rebuilds it when either is true:

- **It holds a migration this branch does not have.** The database came from
  another branch. The name of the first one is printed.
- **It no longer matches `schema.prisma`**, by `prisma migrate diff`. Something
  was pushed or altered by hand.

A rebuild drops the database and re-runs every migration, and it says which of the
two reasons fired. Force one with `bun run db:test --reset`. Nothing else in the
repo may drop a database, and this may only because the `_test` suffix is checked
first.
