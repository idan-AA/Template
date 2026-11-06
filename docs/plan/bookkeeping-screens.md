# Bookkeeping screens: findings and build rounds

Audience: you and the next agent. Written by Agent 3 on 2026-11-06 (research only, HEAD ccbdcc6), reviewed by the manager: key claims re-checked against code (MODULE_API.bookkeeping empty, can() has no callers, meta.ts nav/settings empty, 5 bookkeeping models). Manager decisions: payments round (C) BEFORE banking (D) approved; base currency only through Round D; print view only for invoices in v1. Test results in docs/plan/bookkeeping.md 12.0 are UNVERIFIED until bun and a throwaway Postgres exist on this machine.

### 0. What I did NOT verify (read this first)

- **I did not run the bookkeeping tests.** This machine has no `bun`, no `node_modules` and no Postgres (checked: `bun` not on PATH in Bash or PowerShell, `Template/node_modules` and `packages/modules/node_modules` absent, nothing on port 5432). Getting them means `bun install` into the shared checkout plus a throwaway Postgres in Docker. I judged that outside "read-only research" with Agents 1 and 2 in the same tree. The attempt to run `bun test` failed with `bun: command not found`.
- The test status in `docs/plan/bookkeeping.md` 12.0 (389 pass, 0 fail, 200-seed fuzz, `migrate status` clean, on 2026-11-05) is **unverified by me**. Treat it as the previous Agent 3's claim. The test files exist: `packages/modules/test/bookkeeping/*.spec.ts`, 17 files, 9,410 lines including helpers.
- The code reading below is real (files opened and grepped). Nothing was run live and no browser was used.
- Manager: if you want the tests re-run, tell me, and approve a `bun install` plus a Docker Postgres on a spare port.

### 1. Findings: what is really built (the plan's status table is stale in both directions)

**Built (engine, ledger, schema, seed):**

| Piece | Evidence |
|---|---|
| Pure engine: money, fx, time, validate, decimal | `packages/modules/bookkeeping/engine/{money,fx,time,validate,decimal}.ts` |
| Document maths (tax exclusive/inclusive, discount, totals) | `engine/document.ts:69-116` (`splitGross`, `addTax`, `computeLine`, `computeDocument`) |
| Posting builders for R1 to R4 (invoice, bill, credit note, vendor credit) | `engine/builders/documents.ts:30` `buildDocumentEntry` |
| Payment builders R5 to R9 (receipt, payout, refund, apply credit, FX settlement) | `engine/builders/payments.ts:49,98,251` |
| Bank builders R11 to R13 (spend/receive, park in Uncategorized, transfer) | `engine/builders/bank.ts:40,133,165` |
| Manual journal and opening balances R17, R18 | `engine/builders/manual.ts:83,112` |
| Reversal, void document, void payment R14 to R16 | `engine/builders/reversal.ts:17,62,77,87` |
| Business-day helpers: `businessToday`, `fiscalYearStart`, `agingBucket`, `isOverdue` | `engine/time.ts:46,85,99,108` |
| Ledger services over Postgres: `post`, `reverse`, `loadPostingContext`, `loadEntryView`, `setSession` | `ledger/posting.ts:146,251,52,97,44` |
| Report queries: `trialBalance`, `generalLedger` (ONLY these two) | `ledger/queries.ts:14,58` |
| Prisma: 12 models/enums only: `LedgerSettings`, `NumberSequence`, `LedgerAccount`, `JournalEntry`, `JournalLine` plus 7 enums | `packages/db/prisma/schema/bookkeeping.prisma:74-152` |
| Migrations: core, guards (CHECKs, G1 to G5, G7, G8, G13), plus core audit table | `packages/db/prisma/migrations/20261104193000_audit_event`, `20261104210000_bookkeeping_core`, `20261104210100_bookkeeping_guards` |
| Seed: settings, 5 number sequences, system accounts, ONE preset (`general-services`); a requested other preset silently falls back to it | `packages/db/src/seeds/bookkeeping.ts:21,214-216`; hook in `packages/modules/bookkeeping/server.ts:10-17` |
| Module declaration: 8 permission keys, roles `bookkeeper` and `accountant`, one widget id | `packages/modules/bookkeeping/meta.ts:16-41` (role matrix matches plan section 8) |
| Role list is data, not a literal (the spike's required change is done) | `packages/auth/src/organization.ts:3,25,29` read `workspaceRoleIds()` from `packages/modules/src/runtime.ts:100` |
| `can(role, key)` helper | `packages/modules/src/runtime.ts:126` |

**NOT built (this is what blocks screens):**

1. **No API at all.** `MODULE_API.bookkeeping` is `[]` (`apps/api/src/modules/registry.ts`). No router, contracts or service exists. Zero tRPC procedures for accounts, journal, settings or reports.
2. **Permission keys are declared but enforced nowhere.** `can()` has no caller outside tests (grep of `apps` and `packages`). `AuthMiddleware` checks only the session (`apps/api/src/trpc/middlewares/auth.middleware.ts`), and `AuthedTrpcContext` carries `user` but no role (`apps/api/src/trpc/context.types.ts`). The first router must add the role lookup and the check, in middleware AND service. The role-from-member pattern already exists: `apps/api/src/tracking/tracking.service.ts:483-488`.
3. **Most of the schema is missing.** No `Counterparty`, `BookDocument`, `BookDocumentLine`, `TaxRate`, `LedgerPayment`, `DocumentAllocation`, `LedgerBankAccount`, `BankImport`, `BankTransaction`, `BankMatch`, `BankRule`, `BankSuggestion`, `BookkeepingProposal`, `BookAttachment`. So invoices, bills, payments and banking have a tested posting engine but nowhere to store the documents they post. Migrations G6, G9 to G12 do not exist yet.
4. **No UI.** No route under `apps/app/app/(app)/[slug]/` for books. `meta.ts` has `nav: []` and `settings: []` (`meta.ts:13-14`). The only trace is the declared widget `bookkeeping.overview` listed in `WIDGETS_NOT_BUILT_YET` (`apps/app/app/(app)/[slug]/widget-ids.ts`). The `ledger` nav icon key exists (`packages/modules/src/define-module.ts:17`, mapped in `apps/app/lib/nav-icons.ts:13`). The rail, overview and settings already render module nav, widgets and settings items (`apps/app/lib/modules.ts`, `settings/settings-items.ts`), so declaring them in `meta.ts` is enough to make them appear.
5. **Reports:** only trial balance and general ledger have queries. No P&L, balance sheet, aging, cash summary, bank rec, tax summary, journal report; no CSV export; no integrity-check job (11.1); no Attention source.
6. **`WIDGET_SLOTS` is only `["overview"]`** (`define-module.ts:23`); fine for now.
7. Bank import code (CSV parse, fingerprint, matching passes) does not exist anywhere.

**Verdict:** "bookkeeping ledger" is accurate for phase 1 only. With no new tables, the following can be fully built as real screens today: accounts, account ledger, journal, trial balance, settings (lock dates, numbering). Everything the owner does daily (invoices, bills, payments, bank) needs migrations first.

### 2. The real week, and the screen for every task

Owner, phone first; bookkeeper, desktop first; accountant, tax time. "Built?" is whether the backend exists. "Screen" is the plan's route.

| Who / when | Task | Screen | Built? |
|---|---|---|---|
| Owner, daily | See cash, who owes me, what I owe, profit this month (O4) | `/books` Home cards | No (needs docs, payments, reports) |
| Owner, daily | Bill a customer in 60 seconds (O1) | `/books/sales/new` | No (docs schema) |
| Owner, daily | Who is late, one tap to record a payment (O2) | `/books/sales?tab=overdue` then Record payment sheet | No |
| Owner, weekly | Bills due this week, pay in two taps (O3) | `/books/purchases` "Due this week" strip, Record payment | No |
| Owner, daily | Clear the bank feed on my phone (O5) | `/books/banking/[id]` card stack | No (bank schema) |
| Owner, daily | **GAP in plan:** log a cash/card purchase with no bank file yet | `/books/banking/[id]` "Add transaction" (manual line, then Categorise). Plan has bank spend only from an imported line | Plan gap, planned below |
| Owner, daily | Owner takes money out or puts money in | Categorise to 3200 Owner's Draws / 3300 Contributions on the review card | Accounts exist in seed |
| Owner, monthly | Send the accountant what they need (O6) | Settings > Members (invite role `accountant`) and `/books/reports/bundle` | Role exists; bundle No |
| Owner, any | **GAP:** send an invoice to the customer | Print-friendly invoice page (browser print/PDF). Emailing and public link are Later (needs core send helper, `email-infrastructure`) | Plan says print page; I confirm no public link in v1 |
| Owner, any | **GAP:** chase a late payer | Overdue tab shows customer phone/email with copy buttons. Reminders Later | Planned as small |
| Bookkeeper, daily | Import bank file, clear queue to zero (B-1) | `/books/banking/[id]/import`, then review queue | No |
| Bookkeeper, daily | Enter bills/invoices in batches, duplicate warning (B-2) | `/books/purchases/new`, `/books/sales/new` | No |
| Bookkeeper, daily | Find what a number is made of (B-5) | Any report figure opens `/books/accounting/accounts/[id]` ledger in a new tab, then the entry, then the source doc | Account ledger query exists; reports no |
| Bookkeeper, weekly | Fix a mistake without deleting (B-4) | Void/Reverse buttons on invoice, payment and `/books/accounting/journal/[id]`, then "Create corrected copy" | Reverse engine+service exist, no UI |
| Bookkeeper, month end | Tie bank to ledger, clear Uncategorized (B-3) | `/books/reports/bank-reconciliation`, Attention list on Home | No |
| Bookkeeper / accountant | Post an adjustment (accrual, depreciation) (A-3) | `/books/accounting/journal/new` (desktop only) | **Yes: engine + `post` exist**, no UI |
| Accountant, tax time | Review year: TB, GL, P&L, BS, tax summary (A-2) | `/books/reports/*` | TB and GL queries only |
| Accountant, year end | Lock the books (A-4) | Settings > Books > Lock dates | Table exists, no UI/service |
| Accountant, year end | Take the data away (A-5) | `/books/reports/bundle` | No |
| Owner/accountant, once | Set up: currency, chart preset, bank accounts, opening balances, tax rates | Settings > Books checklist, setup wizard | Seed only; **no screen to add a bank account is planned outside the wizard: gap, added in Round D** |

Gaps added beyond the plan: manual "Add transaction" on a bank account; an explicit "Add bank account" screen (not only inside the wizard); overdue contact copy buttons; confirming print view as the only v1 invoice output.

### 3. Screens in build order (most used first, but sequenced by what has a backend)

Common to every screen (plan 5.2): URL filters via `nuqs` (`url-structure`), money formatted from minor-unit strings (`z.string().regex(/^-?\d+$/)` over the wire, plan 0.11), base currency labelled, empty state with one action, loading/error/403 states, `packages/ui` components only (`data-table`, `card-table`, `sheet`, `drawer`, `stat-card`, `empty`, `tabs`; see `docs/design.md`), no dashes in copy, every user string through the translation function if the app is translated. Layout of each route group: `requireModule("bookkeeping")` (`apps/app/lib/modules.ts`, same as `companies/layout.tsx`).

Permission shorthand: R=`bookkeeping.read`, W=`.write`, P=`.post`, B=`.bank`, Rep=`.reports`, S=`.settings`, L=`.lock`, Re=`.reopen`.

#### Round A: Foundation and Accounting (no new tables, shippable alone, accountant-first)

1. **Books shell**: rail item "Books" (nav `/books`, prefix, icon `ledger`) with a segmented bar Sales, Purchases, Banking, Accounting, Reports (tabs not yet built are hidden, not disabled). Layout checks module and permission. Phone: bar scrolls horizontally.
2. **`/books/accounting/accounts`** chart of accounts. Purpose: see every account and balance. Columns: code, name, type, subtype, balance (base, debit/credit shown by normal side), status (system lock icon, archived). Tree grouped by type; filters: type, show archived, search. Primary action: Add account (S). Row opens ledger. Empty state: cannot be empty (seed), but if `LedgerSettings` is missing show "Run setup" with the owner command text. Phone: grouped list, balance right-aligned, tap opens ledger. Endpoint: new `bookkeeping.accounts.list` (balances via a new sum query over posted lines). Perm: Rep to see balances, R-only users see nothing in this area (plan 8: ledger needs Rep).
3. **`/books/accounting/accounts/[id]`** account ledger (drill-down target for every report later). Fields: opening balance, per line: date, entry number (link), source, memo, counterparty (later), debit, credit, running balance; closing. Date range filter (default fiscal year to date from `fiscalYearStart`, `engine/time.ts:85`). Primary action: Export CSV. Empty: "No postings in this range." Phone: cards, running balance in the card. Endpoint: `generalLedger` (`queries.ts:58`) plus a new opening-balance query (current query has no opening balance row: **gap**). Perm: Rep.
4. **`/books/accounting/journal`** entries list. Columns: number, date, source, memo, total, posted by, reversed flag. Filters: date range, source, status. Primary: New journal (P, desktop). Empty: "No entries yet." Phone: cards, create button replaced by "Use a larger screen" note. Endpoint: new `journal.list`. Perm: Rep.
5. **`/books/accounting/journal/new`** manual journal. Fields: date, memo, source kind (Manual or Adjustment; Adjustment needs memo), lines (account, debit, credit, memo), live balanced bar. AR, AP, bank and card accounts are refused (engine rule R17, `builders/manual.ts:83`). Actions: Save draft (W), Post (P). Perm check again in service. Date inside a lock shows the lock reason; override only with L and a reason. Endpoint: `journal.createDraft`, `journal.post` (wraps `post`, `ledger/posting.ts:146`). Desktop only.
6. **`/books/accounting/journal/[id]`** entry view: header (number, date, source, posted by/at, memo), lines with account links, source link (when a source id exists), history tab from the core audit table, link to reversal / original. Primary: Reverse (P), requires a reason, date defaults to `businessToday()` (`engine/time.ts:46`). Endpoint: `loadEntryView` (`posting.ts:97`), `reverse` (`posting.ts:251`). Phone: view works fully.
7. **`/books/reports/trial-balance`** and **`/books/reports/general-ledger`**. Header states basis, as-of or range, base currency, time zone, generated-at, lock date, "N draft entries not included". Footer proof: total debits = total credits (green tick or red mismatch). Every account row links to the account ledger in a new tab. Export CSV mirrors screen (UTF-8 BOM, ISO dates). Endpoint: `trialBalance` (`queries.ts:14`, but it JOINs `journalLine` so zero-activity accounts are dropped: **fix needed**, the roster rule requires every account including zeros; change to LEFT JOIN or union with accounts). Phone: key totals cards, expandable groups, export still available. Perm: Rep.
8. **Settings > Books** (`/settings/books`; declared in `meta.ts` `settings`). Sections: Lock dates (soft, hard; moving forward needs L, moving back needs Re and is owner only, G8 sets `app.reopen`), Numbering (prefix, padding, next value forward only per G13), Fiscal year start month, Base currency and time zone (read-only after first post, `firstPostedAt`). Primary: Save. Endpoint: new `settings.get/update`. Perm: S (dates: L / Re). Writes the audit row in the same transaction.
9. **`/books` home (Round A version)**: three cards only: Uncategorized (suspense) balance, Opening Balance Equity balance, entries this month; link list to accounts/journal/reports; setup checklist stub if `setupCompletedAt` is null. Phone: stacked. The real home arrives in Round E. Perm: R/Rep.

#### Round B: Customers, vendors, documents, core reports

Schema: `Counterparty`, `BookDocument`, `BookDocumentLine`, `TaxRate` plus G9 and the duplicate-bill partial unique index (Tier 2 ADD, access note in plan 3). Backend: `DocumentService` (draft CRUD, issue = `buildDocumentEntry` + `post` in one transaction, void = `buildVoidDocument`), numbering at issue from `NumberSequence`.
10. **`/books/customers`, `/books/customers/[id]`**, **`/books/vendors`, `/books/vendors/[id]`**: name, email, phone, tax id, address, default terms days, default account, notes, archive (never delete). Detail: open items, history. Quick-add from invoice needs only a name. Perm R view, W edit.
11. **`/books/sales`** list with tabs All, Draft, Awaiting payment, Overdue, Paid, Void (counts on tabs). Columns: number, customer, issue, due, total, balance, status chip. Primary: New invoice (W). Empty: "No invoices yet. Create your first invoice." Phone: card list, filter chips scroll. Perm R.
12. **`/books/sales/new`, `/books/sales/[id]`**: the O1 flow. Fields: customer, issue date, due date (from terms), reference/PO, lines (description, qty, unit price, discount %, account, tax rate), totals preview (subtotal, tax, total, from `computeDocument`, `engine/document.ts:116`), notes, terms. Actions: Save draft (W), Issue (P). Issued view: read-only; editable only due date, reference, notes, terms (G9); History tab; Void (P, reason); Create corrected copy; Print view. Phone: one card per line, sticky total bar, 8 taps or fewer for one line. Credit notes use the same sheet with kind CREDIT_NOTE.
13. **`/books/purchases`, `/books/purchases/new`, `/books/purchases/[id]`**: same shape for bills and vendor credits; "Due this week" strip; vendor invoice number in `reference` with the duplicate-bill warning on save.
14. **Reports**: P&L (range, compare), Balance sheet (as of), AR aging, AP aging, Tax summary, each with its proof footer (plan 6). New queries needed: `profitAndLoss`, `balanceSheet`, `aging`, `taxSummary` in `ledger/queries.ts`, all from posted lines only. Report-verification (all five questions) for each before it is called done.

#### Round C: Payments (recommended to move BEFORE banking; see question 1)

Schema: `LedgerPayment`, `DocumentAllocation`, G10. Backend: payment service over `buildPaymentEntry` (`payments.ts:98`), `buildApplyCreditEntry` (`payments.ts:251`), refund, void payment, cached balance refresh (one writer).
15. **Record payment sheet** (from an invoice, a bill, or the list): amount (defaults to balance), date (today in business zone), deposit/pay-from account, method, reference; overpayment asks "Keep $X as credit on the customer?" and needs an explicit yes. Bulk record from the Sales list.
16. **`/books/payments`** list: date, kind, party, amount, unallocated credit, applied to, status; filters kind/party/date. Void with reason (returns invoice to open). Apply credit and Refund actions on credit rows.
17. Customer and vendor pages gain open-credit rows and an Apply credit action. Single base-currency only in this round (see question 2).

#### Round D: Banking (this is the manager's "first client usable" point, with C inserted before it)

Schema: `LedgerBankAccount`, `BankImport`, `BankTransaction`, `BankMatch`, `BankRule`, G6, G11. Backend: CSV parser (7.1), fingerprint (7.2), `ReconcileService`, bank entry builders already exist (`builders/bank.ts`).
18. **`/books/banking`**: one card per bank account: GL balance, last import date, N to review, oldest unreviewed age. Primary: Add bank account (name, type bank/cash/card, currency, reconcile-from date, sign inversion for cards). Empty: "Add your first bank account."
19. **`/books/banking/[accountId]/import`**: stepper Upload, Map, Preview, Commit; saved profile per account; preview shows rows new/duplicate/rejected with reasons, first 20 parsed rows, total in/out, dates spelled out for ambiguous formats; reject report downloadable. Perm B.
20. **`/books/banking/[accountId]`** tabs To review / Matched / Ignored / All; review queue is the workspace. Desktop: list plus right panel. Phone: full-screen card stack with Accept / Categorise / Park in Uncategorized; Undo toast for 10 seconds; every outcome undoable from Matched. Outcomes in this round: Categorise (account, counterparty, tax, memo, splits, "create rule from this"), Park, Ignore (reason), Transfer, Pay documents (uses Round C), Match to existing. **Add transaction** button for manual cash/card lines (the plan gap). Matching suggestions arrive in Round E, so the card has no "Accept suggestion" yet.
21. **Reports**: Cash summary, Bank reconciliation (statement balance typed or from import vs ledger, difference itemized).

#### Round E: Attention, matching, real Home, widget

22. Passes 1, 3, 4, 5, 6 (7.3), bulk "Accept all EXACT" with a visible list. 23. **Attention list** (suspense balance and age, OBE not zero, bank lines in review older than `attentionStaleDays`, overdue invoices, ledger faults from the nightly job). 24. **`/books` Home** real version (cash, receivable with overdue part, payable, profit this month vs last, Attention) and the Overview widget `bookkeeping.overview` (remove from `WIDGETS_NOT_BUILT_YET`). 25. Nightly integrity job I1 to I14 (needs scheduler path, plan 0.7).

#### Round F: Setup and handover

26. Setup wizard (10.4) with presets (the other three presets do not exist in the seed yet), opening balances (R18) and opening documents (B20). 27. Accountant bundle with `manifest.json`. 28. Global search provider and command-palette actions. Agent tools (plan 8 phase) stay after this and are NOT part of the screen plan.

### 4. Exact files I would touch, and shared hotspots

**Round A new files (my clash boundary):**
- `apps/api/src/bookkeeping/`: `bookkeeping.module.ts`, `accounts.{router,service,contracts}.ts`, `journal.{router,service,contracts}.ts`, `ledger-settings.{router,service,contracts}.ts`, `reports.{router,service,contracts}.ts`, `bookkeeping-access.ts` (role lookup plus the `can()` check, shared by middleware and services).
- `apps/app/app/(app)/[slug]/books/` (layout, home, `accounting/accounts`, `accounting/journal`, `reports`), `apps/app/app/(app)/[slug]/settings/books/`.
- `packages/modules/bookkeeping/ledger/queries.ts` (new aggregate and opening-balance queries; fix the zero-account roster in `trialBalance`).
- Tests: `apps/api/test/` permission matrix (every procedure x every role, T7) and a ledger-router spec.

**Shared hotspots (sequence against Agent 2; all small edits but each is a merge risk):**
1. `packages/modules/bookkeeping/meta.ts`: add `nav` and `settings` entries (Agent 2's Features page and module switches also touch module declarations). **Highest clash risk.**
2. `packages/modules/src/define-module.ts` / `nav-icons.ts`: only if a new icon key is needed (`ledger` already exists, so likely none).
3. `apps/api/src/modules/registry.ts` (`MODULE_API.bookkeeping`, currently `[]`) and `apps/api/src/app.module.ts` / the generated router file under `apps/api/src/generated`.
4. `apps/app/app/(app)/[slug]/widget-ids.ts` (Round E only).
5. `packages/db/prisma/schema/bookkeeping.prisma` plus a new migration folder: Rounds B, C, D each add one (Tier 2 ADD each; follow `CLAUDE.md` Part 3, `security-rls-permissions`). Migration folder names are timestamp-ordered, so two agents creating migrations the same day must agree on ordering.
6. `packages/db/src/seeds/bookkeeping.ts` (presets, Round F).
7. Workspace roles and Members screen: already data-driven, so no edit expected.
8. `docs/DECISIONS.md` and the ledger: manager only; I will not touch them.

### 5. Proposed slicing (each round shippable and reviewable on its own)

| Round | Ships | Needs migration? | Usable by |
|---|---|---|---|
| A | Books shell, accounts, ledger, journal, TB, GL, Settings > Books, API + permission enforcement | No | Accountant |
| B | Parties, invoices, bills, credit notes, P&L, BS, aging, tax summary | Yes (4 tables + G9) | Owner can bill; books show profit |
| C | Payments, credits, refunds, void payment | Yes (2 tables + G10) | Owner: "who owes me" closes the loop |
| D | Bank accounts, CSV import, review queue, cash summary, bank rec | Yes (6 tables + G6, G11) | **First client usable** (manager's cut, with payments added) |
| E | Matching, Attention, real Home and widget, integrity job | No (BankSuggestion in D or here) | Daily use |
| F | Setup wizard, opening balances, presets, bundle, search | Maybe | Onboarding a new client |

Every round ends with the plan's gate: `review-build`, `verify-before-done` in a real browser on phone and desktop viewports, the help article, and a `docs/updates/` file for the user-visible release.

### 6. Product questions, answered (Self-Answer Test)

1. **Payments before banking?** The manager's 2026-11-04 cut puts the first usable client at phases 1 to 3 plus banking 5.1 to 5.3 with payments excluded. I recommend inserting a small Round C before banking. Reason: an invoice you can issue but never mark paid leaves the receivable list permanently wrong, so O2 ("who owes me") does not work; and the bank review's "Pay documents" outcome (7.4 action 4) needs it. Payments without FX are small (the engine builders are done). This deviates from the manager's cut: **manager to confirm**.
2. **Foreign currency in the UI?** Base-currency only through Round D; the currency field and manual rate input arrive in a later FX round. Reason: a single-business client is mostly single currency, FX adds rate entry, backdated-rate warnings and FX_ADJUSTMENT display, and the engine already supports it so nothing is lost. The ledger stays correct either way.
3. **Public invoice link?** No. Print-friendly page only in v1. Reason: a public link is an unauthenticated route that exposes financial data, and email sending needs the core send helper that does not exist (plan "Later").
4. **Journal entry on a phone?** View and reverse only; create is desktop (plan 5, kept). Reason: balancing many lines on a phone invites errors; it is an accountant task.
5. **Home page before reports exist?** Round A ships the three-card version (suspense, OBE, entries this month) so the area is not empty; the real Home is Round E. Reason: showing a profit card with no documents would be a made-up number.
6. **Account balances on screen for non-reports users?** Hidden. Reason: plan 8 says ledger and chart read need `bookkeeping.reports`; `bookkeeping.read` is documents only.
7. **Manual cash/card purchase with no bank file?** Add "Add transaction" on the bank account (manual line, then the same Categorise flow). Reason: owners pay cash; forcing a fake CSV is wrong.
8. **`trialBalance` hiding zero-activity accounts?** Fix in Round A (include every account). Reason: the report rule says every account appears including zeros.

Still open for the owner: none that I cannot answer. Only question 1 is a deviation from a manager decision.

### 7. Risks to watch

- Permissions are unenforced today; Round A's router must set the pattern and its matrix test (T7) before any other router copies it.
- Hand-written guard SQL: any later migration on guarded tables is Tier 3 (pull the live definition first).
- `trialBalance` and the new aggregates must return `bigint` through `SUM(...)::text` or `::bigint` and cross the wire as strings; a JS number anywhere is a defect.
- Every "today" through `businessToday()`; grep for stray `new Date()` in review.
- All tests above remain unverified by me until someone installs `bun` and a throwaway Postgres.

**Status: DONE (research and plan only). Stopping now.**
