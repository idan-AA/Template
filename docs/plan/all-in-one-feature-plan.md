# All-in-one feature plan: what the template must have to replace HighLevel, Keap, Thryv, Jobber, Fresha, TaxDome and peers

Audience: the manager and the builder agents. Statuses: TODO / DOING / DONE / BLOCKED.
Written 2026-11-06 by the research session from 14 research files under `docs/research/all-in-one/`
(read those for sources; every claim there is labeled OBSERVED or INFERRED with a URL). Repo state
verified from code, not from the older plan docs, in `docs/research/all-in-one/00-template-today.md`.

## Context

The template is one codebase deployed once per client business, modules switched on per client.
The owner's words: "copy and paste this and use it for any business." Bookkeeping, property tax and
salon are the first three examples, not the target list. The target is any small business.

The owner asked for deep research into what all-in-one CRM and automation platforms have, so the
template can offer the same. Decisions taken with the owner before research (2026-11-06):

- Reference set: horizontal small-business all-in-ones as the spine (HighLevel, Keap, Thryv,
  Vendasta, Podium, Birdeye, Zoho, HubSpot Starter), plus a vertical sample across business
  families (TaxDome, Canopy, Clio; Fresha, Vagaro, Mangomint, Square Appointments, Boulevard;
  Jobber, Housecall Pro, ServiceTitan, Workiz; Follow Up Boss, Lofty; Square, Toast).
- Automation: research both classic trigger and action builders and AI agents, and map both onto
  the template's agent runtime.
- Surfaces in scope: core CRM, conversations and scheduling, marketing, money. Out of scope:
  courses, communities, affiliates, agency resale and sub-accounts.
- Priority: what every business needs on day one first, then what business families need, then
  differentiators. Never prioritize by the three current example clients.

This document is the consolidated result: the gap between the template today and what every
reference product ships, the feature catalog by area with priority tiers, the build roadmap in
rounds, the decisions made along the way, and the product rules the user research demands.

## What the template has today (from code, 2026-11-06)

YES: companies, contacts, deals (one fixed 7-stage enum), timeline (notes, calls, emails, meetings,
tasks), custom fields (10 types, no multi-select), multi-value facet filters including SELECT and
USER custom fields, private and shared saved views, bulk actions, archive and purge, quick search,
sales dashboard, multi-currency with daily FX, read-only Gmail, Google Calendar and Outlook sync
filed to records, website tracking with UTM attribution and form capture, bookkeeping ledger (chart
of accounts, journals, posting, reversal, lock dates, trial balance, general ledger), agent layer
(enrichment, record chats, natural-language agent builder producing reviewable versions, deployed
team agents with manual, schedule and CRM-event triggers, idempotent action ledger, MCP vendor
connections with fingerprint-pinned grants), owner bootstrap, password sign-in, Google and
Microsoft social sign-in, OIDC and SAML SSO, members and roles, API keys with a REST bridge,
runtime module switches with a developer account, append-only audit table.

NO: any outbound email, SMS or WhatsApp sending (no sender library anywhere); a customer inbox
with reply or assignment; a phone number; booking pages, availability or reminders; a hosted form
or page builder; campaigns, sequences, review requests; invoices, bills, payments, Stripe, bank
import, P and L, balance sheet; kanban, multiple pipelines, custom stages, lost reasons; CSV import
or export; duplicate merge; custom reports; email invitations; a deterministic workflow builder;
an error reporter; a client portal; a location model.

PARTIAL: bookkeeping engine builders for documents, payments and bank moves exist as pure
functions with no tables, API or UI (`packages/modules/bookkeeping/engine/builders/*`); Slack
outbound exists for deployed agents only; WEBHOOK trigger type exists in the enum with no inbound
endpoint; CRM permission keys are declared but CRM services do not yet repeat the module check.

Stale repo docs the manager should know about: `docs/list-building-roadmap.md` says "1 value per
filter, 0 saved views" (both exist in code); `docs/plan/bookkeeping.md` marks phase 2 TODO (it is
built); `packages/modules/crm/meta.ts` says CRM gating is a later phase (the middleware gates it).

## Gap analysis: template today vs what every reference product ships

Table stakes = present in every reference product in that area, or required by regulators.
Gap size: Large = new module or new infrastructure; Medium = new tables and screens on existing
infrastructure; Small = extend existing screens.

| Area | Table stakes in the market | Template today | Gap |
|---|---|---|---|
| Outbound messaging | Send email and SMS from the record, templates with merge fields, consent and opt-out per channel, suppression, delivery status | Nothing sends | Large |
| Inbox | One thread per contact across channels, unread and assigned filters, assignment, internal notes with mentions, templates, mobile push | Email threads viewable per record only | Large |
| Phone | Business number per location, missed call text back, voicemail transcription, call log on the contact, guided A2P registration | None | Large |
| Scheduling | Event types with duration, buffers, notice, window; per-staff availability with overrides; booking page and embed; confirmations and reminders; reschedule and cancel links; two-way Google and Microsoft sync; admin booking | Read-only Google Calendar sync | Large |
| CRM | Multiple pipelines with custom stages and lost reasons, kanban, multiple phones and emails per contact, tags, per-channel DND, dedupe and merge, CSV import and export, multi-select fields, date and number filters | Single enum pipeline, table only, unique email and domain only | Medium |
| Money | Products and prices, quotes to invoice conversion, invoice state machine with reminders, card and ACH payments, card on file, partial payments and deposits, refunds and credit notes, tax rates, receipts, client view, aging and payout reports | Double-entry ledger with manual journals only; engine builders for documents and payments with no tables | Large (but the ledger foundation is unusually strong) |
| Automation | Record created and changed triggers, form submitted, send email and SMS, internal notification, update field, create record and task, webhook out, if and else, wait, per-run log, exit rules, re-enrollment control, AI step | Agent triggers (manual, schedule, 6 CRM events), actions limited to note, task, Slack and MCP, no email or SMS, no logs UI, no recipes | Medium (runtime exists, surface and breadth missing) |
| Marketing | Email campaigns with builder and stats, SMS campaigns with compliance guardrails, dynamic segments, hosted forms with consent and UTM capture, review requests with direct Google link, first and latest attribution | Tracking and attribution exist; nothing else | Large |
| Reputation | Automated review request after job or payment, review inbox with reply, new review alert, rating dashboard | None | Medium |
| Client portal | Magic-link portal where the customer approves, pays, books, uploads, signs, sees history | None | Medium |
| Reporting | Dashboards with widgets over any object, date and attribution filters, custom report, aging and payments reports, per-location rollups | Fixed sales dashboard | Medium |
| Admin and trust | Error reporter, usage ledger, full export, go-live switch, roles per module, locations, public status | Audit table, roles, module switches | Medium |

## Decisions made in this plan (Self-Answer Test applied; override in review)

| # | Decision | Why |
|---|---|---|
| D1 | **Location is a first-class optional core entity.** Every deploy starts with one default location; numbers, calendars, staff, policies and reporting rollups hang off it. | Every competitor prices and configures per location (research 03, 05, 06, 07). Adding it later means re-keying numbers, calendars and reports. One business per deploy stays; a business can have several locations. |
| D2 | **One messaging core in `apps/api`, provider adapters behind one interface, one send helper per channel that also writes the message log** (CLAUDE.md "Every outbound message is logged"). Default adapters: Twilio for SMS, MMS and voice (best 10DLC ISV tooling; Telnyx is the cheaper swap later), Resend for transactional email and a separate marketing stream (the owner already uses Resend), Meta Cloud API for WhatsApp. Unofficial QR-linked WhatsApp gateways (Whapi, Evolution in Baileys mode) are never the default; they may be offered as a clearly labeled client-risk option because WhatsApp bans them (research 09). | Research 09 Part 3. Keeping adapters behind one interface lets a client be moved without touching callers. |
| D3 | **Consent, DND and suppression are core data, enforced at the send helper, never at the reader.** Per contact, per channel, per direction, with source, timestamp and wording. Quiet hours 8 am to 9 pm in the contact's time zone. STOP and START keywords processed at both provider and application. | TCPA, CAN-SPAM, carrier rules (research 09, 12). Enforcing at the writer is the owner's standing rule. |
| D4 | **Go-live switch per channel per deploy.** All outbound customer messaging is suppressed (queued and visible, not sent) until the owner flips "Go live" for that channel. Imports and migrations never fire messages. | Mangomint "playground mode" and Fresha "SMS sent without approval" are top churn stories (research 13). |
| D5 | **Conversations thread per contact across channels**, with a per-reply channel selector. Never per channel. | HighLevel model; Podium had to ship "Linked Conversations" to repair per-channel threads (research 09). |
| D6 | **Pipelines replace the `DealStage` enum.** `Pipeline` and `PipelineStage` tables, several pipelines per deploy, ordered colored stages, Open, Won, Lost, Abandoned status, structured lost reasons, stale detection. The existing enum becomes the default "Sales" pipeline in the migration. Deals are renamed Opportunities only in UI vocabulary, not in code. | Research 01 (HighLevel top roadmap complaints are about opportunities), 02 (Bigin team pipelines), 04 (TaxDome pipelines per service), 06 (Housecall Pro pipeline). Every business family wants its own pipeline shape. |
| D7 | **Money posts to the existing double-entry ledger.** Invoices, payments, refunds, deposits and payouts are documents that POST journal entries through the engine builders that already exist; no money total is ever summed from document tables. Stripe payouts reconcile through a processor clearing account. | `docs/plan/template-modules.md` rules 4 and 5; research 11 Part 7 (clearing account is how every mature integration avoids double counting). The ledger is the template's unfair advantage over every competitor. |
| D8 | **Stripe Connect with direct charges**, the client business as merchant of record with its own payouts, refunds and disputes, optional application fee. Manual and "external processor" payment records stay for businesses that keep Square or PayPal at the counter. | Research 11 processor recommendation; Stripe names "an accounting platform that enables invoice payments" as the direct-charge case. |
| D9 | **Automations have no visual canvas in v1.** One Automations surface with three layers: a catalog of named playbooks with knobs (the 25 recipes in research 08 Part 3), a plain-language rule editor that compiles to a typed, inspectable plan, and a runtime where timing, compliance, money, routing and exit rules are deterministic steps enforced by the scheduler and agent steps (reply, qualify, summarize, draft, decide, extract) run inside declared tools, budgets and handoff rules. A read-only auto-rendered diagram blunts the "no canvas" objection. | Research 08 Part 5. This is the owner's "automation on an agent runtime" decision made concrete. Deterministic skeleton, agent inside the bounds. |
| D10 | **Client portal by magic link, no password**, per contact, scoped to what the business turns on (invoices, appointments, documents, requests, signatures, history). Same portal for every business family. | Jobber, Housecall Pro, Workiz, Karbon all use links; property-tax plan D5 already chose links. One auth population stays internal. |
| D11 | **Scheduling data model follows Cal.com's schema** extended with Square, HighLevel, Acuity and Mangomint concepts (research 10 Part 8). Processing, finishing and buffer time, resources and waitlist are appointments-module extensions on the same tables. | Cleanest open model with a proven round-robin and availability engine. |
| D12 | **Agency, SaaS-resale and sub-account features are excluded.** The owner is the agency; a client is a deploy. White label is the client config that already exists. | Research 13: these features are the main source of "bloat" complaints for single-business users. |
| D13 | **Error reporter is a Round 0 prerequisite**, not a later nicety. | CLAUDE.md "Errors must be visible"; `scheduler.service.ts` has a TODO; every send, sync, payment and automation step in this plan needs it. |
| D14 | **Usage ledger from day one** for metered items (SMS segments, voice minutes, emails, AI tokens, AI minutes), visible in-app with soft warnings and a hard cap per deploy. | "The sticker price is not the bill" is the loudest complaint across 12 of 17 products (research 13). The owner also needs it to bill clients. |
| D15 | **Full export in one click**, kept available after a deploy is paused. | TaxDome, HighLevel, Jobber, Zoho lock-in complaints (research 13). A trust feature in the sales cycle. |

## Product rules from the user research (apply to every round)

Must do: ship inbox, calendar, contacts, invoices and payment links working with no configuration;
vertical starting templates that pre-build pipelines, reminders and forms; phone number and SMS as
the first onboarding step with a guided A2P wizard that enforces the known rejection rules; one
published price with usage visible in real time; cancellation in the dashboard; no auto-renew traps;
full export; import wizard that states which fields will and will not transfer and reconciles
counts; duplicate detection and merge at import and capture; roles per module including a limited
assistant role; a money ledger showing every fee, refund, hold and usage charge the day it happens;
predictable payouts with a human escalation path; reminders, review requests and basic automations
in the base tier; login-free client booking on the business's own domain; a public status page and
opt-in release notes; same-business-day human support path.

Must avoid: agency and resale features; contact-count pricing tiers; per-seat charges for passive
roles; opaque marketplace fees; forced processor migration; mandatory paid onboarding; deleting or
locking data for inactivity; trial-to-paid without an explicit click; "adequate but not best in
class" modules shipped for breadth.

Compliance gates (block the channel until green): email needs a verified sending subdomain with
SPF, DKIM and DMARC, footer address and one-click unsubscribe; SMS needs an approved 10DLC brand
and campaign (or toll-free verification), consent proof, keywords, quiet hours; WhatsApp needs Meta
business verification, recorded opt-in and approved templates outside the 24-hour window; voice
needs a recording disclosure on every recorded call; reviews need no gating and no incentives;
Messenger and Instagram need the platform's own Meta app with Advanced Access.

## Build roadmap

Order is by dependency and by "every business on day one" first. Each round names its data,
API, web and agent scope, the research file that holds the detail, and a "Done when" line. Shared
hotspots from the ledger apply (one agent on schema at a time, registries append-only, env trio
mirrored, DECISIONS.md manager only). Nothing runs locally; Render's build is the compiler and the
practice deploy is the test surface.

### Round 0: platform prerequisites (core) TODO

Everything below depends on this round. No product surface yet beyond settings.

1. **Error reporter** (`error-alert-system` skill): one `reportError` helper, alert table, dedupe,
   silent and critical levels, surfaced in Settings > Alerts. Replace the log-only catches in the
   scheduler, sync and agent dispatch.
2. **Location model**: `Location` (name, address, time zone, phone, hours, brand overrides), one
   default row per deploy created by `MODULE_SETUP`, `locationId` nullable on `Member` (home
   location) and on every new table in later rounds. Settings > Locations.
3. **Messaging core**: `Channel` enum (EMAIL, SMS, MMS, WHATSAPP, VOICE, VOICEMAIL, WEBCHAT,
   MESSENGER, INSTAGRAM, INTERNAL), `OutboundMessage` log row written by the one send helper per
   channel (provider, provider message id, status, segments, cost, raw payload), provider adapter
   interface in `apps/api/src/messaging/providers/*` (Twilio, Resend first), `SendingDomain`
   (subdomain, SPF, DKIM, DMARC status, warmup stage, stream transactional or marketing),
   `PhoneNumber` (location, capabilities, A2P campaign link, forwarding target, recording flag),
   `A2pBrand` and `A2pCampaign` with status and fee fields, `MessageTemplate` with merge fields
   across channels. Webhooks for delivery, bounce, complaint, inbound SMS, inbound call status.
4. **Consent and suppression**: `ConsentRecord` (contact, channel, status, source, wording,
   timestamp, ip), per-channel per-direction DND on `Contact`, suppression list, STOP and START
   processing, quiet hours by contact time zone, enforced inside the send helpers.
5. **Go-live switch** per channel (D4): queued messages visible in a "Not yet live" list.
6. **Usage ledger** (D14): `UsageEvent` (kind, quantity, unit cost, deploy, location, source
   object), Settings > Usage with month-to-date and cap. Agent token usage already exists on
   `AgentRun`; route it here too.
7. **User notifications**: in-app notification table and bell, email to staff via the transactional
   stream (this also unlocks member email invitations and password reset email).
8. **Full export** (D15): one job that produces a zip of CSVs plus files; Settings > Data.
9. **A2P onboarding wizard** in Settings > Phone: brand (EIN, legal name exactly as IRS, address,
   website), campaign (use case, sample messages, opt-in description, unchecked consent checkbox
   language, privacy policy link), status tag, fee display, toll-free verification as the fast path.
10. Env trio additions: `TWILIO_*`, `RESEND_API_KEY`, `MESSAGING_WEBHOOK_SECRET`, optional
    `TELNYX_*`; `.env.example`, `env.validation.ts`, `turbo.json`, `render.yaml.template`.

Detail: research 09 Parts 2, 3 and 5; research 12 Part 9; CLAUDE.md "Every outbound message is
logged".

Done when: on practice, a staff member sends one email and one SMS to a test contact from the
record, both appear in `OutboundMessage` with delivery status, the SMS is refused before go-live
and sent after, STOP sets DND and the next send is refused with a plain reason, a failed webhook
raises an alert, and Settings > Usage shows the two sends with cost.

### Round 1: core CRM completion TODO

1. **Pipelines** (D6): `Pipeline`, `PipelineStage` (order, color, probability, isWon, isLost,
   reportingVisible), `LostReason`; `Deal.pipelineId`, `stageId`, `status`, `lostReasonId`,
   `staleAfterDays`; migration maps the enum to a default pipeline; kanban board view
   (`?view=board`, dnd-kit added to `packages/ui` as `SortableList`) and list view; per-pipeline
   permissions; stage change still writes the timeline entry in the same transaction.
2. **Contact model**: multiple phones and emails with labels and primary flag, tags (first-class
   `Tag` and `ContactTag` tables, not free text), contact type (lead, customer, prospect, vendor,
   partner), time zone, date of birth, preferred language, followers, source and attribution
   already exist.
3. **Fields**: `MULTI_SELECT` type; date-range, number-range and text filters for custom fields
   on all three lists (facets exist for SELECT and USER only); engagement or lead score as a
   rules-driven number (rules table, no decay in v1, history kept).
4. **Dedupe and merge**: dedupe setting (allow duplicates, primary and secondary match field),
   Manage Duplicates scan by email, phone, name and domain, merge up to 10 records keeping notes,
   tasks, deals, tags, field values, with an audit row. Companies too.
5. **Import and export**: CSV import wizard for companies, contacts and deals with column
   mapping, type inference, duplicate preview, dry-run reconciliation counts and a "fields that
   will not transfer" statement (`ai-data-migration-agent` skill for the AI mapping layer later);
   CSV export per list honoring filters.
6. **Tasks**: contact-less internal tasks, assignee, reminders through Round 0 notifications.
7. **Rename vocabulary per deploy**: client config can rename Contacts, Companies, Deals labels
   (Clients, Accounts, Jobs) without code.

Detail: research 01 section 2; research 02 section 5.4; research 13 Part 4.

Done when: a second pipeline with custom stages exists on practice, a deal moves on the board and
the timeline records it, two duplicate contacts merge with values preserved, a 50-row CSV imports
with a dry-run count and one intentional duplicate flagged, and the list exports what the filter
shows.

### Round 2: conversations inbox and phone TODO

1. **Data**: `Conversation` (contact, location, assigned user, followers, status open or closed,
   starred, archived, lastMessageAt, lastInboundAt, unread per user, AI mode off, suggest or
   autopilot, SLA due), `Message` (conversation, channel, direction, body, attachments, status,
   provider ids, from and to, segments, aiGenerated, scheduledFor, draft), `InternalComment`
   with mentions, `Snippet`, `Call` (direction, status, duration, recording url, transcript,
   voicemail, missed), `ConversationView` (saved filters, shareable).
2. **Email**: outbound send through Round 0 with Message-ID, In-Reply-To and References stored;
   inbound threading by References first, then contact and subject; the existing Gmail and
   Outlook sync writes into conversations as well as the timeline; sync exclusions for internal
   domains and specific contacts on day one; staff mailbox two-way sync (Gmail watch renewed
   daily, Graph subscriptions renewed before 7 days).
3. **SMS and MMS**: two-way on the location's number, sticky sender per contact, segment counter
   in the composer, media limits.
4. **Voice**: inbound forwarding, missed-call detection via dial status callback, missed call text
   back with dedupe and DND respect, voicemail with Deepgram transcription, call cards in the
   thread, click to call, recording disclosure on every recorded call.
5. **Web chat widget**: served the way the tracking script is served (`apps/app/app/t/*`),
   creates a conversation with the visitor's page URL; modes live chat, SMS-first (number capture
   plus explicit marketing opt-in checkbox stored on the consent record) or AI-first.
6. **Inbox UI** at `/[slug]/inbox`: tabs Unread, Assigned to me, Unassigned, All; filters by
   channel, tag, owner, direction, date; assignment and followers; internal comments with
   mentions and a Mentions filter; snippets with merge fields and channel-aware rendering;
   scheduled send visible to the team; archive with auto-reopen; bulk read, star, assign, close;
   search across bodies and phone numbers; contact context panel with fields, tags, owner,
   appointments, invoices; delivery and failure states with provider reason; mobile layout with
   push through Round 0 notifications.
7. **AI in the inbox** on the agent runtime: suggestive mode first (draft reply the human sends),
   autopilot behind a per-conversation message cap and a human-takeover rule, every generated
   message metered. Knowledge pack per deploy: crawled website, uploaded documents, FAQs,
   services and hours from the business profile.
8. **Permissions**: who may message customers at all; "assigned conversations only" visibility.
9. Messenger, Instagram and WhatsApp channels come after the platform's own Meta app has Advanced
   Access and business verification (owner to-do list item); the data model carries them from
   day one.

Detail: research 09 Parts 1 and 5; research 03 section 7 items 1 to 3, 7, 8.

Done when: on practice a test contact texts the location number, the thread shows it, a staff
member replies by SMS and then by email from the same thread, an internal comment with a mention
notifies the mentioned member, a missed call produces a text back once and a voicemail transcript,
the web chat widget on a test page creates a conversation, and suggestive AI drafts a reply that
the human edits and sends.

### Round 3: scheduling and booking (core) TODO

1. **Data** (D11, research 10 Part 8): `EventType` (kind one_on_one, round_robin, collective,
   group_class, service; length, duration options, slot interval, buffers, minimum notice, period
   type and window, booking limits, seats, requires confirmation, locations JSON with video
   kinds, booking fields JSON, recurring rule, round-robin weights and reset, lock time zone,
   redirect, payment mode and deposit, cancellation window and fee, color, hidden), `Host`,
   `Schedule` and `AvailabilityRule` (days, start, end, date override), `OutOfOffice`,
   `BlockedTime`, `Booking` (status pending, awaiting_host, accepted, rejected, cancelled,
   no_show, completed; reschedule lineage; cancellation reason; source and UTM; iCalUID), `Attendee`
   (contact link, no-show flag), `Reminder` workflows and `ScheduledReminder`, `WaitlistEntry`,
   `CalendarCredential`, `SelectedCalendar` (sync tokens, watch channels), `DestinationCalendar`.
   Payments at booking land in Round 4 and reuse `Payment` with kind deposit, hold or
   cancellation_fee.
2. **Engine**: availability computation that reads selected external calendars as busy, treats a
   disconnected calendar as unknown and warns, checks co-hosts and resources by default; round
   robin with priority, least-recently-booked tie break, optional weights; collective; seats.
3. **Public booking page** (`/book/[slug]/[eventType]`, ANONYMOUS in `apps/app/proxy.ts`,
   `RESERVED_SLUGS` gets `book`) and embed widget: service and staff selection with "any
   available", intake questions, visitor time zone detection with lock option, confirmation page,
   add to calendar, redirect, UTM capture, request mode.
4. **Lifecycle**: confirmation, reminder and follow-up templates per event type across email and
   SMS through Round 0 with offsets; self-service reschedule and cancel links with cut-off; no-show
   marking; statuses; admin booking on behalf of a client including outside published hours.
5. **Sync**: Google and Microsoft two-way (write bookings to a destination calendar; the current
   read-only sync is extended, not replaced; Microsoft calendar read is added since only mail is
   synced today), Zoom, Google Meet and Teams links per booking.
6. **UI**: `/[slug]/calendar` with day, week and staff-column views, drag and drop (reuse the
   `SortableList` dnd-kit addition), color coding; event type editor; Settings > Scheduling.
7. **Webhooks and automation triggers**: booking created, requested, rescheduled, cancelled,
   no-show updated, completed, paid.

Done when: on practice a staff member defines a 30-minute consultation with buffers and hours, a
signed-out visitor books it from the public page in another time zone, the booking appears on the
staff calendar and in Google Calendar, the contact receives a confirmation and a reminder, the
visitor reschedules through the link, and a second event type with round robin assigns alternately.

### Round 4: money (core, posting to the ledger) TODO

1. **Data** (D7, D8, research 11 Part 9): `Product` and `Price` (one-time or recurring, tax
   behavior, archive not delete), `Customer` billing profile on Contact or Company (tax ids, exempt
   status, default payment method, credit balance), `Quote` and `QuoteLine` (optional lines, tier
   groups for good, better, best; deposit and payment schedule; revision numbering; acceptance
   record), `Document` and `Signature` (templates with merge fields; signature, initials, text,
   date, checkbox fields; sequential or parallel signers; staff counter-signature; completion
   certificate with email, ip, timestamp; ESIGN consent record), `Invoice` and `InvoiceLine`
   (Stripe state machine draft, open, paid, void, uncollectible; numbering with prefix; due terms;
   payment schedule; partial payments; hosted pay page; PDF), `Payment` (channel hosted page,
   payment link, text to pay, reader, tap to pay, card on file, manual; tip; surcharge; mandate;
   payout link), `PaymentMethod`, `Refund`, `CreditNote`, `Dispute`, `Subscription` (Stripe
   statuses, pause, cancel at period end, retries, entitlements for memberships), `Coupon` and
   `PromotionCode`, `TaxRate` (immutable percentage), `Payout` with balance transactions.
   `Counterparty` becomes real (the ledger's string id today) and links to Contact or Company.
2. **Ledger posting**: every finalized invoice, payment, refund, credit note, deposit and payout
   posts through the existing engine builders (`buildDocumentEntry`, `buildPaymentEntry`,
   `buildVoidPayment`, bank builders) into `JournalEntry` in the same transaction as the document
   write; deposits are liabilities until the invoice is issued; processor fees are expenses;
   payouts move a clearing account to the bank account. P and L, balance sheet and AR aging reports
   read journal lines only.
3. **Stripe Connect**: onboarding link per deploy, card and ACH capabilities, hosted elements
   only (no card data on our servers), webhooks for invoice, payment, refund, dispute, subscription
   and payout events with signature verification, payout reconciliation report ingestion.
4. **Flows**: quote to invoice or subscription on acceptance with the quote frozen; text to pay
   and payment links from the inbox; invoice reminders before, on and after due through Round 0;
   auto-charge card on file with retries; receipts; manual payment recording for cash and check;
   client-facing hosted invoice page and PDF.
5. **UI**: `/[slug]/money` with Quotes, Invoices, Payments, Subscriptions, Products, Documents;
   Settings > Payments (processor, numbering, terms, tax rates, tips, reminders); Books gains the
   Sales and Banking sections the nav bar already reserves.
6. **Reporting**: sales, outstanding and aging, payments collected, fees, payouts, taxes
   collected, quote conversion.
7. Later in this round or the next: QuickBooks Online and Xero sync through the clearing account
   pattern (coordinate with the QuickBooks module Agent 2 is building; the sync must treat the
   accounting system as source of truth for numbering when it is the first writer).

Detail: research 11 Parts 1 to 9 and 11; `docs/plan/template-modules.md` section 5.1.

Done when: on practice a quote with an optional line is sent by email, accepted and e-signed from
the hosted page, converts to an invoice that is paid by test card through Stripe, the payment and
fee appear as journal lines and in the trial balance, a partial refund produces a credit note and a
reversing entry, a recurring price creates a subscription whose first invoice auto-charges, and the
aging report ties to the ledger.

### Round 5: automations surface on the agent runtime TODO

1. **Playbook catalog** (D9): the 25 recipes in research 08 Part 3 shipped as named, toggleable
   playbooks with 2 to 5 knobs each (delay, channel, message, exit rules). First ten: missed call
   text back, appointment reminders, review request after completion or payment, speed to lead
   reply, lead nurture, quote follow-up, unpaid invoice follow-up, no-show follow-up, birthday,
   win-back.
2. **Typed plan**: `Automation` (name, status draft or published, version, settings: allow
   re-entry, stop on response, time window, pause dates, suppression, remove from other
   automations on enrollment, daily send cap, AI spend cap), `AutomationStep` kinds deterministic
   (wait, condition, message, record, money, external, control), agent (reply, decide, extract,
   draft, summarize) with declared tools, budget and handoff, human (approve, manual action);
   `AutomationRun` and `AutomationRunStep` with status, input, output, agent transcript, credits,
   replay; `Enrollment` history per record.
3. **Triggers**: extend the existing event bus from six CRM events to every object: contact
   created and changed, tag added or removed, form submitted, inbound message, call status,
   email events, booking events, pipeline stage and status change, quote and invoice and payment
   and subscription events, review received, date-based (birthday, custom date, renewal),
   schedule, inbound webhook (the enum value exists; add the controller with per-automation URL
   and secret), manual and bulk enrollment.
4. **Plain-language editor**: the agent builder that exists today compiles a sentence into the
   typed plan, asks clarifying questions, shows the plan as an outline with lock icons on
   deterministic steps and tool lists on agent steps; natural-language edits shown as a diff;
   read-only auto-rendered diagram.
5. **Runtime**: deterministic steps scheduled by the API scheduler (advisory locks exist), agent
   steps dispatched to `apps/agent` through the existing run machinery and action ledger; "Test
   with a record" simulation that predicts the path and timestamps with no real sends; per-run log
   with replay; "Needs review" status and anomaly alerts through the error reporter.
6. **UI**: `/[slug]/automations` with the catalog, My automations, run log, settings. The
   existing Agents pages stay for free-form team agents; a playbook is the guided front door.

Detail: research 08 Parts 2, 3 and 5.

Done when: on practice the missed call text back and appointment reminder playbooks run end to
end from live events, a custom rule typed in plain language compiles to a plan whose reminder step
is locked inside quiet hours, a simulated test shows the path without sending, the run log shows
each step with status, and a STOP reply removes the contact from every automation.

### Round 6: marketing (core) TODO

1. **Segments**: promote saved views into named dynamic segments usable as audiences, with
   exclusion filters, snapshot vs live choice, engagement and purchase and appointment history
   filters.
2. **Email campaigns**: block builder with brand kit (the client config brand), templates, merge
   fields with fallbacks, schedule and batch send, A/B on subject or content with automatic
   winner, resend to unopened, suppression enforced at send, one-click List-Unsubscribe and
   footer address, preference center with 3 to 5 topics, per-campaign stats, revenue attribution
   window.
3. **SMS campaigns**: segments, drip throttling with time window and weekdays, MMS validation,
   keyword opt-in flows that identify the business, opt-out rate monitoring with alerts, cost
   estimate before send.
4. **Forms**: hosted form builder (field types including consent checkbox, file upload,
   signature, rating; required validation; CAPTCHA; conditional show and hide; multi-step; hidden
   source field and UTM capture; notifications; inline and popup embeds) writing to contacts and
   firing automation triggers; the existing form capture on tracked sites stays for third-party
   forms.
5. **Reputation**: review request engine (SMS first with a one-tap Google link, email fallback,
   QR, per-contact quick send, triggers from invoice paid and booking completed), Google Business
   Profile connection (verified profile, owner or manager), review inbox with reply, new-review
   alert and automation trigger with rating filter, AI drafted replies with approval rules by star
   and source, rating dashboard, review widget embed. No gating, no incentives, ever.
6. **Attribution**: first and latest attribution on every contact from forms, bookings, chat and
   checkout (tracking already captures UTM); source classification (paid search, paid social,
   organic, referral, direct, offline); lead source report by count and value.
7. **Landing pages lite**: one brochure page per deploy with booking widget, form and review
   embeds on a custom domain. Full funnel and website builders are deliberately out of scope.

Detail: research 12 Parts 1 to 9 and 11; research 03 section 7 items 4 to 6.

Done when: on practice a segment of two test contacts receives an A/B email campaign whose stats
show opens and clicks, an SMS campaign is blocked until the 10DLC campaign is approved and then
sends inside the time window, a hosted form submission creates a contact with UTM attribution and
fires a playbook, and a review request reaches a test contact after a paid test invoice.

### Round 7: client portal, reporting and admin trust (core) TODO

1. **Client portal** (D10) at `/portal/[token]` (ANONYMOUS): to-do list home (approve, pay, sign,
   upload, answer, book), invoices and payment history, appointments with reschedule and cancel,
   documents shared to the client, requests and questionnaires, saved payment methods; owner
   controls what is visible; branded by client config; mobile first.
2. **Reporting**: dashboard widgets over any object with date, location and attribution filters;
   custom report builder with an "ask for a report" natural-language entry on the agent runtime;
   scheduled PDF reports; per-location rollups; speed-to-lead report (time to first call, text,
   email per owner and source).
3. **Roles per module**: `can(role, key)` extended across CRM services (the known gap), an
   assistant role (limited reports, no pricing) and a seasonal or contractor role, "see prices
   and costs" as a headline switch, per-pipeline and per-calendar permissions.
4. **Trust surfaces**: public status page link and release notes in-app (the updates folder
   already exists), Settings > Billing for the deploy's own usage and plan (owner-facing, not
   client-facing, since the owner bills clients), cancellation and data export flows.
5. **Onboarding doors** (`customer-onboarding-doors` skill): first-run checklist that gets a new
   deploy to live messaging, a booked appointment and a paid invoice; vertical starting templates
   (pipelines, playbooks, event types, forms) chosen at setup.

Done when: on practice a test contact opens the portal link on a phone, pays an open test invoice,
reschedules an appointment and uploads a requested document; the owner builds a report of bookings
by source for one location and schedules it; a member with the assistant role cannot see prices.

### Business-family modules (after the core rounds; each contributes triggers, fields and screens on top of core)

Each module follows the `bookkeeping` and `property-tax` pattern (`packages/modules/<id>/meta.ts`,
`server.ts`, `apps/api/src/<id>/**`, `apps/app/app/(app)/[slug]/<section>/**`, its own prisma
schema file, one migration per round, `MODULE_SETUP` for setup rows, idempotent seed). Order below
is by how many small businesses each family covers and by how much of core it reuses.

**appointments** (salons, spas, barbers, clinics, fitness, tutors; research 05 and 10)
- Service catalog extensions: processing time (provider free, resource held), finishing time,
  per-staff and per-client duration and price overrides, add-ons and modifiers, book-in-sequence,
  services needing a resource but no staff.
- `Resource` and `ResourceGroup` with capacity; resource columns on the calendar.
- Policy engine: deposit percent or fixed with refundable-until window, card capture, late-cancel
  window and fee, no-show fee, auto-cancel if unpaid, per-service and per-client-group overrides,
  fee-charging window rules, declined-card handling.
- Waitlist with opening detection (cancellation, reschedule, hours change) and notify modes;
  express booking link that holds a slot until expiry.
- Front desk: check-in, virtual waiting room, walk-in checkout, prebook at checkout, group
  checkout, split checkout.
- Checkout and POS on top of Round 4: tips including split and assistant tips, discounts with
  reasons, multiple tenders, split payments, register closeout, Tap to Pay and a certified reader,
  gift cards and packages as prepaid liabilities, memberships as subscriptions with entitlements.
- Client record extensions: formulas and treatment notes shown at booking and checkout, allergies
  and patch tests, photo gallery with markup, intake and consent forms with signatures, HIPAA mode.
- Staff: shifts including alternating weeks, time off types, commission rules (service vs
  product, swap, backbar deduction), booth rent, time clock, payroll export.
- Reports: future bookings, utilization, no-shows and cancellations, rebooking and retention per
  staff, liabilities. Discovery: Reserve with Google, Instagram and Facebook booking.

**field-service** (trades, cleaning, landscaping; research 06)
- `Property` under Client (many addresses, access notes, photos) and `Equipment` (serial,
  warranty, service history).
- Request before quote with photos and an optional assessment visit; overdue-request list.
- Quote engine extensions already in core (optional lines, tiers, deposits, schedules, photos);
  change orders on an open job; consumer financing slot (Wisetack, US only).
- `Job` and `Visit`: job is the contract, visits are trips; recurring schedules; per-job invoicing
  rule (per visit, monthly, at close, custom, progress); batch invoicing grouped per client; autopay
  with retries.
- Dispatch board: day, week, month, map and list; assign to person, crew or subcontractor;
  skill and service-area aware suggestions; drive-time aware slots; route optimization with locked
  stops; live location; arrival windows and on-my-way texts with tech photo.
- Field execution on mobile: checklists and forms per job type, before and after photos with
  annotation, time tracking by category with geofence start and stop, signature and payment at
  the door, offline read.
- Job costing: labor from timers, materials from price book, expenses with receipts, profit per
  job. Service plans as subscriptions with included visits. Role presets: field crew, senior
  crew, crew lead, manager, with "see prices" as the switch. Trade onboarding presets.

**professional-services** (accountants, tax, bookkeepers, law, consultants; research 04)
- Client graph: person linked to many billable accounts (joint, dependents, entities) with one
  portal login that switches accounts; groups for group billing.
- `Engagement` per client per service with stage pipeline (reuse Pipelines), custom statuses,
  recurring schedule including custom cadences, assignee, due date, time budget; templates per
  service line (1040, bookkeeping, payroll, litigation matter) pre-wired with stages, requests,
  folder templates and automations.
- Document zones: firm-private, shared, client-uploaded; folder templates applied by automation;
  approve or disapprove on drafts; payment-locked deliverables; retention rules; version history;
  AI rename and route on upload (the agent runtime).
- Request and questionnaire engine with templates, conditional questions, per-item upload,
  auto-matching uploads to checklist items, reminders that stop when done.
- E-signature extensions: pluggable identity verification (KBA for IRS forms, QES for EU) priced
  as credits.
- Proposal plus engagement letter that creates the engagement, the recurring invoice with stored
  authorization and the first job on acceptance; package tiers; bulk send for seasonal onboarding.
- Time and budget tracking with WIP, write up or down before invoicing, realization and
  utilization reports; AI suggested time entries.
- Legal variant adds trust ledgers kept apart from operating funds (the double-entry ledger makes
  this a chart-of-accounts rule, not a fork), evergreen retainer thresholds, LEDES export.
- The `property-tax` module in progress is the first member of this family; align its matters,
  checklists, deadlines, documents and upload links with these shared objects rather than
  duplicating them.

**real-estate** (agents and teams; research 07)
- Lead routing engine with five modes: direct, round robin, first to claim, one-at-a-time with
  timeout, shared pond with claim button and claim log; ordered rules on source, price band,
  location and type; catch-all rule.
- Speed-to-lead metrics on a leaderboard with threshold alerts; AI first responder inside seconds
  on chat, text and email respecting DNC, landline, disclosure and quiet hours.
- Portal connectors (Zillow, Realtor.com) and email parsing for sources without an API; website
  pixel already exists.
- Buyers and Sellers pipelines with close date, commission and split fields, custom date fields
  that spawn automations; action plans with delays in minutes as well as days, auto-pause on
  reply. IDX and transaction management are integrations, not builds.

**retail-and-food** (lowest priority; research 07)
- Customer identity built from transactions, loyalty with points and tiers, catalog and inventory
  with vendors and purchase orders, online ordering, KDS and table management. Only the loyalty
  and catalog pieces overlap with core; the rest is a later decision.

### Deliberately out of scope

Courses, memberships as content, communities, affiliate manager, agency SaaS mode and sub-accounts,
full funnel and website builders, listings sync to directories (an integration later), social
posting (expected but later than everything above), voice AI agent (after Round 2 proves the
phone stack; Retell or Vapi as the provider), custom objects (revisit after the business-family
modules show whether `FieldEntity` extension is enough).

## Verification standard for every round

Nothing runs locally. Every round is verified live on the practice deploy as a user would, desktop
and `emulate` phone viewport, through the shared agent Chrome (`scripts/agent-browser-login.mjs`,
`browser-verification` skill), against the "Done when" line above, including the opposite failure
(a send refused before go-live, a DND contact skipped, a disconnected calendar reported as unknown,
a non-developer owner refused a developer action). Money rounds also prove the ledger ties
(trial balance balanced, aging equals open invoice balances). Each round ends with an updates-folder
note and help-article corrections per CLAUDE.md.

## Owner to-do items this plan creates (one sentence each, with the reason)

- Create the platform's own Meta app and start business verification and App Review for Messenger
  and Instagram messaging, because only the owner can own the Meta Business account.
- Create the Twilio (or Telnyx) account and the Stripe platform account and put their keys in Render
  for practice, because the research recommends these providers and only the owner can sign the
  agreements.
- Decide whether the owner's deploys will be sold with a published price sheet that itemizes SMS,
  voice, email and AI usage, because the usage ledger in Round 0 is built to show exactly those
  numbers to the client.

## Build log

- 2026-11-06: research completed (14 files), plan written. Awaiting manager review and round
  assignment.
