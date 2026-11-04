# Decisions

Newest first. Owner's words where possible.

## 2026-11-04

- **Owner confirmed one repo** after weighing repo-per-client: "have one repo so
  features can continue to be updated and grow." Every client is a separate
  Render deployment with its own URL, database and logins. No shared hub.
- **Each client folder holds two files:** `clients/<id>/render.yaml` (which
  Render services and database to create, and `CLIENT_ID`) and
  `clients/<id>/client.config.ts` (brand, modules, currency, timezone).

- **Render account: the owner's own.** "It'll be my Render account that we'll
  practice on." Practice and first client deploys go there.

- **Bookkeeping = the business keeps its OWN books** (single entity), not a firm
  keeping many clients' books. From the owner: "It's their bookkeeping."
- **One repo for every client.** Each client is a folder `clients/<id>/`
  (config + brand assets), and each Render deploy picks its client with
  `CLIENT_ID`. No forks per client, so a core fix reaches every client.
- **Telemetry off by default.** The crm copy hard-coded Comp AI's PostHog key;
  it is removed. Telemetry runs only with the owner's own key in env vars.

- **This is the owner's template.** "I can basically copy and paste this and use
  this for any business... bookkeeping, boom deploy bookkeeping... a hair salon,
  boom, hair salon." One codebase, one deploy and one database per client,
  modules switched on per client.
- **Build off the crm code** (trycompai/crm v1.16.0, MIT), and "take all of the
  things that are good in the other two repositories and transfer them over".
  relaticle is AGPL-3.0: ideas and designs only, no code. next-shadcn-dashboard-starter
  is MIT: code may be reused.
- **AGENTS.md removed; the repo is the owner's now.** The toolkit CLAUDE.md
  replaces it. Useful crm rules were carried into CLAUDE.md Part 1.
- **Licence:** MIT only asks that the original copyright notice stays in the
  copy. Keep `LICENSE` (add the owner's copyright line above the crm one). It is
  never shown to clients and costs nothing.
- **Hosting: Render.** Convert from Vercel.
- **Git:** the owner sets up git and the remote. The toolkit `.claude` folder
  (hooks, commands, skills, settings) lives in this repo so sessions started here
  load the hooks.
