# 06. Field service all-in-one platforms: Jobber, Housecall Pro, ServiceTitan, Workiz

Research date: 2026-11-06. Scope: user-level feature inventory of the leading all-in-one platforms for home and field service businesses (plumbers, electricians, HVAC, cleaners, landscapers, handymen). Deep pass on Jobber and Housecall Pro, lighter pass on ServiceTitan and Workiz.

Purpose: define what a "field service" module must contain in our per-client all-in-one platform (CRM, conversations, scheduling, marketing, money, automation on an AI agent runtime), and separate what is field-service specific from what every business family shares.

Method: official pricing pages, feature pages and help centers first, then G2, Capterra, Trustpilot and review aggregators for pain points. About 70 searches and fetches. Each row cites a source and is labelled OBSERVED (seen on the cited page) or INFERRED (reasonable reading of the page or of two pages together). "Not confirmed" means we could not find it on an official page.

Known research limits (see also the appendix):
- The web search budget ran out before the last pass, so a few items are left as "not confirmed" rather than guessed.
- Two pain-point aggregator pages (fieldservicecompare.com, godispatchpro.com) and three third-party pricing pages (Capterra Workiz pricing, Workiz help center, G2) were blocked or returned 403, so Reddit evidence is secondhand via search summaries and review-site pages.
- Jobber's help center has two URL schemes (help.getjobber.com/hc/... and help.getjobber.com/en/articles/...); several old links 404. Rows cite the pages that loaded.

Legend for the Tier column: the lowest plan on which the feature is available, as far as we could confirm. "All" means included on every paid plan. "Add-on" means sold separately. "n/c" means not confirmed.

---

## 1. Jobber (getjobber.com)

### 1.1 Pricing and user caps (OBSERVED, source: https://www.getjobber.com/pricing/)

| Plan | Users included | Monthly, no commitment | Monthly, 1-year commitment | Annual (billed yearly) | Adds |
|---|---|---|---|---|---|
| Core | 1 | $49 | $39 | $29 | Online booking, quotes, invoices with online payments, website, reporting, 100+ app marketplace integrations |
| Connect | 1 / 5 / 10 / 15 | $139 / $199 / $299 / $399 | $119 / $169 / $259 / $339 | $99 / $149 / $229 / $299 | Automated client reminders, automatic payments, job checklists, automated quote and invoice follow-ups, QuickBooks Online sync, time and expense tracking |
| Grow | 1 / 5 / 10 / 15 | $199 / $299 / $399 / $499 | $169 / $259 / $349 / $429 | $149 / $229 / $299 / $399 | Quotes with images and reviews, optional upsell line items, automatic time tracking, job costing, two-way SMS, custom workflow automations |
| Plus | 5 / 10 / 15 | $499 / $599 / $699 | $439 / $499 / $599 | $399 / $449 / $529 | Unlimited photo and video storage per job, crew scheduling with @mentions, automated expense capture with profitability alerts, custom reports, Pipeline, Marketing Suite, AI Receptionist, dedicated onboarding and premium support |

- Extra users: $29 per month each on every plan. Plus has no 1-user option. Custom pricing for franchises and multi-location.
- Add-ons (paid on lower plans, included in Plus): Marketing Suite $99/mo, AI Receptionist $29/mo, Pipeline $49/mo.
- Jobber Payments fees: card 2.9% + 30 cents, Tap to Pay 2.7% + 30 cents, ACH 1%, instant payout an additional 1%.

### 1.2 Feature inventory

| Feature | What the user can do | Notable details and limits | Tier | Source | O/I |
|---|---|---|---|---|---|
| **Lead and request intake** | | | | | |
| Online booking | Define bookable services with description, estimated price and duration; choose which team members are bookable and their hours; Jobber auto-assigns an available person; set lead time, buffer time between appointments, service area and max drive distance; bookings are slotted around existing appointments; email confirmation to both sides | Deposits or card capture at booking: not confirmed. Embedding locations: not stated on feature page. Arrival-window format not described | Core | https://www.getjobber.com/features/online-booking/ | OBSERVED |
| Requests (quote request form) | Accept work requests from website, social links or client hub; log phone requests manually; see which requests are overdue for an assessment or quote; schedule and assign an on-site assessment from a request | Request is a first-class record that precedes a quote or job | Core | https://www.getjobber.com/features/ | OBSERVED |
| Lead management in CRM | Tag and manage leads separately from active clients; client record holds contact info, properties, jobs, job history and all email and text history | Lead source attribution reporting: not confirmed on Jobber pages | Core | https://www.getjobber.com/features/ | OBSERVED |
| Pipeline (add-on) | Sales pipeline tracking for leads and quotes | Feature page 404 at research time; only the pricing page confirms it exists at $49/mo or included in Plus. Stages not confirmed | Add-on / Plus | https://www.getjobber.com/pricing/ | OBSERVED (existence), stages n/c |
| Website builder with intake | Prebuilt site customised with domain, photos and brand colours; SEO; shows Google reviews; visitors fill request forms and chat with the Receptionist | Included at no extra charge on every plan per Marketing Suite page | Core | https://www.getjobber.com/features/ ; https://www.getjobber.com/features/marketing-tools/ | OBSERVED |
| **Quotes and estimates** | | | | | |
| Quote builder | Itemised products and services; templates for common jobs; header image, image gallery, PDF and file attachments; customer reviews shown on quote; build and send from mobile on site | Quotes with images and reviews are a Grow-tier feature per pricing page | Core (basic), Grow (images, reviews) | https://www.getjobber.com/features/quotes/ ; https://www.getjobber.com/pricing/ | OBSERVED |
| Optional line items (upsell) | Add-ons the customer can tick or untick before approving; approved total updates automatically; "tailored packages" | This is Jobber's answer to good/better/best; it is per-line optional rather than a side-by-side tier compare | Grow | https://www.getjobber.com/features/quotes/ ; pricing page | OBSERVED |
| Markups | Set markup on materials and labour inside the quote based on cost | Supports job costing later | Core | https://www.getjobber.com/features/quotes/ | OBSERVED |
| Rough estimate then formal quote | Send a non-binding estimate and convert it to a quote once scope is confirmed | | Core | https://www.getjobber.com/features/quotes/ | OBSERVED |
| Supplier catalog | Search The Home Depot catalog for live pricing and stock inside the quote | US only presumably; region not stated | n/c | https://www.getjobber.com/features/quotes/ | OBSERVED |
| Approval and signature | Customer approves with one click in client hub or requests changes; business notified instantly; status updates; Jobber AI can manage "signatures" on quotes | Feature page does not say "e-signature" explicitly; AI article lists signatures as a quote action | Core | https://www.getjobber.com/features/quotes/ ; https://help.getjobber.com/en/articles/jobber-ai-voice-and-chat-beta/ | OBSERVED |
| Deposits | Customer pays a deposit in the same flow right after approving; quote deposit carries to the first invoice and is applied to the first automatic payment on recurring jobs | | Core | https://www.getjobber.com/features/quotes/ ; https://help.getjobber.com/en/articles/automatic-payments/ | OBSERVED |
| Payment schedule on quote | Split the total into percentage or fixed-amount payments that must add to 100%; optional upfront deposit or partial first payment; schedule carries to job and invoices | Job-level schedules only on one-off jobs, not recurring; issued invoices locked; client sees only the current payment due | All | https://help.getjobber.com/hc/en-us/articles/26297232277527 | OBSERVED |
| Consumer financing on quote | Offer Wisetack financing on the quote | Partner: Wisetack | n/c | https://www.getjobber.com/features/quotes/ | OBSERVED |
| Automated quote follow-up | Automatic email or text reminders to review and approve unanswered quotes; quote tracking | Connect tier per pricing page | Connect | https://www.getjobber.com/features/quotes/ ; pricing page | OBSERVED |
| Quote to job | One click converts an approved quote into a job carrying line items, pricing and client | | Core | https://www.getjobber.com/features/quotes/ | OBSERVED |
| **Scheduling and dispatch** | | | | | |
| Calendar | Day, week, month views; custom views; colour coding; drag and drop; persistent filters; double-booking warning; see each member's open slots; suggested openings based on availability and drive time | Map and list views not confirmed on the scheduling page, though the features index mentions "see visits on a map" | Core | https://www.getjobber.com/features/scheduling/ ; https://www.getjobber.com/features/ | OBSERVED |
| Jobs vs visits | A job is the contract; a visit is each trip to the property; recurring jobs generate visits; change frequency, reassign a single visit or update the whole series | Snow-removal style workflow lets you add visits to existing recurring jobs | Core | https://help.getjobber.com/hc/en-us/articles/115009542848 ; scheduling page | OBSERVED |
| Crews | Group staff into named crews; assign a job to a whole crew; filter calendar by crew; shift jobs between crews; crew lead clocks in the whole crew with a separate entry per person; @mentions | Crew scheduling with @mentions is Plus; crew control on Plus/Unlimited per timesheets article | Plus | https://www.getjobber.com/features/scheduling/ ; pricing page ; https://help.getjobber.com/en/articles/timesheets/ | OBSERVED |
| Route optimisation and map | Generate efficient daily routes, adjust on the go; GPS waypoints assign nearest person | | n/c | https://www.getjobber.com/features/scheduling/ ; https://www.getjobber.com/features/ | OBSERVED |
| GPS and fleet | Live vehicle GPS; real-time crew locations; fleet health (fuel, battery, idle) via Azuga; FleetSharp integration | Vehicle data is via partners, not native hardware | n/c | https://www.getjobber.com/features/scheduling/ ; features index | OBSERVED |
| Team notifications | Daily schedule overview to crews; real-time push on new, moved, reassigned or cancelled jobs | | Core | scheduling page | OBSERVED |
| On-my-way text | One tap "on my way" or "running late" text; customisable; Spanish-language app users can send pre-written English texts | | Core (INFERRED from being listed under Complete Job without tier gate) | https://www.getjobber.com/features/customer-communication-management/ | OBSERVED (feature), INFERRED (tier) |
| Arrival windows | Not described on scheduling or booking pages | Not confirmed | n/c | scheduling page | not confirmed |
| Job details, forms and checklists | Attach instructions, photos and on-site checklists to jobs; forms accessed on site | Job checklists are Connect tier. Job forms help article 404 at research time, so field types and PDF-to-client are not confirmed | Connect | https://www.getjobber.com/features/ ; pricing page | OBSERVED (checklists), forms detail n/c |
| Photos and media | Add notes and photos to jobs from the field; unlimited photo and video storage per job on Plus | Lower plans therefore have a storage cap (amount not stated) | Plus for unlimited | pricing page | OBSERVED |
| Time tracking | Visit timers, assessment timers, general timers (travel, break, shop), location timers that auto start and stop near the property, manual entries; Plus adds Driving, Office, Supplies, Break timers and up to 6 custom labels | Automatic (location) time tracking is Grow tier | Connect (time tracking), Grow (automatic) | https://help.getjobber.com/en/articles/timesheets/ ; pricing page | OBSERVED |
| Job costing | Job profit bar per job from material costs (from saved products), labour costs (tracked hours x rates) and expenses with receipt photos; profitability reports comparing price, cost and profit across jobs; Plus adds automated expense capture and profitability alerts | | Grow | https://www.getjobber.com/features/ ; pricing page | OBSERVED |
| **Client hub (portal)** | | | | | |
| Client hub | Customer can request work, approve quotes or request changes, view past and upcoming appointments with photos of assigned team members, pay invoices and deposits, add a tip, save a payment method to a Wallet, and refer friends via share links | No login details or branding options described on the feature page; access is via emailed or texted links (INFERRED from help centre flows) | Core | https://www.getjobber.com/features/client-hub/ ; https://help.getjobber.com/en/articles/automatic-payments/ | OBSERVED |
| **Communication** | | | | | |
| Two-way SMS | Text clients from the app; conversations stored on the client record; message centre chooses who gets notified of incoming texts | Grow tier. Dedicated business number not described. Several third-party reviews claim desktop texting limits and "must have messaged first" rules; not confirmed on official pages. Phone calls marked "coming soon" | Grow | https://www.getjobber.com/features/customer-communication-management/ ; pricing page | OBSERVED (feature, tier) |
| Email and text templates | Reusable branded templates for booking confirmations, invoice follow-ups and other message types, customisable per job or client | | Core | communication page | OBSERVED |
| Automated visit reminders | Scheduled email or text reminders before visits | Connect ("automated client reminders") | Connect | communication page ; pricing page | OBSERVED |
| Automated job follow-ups | After-job feedback request, review ask or thank you | | Connect (INFERRED, grouped with reminders) | communication page | OBSERVED (feature), INFERRED (tier) |
| Automated invoice follow-ups | Customised email or text payment reminders on outstanding invoices | | Connect | communication page ; pricing page | OBSERVED |
| Review requests | Automatic Google review requests when jobs close, visits finish or invoices are paid; reviews dashboard; AI-drafted replies; competitor comparison via Google Business Profile | Part of Marketing Suite | Add-on / Plus | https://www.getjobber.com/features/ ; https://www.getjobber.com/features/marketing-tools/ | OBSERVED |
| Missed call text back | Receptionist texts back callers who hang up | Only via the AI Receptionist add-on | Add-on / Plus | https://www.getjobber.com/features/ai-receptionist/ | OBSERVED |
| Business phone | Not native. Receptionist handles calls on a forwarded number | Native calling marked "coming soon" | n/c | communication page ; receptionist page | OBSERVED |
| Real-time notifications | Mobile push for new requests, quote views and texts; activity feed of team and client actions | | Core | https://www.getjobber.com/features/ | OBSERVED |
| **Money** | | | | | |
| Invoicing | Quick-create and send by text or email in one click; invoice reminders prompt the business after each visit, at completion or monthly; invoicing preferences per job | | Core | https://www.getjobber.com/features/ | OBSERVED |
| Batch invoicing | Create invoices for all jobs in "Requires invoicing" status at once; one invoice per client combining multiple jobs; incomplete visits excluded by default | | Core (INFERRED) | https://help.getjobber.com/en/articles/batch-create-invoices/ | OBSERVED (feature), INFERRED (tier) |
| Progress invoicing | Payment schedule on quote or one-off job; invoices created per instalment | Not for recurring jobs or multi-job invoicing | All | https://help.getjobber.com/hc/en-us/articles/26297232277527 | OBSERVED |
| Online payments | Card in client hub; Tap to Pay on phone; in-person card; ACH; instant payouts | Fees: 2.9% + 30c card, 2.7% + 30c Tap to Pay, 1% ACH, +1% instant payout | Core | pricing page ; features index | OBSERVED |
| Automatic payments | Charge saved card or ACH on a recurring job's billing schedule (monthly last day at 9pm, after each visit, at job close, or custom); request a payment method by email or SMS; receipt emailed | Only on recurring jobs; off by default; one attempt, no retry on failure; admin notified; UK clients must save their own method (SCA); referral credits do not apply | Connect | https://help.getjobber.com/en/articles/automatic-payments/ ; pricing page | OBSERVED |
| Tips | Client adds a tip when paying in client hub | A third-party review claims recurring-plan clients cannot tip; not confirmed | Core | https://www.getjobber.com/features/client-hub/ | OBSERVED |
| Consumer financing | Wisetack on quotes | | n/c | quotes page | OBSERVED |
| Expense tracking | Log expenses with receipt photos against jobs; Plus adds automated expense capture | | Connect | features index ; pricing page | OBSERVED |
| QuickBooks Online sync | Sync customers, invoices and payments | Connect tier; admin-only to run syncs | Connect | features index ; pricing page ; https://help.getjobber.com/hc/en-us/articles/115009568687 | OBSERVED |
| Late payment handling | Automated invoice follow-ups plus custom automations (for example tag "non-payment" 30 days after due) | | Connect / Grow | automation builder article | OBSERVED |
| **Marketing** | | | | | |
| Email campaigns | Campaign generator from a one-line idea; branded templates; client segmentation; automated campaigns; revenue-per-campaign reporting | Marketing Suite | Add-on / Plus | https://www.getjobber.com/features/ ; marketing-tools page | OBSERVED |
| Referral program | Automatic credit toward next service per successful referral; referral request emails; tracking via customer link or manual entry; referral revenue reporting | Marketing Suite | Add-on / Plus | same | OBSERVED |
| Reviews | See Communication row above | Marketing Suite | Add-on / Plus | same | OBSERVED |
| Social and Google posting, job showcases | Post to social and Google Business Profile; showcase completed jobs | Marketing Suite | Add-on / Plus | https://www.getjobber.com/features/marketing-tools/ | OBSERVED |
| **Automation** | | | | | |
| Built-in automations | Visit reminders, quote follow-ups, invoice follow-ups, job follow-ups, review requests, automatic payments, invoice reminders to the business | Configured as toggles rather than a builder | Connect | communication page ; pricing page | OBSERVED |
| Custom automation builder | Triggers: "Date passed" (X days after quote sent or approved, invoice paid or due) and "Date arrives" (morning 8am or evening 7pm local). Conditions (max 6): quote status is / is not (Awaiting response, Changes requested, Approved, Converted, Archived), invoice status (Due, Paid), client tag include / exclude, line items include / exclude. Actions: notify client by the same channel as the original document, add client tag, archive quote. Seven sample templates (archive unanswered quotes, tag delinquent clients, extra follow-ups, VIP tagging, VIP follow-ups, new-client follow-ups, post-service maintenance reminder) | Max 90 days offset; not retroactive; only quote and invoice objects, no job or visit triggers; "available on select plans" (Grow per pricing page) | Grow | https://help.getjobber.com/en/articles/custom-automation-builder/ ; pricing page | OBSERVED |
| Zapier and API | Zapier to 1,500+ apps; 100+ marketplace integrations | | Core | features index | OBSERVED |
| **Reporting** | | | | | |
| Business dashboard | Jobs and revenue by workflow stage; appointment progress and delays; payments in transit and available for instant payout; insights with recommended actions | Admin-only for Home, Insights and Activity Feed | Core | features index ; permissions article | OBSERVED |
| Financial reports | Real-time income, tax, payments, invoices, projected income, aged receivables | | Core | https://www.getjobber.com/features/field-service-reporting/ | OBSERVED |
| Custom report builder (AI) | Describe the report in natural language and Jobber AI builds it from live data with visuals | Custom reports are Plus per pricing page | Plus | reporting page ; pricing page | OBSERVED |
| Job profitability, timesheets, recurring jobs reports | Named in help articles (Timesheets report with Excel download in decimal hours; recurring jobs report with "Automatic invoicing" column) | | Connect+ | timesheets article ; automatic payments article | OBSERVED |
| **Team** | | | | | |
| Permission presets | Field crew (own schedule, mark complete, notes, photos, timers; no pricing or costs); Senior field crew (+ clients, pricing, create and edit clients, quotes, jobs, invoices, collect payments); Crew lead (+ everyone's schedule and timesheets, client communications); Manager (+ reports, marketing tools, pipeline). Custom mode toggles 17 areas (Schedule, Time tracking, Notes, Files, Expenses, Show pricing, Job costing, Marketing Suite, Pipeline, Client communications, Clients and properties, Requests, Quotes, Jobs, Invoices, Payments, Reports) with off / view / create-edit / delete levels | Admin flag adds settings, billing, imports and exports, payments reports, payroll confirmation, Home and Insights | All | https://help.getjobber.com/hc/en-us/articles/115009568687 | OBSERVED |
| Mobile app | iOS and Android; daily jobs, client details, notes, directions, quotes, invoices, payments, timers, voice AI | | All | scheduling page ; AI article | OBSERVED |
| Timesheets and payroll | Approve Timesheets tab; Confirm Payroll tab (admin); edit entries with audit log (100 entries per timesheet); Excel export in decimal hours | No native Gusto, ADP or QuickBooks Time export named in the article; not confirmed | Connect | https://help.getjobber.com/en/articles/timesheets/ | OBSERVED |
| **AI** | | | | | |
| Jobber AI (formerly Copilot), chat and voice | Chat (web and mobile): answer questions about clients, quotes, jobs, invoices and employees; business coaching; draft emails, social posts and blog posts; product support. Voice (mobile): create quotes and jobs, send invoices, check schedule, capture notes hands free. Actions for admins: call client, text or email quotes and invoices, send On My Way, add and summarise notes, edit client and property details, manage quote line items, discounts, tax, salesperson, conversion and signatures, create and reschedule jobs and visits, manage timers and checklists, convert job to invoice, collect payments, manage tasks and requests, clock in and out, navigate the app | Beta; available on all plans; non-admins get product support only (voice for non-admins on Plus); marketing output is text only and cannot publish to the website | All | https://help.getjobber.com/en/articles/jobber-ai-voice-and-chat-beta/ | OBSERVED |
| AI Receptionist | Answers calls and texts 24/7; books visits using online-booking settings; creates requests or tasks when it cannot book; recognises returning callers by number and lets them reschedule or cancel; keyword escalation (for example "burst pipe") transfers or text-alerts the owner; texts back hang-ups; per-conversation summary, transcript and recording; owner can watch texts live and take over; separate on/off for calls and texts; custom greeting and rules | $29/mo add-on, included in Plus; "Receptionist Companion" (drafts quotes during live calls) coming soon; no web chat mentioned on the page (website page says visitors can chat with Receptionist) | Add-on / Plus | https://www.getjobber.com/features/ai-receptionist/ ; pricing page | OBSERVED |
| AI in marketing | Campaign generator; AI-drafted review replies; natural-language custom reports | | Add-on / Plus | features index ; reporting page | OBSERVED |

---

## 2. Housecall Pro (housecallpro.com)

### 2.1 Pricing and user caps (OBSERVED, source: https://www.housecallpro.com/pricing/)

| Plan | Users included | Annual (per month) | Monthly | Adds |
|---|---|---|---|---|
| Basic | 1 | $59 | $79 | Online booking, scheduling and dispatch, estimates and invoicing, payments and consumer financing, price book, job costing, review management |
| Essentials | 5 | $149 | $189 | Routes, flat-rate pricing, checklist automations, photo reports and annotations, employee GPS tracking, commissions, QuickBooks Online sync |
| Max | 8 | $299 | $329 | Sales proposal tool (a $40/mo value), recurring service plans, route optimisation, open API, dedicated onboarding specialist, escalated phone support |

- Extra users: $35/mo each on Max. Basic and Essentials show a placeholder, so the extra-user price on those plans is not confirmed.
- Add-ons listed without prices: CSR AI, Sales Proposal Tool ($40/mo on Basic and Essentials per estimating page), Pipeline, Payroll, Accounting, Business Coaching, Voice, Campaigns, VGPS/Dashcams, Tap to Pay, Websites. QuickBooks page says QuickBooks "is not included in your subscription".
- Payments: card from 2.59%, ACH 1%, mobile check deposit free. Instapay for 30-minute payouts (fee not stated).
- Every plan: live phone and chat support (an aggregator says phone support is Max only; conflict noted), iOS and Android app, business and consumer financing access, offline viewing, "AI team members", English and Spanish app, 30,000+ Pro community.
- Promotions on the page: Basic and Essentials $26/mo for the first month; Max $99/mo for 3 months.

### 2.2 Feature inventory

| Feature | What the user can do | Notable details and limits | Tier | Source | O/I |
|---|---|---|---|---|---|
| **Lead and request intake** | | | | | |
| Online booking | Custom services with descriptions and images; pricing pulled from the Price Book and updated as the customer picks services; slots shown from team schedule, service area and job duration; trade-specific setups (HVAC, Cleaning, Handyman, Electrical, Plumbing, All Trades); share link or embed on website, social, email signature and campaigns; Reserve with Google from Search and Maps; deposits or payments collected upfront; booked jobs route to the Dispatch POC or directly to a tech | Confirmation message to the customer not described on the page | Basic | https://www.housecallpro.com/features/online-booking/ ; roles article | OBSERVED |
| Pipeline | Kanban board of leads, estimates and jobs; drag to change stage; automated texts and emails with custom wording per stage; AI-written follow-up messages; industry intake guides; Jobs Dashboard | Stage names not published; add-on with price not confirmed | Add-on | https://www.housecallpro.com/features/pipeline/ ; pricing page | OBSERVED |
| Voice (phone) | VoIP shared business number; hide personal lines; call tracking numbers and lead-source attribution; call recording, notes and history in a call log; IVR menu, queues, routing, live transfer to next available tech; voicemail greetings and hold music; incoming call screen shows Do Not Service flag or outstanding balance | Missed call text back not mentioned; add-on, price not published | Add-on | https://www.housecallpro.com/features/voice-solutions/ | OBSERVED |
| Google Local Services Ads | Appear in Google LSA with bookable ads | | n/c | https://www.housecallpro.com/features/ | OBSERVED |
| HCP Assist | Human call answering service that books into your account | | Add-on | features index | OBSERVED |
| Lead sources | Jobs filterable by lead source in reports; call tracking attributes leads | | Basic (reports) | reporting page ; voice page | OBSERVED |
| **Quotes and estimates** | | | | | |
| Estimates | Create with AI; customisable templates; pre-built service options; logo and branding; send by text or email; collect customer signature on desktop or mobile; change orders and extra work priced on site; estimate on an ongoing job for change orders or diagnostics; approved estimate converts to a job without re-entry | Deposits and photo attachments on estimates not mentioned on the page (deposits are mentioned on the booking page) | Basic | https://www.housecallpro.com/features/estimating-software/ | OBSERVED |
| Good / better / best (Sales Proposal Tool) | Tiered options from pre-built templates; mobile side-by-side comparison; save proposals as templates; offer financing inside the proposal; copy the approved option to the job | $40/mo on Basic and Essentials, included on Max | Add-on / Max | estimating page ; pricing page | OBSERVED |
| Price book and flat rate | Import or build a price book; attach images and descriptions to line items; compare your prices with similar businesses from platform job data; Profit Rhino pre-built flat-rate pricing that factors overhead, labour and materials | Flat-rate pricing is Essentials | Basic (price book), Essentials (flat rate) | estimating page ; pricing page | OBSERVED |
| Estimate follow-up automation | Via Pipeline stage automations and Campaigns | Not a toggle on estimates themselves as far as pages show | Add-on | pipeline page | INFERRED |
| **Scheduling and dispatch** | | | | | |
| Calendar and dispatch | One-time and recurring jobs; drag-and-drop calendar; shared dispatch calendar for one truck or whole crew; move jobs between techs mid-day; techs notified; auto-send the right tech | | Basic | https://www.housecallpro.com/features/ ; route page | OBSERVED |
| Arrival windows | Set an arrival window per job; lock stops with confirmed windows and let the rest of the route rebuild | | Basic (INFERRED) | https://www.housecallpro.com/features/route-optimization-software/ | OBSERVED (feature), INFERRED (tier) |
| Routes and route optimisation | Territories; closest available tech; reorder each tech's day by real drive time and live traffic | "Routes" at Essentials, "Route optimisation" at Max | Essentials / Max | route page ; pricing page | OBSERVED |
| GPS | Employee GPS via phones within business hours (Essentials); Vehicle GPS via plug-in device powered by Force Fleet Tracking with live map and trip history (add-on); live location link inside On My Way text when vehicle GPS is added; dashcams | | Essentials / Add-on | route page ; pricing page | OBSERVED |
| On My Way text | Text only, sent when the tech taps On My Way; editable text on plans with custom text; per-job opt out | Not sent by email | Basic | https://help.housecallpro.com/en/articles/357613-customer-notifications-overview | OBSERVED |
| Checklists | Custom job checklists; "checklist automations" | Essentials | Essentials | features index ; pricing page | OBSERVED |
| Photos | Photo reports and annotations | Essentials | Essentials | pricing page | OBSERVED |
| Property profiles | Service history and equipment tracked per property | | n/c | features index | OBSERVED |
| Time tracking | Clock in and out from a dashboard widget; travel vs job time via On my way, Start job, Pause, Finish; admins view and adjust timesheets in real time; hours sync to Housecall Pro Payroll | Timesheet approval workflow and GPS stamps not described; payroll sync on "select plans"; time tracking enabled via in-app App Store | n/c | https://www.housecallpro.com/features/time-tracking/ | OBSERVED |
| Job costing | Track job costs and profitability; job cost and profit in Job Reports; permission "See job costing margins" | Basic per pricing page | Basic | pricing page ; reporting page ; roles article | OBSERVED |
| Commissions | Commission tracking | Essentials | Essentials | pricing page | OBSERVED |
| **Customer portal** | | | | | |
| Customer portal | Book, cancel or reschedule; see upcoming and past appointments; approve estimates or request changes with history; view and pay invoices by card or bank; send referral links by text or email | Saved payment methods and service plans not mentioned on the portal page (cards on file are on the payments page) | Basic (INFERRED) | https://www.housecallpro.com/features/customer-portal/ | OBSERVED |
| **Communication** | | | | | |
| Automated customer notifications | Job or estimate scheduled (text and email, re-sent on time or tech change); On My Way (text); Job or estimate finished (text); Review request (email and text, needs Reviews app); payment receipt; marketing campaign messages. Per-customer "Send notifications" toggle | Texts require Text Messaging set up; mobile-only customers get texts only, email-only get email only; no landline texts; cannot turn off for all customers at once | Basic | https://help.housecallpro.com/en/articles/357613-customer-notifications-overview | OBSERVED |
| Two-way chat / SMS | In-app chat with customers; customer replies to automated texts land with the Dispatch/Messaging POC; "Allow user to chat with customers" permission | Only one employee can be the POC | Basic | features index ; https://help.housecallpro.com/en/articles/1073431-employee-roles-permissions-explained | OBSERVED |
| Review management | Automatic requests after job or payment, AI-personalised, with automatic follow-ups to non-responders; Google and Facebook reviews in one dashboard; respond from dashboard; alerts on new reviews | AI drafting of replies not stated | Basic | https://www.housecallpro.com/features/review-management-software/ ; pricing page | OBSERVED |
| Missed call text back | Not found on Voice or CSR AI pages | | n/c | voice page | not confirmed |
| **Money** | | | | | |
| Invoicing | Digital invoices with payment links; automatic reminders; QuickBooks integration | Batch and progress invoicing not confirmed on pages fetched | Basic | features index ; payment page | OBSERVED |
| Payments | Card online, in field or by phone; Tap to Pay on Mobile and card reader; ACH (1%); Instapay about 30 minutes vs 2 business days; cards stored on file and charged at job completion; tips if enabled; mobile check deposit free, 1 to 4 days; card from 2.59% | Chargebacks not described; a Trustpilot complaint says disputes are decided by the issuing bank | Basic | https://www.housecallpro.com/features/payment/ | OBSERVED |
| Consumer financing | Wisetack lending partners, 0% to 35.9% APR, business paid in full at completion | | Basic | payment page | OBSERVED |
| Recurring service plans (memberships) | Monthly, quarterly or annual billing; plan defines visit frequency and recurring jobs are generated automatically; perks like priority scheduling and discounts; customers renew or upgrade online; automated renewals and service reminders; service plan revenue dashboard | Max tier | Max | https://www.housecallpro.com/features/recurring-service-plans/ ; pricing page | OBSERVED |
| QuickBooks | QuickBooks Online and Desktop; invoices, customers, line items, services and payments push to QuickBooks; import existing QB data; duplicate prevention | Essentials for QBO per pricing page; QB page says not included in subscription (treated as paid connector) | Essentials | https://www.housecallpro.com/features/quickbooks/ ; pricing page | OBSERVED |
| Business finance | Business financing, expense cards, Payroll and Accounting services | Add-ons | Add-on | features index ; pricing page | OBSERVED |
| **Marketing** | | | | | |
| Campaigns (Marketing Center) | Email, SMS and postcards from one dashboard; automated campaigns on triggers tied to customer activity, service history or time of year (reminders, follow-ups, seasonal, reactivation); AI-built content; audiences by service history, activity and timing; Suggested Campaigns; results tracked in Marketing Center | US only; add-on, price not published | Add-on | https://www.housecallpro.com/features/campaigns/ | OBSERVED |
| Postcards | Automated postcard offers | | Add-on | features index | OBSERVED |
| Websites | Expert-managed website with booking form embedded | Add-on | Add-on | online booking page ; pricing page | OBSERVED |
| Referrals | Customer shares referral links from the portal for rewards | | Basic (INFERRED) | customer portal page | OBSERVED |
| **Automation** | | | | | |
| Automations | Pre-set notification automations (above); Pipeline stage automations; Campaign triggers; checklist automations; recurring job generation from service plans | No general-purpose trigger / condition / action builder found on official pages | Mixed | notifications article ; pipeline page ; campaigns page | OBSERVED |
| API and Zapier | Open API on Max; Zapier listed via partners | | Max | pricing page | OBSERVED |
| **Reporting** | | | | | |
| Reports | Business Insights with industry benchmarks and revenue and job-count goals; Job Reports (completed, scheduled, cancelled, ratings, job types, tech performance, job cost and profit; filter by status, customer, lead source); Invoice Reports (open, closed, past due, Aging); report types for tech performance, admin tasks, estimates, leads, service plans, invoices, payments; share a report by email | "Advanced Reporting" permission is Max | Basic / Max (advanced) | https://www.housecallpro.com/features/advanced-reporting/ ; roles article | OBSERVED |
| **Team** | | | | | |
| Roles | Admin/Owner (full); Office Staff with toggles (view and edit pay details, update account info, Marketing Center campaigns, postcard campaigns, reporting incl. Advanced on Max, Dispatch/Messaging POC, chat with customers, job costing margins, Pipeline, online booking availability); Field Tech, mobile only, with toggles (add/edit jobs, delete/cancel, take payments and see prices, mobile check deposit, see customer phone and email, see and edit customer database, update account info, online booking availability, show next job only vs full schedule, edit invoice message, show home data, job costing margins) | Field techs who need the company-wide schedule must be made Office Staff, which then exposes all jobs and pricing (a known gap) | All | https://help.housecallpro.com/en/articles/1073431-employee-roles-permissions-explained | OBSERVED |
| Mobile app | iOS and Android; English and Spanish; offline viewing | | All | pricing page | OBSERVED |
| Payroll | Housecall Pro Payroll add-on fed by time tracking | Export to third-party payroll not described | Add-on | time tracking page ; pricing page | OBSERVED |
| **AI** | | | | | |
| CSR AI | Answers phone calls and website chats (texts in alpha / coming soon); books jobs from business hours, services, availability, pricing and service area; uses existing customer data; escalates to a chosen number or an HCP Assist rep when a human is requested; call summaries, booking details and customer info in call log on web and mobile; configurable greeting, hours, scripts, voice, and whether it discloses it is AI | Chat included in all plans; 24/7 call answering sold separately, price not published; full transcripts not stated | All (chat) / Add-on (calls) | https://www.housecallpro.com/features/ai-team/csr-ai/ ; https://www.housecallpro.com/features/ai-team/ | OBSERVED |
| Analyst AI | Natural-language questions over jobs and business data; revenue, job trends, team performance; generates custom reports | Included in all plans | All | ai-team page ; reporting page | OBSERVED |
| Coach AI | Personalised recommendations on growth, pricing and hiring | Included in all plans | All | ai-team page | OBSERVED |
| Marketing AI | Drafts emails, campaigns and service descriptions from an idea | Included in all plans | All | ai-team page | OBSERVED |
| Help AI | Always-on product help | Included in all plans | All | ai-team page | OBSERVED |
| AI in estimates and reviews | Create estimates with AI; AI-personalised review requests; AI-written Pipeline follow-ups | | Basic / Add-on | estimating page ; review page ; pipeline page | OBSERVED |

---

## 3. ServiceTitan (servicetitan.com), lighter pass

Positioning: enterprise-grade platform for residential and commercial trades, priced per technician, quote only, with a core product plus paid "Pro" products powered by Titan Intelligence.

### 3.1 Pricing (OBSERVED, source: https://www.servicetitan.com/pricing)

| Package | Includes |
|---|---|
| Starter | Dispatching, scheduling, call booking, invoicing, pricebook |
| Essentials | Starter plus mobile estimates and payroll management |
| The Works | Essentials plus configurable payroll, advanced reporting, commission tracking, customisable memberships |

- All three are "Request Pricing". Per-technician pricing is stated; minimums, contract terms and implementation fees are not published. Third-party reviews cite $250+ per month entry, $500 to $700 per month floors for small teams and $5,000 to $10,000 implementation fees; none confirmed by a primary source.

### 3.2 Feature inventory

| Feature | What the user can do | Notable details and limits | Tier | Source | O/I |
|---|---|---|---|---|---|
| Call booking and phones | Web, chat and call booking; call tracking shows which marketing drives calls and revenue; calls linked to jobs; one inbox across offices | Contact Center Pro is the paid upgrade | Core / Pro | https://www.servicetitan.com/features ; https://www.servicetitan.com/features/pro/contact-center | OBSERVED |
| Online booking (Scheduling Pro) | 24/7 booking on the contractor's website aligned to dispatch rules, availability and job types | Pro product | Pro | https://www.servicetitan.com/features/pro | OBSERVED |
| CRM and sales | Pipeline management, deal tracking, quotes and proposals, Sales Plays, sales insights; Convex sales intelligence for commercial prospecting | Commercial-oriented | Core / add-on | features page | OBSERVED |
| Estimates and pricebook | Build, present and sell estimates in real time on mobile; customisable pricebook; Pricebook Pro adds managed pricebook content, pricing strategies and Price Insights comparing your prices with regional averages | Mobile estimates start at Essentials | Essentials / Pro | features page ; titan-intelligence page | OBSERVED |
| Scheduling and dispatch | Dispatch board; assign techs; Dispatch Pro recommends assignments using predicted job value and recent technician performance (vendor claim: 10% less drive time) | Dispatch Pro is a Pro product | Core / Pro | features page ; titan-intelligence page | OBSERVED |
| Work orders and field | Service tasking guides techs through services and materials; Field Findings capture issues and upsells; digital forms; timekeeping and timesheets (work and idle time); equipment management with warranties and history; equipment nameplate scanning; Atlas AI assistant troubleshoots equipment, finds parts and pulls manuals | | Core / Pro | features page | OBSERVED |
| Field Pro (formerly Sales Pro) | Pre-job prep, AI-guided diagnostics, automatic call recording of the in-home visit, post-job coaching | Pro | Pro | pro page | OBSERVED |
| Customer portal | View equipment, pay invoices, schedule service | | Core | features page | OBSERVED |
| Communication | Two-way SMS; automated alerts to teams; tech tracking shared with customers | | Core | features page | OBSERVED |
| Memberships / service agreements | Set up, track, manage and renew memberships; automate recurring service contracts and renewals; multi-party billing for complex accounts, locations or tenants | Customisable memberships at The Works; memberships page 404 at research time | The Works | pricing page ; features page | OBSERVED |
| Money | Invoicing; payments; integrated financing; progress billing with pay applications (construction); job costing with real-time labour, materials and profit; AR/AP; purchase orders and inventory with three-way matching; QuickBooks export of invoices, payments and bills; ERP integrations; Invoice Summary Generator and Invoice Email Generator (AI) | | Core / The Works | features page ; titan-intelligence page | OBSERVED |
| Marketing Pro | Automated targeted campaigns; Ads Optimizer sends audience and revenue data to Google Ads; Review Response Generator | Pro | Pro | titan-intelligence page ; pro page | OBSERVED |
| Reporting | Custom reports and dashboards; advanced reporting at The Works; quarterly Benchmark Report vs similar businesses | | Core / The Works | features page ; titan-intelligence page | OBSERVED |
| Payroll and commissions | Payroll management (Essentials), configurable payroll and commission tracking (The Works); Fleet Pro automates payroll reconciliation from GPS | | Essentials / The Works | pricing page ; pro page | OBSERVED |
| Fleet Pro | GPS and job data for vehicle maintenance; Risky Driver Detection alerts (distracted driving, phone use) | Pro | Pro | titan-intelligence page | OBSERVED |
| Titan Intelligence (AI) | Atlas assistant (tasks, insights, actions); Second Chance Leads flags unbooked calls worth a callback (vendor: 37% recaptured); Job Value Predictor; AI Virtual Agent answers overflow and after-hours calls and texts, books against real capacity, confirms and reschedules, escalates to a human; AI Manager Assist with call summaries and sentiment; Price Insights; Ads Optimizer; Review Response Generator; Invoice Summary and Invoice Email generators; Benchmark Report. Coming: Integration Errors Assistant, Automated Invoice Capture, Automated Proposal Templates, Audience Assistant, Email Content Generator, GPS Enabled Timesheets, TI Chat Assistant | AI Virtual Agent available standalone or inside Contact Center Pro; Contact Center Pro in early access, omni-channel inbox "coming soon"; no prices | Pro | https://www.servicetitan.com/features/titan-intelligence ; contact-center page | OBSERVED |
| API and integrations | Public API; pre-built partner integrations incl. accounting | | Core | features page | OBSERVED |

---

## 4. Workiz (workiz.com), lighter pass

### 4.1 Pricing (OBSERVED, source: https://www.workiz.com/pricing/)

| Plan | Adds | Automations cap |
|---|---|---|
| Standard | Scheduling, invoices, jobs, estimates, online payments, service areas, built-in reports, client management, custom fields, subcontractor management, QuickBooks | 5 |
| Pro | Multi-location, roles and permissions, On my way Plus, Genius Leads, Genius Scheduling, performance pay, custom reports | 10 |
| Ultimate (most popular) | Flat rate, multi-day jobs, sales proposals, checklists, inventory, franchise management, custom documents, tasks, service plans, purchase orders, equipment tracking, Open API, Zapier | 30 |

- All prices are "Request pricing"; user caps and extra-user price not published. Annual billing "saves $400+". 7-day free trial, no card. Capterra pricing page returned 403, so no third-party price is confirmed.
- Included in every tier: unlimited jobs, invoices, estimates and clients; local phone number; recurring jobs; client portal; price book; SEO report tool; mobile app; online booking; On my way; custom fields; subcontractors; QuickBooks sync; fleet and team location tracking; service areas; lead tracking; Workiz Pay (online payments, deposits, financing, tap to pay, Workiz Charge Card); card readers extra.
- Add-ons without published prices: Genius Phone (phone system, call insights, smart messaging, ad tracking, 2-way texting, call flows, call masking, free 10DLC registration), Genius Answering (AI, English, Spanish, French, live transfers, custom Q&A), Genius Marketing (blast and automated email and SMS, workflows, AI writer and designers, templates, reputation manager). The page contradicts itself on whether the phone system is built in or sold separately.

### 4.2 Feature inventory

| Feature | What the user can do | Notable details and limits | Tier | Source | O/I |
|---|---|---|---|---|---|
| Lead intake | Online booking widget; Reserve with Google; Angi and Thumbtack leads flow in; Genius Leads parses lead emails (website forms, warranty requests, lead providers) into leads with mapped fields; ad and source tracking; lead tracking | Genius Leads is Pro | Standard / Pro | https://www.workiz.com/features/ ; pricing page | OBSERVED |
| Phone (Genius Phone) | Local number; call routing and flows; call recording and tags; call masking so techs' personal numbers stay hidden; two-way texting; AI call summaries and dispatcher insights; Smart Messaging drafts replies from customer history | Add-on per comparison table | Add-on (conflict noted) | features page ; pricing page | OBSERVED |
| Estimates and proposals | Estimates; good, better, best sales proposals; customer signs online in portal | Sales proposals are Ultimate | Standard / Ultimate | features page ; pricing page | OBSERVED |
| Price book and flat rate | Build or use prebuilt flat-rate catalogs | Flat rate is Ultimate | Standard / Ultimate | features page | OBSERVED |
| Scheduling and dispatch | Drag-and-drop board assigning by availability, service area and skill; recurring jobs; multi-day jobs with checklists (Ultimate); service areas drawn on a map per tech or company; real-time tech and truck location to dispatch the nearest; Genius Scheduling suggests best time and tech using availability, route and schedule (Pro) | | Standard / Pro / Ultimate | features page ; pricing page | OBSERVED |
| On my way | Notifies client and office when tech is en route, with tech photo and bio; "On my way Plus" on Pro | | Standard / Pro | features page ; pricing page | OBSERVED |
| Checklists, custom fields, custom documents, tasks | Step-by-step checklists per job type (Ultimate); custom job and client fields (all); custom documents and tasks (Ultimate) | | Standard / Ultimate | pricing page | OBSERVED |
| Equipment, inventory, purchase orders | Serial numbers, photos, warranties and service history for client equipment; stock tracking with low-inventory alerts; vendor POs linked to price book and jobs | All Ultimate | Ultimate | features page ; pricing page | OBSERVED |
| Client portal | Secure link by text or email, no login or app; view and approve estimates and proposals and sign; pay invoices and deposits by card, ACH, Google Pay, Apple Pay or financing; pay several services at once; view upcoming and past appointments; book new; job, service and payment history; documents, pictures and service plans; business branding; owner controls what each client can see | | All | https://www.workiz.com/features/client-portal/ | OBSERVED |
| Money | Full or partial payments online or in field; deposits; tap to pay and card readers; consumer financing (Sunbit, Wisetack integrations); tipping in field or portal with splitting and reporting; expense management with receipts tied to jobs; Workiz expense card; QuickBooks Online; performance pay and commission management (Pro) | Processing fees not published | Standard / Pro | features page ; pricing page | OBSERVED |
| Service plans | Sell recurring equipment maintenance plans | Ultimate | Ultimate | features page ; pricing page | OBSERVED |
| Automations | "When this happens, do that" rules: appointment reminders, estimate follow-ups, payment-due alerts, overdue-invoice alerts to office managers, technician reminders; SMS to clients and notifications to staff | Hard caps: 5 / 10 / 30 automations by plan | Standard (5) | https://www.workiz.com/features/automations/ ; pricing page | OBSERVED |
| Marketing (Genius Marketing) | Blast and automated email and SMS campaigns triggered by Workiz data; AI writer and designer; industry templates; reputation manager; track jobs generated | Add-on | Add-on | features page ; pricing page | OBSERVED |
| Reporting | Built-in reports; dashboards; custom reports (Pro) | | Standard / Pro | pricing page | OBSERVED |
| Team | Roles and permissions (Pro); "advanced restrictions" and restrict a user to assigned jobs (all); subcontractors on jobs; multi-location and franchise management; team and fleet location tracking | | Standard / Pro / Ultimate | pricing page ; https://help.workiz.com/hc/en-us/articles/18055840325521-Restricting-a-user-to-assigned-jobs | OBSERVED |
| AI (Genius) | Genius Answering: AI dispatcher "Jessica" answers calls and inbox messages, learns from the account without manual training, books or reschedules, saves bookings as jobs or leads, captures leads from calls that end early and alerts the team, tells out-of-area callers to leave a message, live transfers, custom Q&A, English, Spanish, French; Genius Leads; Genius Scheduling; AI call insights; Smart Messaging; Genius Marketing AI writer | A third-party blog says Genius Answering plans include a monthly set of AI conversations; not confirmed (help centre blocked) | Add-on / Pro | features page ; https://help.workiz.com/hc/en-us/articles/22777577796241 (via search summary) | OBSERVED (features), caps n/c |

---

## 5. Common core across these products

Every one of the four ships the same spine, in the same order the money flows:

1. Request or lead -> estimate or quote -> job (with one or many visits) -> invoice -> payment, with one-click conversion at each step and a status on each object.
2. A client record that owns properties (service addresses), equipment (in the heavier products), jobs, quotes, invoices, payments, and the full message history.
3. A calendar with drag and drop, team assignment, recurring jobs, and a mobile app for the technician that shows the day's visits, notes, photos, checklists, timers and lets them take payment.
4. Automated customer messages at fixed life-cycle points: appointment scheduled, reminder, on my way, finished, invoice sent, payment reminder, review request.
5. A customer-facing portal reached by link (no password in Workiz, Jobber and Housecall Pro) where the customer approves, pays, books and sees history.
6. Integrated payments with card, ACH, tap to pay, saved payment methods, deposits, tips and consumer financing (Wisetack is the common partner), plus QuickBooks sync.
7. Price book or line-item catalog with cost and markup, feeding job costing.
8. Reports on revenue, jobs, invoices and aging, technician performance; AI question-answering over the same data in all four.
9. An AI phone answerer that books jobs from the booking settings (Jobber Receptionist, Housecall Pro CSR AI, ServiceTitan AI Virtual Agent, Workiz Genius Answering), all priced as add-ons.
10. Role presets plus a long list of per-area toggles, with "can see prices" as the single most important switch.

## 6. What is specific to field service (the module content)

These are the objects and behaviours that do not exist in a salon, a clinic or a restaurant and therefore belong in the field-service module:

- **Property as a first-class entity under the client.** One client, many service addresses; equipment, access notes, photos and history hang off the property, not the person. Housecall Pro "property profiles", Workiz and ServiceTitan "equipment tracking" with serial, warranty and service history.
- **Request (assessment) before quote.** A work request with photos and an optional on-site assessment visit, tracked as overdue if no quote follows (Jobber Requests).
- **Quote with optional upsell lines or good / better / best tiers,** markup on materials and labour, deposits, payment schedule, photos and attachments, Home Depot or Profit Rhino style catalog, approval by link, change orders on an ongoing job.
- **Job vs visit model.** The job is the contract; visits are trips. Recurring jobs spawn visits; invoicing schedule is a job setting (per visit, monthly, at close, custom, progress); batch invoicing collects "requires invoicing" jobs per client.
- **Dispatch board and routing.** Assign by availability, skill, service area and drive time; crews as assignable units; route optimisation with locked stops and arrival windows; live tech and vehicle GPS; nearest-tech dispatch; multi-day jobs.
- **Arrival window and on-my-way.** Customer gets a window, then a tap-to-send on-my-way text with tech photo, bio and optional live location link.
- **Field execution.** Checklists and job forms per job type, before and after photos with annotation, equipment nameplate scan, time tracking by category (visit, travel, shop, break) with geofence auto start and stop, mobile payment and signature at the door.
- **Job costing.** Labour hours x rate, materials from price book, expenses with receipts, profit bar per job, profitability report.
- **Service plans and memberships.** Recurring billing monthly, quarterly or annual with included visits, priority scheduling, discounts, auto-generated visits, renewals.
- **Service area and territory.** Draw the area; booking and AI receptionist refuse or redirect out-of-area callers.
- **Trade catalogs.** Flat-rate price books by trade, parts and inventory, purchase orders (heavier products).
- **Subcontractors and crews** as assignees distinct from employees.
- **Consumer financing on the estimate** for big-ticket jobs (HVAC replacement, re-pipe).
- **Commissions and performance pay** for technicians who sell.

## 7. What they share with other business types

These map onto the shared platform layers (CRM, conversations, scheduling, marketing, money, automation):

- **CRM:** client record, tags, lead vs client, lead source, notes, files, activity feed, duplicate prevention, import and export.
- **Conversations:** two-way SMS and email on the client timeline, templates, business phone number with recording and routing, missed-call text back, AI answering and booking, message assignment to a point of contact.
- **Scheduling:** calendar views, drag and drop, availability per team member, buffers, lead time, online booking with services, durations and prices, confirmations and reminders, cancel and reschedule by the customer, waitlist (not seen here but common elsewhere).
- **Money:** invoices, payment links, saved methods, autopay, deposits, tips, refunds, instant payout, processing fees, QuickBooks sync, aging report, late reminders, memberships as recurring billing.
- **Marketing:** review requests and reputation dashboard, referral program with credits, email and SMS campaigns with segmentation and revenue attribution, Reserve with Google, Google LSA, website builder with intake form.
- **Automation:** life-cycle message toggles plus a trigger / condition / action builder with date-based triggers (X days after sent, approved, paid, due), status and tag conditions, and notify, tag, archive actions.
- **Reporting and AI:** dashboards, custom report builder, natural-language questions over business data, coaching, benchmarks vs peers, AI-drafted replies and campaigns.
- **Team:** role presets, per-area toggles, "see prices" switch, mobile-only roles, timesheets with approval, payroll handoff, audit log on edits.

## 8. Pain points users report (sourced; mostly secondhand because Reddit threads could not be opened)

Jobber
- Two-way SMS is gated behind Grow (about $299/mo monthly for 5 users); several buyer guides note that people assume the $49 Core plan includes texting and it does not. Sources: https://www.getjobber.com/pricing/ (OBSERVED tier); https://myquoteiq.com/best-two-way-texting-software-plumbing-2026/ and https://fieldcamp.ai/reviews/jobber/ (secondhand).
- Per-user pricing ($29 per extra user) plus add-ons (Marketing Suite $99, Pipeline $49, Receptionist $29) make the working price far above the sticker; reviewers say 20+ tech shops outgrow it. Sources: pricing page (OBSERVED); https://contractortoolstack.com/software/jobber/ and https://nuacom.com/comprehensive-jobber-review/ (secondhand).
- Reported texting friction: cannot text from desktop, must have messaged a client before texting them. Source: https://serviceagent.ai/blogs/getjobber-review/ (secondhand, not confirmed on official pages).
- Automatic payments attempt once and never retry; owner must chase failures manually. Source: https://help.getjobber.com/en/articles/automatic-payments/ (OBSERVED).
- Progress invoicing not available on recurring jobs or combined invoices. Source: https://help.getjobber.com/hc/en-us/articles/26297232277527 (OBSERVED).
- Custom automations only trigger on quote and invoice dates, not on job or visit events. Source: https://help.getjobber.com/en/articles/custom-automation-builder/ (OBSERVED).
- Automatic time tracking occasionally inflates hours; recurring-plan customers cannot tip; weak plumbing catalogs and warranty tracking. Sources: https://fieldcamp.ai/reviews/jobber/ and https://buildbite.com/insights/jobber-pricing-and-feature-review (secondhand).

Housecall Pro
- Add-on creep: Pipeline, Sales Proposals ($40), Voice, Campaigns, QuickBooks ("not included in your subscription") push a $189 plan past $300; Trustpilot visible complaint: "lots of add on fees". Sources: https://www.housecallpro.com/pricing/ and https://www.housecallpro.com/features/quickbooks/ (OBSERVED); https://www.trustpilot.com/review/housecallpro.com (3 out of 5 TrustScore).
- Support: aggregator reports phone support only on Max despite the pricing page claiming live phone support on all plans; Trustpilot reviewers cite unresponsive staff and unresolved billing. Sources: https://checkthat.ai/brands/housecall-pro/reviews ; Trustpilot.
- Permissions gap: a field tech who needs the company schedule must become Office Staff and then sees all jobs and pricing. Source: https://help.housecallpro.com/en/articles/1073431-employee-roles-permissions-explained (OBSERVED).
- Chargebacks resolved by the issuing bank with refund taken from the business. Source: Trustpilot (single review, secondhand).
- Only one Dispatch/Messaging POC can receive customer text replies. Source: roles article (OBSERVED).

ServiceTitan
- Cost and commitment: annual contracts, per-tech pricing not published, third parties cite $500 to $700 per month floors and $5,000 to $10,000 implementation; 2 to 4 month implementations; teams under 10 to 15 people find it too complex. Sources: https://www.getonecrew.com/post/servicetitan-reviews ; https://schedulingkit.com/pros-and-cons/servicetitan-pros-and-cons ; https://www.capterra.com/p/150053/ServiceTitan/ (reviews cite long support waits and rotating success managers). All secondhand or review-site.

Workiz
- Billing surprises, annual contracts, hard cancellations, BBB complaints; roughly six account managers in one year for one reviewer; intermittent Genius Phone failures; calling not in the entry plan. Sources: https://www.capterra.com/p/147525/Workiz/reviews/ ; https://www.softwareadvice.com/field-service/workiz-profile/reviews (review-site).
- Hard caps on automations (5 / 10 / 30) and most trade features (flat rate, checklists, inventory, service plans) locked to Ultimate. Source: https://www.workiz.com/pricing/ (OBSERVED).

Cross-cutting
- Every vendor hides the AI answering price and sells it separately; every vendor's "included AI" is chat and reporting, while the phone agent is the paid piece.
- Opaque or quote-only pricing (ServiceTitan, Workiz) is itself a listed complaint.

## 9. What this tells us a template must have

1. The five-object spine with one-click conversion and status on each: Request -> Quote -> Job -> Visit(s) -> Invoice -> Payment. Build it once in the shared layer; field service adds Property and Equipment under Client and Visit under Job.
2. Property as a first-class record under the client (many addresses, access notes, photos, equipment with serial and warranty, service history). Salons and clinics will not use it; the module turns it on.
3. Quote engine with optional line items and good / better / best tiers, cost plus markup per line, photos and attachments, deposit, payment schedule (percent or fixed), approval and signature by link, change orders on an open job, and consumer-financing slot. Follow-up is an automation, not a toggle buried in the quote.
4. Job vs visit model with recurring schedules, per-job invoicing rule (per visit, monthly, at close, custom, progress), batch invoicing of "requires invoicing" jobs grouped per client, and autopay on saved methods with retries (Jobber does not retry; we should).
5. Dispatch board: day, week, month, map and list; drag and drop; assign to person, crew or subcontractor; skill and service-area aware suggestions; drive-time aware slot suggestions; route optimisation with locked stops; live location.
6. Arrival windows and on-my-way with tech photo and ETA link, plus the standard scheduled, reminder, finished, receipt and review-request messages, each with per-customer opt-out and SMS or email fallback based on what contact data exists.
7. Field execution on mobile: checklists and forms per job type, before and after photos with annotation, time tracking by category with geofence auto start and stop, signature and payment at the door, offline read.
8. Job costing out of the box: labour from timers x rate, materials from the price book, expenses with receipts, profit per job, profitability report. Make "see prices and costs" the headline permission switch.
9. Memberships and service plans as a shared "recurring billing with included visits" primitive (monthly, quarterly, annual; priority scheduling; discounts; auto-created visits; renewal reminders).
10. Customer portal by magic link, no password: approve or request changes, pay and tip, save a method, book, reschedule, cancel, see history, documents and photos, refer a friend. Owner controls what each client sees.
11. Two-way SMS and email on the client timeline from day one and on every plan, with a business number, templates, message assignment, call recording and missed-call text back. Gating texting behind a top tier is the single most cited Jobber complaint.
12. AI receptionist that books from the same booking settings the website uses, recognises returning callers, creates a request or task when it cannot book, escalates on keywords, texts back hang-ups, and leaves summary, transcript and recording on the client record. Price it transparently.
13. AI over the data: natural-language questions and custom reports, AI-drafted replies, review responses and campaigns, coaching and benchmarks. All four vendors include this on every plan; it is table stakes, not a differentiator.
14. Automation builder with event triggers (quote sent, approved, job completed, visit finished, invoice due, paid, membership renewing, review received) plus date offsets, conditions on status, tag and line item, and actions across channels (text, email, tag, task, status change, notify staff). Ship the seven Jobber templates and the Housecall Pro life-cycle toggles as presets. No hard caps on the number of automations.
15. Review requests, referral credits, campaigns with segmentation and revenue attribution, Reserve with Google and a website with an intake form in the shared marketing layer; the field module only contributes the trigger points (job closed, invoice paid).
16. Role presets modelled on Jobber's four (Field crew, Senior field crew, Crew lead, Manager) plus Admin, with per-area toggles and a mobile-only crew role that can still see the shared calendar without seeing prices (closes the Housecall Pro gap).
17. Timesheets with approval, audit log and a payroll handoff (export plus a connector), and commission or performance-pay rules for techs who sell.
18. Transparent pricing with no per-user ambush: publish extra-user cost, publish AI answering cost, and do not lock core trade features (flat rate, checklists, service plans) to the top tier.
19. QuickBooks Online sync of customers, invoices, payments and line items included rather than sold as a connector.
20. Trade-aware onboarding presets (HVAC, plumbing, electrical, cleaning, landscaping, handyman): sample price book, checklists, booking services and message templates, following Housecall Pro's trade-specific booking setups.

---

## Appendix A. Items not confirmed

- Jobber: job form field types and PDF to client (help article 404); Pipeline stages (feature page 404); arrival windows; dedicated SMS number; payroll exports beyond Excel; which plan gates route optimisation; storage cap below Plus; desktop texting limits claimed by third parties.
- Housecall Pro: extra-user price on Basic and Essentials; prices of CSR AI, Pipeline, Voice, Campaigns; batch and progress invoicing; missed-call text back; timesheet approval; chargeback process.
- ServiceTitan: any price, minimum tech count, implementation fee; memberships page 404; Phones Pro vs Contact Center Pro naming.
- Workiz: any price; user caps; processing fees; Genius Answering conversation caps; whether the phone system is included or an add-on (pricing page contradicts itself).
- Reddit: no primary thread could be opened; all Reddit-attributed complaints come from review blogs and search summaries.

## Appendix B. Sources used

Official
- https://www.getjobber.com/pricing/
- https://www.getjobber.com/features/
- https://www.getjobber.com/features/quotes/
- https://www.getjobber.com/features/client-hub/
- https://www.getjobber.com/features/scheduling/
- https://www.getjobber.com/features/online-booking/
- https://www.getjobber.com/features/customer-communication-management/
- https://www.getjobber.com/features/marketing-tools/
- https://www.getjobber.com/features/ai-receptionist/
- https://www.getjobber.com/features/field-service-reporting/
- https://help.getjobber.com/en/articles/custom-automation-builder/
- https://help.getjobber.com/hc/en-us/articles/115009568687 (user permissions)
- https://help.getjobber.com/en/articles/jobber-ai-voice-and-chat-beta/
- https://help.getjobber.com/hc/en-us/articles/26297232277527 (progress invoicing)
- https://help.getjobber.com/en/articles/timesheets/
- https://help.getjobber.com/en/articles/automatic-payments/
- https://help.getjobber.com/en/articles/batch-create-invoices/
- https://help.getjobber.com/hc/en-us/articles/115009542848 (recurring jobs)
- https://www.housecallpro.com/pricing/
- https://www.housecallpro.com/features/
- https://www.housecallpro.com/features/estimating-software/
- https://www.housecallpro.com/features/customer-portal/
- https://www.housecallpro.com/features/ai-team/
- https://www.housecallpro.com/features/ai-team/csr-ai/
- https://www.housecallpro.com/features/pipeline/
- https://www.housecallpro.com/features/payment/
- https://www.housecallpro.com/features/advanced-reporting/
- https://www.housecallpro.com/features/campaigns/
- https://www.housecallpro.com/features/recurring-service-plans/
- https://www.housecallpro.com/features/voice-solutions/
- https://www.housecallpro.com/features/route-optimization-software/
- https://www.housecallpro.com/features/time-tracking/
- https://www.housecallpro.com/features/online-booking/
- https://www.housecallpro.com/features/review-management-software/
- https://www.housecallpro.com/features/quickbooks/
- https://help.housecallpro.com/en/articles/1073431-employee-roles-permissions-explained
- https://help.housecallpro.com/en/articles/357613-customer-notifications-overview
- https://www.servicetitan.com/pricing
- https://www.servicetitan.com/features
- https://www.servicetitan.com/features/titan-intelligence
- https://www.servicetitan.com/features/pro
- https://www.servicetitan.com/features/pro/contact-center
- https://www.workiz.com/pricing/
- https://www.workiz.com/features/
- https://www.workiz.com/features/automations/
- https://www.workiz.com/features/client-portal/
- https://help.workiz.com/hc/en-us/articles/22777577796241 (Genius AI overview, via search summary; direct fetch 403)
- https://help.workiz.com/hc/en-us/articles/30176041143697-Genius-Answering-FAQ (via search summary)
- https://help.workiz.com/hc/en-us/articles/18055840325521-Restricting-a-user-to-assigned-jobs

Third party (pain points and unconfirmed pricing)
- https://www.trustpilot.com/review/housecallpro.com
- https://checkthat.ai/brands/housecall-pro/reviews
- https://www.capterra.com/p/147525/Workiz/reviews/
- https://www.softwareadvice.com/field-service/workiz-profile/reviews
- https://www.capterra.com/p/150053/ServiceTitan/
- https://www.g2.com/products/servicetitan/reviews
- https://www.getonecrew.com/post/servicetitan-reviews
- https://schedulingkit.com/pros-and-cons/servicetitan-pros-and-cons
- https://contractortoolstack.com/software/jobber/
- https://fieldcamp.ai/reviews/jobber/
- https://nuacom.com/comprehensive-jobber-review/
- https://serviceagent.ai/blogs/getjobber-review/
- https://myquoteiq.com/best-two-way-texting-software-plumbing-2026/
- https://buildbite.com/insights/jobber-pricing-and-feature-review
- https://toarn.com/insights/servicetitan-ai
- https://contractortoolstack.com/software/servicetitan/
- https://sagnikbhattacharya.com/blog/workiz-genius-ai-hvac-plumbing-add-ons
- https://www.prnewswire.com/news-releases/jobber-launches-copilot-the-first-of-several-ai-powered-products-aimed-at-making-home-service-business-ownership-simpler-than-ever-before-302264047.html
