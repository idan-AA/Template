# Bookkeeping module plan

Owner: Dashboard S3. Status: PLAN v1, awaiting manager review. No code written, no repo file touched except this one.
Audience: you and the next agent. Statuses: TODO / DOING / DONE / BLOCKED.
Expands section 5 of `docs/plan/template-modules.md`. Fits the module mechanism in its sections 1.2 and 2.
Scope (decided, `docs/DECISIONS.md` 2026-11-04): the business keeps its OWN books. One legal entity, one deploy, one database, one base currency.

Read before building anything from this plan: `money-truth-doctrine`, `report-verification`, `analytics-reports-architecture`, `bank-reconciliation`, `standard-database-design`, `security-rls-permissions`, `build-with-the-user-in-mind`, `timezone-handling`, `docs/currency.md`, `docs/design.md`, `CLAUDE.md` Part 3 (database gate: every table here is Tier 2 ADD, every later change is Tier 3).

Licence guard: no relaticle file was opened for this plan. Its ideas (import wizard shape, capability keys, activation checklist, use-case presets, per-entity exporters, audit log screen) are restated in our own words in section 13. Any PR touching those says "no relaticle code".

---

## 0. Repo facts this plan relies on (checked 2026-11-04) and assumptions

Checked in the tree:

| Fact | Where | Consequence |
|---|---|---|
| `model Account` already exists (better-auth) | `packages/db/prisma/schema.prisma:131` | Ledger accounts are named `LedgerAccount`. |
| Roles are only `owner`, `admin`, `member`; permission helpers are per-role functions | `packages/auth/src/organization.ts` | Bookkeeper and accountant roles are new (section 8). Depends on S2's `can(role, key)`. |
| `ExchangeRate` is unique on `(base, quote, source)`: it holds the CURRENT rate only, no history | schema `ExchangeRate`, `packages/db/src/fx.ts` | A document's rate is stored on the document and editable; backdated documents default to today's rate with a warning. History table is a later item. |
| `reportingCurrency` can change and `rerateAll()` rewrites frozen rates | `docs/currency.md` | The ledger NEVER follows it. The ledger has its own locked base currency (B3). |
| `idempotency.ts` is only an advisory-lock helper (`lockIdempotencyKey`), not a key table | `packages/db/src/idempotency.ts` | Idempotency here = advisory lock + `sourceKey` unique column. |
| `blob.ts` mirrors small images only (3 MB, image types, Vercel Blob token) | `packages/db/src/blob.ts` | Receipt/PDF attachments need a new storage helper. S1 decided storage is off for v1, so attachments are a gated later item (B17). |
| No triggers, CHECKs-by-hand or RLS in any migration | `packages/db/prisma/migrations` | These will be the first hand-written SQL migrations. Prisma does not model them; they live in `migration.sql` after `prisma migrate dev --create-only`. |
| No tRPC transformer found under `apps/api/src/trpc`; `MAX_AMOUNT_CENTS` is a plain number | `deals.contracts.ts:9` | BigInt cannot cross tRPC JSON. Contracts carry money as decimal STRINGS of minor units (B5). Verify the web client has no transformer before relying on this. |
| `CURRENCIES` is eleven codes, none with 3 decimals | `packages/db/src/currency.ts` | Minor-unit helper `minorUnitsOf` is reused; JPY (0 decimals) is a mandatory test case. |
| Agent code uses `db` from `@crm/db` directly | `apps/agent/agent/lib/*.ts` | The agent can reach tables without the API. "Human posts" must be structural (B12), not a convention. |
| `AgentAuditEvent` is agent-specific; there is no general audit table | schema line 1021 | New core table `AuditEvent` (B13). Coordinate with S2. |
| Test DB must end in `_test`; `bun test` in `packages/db` | `packages/db/scripts/test-db.ts` | Trigger tests run there against real Postgres. |
| Prisma 7, `partialIndexes` preview feature already on | schema generator, `packages/db/package.json` | Partial unique indexes are available. |

Assumptions that need a spike before code (section 12, phase 0):
- A1. S2's multi-file Prisma schema works, so models live in `packages/db/prisma/schema/bookkeeping.prisma`. Fallback: one file with `// module: bookkeeping` section headers.
- A2. RESOLVED 2026-11-04 (section 12.1, 0.9): custom roles work; the role list must become one data-driven list instead of three literals.
- A3. S2's scheduler/cron story (S1: crons in-process with advisory lock) can run a nightly integrity job. No `vercel.json` entries.
- A4. eve can omit tools per module (S2 spike b). Plan works either way: tools that exist but are not exposed also refuse at execute time.

---

## 1. Decisions I am making (override me in review)

| # | Decision | Why |
|---|---|---|
| B1 | **The ledger is the only source of totals.** Documents (invoice, bill, payment) POST journal entries; every report and every balance reads `JournalLine`. Document `balanceMinor` is a cache with ONE writer, re-derived from lines on every posting, and checked nightly. | `money-truth-doctrine` 5.1 rule 4; fix the writer, not the readers. |
| B2 | **Strict immutability: posted means frozen.** No edit, no delete. Mistakes are fixed by a REVERSAL entry plus a new correct one. Only non-financial fields of an issued document (due date, reference, notes, terms) can change, each audited. | Stricter than QuickBooks (which allows edit/delete with a log); same as Xero voids. A recorded figure that can silently change is the CRM-quarter bug again. |
| B3 | **Own base currency, locked at first posting.** Seeded from `AppSetting.reportingCurrency` in the setup wizard, stored in `LedgerSettings.baseCurrency`, immutable after the first posted entry. | Reporting currency in the CRM is changeable and re-rated; a ledger must not be. QuickBooks also locks home currency. |
| B4 | **Multi-currency: documents and payments may use any of the 11 currencies; the books and every report are in base currency only.** Realized FX gain/loss is posted at payment. Unrealized revaluation is NOT posted in v1. | Xero and QuickBooks both post realized only by default. Unrealized needs a rate history we do not have yet. |
| B5 | **Money = BigInt minor units + ISO code. Over the wire = decimal string of minor units.** Quantities and rates are `Decimal`. Never float. | Rule 1 of section 5.1; no tRPC transformer. |
| B6 | **A missing exchange rate BLOCKS posting. It is never a null.** | Differs from `docs/currency.md` on purpose: a CRM deal can be "unconverted" and fall out of a sum; a ledger line with no base amount makes the books unbalanced. |
| B7 | **Balance is enforced in BASE amounts by the database; additionally, an entry whose non-rounding lines share one currency must balance in that currency.** | Supersedes "per currency" in section 5.1(2). A payment of EUR against a EUR invoice with a USD bank line cannot balance per currency; base is the only universal invariant. |
| B8 | **No period table. Two lock dates in `LedgerSettings`.** `lockDate` (soft: roles with `bookkeeping.lock` may still post on or before it, with a recorded reason) and `hardLockDate` (DB-enforced for everyone; only the owner can move it back, audited). No closing entries; retained earnings are computed. | Copy Xero's lock dates. Replaces the `Period` table in template-modules 5.2: fewer rows, no "forgot to create next month" failure. |
| B9 | **One `BookDocument` table for invoice, bill, customer credit note and vendor credit** (`kind` enum), one `LedgerPayment` table for the four money movements (`kind` enum), one `DocumentAllocation` table linking credit to document. | One sub-ledger mechanism, one numbering mechanism, ONE nullable FK for custom fields later instead of four. |
| B10 | **AR/AP sub-ledger lives on the ledger.** Lines on the AR/AP control accounts carry `documentId` or `paymentId`. Open balance of a document = sum of its tagged control-account lines. Manual journals are forbidden from touching AR, AP, bank or card accounts. | The sub-ledger can never disagree with the control account because it IS the control account. Xero forbids the same. |
| B11 | **No auto-posting of anything, ever, in v1.** Bank rules and the agent only suggest; a human clicks. `5.1(9)` "threshold" is dropped for v1. | Simpler and safer; matches Xero (rules pre-fill, a person confirms). A threshold can come later if the owner wants it. |
| B12 | **"Human posts" is structural.** (a) the agent has proposal tools only; (b) a lint/test fails if `apps/agent` references `journalEntry` or `journalLine`; (c) the DB posting trigger requires `postedById` and refuses when the session actor is `AGENT`. | The agent holds a raw `db` client, so a convention would not hold. (c) guards accidents, not malice; (a) and (b) are the real boundary. |
| B13 | **New CORE table `AuditEvent`** (append-only, written in the same transaction as the change). Not the CRM `Activity` timeline. | Section 5.1(10). Needs S2's agreement because it is core. |
| B14 | **Counterparty = one table with `isCustomer` / `isVendor` flags** (Xero style), soft links to CRM ids as plain strings, no FK. | Modules must not require each other (D5). A dangling CRM id degrades to "no link", never an error. |
| B15 | **Dates are date-only (`@db.Date`) in the business time zone** held in `LedgerSettings.timezone`. "Today", overdue and aging use one helper `businessToday()`. Instants (`postedAt`, `createdAt`) are timestamptz. | `timezone-handling`: a due date has no zone; UTC "today" is wrong every evening. |
| B16 | **Accrual basis only in v1.** Cash-basis P&L is a later item. | It needs payment-proportion attribution; a wrong cash report is worse than none. Both competitors offer it; we say so honestly. |
| B17 | **Attachments are modelled but gated** behind a `storage` capability (S1 put storage off for v1). | Do not build on a dependency that is not there. |
| B18 | **Gapless numbering for invoices, bills' own numbers are the vendor's.** Numbers are assigned at ISSUE inside the posting transaction from `NumberSequence` with a row lock. Voided numbers stay, shown as VOID. Drafts have no number. | Many jurisdictions require gapless invoice numbers. Rolled-back transactions return the number automatically. |
| B19 | **Suspense account "Uncategorized (review)".** A phone user can park a bank line there in one tap; it shows on the Attention list until it is zero. | QuickBooks "Uncategorized" / Xero "Suspense". The owner's real behaviour is "I will fix it later"; hiding that makes books wrong, surfacing it keeps them right. |
| B20 | **Opening documents post against Opening Balance Equity, not revenue/expense.** | Prevents double counting history when converting from another system; the OBE balance must reach zero and is shown on Attention until it does. |

---

## 2. The user's jobs

Words on screen are the user's words (Invoice, Bill, Customer, Vendor, Money in, Money out). Debits and credits appear only in the Accounting area.

### 2.1 Owner (usually the business owner, phone first)

| # | Job | Done when | Where |
|---|---|---|---|
| O1 | "Bill a customer fast." | Draft to issued invoice in under 60 seconds on a phone, link/PDF to share. | New invoice sheet |
| O2 | "Who owes me, who is late." | One list sorted by overdue, one tap to record a payment. | Sales tab, Overview widget |
| O3 | "What do I owe and when." | Bills due this week at top, record payment in two taps. | Purchases tab |
| O4 | "Am I making money, how much cash do I have." | Profit this month vs last, cash on hand, receivable, payable, on the Overview. | Overview widget, Reports |
| O5 | "Clear my bank feed." | Each imported line: accept the suggestion, pick a category, or park in Uncategorized. Swipe-fast list. | Banking, review queue |
| O6 | "Give my accountant what they need." | Invite as `accountant` (read plus adjust), or one-click export bundle. | Settings, Reports |

### 2.2 Bookkeeper (daily user, desktop first)

| # | Job | Done when |
|---|---|---|
| B-1 | Import the bank file, clear the review queue to zero. | Banking shows 0 to review; Attention shows none older than N days. |
| B-2 | Enter bills and invoices in batches from paper/email. | Duplicate-bill warning fires; no number typed twice. |
| B-3 | Month end: tie bank to ledger, review aging, clear Uncategorized, post accruals, hand over for lock. | Bank reconciliation report shows difference 0 with every item named; suspense = 0. |
| B-4 | Fix a mistake without deleting anything. | Void or reverse; original and fix both visible; history tab shows who and why. |
| B-5 | Answer "where does this number come from". | Every report figure drills to ledger lines, then to the source document, in a new tab. |

### 2.3 Accountant (read-mostly, tax time and year end)

| # | Job | Done when |
|---|---|---|
| A-1 | Get access without the owner's password and without admin rights. | Role `accountant`: reads everything, posts adjusting journals, locks periods; cannot change users, delete accounts with history, or reopen a hard lock. |
| A-2 | Review the year. | Trial balance, general ledger, P&L, balance sheet, tax summary for the fiscal year, each exportable and equal to the screen. |
| A-3 | Post adjusting entries (depreciation, accruals, reclasses). | Manual journal flagged `ADJUSTMENT`, carries a mandatory memo, visible in a filter. |
| A-4 | Close the books. | Sets `lockDate` (and `hardLockDate` if owner agrees) to year end. Later postings on or before it are refused or need a reason. |
| A-5 | Take the data away. | Accountant bundle zip: chart of accounts, journal lines, trial balance, P&L, balance sheet, AR/AP aging, tax summary, bank reconciliation, with `manifest.json` (row counts and control totals). |

---

## 3. Data model

Conventions (match the repo): `cuid()` ids, camelCase `@@map`, enums in Prisma, `Json` only for opaque config. Every model gets `createdAt`; mutable ones get `updatedAt`. Ledger tables have NO `updatedAt` (they are immutable or insert-only). Actor columns (`createdById`, `postedById`) are plain strings with NO FK to `User`, so deleting a user can never cascade into or null out financial history; `AuditEvent.actorLabel` keeps the name at the time.

Access rules for the new tables (the Tier 2 requirement): this app does not use RLS (no policies exist in any migration). Access is enforced in two places, the same as the rest of the repo: tRPC middleware plus the service (section 8). The database adds integrity triggers (3.2), not row visibility. No table is exposed to the browser directly. Single tenant, so no `organizationId` on any row (`docs/api.md`). Hardening later: run the API as a role without `TRUNCATE`/`DELETE` on ledger tables (phase 9).

The Prisma below is a SKETCH to fix names, types, constraints and indexes. Run `prisma validate` in phase 1 and treat the validator as the authority on syntax.

### 3.1 Prisma

```prisma
enum AccountType { ASSET LIABILITY EQUITY INCOME EXPENSE }

enum AccountSubtype {
  BANK CASH CREDIT_CARD ACCOUNTS_RECEIVABLE CURRENT_ASSET FIXED_ASSET OTHER_ASSET
  ACCOUNTS_PAYABLE CURRENT_LIABILITY TAX_LIABILITY LONG_TERM_LIABILITY
  OWNER_EQUITY RETAINED_EARNINGS
  REVENUE OTHER_INCOME COST_OF_SALES OPERATING_EXPENSE OTHER_EXPENSE
}

enum AccountSystemRole {
  ACCOUNTS_RECEIVABLE ACCOUNTS_PAYABLE RETAINED_EARNINGS OPENING_BALANCE_EQUITY
  FX_GAIN_LOSS ROUNDING SUSPENSE
}

model LedgerAccount {
  id          String            @id @default(cuid())
  code        String            @unique @db.VarChar(16)
  name        String            @db.VarChar(120)
  type        AccountType
  subtype     AccountSubtype
  systemRole  AccountSystemRole? @unique      // engine finds control accounts by role, never by code
  parentId    String?
  parent      LedgerAccount?    @relation("AccountTree", fields: [parentId], references: [id], onDelete: Restrict)
  children    LedgerAccount[]   @relation("AccountTree")
  currency    String?           @db.VarChar(3) // null = any; bank/card accounts are pinned to one
  description String?
  defaultTaxRateId String?
  defaultTaxRate   TaxRate?     @relation("AccountDefaultTax", fields: [defaultTaxRateId], references: [id], onDelete: SetNull)
  isSystem    Boolean           @default(false) // cannot be archived or change type
  sortOrder   Int               @default(0)
  archivedAt  DateTime?
  createdAt   DateTime          @default(now())
  updatedAt   DateTime          @updatedAt

  lines       JournalLine[]
  bankAccount LedgerBankAccount?

  @@index([type, sortOrder])
  @@index([parentId])
  @@index([archivedAt])
  @@map("ledgerAccount")
}
// DB: CHECK (type matches subtype family), CHECK (systemRole implies isSystem),
// trigger blocks UPDATE of type/subtype/currency once any journalLine exists (3.2 G7).

model LedgerSettings {
  id                   String    @id             // the literal "ledger": a singleton
  baseCurrency         String    @db.VarChar(3)
  timezone             String                    // IANA, from client.config locale.timezone at setup
  fiscalYearStartMonth Int       @default(1)     // 1 to 12
  lockDate             DateTime? @db.Date        // soft
  hardLockDate         DateTime? @db.Date        // DB-enforced for everyone
  conversionDate       DateTime? @db.Date        // opening balances are as of this date
  firstPostedAt        DateTime?                 // set by the first post; freezes baseCurrency
  attentionStaleDays   Int       @default(7)
  setupCompletedAt     DateTime?
  updatedAt            DateTime  @updatedAt
  @@map("ledgerSettings")
}
// DB: CHECK (fiscalYearStartMonth BETWEEN 1 AND 12), CHECK (hardLockDate IS NULL OR lockDate IS NULL OR hardLockDate <= lockDate)
// The soft lock is the later date; the hard lock may not exceed it. Trigger G8 blocks a baseCurrency change once firstPostedAt is set.

model NumberSequence {
  key       String @id          // INVOICE, CREDIT_NOTE, VENDOR_CREDIT, PAYMENT, ENTRY
  prefix    String @db.VarChar(12)
  padding   Int    @default(4)
  nextValue Int    @default(1)
  @@map("numberSequence")
}
// Assigned with SELECT ... FOR UPDATE on this row, inside the posting transaction.

enum EntryStatus { DRAFT POSTED }

enum EntrySource {
  MANUAL ADJUSTMENT OPENING_BALANCE
  INVOICE BILL CREDIT_NOTE VENDOR_CREDIT
  PAYMENT ALLOCATION
  BANK_SPEND BANK_RECEIVE TRANSFER
  REVERSAL
}

model JournalEntry {
  id          String       @id @default(cuid())
  number      String?      @unique            // JE-000123, assigned at post
  date        DateTime     @db.Date           // accounting date, business time zone
  memo        String?
  status      EntryStatus  @default(DRAFT)
  source      EntrySource
  sourceId    String?                          // document / payment / allocation id
  sourceKey   String?      @unique            // idempotency: "invoice:<id>:issue", "bank:<acct>:<fingerprint>"
  baseCurrency String      @db.VarChar(3)
  reversesId  String?      @unique            // an entry can be reversed once
  reverses    JournalEntry? @relation("Reversal", fields: [reversesId], references: [id], onDelete: Restrict)
  reversedBy  JournalEntry? @relation("Reversal")
  proposalId  String?                          // set when a human accepted an agent proposal
  postedAt    DateTime?
  postedById  String?
  createdAt   DateTime     @default(now())
  createdById String

  lines       JournalLine[]

  @@index([date, status])
  @@index([source, sourceId])
  @@index([status, createdAt])
  @@map("journalEntry")
}
// No updatedAt. Posted rows never change (G2).

enum LineKind { NORMAL TAX FX_ADJUSTMENT ROUNDING }
enum FxOrigin { IDENTITY MANUAL FETCHED }

model JournalLine {
  id            String        @id @default(cuid())
  entryId       String
  entry         JournalEntry  @relation(fields: [entryId], references: [id], onDelete: Cascade) // cascade only fires for DRAFT parents (G3)
  lineNo        Int
  accountId     String
  account       LedgerAccount @relation(fields: [accountId], references: [id], onDelete: Restrict)
  kind          LineKind      @default(NORMAL)
  currency      String        @db.VarChar(3)
  debitMinor    BigInt        @default(0)     // transaction currency
  creditMinor   BigInt        @default(0)
  baseDebitMinor  BigInt      @default(0)     // base currency, frozen at post
  baseCreditMinor BigInt      @default(0)
  fxRate        Decimal       @db.Decimal(24, 10)  // base per 1 unit of `currency`, same direction as ExchangeRate.rate
  fxOrigin      FxOrigin
  fxRateAt      DateTime
  counterpartyId String?
  counterparty   Counterparty? @relation(fields: [counterpartyId], references: [id], onDelete: Restrict)
  documentId    String?                         // AR/AP sub-ledger tag
  document      BookDocument?  @relation(fields: [documentId], references: [id], onDelete: Restrict)
  paymentId     String?                         // credit-on-account tag
  payment       LedgerPayment? @relation(fields: [paymentId], references: [id], onDelete: Restrict)
  taxRateId     String?
  taxRate       TaxRate?       @relation(fields: [taxRateId], references: [id], onDelete: Restrict)
  memo          String?

  bankMatches   BankMatch[]

  @@unique([entryId, lineNo])
  @@index([accountId, entryId])
  @@index([documentId])
  @@index([paymentId])
  @@index([counterpartyId, accountId])
  @@index([taxRateId])
  @@map("journalLine")
}
// DB CHECKs: debit>=0, credit>=0, base>=0; at most one of debit/credit > 0; base side equals txn side;
// kind NORMAL/TAX => exactly one of debit/credit > 0 ; fxRate > 0 ; currency is a 3-letter upper-case code;
// NOT (documentId IS NOT NULL AND paymentId IS NOT NULL);
// kind FX_ADJUSTMENT/ROUNDING => currency = entry base currency and fxRate = 1 (checked in G1).
```

Documents, payments, tax:

```prisma
model Counterparty {
  id               String   @id @default(cuid())
  name             String   @db.VarChar(200)
  email            String?
  phone            String?
  taxId            String?
  address          Json?                       // {street, city, region, postal, country}
  isCustomer       Boolean  @default(false)
  isVendor         Boolean  @default(false)
  defaultCurrency  String?  @db.VarChar(3)
  paymentTermsDays Int?                        // 0 = due on receipt
  defaultAccountId String?                     // revenue for customers, expense for vendors
  contactId        String?                     // soft link to crm Contact, NO FK
  companyId        String?                     // soft link to crm Company, NO FK
  notes            String?
  archivedAt       DateTime?                   // never purged: financial history points here
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt

  documents BookDocument[]
  payments  LedgerPayment[]
  lines     JournalLine[]

  @@index([name])
  @@index([isCustomer, archivedAt])
  @@index([isVendor, archivedAt])
  @@map("counterparty")
}
// DB: CHECK (isCustomer OR isVendor). Name search uses a trigram index added in phase 3 (pg_trgm), if the extension is allowed on Render.

enum DocKind { INVOICE BILL CREDIT_NOTE VENDOR_CREDIT }
enum DocStatus { DRAFT ISSUED VOID }
enum AmountsAre { EXCLUSIVE INCLUSIVE NO_TAX }

model BookDocument {
  id             String       @id @default(cuid())
  kind           DocKind
  status         DocStatus    @default(DRAFT)
  number         String?                          // INV-0042, CN-0003; assigned at issue. For BILL: our internal ref is null, vendor's number is `reference`.
  reference      String?                          // customer PO, or vendor's invoice number for bills
  counterpartyId String
  counterparty   Counterparty @relation(fields: [counterpartyId], references: [id], onDelete: Restrict)
  issueDate      DateTime     @db.Date
  dueDate        DateTime     @db.Date
  currency       String       @db.VarChar(3)
  fxRate         Decimal?     @db.Decimal(24, 10) // frozen at issue
  fxOrigin       FxOrigin?
  fxRateAt       DateTime?
  amountsAre     AmountsAre   @default(EXCLUSIVE)
  subtotalMinor  BigInt       @default(0)         // net of tax, document currency; recomputed from lines until issue, frozen after
  taxMinor       BigInt       @default(0)
  totalMinor     BigInt       @default(0)
  balanceMinor   BigInt       @default(0)         // CACHE, document currency; one writer (PostingService.refreshBalances)
  isOpening      Boolean      @default(false)     // B20: posts against Opening Balance Equity
  notes          String?
  terms          String?
  originalId     String?                          // credit note: the invoice it corrects, optional
  entryId        String?      @unique             // issue posting
  voidEntryId    String?      @unique
  voidReason     String?
  issuedAt       DateTime?
  issuedById     String?
  voidedAt       DateTime?
  voidedById     String?
  createdAt      DateTime     @default(now())
  createdById    String
  updatedAt      DateTime     @updatedAt

  lines          BookDocumentLine[]
  ledgerLines    JournalLine[]
  allocationsTo  DocumentAllocation[] @relation("AllocTarget")
  allocationsFrom DocumentAllocation[] @relation("AllocCreditDoc")

  @@unique([kind, number])                         // NULLs allowed multiple times for drafts
  @@index([kind, status, dueDate])
  @@index([counterpartyId, kind, status])
  @@index([issueDate])
  @@map("bookDocument")
}
// Partial unique (migration SQL, or @@unique with partialIndexes): duplicate-bill guard
//   UNIQUE (counterpartyId, reference) WHERE kind='BILL' AND status<>'VOID' AND reference IS NOT NULL
// DB: CHECK (totalMinor = subtotalMinor + taxMinor) for AmountsAre <> INCLUSIVE; CHECK (dueDate >= issueDate)
// DB: CHECK (status<>'ISSUED' OR (entryId IS NOT NULL AND fxRate IS NOT NULL))
// DB: CHECK (kind IN ('INVOICE','CREDIT_NOTE') => number IS NOT NULL once ISSUED)
// Trigger G9: once ISSUED, kind/counterparty/currency/dates(issue)/amounts/lines cannot change.

model BookDocumentLine {
  id          String       @id @default(cuid())
  documentId  String
  document    BookDocument @relation(fields: [documentId], references: [id], onDelete: Cascade) // G9 blocks deleting lines of an issued doc
  position    Int
  description String
  quantity    Decimal      @db.Decimal(18, 4)
  unitMinor   BigInt                                    // unit price, document currency minor units
  discountBp  Int          @default(0)                  // basis points, 0 to 10000
  netMinor    BigInt                                    // quantity * unit, less discount, rounded half away from zero
  taxRateId   String?
  taxRate     TaxRate?     @relation(fields: [taxRateId], references: [id], onDelete: Restrict)
  taxMinor    BigInt       @default(0)
  accountId   String                                    // revenue (sales kinds) or expense/asset (purchase kinds)
  @@unique([documentId, position])
  @@index([accountId])
  @@map("bookDocumentLine")
}

enum PaymentKind { RECEIPT PAYOUT CUSTOMER_REFUND VENDOR_REFUND }
enum PaymentMethod { CASH CHECK BANK_TRANSFER CARD OTHER }
enum PaymentStatus { RECORDED VOID }

model LedgerPayment {
  id             String        @id @default(cuid())
  kind           PaymentKind
  number         String?       @unique               // PMT-0012, optional but assigned for receipts
  status         PaymentStatus @default(RECORDED)
  counterpartyId String
  counterparty   Counterparty  @relation(fields: [counterpartyId], references: [id], onDelete: Restrict)
  date           DateTime      @db.Date
  currency       String        @db.VarChar(3)        // = currency of the documents it settles
  amountMinor    BigInt                              // document currency
  bankAccountId  String                              // LedgerAccount of subtype BANK, CASH or CREDIT_CARD
  bankAmountMinor BigInt?                            // only when the bank account is in base currency and `currency` is not
  fxRate         Decimal       @db.Decimal(24, 10)   // settlement rate, frozen
  fxOrigin       FxOrigin
  fxRateAt       DateTime
  method         PaymentMethod @default(BANK_TRANSFER)
  reference      String?
  memo           String?
  unallocatedMinor BigInt      @default(0)           // CACHE: credit on account created by this payment
  entryId        String        @unique
  voidEntryId    String?       @unique
  voidReason     String?
  createdAt      DateTime      @default(now())
  createdById    String
  voidedAt       DateTime?
  voidedById     String?

  allocations    DocumentAllocation[] @relation("AllocCreditPayment")
  ledgerLines    JournalLine[]

  @@index([counterpartyId, date])
  @@index([bankAccountId, date])
  @@index([date])
  @@map("ledgerPayment")
}
// DB: CHECK (amountMinor > 0); CHECK (bankAmountMinor IS NULL OR bankAmountMinor > 0)

model DocumentAllocation {
  id               String         @id @default(cuid())
  targetId         String                                  // the invoice or bill being settled
  target           BookDocument   @relation("AllocTarget", fields: [targetId], references: [id], onDelete: Restrict)
  creditPaymentId  String?                                 // either a payment ...
  creditPayment    LedgerPayment? @relation("AllocCreditPayment", fields: [creditPaymentId], references: [id], onDelete: Restrict)
  creditDocumentId String?                                 // ... or a credit note / vendor credit
  creditDocument   BookDocument?  @relation("AllocCreditDoc", fields: [creditDocumentId], references: [id], onDelete: Restrict)
  amountMinor      BigInt                                  // document currency
  entryId          String                                  // the entry that moved the balance; several rows can share one payment entry
  reversedAt       DateTime?                               // set when unapplied; the reversal entry is the proof
  reversalEntryId  String?        @unique
  createdAt        DateTime       @default(now())
  createdById      String

  @@index([targetId])
  @@index([creditPaymentId])
  @@index([creditDocumentId])
  @@map("documentAllocation")
}
// DB: CHECK ((creditPaymentId IS NULL) <> (creditDocumentId IS NULL)); CHECK (amountMinor > 0)
// Guard G10: sum of active allocations to a target never exceeds target.totalMinor; of a credit never exceeds its credit amount.
// entryId is a plain index because one payment entry carries several allocations.
// add @@unique([creditPaymentId, targetId]) for payment-born rows. Settle in phase 4 against the real code.

model TaxRate {
  id            String   @id @default(cuid())
  name          String   @db.VarChar(80)
  rateBp        Int                                    // hundredths of a percent: 8.25% = 825
  appliesTo     String                                 // "SALES" | "PURCHASE" | "BOTH"
  accountId     String                                 // tax payable (sales) or tax receivable (purchase)
  recoverable   Boolean  @default(true)                // false: tax is rolled into the expense line, no tax line
  archivedAt    DateTime?
  createdAt     DateTime @default(now())
  @@map("taxRate")
}
// DB: CHECK (rateBp BETWEEN 0 AND 100000). No compound/component rates in v1 (skip; see 13).
```

Banking:

```prisma
model LedgerBankAccount {
  id              String   @id @default(cuid())
  name            String
  ledgerAccountId String   @unique                       // the GL account of subtype BANK / CASH / CREDIT_CARD
  ledgerAccount   LedgerAccount @relation(fields: [ledgerAccountId], references: [id], onDelete: Restrict)
  currency        String   @db.VarChar(3)                // equals ledgerAccount.currency
  institution     String?
  last4           String?  @db.VarChar(4)
  reconcileFrom   DateTime @db.Date                      // bank lines before this date are not reconciled (opening)
  importProfile   Json?                                  // saved CSV mapping, see 7.1
  invertSign      Boolean  @default(false)               // card statements that show charges as positive
  lastImportedAt  DateTime?
  archivedAt      DateTime?
  createdAt       DateTime @default(now())

  transactions BankTransaction[]
  imports      BankImport[]
  @@map("ledgerBankAccount")
}

enum BankTxnStatus { REVIEW MATCHED IGNORED }
enum ImportStatus { PREVIEW COMMITTED FAILED }

model BankImport {
  id            String   @id @default(cuid())
  bankAccountId String
  bankAccount   LedgerBankAccount @relation(fields: [bankAccountId], references: [id], onDelete: Restrict)
  fileName      String
  fileSha256    String
  rowsTotal     Int
  rowsNew       Int
  rowsDuplicate Int
  rowsRejected  Int
  statementEndingMinor BigInt?                             // optional, enables tie-out (I9)
  status        ImportStatus
  rejectReport  Json?                                      // [{row, reason, raw}]
  createdAt     DateTime @default(now())
  createdById   String
  transactions  BankTransaction[]
  @@unique([bankAccountId, fileSha256])                    // the exact same file cannot be committed twice
  @@map("bankImport")
}

model BankTransaction {
  id            String   @id @default(cuid())
  bankAccountId String
  bankAccount   LedgerBankAccount @relation(fields: [bankAccountId], references: [id], onDelete: Restrict)
  importId      String?
  import        BankImport? @relation(fields: [importId], references: [id], onDelete: Restrict)
  date          DateTime @db.Date
  amountMinor   BigInt                                     // SIGNED: positive = DEBIT to the ledger account (money in on a bank, a payment on a card); negative = CREDIT
  currency      String   @db.VarChar(3)
  description   String
  bankReference String?
  balanceAfterMinor BigInt?
  fingerprint   String                                     // sha256 of account|date|amount|normalized description|reference|occurrence (7.2)
  occurrence    Int      @default(1)
  suspectDuplicate Boolean @default(false)
  status        BankTxnStatus @default(REVIEW)
  ignoreReason  String?
  ignoredById   String?
  ignoredAt     DateTime?
  rawRow        Json?                                      // the source row, as loaded; the bank line is evidence, never edited
  createdAt     DateTime @default(now())

  matches       BankMatch[]
  suggestions   BankSuggestion[]
  @@unique([bankAccountId, fingerprint])
  @@index([bankAccountId, status, date])
  @@index([date])
  @@map("bankTransaction")
}
// DB: CHECK (amountMinor <> 0). The row is never updated except status, ignore* columns (trigger G11).

enum MatchStatus { ACTIVE UNDONE }
enum MatchMethod { USER RULE SUGGESTION_ACCEPTED }

model BankMatch {
  id            String   @id @default(cuid())
  bankTxnId     String
  bankTxn       BankTransaction @relation(fields: [bankTxnId], references: [id], onDelete: Restrict)
  lineId        String                                     // the JournalLine on the bank account's GL account
  line          JournalLine @relation(fields: [lineId], references: [id], onDelete: Restrict)
  amountMinor   BigInt                                     // absolute, applied to this pair
  status        MatchStatus @default(ACTIVE)
  method        MatchMethod
  ruleId        String?
  createdAt     DateTime @default(now())
  createdById   String
  undoneAt      DateTime?
  undoneById    String?
  undoneReason  String?
  @@index([bankTxnId, status])
  @@index([lineId, status])
  @@map("bankMatch")
}
// Guard G6 (DB): per bankTxn, sum(ACTIVE amount) <= abs(amountMinor); per line, sum(ACTIVE amount) <= line amount;
// line.accountId = bankAccount.ledgerAccountId; direction agrees (positive txn <-> debit line); currencies equal.
// Undo is a status change. Rows are never deleted.

model BankRule {
  id          String  @id @default(cuid())
  name        String
  priority    Int     @default(100)
  direction   String                                       // "IN" | "OUT" | "ANY"
  bankAccountId String?                                    // null = all accounts
  conditions  Json                                         // [{field:"description"|"amount"|"reference", op:"contains"|"equals"|"startsWith"|"between", value}]
  action      Json                                         // {accountId, counterpartyId?, taxRateId?, memo?} | {ignore:true} | {transfer:true}
  enabled     Boolean @default(true)
  createdAt   DateTime @default(now())
  createdById String
  @@map("bankRule")
}

model BankSuggestion {                                      // DERIVED, rebuildable, deletable; not a financial record
  id          String  @id @default(cuid())
  bankTxnId   String
  bankTxn     BankTransaction @relation(fields: [bankTxnId], references: [id], onDelete: Cascade)
  rank        Int
  pass        String                                       // "REFERENCE" | "AMOUNT_DATE" | "RULE" | "FUZZY" | "TRANSFER" | "AGENT"
  confidence  String                                       // "EXACT" | "LIKELY" | "POSSIBLE"
  payload     Json                                         // {kind:"DOCUMENTS", documentIds, amounts} | {kind:"CATEGORIZE", accountId,...} | {kind:"TRANSFER", otherBankTxnId}
  ruleId      String?
  proposalId  String?
  createdAt   DateTime @default(now())
  @@index([bankTxnId, rank])
  @@map("bankSuggestion")
}
```

Agent, attachments, audit:

```prisma
enum ProposalStatus { PENDING ACCEPTED REJECTED EXPIRED }

model BookkeepingProposal {
  id            String   @id @default(cuid())
  kind          String                                     // CATEGORIZE_BANK_TXN | MATCH_BANK_TXN | DRAFT_DOCUMENT
  subjectType   String                                     // "BankTransaction" | "BookDocument"
  subjectId     String
  payload       Json                                       // IDS ONLY (account, counterparty, tax rate, document ids). Amounts are copied by the server from the subject, never taken from the model.
  rationale     String                                     // plain words, shown to the human
  confidence    Int                                        // 0 to 100
  status        ProposalStatus @default(PENDING)
  agentRunId    String?
  createdAt     DateTime @default(now())
  decidedById   String?
  decidedAt     DateTime?
  resultEntryId String?
  @@index([status, createdAt])
  @@index([subjectType, subjectId])
  @@map("bookkeepingProposal")
}

model BookAttachment {                                       // gated by the `storage` capability
  id         String @id @default(cuid())
  ownerType  String                                         // "BookDocument" | "LedgerPayment" | "JournalEntry" | "BankTransaction"
  ownerId    String
  fileName   String
  mediaType  String
  sizeBytes  Int
  storageKey String
  sha256     String
  createdAt  DateTime @default(now())
  createdById String
  @@index([ownerType, ownerId])
  @@map("bookAttachment")
}

model AuditEvent {                                           // CORE table, append-only (trigger G12)
  id          String   @id @default(cuid())
  at          DateTime @default(now())
  module      String                                        // "bookkeeping"
  actorType   String                                        // USER | AGENT | SYSTEM | API_KEY
  actorId     String?
  actorLabel  String?                                       // name/email at the time
  action      String                                        // e.g. ENTRY_POSTED, DOC_ISSUED, DOC_VOIDED, LOCK_CHANGED
  entityType  String
  entityId    String
  summary     String
  before      Json?
  after       Json?
  reason      String?
  requestId   String?
  @@index([entityType, entityId, at])
  @@index([module, action, at])
  @@index([actorId, at])
  @@map("auditEvent")
}
```

Custom fields (phase 7, optional): add `counterpartyId`, `documentId` nullable FKs to `FieldValue` and two `FieldEntity` values per template-modules 1.2. A custom field never feeds a total.

Tables and who writes them (the "producer" list `report-verification` asks for):

| Table | Only writer | Readers |
|---|---|---|
| `JournalEntry`, `JournalLine` | `PostingService.post()` (one function) | every report, drill-down, export |
| `BookDocument.balanceMinor`, `LedgerPayment.unallocatedMinor` | `PostingService.refreshBalances(tx, ids)` after every post that tags them | lists only. Reports do not read them. |
| `BookDocument` (draft fields) | `DocumentService` | UI |
| `BankTransaction` | `BankImportService.commit()` (insert); status columns by `ReconcileService` | review queue |
| `BankMatch` | `ReconcileService` | reports, review queue |
| `AuditEvent` | `LedgerAudit.record(tx, ...)` in the same transaction as the change | audit screens |

### 3.2 Database guards (hand-written SQL in the migration)

Tier 2 ADD for new objects. For later changes to any of these: Tier 3, pull the live function with `pg_get_functiondef` first; never edit from this sketch.

Session variables set by the service inside each posting transaction: `SELECT set_config('app.actor_type','USER',true)`, `app.actor_id`, and only for users with `bookkeeping.lock`: `app.soft_lock_override='on'`.

| # | Guard | Fires | Rule |
|---|---|---|---|
| G1 | `ledger_entry_post_guard` | BEFORE UPDATE on `journalEntry` when OLD.status=DRAFT and NEW.status=POSTED | (a) at least 2 lines; (b) `SUM(baseDebitMinor) = SUM(baseCreditMinor)`; (c) if all non-ROUNDING lines share one currency, `SUM(debitMinor) = SUM(creditMinor)` over them; (d) FX_ADJUSTMENT and ROUNDING lines are in the entry base currency with rate 1, and ROUNDING base total is at most the number of lines minor units; (e) `NEW.baseCurrency = ledgerSettings.baseCurrency`; (f) every account is not archived; (g) date > `hardLockDate`; (h) date > `lockDate` unless `app.soft_lock_override='on'`; (i) `postedById` not null and `app.actor_type <> 'AGENT'`; (j) sets `firstPostedAt` if null; (k) number assigned. Takes `FOR SHARE` on `ledgerSettings` so a lock change waits for in-flight posts. |
| G2 | `ledger_entry_immutable` | BEFORE UPDATE OR DELETE on `journalEntry` | If OLD.status=POSTED: raise. No exceptions, including `memo`. DRAFT rows may be edited and deleted. Also rejects INSERT with status=POSTED (rows are born DRAFT and posted by the transition). |
| G3 | `ledger_line_immutable` | BEFORE INSERT OR UPDATE OR DELETE on `journalLine` | Look up the parent entry; if it is POSTED raise. (Draft cascade delete passes because the parent is DRAFT.) |
| G4 | `ledger_no_truncate` | BEFORE TRUNCATE on `journalEntry`, `journalLine`, `auditEvent`, `bankMatch` | Raise. |
| G5 | `ledger_reversal_guard` | BEFORE UPDATE (transition to POSTED) | If `reversesId` set: original is POSTED, not itself a REVERSAL, each line mirrors the original (same account, swapped side, same base amounts, same doc/payment tags). |
| G6 | `bank_match_guard` | AFTER INSERT OR UPDATE on `bankMatch`, constraint trigger | Sums and direction rules in the model above. Uses `FOR UPDATE` on the bank transaction row to serialise. |
| G7 | `ledger_account_guard` | BEFORE UPDATE on `ledgerAccount` | Reject change of `type`, `subtype`, `currency`, `systemRole` when any line exists; reject archive of an account with non-zero balance or `isSystem`. |
| G8 | `ledger_settings_guard` | BEFORE UPDATE on `ledgerSettings` | Reject `baseCurrency` change when `firstPostedAt` is set; reject lowering `hardLockDate` unless `app.actor_type='USER'` and `app.reopen='on'` (set by owner-only service call); `AuditEvent` row written by the service in the same tx. |
| G9 | `document_frozen_guard` | BEFORE UPDATE OR DELETE on `bookDocument` and `bookDocumentLine` | When status is ISSUED or VOID: only `dueDate`, `reference`, `notes`, `terms`, `balanceMinor`, `status` (ISSUED->VOID once), `voidEntryId`, `voidReason`, `voidedAt`, `voidedById`, `updatedAt` may change. Lines: no change, no delete. |
| G10 | `allocation_guard` | AFTER INSERT OR UPDATE on `documentAllocation`, constraint trigger | Active allocations never exceed the target total or the credit amount; currencies equal. |
| G11 | `bank_txn_guard` | BEFORE UPDATE OR DELETE on `bankTransaction` | Only `status` and `ignore*` columns may change; DELETE refused. |
| G12 | `audit_append_only` | BEFORE UPDATE OR DELETE on `auditEvent` | Raise. |

Plain constraints (CHECK, UNIQUE, partial indexes) are listed under each model. FKs on financial tables are `Restrict` so nothing can be deleted from under the ledger.

Why triggers and not only service checks: the agent and scripts hold a raw `db` client and the service is not the only door (`CLAUDE.md` Part 3 "a guard that is not switched on is not a guard"). Each guard has a test that feeds it the forbidden thing and watches it refuse (section 11, T2). A migration-time test also asserts the trigger list in `pg_trigger` equals this table.

---

## 4. Posting rules

One function, `PostingService.post(tx, input)`. Pure builders turn a document into a `PostingInput` (lines with side, account, currency, txn amount, counterparty, tags) with NO database access, so every rule below is a table-driven unit test. `post()` then: takes the advisory lock on `sourceKey` (`lockIdempotencyKey`) and returns the existing entry if one exists; reads `LedgerSettings` `FOR SHARE`; resolves rates (or uses the frozen ones); computes base amounts and the ROUNDING line; inserts the entry as DRAFT with lines; flips to POSTED (guards run); refreshes the cached balances; writes the `AuditEvent`. All in the caller's transaction, so "issue invoice" and its entry commit together or not at all (rule 8).

Notation: Dr/Cr, `[doc]` = tagged `documentId`, `[pay]` = tagged `paymentId`, `{tax}` = `taxRateId` on the line. AR/AP are found by `systemRole`.

### 4.1 Base conversion and rounding (shared by every rule)

- Rate: document or payment carries one frozen `fxRate` (base per 1 unit). Identity when currency = base.
- Each line: `base = round_half_away_from_zero(txn * rate, minorUnitsOf(base))`. Conversion uses `Decimal`, never JS floats. `minorUnitsOf` is reused, so JPY and a hypothetical 3-decimal currency convert between exponents correctly.
- If base debits and base credits then differ by `d` (always a few minor units), add ONE `ROUNDING` line for `d` on the Rounding account. If `|d|` exceeds the number of lines in minor units, abort: it is a bug, not rounding.
- Same currency as base: no conversion and no rounding line is possible.

### 4.2 Rules

| # | Event | Lines | Notes |
|---|---|---|---|
| R1 | **Invoice issue** | Dr AR total `[doc]`; Cr Revenue per line (net) `{tax}`; Cr Tax payable per rate `{tax}` (kind TAX) | Source `INVOICE`, key `invoice:<id>:issue`. Needs customer, at least one line, total > 0, issue date unlocked, rate available. |
| R2 | **Bill issue (approve)** | Dr Expense/asset per line (net) `{tax}`; Dr Tax receivable per rate `{tax}`; Cr AP total `[doc]` | If rate is not `recoverable`, tax is added to the expense line and there is no tax line. Duplicate-bill guard: same vendor and same `reference`. |
| R3 | **Customer credit note issue** | Dr Revenue per line `{tax}`; Dr Tax payable `{tax}`; Cr AR total `[doc]` | Credit sits as an open credit on the customer until applied or refunded. |
| R4 | **Vendor credit issue** | Dr AP total `[doc]`; Cr Expense per line `{tax}`; Cr Tax receivable `{tax}` | Mirror of R3. |
| R5 | **Customer payment (RECEIPT)** | Dr Bank `bankAmount` base; Cr AR `[doc]` for each allocated invoice, each at that invoice's remaining base value; Cr AR `[pay]` for any unallocated remainder (credit on account) at the payment rate; Dr/Cr `FX_ADJUSTMENT` for the base difference | See 4.3. Source `PAYMENT`, key `payment:<id>`. |
| R6 | **Vendor payment (PAYOUT)** | Dr AP `[doc]` per bill; Dr AP `[pay]` for an unallocated prepayment; Cr Bank; FX_ADJUSTMENT | Mirror of R5. |
| R7 | **Customer refund (CUSTOMER_REFUND)** | Dr AR `[doc credit note]` or Dr AR `[pay]` (consumes the credit); Cr Bank | Refund amount cannot exceed the open credit. |
| R8 | **Vendor refund (VENDOR_REFUND)** | Dr Bank; Cr AP `[doc vendor credit]` or Cr AP `[pay]` | |
| R9 | **Apply credit** (credit note, vendor credit or unallocated payment to an invoice or bill) | Dr AR `[credit]` amount; Cr AR `[target]` amount (AP mirrored); FX_ADJUSTMENT if base values differ | Source `ALLOCATION`. Same document currency required. No cash moves. |
| R10 | **Unapply** | Reversal (R14) of the allocation's entry; `DocumentAllocation.reversedAt` set | Open balances come back automatically because they are derived from lines. |
| R11 | **Bank spend** (money out, no document) | Dr Expense/asset per split `{tax}` `[counterparty]`; Dr Tax receivable; Cr Bank | Source `BANK_SPEND`, key `bank:<bankAcct>:<fingerprint>`. The Cr Bank line is the one `BankMatch` points at. |
| R12 | **Bank receive** (money in, no document) | Dr Bank; Cr Income per split `{tax}`; Cr Tax payable | Source `BANK_RECEIVE`. |
| R13 | **Transfer** between own accounts, same currency | Dr destination Bank; Cr source Bank | Source `TRANSFER`. Each side is matched to its own bank transaction. If only one side has arrived, the entry is created from it and the other bank line later matches the existing line (in-flight transfer). Different currencies: later item. |
| R14 | **Reversal** | Same accounts, sides swapped, same tags, same counterparty, base amounts COPIED from the original (not re-converted), `reversesId` set | Date defaults to today (business zone) and must be unlocked. The original and the reversal both stay. A reversal cannot be reversed; re-enter instead. |
| R15 | **Void document** | R14 on the issue entry, then `status=VOID`, `voidEntryId` | Only when `balanceMinor = totalMinor` (no payment or credit applied). Otherwise: "Remove the payments applied to this invoice first." |
| R16 | **Void payment** | R14 on the payment entry and on its allocation entries; matched bank line goes back to REVIEW (`BankMatch` UNDONE) | Needs a reason. Covers returned/NSF payments: invoice reopens. |
| R17 | **Manual journal / adjustment** | User lines, any accounts except AR, AP, bank, card | Draft until posted. Source `MANUAL` or `ADJUSTMENT` (accountant, mandatory memo). |
| R18 | **Opening balances** | One entry dated `conversionDate` minus one day: all balance-sheet accounts except AR/AP, balancing line to Opening Balance Equity | Bank accounts may be touched ONLY by this source. Open invoices/bills are entered as documents with `isOpening=true`: Dr AR `[doc]` / Cr Opening Balance Equity (single line, no revenue). Attention shows OBE until it is zero. |
| R19 | **Period close / year end** | None | No closing entries. Balance sheet computes "Retained earnings (prior years)" and "Current year earnings" from income and expense. |

### 4.3 Settlement base value and FX (R5, R6, R9)

For each allocated document the credit to AR (debit to AP) in base is the document's REMAINING base value times `allocated / remainingTxn`, rounded, except that settling the full remainder takes the entire remaining base value (so no one-cent residue is ever left on a paid invoice). Remaining base = sum of the document's tagged control lines in base, read from the ledger inside the transaction under `FOR UPDATE` of the document row.

Bank side in base: if the bank account is in base currency, the user enters what actually arrived (`bankAmountMinor`); if the bank account is in the payment currency, base = amount times the payment rate.

`FX_ADJUSTMENT` line = (base value of cash) minus (base value released from AR). A gain credits and a loss debits the FX Gain/Loss account, flagged `kind=FX_ADJUSTMENT`. When currencies all equal base, the line is absent.

Concurrency: two payments hitting one invoice at once serialise on the document `FOR UPDATE`; the second sees the reduced remainder and is rejected if it would overpay (overpayment is an explicit "credit on account" choice, never an accident).

### 4.4 Fields a posted thing cannot lose

Every entry carries `sourceKey` (idempotency), `postedById`, `postedAt`, and an `AuditEvent`. Every AR/AP line carries the tag that ties it to its document. Reversals carry the original's tags so the open balance of a voided invoice returns to exactly zero and tests can prove it.

---

## 5. Screens and flows

Route group: `apps/app/app/(app)/[slug]/books/...`, guarded by `requireModule("bookkeeping")` in its layout (template-modules 2.3). One rail item "Books"; inside, a segmented section bar: **Sales, Purchases, Banking, Accounting, Reports**. Settings contributes a "Books" section to the settings sidebar. Filters live in the URL (`nuqs`), per `url-structure` and the existing data-table. Lists use `packages/ui` data-table and saved views. UI follows `docs/design.md` (one filled button per surface, no custom radii). Read `build-with-the-user-in-mind`, `ui-ux-pro-max` and `mobile-view-optimization` before building any screen below.

| Route | Purpose | Desktop | Phone |
|---|---|---|---|
| `/books` | Home: cash, receivable (overdue part), payable, profit this month vs last, Attention count. Same widgets feed the core Overview. | Cards plus Attention list and two quick-action buttons | Cards stacked; Attention first when non-empty; floating "+ Invoice" |
| `/books/sales` | Invoices and credit notes list; tabs All / Draft / Awaiting payment / Overdue / Paid / Void | Table: number, customer, issue, due, total, balance, status chip; bulk "Record payment" | Card list (customer, amount, due, status); filter chips scroll horizontally; no table |
| `/books/sales/new`, `/books/sales/[id]` | Create/edit draft; issued view is read-only with History tab and Reverse/Void | Two-column: form and live totals preview | Single column bottom-sheet flow: customer, lines (one card per line), tax, total sticky bar, Save draft / Issue |
| `/books/customers`, `/books/customers/[id]` | Counterparties with isCustomer; statement of open items, history | Table, detail sheet | List and detail |
| `/books/purchases`, `/books/purchases/new`, `/books/purchases/[id]` | Bills and vendor credits, same shape; "Due this week" strip; duplicate-bill warning on save | as above | as above; attach photo when storage is on |
| `/books/vendors`, `/books/vendors/[id]` | mirror of customers | | |
| `/books/payments` | All money movements; filter by kind/customer/date; unallocated credits shown | Table | Cards |
| `/books/banking` | One card per bank account: GL balance, last import, **N to review**, oldest unreviewed age | Cards | Cards |
| `/books/banking/[accountId]` | Tabs **To review / Matched / Ignored / All**; the review queue is the main workspace (7.4) | Master list plus right panel (suggestion, categorise form, find match) | Full-screen card stack: line, suggestion, three big buttons Accept / Categorise / Park in Uncategorized |
| `/books/banking/[accountId]/import` | Upload, map, preview, commit (7.1) | Stepper | Stepper, upload via file picker |
| `/books/accounting/accounts`, `/accounts/[id]` | Chart of accounts with balances; account ledger (drill-down) | Tree table | Grouped list |
| `/books/accounting/journal`, `/journal/new`, `/journal/[id]` | Entries list (filter by source), manual journal form, entry view with lines, source link, reversal link | Table, balanced-check bar while typing | View only; journal entry is a desktop task (create is hidden under a "Use a larger screen" note, view works) |
| `/books/reports`, `/books/reports/[kind]` | Report index and each report (section 6) | Filter bar plus table, export button | Key totals as cards, expandable groups, no horizontal scroll; export still available |
| Settings > Books | Setup checklist, lock dates, tax rates, numbering, default accounts, opening balances, users and roles shortcut | | |

### 5.1 Key flows (acceptance, written as the user does them)

1. **Invoice on a phone (O1).** Tap + Invoice. Pick or quick-add customer (name only is enough). Add a line: description, qty, price; account and tax default from the customer or the chart. Total updates live. Tap Issue: number appears, "Share link / Download PDF" shown (PDF is a later item; v1 offers a print-friendly page). Done under 60 seconds, 8 taps or fewer for one line.
2. **Record a payment (O2).** On the invoice or from the list: Amount (defaults to balance), date (today), deposit account, reference. Overpay shows "This leaves a $X credit on the customer. Keep as credit?" and requires an explicit yes.
3. **Review a bank line (O5, B-1).** The card shows date, description, amount, and the best suggestion with the reason ("Matches INV-0042, exact amount"). Accept posts. Categorise opens account, customer/vendor, tax, memo; Park puts it in Uncategorized (B19). Every outcome shows an Undo toast for 10 seconds and stays undoable from Matched.
4. **Fix a mistake (B-4).** On any posted thing: Void (documents/payments) or Reverse (journals). Reason required. The screen then offers "Create corrected copy" as a new draft.
5. **Month end (B-3).** Reports > Bank reconciliation: statement balance (from import or typed) vs ledger balance; difference listed item by item; must be zero or fully named. Attention list empty or consciously left. Accountant sets the lock date.
6. **Accountant tax-time (A-2, A-5).** Reports > Accountant bundle: choose fiscal year, Download. Open `manifest.json` totals equal the on-screen reports.

### 5.2 Rules every screen follows

- Money is formatted from minor units with the currency's exponent; foreign amounts always show the code, base amounts show the base code once in the header. Never mix: a column is either document currency or base, labelled.
- Empty states say what to do next and have one action. First visit with no accounts redirects to the setup checklist.
- Every figure in a report is a link (new tab) to the lines behind it.
- Destructive-looking actions (void, reverse, lock) use the `destructive` variant and a confirm that states the effect.
- Loading, error and permission-denied states exist for every list and sheet. A 403 from the service renders "You do not have access", never a blank.
- No dashes in copy.

---

## 6. Reports, and how each is proven

All reports are computed by ONE `LedgerQueryService` using SQL aggregates over `JournalLine` joined to POSTED `JournalEntry`, filtered by the entry `date` (date-only compare, no time zone arithmetic). No report reads `BookDocument` totals, `balanceMinor`, or any cache. Money is summed as `SUM(...)::text` and parsed to BigInt (Prisma returns `numeric` for `SUM(bigint)`; never let it become a JS number).

Shared contract (`analytics-reports-architecture`): scope is the single entity; filters are materialised (the checkboxes you see are the filters applied); every report header states basis (ACCRUAL), date range, base currency, time zone, generated-at, lock date, and **what is not counted**: "N draft documents ($X) not included", "Uncategorized balance $Y", "N bank lines awaiting review". All rows appear, including zeros, for accounts (roster is the chart of accounts). Exports mirror the screen: same rows, same totals, money as decimal numbers, UTF-8 with BOM, dates ISO.

| Report | Definition | Proof (must hold, tested, and shown in the footer as a green tick or a red mismatch) |
|---|---|---|
| **Trial balance** (as of D) | Per account: sum of base debits and credits with `entry.date <= D`, shown as a debit or credit balance | Total debits = total credits to the minor unit. Equals the sum of the same account balances from the General ledger report. |
| **General ledger / account ledger** (range) | Opening balance, every line in the range with entry number, source, memo, counterparty, running balance, closing balance | Opening + movements = closing for every account; closing equals the trial balance row. |
| **Profit and loss** (range, optional compare) | Income, Cost of sales, Gross profit, Operating expenses, Other income/expense, Net profit; by subtype section; optional by-month columns | Net profit = change in (equity + retained) over the range once owner draws/contributions are accounted for, i.e. P&L net for the fiscal year to date equals the Balance sheet "Current year earnings" for the same end date. |
| **Balance sheet** (as of D) | Assets, Liabilities, Equity; Equity includes "Retained earnings (prior years)" and "Current year earnings" computed from the ledger | Assets = Liabilities + Equity exactly (shown as a check). Each account equals the trial balance. |
| **AR aging / AP aging** (as of D) | Per customer/vendor, per open document: balance as of D = sum of its tagged control lines with `entry.date <= D`; bucket by days past `dueDate` as of D: Current, 1 to 30, 31 to 60, 61 to 90, 90+; open credits shown in their own column | Total of all buckets and credits = GL balance of the AR (AP) control account as of D. Both are shown side by side. Because manual journals cannot touch AR/AP, any difference is a bug and raises a ledger fault. |
| **Cash summary** (range) | Movement of every bank/cash/card account grouped by the other side's account (what the money was for), opening and closing balances | Opening + in - out = closing per account; closing = GL balance. |
| **Bank reconciliation** (account, as of D) | Statement ending balance (from import or typed) vs ledger balance; list of unreconciled ledger lines and of bank lines in REVIEW; difference | Statement balance + ledger items not on statement - statement items not in ledger = ledger balance; difference fully explained or shown red. Also the daily tie-out: opening + sum of lines = closing when `balanceAfterMinor` is present. |
| **Tax summary** (range) | Per tax rate: net sales, tax collected, net purchases, tax paid, net owed. From lines with `taxRateId`: TAX-kind lines give tax, NORMAL lines on the same rate give the net | Tax collected total = movement on the tax payable account(s) for those rates in the range. |
| **Customer and vendor balances** | Same data as aging, one row per counterparty | Sum = AR/AP control balance. |
| **Opening Balance Equity and Suspense check** | Two balances, drill-down | Shown on Attention until zero. |
| **Journal report** | All entries in range with lines | Entry count and totals reconcile to the trial balance movement. |

Verification method for every report before it is called done (`report-verification`, all five questions):
1. **Producer check.** For the last 30 days of the demo/real data: documents issued per day and payments per day next to entries posted per day, per source. A gap is the bug. Automated as integrity check I3/I7 and run by hand once per report in phase 3 to 5.
2. **Filter cascade.** Date range -> counterparty -> account order; options narrow; changing an earlier filter resets later ones; walked in a real browser.
3. **Roster.** All accounts appear including zeros; all counterparties with a balance appear.
4. **Reconcile to the cent.** On-screen total = independent SQL total = export total, on a busy dataset (the generated 1M-line dataset and the golden year, not only a handful of rows).
5. **Click-through.** Every figure opens its lines in a new tab; the lines sum to the figure.

Performance budget: any report over a one-year window on 1M lines under 1 second p95 on the Render instance size chosen by S1. If missed: add a monthly balance snapshot table (derived, rebuildable) in phase 9, never by caching report output.

Skipped on purpose in v1 (and why): cash-basis P&L (B16), statement of cash flows (indirect method needs classification of every account; "Cash summary" answers the owner's question), budgets, unrealized FX report, customer statements.

---

## 7. Bank CSV import and matching

### 7.1 CSV import (deterministic code in the API; no model involved)

Flow: Upload -> Detect -> Map -> Preview (dry run) -> Commit. Same wizard shape as the industry imports (map columns, preview, commit); a saved mapping per bank account (`importProfile`) makes the next import one click.

| Concern | Rule |
|---|---|
| File | `.csv` / `.txt`, max 5 MB and 20,000 rows. Encoding UTF-8 with or without BOM, falling back to Windows-1252. Delimiter detected among comma, semicolon, tab. Quoted fields with embedded newlines handled by a real parser, not `split`. |
| Header | First row auto-detected as header when non-numeric; user can override. Skip N preamble rows. |
| Columns to map | Date, Description, and ONE of: signed Amount; Debit and Credit columns; Amount plus Type (DR/CR, Debit/Credit). Optional: Reference, Balance. |
| Date | Formats tried and shown to the user for confirmation when ambiguous (`03/04/2026`): the preview prints the parsed date in words ("4 March 2026") before commit. Stored as date-only. |
| Numbers | Detect decimal separator and thousands separators per file; parentheses and trailing minus as negative; currency symbols stripped. Parsed to BigInt minor units using the account's currency exponent, never via float. A value with more decimals than the exponent is rejected, not rounded. |
| Sign | Normalised so positive = debit to the ledger account. `invertSign` per account for card statements. The preview shows totals in and out so the user can check against the statement. |
| Dry run | Reports: rows new, rows already imported (duplicates), rows rejected with reason and row number, first 20 rows as parsed, total in, total out, date range, running-balance tie-out if a Balance column exists. Nothing is written. |
| Commit | One transaction. Inserts `BankImport` and the new `BankTransaction` rows with `ON CONFLICT (bankAccountId, fingerprint) DO NOTHING`. Rejected rows are listed in `rejectReport` and downloadable; they are never silently dropped. Same file hash again returns the existing import ("already imported on <date>"). |
| After commit | Runs matching (7.3) for the new rows, writes an `AgentTask`/event for categorisation if the assistant is enabled, shows "N new, M to review". |
| Later formats | OFX/QFX, then the BAI2 daily feed (`bank-transaction-feed` skill) write the same `BankTransaction` table with the bank's own id in the fingerprint. Not in v1. |

### 7.2 Fingerprint (what makes re-import safe)

`fingerprint = sha256(bankAccountId | date | signedAmountMinor | normalizedDescription | bankReference or "" | occurrence)` where `normalizedDescription` is lower-cased, whitespace-collapsed, and `occurrence` is 1, 2, 3 for identical keys in file order within the same file and day. So two real identical coffee purchases the same day are two rows, and re-importing the same file creates none. Overlapping files (statement runs that share days) reproduce the same occurrence numbers when the shared days are complete. If an incoming row matches an existing row on date, amount and description but has a DIFFERENT occurrence from a different import, it is inserted with `suspectDuplicate=true` and shown in the review queue with a "possible duplicate of ..." link. It is never auto-dropped (rule 9) and never silently doubled.

### 7.3 Matching passes (order of certainty; each pass only sees what earlier passes left)

Deterministic, idempotent, per bank account, never across accounts or currencies. Output is `BankSuggestion` rows, **never** a posting (B11). Each suggestion records its pass and rule.

| Pass | Rule | Confidence |
|---|---|---|
| 1 Reference | Description or reference contains an issued document number or payment reference AND the amount equals that document's open balance (money in: invoice/vendor credit; money out: bill/customer credit refund). Reference found with a different amount becomes an exception "partial or wrong amount" with the document shown. | EXACT |
| 2 Payouts | Processor payout matching (Stripe etc.). **Not in v1.** | n/a |
| 3 Amount and date | Same amount, same direction, within 3 business days of due date or of the document date, and exactly ONE open candidate. Two or more candidates: no suggestion, the exception lists all. | LIKELY |
| 4 Saved rules | `BankRule` by priority: contains / equals / startsWith / amount between, then action: categorise, set counterparty, mark transfer, ignore. | LIKELY (rule name shown) |
| 5 Transfer pairing | Opposite signs, equal amounts, two accounts of the same currency, within 5 business days, both unmatched. | LIKELY |
| 6 Possible | Fuzzy counterparty name; sum of 2 to 4 open items equal to the line; close but not equal amounts. Suggestions only, labelled "Possible". | POSSIBLE |

Hard rules: never match on doubt; matching never changes an amount; a difference is recorded explicitly (fee, short pay, overpayment) through the Categorise/Split action; business days, not calendar days; same currency only.

### 7.4 Review queue actions (the human part)

For each REVIEW line, exactly these outcomes, all undoable and audited:
1. **Accept suggestion** (pass 1/3/4/5/agent). Creates the payment + allocation, or the spend/receive entry, or pairs the transfer; links via `BankMatch`.
2. **Match to existing**: pick an already-recorded payment or spend/receive entry (search by amount/date/name); links via `BankMatch` only, no new entry.
3. **Categorise**: spend/receive entry with one or several splits (account, tax, counterparty), covers fees and partial amounts. Offer "Create a rule from this".
4. **Pay documents**: choose invoices/bills (one or many, partial allowed, overpayment becomes credit on account).
5. **Transfer**.
6. **Park in Uncategorized**: spend/receive against the Suspense account.
7. **Ignore** with a reason (duplicate, personal, not ours). No ledger effect. Ignored count and total appear on the bank screen and Attention.
8. **Split** a line across several items; the sum of active matches may never exceed the line (G6).
Undo = `BankMatch` goes UNDONE and any entry the action created is reversed (R14); the line returns to REVIEW. Nothing is ever deleted.

Cases the tests must cover (from `bank-reconciliation`): batched deposits, fees taken out, partial payment, overpayment, refunds, returned (NSF) payment, transfers across days, duplicate files, weekends and holidays, foreign currency.

---

## 8. Permission keys

Capability keys checked in the tRPC middleware AND the service (`CLAUDE.md` rule kept from crm; the UI only hides). Declared in the module's `meta.ts` `permissions` map (template-modules 2.2). Two new roles are added when the module is enabled (assumption A2).

| Key | Allows |
|---|---|
| `bookkeeping.read` | See documents, counterparties, payments. NOT the ledger, banking, or reports. |
| `bookkeeping.write` | Create and edit drafts, counterparties; draft documents; upload and match nothing posted. |
| `bookkeeping.post` | Issue, void, record payments, apply credits, post journals, reverse, accept bank suggestions, accept agent proposals. |
| `bookkeeping.bank` | See banking, import files, run review queue, create rules. |
| `bookkeeping.reports` | All reports and all exports including the accountant bundle. Also grants read of the ledger and chart of accounts. |
| `bookkeeping.settings` | Chart of accounts edits, tax rates, numbering, default accounts, opening balances. |
| `bookkeeping.lock` | Set `lockDate` forward; post on or before the soft lock with a reason. |
| `bookkeeping.reopen` | Move either lock date backwards; change `hardLockDate`. |

| Role | read | write | post | bank | reports | settings | lock | reopen |
|---|---|---|---|---|---|---|---|---|
| owner | yes | yes | yes | yes | yes | yes | yes | yes |
| admin | yes | yes | yes | yes | yes | yes | yes | no |
| bookkeeper (new) | yes | yes | yes | yes | yes | no | no | no |
| accountant (new) | yes | yes (adjustments) | yes | yes | yes | yes | yes | no |
| member | yes | yes | no | no | no | no | no | no |

Notes: an accountant should be invitable read-and-adjust without admin rights over users or SSO (those stay `admin`/`owner` via core). Agents act under the asking user's keys but are further limited to `read`+`write` equivalents (section 9). API keys (core feature) get the same keys; a key defaults to none. A permission test iterates every procedure x every role (T7).

---

## 9. Agent tools (proposals only, a human posts)

The agent proposes; the human disposes (B11, B12). Tools live in `apps/agent/agent/tools/bookkeeping/` (excluded when the module is off, A4) and use `changeWrite()` approval (`lib/approval.ts`) so an automated/unattended session cannot run them.

| Tool | Does | Writes |
|---|---|---|
| `bk_list_attention` | Read: review queue size, oldest age, suspense, overdue, ledger faults | nothing |
| `bk_search_ledger` | Read: bounded search of entries, documents, counterparties; returns ids and entry numbers | nothing |
| `bk_explain_number` | Read: given a report line or account and range, returns the ledger lines (entry number, date, memo, amount) that make it. The model must quote entry numbers; it never computes totals itself. | nothing |
| `bk_propose_categorization` | For bank lines in REVIEW: proposes account, counterparty, tax rate with a plain-words rationale and confidence | `BookkeepingProposal` (+ `BankSuggestion` row of pass AGENT) |
| `bk_propose_match` | Proposes existing documents/payments for a bank line | same |
| `bk_draft_document` | Turns a note ("invoice Acme 3 hours at 120 for the redesign") into a DRAFT invoice or bill | `BookDocument` with `status=DRAFT` only |

Rules:
- **No tool issues, posts, voids, reverses, locks, imports, or edits settings.** Not exposed, not implemented in agent code.
- **Ids only, amounts from the server.** A proposal payload holds account, counterparty and tax-rate ids chosen from the live lists (validated by zod against current rows). The amount is copied from the bank line by the server when the human accepts. The model cannot invent or alter an amount.
- **Untrusted text.** Bank descriptions and vendor names are untrusted input to the model; they can only influence which existing id is suggested, which a human sees and approves.
- **Accepting = a human action** through the same `PostingService` path, recorded with `proposalId` on the entry and `actorType=USER`. Acceptance re-validates everything (period unlocked, account not archived, line still in REVIEW). Stale proposals expire when their subject is matched or ignored.
- **Structural guards:** lint/test that `apps/agent` has no reference to `journalEntry`, `journalLine`, `bankMatch` or `PostingService`; the DB refuses a post when `app.actor_type='AGENT'` (G1).
- Trigger: on import commit, Nest writes an agent task row (the existing `AgentTriggerService` pattern, `docs/api.md`); intelligence stays in `apps/agent`. Until S2's AgentTask `subject`/`kind` change lands, categorisation runs on request from chat. No vendor client or model call ever goes into `apps/api`.
- Agent instruction section `agent/instructions/bookkeeping.md`: never state a number you did not read from a tool result; say "I don't know" when a tool returns nothing.

---

## 10. Seed: default chart of accounts per vertical

`bun run db:seed` runs the module's idempotent `seed` (template-modules 2.3) only when bookkeeping is enabled. It: creates `LedgerSettings` (base currency from the client config or `reportingCurrency`), `NumberSequence` rows (INVOICE `INV-`, CREDIT_NOTE `CN-`, VENDOR_CREDIT `VC-`, PAYMENT `PMT-`, ENTRY `JE-`), the system accounts, and ONE preset's accounts. Rules: create-if-missing by `code`, never overwrite a name a user edited, system accounts found by `systemRole`, safe to run twice, never deletes. The preset is chosen in the setup wizard; `client.config.ts` may name a default (`modules.options.bookkeeping.preset`, a request to S2's config schema). Code scheme: 1xxx assets, 2xxx liabilities, 3xxx equity, 4xxx income, 5xxx cost of sales, 6xxx operating expenses, 7xxx/8xxx other.

### 10.1 System accounts (every preset, locked: `isSystem`)

| Code | Name | Type / subtype | systemRole |
|---|---|---|---|
| 1100 | Accounts Receivable | ASSET / ACCOUNTS_RECEIVABLE | ACCOUNTS_RECEIVABLE |
| 2000 | Accounts Payable | LIABILITY / ACCOUNTS_PAYABLE | ACCOUNTS_PAYABLE |
| 2300 | Sales Tax Payable | LIABILITY / TAX_LIABILITY | none (default tax account, replaceable) |
| 1400 | Sales Tax Receivable (Input Tax) | ASSET / CURRENT_ASSET | none |
| 3000 | Owner's Equity | EQUITY / OWNER_EQUITY | none |
| 3100 | Retained Earnings | EQUITY / RETAINED_EARNINGS | RETAINED_EARNINGS |
| 3900 | Opening Balance Equity | EQUITY / OWNER_EQUITY | OPENING_BALANCE_EQUITY |
| 1900 | Uncategorized (review) | ASSET / CURRENT_ASSET | SUSPENSE |
| 7100 | Foreign Exchange Gain/Loss | EXPENSE / OTHER_EXPENSE | FX_GAIN_LOSS |
| 7900 | Rounding | EXPENSE / OTHER_EXPENSE | ROUNDING |

### 10.2 `general-services` (default; the base for every vertical)

Assets: 1000 Checking (BANK), 1010 Savings (BANK), 1020 Cash on Hand (CASH), 1500 Equipment (FIXED_ASSET), 1590 Accumulated Depreciation (FIXED_ASSET), 1600 Prepaid Expenses (CURRENT_ASSET).
Liabilities: 2100 Credit Card (CREDIT_CARD), 2200 Payroll Liabilities (CURRENT_LIABILITY), 2400 Customer Deposits (CURRENT_LIABILITY), 2500 Loans Payable (LONG_TERM_LIABILITY).
Equity: 3200 Owner's Draws, 3300 Owner's Contributions.
Income: 4000 Service Revenue, 4100 Other Revenue, 4900 Interest Income (OTHER_INCOME).
Cost of sales: 5000 Direct Labor, 5100 Subcontractors, 5200 Materials and Supplies Used.
Operating expenses: 6000 Advertising and Marketing, 6050 Bank and Card Fees, 6100 Insurance, 6150 Licenses and Permits, 6200 Meals, 6250 Office Supplies, 6300 Professional Fees, 6350 Rent, 6400 Repairs and Maintenance, 6450 Software and Subscriptions, 6500 Telephone and Internet, 6550 Travel, 6600 Utilities, 6650 Vehicle Expenses, 6700 Wages and Salaries, 6750 Payroll Taxes, 6800 Depreciation, 6850 Interest Expense, 6950 Other Expenses.

### 10.3 Vertical deltas (applied on top of general-services)

| Preset | Add | Rename / remove |
|---|---|---|
| `salon-spa` | Income: 4010 Service Revenue: Hair, 4020 Service Revenue: Nails and Skin, 4200 Retail Product Sales, 4300 Gift Card Redemptions; Liabilities: 2410 Gift Card Liability, 2420 Tips Payable; Cost of sales: 5300 Retail Product Cost, 5400 Colour and Treatment Supplies; Expenses: 6360 Booth/Chair Rental, 6420 Laundry and Towels, 6880 Continuing Education | Rename 5000 to Stylist Commissions |
| `retail` | Income: 4200 Product Sales, 4250 Shipping Income, 4290 Sales Discounts and Returns (contra); Assets: 1300 Inventory; Cost of sales: 5300 Cost of Goods Sold, 5350 Freight In, 5400 Inventory Adjustments, 5450 Merchant Fees; Expenses: 6360 Packaging | Remove 5000, 5100 |
| `trades-contractor` | Income: 4010 Labor Revenue, 4020 Materials Revenue, 4030 Change Orders; Assets: 1250 Retainage Receivable, 1300 Materials Inventory, 1550 Vehicles; Liabilities: 2410 Customer Deposits (Contracts), 2450 Warranty Reserve; Cost of sales: 5300 Job Materials, 5400 Equipment Rental, 5500 Permits (Job), 5600 Job Fuel and Travel | Rename 5100 to Subcontractors (Job) |
| `professional-services` | Income: 4010 Consulting Revenue, 4020 Retainer Revenue, 4030 Reimbursed Expenses; Liabilities: 2410 Retainer Deposits; Expenses: 6360 Professional Liability Insurance, 6880 Continuing Education | Remove 5200 |

Not seeded: inventory valuation, payroll postings, projects. A business that needs them gets a later module. Each preset gets a snapshot test (exact code list, no duplicate code, every account has a valid type/subtype pair, exactly one account per systemRole).

### 10.4 Setup wizard (core onboarding "activation checklist", filtered to this module)

1. Business basics: confirm base currency (locks at first post; the wizard says so) and time zone, fiscal year start month. 2. Pick a chart preset. 3. Add bank accounts (name, type, currency, start date for reconciliation). 4. Opening balances: a conversion date, balances for non-AR/AP accounts (paste or type), open invoices and bills as documents (B20). Skippable for a new business. 5. Tax rates. 6. Invite the accountant. 7. Import the first bank file. The checklist stays on `/books` until done. Every step is optional except 1 and 2.

---

## 11. Test plan: proving the books balance

Tests run against REAL Postgres (the `*_test` database harness `packages/db/scripts/test-db.ts`), because the guards are SQL. Mock-only tests prove nothing here. Every test names the opposite failure it also checks.

| # | Layer | What it proves |
|---|---|---|
| T1 | **Money maths (unit, pure)** | Rounding half away from zero; tax exclusive and inclusive per line; discount; line totals sum to document totals for 10,000 generated documents; base conversion for USD, JPY (0 decimals), an invented 3-decimal currency; ROUNDING line bound; rate direction (base per quote) matches `ExchangeRate`. Opposite: no case produces a float or a lost minor unit. |
| T2 | **DB guards (observation)** | Feed each forbidden operation and watch it refuse: unbalanced post; one-line post; update/delete of a posted line or entry; insert into a posted entry; TRUNCATE; post inside hard lock; post inside soft lock without override; agent actor posting; double reversal; reversal of reversal; account type change with lines; base-currency change after first post; update/delete of audit rows; bank match exceeding a line; allocation exceeding a total; edit of an issued document's amounts. Plus the opposite: the same operations succeed when legal (draft edit, soft-lock override with reason, partial allocation). A migration test asserts the trigger/function list equals the G1 to G12 table. |
| T3 | **Posting rules (table-driven)** | R1 to R19: given a document, the exact expected lines (account, side, amounts, tags). For each rule also: the entry's reversal nets every account and every tag to zero. FX cases: invoice EUR, paid in full at a better and worse rate, partially paid twice, base bank vs EUR bank; last payment leaves zero residue. |
| T4 | **Property / fuzz** | Random sequences of 30 to 300 operations (issue, void, pay partial/full/over, credit note, apply, unapply, refund, bank spend/receive, transfer, FX documents, reversal, manual journal, lock changes) on a fresh DB. After EVERY step run all integrity checks (3.3 list below) and compare trial balance, P&L, balance sheet, aging with an independent pure-TypeScript ledger oracle (BigInt, written separately from the production code, deliberately naive). 200 seeds in CI, 5,000 nightly; the failing seed is printed and replayable. |
| T5 | **Known-answer report tests** | A hand-built fictional year (salon, 400 entries, tax, two currencies, a void, a credit note, a refund, a returned payment, an opening-balance conversion). Expected trial balance, P&L, balance sheet, aging and tax summary were computed by hand in a spreadsheet and committed as CSV; tests compare to the cent. |
| T6 | **Import** | Fixtures for at least 8 shapes: single signed amount; debit/credit columns; DR/CR type; semicolon and decimal comma; BOM; Windows-1252; thousands separators and parentheses negatives; preamble rows. Re-import identical file = 0 new; overlapping files; two identical rows same day stay two; a day cut mid-way yields a flagged suspect duplicate, not a silent drop; a bad row is listed, not skipped; 20,000 rows under 5 seconds. |
| T7 | **Permissions** | Matrix test: every procedure x every role (+ API key + agent) returns the section 8 result; service rejects even when middleware is bypassed (call the service directly). Agent bundle grep test: no ledger table reference in `apps/agent`. |
| T8 | **Matching** | Each pass with its exception case; ambiguity produces no suggestion; the pass never runs across accounts or currencies; running matching twice creates no second suggestion; accepting a stale suggestion fails closed. |
| T9 | **Concurrency** | Two transactions posting the same `sourceKey` -> one entry. Two payments racing one invoice -> second rejected. A lock-date change during a post -> post either completes before or is refused after, never lands inside. Two issues racing the number sequence -> consecutive numbers, no gap, no duplicate. |
| T10 | **End to end in a real browser** (`browser-verification`) | On a phone viewport and a desktop viewport: set up, create customer, issue invoice, import the demo bank CSV, accept a suggested match, categorise another, park a third, run P&L / balance sheet / aging, click a number through to its lines, export CSV and compare to the screen and to an independent SQL total, void an invoice, set a lock date and fail to post inside it. Screens and flows in 5.1 each get one pass. |
| T11 | **Scale** | Generate 1M lines. All reports under the 1 s budget; posting p95 under 200 ms; import 20k rows under 5 s. |
| T12 | **Module switch** | With bookkeeping off: routes 404, nav absent, router unmounted, agent tools absent, seed does nothing. Turn it on against an existing database: works with no migration (D2). |
| T13 | **Backup/restore drill** | Dump, restore into a fresh DB, run the integrity suite: all green. |

### 11.1 Integrity checks (also run nightly in production)

A scheduled job (nightly in the business time zone, plus on demand from Settings) runs these read-only queries. A failure is a **ledger fault**: written to `AuditEvent` (`LEDGER_FAULT`), shown on Attention, and reported through the project's error reporter at critical level for I1, I2, I4, I5 (would you investigate at 3am? yes) and tracked-quietly for the rest. Wiring to an alert system is a dependency (section 14); until it exists the job logs with `Logger.error` and writes the audit row.

| # | Check |
|---|---|
| I1 | Every POSTED entry: base debits = base credits. |
| I2 | Every POSTED entry has at least 2 lines; no line on a DRAFT entry older than 1 hour that is not a saved manual journal. |
| I3 | Every ISSUED document has exactly one issue entry; its AR/AP line equals `totalMinor`; no VOID document has an open balance; entries per day vs documents issued per day by source (producer check). |
| I4 | `BookDocument.balanceMinor` equals the balance derived from tagged lines, for every document. |
| I5 | AR control account balance = sum of open invoice balances minus open credits, same for AP. |
| I6 | No POSTED entry has `date <= hardLockDate` and `postedAt` after the lock was set. |
| I7 | Every RECORDED payment has an entry; payments per day vs payment entries per day. |
| I8 | No bank transaction or journal line is over-matched; every MATCHED bank transaction's active matches sum to its amount. |
| I9 | Per bank account with balance data: opening + lines = closing balance reported by the file. |
| I10 | Every entry whose `source` is a document/payment points at an existing row. |
| I11 | All entries' `baseCurrency` equals the ledger base currency. |
| I12 | Opening Balance Equity is zero once setup is complete; Suspense balance and age. |
| I13 | Every account in use is not archived (post-hoc archive slipped through). |
| I14 | Every reversal mirrors its original (accounts, sides, base amounts). |

---

## 12. Build phases (live checklist)

Gate: manager review between phases (as in template-modules 6). No phase starts before the one above is DONE and reviewed. Database work in every phase follows `CLAUDE.md` Part 3 (Tier 2 for new objects with the access-rule note in section 3; Tier 3 for any change after). No drop ever without the owner's explicit yes. A subagent dispatched for any of this is told the same.

| # | Item | Status |
|---|---|---|
| **0** | **Prerequisites and spikes (no product code)** | |
| 0.1 | S2 module mechanism present: registry, `requireModule`, `can(role, key)`, `apiModule` mounting (template-modules phases 3 and 4) | BLOCKED on S2 |
| 0.2 | `@crm/*` to `@app/*` rename finished and committed (this plan uses `@crm/db` names today; read them as `@app/db` after) | BLOCKED on S2 |
| 0.3a | Spike A2, better-auth custom roles: DONE 2026-11-04, ANSWER YES (see 0.9 below for the evidence and the two code changes needed). | DONE |
| 0.3b | Spike A1: multi-file Prisma schema under Prisma 7 (not run; belongs to S2 and needs the repo tree) | TODO |
| 0.4 | Spike: hand-written trigger migration with `migrate deploy` and `migrate dev` drift detection, Prisma 7.10.1 on Postgres 17 in a scratch project outside the repo: DONE 2026-11-04, WORKS (results in 0.10). Still TODO inside the repo: run it through `packages/db/scripts/test-db.ts` once S2 releases the tree. | DONE (scratch) |
| 0.5 | Decide with S2: core `AuditEvent` table; `FieldEntity` additions (phase 7); `modules.options` in `client.config.ts` | TODO |
| 0.6 | Confirm no tRPC transformer: DONE 2026-11-04, CONFIRMED (0.11). BigInt-as-string plan holds. | DONE |
| 0.7 | Confirm scheduler path for the nightly integrity job with S1 (in-process, advisory lock) | TODO |
| 0.8 | Re-read `docs/api.md` and `docs/design.md` right before phase 1 (they describe the CRM and may have moved) | TODO |
| **1** | **Ledger engine, no UI** | |
| 1.1 | Prisma models: `LedgerSettings`, `NumberSequence`, `LedgerAccount`, `JournalEntry`, `JournalLine`, `AuditEvent`; migration with G1 to G5, G7, G8, G12 | TODO |
| 1.2 | `packages/modules/bookkeeping`: `meta.ts` (nav, permissions), money library (`BigInt` helpers, rounding, minor-unit scaling, FX conversion, `businessToday`), pure posting builders for R14, R17, R18 | TODO |
| 1.3 | `PostingService`, `LedgerAudit`, `LedgerQueryService` (TB, GL), module seed (system accounts, `general-services`) | TODO |
| 1.4 | Tests T1, T2 (those guards), T3 (R14, R17, R18), T4 with manual journals and lock changes, T9 for `sourceKey` and numbers | TODO |
| 1.5 | Exit: 200-seed fuzz green; guard-by-observation list green; cold `check-types`, lint, `lint:dead`, tests | TODO |
| **2** | **Accounts, journals, settings, permissions (first value for the accountant)** | |
| 2.1 | tRPC routers: accounts, journal, settings (lock dates, numbering); service-level permission checks; roles | TODO |
| 2.2 | Screens: chart of accounts, account ledger, journal list/new/view/reverse, trial balance, general ledger, Settings > Books (lock, numbering) | TODO |
| 2.3 | Tests T7 (partial), T10 for these screens on phone and desktop | TODO |
| **3** | **Counterparties, documents, tax, core reports** | |
| 3.1 | Models: `Counterparty`, `BookDocument`, `BookDocumentLine`, `TaxRate`; G9; migration | TODO |
| 3.2 | Document maths and builders R1 to R4, R15; issue/void services; duplicate-bill guard; numbering at issue | TODO |
| 3.3 | Screens: Sales, Purchases, customers, vendors, document sheet, print view | TODO |
| 3.4 | Reports: P&L, balance sheet, AR/AP aging (with proofs), tax summary; exports | TODO |
| 3.5 | Tests T1, T3 (R1 to R4, R15), T5 started (golden year part 1), report verification for each report | TODO |
| **4** | **Payments, allocations, refunds, FX** | |
| 4.1 | Models: `LedgerPayment`, `DocumentAllocation`; G10; migration | TODO |
| 4.2 | R5 to R10, R16; FX rate input and warning for backdated documents; overpayment as explicit credit | TODO |
| 4.3 | Screens: record payment, apply credit, refund, payments list | TODO |
| 4.4 | Tests T3 (FX matrix), T4 (full operation set), T9 (race), T5 complete | TODO |
| **5** | **Banking** (FIRST CLIENT USABLE after 5.3, see the marker below) | |
| 5.1 | Models: `LedgerBankAccount`, `BankImport`, `BankTransaction`, `BankMatch`, `BankRule`, `BankSuggestion`; G6, G11; migration | TODO |
| 5.2 | CSV import (7.1, 7.2), saved profiles, dry-run, reject report | TODO |
| 5.3 | Review queue and actions 7.4 including R11, R12, R13 and undo; Uncategorized; ignore; split | TODO |
| **>>> FIRST CLIENT USABLE** | **Manager cut, 2026-11-04: phases 1 to 3 plus 5.1 to 5.3 (CSV import and review queue, no matching passes yet). Phase 4 payments are NOT in this cut, so the review queue in this version covers categorise, park, ignore, transfer, and accepting a spend/receive; paying invoices and bills from a bank line arrives with phase 4. Everything after 5.3 is improvement.** | MARKER |
| 5.4 | Reports: cash summary, bank reconciliation; Attention list | TODO |
| 5.5 | Tests T6, T3 (R11 to R13), T10 (bank flows on phone) | TODO |
| **6** | **Matching** | |
| 6.1 | Passes 1, 3, 4, 5, 6 (7.3); suggestions UI; bulk "accept all EXACT" with a visible list | TODO |
| 6.2 | Tests T8 | TODO |
| **7** | **Setup, opening balances, presets, widget, bundle** | |
| 7.1 | Setup wizard and checklist; opening balance entry (R18) and opening documents (B20); presets 10.3 with snapshot tests | TODO |
| 7.2 | Overview widget; search provider; command-palette actions | TODO |
| 7.3 | Accountant bundle export with `manifest.json` | TODO |
| 7.4 | Optional: custom fields on counterparty and document (FieldEntity additions) | TODO |
| **8** | **Agent** | |
| 8.1 | `BookkeepingProposal`; the six tools in section 9; instruction section; agent task trigger when S2 lands it | TODO |
| 8.2 | Structural guards: agent grep test, G1 actor check observed; prompt-injection test (a hostile bank description cannot change an amount or post) | TODO |
| **9** | **Hardening and docs** | |
| 9.1 | Nightly integrity job and Attention wiring (11.1); error reporter hookup | TODO |
| 9.2 | T11 scale, T12 module switch, T13 restore drill; balance snapshot table only if the budget is missed | TODO |
| 9.3 | Optional hardening: API database role without `TRUNCATE`/`DELETE` on ledger tables | TODO |
| 9.4 | After-build: one file in `docs/updates/` (create folder) per user-visible release, help articles `docs/help/books-*.md` (invoices, bills, bank import, reconciliation, closing the books, accountant access), `docs/DECISIONS.md` entries for B1 to B20, update `CLAUDE.md` Part 1 table row for Money | TODO |
| 9.5 | `review-build` gate on every phase; `verify-before-done` live check by hand; report what was NOT verified | TODO |

Later (not scheduled; each needs its own plan): outbound invoice email and reminders (needs the core send helper and message log, `email-infrastructure`), PDF generation, receipts and attachments (storage), recurring invoices/bills, customer statements, quotes/estimates, cash-basis reports, unrealized FX revaluation and a daily rate history table, cross-currency transfers, Stripe/processor payout matching (pass 2), OFX and BAI2 bank feeds, auto-reversing journals, budgets, statement of cash flows, inventory, payroll, 1099/year-end forms, multi-entity (explicitly out: one business per deploy).


### 12.1 Spike results (2026-11-04, run outside the repo)

**0.9 Custom roles `bookkeeper` / `accountant` (A2): YES, no fallback needed.** Evidence, read-only:
- `Member.role` is a free `String @default("member")`, not an enum: `packages/db/prisma/schema.prisma:1651`. A row can hold `bookkeeper` today.
- The repo does not use better-auth's own permission engine. A search for `hasPermission` / `checkRolePermission` across `apps` and `packages/auth/src` found zero callers. Authorization is the repo's own per-role helper functions in `packages/auth/src/organization.ts`.
- The only things that restrict the role set are repo code: `WORKSPACE_ROLES = ["owner","admin","member"]` at `packages/auth/src/organization.ts:8`, the coercion `toWorkspaceRole` at `organization.ts:113` and the duplicate `toRole` at `apps/api/src/workspace/workspace.service.ts:54-56` (both turn an unknown role into `"member"` silently), and `z.enum(WORKSPACE_ROLES)` at `apps/api/src/workspace/workspace.contracts.ts:26, 38, 51`.
- better-auth supports custom roles natively too: the organization plugin accepts `ac` and `roles` (`packages/auth/node_modules/better-auth/dist/plugins/organization/types.d.mts:57-62`) and optional `dynamicAccessControl` (`:66`). `hasPermission` merges `options.roles` (`has-permission.mjs:7`). The repo's `organization({...})` call at `packages/auth/src/auth.ts:213-228` passes neither, so better-auth treats only its default roles as known. Not tested: whether better-auth's own `updateMemberRole` endpoint rejects a role missing from `options.roles`. The repo changes roles through tRPC (`workspace.service.ts:197` area), so this does not matter unless that changes.
- **Required change (core, S2's module mechanism owns it):** make the role list data, not a literal: `WORKSPACE_ROLES` = core roles plus the enabled modules' declared roles, so the three places above read one list. Danger if only the constant is changed in one place: a `bookkeeper` is silently demoted to `member` by whichever copy of the coercion was missed (a silent permission change; add a test that a stored `bookkeeper` survives a read). Add the same list to `organization({ roles })` only if better-auth endpoints are ever used for role changes.
- Consequence for section 8: roles stay strings; module `permissions` maps role names to keys. No `MemberCapability` table needed.

**0.10 Hand-written trigger migration (0.4): WORKS.** Scratch project in the session scratchpad, Prisma 7.10.1, Postgres 17 in a throwaway Docker container (database `spike_test`, container removed afterwards). Four migrations: init, hand-written guards (`BEFORE INSERT/UPDATE/DELETE` row triggers on two tables, `BEFORE TRUNCATE` statement triggers, three plpgsql functions), then schema changes. Observed:
1. `prisma migrate deploy` applied the guard migration; `migrate status` said up to date; `pg_trigger` showed all 4 triggers.
2. `prisma migrate dev` with no schema change: "Already in sync". **No drift reported for triggers or functions** (Prisma does not introspect them, so it neither sees nor drops them).
3. Adding a column to a guarded table: the generated SQL was a plain `ALTER TABLE ... ADD COLUMN`. Triggers untouched (still 4).
4. Removing an enum value used by a guarded table: the generated SQL is `CREATE TYPE ..._new`, `ALTER COLUMN ... TYPE ... USING`, rename, `DROP TYPE ..._old` inside a transaction. It applied cleanly with a POSTED row present. Triggers and the function that declares a variable of that enum type survived (plpgsql resolves the type by name at run time). `migrate dev` afterwards: in sync.
5. Changing a column type on a guarded table: plain `ALTER COLUMN ... SET DATA TYPE`, triggers intact.
6. `prisma db push` on the in-sync schema left triggers intact (not tested with a changing schema).
7. Fresh database replay (deploy of all migrations) recreated all 4 triggers.
8. Guards observed refusing, with the exact text: update of a posted entry; delete of a posted entry; update, delete and insert on lines of a posted entry; insert of an entry born POSTED; `TRUNCATE` of either table, including `TRUNCATE ... CASCADE` from the parent. Observed allowed: draft edit and delete of a draft entry cascading to its lines.
Caveats found:
- **`prisma migrate dev` refuses to run non-interactively** when the change is destructive (enum value removal, some type changes) and **refuses `migrate reset` when invoked by Claude Code** (it needs a consent variable I did not set, on purpose). Workflow for agents: `prisma migrate diff --from-config-datasource --to-schema <schema> --script` prints the exact SQL, save it as the migration folder by hand, then `migrate deploy`. I used this in the spike.
- The residual risk is Prisma generating `DROP TABLE` / recreate for some change, which would silently drop the triggers with the table. None of the changes I tried did, but the safety net is the migration test in T2: after ALL migrations, the set of triggers and functions in `pg_trigger` / `pg_proc` must equal the G1 to G12 list. Keep that test; it also catches a drifted production database.
- The guard SQL here was a G2/G3/G4-style sketch, not the full G1. The balance check and lock-date check (G1) were not exercised; they are ordinary plpgsql with no new Prisma interaction.
- Not run: the repo's own `test-db.ts`/`bun test` (repo tree is off limits while the rename runs).

**0.11 No tRPC transformer: CONFIRMED.** Web client links are `httpBatchLink({ url: "/api/trpc" })` with no `transformer` option: `apps/app/lib/trpc/client.tsx:31`, and the server-side client `apps/app/lib/trpc/server.ts:16-18`. A search of `apps/api/src` for `transformer` / `superjson` found only `class-transformer` in `config/env.validation.ts:1`. So JSON is plain and a `BigInt` would throw on serialisation: money must cross the wire as decimal strings of minor units (B5). Contracts must also declare the string form in zod (`z.string().regex(/^-?\d+$/)`) so the generated `AppRouter` types say `string`, not `number`.
---

## 13. Industry standard: what we copy and what we skip

Compared from the three products' documented behaviour as I know it; none was run during this plan. Treat as design reference, not citations.

| Piece | QuickBooks Online | Xero | Wave | We do |
|---|---|---|---|---|
| Accounts | Types plus detail types, auto numbering optional | Types, system accounts (AR, AP, Retained Earnings, Rounding, FX gain/loss), tracking categories | Simple categories over double entry | **Copy** type plus subtype and Xero's system-account idea. **Skip** tracking categories/classes in v1 (later). Show categories, hide debit/credit outside Accounting (Wave's lesson). |
| Edit vs void | Edit and delete with audit log | Void; edit with history | Edit | **Copy Xero voids**, stricter: no edit of financial fields (B2). |
| Lock dates | One closing date plus password | Two lock dates (everyone / non-advisers) | None | **Copy Xero** (B8). Skip the password; roles do the job. |
| Manual journals | Allowed to any account | Blocked from control and bank accounts | Allowed | **Copy Xero** (B10, R17). |
| Sub-ledger | AR/AP by transaction | AR/AP by invoice | by invoice | **Copy** and make it the ledger itself (B1, B10). |
| Credits and overpayments | Credit memo, unapplied payment | Credit note, overpayment | Credit note | **Copy** (R3, R5, R9). |
| Multi-currency | Realized on payment; unrealized report | Realized on payment; revaluation report | Realized | **Copy realized only** (B4). Skip unrealized posting until rate history exists. |
| Tax | Sales tax center, filing | Tax rates with components, inclusive/exclusive, returns | Sales taxes | **Copy** rates and inclusive/exclusive. **Skip** components, compounding, filing/returns. Tax summary report only. |
| Numbering | Configurable, can gap | Configurable | Configurable | **Copy** prefix config; make it gapless at issue (B18). |
| Duplicate bill check | Warning | Warning | n/a | **Copy** (partial unique index plus warning). |
| Bank feed | Auto feeds, rules, auto-add, statement reconcile with locking | Auto feeds, rules, reconcile screen (match / create / transfer / discuss) | Feeds, categorise-to-approve | **Copy** Xero's four actions and rules (7.4); Wave's one-tap approve for the owner flow; QuickBooks' suggestions via proposals. **Skip** auto-add (B11), skip statement-by-statement reconcile wizard with locking (report instead), skip live feeds (CSV first; BAI2 later). |
| Uncategorized bucket | "Uncategorized Expense/Income", "Ask My Accountant" | Suspense | Uncategorized | **Copy** (B19) and surface it. |
| Reports | P&L, BS, TB, GL, aging, cash flow, cash basis | same plus more | P&L, BS, cash flow, aging | **Copy** the core nine. **Skip** cash basis (B16), cash flow statement, budget vs actual in v1, with the reasons in section 6. |
| Audit | Audit log | History and notes per record | none | **Copy** (`AuditEvent` plus history tab per record). |
| Accountant access | Accountant user | Adviser role | Accountant invite | **Copy** the `accountant` role (section 8) and an export bundle. |
| Recurring, estimates, POs, inventory, payroll, projects | yes | yes | partly | **Skip** in v1; listed under Later. |

Ideas restated from the reference repos (own words, no relaticle code opened): column-mapping import with preview and review before commit (7.1); capability keys such as `bookkeeping.post` and `bookkeeping.reopen` (section 8); per-module activation checklist (10.4); use-case presets that seed the chart (10.3); per-entity exporters for the accountant (6, 7.3); an audit log screen over `AuditEvent` (phase 2 history tab, later a global screen). From `next-shadcn-dashboard-starter` (MIT, copy allowed with notice, per template-modules 4.1): data-table date filters for transaction lists and the file uploader for receipts, both when their phases arrive; keep `THIRD_PARTY_NOTICES.md` current.

---

## 14. Dependencies on other sessions, and risks

| Dependency | Owner | Needed by |
|---|---|---|
| Module registry, `requireModule`, `can(role, key)`, `apiModule` mounting, `permissions` map in `meta.ts` | S2 | phase 1 |
| `@crm/*` to `@app/*` rename committed; no builds in the tree while it runs | S2 | phase 1 |
| Multi-file Prisma schema decision; `modules.options` in `client.config.ts`; custom roles | S2 | phase 1 and 2 |
| Core `AuditEvent` table agreement | S2 and manager | phase 1 |
| In-process scheduler with advisory lock; `render.yaml` crons list from config | S1 | phase 9 (nightly job) |
| Storage on Render (R2 or disk) | S1 | attachments only; not a blocker for v1 |
| Core outbound email helper and message log | not yet planned | invoice sending (Later) |
| Error reporter / alert system | not present in the repo today | phase 9; until then `Logger.error` plus the audit row |
| Telemetry off by default (D7) | S2 | before any client data exists |

Risks, honestly:
- **Hand-written SQL triggers are new to this repo.** First-time Prisma-with-triggers drift behaviour is spike 0.4. If the spike fails, fallback is service-only enforcement plus the nightly checks, which is a real weakening; say so to the owner before taking it.
- **Strict immutability is stricter than users of other tools expect.** The Void and Reverse flows plus "Create corrected copy" must feel easy or users will fight it. Phase 3 and 4 screens need real use before the owner signs off.
- **Rate history is missing.** Backdated foreign-currency documents depend on a typed rate. Warned in the UI; a history table is the proper fix and is listed under Later.
- **Single-entity assumption (DECISIONS 2026-11-04).** A bookkeeping firm keeping many clients' books would need multi-entity ledgers and is out of scope by design.
- **The agent holds a raw database client.** Guards G1(i) and the grep test reduce accident risk; they are not a boundary against malicious code. Anyone who adds a second writer to `JournalLine` outside `PostingService` has broken B1; the lint/test exists to catch it.
- **Reports are only as correct as the test data.** T5 and T10 must use busy, awkward data (voids, FX, partials, refunds), not a tidy seed.
- **Time zones.** Every "today" must go through `businessToday()`. A stray `new Date()` in a report or overdue check is a bug class to grep for in review.
