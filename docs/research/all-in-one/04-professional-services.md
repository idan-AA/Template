# 04. Professional services all-in-one platforms: feature inventory

Products covered: TaxDome, Canopy, Clio (Manage and Grow), with a lighter pass on Karbon and HoneyBook.
Research date: 2026-11-06. About 76 searches and page fetches. Every row cites a source and is labeled OBSERVED (read on an official page, an official help article, or a quoted help-article snippet) or INFERRED (third-party summary, review aggregator, or deduced from a partial page).

Method caveats, stated up front:

- taxdome.com, help.taxdome.com, the TaxDome help mirror (td-help.helpscoutdocs.com), clio.com, help.clio.com and capterra.com all refused direct fetches (HTTP 403 or a network filter). TaxDome and Clio rows therefore rest on help-article text returned in search snippets, on official blog posts, and on third-party pages. Rows built only from third-party pages are marked INFERRED.
- getcanopy.com, support.getcanopy.com, karbonhq.com, honeybook.com and help.honeybook.com fetched normally.
- Reddit mirrors failed DNS. Reddit pain points below come from search-result snippets of r/taxpros threads, plus Capterra, Trustpilot, TrustRadius and rfp.wiki summaries.
- The shared web-search budget ran out before the last pain-point searches (Karbon, HoneyBook, r/Lawyertalk). Those gaps are listed in the final section.
- Pricing for TaxDome and Clio is in flux in late 2026 and sources conflict. Both sets of numbers are reported with dates; neither is treated as confirmed.

---

## 1. TaxDome

Positioning: all-in-one practice management for tax, bookkeeping and accounting firms. Unlimited clients, unlimited storage and unlimited e-signatures are bundled; the firm pays per seat (or, per one late-2026 source, per active client). Strongest areas: pipeline automation, client portal and mobile app, document exchange.

### 1.1 Client and contact records, intake, proposals

| Feature | What the user can do | Notable details and limits | Tier | Source | Status |
|---|---|---|---|---|---|
| Accounts vs contacts | Create an Account (the entity you bill: a company or an individual) and link one or more Contacts (the people). Portal access is granted per linked contact. | An account cannot exist without at least one linked contact. Joint accounts (spouses) and business accounts (director, ops manager, secretary) are the documented patterns. | All | https://help.taxdome.com/article/514-contacts-accounts-explained ; https://help.taxdome.com/article/223-how-to-link-contacts-to-accounts | OBSERVED |
| Linked accounts | See, on an account's Info tab, every other account that shares a contact (spouses filing separately, dependent with own return). | One person, many accounts, one login (see portal section). | All | https://help.taxdome.com/article/1825-crm-overview | OBSERVED |
| Custom CRM fields | Define custom fields at the account level and separately at the contact level. | Example given: store organization addresses at account level. | All | https://help.taxdome.com/article/1825-crm-overview | OBSERVED |
| Tags | Tag accounts, contacts and other entities; filter lists by tag; tags also gate pipeline stages and automations. | Bulk import can add tags and account roles to existing accounts. | All | https://help.taxdome.com/article/122-import ; https://help.taxdome.com/article/108-using-automations | OBSERVED |
| CSV import | Import accounts and contacts in bulk, including accounts-only imports to update CRM data. | | All | https://help.taxdome.com/article/122-import | OBSERVED |
| Lead pipeline | Use a Pipeline (see work section) for prospects; no separate "deals" object is documented. | Zapier connectors exist for pushing contacts in from LeadConnector (GoHighLevel). | All | https://zapier.com/apps/leadconnector/integrations/taxdome | INFERRED |
| Intake forms | Collect intake via Organizers (questionnaires) and Client Requests; a third-party review lists "Intake Forms" on the Essentials tier. | | All (per review) | https://unclekam.com/tax-pro-tools/client-portal-software/taxdome-portal-review/ | INFERRED |
| Proposals and engagement letters | Build proposals and ELs from templates, send manually or from a pipeline automation, manage signers and signature authority; signed proposal shows signature with timestamp; a proposal can create invoices (one-off or recurring) on acceptance. | Signature field is fixed at the bottom of the proposal and cannot be moved. Included in every subscription. | All | https://help.taxdome.com/article/291-e-signatures-explained ; https://td-help.helpscoutdocs.com/category/1324-proposals ; https://taxdome.com/blog/introducing-proposals-and-engagement-letters-els-a-smarter-way-to-approach-clients-and-get-paid | OBSERVED |
| Recurring services | Model recurring services as recurring invoices (auto-created on a schedule, optionally with stored payment authorization) plus recurring jobs in a pipeline. | | All | https://help.taxdome.com/article/762-invoices-advanced-recurring-payments ; https://taxdome.com/blog/advanced-workflow-automation-introducing-custom-schedules-for-recurring-jobs | OBSERVED |

### 1.2 Client portal

| Feature | What the user can do | Notable details and limits | Tier | Source | Status |
|---|---|---|---|---|---|
| Portal scope | Client can upload documents, fill organizers and questionnaires, sign documents, chat with the firm, complete client tasks and requests, view and pay invoices, see payment history. | "Waiting for action" section groups pending signatures, tasks and invoices. | All | https://taxdome.com/en-nz/client-portal ; https://apps.apple.com/app/id1472202357 | OBSERVED |
| Mobile app (clients) | Free iOS and Android app with a built-in scanner that produces PDFs, e-signing, chat, invoice payment, push notifications. | Scanner output is a PDF rather than a phone photo. | All | https://apps.apple.com/app/id1472202357 ; https://taxdome.com/en-int/client-portal | OBSERVED |
| Mobile app (firm) | Separate "TaxDome" firm app for staff (iOS and Android). | Capabilities not confirmed in detail. | All | https://apps.apple.com/jo/app/taxdome/id1571125699 | OBSERVED (existence only) |
| Login model | One contact login can reach every linked account; 2FA availability not confirmed in fetched material. | | All | https://help.taxdome.com/article/514-contacts-accounts-explained | INFERRED |
| White label | Custom firm URL and branded emails on Pro; custom-branded mobile app on Business for firms with 25+ seats. | From a third-party review; tier mapping not confirmed on taxdome.com. | Pro / Business | https://unclekam.com/tax-pro-tools/client-portal-software/taxdome-portal-review/ | INFERRED |
| Payment methods in portal | Cards, ACH, SEPA, BACS; one-time and recurring payments. | Region-dependent. | All | https://taxdome.com/en-nz/client-portal | OBSERVED |
| Scheduling in portal | Clients book meetings from the portal through Calendly, Acuity, Schedulista or YouCanBookMe. | Owner or admin sets up the integration; per-team-member booking uses separate event types. No native scheduler. | All | https://taxdome.com/ja-jp/schedulers | OBSERVED |

### 1.3 Documents and e-signature

| Feature | What the user can do | Notable details and limits | Tier | Source | Status |
|---|---|---|---|---|---|
| Three top-level folder locations | Every account has Private (firm only), firm docs shared with client, and client-uploaded docs. | Folder templates define subfolders in each. | All | https://help.taxdome.com/article/folder-templates-explained | OBSERVED |
| Folder templates | Define reusable folder structures and apply manually or automatically when a job enters a pipeline stage. | Applying a template later does not change privacy levels of existing folders. | All | https://help.taxdome.com/article/99-folder-templates ; https://help.taxdome.com/article/folder-templates-explained | OBSERVED |
| Client requests | Send templated requests for documents or info; reuse templates such as "Update Info" or "Year-End Checklist". | | All | https://de.help.taxdome.com/article/1703-client-requests-basic-create-apply-templates | OBSERVED |
| Document approvals | Request approve or disapprove on a document; client gets dashboard notification and email; result recorded in document audit trail; resend all pending approvals in bulk from Docs > Approvals. | Document must be in a "Client can view" folder. Windows desktop app can also request approval. | All | https://help.taxdome.com/article/18-get-feedback-from-clients-approvals-disapprovals ; https://help.taxdome.com/article/1457-windows-app-request-client-approval | OBSERVED |
| E-signature | Three modes: sign proposals and ELs, sign uploaded documents, and KBA-verified signatures for IRS forms (8879). EU firms get QES for eIDAS. | Unlimited e-signatures included. KBA is a paid add-on marketed "as low as $1 per signature" (vendor claim). | All | https://help.taxdome.com/article/291-e-signatures-explained ; https://taxdome.com/en-int/client-portal | OBSERVED |
| Upload channels | Firm uploads from web, Windows desktop app, or mobile app; clients from portal or mobile scanner. | | All | https://da.help.taxdome.com/article/140-how-to-get-documents-from-clients | OBSERVED |
| Payment locking | Lock a deliverable so the client cannot download it until the invoice is paid. | | All | https://unclekam.com/tax-pro-tools/client-portal-software/taxdome-portal-review/ | INFERRED |
| Retention and PDF tools | Not confirmed. | | | | not confirmed |

### 1.4 Work management

| Feature | What the user can do | Notable details and limits | Tier | Source | Status |
|---|---|---|---|---|---|
| Pipelines, stages, jobs | Create a Pipeline per service (1040, bookkeeping, payroll), with Stages; each client engagement is a Job card that moves through stages. Tasks hang off jobs. | Tasks, Pipelines and Jobs are the three core objects. | All | https://help.taxdome.com/article/60-using-pipelines ; https://da.help.taxdome.com/article/105-tasks-pipelines-jobs-explained | OBSERVED |
| Stage automations | Attach automations to a stage; they run in order when a job enters the stage. Documented action types: send email, send chat message, send organizer, send proposal or EL, send client request, create task, create or send invoice, update job dates, change account access, change job assignee, apply folder template. | Automove toggle advances the job when linked actions complete. Not every action supports Automove. | All | https://help.taxdome.com/article/108-using-automations ; https://help.taxdome.com/article/add-and-manage-stage-automations ; https://help.taxdome.com/article/folder-templates-explained | OBSERVED |
| Conditional automations | Restrict stages and automations to clients carrying specific tags. | | All | https://help.taxdome.com/article/108-using-automations | OBSERVED |
| Custom job statuses | Define statuses such as "Missing information"; a status automation can return the job to Active and fire actions. | | All | https://help.taxdome.com/article/1828-automate-your-processes | OBSERVED |
| Recurring jobs | Schedule jobs to recur on any cadence, including custom schedules matching filing frequency. Scheduled jobs start at 12 am in the account time zone. | | All | https://taxdome.com/blog/advanced-workflow-automation-introducing-custom-schedules-for-recurring-jobs ; https://es.help.taxdome.com/article/290-adding-recurring-jobs | OBSERVED |
| Job and task templates | Reuse project templates for recurring work; task templates. | | All | https://taxdome.com/project-management | OBSERVED |
| Time tracking | Start a timer or add time retroactively; link time entries to jobs; set a time budget per job and compare budget vs actual; bill time into invoices. | | All | https://help.taxdome.com/article/1529-track-time-overview ; https://help.taxdome.com/article/1069-time-entry-basic-add-in-real-time-or-retroactively | OBSERVED |
| Calendar | Day, Week, Month views of tasks and jobs by start and due date, filter by assignee for workload. | Drag to change deadline was still "in progress" in the 2022 post. | All | https://taxdome.com/blog/calendar-manage-your-day-workload-and-due-dates-in-a-handy-timeline-format | OBSERVED |
| Capacity planning | Not confirmed beyond assignee filters. | | | | not confirmed |

### 1.5 Communication

| Feature | What the user can do | Notable details and limits | Tier | Source | Status |
|---|---|---|---|---|---|
| Secure chats | Unlimited portal chats, with client tasks embedded in a chat thread; chat templates. | Help center recommends chats over email for personalized bulk messages. | All | https://help.taxdome.com/article/client-communication-overview | OBSERVED |
| Email sync | Sync a mailbox so email is sent and received inside TaxDome and attached to the account. | Synced email is not shown in the client portal; clients read it in their own inbox. You cannot delete one synced email from a client record because sync mirrors the mailbox. | All | https://help.taxdome.com/article/1515-email-basic-overview ; https://help.taxdome.com/article/37-sending-and-receiving-emails-in-taxdome | OBSERVED |
| Bulk email and shortcodes | Email one or many clients; templates with shortcodes; shortcode mode chooses account vs contact fields; schedule emails. | | All | https://help.taxdome.com/article/client-communication-overview ; https://it.help.taxdome.com/article/478-schedule-emails | OBSERVED |
| SMS | Two-way SMS via a connected Twilio number; bulk SMS sends one thread per client; SMS templates. | US and Canada only. Contact must exist in CRM. $30.15 initial Twilio fee deducted from firm balance plus recurring SMS fees. | All | https://taxdome.com/blog/introducing-sms-text-messages-communication-in-taxdome ; https://da.help.taxdome.com/article/1281-sms-basic-create-send-and-view | OBSERVED |
| Templates | Firm templates for Chat, Email and SMS under Templates > Firm templates. | | All | https://help.taxdome.com/article/client-communication-overview | OBSERVED |

### 1.6 Money

| Feature | What the user can do | Notable details and limits | Tier | Source | Status |
|---|---|---|---|---|---|
| Invoices | One-off and recurring invoices, created manually, from a proposal, or by pipeline automation. | | All | https://help.taxdome.com/article/762-invoices-advanced-recurring-payments | OBSERVED |
| Recurring invoices with payment authorization | Store the client's payment authorization so recurring invoices auto-charge. | Historically Stripe only; recurring invoices add an e-signature request and terms agreement automatically. | All | https://help.taxdome.com/article/762-invoices-advanced-recurring-payments ; https://help.taxdome.com/article/291-e-signatures-explained | OBSERVED |
| TaxDome Payments | Integrated processor powered by Stripe; choose cards, ACH, or both. CPACharge and legacy Stripe connections are being sunset. | TaxDome itself charges nothing on top; processor fees apply. An older comparison lists Stripe at 2.9% + $0.30 cards and 0.8% capped at $5 ACH. | All | https://help.taxdome.com/article/1781-taxdome-payments ; https://help.taxdome.com/category/cpacharge ; https://help.taxdome.com/article/21-payment-processing-fees | OBSERVED |
| Surcharge | Firms can pass a 3% "payment technology fee" on card payments per one help page; a webinar promised a native credit-card-fee option "in a future update". | Current native surcharge status not confirmed. | All | https://help.taxdome.com/article/21-payment-processing-fees ; https://taxdome.com/blog/webinar-and-qa-proposals-and-engagement-letters | OBSERVED (conflicting) |
| Payment plans | No source found. | | | | not confirmed |
| QuickBooks Online sync | One-way sync of invoices and payments to QBO (per third-party review). | | All | https://unclekam.com/tax-pro-tools/client-portal-software/taxdome-portal-review/ | INFERRED |
| Trust accounting | Not offered (accounting product, not legal). | | | | INFERRED |

### 1.7 Reporting and AI

| Feature | What the user can do | Notable details and limits | Tier | Source | Status |
|---|---|---|---|---|---|
| Reports | Pre-built and custom reports on invoices, time entries, jobs, tasks and pipelines; export PDF, CSV, XLS; schedule reports by email. | | All | https://taxdome.com/en-au/time-billing | OBSERVED |
| AI reporting | "Ask the AI to create tailored reports on invoices, time entries, tasks, and more" and ready-made dashboards. | | not confirmed | https://taxdome.com/en-ca/overview | OBSERVED (marketing) |
| TaxDome AI for documents | Uploaded files are recognized (1099, engagement letter), renamed, tagged and routed to the right client and folder. | Vendor says 11.2M documents organized Feb 2025 to Jan 2026 and a 90% approval rating. | All (per vendor) | https://help.taxdome.com/article/1788-taxdome-ai ; https://taxdome.com/blog/taxdome-ai ; https://www.accountingtoday.com/news/taxdome-launches-taxdome-ai-for-document-management-and-organization | OBSERVED |
| AI checklist builder | Build a document checklist from the client's prior-year return. | | | https://taxdome.com/quarterly-update-spring-2026 | OBSERVED |
| Atlas agent | An in-app AI agent, first of three AI "channels", in beta summer 2026 and promised to all firms end of Q3 2026. | Capabilities not published in fetched material. One third-party pricing page lists an AI add-on at $200 per month per firm. | unconfirmed | https://taxdome.com/blog/webinar-recap-and-qa-summer-update-2026 ; https://www.aimadefor.com/blog/taxdome-pricing-2026/ | INFERRED |

### 1.8 Pricing (conflicting, see note)

| Item | Detail | Source | Status |
|---|---|---|---|
| Per-seat model (most sources) | Essentials $800, Pro $1,000, Business $1,200 per user per year, billed annually; 2 and 3-year terms discount to roughly $700 to $1,150. Essentials is solo only. Pro adds GL connections (120 included). Business adds client care team and bi-annual reviews for 5+ seats. | https://www.capterra.com/p/186749/TaxDome/pricing/ ; https://taxdome.com/en-ca/sharefile-vs-taxdome ("starting at $700 per user annually with a 3-year plan") | INFERRED (capterra blocked; snippet only) |
| Price history | Pro rose from $600 to $800 per user per year in Feb 2023 (first price change). | https://taxdome.com/blog/everything-you-need-to-know-about-taxdomes-first-ever-price-change | OBSERVED |
| Client-count model (one Nov 2026 source) | Standard plan $1,500 per year minimum for up to 150 active clients with 20 seats included; custom above 20 seats or 3,000 clients; AI add-on $200 per month per firm; free Lite plan no longer advertised. | https://www.aimadefor.com/blog/taxdome-pricing-2026/ | INFERRED, conflicts with the above; not confirmed |
| Add-ons | KBA per signature, SMS via Twilio (usage), white-labeled client app, premium support. | https://taxdome.com/en-int/client-portal ; https://www.aimadefor.com/blog/taxdome-pricing-2026/ | INFERRED |

---

## 2. Canopy

Positioning: modular practice management for accounting firms (US-centric), with a notable Tax Resolution module (IRS transcripts, notices). Late 2026 pricing moved from per-module to three per-user tiers plus "Service Power-Ups".

### 2.1 Client records, intake, engagements

| Feature | What the user can do | Notable details and limits | Tier | Source | Status |
|---|---|---|---|---|---|
| Clients, contacts, groups | Store unlimited contacts; relate a contact to one or many clients; group clients (households, related entities) for relationships and group billing; individuals and companies. | Client record templates and "various client types". | Standard+ | https://www.getcanopy.com/client-management ; https://support.getcanopy.com/ (Client and Contact Structure, 68 articles) | OBSERVED |
| Custom fields, tags, saved filters | Filter and sort every list by any field including custom fields; tag in bulk; save segments; scheduled reports and alerts on list data. | | Standard+ | https://www.getcanopy.com/client-management | OBSERVED |
| Bulk actions | From a filtered list: send client request, send email, add tag, assign owner; with Workflow: create tasks, apply folder template. | | Standard+ | https://www.getcanopy.com/client-management | OBSERVED |
| Client intake | Questionnaires (organizers, intake forms, feedback forms) completed in the portal with file upload in the same flow; "more client intake capacity" on Plus. | | Standard (capacity grows on Plus) | https://www.getcanopy.com/client-portal ; https://www.getcanopy.com/pricing | OBSERVED |
| Engagements and proposals | Branded proposal and engagement letter templates with services, tasks, pricing and terms; tiered packages (Basic/Standard/Premium); embedded video and PDF attachments; built-in eSign; accepting a package triggers tasks and billing; collect a deposit up front and require saved payment details; bulk send for seasonal onboarding. | Auto Renewals marked "coming soon". Prospects can sign through a secure link without a portal login. Coworker can draft templates and renewals from prompts. | Standard+ | https://getcanopy.com/engagements ; https://www.getcanopy.com/pricing | OBSERVED |

### 2.2 Client portal

| Feature | What the user can do | Notable details and limits | Tier | Source | Status |
|---|---|---|---|---|---|
| To-do list | Client sees one to-do list of requests, questionnaires, signatures and payment requests and clicks each to complete. | | Standard+ | https://www.getcanopy.com/client-portal | OBSERVED |
| Uploads | Capture with phone camera (converted to PDF), batch upload from device, Dropbox or Google Drive; attach files to a specific request. | Uploads land in a Files Inbox for firm triage. | Standard+ | https://www.getcanopy.com/client-portal ; https://support.getcanopy.com/en/collections/9480160-document-management | OBSERVED |
| Payments | View balance, invoices and payment history; pay in full or partially; save card or ACH. | | Standard+ | https://www.getcanopy.com/client-portal | OBSERVED |
| Messaging | Secure two-way Client Messaging threads (Beta, enabled under Experimental Features), plus comments on client requests; clients can also book meetings in the portal. | All contacts invited to the portal see every thread; cannot message one contact only. Firm email digests capped at one per hour per thread. | Standard+ | https://support.getcanopy.com/en/articles/14712967-how-do-i-use-client-messaging | OBSERVED |
| Login model | Invited clients set a password; Touch/Face ID on mobile; MFA via email, SMS or authenticator app; secure links let a client finish one task with no login or app. | | Standard+ | https://www.getcanopy.com/client-portal | OBSERVED |
| Branding | Custom branding across portal, login page and emails; custom domain listed on pricing page. | | Standard+ | https://www.getcanopy.com/client-portal ; https://www.getcanopy.com/pricing | OBSERVED |
| Mobile apps | Client app (iOS, Android) and a separate Practitioner app for staff. | | Standard+ | https://www.getcanopy.com/pricing ; https://support.getcanopy.com/ | OBSERVED |

### 2.3 Documents and e-signature

| Feature | What the user can do | Notable details and limits | Tier | Source | Status |
|---|---|---|---|---|---|
| Folder templates and permissions | Create, apply, duplicate and undo folder templates; per-folder team permissions; client-specific document permissions; internal-only flags. | | Standard+ | https://support.getcanopy.com/en/collections/9480160-document-management ; https://getcanopy.com/document-management | OBSERVED |
| Retention rules | Set folder-level retention rules that auto-archive files; restrict who may set them. | | Standard+ | https://support.getcanopy.com/en/collections/9480160-document-management ("Set Retention Rules") | OBSERVED |
| PDF tools | Annotate, manage pages, merge into new PDF, rotate, reorder, preview, file history, version control, bookmarks preserved. | | Standard+ | https://support.getcanopy.com/en/collections/9480160-document-management | OBSERVED |
| Desktop Assistant and Virtual Drive | Mapped Windows drive syncing with Canopy; print to Canopy; scan to Canopy; edit a file in place. | Windows only per article titles. | Standard+ | https://support.getcanopy.com/en/collections/9480160-document-management | OBSERVED |
| Secure links | Send a file or request a file via secure link without portal login. | | Standard+ | https://support.getcanopy.com/en/collections/9480160-document-management | OBSERVED |
| eSign | Unlimited e-signatures; templates with pre-placed fields; AI auto-places signature and date fields and assigns signers; optional fields and checkboxes; multiple signers at once. | Managing templates requires the Document Management license (legacy) / Standard tier. | Standard+ | https://www.getcanopy.com/electronic-signature-software ; https://support.getcanopy.com/en/collections/9480160-document-management | OBSERVED |
| KBA for IRS 8878 and 8879 | Client confirms name, address, DOB, SSN, then answers random questions and must get 3 of 4 right; failed first attempt gets a free retry; second failure prompts download, wet-sign and upload. Certified audit trail logs logins, IPs, timestamps. | $1.25 per KBA credit, volume tiers; charged per signature. | Add-on | https://www.getcanopy.com/blog/feature-update-knowledge-based-authentication/ ; https://www.getcanopy.com/pricing | OBSERVED |
| AI document tooling | AI renaming and classification of client files; AI-powered document checklists built from profile or last year's return; uploads auto-match to checklist items; pre-fill forms from scans; "AI Prompt Library for Smarter Document Request Lists". | | Standard+ (Tax Workflow Automation credits for intake, $34 per client credit; 5 included) | https://support.getcanopy.com/en/collections/9480160-document-management ; https://getcanopy.com/document-management ; https://www.getcanopy.com/pricing | OBSERVED |

### 2.4 Work management

| Feature | What the user can do | Notable details and limits | Tier | Source | Status |
|---|---|---|---|---|---|
| Tasks and subtasks | Create tasks, subtasks and checklists; filter; comment and tag colleagues; assign to users or roles with work queues. | 37 prebuilt task templates. | Standard+ | https://www.getcanopy.com/workflow | OBSERVED |
| Task automations | Set automated conditions and actions on tasks and subtasks: auto-create tasks when an engagement is signed, change statuses by logic, send client reminders, update status when a request is completed, transfer ownership. | Terminology is "conditions and actions", not a published trigger catalog. "Advanced workflows and automation" sits on Premium (coming soon). | Standard (basic), Premium (advanced) | https://www.getcanopy.com/workflow ; https://www.getcanopy.com/pricing | OBSERVED |
| Recurring tasks | "Recurring task scheduler"; recurring logic for predictable projects; recurring document requests. | | Standard+ | https://www.getcanopy.com/pricing ; https://www.getcanopy.com/workflow | OBSERVED |
| Views | Kanban board view; advanced task views and filters on Plus. | | Standard / Plus | https://www.getcanopy.com/pricing | OBSERVED |
| Budgets and capacity | Time budgets and dollar budgets per project; live Capacity Planning dashboard and forecasting. | Capacity planning on Plus. | Plus+ | https://www.getcanopy.com/pricing ; https://www.getcanopy.com/workflow | OBSERVED |
| Roles and teams | Custom roles, teams, role-based assignment; user roles and access controls on Plus. | | Plus+ | https://www.getcanopy.com/pricing | OBSERVED |
| Smart Tax Prep | AI tax preparation workflow ("New"). | Not described in detail. | Standard+ | https://www.getcanopy.com/pricing | OBSERVED (name only) |
| Calendar | Help center lists Calendar in "Client Engagement" descriptions; clients can book meetings in portal. | Native booking engine details not confirmed. | | https://www.getcanopy.com/client-portal | INFERRED |

### 2.5 Communication

| Feature | What the user can do | Notable details and limits | Tier | Source | Status |
|---|---|---|---|---|---|
| Global / Unified Inbox | Sync email, attach emails to client records, share inboxes firm-wide, comment on emails, @mention colleagues; portal messages and email in one inbox. | Providers not named on the page. | Standard+ | https://www.getcanopy.com/client-management ; https://www.getcanopy.com/client-communication/ | OBSERVED |
| Templates | Email and client request templates. | | Standard+ | https://www.getcanopy.com/client-management | OBSERVED |
| SMS | Not mentioned on communication page. | | | https://www.getcanopy.com/client-communication/ | not confirmed |
| AI Email Generator | Draft emails from prompts, change tone, fix grammar. | | Standard+ | https://www.getcanopy.com/client-management | OBSERVED |
| Canopy Notetaker | Joins Zoom, Teams or Google Meet, transcribes, extracts deadlines and deliverables, syncs summary and action items to the client record. | 8 / 12 / 16 hours per user per month on Standard / Plus / Premium. | All tiers (hour caps) | https://www.getcanopy.com/client-communication/ ; https://www.getcanopy.com/pricing | OBSERVED |

### 2.6 Money

| Feature | What the user can do | Notable details and limits | Tier | Source | Status |
|---|---|---|---|---|---|
| Invoice types | One-time, Recurring and Scheduled invoices; customizable layout (logo, roll up line items, group by service, show or hide columns); invoices visible in portal. | Retainer Billing in Beta; group billing; Advanced Progress Billing "coming soon". | Standard+ (advanced on Premium) | https://www.getcanopy.com/time-and-billing/billing-and-invoicing ; https://www.getcanopy.com/pricing | OBSERVED |
| Auto-link time to recurring invoices | Unbilled time for a contact attaches to the next recurring invoice. | | Standard+ | https://www.getcanopy.com/time-and-billing/billing-and-invoicing | OBSERVED |
| Reminders and late fees | Automated reminders before, on and after due date; automated late fees on past-due invoices. | | Standard+ | https://www.getcanopy.com/time-and-billing/billing-and-invoicing | OBSERVED |
| Canopy Payments | Card and ACH; surcharging to pass card fees; clients can save card or ACH and pay partially. | Cards 3.30% + $0.20; ACH 1% capped at $10. | All | https://www.getcanopy.com/pricing ; https://www.getcanopy.com/time-and-billing/billing-and-invoicing | OBSERVED |
| Time and expenses | Built-in timers by client and project; separate time and expense spaces; multiple rates by time, service or employee; WIP report grouped by contact; time approval workflows; billing permissions. | | Standard+ | https://www.getcanopy.com/time-and-billing/billing-and-invoicing ; https://www.getcanopy.com/pricing | OBSERVED |
| QuickBooks Online | Sync service items and locations, categories and classes, payments; also contacts, invoices and deposits per integration page. | | Standard+ | https://www.getcanopy.com/time-and-billing/billing-and-invoicing ; https://www.getcanopy.com/quickbooks-online-integration | OBSERVED |
| Payment plans | Not mentioned. | | | | not confirmed |

### 2.7 Reporting, AI, tax-specific

| Feature | What the user can do | Notable details and limits | Tier | Source | Status |
|---|---|---|---|---|---|
| Reports | Basic prebuilt reports and dashboards (Standard); customizable reports and dashboards (Plus); deep insights (Premium). Time dashboard, capacity planning, WIP, productivity, realization and utilization. | Help center has 186 reporting articles. | Standard / Plus / Premium | https://www.getcanopy.com/pricing ; https://support.getcanopy.com/ | OBSERVED |
| Canopy Coworker | Agentic AI that plans, executes and monitors multi-step work from plain-language outcomes; builds templates and renewals from prompts; checks uploads against prior years; summarizes threads; triggers bulk actions. "Earns autonomy only as you allow." | Beta. | All tiers | https://www.getcanopy.com/pricing ; https://www.getcanopy.com/workflow ; https://www.getcanopy.com/client-management | OBSERVED |
| Tax Resolution | 20 years of IRS transcripts, step-by-step notice fixes, auto-fill of 200+ federal and state forms, case management, at-risk account monitoring. | $50 per user per month add-on. | Add-on | https://www.getcanopy.com/pricing | OBSERVED |
| Close Automation | Month-end close checks for connected client ledgers. | $10 per connected client per month; first 5 included. | Add-on | https://www.getcanopy.com/pricing | OBSERVED |
| API and SSO | API ("New"); SSO; SAML coming soon. | | Enterprise-leaning | https://www.getcanopy.com/pricing | OBSERVED |

### 2.8 Pricing

| Tier | Price (per user per month, annual) | Includes | Source | Status |
|---|---|---|---|---|
| Standard | $74 | Coworker, CRM, documents and eSign, portal and messaging, automated and recurring task workflows, invoicing and payments, Notetaker 8 h | https://www.getcanopy.com/pricing | OBSERVED |
| Plus | $109 | Adds roles and access controls, more intake capacity, advanced task views, capacity planning, custom reporting, Notetaker 12 h | https://www.getcanopy.com/pricing | OBSERVED |
| Premium | $149 ("coming soon") | Adds advanced workflows and automation, advanced billing, deep reporting, Notetaker 16 h | https://www.getcanopy.com/pricing | OBSERVED |
| Enterprise | custom | Aimed at roughly 200-person firms | https://www.getcanopy.com/pricing | OBSERVED |
| Power-ups | Tax Resolution $50/user/mo; KBA $1.25/credit; Tax Workflow Automation from $34 per client credit (5 included); Close Automation $10/client/mo | | https://www.getcanopy.com/pricing | OBSERVED |
| Billing | Monthly available; annual saves 20%; no free tier, trial via sales demo | | https://www.getcanopy.com/pricing | OBSERVED |

---

## 3. Clio (Clio Manage and Clio Grow)

Positioning: legal practice management (Manage) plus a separate intake and CRM product (Grow). Legal-specific: matters, trust (IOLTA) accounting, court rules, LEDES billing. clio.com and help.clio.com refused fetches; rows rest on help-article snippets and third-party pages.

### 3.1 Contacts, matters, intake (Grow)

| Feature | What the user can do | Notable details and limits | Tier | Source | Status |
|---|---|---|---|---|---|
| Contacts and matters | Contacts are people or companies; a Matter is the case or engagement for a client; everything (documents, time, bills, calendar, messages) hangs off the matter. | | All | https://help.clio.com/hc/en-us/articles/9285493193115 | OBSERVED (snippet) |
| Custom fields and field sets | Create custom fields for contacts and matters and group them in field sets per practice area; all field types usable as merge fields in document templates. | Only administrators can create, edit or delete; not available on the EasyStart / Starter plan in North America. | Essentials / Core and up | https://help.clio.com/hc/articles/9285496802331 ; https://help.clio.com/hc/en-us/articles/39597117911963-Apply-and-Update-Custom-Fields-in-Clio-Manage | OBSERVED (snippet) |
| Clio Grow intake forms | Build online intake forms; share by email, text or website embed; data lands in Grow and syncs to Manage when a lead converts. | | Grow (included on top tier, add-on below) | https://www.clio.com/en-AU/grow/ | OBSERVED (snippet) |
| Clio Grow pipeline | Kanban-style board of prospective clients with status and next-step owner; automated email campaigns to leads. | Users describe the Grow to Manage integration as "clunky" (third-party). | Grow | https://www.clio.com/en-AU/grow/ ; https://costbench.com/software/ai-legal-tools/clio/ | INFERRED |
| Fee agreements with e-sign and payment | Send fee agreements for e-signature and collect payment online from Grow. | E-signature historically via DocuSign integration; plan quotas reported as 3 per month (EasyStart), 15 (Essentials), unlimited (Advanced+). | Grow / Manage tiers | https://www.clio.com/en-AU/grow/ ; https://costbench.com/software/ai-legal-tools/clio/ | INFERRED |
| Clio Scheduler | Online appointment booking; intake and matter calendars sync automatically. | Listed on Complete / Elite tier by third parties. | Top tier | https://www.clio.com/en-AU/grow/ ; https://costbench.com/software/ai-legal-tools/clio/ | INFERRED |

### 3.2 Client portal (Clio for Clients)

| Feature | What the user can do | Notable details and limits | Tier | Source | Status |
|---|---|---|---|---|---|
| Documents | Firm shares documents or whole folders; anything added to a shared folder is shared automatically; clients share multiple documents back from web or mobile. | | Essentials / Core and up | https://help.clio.com/hc/en-us/articles/9156698397467 ; https://help.clio.com/hc/en-us/articles/9156800144283-Clio-for-Clients-Client-Actions | OBSERVED (snippet) |
| Messages | One secure thread per matter; firm can attach documents to messages. | | same | https://help.clio.com/hc/en-us/articles/9156698397467 | OBSERVED (snippet) |
| Bills and payments | Share a bill to the portal, by email, or both; client pays by card, debit, or eCheck/ACH from the notification or portal. | Multi-matter bills and contact-level trust requests cannot be shared via the portal. | same | https://help.clio.com/hc/en-us/articles/9285343645595 ; https://www.clio.com/en-GB/features/client-portal/ | OBSERVED (snippet) |
| Calendar and status | Client sees upcoming events in a Calendar events tab and case status updates. | Portal available in English and Spanish. | same | https://help.clio.com/hc/en-us/articles/9156800144283-Clio-for-Clients-Client-Actions | OBSERVED (snippet) |
| E-sign in portal | No help article found describing in-portal signing; e-sign flows run through Clio's e-signature feature (DocuSign-backed). | | | | not confirmed |
| Login and mobile | Client apps on iOS and Android; invitation by email. Exact login model (magic link vs password) not confirmed. | Best-practice PDF exists but was unreadable (binary). | | https://www.clio.com/wp-content/uploads/2025/04/Clio-for-Clients-Best-Practice-Guide.pdf | not confirmed |

### 3.3 Documents, work, communication

| Feature | What the user can do | Notable details and limits | Tier | Source | Status |
|---|---|---|---|---|---|
| Document management | Unlimited storage organized by matter; search and secure sharing; full-text search on Advanced+. | Versioning described as shallower than DMS-first tools; bulk uploads slow on large sets (reviews). | Advanced+ for full-text | https://www.rfp.wiki/legal-compliance/legal-practice-management/clio ; https://costbench.com/software/ai-legal-tools/clio/ | INFERRED |
| Document automation | Document templates with merge fields from contacts, matters and custom fields. | Clio Draft is a separate, quote-priced product for court forms and drafting. | Essentials / Core and up | https://help.clio.com/hc/articles/9285496802331 ; https://www.timecamp.com/blog/what-is-clio/ | OBSERVED (snippet) / INFERRED |
| Tasks, workflows, matter templates | Tasks, task lists, automated workflows ("automated workflows" on Essentials+, "matter budgets" and "unlimited custom roles" on Signature). | | Essentials / Signature | https://costbench.com/software/ai-legal-tools/clio/ ; https://www.timecamp.com/blog/what-is-clio/ | INFERRED |
| Calendar and court rules | Calendar with court-rule deadline calculation (legal-specific). | Court rules not confirmed by an official page in this pass. | | | not confirmed |
| Time tracking | Timers, mobile time capture, time and expense entries flowing to bills. | Reviewers praise recovery of billable time. | All | https://www.rfp.wiki/legal-compliance/legal-practice-management/clio | INFERRED |
| Text messaging | Clio offers client text messaging; details not confirmed in this pass. | | | | not confirmed |
| Email integration | Email integration on Essentials+ (third-party matrix). | | Essentials+ | https://costbench.com/software/ai-legal-tools/clio/ | INFERRED |

### 3.4 Money (legal-specific)

| Feature | What the user can do | Notable details and limits | Tier | Source | Status |
|---|---|---|---|---|---|
| Trust (IOLTA) accounting | Keep earned and unearned funds separate by client and matter; trust ledgers and reconciliation; processing fees are charged to operating, never withdrawn from trust. | "IOLTA-compliant, on every plan" per Sept 2026 review; firm remains responsible for state rules. | All | https://www.clio.com/en-AU/features/trust-account-management-software/ ; https://www.clio.com/features/payments/ ; https://www.timecamp.com/blog/what-is-clio/ | OBSERVED (snippet) |
| Evergreen retainers | Set a low-balance threshold that triggers alerts and trust requests payable by link, QR code or portal; recurring card deposits into trust weekly or monthly. | | Core+ (inferred) | https://www.clio.com/en-AU/features/trust-account-management-software/ ; https://www.clio.com/blog/evergreen-retainers-law-firms/ | OBSERVED (snippet) |
| Payment plans | Automated payment plans with custom amounts and weekly, biweekly or monthly installments. | | Clio Payments | https://www.clio.com/features/payments/ | OBSERVED (snippet) |
| Clio Payments | Card, debit, eCheck/ACH; pay by link, QR, portal; flat per-transaction pricing, no card-network pass-through. | Third-party figures: 2.95% standard cards, 3.75% Amex, 1% eCheck, or 2.95% + $0.20. Reviewers report "fee creep" after signup. | All | https://www.clio.com/features/payments/ ; https://paymentproviders.io/providers/clio-payments.md ; https://www.rfp.wiki/legal-compliance/legal-practice-management/clio | INFERRED |
| Bills | Flexible invoice templates, retainers, LEDES export, split billing. | Complex split billing may need manual checks (reviews). | All | https://www.rfp.wiki/legal-compliance/legal-practice-management/clio | INFERRED |
| Accounting sync | Trust transactions sync to QuickBooks Online on select plans; bills, payments and contacts sync with Xero; trust export to Excel. | "Accounting integrations" on Core+. | Core+ | https://www.clio.com/features/payments/ ; https://www.timecamp.com/blog/what-is-clio/ | INFERRED |

### 3.5 AI and reporting

| Feature | What the user can do | Notable details and limits | Tier | Source | Status |
|---|---|---|---|---|---|
| Manage AI (formerly Clio Duo) | Ask questions about matters and firm operations; Document Analyzer on legal documents; delegate creation of a task, bill or calendar event; AI billing and time-entry suggestions (per 2026 news). | Respects existing Manage permissions; firm-level AI switch covers Manage and Grow. Not on Starter. | Core+ | https://help.clio.com/hc/en-us/articles/41990965598491-Manage-AI-The-Evolution-of-Clio-Duo ; https://www.clio.com/about/press/clio-duo-unlocks-a-ew-era-of-legal-platform-intelligence/ ; https://www.timecamp.com/blog/what-is-clio/ | OBSERVED (snippet) |
| Reports | Finance and task reports on Advanced; custom and scheduled reports, revenue reporting on Signature / Complete. | Reporting scored lowest in review aggregates. | Advanced+ | https://costbench.com/software/ai-legal-tools/clio/ ; https://www.rfp.wiki/legal-compliance/legal-practice-management/clio | INFERRED |

### 3.6 Pricing (two naming schemes in circulation)

| Item | Detail | Source | Status |
|---|---|---|---|
| Newer scheme (Aug to Oct 2026 reports) | Starter $49 per user per month published; Core, Signature and Elite are quote-only. Starter: matters, contacts, documents, time, billing, trust accounting. Core adds AI billing, client updates, client portal, accounting integrations. Signature adds custom reporting, matter budgets, automated workflows, unlimited custom roles. Elite adds Clio Grow at a 17% discount. 7-day trial, no card. | https://www.timecamp.com/blog/what-is-clio/ | INFERRED |
| Older scheme (early 2026 and before) | EasyStart $49 ($39 annual), Essentials $89 ($79), Advanced $119 ($109), Complete/Expand $149 ($139) per user per month; Grow about $49 to $59 per user per month plus a reported $399 setup fee. | https://costbench.com/software/ai-legal-tools/clio/ ; https://www.rfp.wiki/legal-compliance/legal-practice-management/clio | INFERRED |
| Contract terms | Annual auto-renew; licenses must be removed before renewal (deactivating is not enough); no mid-term downgrade; cancellation non-refundable for the term. | https://costbench.com/software/ai-legal-tools/clio/ | INFERRED |
| Official page | https://www.clio.com/pricing/ returned 403; not read. | | not confirmed |

---

## 4. Karbon (lighter pass)

Positioning: collaborative practice management for accounting firms, built around a shared email inbox (Triage) and work items. Billing and payments and a client portal were added later and are lighter than TaxDome's.

| Feature | What the user can do | Notable details and limits | Tier | Source | Status |
|---|---|---|---|---|---|
| Triage (email) | Shared firm inbox; assign emails, comment internally, add an email to a work item, turn email into a task; shared addresses (info@, tax@); delegate your inbox to an assistant; AI Triage labels categorize and action email. | | All | https://karbonhq.com/resources/what-is-karbon/ | OBSERVED |
| Contacts and organizations | Client records with a unified timeline of email, notes, work and billing. | Team plan caps contacts (1000 shown; column mapping unclear). | All | https://karbonhq.com/pricing/ ; https://karbonhq.com/resources/what-is-karbon/ | OBSERVED (limit INFERRED) |
| Work items and templates | Work templates with tasks, owners, due dates, statuses, job roles and preset client requests; conditional sections toggled manually or by automators; templates double as SOPs. | | All | https://karbonhq.com/workflow-automation/ | OBSERVED |
| Automators | Trigger: task completed (and schedule-based reminders). Actions: change status, shift due date, reassign work, turn a section on or off. Example: after 5 unanswered client reminders move work to "Resend client tasks". | Automators and automatic client reminders only on Business and Enterprise. | Business+ | https://karbonhq.com/workflow-automation/ ; https://karbonhq.com/pricing/ | OBSERVED |
| Work Scheduler (recurring) | Repeat work on a schedule with steps, assignments and due dates prefilled; bulk work creation with timing control and client-group assignment; bulk status update of 100 work items. | | All | https://karbonhq.com/workflow-automation/ ; https://karbonhq.com/release-notes/mar-31-2026/ | OBSERVED |
| Views | Kanban by status or assignee; saved work dashboards by status, due date, assignee; My Week personal view. | | All | https://karbonhq.com/workflow-automation/ ; https://karbonhq.com/resources/what-is-karbon/ | OBSERVED |
| Karbon for Clients (portal) | Clients see tailored task lists and progress, complete client requests, upload and download files, e-sign and approve, view a billing dashboard and pay invoices, comment on the timeline. Automated nudges by email, push and in-app. | Login is a magic link tied to the device that first opens it; firm can require client-level 2FA; branded logo, colors and background image; iOS and Android app. No separate chat feature described. | All | https://karbonhq.com/client-portal/ ; https://karbonhq.com/release-notes/mar-31-2026/ | OBSERVED |
| Documents | Native storage; browsable per-client document view; Google Drive, OneDrive, Dropbox integrations; client uploads attach to the work item. | DMS depth lags specialized tools (reviews). | All | https://karbonhq.com/resources/what-is-karbon/ ; https://karbonhq.com/release-notes/mar-31-2026/ | OBSERVED |
| eSignature and Engagements | eSign to multiple signatories via secure link, status tracked on the job; Engagements (open beta) turn a signed proposal into assigned recurring work and send signed PDF to client. | Credit bundles: 100 for $100 up to 4,000 for $2,000; KBA uses 2 credits; Engagements proposals use no credits. | All (credits) | https://karbonhq.com/pricing/ ; https://karbonhq.com/release-notes/mar-31-2026/ | OBSERVED |
| Time and budgets | Track time against work or clients; budgets in hours or dollars; over-budget warning before invoicing; AI flags missed time and suggests entries. | | Team+ | https://karbonhq.com/resources/what-is-karbon/ | OBSERVED |
| Billing and payments | Fixed-fee, recurring fixed-fee, time-and-materials and progress billing; WIP write up or down; invoice approval step; card or direct debit in portal; WIP, realization and AR aging reports; QBO and Xero sync with Xero mismatch alerts. | Fees: 2.6% + $0.30 standard cards, 3.6% + $0.30 premium, 3.9% + $0.30 Amex, ACH 1% + $0.30 capped at $5. | All | https://karbonhq.com/pricing/ ; https://karbonhq.com/resources/what-is-karbon/ | OBSERVED |
| Karbon AI and Kai | GA: client brief from emails, notes, work and billing; work and email summaries; compose and refine in firm style; quick replies; email from task; smart assignee suggestions; region-bound processing. Early access: Kai daily briefings, ask about work status, agentic workflows (timesheet review, prioritization) with every action routed for review. Coming: AI analytics, meeting notetaker, public MCP server. | | All (GA features) | https://karbonhq.com/release-notes/mar-31-2026/ ; https://karbonhq.com/resources/what-is-karbon/ | OBSERVED |
| Karbon Analytics | 12+ dashboards on work status, capacity, profitability, WIP, revenue, AR; Work Insights Basic vs Advanced; custom reporting paid add-on. | | Business+ (inferred) | https://karbonhq.com/resources/what-is-karbon/ ; https://karbonhq.com/pricing/ | OBSERVED |
| Pricing | Team $59 (annual) / $79 (monthly); Business $89 / $99; Enterprise custom. Monthly billing only for 4+ users. Paid add-ons: Email Insights, training packages, dedicated CSM, custom reporting. | | | https://karbonhq.com/pricing/ | OBSERVED |

---

## 5. HoneyBook (lighter pass; consultants and creatives)

Positioning: client-flow platform for independent service businesses (photographers, planners, coaches, consultants). Strength is the branded, no-login client experience and simple automations. No practice-management depth (no jobs per service, no trust accounting, no KBA).

| Feature | What the user can do | Notable details and limits | Tier | Source | Status |
|---|---|---|---|---|---|
| Lead forms and contact form | Embed lead forms capturing name, email, phone and details; questionnaires for more info. | 2 live forms on Starter, 10 on Essentials, unlimited on Premium. | All (caps) | https://www.honeybook.com/features ; https://www.honeybook.com/pricing | OBSERVED |
| Pipeline | Project pipeline with stages such as New inquiry, Follow-up, Intro call, Proposal sent. | | All | https://www.honeybook.com/features | OBSERVED |
| Contacts and tasks | Contact profile with interaction history and compose email; tasks with labels and overdue flags. | | All | https://www.honeybook.com/features | OBSERVED |
| Proposals, contracts, e-sign | Proposal builder with text, images, video, uploads, packages and pricing, embedded invoice, contract and payment in one flow; digital contracts with client fields and signatures. | No KBA. | All | https://www.honeybook.com/features | OBSERVED |
| Invoices and payments | Itemized invoices; templates (Simple, Monthly, Retainer, Milestone); autopay and recurring invoices or retainers; automated upcoming and overdue reminders; tips; Apple Pay and Google Pay; client pays from a secure emailed link with no login; view and pay tracking. | Cards 2.9% + 25 cents (one page says from 2.7% + 10 cents); ACH 1.5%; instant deposit up to $5,000 for 1% (min $5); no automatic refunds; pass-through only via a manual "Service fee" line where legal. | All | https://www.honeybook.com/online-payment-software ; https://www.honeybook.com/pricing | OBSERVED |
| Scheduler | Clients book session types (for example 30-minute intro call) from available slots in their time zone. | 1 session type, email reminders only on Starter; unlimited sessions with email and SMS reminders on Essentials+. | All (caps) | https://www.honeybook.com/features ; https://www.honeybook.com/pricing | OBSERVED |
| Automations | Triggers: new inquiry; session scheduled, started, ended; file viewed or completed; contract signed; payment made; project start, end, marked complete. Actions run in sequence with waits and conditions (for example follow up only if contract not signed within 3 days); automated emails can be edited before sending. | Essentials and Premium only. | Essentials+ | https://www.honeybook.com/automations | OBSERVED |
| Client portal | Project space with Overview, Activity, Tasks, Files, Payments, Notes and messages. | "Powered by HoneyBook" removed on Essentials+. | All | https://www.honeybook.com/features ; https://www.honeybook.com/pricing | OBSERVED |
| AI | Email drafts with tone and clarity controls; project recaps before meetings; business trend insights; meeting notetaker with summaries and to-dos; a HoneyBook app for ChatGPT answering questions about clients, invoices and bookings. | | All | https://www.honeybook.com/features | OBSERVED |
| QuickBooks Online | Payments sync creating invoice and payment records, deposits in banking, fees as expenses. | Essentials+. | Essentials+ | https://www.honeybook.com/online-payment-software ; https://www.honeybook.com/pricing | OBSERVED |
| Mobile app | iOS and Android with messages, meetings, leads and payments on home screen. | | All | https://www.honeybook.com/features | OBSERVED |
| Reports and team | Basic / Standard / Advanced reports by tier; up to 2 team members on Essentials, unlimited on Premium; multiple companies on Premium. | | tiered | https://www.honeybook.com/pricing | OBSERVED |
| Pricing | Starter $29 annual / $36 monthly; Essentials $49 / $59; Premium $109 / $129 (USD per month). | Page shows both 15% and 35% annual-discount labels. | | https://www.honeybook.com/pricing | OBSERVED |
| Help center structure | Collections: Getting Started, Company Management, Project Management, Workflows, Files and Templates, Integrations, Client Experience, Finance and Payments, HoneyBook Balance, HoneyBook Capital, Legacy Files. | | | https://help.honeybook.com/en/ | OBSERVED |

---

## Common core across these products

Every one of the five ships the same backbone, which is strong evidence this is the baseline a professional-services module must meet:

1. Contact record with a relationship model: a person versus the billable entity (TaxDome account/contact, Canopy client/contact/group, Clio contact/matter, Karbon contact/organization, HoneyBook contact/project). All support custom fields and tags or filters.
2. Branded client portal with a to-do list of what the client owes the firm (upload, answer, sign, pay), secure messaging and a free client mobile app. Four of five add no-login secure links for single tasks.
3. Templated requests for documents and information with automatic reminders.
4. E-signature bundled or cheap, with templates and audit trail; KBA as a priced add-on where IRS forms matter (TaxDome, Canopy, Karbon).
5. Work objects per engagement (job, project, matter, work item) with templates, recurring schedules, due dates, assignees and a kanban or list view.
6. Rule-based automation: an event on the work object (stage entered, task completed, document signed, payment made) fires an ordered list of actions (send email or chat, send request or organizer, create task, create invoice, change status or assignee, apply folder template), often with waits and tag or condition gates.
7. Invoicing with recurring invoices, stored payment authorization or autopay, automated reminders, card plus ACH through an embedded processor (Stripe-powered or own), optional surcharge, and QuickBooks Online (and often Xero) sync.
8. Time tracking tied to the work object with budgets and WIP.
9. Email integration into the client record (sync or shared inbox) plus templates with merge fields; SMS is present but limited (TaxDome via Twilio, HoneyBook reminders; Canopy not confirmed).
10. Reporting on work status, time, WIP and AR, with custom reports gated to higher tiers.
11. AI layer converging on the same jobs: summarize client history, draft emails, rename and classify documents, suggest time entries, meeting notetaker, and an "agent" that executes multi-step work with approval gates (Canopy Coworker, Karbon Kai, TaxDome Atlas, Clio Manage AI).

## What is specific to professional services (the module content)

- Engagement object per client per service with a stage pipeline, recurring schedule (annual, quarterly, monthly, custom filing frequency) and a deliverable. Legal calls it a matter; accounting calls it a job or work item.
- Proposal plus engagement letter plus e-signature plus first invoice as one accept flow, with package tiers and automatic creation of the job and recurring invoices on acceptance.
- Document collection as a first-class workflow: request lists and organizers or questionnaires with conditional questions, folder templates with firm-private versus client-visible versus client-uploaded zones, approval (approve or disapprove) on drafts, payment-locked deliverables, retention rules, and AI renaming and routing of uploads.
- Compliance signatures: KBA for IRS 8878 and 8879, QES for EU, certified audit trail; multiple signers (spouses, officers).
- Household and entity graph: one person linked to many accounts (joint return, dependents, several businesses) with one login; group billing.
- Legal-only money rules: trust (IOLTA) ledgers kept apart from operating funds, processor fees charged to operating, evergreen retainer thresholds and top-up requests, LEDES export, split billing.
- Tax-only extras: IRS transcript pull and notice resolution (Canopy), e-file form signing, prior-year-return-driven checklists.
- Capacity and realization: time budgets per job, WIP, write up or down, utilization and realization reports.
- Seasonality tooling: bulk work creation for a client segment, bulk engagement sending, bulk reminders, custom job statuses such as "Missing information".

## What they share with other business types

- Contacts and companies with custom fields, tags, saved segments, import. Same as any CRM module.
- Scheduling and booking: all five either embed or integrate a booking page with session types, time zones, reminders. TaxDome delegates to Calendly-class tools, which signals booking is generic, not domain-specific.
- Messaging: email sync and templates, secure chat, SMS with per-client threads, bulk sends with merge fields, rate-limited notification digests.
- Invoicing and payments: one-off, recurring, autopay, reminders, late fees, surcharge, card plus ACH, wallets, QBO sync. Identical to home-services or wellness invoicing except for trust accounting.
- Reminders and nudges to the customer across email, SMS, push and in-app, triggered by overdue tasks or unpaid invoices.
- Lead forms and a pipeline board, proposals and contracts with e-sign (HoneyBook's version is the generic one).
- Meeting notetaker and AI email drafting are horizontal.

## Pain points users report (sourced)

| Product | Pain point | Source | Status |
|---|---|---|---|
| TaxDome | Price increases: Pro from $600 to $800 per user per year (2023) and reviewer complaints about "two price increases in two years" and a sales promise of no increase followed by one six months later. | https://taxdome.com/blog/everything-you-need-to-know-about-taxdomes-first-ever-price-change ; https://www.capterra.com/p/186749/TaxDome/reviews/ ; r/taxpros thread 1efhvqd (Jul 2024, via mirror https://red.bismuth.it/r/taxpros/comments/1efhvqd/taxdome_price_increase) | OBSERVED (blog) / INFERRED (snippets) |
| TaxDome | "The glitches are immense"; Canopy described as "much easier for non tech savvy clients to use". | r/taxpros 1efhvqd snippet | INFERRED |
| TaxDome | Steep learning curve and weeks-to-months setup; "pipelines can be confusing"; annual-only billing; limited billing rounding or quantity pricing; portal "focused on document exchange". | https://unclekam.com/tax-pro-tools/client-portal-software/taxdome-portal-review/ ; https://www.capterra.com/p/186749/TaxDome/reviews/ | INFERRED |
| TaxDome | Synced email cannot be selectively removed from a client record; SMS limited to US and Canada; recurring auto-charge historically Stripe-only. | https://help.taxdome.com/article/37-sending-and-receiving-emails-in-taxdome ; https://taxdome.com/blog/introducing-sms-text-messages-communication-in-taxdome | OBSERVED |
| Canopy | Module-based pricing frustration ("certain features require a specific module"); cost "a bit high"; slow support; renewal charged without refund on a dropped module. | https://capterra.com/p/150647/Canopy-Tax/reviews/ ; https://fr.trustpilot.com/review/canopytax.com | INFERRED |
| Canopy | Client Messaging cannot target one contact; all portal contacts see every thread; messaging still Beta. | https://support.getcanopy.com/en/articles/14712967-how-do-i-use-client-messaging | OBSERVED |
| Canopy | Occasional bugs; slow transcript reports (older review). | https://capterra.com/p/150647/Canopy-Tax/reviews/ ; https://www.trustradius.com/products/canopy/reviews/all | INFERRED |
| Clio | Product fragmentation (Manage, Grow, Draft, Payments sold separately); quote-only pricing above Starter; "price increases without notice"; Clio Payments "fee creep post-signup". | https://www.rfp.wiki/legal-compliance/legal-practice-management/clio ; https://costbench.com/software/ai-legal-tools/clio/ | INFERRED |
| Clio | Auto-renewal traps: licenses must be removed, not deactivated, before renewal; charges for unused seats; difficulty cancelling. | https://costbench.com/software/ai-legal-tools/clio/ ; https://www.timecamp.com/blog/what-is-clio/ | INFERRED |
| Clio | Grow to Manage integration "clunky"; reporting weakest area; invoicing edge cases such as split billing need manual checks; wish to see trust balance before applying payments; support slow on complex issues. | https://www.rfp.wiki/legal-compliance/legal-practice-management/clio ; https://www.capterra.com/p/105428/Clio/reviews/ ; https://www.timecamp.com/blog/what-is-clio/ | INFERRED |
| Karbon | Uneven onboarding and support during implementation; per-user price plus eSignature credit packs and payment fees called expensive as teams grow; portal value requires clients to abandon email; portal UX and Drive sync inconsistent after relaunch; Xero sync edge cases; Team-tier caps on templates, statuses and contacts. | https://www.rfp.wiki/accounting-finance/accounting-practice-management-software/karbon | INFERRED |
| HoneyBook | Bugs and glitches are the top complaint (Gmail sync gaps, scheduler ignoring availability, missed meeting notifications); support hard to reach; automation links not advancing clients; clients unable to sign proposals; limiting payment-schedule options; distrust of processing fees. Trustpilot 4.1 from 755 reviews with 10% one-star. | https://www.trustpilot.com/review/honeybook.com | OBSERVED (aggregate page) |

## What this tells us a template must have

1. One client graph, not one client table: people linked to many billable accounts (joint, dependents, entities) with a single login that switches accounts, plus groups for group billing. This is the number one structural difference from a retail or home-services customer record.
2. An Engagement object per client per service, with a stage pipeline, custom statuses (for example "Waiting on client"), recurring schedule including custom cadences, assignee, due date and time budget. Templates per service line.
3. A client to-do list as the portal's home screen: every open request, questionnaire, signature and invoice in one "waiting for action" list, mirrored in the mobile app and in digest emails; secure links that let a client finish one item with no login.
4. Document zones with permissions baked in: firm-private, shared-to-client, client-uploaded; folder templates applied by automation; approve or disapprove on drafts; payment-locked deliverables; retention rules; version history; AI rename and route on upload.
5. Request and questionnaire engine with templates, conditional questions, per-item upload, auto-matching uploads to checklist items, and scheduled reminders that stop when the item is done.
6. E-signature as a platform primitive with templates, multiple signers, audit trail, AI field placement, and pluggable identity verification (KBA for IRS forms, QES for EU) priced as credits.
7. Proposal and engagement letter flow that, on acceptance, creates the engagement, the recurring invoice with stored payment authorization, and the first job. Package tiers (3-tier pricing) and bulk send for seasonal onboarding.
8. Automation model: event on an object (stage entered, task done, request completed, document signed, payment made, date reached) fires an ordered action list (send email, chat or SMS; send request, organizer, proposal or invoice; create task; change status, assignee or dates; apply folder template; grant or revoke portal access) with waits, condition gates on tags or fields, and an "auto-advance when done" switch. Every reminder must be a client-facing action with a cadence and a stop condition.
9. Money that handles recurring and autopay, partial payments, saved card and ACH, reminders and late fees, surcharge where legal, QBO and Xero sync, and a pluggable ledger rule set so a legal variant can add trust accounts, operating-only fees, evergreen thresholds and LEDES export without forking invoicing.
10. Time and budget tracking attached to engagements with WIP, write up or down before invoicing, realization and utilization reports; AI suggestions for missed time.
11. Shared inbox with email sync into the client record, internal comments and @mentions, and the explicit rule that email is never shown in the portal while chats are. Rate-limit client notification emails (Canopy's one per hour per thread is a good default).
12. Secure chat threads per client with the ability to address one contact rather than all portal members (Canopy's gap).
13. SMS as a per-client thread with templates and bulk one-to-one sends, with country gating stated in the UI.
14. Reporting with pre-built dashboards for work status, overdue items, capacity, WIP, AR aging, plus custom and scheduled reports, and an AI "ask for a report" entry point.
15. AI agent surface with approval gates: summarize client, draft reply, build request list from prior documents, suggest time entries, place signature fields, and run multi-step work only within granted autonomy. Region-bound processing is a selling point (Karbon).
16. Booking is generic: integrate a booking page with session types, time zones and reminders into the portal rather than building a profession-specific scheduler.
17. Pricing design lessons: users punish per-module pricing, surprise increases, auto-renewal traps and credit-based add-ons. Prefer flat per-seat with transparent add-ons (KBA, SMS) and visible fee schedules.
18. Onboarding and migration matter: every product draws "steep learning curve" and "weeks to set up" complaints. Ship service-line templates (1040, bookkeeping, payroll, litigation matter) pre-wired with stages, requests, folder templates and automations.
19. Reliability of the client-side basics (upload, sign, pay, book) is the most reviewed surface; glitches there dominate negative reviews across TaxDome and HoneyBook.
20. Mobile apps for both sides: a client app with camera-to-PDF scanning and push reminders, and a staff app for approvals, time and messages.

## Unconfirmed items and research gaps

- TaxDome 2026 list pricing: per-seat ($800 / $1,000 / $1,200 per year) versus a client-count model ($1,500 per year for 150 clients and 20 seats) reported by one Nov 2026 source. Official page returned 403. Not confirmed.
- TaxDome: native surcharge status, payment plans, 2FA details, document retention, Atlas agent capabilities, firm mobile app scope. Not confirmed.
- Clio: official tier names and prices (Starter/Core/Signature/Elite versus EasyStart/Essentials/Advanced/Complete), Clio Payments rates, text messaging, court rules, in-portal e-signature, client login model. Official pages returned 403. Not confirmed.
- Canopy: SMS, payment plans, calendar engine, Premium tier (marked coming soon). Not confirmed.
- Karbon: plan-by-plan limits (contacts, templates, statuses) were in an unreadable comparison table. Not confirmed.
- Pain points from r/Lawyertalk, r/Accounting and dedicated Karbon and HoneyBook Reddit threads were not reached before the search budget ran out; Karbon and HoneyBook pain points rest on rfp.wiki and Trustpilot respectively.
