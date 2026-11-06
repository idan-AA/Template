# Decisions

Newest first. Owner's words where possible.

## 2026-11-06

- **Agents share one signed-in "agent Chrome".** Asked to choose between a fresh signed-out
  browser per agent (owner signs in by hand each time) and one shared agent Chrome that signs
  itself in, the owner chose the shared one. It is a separate Chrome with its own profile
  (never the owner's), DevTools on 127.0.0.1:9333; `scripts/agent-browser-login.mjs` signs it in
  with a dedicated QA member whose login lives in `.env`, which agents never read. Agents use only
  the tabs they open.

- **Nothing runs locally.** Owner: "Don't run anything locally. We have a live version."
  No bun install, dev server or local Postgres on this machine. Verification happens on the
  live practice deploy (https://practice-app-af4x.onrender.com) after the owner approves a push
  and the deploy runs. Agents still read code and write code; the type check and build run in
  Render's build.
- **Push straight to main.** Owner: "just push to main" (asked: branch plus pull request, or
  main). GitHub CI (type check, lint, tests on a real database) runs on every push to main and
  is the check; a push to main does not deploy the practice site (auto-deploy is off), the owner
  clicks Deploy in Render.
- **No GitHub Actions.** Owner: "there should not be github actions." The workflows in
  `.github/workflows` (inherited from crm) never run on this repo. The only build check is
  Render's build (the web build type-checks; lint and tests do not run anywhere). Verify on the
  live practice deploy.

- **Order of work confirmed.** First the manager checks the live practice deploy as a
  user would, and anything broken goes to the first builder. Then two builders in parallel:
  the developer account with its Features page, and the bookkeeping screens.

## 2026-11-05

- **Security audit blocks deploys, not backups.** The first push stopped at the
  dependency audit (critical holes in Next.js 16.3.8 and better-auth 1.6.33).
  The owner chose: back the code up to GitHub now with only the audit skipped,
  after every other push check passes; upgrade the dependencies next; nothing is
  deployed to Render until the full push check, audit included, passes.

- **A developer account sits above the owner, inside every client deploy.**
  Owner: "there should be an owner account, but there should be a developer
  account that actually has the ability to choose what the person gets access
  to... For now, for testing, I should be able to see everything." He chose the
  in-app version: the developer account (named by an environment variable, so a
  client cannot delete or demote it) always sees everything and has a Features
  page to switch modules on or off for that client without a code edit or a
  redeploy. `clients/<id>/client.config.ts` stays the starting set. This changes
  D1/D3 in `docs/plan/template-modules.md` (modules decided only in code, a
  disabled module not mounted): module switches become runtime state.
- **Local testing shows every module.** Dev servers run with
  `ENABLED_MODULES=crm,bookkeeping` until the developer account lands.
- **Rebrand pass is the next phase** for a free session (chosen over bookkeeping
  screens and moving CRM behind its switch).

- **The agent sandbox ("shell") is ON for Render deploys.** Asked what the Chat
  tab should do on Render (it is built on the shell, which was off for safety),
  the owner chose "Turn the sandbox on" over making a plain chat work without it
  or hiding Chat. So `render.yaml.template` sets `AGENT_SHELL=1` and Chat, the
  agent builder and team agents work on every client deploy. Accepted trade-off,
  stated to the owner when he chose: the agent can run code on the server and the
  sandbox has no network isolation. The "not available on this deployment" gating
  stays for any host where the shell is off.

## 2026-11-04

- **Sign-in must never depend on a Google (or Microsoft) OAuth client.** Owner:
  "I don't actually like that I need a Google OAuth. I should be able to create a
  login and not be locked out." So: email and password sign-in is always on; the
  first person on an empty database creates the owner account from the sign-in
  page; admins add members and reset passwords from Settings > Members (no email
  needed); Google, Microsoft and SSO stay as optional extras. `ALLOWED_SIGN_IN`
  only gates people who arrive by themselves through Google, Microsoft or SSO; a
  member an admin created is allowed by that act. Email-based password reset
  arrives with the email infrastructure (Later).
- **Deploying is the next milestone** (owner: "How about I deploy it?"), in this
  order: password sign-in lands, manager reviews it with the modules work, owner
  gives the word to commit and push, practice deploy on the owner's Render account.

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
