# All-in-one small business platforms: Keap, Thryv, Zoho (small business stack), HubSpot Starter Customer Platform

Research date: 2026-11-06. Scope: user-level feature inventory to inform a per-client all-in-one template (CRM, conversations, scheduling, marketing, money, automation on an AI agent runtime). HighLevel is inventoried separately in 01.

Method: official pricing pages, feature pages, help centers and release notes fetched directly; aggregator and review sites used only for pain points or where official pages were blocked. About 75 searches and fetches. Every row cites a URL and is labelled OBSERVED (read on an official vendor page) or INFERRED (official page implies it, or a secondary source states it). "Not confirmed" means no source confirmed the item in this pass.

Two structural facts that changed the picture:

1. Keap is now a Thryv product. help.keap.com redirects (HTTP 301) to thryv.zendesk.com and Keap help articles live at learn.thryv.com. Keap's own pricing page sells one plan ("Keap", starting at $320/mo, 2 users, mandatory implementation). Pro, Max and Ultimate are legacy editions still referenced in help articles and solution pages; they are recorded here where the official page still names them.
2. HubSpot Starter is a per-seat bundle of every hub at Starter tier, and the hard gates are automation (simple workflows only), channels (WhatsApp, SMS, calling-in-inbox, help desk require Professional) and branding.

---

## 1. Keap (keap.com; sold as one plan, legacy Pro / Max / Ultimate)

### 1.1 Pricing and caps

| Feature | What the user can do | Notable details and limits | Tier | Source | Label |
|---|---|---|---|---|---|
| Single plan | Buy one all-inclusive plan | "Starting at $320/mo", billed $3,195/year or monthly; 2 user licenses; contact count chosen on the page and priced in tiers; implementation services mandatory ("strategy consulting, data import, migration, and done-for-you setup"); $299 early termination fee on annual contracts; trial limited to 25 emails, no payments or texts | Keap | https://keap.com/pricing | OBSERVED |
| Extra users | Add seats | $39/month per additional user | Keap | https://keap.com/pricing | OBSERVED |
| Text marketing tiers | Buy message and minute bundles | Tier 1 included (500 messages, 100 minutes); Tier 2 $24 (1,000 / 300); Tier 3 $39 (2,500 / 500); Tier 4 $79 (5,000 / 800); Tier 5 $139 (10,000 / 1,000); Tier 6 $279 (25,000 / 2,000); overage $0.015 per message, $0.01 per minute; 500 extra texts for $6/mo; local number $10/mo | Keap | https://keap.com/pricing | OBSERVED |
| Legacy editions | Pro, Max, Ultimate | Help articles still say "Easy Automations are available on both the Keap Pro and Max editions"; solution pages say quotes and invoicing "require Keap Pro or Keap Max" and reporting hub is "Available in Keap Max and Ultimate"; third-party sites (Oct 2026) list Pro $249/mo, Max $349 to $399/mo, Ultimate custom, Pro 2 users, Max 3 users. Keap's own pricing page no longer shows them. | Legacy | https://learn.thryv.com/hc/en-us/articles/37879683734925-Easy-Automations-Overview ; https://keap.com/solutions/reporting ; https://toolradar.com/compare/keap-vs-listengage | INFERRED |
| Implementation packages | Pay for onboarding | Third-party reports $499 to $1,500 depending on package; one vendor-comparison site lists "Ignite $1,500 for 2 integrations, Scale $3,500 for 5". Official amounts: not confirmed. | Keap | https://www.getcreator.io/learn/keap-pricing-in-2026-what-you-actually-pay | INFERRED |

### 1.2 CRM

| Feature | What the user can do | Notable details and limits | Tier | Source | Label |
|---|---|---|---|---|---|
| Contacts and companies | Store contacts, company records, custom fields, tags, notes, tasks | Listed on pricing page: "Contact management, tags, lists and saved searches, tasks, notes, company records, custom fields, automation history, lead scoring, customizable dashboard" | Keap | https://keap.com/pricing | OBSERVED |
| Lists and saved searches | Segment by saved search | Saved searches are the segmentation primitive; tags drive automation and reports ("segment audiences with tags and run reports on those tags") | Keap | https://keap.com/pricing ; https://keap.com/solutions/reporting | OBSERVED |
| Lead scoring | Score contacts | Listed as included; historically Max-only per third parties | Keap | https://keap.com/pricing | OBSERVED |
| Duplicate handling | Merge duplicates | "duplicate contact merging" listed under Administrative | Keap | https://keap.com/pricing | OBSERVED |
| Import | Import contacts | Done-for-you data import is part of mandatory implementation; self-serve CSV import exists in product (help article titles reference it) | Keap | https://keap.com/pricing | OBSERVED |
| Email sync | Sync Gmail and Outlook | "Gmail and Outlook sync" | Keap | https://keap.com/pricing | OBSERVED |
| Automation history per contact | See which automations a contact has been through | "automation history" | Keap | https://keap.com/pricing | OBSERVED |
| Consent management | Opt-in and opt-out tracking | Text: "identify when a contact opted in or out" in reply inbox; email opt-in status is a contact attribute; GDPR-style consent fields: not confirmed | Keap | https://keap.com/solutions/messages | OBSERVED (text), not confirmed (email consent detail) |
| Roles | Default and custom roles | "default user roles, custom user roles and permissions" | Keap | https://keap.com/pricing | OBSERVED |
| Pipelines and deals | Multiple customizable pipelines, stage automation, tasks | "Create multiple, customizable pipelines that sync with Keap's CRM"; "trigger actions based on pipeline stages"; reports: "Deal conversions by stage", "Average deal duration", "Average time in stage", "Deal revenue forecasting" | Keap | https://keap.com/solutions/sales-pipeline | OBSERVED |
| Stage moves via automation | Automatically move deals between stages | Easy Automation can move a deal from one stage to another, choosing the pipeline when there are several | Keap | https://learn.thryv.com/hc/en-us/articles/37905058214925-Automatically-Move-Deals-Between-Pipeline-Stages-in-Keap | OBSERVED |
| My Day | Daily task and appointment view | "My Day", "task management", "employee reminders" | Keap | https://keap.com/pricing | OBSERVED |

### 1.3 Conversations

| Feature | What the user can do | Notable details and limits | Tier | Source | Label |
|---|---|---|---|---|---|
| Keap Business Line | Dedicated business number on your own phone for calls and 1:1 texts | "Receive calls and text messages to both your personal and business numbers from one phone"; custom voicemail; auto-replies for missed calls, outside availability, Do Not Disturb; snooze; caller ID shows contact name; toll-free by default, local number $10/mo; US and Canada; mobile app syncs with desktop | Keap | https://keap.com/solutions/keap-business-line ; https://keap.com/pricing | OBSERVED |
| Marketing Number vs Business Line | Two separate numbers | "The Keap Business Line is reserved for direct one-to-one communication with contacts"; a separate marketing number handles broadcast and automated texts | Keap | https://learn.thryv.com/hc/en-us/articles/37329607998093-Text-Message-Broadcast-Automation-FAQs | OBSERVED |
| Text replies inbox | Handle replies to broadcasts and automated texts as 1:1 threads | Managed in the "Keap Marketing Number inbox"; see which automation or broadcast started the thread; mark unread; replies "Available in Keap Pro and Keap Max" | Pro/Max (legacy wording) | https://keap.com/solutions/messages | OBSERVED |
| Email (1:1 and broadcast) | Send 1:1 emails and broadcasts | "email broadcasts and 1:1 emails, newsletters"; email deliverability dashboard | Keap | https://keap.com/pricing | OBSERVED |
| WhatsApp, social DMs, web chat | Native inbox channels | Not offered natively; not confirmed anywhere on official pages | n/a | https://keap.com/pricing | not confirmed |
| Call recording | Record Business Line calls | Not confirmed | n/a | https://keap.com/solutions/keap-business-line | not confirmed |
| Templates | Email and text templates | Email templates offered; "Customizable opt-in messaging" for text | Keap | https://keap.com/solutions/messages | OBSERVED |

### 1.4 Scheduling

| Feature | What the user can do | Notable details and limits | Tier | Source | Label |
|---|---|---|---|---|---|
| Native appointment scheduler | Publish booking availability, let leads book, trigger follow-ups | "Keap's appointment scheduler is native"; "Tailor details, availability, and reminders to your business"; Google and Outlook calendar connection; mobile and desktop sync | Keap | https://keap.com/solutions/appointments | OBSERVED |
| Reminders | Automated appointment reminders by email or text | "automated appointment reminders and personalized follow-up"; text reminders listed as a use case | Keap | https://keap.com/solutions/appointments ; https://keap.com/solutions/messages | OBSERVED |
| Booking as automation trigger | Start automation when appointment booked | Marketing automation page lists appointment bookings as a trigger example | Keap | https://keap.com/features/marketing-automation | OBSERVED |
| Appointment types, buffers, team round robin, deposits at booking | Configure multiple types, buffers, team pooling, prepayment | Not described on official pages; December 2025 update titled "Smarter Scheduling" exists but detail page not reachable | n/a | https://keap.com/product-updates | not confirmed |

### 1.5 Automation

| Feature | What the user can do | Notable details and limits | Tier | Source | Label |
|---|---|---|---|---|---|
| Easy Automations | Build "when, then" automations from presets or from scratch | Preset Easy Automations; "use only the simple email builder"; can be built inside the pipeline; landing pages available in Easy and Advanced | Keap (Pro and Max per help) | https://keap.com/features/marketing-automation ; https://learn.thryv.com/hc/en-us/articles/37879683734925-Easy-Automations-Overview | OBSERVED |
| Advanced Automations | Multi-step visual builder with sequences and response triggers | "Advanced Automations builder lets you customize your sales and marketing processes" for "advanced nurture sequences, personalization response triggers"; requires desktop; automation links (clickable links that trigger steps) | Keap | https://keap.com/features/marketing-automation ; https://learn.thryv.com/hc/en-us/articles/37884669618957-Create-and-Use-Automation-Links-in-Keap-Advanced-Automations | OBSERVED |
| Trigger examples | Form submission, appointment booked, invoice unpaid, payment made, checkout form purchase, landing page submission, pipeline stage change, Zapier events | Help articles: "Automate Follow-Up After a Landing Page Submission", "Add Automation to Your Checkout Forms", "Automatically Move Deals Between Pipeline Stages" | Keap | https://learn.thryv.com/hc/en-us/articles/37890104581005-Automate-Follow-Up-After-a-Landing-Page-Submission-in-Keap ; https://learn.thryv.com/hc/en-us/articles/37889262351757-How-to-Add-Automation-to-Your-Checkout-Forms-in-Keap | OBSERVED |
| Goals, decision diamonds, delays | Goal-based campaign model with timers and decision nodes | This is the historical Infusionsoft Campaign Builder model; official 2026 pages reached in this pass do not spell it out | Keap | https://keap.com/features/marketing-automation | INFERRED |
| Billing automation | Credit card expiry reminders, failed payment follow-up | "billing automation, credit card expiration reminders" | Keap | https://keap.com/pricing | OBSERVED |
| Run logs | See contacts at each automation stage and historical performance | Automation reports "show historical performance, contacts who have moved through each automation stage, and email engagement" | Keap | https://keap.com/solutions/reporting | OBSERVED |
| AI Automation Assistant | Answer questions, get a full campaign drafted | "Select a proven campaign type", "answer a few questions about your business, audience and offer", copy for landing pages, texts, follow-up, sales emails, social; company profile and target persona stored under Automations > AI Automation Assistant | Keap (all editions per product update) | https://www.keap.com/ai-content-generator-assistant ; https://keap.com/product-updates/quickly-create-content-with-keap-ai | OBSERVED |
| Integrations | Zapier, API, webhooks | "API and webhooks, native Zapier integration"; v2 REST API reached feature parity with legacy XML-RPC in Nov 2025 with new SDKs | Keap | https://keap.com/pricing ; https://keap.com/product-updates | OBSERVED |

### 1.6 Marketing

| Feature | What the user can do | Notable details and limits | Tier | Source | Label |
|---|---|---|---|---|---|
| Email builder | Drag and drop emails, newsletters, broadcasts | Simple builder for Easy Automations; full builder in Advanced; A/B testing listed by third parties, not confirmed on official page | Keap | https://keap.com/pricing | OBSERVED (builder), not confirmed (A/B) |
| Text marketing | Broadcast texts, automated texts, tag-based segmentation | "Trigger automated text messages based on contacts' actions"; merge fields; "Built-in compliance"; billed only for delivered content messages; US only for marketing number; Pro gets 3-month text trial then needs a package | Keap | https://keap.com/solutions/messages | OBSERVED |
| Landing pages and funnels | Build landing pages, multi-page sales funnels | "Landing pages, multi-page sales funnels, forms"; drag and drop, templates, free images; forms embed into pages; data flows to CRM | Keap | https://keap.com/pricing ; https://keap.com/solutions/lead-capture | OBSERVED |
| Forms | Public lead forms and internal forms | "Keap's internal forms allow your team to quickly capture information" from calls or visits and apply tags | Keap | https://keap.com/solutions/lead-capture | OBSERVED |
| Lead source tracking | Attribute leads to sources | "lead source tracking" | Keap | https://keap.com/pricing | OBSERVED |
| Reviews | Request Google reviews | "Google reviews" under Service; text use case "requests for reviews and referrals after a purchase" | Keap | https://keap.com/pricing ; https://keap.com/solutions/messages | OBSERVED |
| Social posting | Schedule social posts | Not offered natively (Thryv Marketing Center covers it) | n/a | https://keap.com/pricing | not confirmed |
| AI Content Assistant | Draft a personalized email in seconds, adjust length, tone, creativity | Uses contact data, company profile and personas; "in Beta" per help article | Keap | https://www.keap.com/ai-content-generator-assistant ; https://learn.thryv.com/hc/en-us/articles/41298839587597-Keap-AI-Content-Assistant | OBSERVED |

### 1.7 Money

| Feature | What the user can do | Notable details and limits | Tier | Source | Label |
|---|---|---|---|---|---|
| Quotes | Send quotes, customer pays from the quote | "Keap also offers the ability for customers to pay directly from the quote" | Keap (Pro/Max wording) | https://keap.com/solutions/invoices-payments | OBSERVED |
| Invoices | Send invoices, automated reminders, thank-you after payment | Pricing page lists invoices, "Invoice customers automatically" | Keap | https://keap.com/pricing ; https://keap.com/features/marketing-automation | OBSERVED |
| Recurring payments | Set frequency, custom start and end, pause | "Recurring payments are managed in the contact record" | Keap | https://keap.com/solutions/invoices-payments | OBSERVED |
| Checkout forms | Sell with checkout pages, order bumps, promo codes, one-click upsells | "checkout forms, order bumps, promo codes" | Keap | https://keap.com/pricing | OBSERVED |
| Processors | Keap Pay (native, US), Stripe, PayPal, Eway, others | "native payments (U.S.)", "third-party processors"; fees set by processor; Keap Pay rate not published on pages reached | Keap | https://keap.com/pricing ; https://keap.com/solutions/invoices-payments | OBSERVED (processors), not confirmed (Keap Pay rate) |
| Products | Product catalog for orders and subscriptions | Implied by checkout forms and recurring payments; catalog details not confirmed | Keap | https://keap.com/solutions/invoices-payments | INFERRED |
| Accounting sync | QuickBooks or Xero | Not on official pages reached; available via Zapier or marketplace | n/a | https://keap.com/solutions/integrations | not confirmed |
| Revenue reports | Forecasted payments, receivables, failed invoices | Sales reports "cover forecasted payments, receivables, and failed invoices" | Keap | https://keap.com/solutions/reporting | OBSERVED |

### 1.8 Reporting and dashboards

| Feature | What the user can do | Notable details and limits | Tier | Source | Label |
|---|---|---|---|---|---|
| Dashboard | Customizable dashboard with key metrics | "total sales and quotes sent" | Keap | https://keap.com/solutions/reporting | OBSERVED |
| Reporting hub | Search and pin reports across the library | "Available in Keap Max and Ultimate" (legacy wording; single plan lists "Reports, reporting hub") | Keap | https://keap.com/solutions/reporting ; https://keap.com/pricing | OBSERVED |
| Report families | Email engagement, automation stage, pipeline trend and rep performance, revenue, ROI, tag-based segments | Custom report builder: not confirmed; third party Graphly fills the gap | Keap | https://keap.com/solutions/reporting | OBSERVED |
| Email deliverability dashboard | Monitor sending health | Listed | Keap | https://keap.com/pricing | OBSERVED |

### 1.9 AI (Keap AI, plus Thryv AI arriving via integration)

| Feature | What the user can do | Notable details and limits | Tier | Source | Label |
|---|---|---|---|---|---|
| AI Content Assistant | Generate and refine email copy with length, tone, creativity controls | Email focused; uses contact data | Keap | https://www.keap.com/ai-content-generator-assistant | OBSERVED |
| AI Automation Assistant | Generate complete campaign copy (landing page, texts, follow-up, sales emails, social) from Q&A | Campaign types are "proven" templates; stored company profile and persona | Keap | https://www.keap.com/ai-content-generator-assistant | OBSERVED |
| ThryvAI Lead Flow integration | Push Thryv Marketing Center leads into Keap with AI scoring and follow-up | Help article "Capture and Nurture High-Quality Leads with ThryvAI Lead Flow" (Integrate Keap with Thryv); Grow 2025 announced "enhanced connection" between Marketing Center and Keap | Keap + Thryv Marketing Center | https://learn.thryv.com/hc/en-us/articles/39805872558733-Integrate-Keap-with-Thryv ; https://keap.com/product-updates/grow-2025-product-recap-innovations-you-need-to-know | OBSERVED |
| AI agent, chat assistant, AI receptionist inside Keap | Conversational AI | Not confirmed in Keap itself; Thryv management cites "AI receptionist" in development | n/a | https://www.marketbeat.com/instant-alerts/thryv-q4-earnings-call-highlights-2026-02-27/ | not confirmed |

---

## 2. Thryv (thryv.com): Command Center, Business Center, Marketing Center, ThryvPay

### 2.1 Pricing and caps

| Feature | What the user can do | Notable details and limits | Tier | Source | Label |
|---|---|---|---|---|---|
| Command Center Free | Unified inbox, phone, TeamChat at no cost | 3 inbox channels, 60 call minutes, 30-day TeamChat history, email support; user cap stated as 5 in one place and 3 in the FAQ (page contradicts itself); every account gets a new business number, existing numbers cannot be ported | Free | https://www.thryv.com/faqs-2024/ | OBSERVED |
| Command Center Plus | More channels and minutes | 6 channels, 300 minutes, 12-month TeamChat history, unlimited users, phone/email/chat support; third parties list $20 per user per month | Plus | https://www.thryv.com/faqs-2024/ ; https://www.capterra.com/p/156926/Thryv/pricing/ | OBSERVED (limits), INFERRED (price) |
| Command Center Professional | Unlimited channels | Unlimited channels, 600 minutes, unlimited TeamChat history; extra 100 minutes for $5/mo on Plus and Pro; third parties list $30 per user per month | Professional | https://www.thryv.com/faqs-2024/ | OBSERVED (limits), INFERRED (price) |
| Business Center | CRM, scheduling, estimates and invoices, client portal, documents, payments, reporting, email marketing | "$185/mo" with "one-time onboarding fee of $250" on the Business Center page; sold as Plus, Professional, Unlimited packages; includes 5 free e-signatures per month; top two paid tiers include a professionally designed website; third parties list Plus $199, Professional $349, Unlimited $499 per month | Plus / Professional / Unlimited | https://www.thryv.com/business-center/ ; https://www.thryv.com/faqs-2024/ ; https://zeeg.me/post/thryv-pricing | OBSERVED ($185 entry, packages), INFERRED (tier prices) |
| Business Center tier gating | Professional adds invoicing and payments, marketing automation, Google Business Profile optimization, advanced analytics; Unlimited adds unlimited contacts and users | Help center comparison table confirms GBP optimization and advanced analytics are Professional-only; user caps conflict (Unlimited users vs "up to 10") | Plus / Professional / Unlimited | https://learn.thryv.com/hc/en-us/articles/40773972633485 ; https://www.thryv.com/?p=80640 | INFERRED |
| Marketing Center Starter | Marketing dashboard, listings, AI website, reputation | $99/month, 1 user; Digital Marketing Score, GBP analytics, website analytics, competitor ranking, AI website builder and SEO tools, 60+ listings plus Nextdoor, Yahoo and YP directories, local search landing page, AI reputation management, trackable phone numbers, 24/7 chat support; excludes Yelp, social tools, CaptionAI, ImageAI, AI lead insights, heat mapping | Starter | https://www.thryv.com/pricing/ | OBSERVED |
| Marketing Center Signature | Adds social, custom website, advanced listings, AI lead insights | $399/month, 5 users; social media management with 5 profiles, SEO and AEO custom website, Yelp and Request a Quote, heatmap, AI lead insights, professionally designed website, CaptionAI and ImageAI ("25 included"), AI service description, review acknowledgment, 24/7 phone and email support | Signature | https://www.thryv.com/pricing/ | OBSERVED |
| Marketing Center Custom and Boosts | Done-for-you ads, search, social, brand services | Tailored pricing; Ads, Search, Social, Brand Boosts | Custom | https://www.thryv.com/pricing/ | OBSERVED |
| Annual discount and contracts | Save 15% annual on Marketing Center | Australia FAQ: six-month initial term then month to month, $350 setup; US contract length not stated; cancel via Client Care | All | https://www.thryv.com/pricing/ ; https://www.thryv.com/faqs-2024/ | OBSERVED |

### 2.2 CRM (Business Center)

| Feature | What the user can do | Notable details and limits | Tier | Source | Label |
|---|---|---|---|---|---|
| Customer records | One view of appointments, payments, communications per client | "Oversee all customer interactions in one view, from appointments to payments and communications" | Business Center | https://www.thryv.com/business-center/ | OBSERVED |
| Custom fields, tags, filters | Customize CRM | Third-party review: "customizable CRM"; official field list not confirmed | Plus | https://www.toolsforhumans.ai/ai-tools/thryv | INFERRED |
| Documents and files | Store documents, photos tied to customer | "Storage for documents, files, and photos, tied to customer accounts" | Business Center | https://www.thryv.com/business-center/ | OBSERVED |
| Client portal | Customers self-serve: pay, reschedule, upload paperwork, directions | "Let customers help themselves with a self-service client portal" | Business Center | https://www.thryv.com/business-center/ | OBSERVED |
| Pipelines and deals | Sales pipeline | Not described on Business Center page; AI Lead Flow adds lead scoring, tagging, routing (see AI); formal deal pipeline: not confirmed | n/a | https://www.thryv.com/business-center/ | not confirmed |
| Import and duplicates | Import customers, merge duplicates | Not confirmed on official pages reached | n/a | https://www.thryv.com/business-center/ | not confirmed |
| Consent | Opt-in management | Not confirmed | n/a | | not confirmed |

### 2.3 Conversations (Command Center)

| Feature | What the user can do | Notable details and limits | Tier | Source | Label |
|---|---|---|---|---|---|
| Unified inbox | Every channel in one thread per customer | Channels: Gmail, Outlook, Facebook, Instagram, SMS, phone, video, webchat; email channels import 90 days of history | Free and up (channel count gated) | https://www.thryv.com/?p=85413 ; https://www.thryv.com/?p=85712 | OBSERVED |
| Business phone and video | Calls, video calls, voicemail | New number on signup; "Voicemails are automatically transcribed for all users"; minutes gated 60 / 300 / 600 | Free / Plus / Pro | https://www.thryv.com/faqs-2024/ | OBSERVED |
| TeamChat | Internal 1:1 and group chat | History 30 days / 12 months / unlimited | Free / Plus / Pro | https://www.thryv.com/faqs-2024/ | OBSERVED |
| WhatsApp | WhatsApp channel | Not confirmed | n/a | | not confirmed |
| Assignment and routing | Assign threads to teammates | Implied by multi-user inbox; explicit rules not confirmed | | https://www.thryv.com/?p=85579 | INFERRED |
| Two-way text and automated texts | Text customers, automated reminders and campaigns | "Pre-scheduled automated texts and emails, with customizable templates" | Business Center | https://www.thryv.com/business-center/ | OBSERVED |

### 2.4 Scheduling

| Feature | What the user can do | Notable details and limits | Tier | Source | Label |
|---|---|---|---|---|---|
| Online booking and calendars | Customers book online; automated reminders | "Customers can book online, and automated reminders reduce no-shows"; portal lets clients reschedule | Business Center | https://www.thryv.com/business-center/ | OBSERVED |
| Appointment types, staff calendars, deposits, buffers, Google sync | Configure services and staff | Scheduling feature page returned 404; Google listed among integrations; details not confirmed | | https://www.thryv.com/business-center/ | not confirmed |

### 2.5 Automation

| Feature | What the user can do | Notable details and limits | Tier | Source | Label |
|---|---|---|---|---|---|
| Marketing automation | Pre-scheduled texts and emails, follow-ups, review requests | Templates; "Automated Reviews" requests; automation tier gated to Professional per third parties | Professional (per third parties) | https://www.thryv.com/business-center/ ; https://schedulingkit.com/es/pricing-guides/thryv-pricing | OBSERVED (feature), INFERRED (gate) |
| AI Lead Flow | Leads auto-scored, tagged, routed, followed up | "AI lead scoring, smart tagging, intelligent routing, and automated follow-ups", launched March 24, 2026; "designed to require no manual effort once implemented" | Marketing Center with Business Center or Keap | https://finance.yahoo.com/markets/stocks/articles/thryv-holdings-thry-launches-ai-073040570.html ; https://learn.thryv.com/hc/en-us/articles/39805872558733-Integrate-Keap-with-Thryv | OBSERVED |
| Builder model (triggers, conditions, delays), run logs | Visual builder | Not confirmed; Thryv positions Keap as the automation engine for complex flows | | https://learn.thryv.com/hc/en-us/articles/37943876290573-What-Is-Keap-Sales-and-Marketing-Automation-for-Small-Businesses | not confirmed |
| Integrations | Google, QuickBooks, Yext, MailChimp, JotForm, PayPal, Facebook; Zapier via marketplace | Listed partner apps | Business Center | https://www.thryv.com/business-center/ | OBSERVED |

### 2.6 Marketing (Marketing Center)

| Feature | What the user can do | Notable details and limits | Tier | Source | Label |
|---|---|---|---|---|---|
| Email marketing | Templates, campaigns | "Nurture your leads and keep customers engaged with easy-to-use marketing templates" | Business Center | https://www.thryv.com/features/text-automation/ | OBSERVED |
| Listings management | Sync business info across directories | Pricing page: "60+ listings"; reputation page: "30+ trusted sites including Google, Yelp and Facebook" (two different numbers on official pages) | Marketing Center | https://www.thryv.com/pricing/ ; https://www.thryv.com/features/reputation-management/ | OBSERVED |
| Reputation management | Monitor and reply to reviews from one screen, automated review requests, AI review response | "AI reputation management" in Starter; "AI Review Response"; "Review acknowledgment" in Signature | Marketing Center | https://www.thryv.com/pricing/ ; https://www.thryv.com/features/text-automation/ | OBSERVED |
| Social media management | Schedule posts, comments dashboard, content library, CaptionAI, ImageAI | Signature: 5 profile integrations, post calendar, "CaptionAI and ImageAI (25 included)" | Signature | https://www.thryv.com/pricing/ | OBSERVED |
| Website | AI website builder (Starter), professionally designed SEO and AEO site (Signature) | AI Website Builder "creates a complete website, including design, copy, images, and an SEO-ready structure" | Starter / Signature | https://www.thryv.com/pricing/ ; https://keap.com/product-updates/grow-2025-product-recap-innovations-you-need-to-know | OBSERVED |
| Digital Marketing Score and analytics | Score, GBP analytics, competitor ranking, heatmap | Starter has score and analytics; heatmap and competitive insights in Signature | Starter / Signature | https://www.thryv.com/pricing/ | OBSERVED |
| Trackable phone numbers and offline tracking | Call tracking numbers | Numbers cannot be kept on cancellation | Marketing Center | https://www.thryv.com/pricing/ ; https://www.thryv.com/faqs-2024/ | OBSERVED |
| Landing pages and forms | Local search landing page | Starter includes "Local search landing page"; general landing page builder not confirmed; JotForm integration | Starter | https://www.thryv.com/pricing/ | OBSERVED (local page), not confirmed (builder) |
| Paid ads | Done-for-you Ads Boosts | Service, not self-serve | Signature / Custom | https://www.thryv.com/pricing/ | OBSERVED |

### 2.7 Money (ThryvPay)

| Feature | What the user can do | Notable details and limits | Tier | Source | Label |
|---|---|---|---|---|---|
| Estimates to invoices | Convert estimates to invoices, customers approve, sign, pay online | "Automatically transform your estimates into invoices in a few clicks"; 5 free e-signatures per month | Business Center | https://www.thryv.com/business-center/ ; https://www.thryv.com/faqs-2024/ | OBSERVED |
| Processing fees | Pay per transaction, no monthly fee | Online "2.9% plus 30 cents per transaction"; card-present from 2.6% + $0.30; ACH "minimum of $1.00 or 1% up to maximum of $9.00"; optional convenience fee | ThryvPay | https://www.thryv.com/features/thryvpay/ | OBSERVED |
| Recurring and installments | Daily, weekly, monthly recurring; custom installment plans | "Accept daily, weekly or monthly recurring payments"; "Custom installment and payment plans" | ThryvPay | https://www.thryv.com/features/thryvpay/ | OBSERVED |
| Tipping and surcharging | Accept tips; pass card fee to customer | Surcharge "matches your processing rate", available in 48 states | ThryvPay | https://www.thryv.com/features/thryvpay/ | OBSERVED |
| In-person | Bluetooth card reader, Tap to Pay on iOS and Android | ThryvPay Mobile app | ThryvPay | https://www.thryv.com/features/thryvpay/ | OBSERVED |
| Funding and accounting | Next-day funding for cards before 8 p.m. EST; QuickBooks reconciliation | "Integrate with QuickBooks for automatic reconciliation" | ThryvPay | https://www.thryv.com/features/thryvpay/ | OBSERVED |
| Other processors | Stripe, PayPal, Square | Business Center accepts payments through "ThryvPay, Stripe, PayPal, or Square" | Business Center | https://www.thryv.com/business-center/ | OBSERVED |

### 2.8 Reporting

| Feature | What the user can do | Notable details and limits | Tier | Source | Label |
|---|---|---|---|---|---|
| Reporting Center | Five out-of-the-box reports plus custom reports | "five out-of-the-box reports"; advanced analytics is Professional-only | Business Center | https://www.thryv.com/business-center/ ; https://learn.thryv.com/hc/en-us/articles/40773972633485 | OBSERVED |
| Marketing dashboard | Digital Marketing Score, real-time analytics | Starter and up | Marketing Center | https://www.thryv.com/pricing/ | OBSERVED |

### 2.9 AI (Thryv AI)

| Feature | What the user can do | Notable details and limits | Tier | Source | Label |
|---|---|---|---|---|---|
| AI Lead Insights | See which leads are worth pursuing | Signature plan; marketed since Aug 2026 "AI-native growth platform" | Signature | https://www.thryv.com/pricing/ | OBSERVED |
| AI Lead Flow | Scoring, tagging, routing, automated follow-up end to end | March 2026 launch | Marketing Center + Business Center or Keap | https://finance.yahoo.com/markets/stocks/articles/thryv-holdings-thry-launches-ai-073040570.html | OBSERVED |
| AI Call Analysis | Review call transcripts, score leads, flag follow-up actions | Announced at Grow 2025, "All customers" of Marketing Center | Marketing Center | https://keap.com/product-updates/grow-2025-product-recap-innovations-you-need-to-know | OBSERVED |
| AI Website Builder | Generate full site from a few questions | Marketing Center, all customers | Starter | https://www.thryv.com/pricing/ | OBSERVED |
| AI Review Response, CaptionAI, ImageAI, AI service description | Reply to reviews, write captions, generate images, write service copy | Signature; "25 included" for Caption/Image AI | Signature | https://www.thryv.com/pricing/ | OBSERVED |
| AI receptionist, lead grading | Answer calls, grade leads | Management said "under development and deployment" on Q4 2025 call; not on product pages | n/a | https://www.marketbeat.com/instant-alerts/thryv-q4-earnings-call-highlights-2026-02-27/ | not confirmed |

---

## 3. Zoho small business stack (Bigin, Zoho CRM, Bookings, Campaigns, Invoice/Books, SalesIQ, Flow, Zoho One)

### 3.1 Pricing and caps

| Feature | What the user can do | Notable details and limits | Tier | Source | Label |
|---|---|---|---|---|---|
| Zoho One | Buy the whole suite per user | Flexible User US$90 per user per month (any number of users); All Employee US$37 per employee per month "First year only", must license all employees; annual licensing | Zoho One | https://www.zoho.com/one/pricing.html | OBSERVED |
| Zoho One app limits | Suite-level caps | Campaigns: "Contacts - 5,000/employee license"; Bookings: "3 workspaces per organization and 1 additional workspace for every 10 employee licenses"; Bookings Premium edition; Flow task top-ups reported by users at about EUR 49/mo for 10,000 | Zoho One | https://www.zoho.com/one/plan-details.html ; https://www.zoho.com/bookings/pricing.html ; https://help.zoho.com/portal/en-gb/community/topic/upgrade-zoho-flow-tasks-in-zoho-one-is-too-expensive | OBSERVED (caps), INFERRED (Flow top-up) |
| Bigin Free | 1 user, 1 pipeline, 500 records, 3 automations | Built-in phone, standard dashboards, APIs, 1 booking page, forms, card scanner, MCP support | Free | https://www.bigin.com/pricing.html | OBSERVED |
| Bigin Express | US$9/user/mo monthly, US$7 yearly | 3 team pipelines, 50,000 records, 30 automations, 10 custom fields per module, email integration, WhatsApp Business, mass email with insights, lead ads (Facebook, Instagram, LinkedIn, TikTok), payment links (Stripe, PayPal, Razorpay, Paytm), Zoho Books/Invoice, QuickBooks, Zoho Sign | Express | https://www.bigin.com/pricing.html | OBSERVED |
| Bigin Premier | US$15/user/mo monthly, US$12 yearly | 5 team pipelines, 100,000 records, 50 advanced automations incl. date-based triggers, stage transition rules, lookup/formula/user fields, multi-currency, 25 custom fields, duplicate cleanup, data enrichment, AI (Writing Assistant, Record Summary, Email Reply Assistant, CrossSell Genie, Churn Analyzer), 1,000 AI credits/mo | Premier | https://www.bigin.com/pricing.html | OBSERVED |
| Bigin 360 | US$21/user/mo monthly, US$18 yearly | 15 team pipelines, 1,000,000 records, 100 advanced automation rules, Email-In with 5 aliases, File Cabinet 5 GB, 50 custom fields, 1,000 mass emails/day/org, 100 booking pages, 3,000 AI credits/mo | Bigin 360 | https://www.bigin.com/pricing.html | OBSERVED |
| Zoho CRM editions | Free (3 users), Standard, Professional, Enterprise, Ultimate | Free: workflow automation, 10 email templates, 5,000 API calls/day; Standard adds mass email, built-in calling, multiple pipelines, forms, forecasting, custom modules; Professional adds AI agents, Blueprint process management, inventory, CPQ, portals, customer journeys; Enterprise adds sandbox, approvals, extended Zia; per-user prices not rendered in page text | Editions | https://www.zoho.com/crm/zohocrm-pricing.html | OBSERVED |
| Zoho Bookings | Free (1 user), Basic (US$6 to 8 per user), Premium (US$9 to 12 per user, 3 workspaces), Flex custom | Page shows two price figures per plan (annual vs monthly not labelled); Zoho One users get Premium; resources sold as add-ons | Plans | https://www.zoho.com/bookings/pricing.html | OBSERVED |
| Zoho Campaigns | Forever Free 2,000 contacts / 6,000 emails/mo / 5 users; Standard from 500 contacts, unlimited emails, 10 users; Professional up to 20+ users | Priced by contact tier starting at 500; 25% off yearly; SMS and WhatsApp are add-ons on Standard and Professional | Plans | https://www.zoho.com/campaigns/pricing.html | OBSERVED |
| Zoho Invoice | Completely free | "Zoho Invoice is completely free!"; invoice volume cap not stated on features page | Free | https://www.zoho.com/invoice/features/ | OBSERVED |
| Zoho Books | Free (1 user + 1 accountant, 1,000 invoices/yr, revenue under $50K), Standard $20/mo ($15 annual, 3 users, 5,000 invoices), Professional $50 ($40, 5 users, 10,000), Premium $70 ($60, 10 users, 25,000), Elite $150 ($120), Ultimate $275 ($240, 15 users) | Per organization per month | Plans | https://www.zoho.com/us/books/pricing/ | OBSERVED |
| Zoho SalesIQ | Free (3 operators, 10K visitors, 100 chats), Basic (50K visitors, 1,000 chats, 1 bot 25K sessions), Professional (100K visitors, unlimited chats, 5 bots), Enterprise (200K, 10 bots, 200K bot sessions) | Priced per operator; prices not rendered in page text | Plans | https://www.zoho.com/salesiq/pricing.html | OBSERVED |
| Zoho Flow | Free 100 tasks/mo, 5 flows, 15-min polling, 30-day history; Standard 5,000 to 5M tasks, unlimited flows, custom functions, 60-day history; Professional 10,000+ tasks, 5-min polling, premium apps, on-prem, auto rerun, 90-day history | "A successful execution of an action in a flow counts as a task"; overage can be enabled | Plans | https://www.zoho.com/flow/pricing.html | OBSERVED |

### 3.2 CRM (Bigin, with Zoho CRM where noted)

| Feature | What the user can do | Notable details and limits | Tier | Source | Label |
|---|---|---|---|---|---|
| Contacts, companies, products, activities | Manage records with custom fields, tags, notes | "Add colorful tags to identify records quickly"; custom fields 10 / 25 / 50 per module by edition; advanced field types (lookup, formula, user) at Premier | Bigin | https://www.bigin.com/features.html ; https://www.bigin.com/pricing.html | OBSERVED |
| Team Pipelines and Connected Pipelines | Separate pipelines per team on one customer record; automations carry a record from one team pipeline to the next | "Unify all your customer-facing operations with team pipelines"; connected pipelines track movement across teams (e.g. sales to onboarding) | Express and up (3 / 5 / 15 pipelines) | https://www.bigin.com/features.html | OBSERVED |
| Stage transition rules | Enforce required fields or order when moving stages | Premier and up | Premier | https://www.bigin.com/pricing.html | OBSERVED |
| Import | Import spreadsheets, migrate from other CRMs | "Automatically import data from your spreadsheets into your Bigin account" | All | https://www.bigin.com/features.html | OBSERVED |
| Duplicate management | Find, prevent and remove duplicates | Duplicate cleanup at Premier and up | Premier | https://www.bigin.com/features.html ; https://www.bigin.com/pricing.html | OBSERVED |
| Signals | Real-time notifications for emails, missed calls and other updates | | All | https://www.bigin.com/features.html | OBSERVED |
| Email-In | Create and update records from incoming email | Topping; 5 aliases pre-installed in Bigin 360 | Bigin 360 or add-on | https://www.bigin.com/pricing.html | OBSERVED |
| File Cabinet | Collect documents from customers via one link | Topping; 5 GB in Bigin 360 | Bigin 360 or add-on | https://www.bigin.com/features.html | OBSERVED |
| Data enrichment | Enrich contacts and companies | Premier | Premier | https://www.bigin.com/pricing.html | OBSERVED |
| Consent management | GDPR fields, consent tracking | Zoho CRM has GDPR compliance settings; Bigin not confirmed in this pass; Campaigns handles consent (see 3.6) | | | not confirmed (Bigin) |
| Zoho CRM Blueprint | Enforced process flows with stage requirements | Professional edition "process management" | Zoho CRM Professional | https://www.zoho.com/crm/zohocrm-pricing.html | OBSERVED |

### 3.3 Conversations (Bigin telephony and WhatsApp, SalesIQ)

| Feature | What the user can do | Notable details and limits | Tier | Source | Label |
|---|---|---|---|---|---|
| Built-in telephony | Call from inside the CRM, 100+ provider integrations | Available from Free | Bigin Free | https://www.bigin.com/pricing.html | OBSERVED |
| WhatsApp Business in CRM | Chat with contacts with CRM context, summaries and suggested replies | Express and up; mobile AI gives WhatsApp suggestions | Bigin Express | https://www.bigin.com/features.html | OBSERVED |
| Email in CRM | Gmail, Outlook, Zoho Mail integration; mass email | Express and up; 1,000 mass emails/day/org at Bigin 360 | Bigin Express | https://www.bigin.com/pricing.html | OBSERVED |
| SalesIQ live chat and messaging channels | Website chat plus WhatsApp, Instagram, Facebook Messenger, Telegram, LINE, WeChat in one operator console | Channels from Basic; canned replies, file sharing, voice notes from Free; chat routing and transfer, translation, proactive chat from Basic | SalesIQ Basic | https://www.zoho.com/salesiq/pricing.html | OBSERVED |
| SalesIQ bots | Codeless or programmable chatbot, Answer Bot (Gen AI) | Bot count 1 / 5 / 10 by plan; Answer Bot and hybrid bots at Enterprise | Basic to Enterprise | https://www.zoho.com/salesiq/pricing.html | OBSERVED |
| SalesIQ calls | Audio calls with screen share, video calls from the chat widget | Basic and up; cloud telephony and PBX at Enterprise | Basic / Enterprise | https://www.zoho.com/salesiq/pricing.html | OBSERVED |
| Business phone line (SMS and voice number) | Native number | Not a native Zoho feature; via telephony partners | n/a | https://www.bigin.com/pricing.html | not confirmed |
| Assignment | Route chats to departments and operators, criteria router with AI rules | Professional adds "AI-powered rules in the criteria router" | SalesIQ Professional | https://www.zoho.com/salesiq/pricing.html | OBSERVED |

### 3.4 Scheduling (Zoho Bookings)

| Feature | What the user can do | Notable details and limits | Tier | Source | Label |
|---|---|---|---|---|---|
| Appointment types | One-on-one, group, collective, resource, recurring one-on-one | Resources are paid add-ons | Bookings | https://www.zoho.com/bookings/pricing.html ; https://www.zoho.com/bookings/features.html | OBSERVED |
| Booking pages | Branded pages with themes, logo, custom domain, custom CSS | "Customizable domain" | Bookings | https://www.zoho.com/bookings/features.html | OBSERVED |
| Workspaces | Separate locations or departments | 1 in Basic, 3 in Premium | Basic / Premium | https://www.zoho.com/bookings/pricing.html | OBSERVED |
| Team scheduling | Round robin with "four algorithms"; multi-schedules reusable across event types; user roles | | Bookings | https://www.zoho.com/bookings/pricing.html | OBSERVED |
| Reminders | Email notifications and reminders; SMS via workflows and SMS provider integration | | Bookings | https://www.zoho.com/bookings/pricing.html | OBSERVED |
| Payments | Charge for appointments via payment gateways | Deposits or partial payment: not confirmed | Bookings | https://www.zoho.com/bookings/pricing.html | OBSERVED (payments), not confirmed (deposits) |
| Calendar sync | Two-way with Zoho, Google, Microsoft 365/Outlook.com | Available on Free | Free | https://www.zoho.com/bookings/pricing.html | OBSERVED |
| Video links | Auto-generated meeting links on booking | Zoho Meeting named; Zoom and Teams not named on pages reached | Bookings | https://www.zoho.com/bookings/features.html | OBSERVED |
| CRM write-back | Add or update CRM data on booking | Zoho CRM and Bigin integrations; Zoho Flow and Zapier "over 850 app integrations" | Bookings | https://www.zoho.com/bookings/features.html | OBSERVED |
| Buffers, cancellation policy | Buffer time, cancel and reschedule windows | Not confirmed on pages reached | | | not confirmed |
| Bigin booking pages | Booking page inside the CRM | 1 page on Free to Premier, 100 pages on Bigin 360 | Bigin | https://www.bigin.com/pricing.html | OBSERVED |

### 3.5 Automation (Bigin workflows, Zoho Flow)

| Feature | What the user can do | Notable details and limits | Tier | Source | Label |
|---|---|---|---|---|---|
| Bigin workflows | Trigger on record events, send email alerts, create tasks, update fields | "Automates routine tasks, such as tracking deals and sending email alerts"; counts 3 / 30 / 50 / 100; date-based triggers only at Premier and up (advanced automations) | Bigin | https://www.bigin.com/features.html ; https://www.bigin.com/pricing.html | OBSERVED |
| Workflow model (conditions, delays, webhooks) | Criteria-based conditions, scheduled actions, webhooks | Follows Zoho CRM workflow model; Bigin help page not reachable in this pass | Bigin | https://www.bigin.com/pricing.html | INFERRED |
| Connected Pipelines automation | Auto-create record in next team pipeline when a stage is reached | | Express and up | https://www.bigin.com/features.html | OBSERVED |
| Zoho Flow | Cross-app automation with triggers, logic, delays, custom functions (Deluge), webhooks, auto rerun | Task-metered; 15-min polling (5-min on Professional); flow creation from plain-English description via Zia; "agentic actions" | Flow | https://www.zoho.com/flow/pricing.html | OBSERVED |
| Run logs | Flow history 30 / 60 / 90 days | | Flow | https://www.zoho.com/flow/pricing.html | OBSERVED |
| Zia Agents in Bigin | Agents that "handle follow-ups, identify cross-sell opportunities, and explain lost deals" | CrossSell Genie, Churn Analyzer at Premier; AI credits metered | Premier | https://www.bigin.com/features.html ; https://www.bigin.com/pricing.html | OBSERVED |
| MCP for Bigin | Connect ChatGPT, Claude and other AI tools to CRM data | "MCP (Model Context Protocol) support" on Free | Free | https://www.bigin.com/pricing.html | OBSERVED |
| Zoho Campaigns workflows | Behavior-triggered journeys with triggers, actions, delays | "configuring triggers, actions, and delays"; basic workflows on Standard; abandoned cart, purchase follow-up on Professional | Standard / Professional | https://www.zoho.com/campaigns/features.html ; https://www.zoho.com/campaigns/pricing.html | OBSERVED |

### 3.6 Marketing (Zoho Campaigns, forms)

| Feature | What the user can do | Notable details and limits | Tier | Source | Label |
|---|---|---|---|---|---|
| Email builder | Drag and drop, HTML import, 120+ templates | Free includes builder and templates | Free | https://www.zoho.com/campaigns/pricing.html | OBSERVED |
| Dynamic content and A/B tests | Swap content per subscriber; test subject, sender, content | A/B at Standard; dynamic content at Professional | Standard / Professional | https://www.zoho.com/campaigns/pricing.html | OBSERVED |
| Send time optimization, timezone and batch scheduling, frequency capping | Deliver at best time per recipient | Professional | Professional | https://www.zoho.com/campaigns/pricing.html | OBSERVED |
| SMS and WhatsApp campaigns | Bulk SMS and WhatsApp | Add-ons on Standard and Professional | Add-on | https://www.zoho.com/campaigns/pricing.html | OBSERVED |
| Signup forms and pop-ups | Collect subscribers | Pop-up forms at Professional | Standard / Professional | https://www.zoho.com/campaigns/pricing.html | OBSERVED |
| Consent and GDPR | Double opt-in confirmation email, consent campaigns, consent status tracking, update-profile link, privacy policy link on forms | Official GDPR page (dated); current help article not reached | All | https://www.zoho.com/campaigns/gdpr-features.html | OBSERVED (dated) |
| Segmentation and scoring | AND/OR segments, contact scoring and tags | Scoring and tags at Professional | Professional | https://www.zoho.com/campaigns/pricing.html | OBSERVED |
| Zia in Campaigns | Generative AI content, subject line recommendations, product recommendations | Generative AI from Free | Free and up | https://www.zoho.com/campaigns/pricing.html | OBSERVED |
| Reports | Opens, clicks, unsubscribes, bounces; advanced analytics on paid | Attribution to revenue: not confirmed | Standard | https://www.zoho.com/campaigns/features.html | OBSERVED |
| Lead ads sync | Facebook, Instagram, LinkedIn, TikTok lead forms into Bigin | Express | Bigin Express | https://www.bigin.com/pricing.html | OBSERVED |
| Landing pages, review requests, social posting | Separate Zoho apps (LandingPage, Social) | Not part of the apps in scope; Zoho Social is in Zoho One | Zoho One | https://www.zoho.com/one/plan-details.html | INFERRED |

### 3.7 Money (Zoho Invoice, Books, Bigin payment links)

| Feature | What the user can do | Notable details and limits | Tier | Source | Label |
|---|---|---|---|---|---|
| Quotes to invoices | Create quotes with expiry, convert accepted quotes to invoices | | Zoho Invoice Free | https://www.zoho.com/invoice/features/ | OBSERVED |
| Invoices | Create, schedule, digitally sign, multi-language templates | | Free | https://www.zoho.com/invoice/features/ | OBSERVED |
| Recurring invoices and reminders | Auto-bill on a schedule; automated upcoming and overdue reminders | | Free | https://www.zoho.com/invoice/features/ | OBSERVED |
| Online payments | "integrated with over 10 payment gateways" | Gateways not named on features page | Free | https://www.zoho.com/invoice/features/ | OBSERVED |
| Credit notes, expenses, time tracking | Record refunds, bill expenses and hours | | Free | https://www.zoho.com/invoice/features/ | OBSERVED |
| Customer portal | Clients view quotes and invoices and pay | | Free | https://www.zoho.com/invoice/features/ | OBSERVED |
| Retainer invoices, bank feeds, multi-currency, inventory | Accounting-grade features | Zoho Books Standard and up (bank feeds Standard, retainers and multi-currency Professional) | Books | https://www.zoho.com/us/books/pricing/ | OBSERVED |
| Payment links in CRM | Send Stripe, PayPal, Razorpay, Paytm links from a deal | Bigin Express | Bigin Express | https://www.bigin.com/pricing.html | OBSERVED |
| Products in CRM | Products module | Bigin Free | Free | https://www.bigin.com/pricing.html | OBSERVED |
| Checkout forms, order bumps | Sales checkout pages | Zoho Checkout is a separate app; not confirmed in scope | | | not confirmed |
| Accounting sync | Bigin to Zoho Books, Zoho Invoice, QuickBooks | Express | Bigin Express | https://www.bigin.com/pricing.html | OBSERVED |

### 3.8 Reporting

| Feature | What the user can do | Notable details and limits | Tier | Source | Label |
|---|---|---|---|---|---|
| Bigin dashboards | Standard charts and KPIs; customizable dashboards; target meter | Customizable from Express, target meter at Premier | Bigin | https://www.bigin.com/pricing.html | OBSERVED |
| Zoho Invoice reports | About 30 reports plus dashboard | | Free | https://www.zoho.com/invoice/features/ | OBSERVED |
| Bookings reports | Day, week, month report types | | Bookings | https://www.zoho.com/bookings/features.html | OBSERVED |
| SalesIQ real-time reporting | Live operator and chat reports | Professional | SalesIQ Professional | https://www.zoho.com/salesiq/pricing.html | OBSERVED |
| Cross-app analytics | Zoho Analytics in Zoho One | Separate app | Zoho One | https://www.zoho.com/one/plan-details.html | INFERRED |

### 3.9 AI (Zia)

| Feature | What the user can do | Notable details and limits | Tier | Source | Label |
|---|---|---|---|---|---|
| Bigin Zia | Writing Assistant, Record Summary, Email Reply Assistant, CrossSell Genie, Churn Analyzer, smart summaries of WhatsApp threads, mobile call transcripts and email translation | 1,000 credits/mo Premier, 3,000 Bigin 360 | Premier | https://www.bigin.com/pricing.html ; https://www.bigin.com/features.html | OBSERVED |
| Zia Agents (Bigin) | Follow-ups, cross-sell, lost-deal explanations | Premier | Premier | https://www.bigin.com/features.html | OBSERVED |
| SalesIQ Zia | Answer Bot (Gen AI), hybrid bots, AI criteria routing and tags, company profile enrichment, chat translation | Routing and tags at Professional; Answer Bot at Enterprise | Professional / Enterprise | https://www.zoho.com/salesiq/pricing.html | OBSERVED |
| Flow Zia | Build a flow from plain English; text utilities; agentic actions | Plan gating not stated | Flow | https://www.zoho.com/flow/pricing.html | OBSERVED |
| Campaigns Zia | Generate and refine content, subject lines, product recommendations | Generative AI from Free | Free and up | https://www.zoho.com/campaigns/pricing.html | OBSERVED |
| Zoho CRM Zia | AI agents (Professional), predictive intelligence, extended Zia at Enterprise | | Zoho CRM Professional / Enterprise | https://www.zoho.com/crm/zohocrm-pricing.html | OBSERVED |

---

## 4. HubSpot Starter Customer Platform (Marketing, Sales, Service, Content, Commerce/Revenue, Data hubs at Starter)

### 4.1 Pricing and caps

| Feature | What the user can do | Notable details and limits | Tier | Source | Label |
|---|---|---|---|---|---|
| Starter Customer Platform | All hubs at Starter, per seat | List "$20/month per seat" Core Seat; promo "$7/month per seat billed annually or $10/month per seat billed monthly" for new customers; "Unlimited users with seats purchased per user"; View-Only and Partner seats free; no onboarding fee | Starter | https://www.hubspot.com/products/crm/starter ; https://legal.hubspot.com/hubspot-product-and-services-catalog | OBSERVED |
| Marketing contacts | 1,000 marketing contacts included | Email sends "5 times per contact per calendar month" (also quoted as 2,000 sends/month with branding); additional contacts purchasable, price not on page | Starter | https://www.hubspot.com/pricing/marketing ; https://legal.hubspot.com/hubspot-product-and-services-catalog | OBSERVED |
| HubSpot Credits | 500 credits per month for AI agents and features | Reset monthly, no rollover; extra $0.010 per credit pay-as-you-go or $10 per 1,000 pack; "not additive across products" | Starter | https://legal.hubspot.com/hubspot-product-and-services-catalog | OBSERVED |
| Overage model | No overage fees; exceeding caps bumps you to Professional | "HubSpot bumps you up to its Professional Customer Platform to accommodate increased limits" | Starter | https://www.hubspot.com/products/crm/starter | OBSERVED |
| API | 250,000 daily API calls, 100 requests per 10 seconds | Free and Starter share these | Starter | https://legal.hubspot.com/hubspot-product-and-services-catalog/technical-limits | OBSERVED |
| Custom properties | 1,000 (Free has 10) | | Starter | https://www.hubspot.com/products/crm/starter | OBSERVED |

### 4.2 CRM (Smart CRM)

| Feature | What the user can do | Notable details and limits | Tier | Source | Label |
|---|---|---|---|---|---|
| Contacts, companies, deals, tickets, custom properties | Standard object model with associations | Per-record association limit 250,000; 1,000 custom properties | Starter | https://legal.hubspot.com/hubspot-product-and-services-catalog/technical-limits | OBSERVED |
| Pipelines | Deal and ticket pipelines | "up to 15 total per account across object types" on pricing page (third parties often say 2 per hub) | Starter | https://www.hubspot.com/pricing/crm | OBSERVED |
| Segments (lists) | Active and static lists | Marketing: 10 active / 1,000 static on one page, 50 active / 1,000 static on another | Starter | https://www.hubspot.com/pricing/crm ; https://www.hubspot.com/pricing/marketing | OBSERVED (conflicting numbers) |
| Lead scoring | Up to 5 scores | | Starter | https://www.hubspot.com/pricing/marketing | OBSERVED |
| Import and data sync | CSV import, Data Hub Starter data sync, daily data quality scan (beta) | | Starter | https://www.hubspot.com/pricing/crm | OBSERVED |
| Duplicate handling | Automatic dedupe by email and company domain on create and import; Manage duplicates tool | Knowledge article not reachable in this pass; tool tier gate not confirmed | Starter | https://knowledge.hubspot.com/records/deduplicate-records-in-hubspot | INFERRED |
| Consent | Subscription types, GDPR functionality, legal basis fields, cookie consent banners | Content Hub Starter: "Cookie consent banners: up to 100"; GDPR toggle article not reached | Starter | https://www.hubspot.com/pricing/crm | OBSERVED (banners), INFERRED (GDPR toggle) |
| Tasks and notes | Tasks, notes, email and call logging on records | Core CRM | Starter | https://www.hubspot.com/products/crm/starter | OBSERVED |
| Email sync | Gmail and Outlook two-way | "Email Sync" | Starter | https://www.hubspot.com/products/crm/starter | OBSERVED |

### 4.3 Conversations

| Feature | What the user can do | Notable details and limits | Tier | Source | Label |
|---|---|---|---|---|---|
| Conversations inbox | Shared inbox with team email, live chat, Facebook Messenger, forms | No channel-specific tier for these four; routing to users requires a Sales or Service seat; accounts created after April 1, 2024 cannot create tickets from inbox channels (must use help desk) | Starter | https://knowledge.hubspot.com/inbox/connect-channels-to-the-conversations-inbox | OBSERVED |
| Help desk | Ticket workspace with SLAs and channels | Help desk channels article lists only Service Hub Professional and Enterprise | Professional | https://knowledge.hubspot.com/help-desk/connect-channels-to-help-desk | OBSERVED |
| WhatsApp | WhatsApp Business channel | "Requires a Marketing Hub or Service Hub Professional or Enterprise subscription" | Professional | https://knowledge.hubspot.com/inbox/connect-channels-to-the-conversations-inbox | OBSERVED |
| SMS | Two-way SMS in inbox and marketing SMS | "Requires a Marketing Hub Professional or Enterprise subscription plus the SMS Access Add-on" | Professional + add-on | https://knowledge.hubspot.com/inbox/connect-channels-to-the-conversations-inbox | OBSERVED |
| Calling | Click-to-call from records with HubSpot number | "500 minutes, one HubSpot-provided phone number (not supported in all countries)"; calling as an inbox channel requires Professional | Starter (record calling) / Professional (inbox channel) | https://www.hubspot.com/pricing/crm ; https://knowledge.hubspot.com/inbox/connect-channels-to-the-conversations-inbox | OBSERVED |
| Live chat and bots | Website chat widget and conversational bots | "Live chat: includes HubSpot branding"; "Conversational bots: limited features"; Messenger "Simple messages and quick replies only" | Starter | https://www.hubspot.com/pricing/crm ; https://www.hubspot.com/pricing/marketing | OBSERVED |
| Templates and snippets | Sales email templates and canned snippets | "up to 3" templates per account and "up to 3" snippets | Starter | https://www.hubspot.com/pricing/crm | OBSERVED |
| 1:1 email | Send tracked email from CRM | "includes HubSpot branding" | Starter | https://www.hubspot.com/pricing/crm | OBSERVED |
| Ticketing | Ticket records and pipelines | Listed with no limits | Starter | https://www.hubspot.com/pricing/crm | OBSERVED |

### 4.4 Scheduling (Meetings tool)

| Feature | What the user can do | Notable details and limits | Tier | Source | Label |
|---|---|---|---|---|---|
| Personal meetings link | One personal scheduling page | "one personal meetings link, with HubSpot branding" | Starter | https://www.hubspot.com/pricing/crm | OBSERVED |
| Team scheduling | Group pages (all members free) and round robin pages with rotations | "require a Sales Hub or Service Hub Starter, Professional, or Enterprise subscription"; members need an assigned seat | Starter | https://knowledge.hubspot.com/meetings-tool/create-and-edit-scheduling-pages | OBSERVED |
| Payment at booking | Collect payment when a meeting is booked | "Collect payments" switch with HubSpot Payments or Stripe; checkout appears on booking | Starter (with payments) | https://knowledge.hubspot.com/meetings-tool/create-and-edit-scheduling-pages | OBSERVED |
| Calendar sync | Google and Office 365 two-way | Required for availability | Starter | https://knowledge.hubspot.com/meetings-tool/create-a-meetings-link | OBSERVED |
| Reminders | Confirmation and reminder emails | Standard meetings reminders; SMS reminders not available at Starter (SMS gated) | Starter | https://knowledge.hubspot.com/meetings-tool/create-and-edit-scheduling-pages | INFERRED |
| Service appointment types, deposits, buffers | Multiple durations, buffer time, minimum notice | Buffers and durations exist on meetings links; deposits only via full payment link | Starter | https://knowledge.hubspot.com/meetings-tool/create-and-edit-scheduling-pages | INFERRED |

### 4.5 Automation

| Feature | What the user can do | Notable details and limits | Tier | Source | Label |
|---|---|---|---|---|---|
| Simple form automation | Up to 10 actions after a form submit | "In a Marketing Hub Starter account, you can add up to 10 actions in a simple workflow and create one simple workflow for each form" | Marketing Hub Starter | https://knowledge.hubspot.com/forms/form-automations | OBSERVED |
| Email automation | One automated action after a marketing email | "1 automated action" | Marketing Hub Starter | https://www.hubspot.com/pricing/crm | OBSERVED |
| Sales automation | Deal-stage and task automation | "up to 50 workflows, with restricted triggers and actions" | Sales Hub Starter | https://www.hubspot.com/pricing/crm | OBSERVED |
| Ticket automation | Status-change emails and basic ticket actions | Third-party description; official text not reached | Service Hub Starter | https://saufter.io/?p=18535 | INFERRED |
| Full workflows (branching, delays, enrollment triggers, goals) | Visual workflow builder | Professional: "Up to 300 workflows for 10 teams"; agentic workflows Professional and up | Professional | https://www.hubspot.com/pricing/marketing ; https://knowledge.hubspot.com/ai/use-breeze | OBSERVED |
| Sequences | Automated 1:1 email and task cadences | Professional | Professional | https://www.hubspot.com/pricing/crm | INFERRED |
| Agent Builder | Build custom agents on a canvas using CRM data | "Agent Hub is included in all Starter, Professional, and Enterprise editions"; custom agents consume credits | Starter | https://www.hubspot.com/products/artificial-intelligence | OBSERVED |
| Run logs | Workflow history and enrollment logs | Available on workflows; simple automation shows action history | Starter | https://knowledge.hubspot.com/forms/form-automations | INFERRED |

### 4.6 Marketing

| Feature | What the user can do | Notable details and limits | Tier | Source | Label |
|---|---|---|---|---|---|
| Marketing email | Drag and drop editor, templates | "2,000 email sends per calendar month, with HubSpot branding"; 5x contact tier | Starter | https://www.hubspot.com/pricing/marketing | OBSERVED |
| Forms and pop-ups | Embedded and standalone forms, pop-up forms | Account cap 10,000 forms; branding removed at Starter | Starter | https://legal.hubspot.com/hubspot-product-and-services-catalog/technical-limits | OBSERVED |
| Landing pages and website pages | Build pages | Content Hub Starter: "Landing pages: up to 30 total, with HubSpot branding"; "Website pages: up to 30 total, with HubSpot branding; favicon not customizable"; one blog, 100 posts; 3 languages | Content Hub Starter | https://www.hubspot.com/pricing/crm | OBSERVED |
| Ads | Connect ad accounts, create audiences, sync conversions | "3 connected accounts, website audience creation only", 2 retargeting audiences, 50 synced conversion events | Starter | https://www.hubspot.com/pricing/marketing | OBSERVED |
| Social | Schedule posts across accounts | "50 connected accounts, 10K posts per month, and post scheduling" | Marketing Hub Starter | https://www.hubspot.com/pricing/marketing | OBSERVED |
| SMS marketing | Send SMS campaigns | Marketing Hub Professional plus SMS add-on | Professional | https://knowledge.hubspot.com/inbox/connect-channels-to-the-conversations-inbox | OBSERVED |
| Review requests and reputation | Review request automation, listings | Not a HubSpot feature; via marketplace apps | n/a | https://www.hubspot.com/pricing/marketing | not confirmed |
| CTAs | Calls to action | No targeting by device, country or referral URL at Starter | Starter | https://www.hubspot.com/pricing/crm | OBSERVED |
| A/B testing | Email and page A/B tests | Professional (table values unclear) | Professional | https://www.hubspot.com/pricing/marketing | INFERRED |
| Attribution and reporting | Standard web analytics dashboard; 10 dashboards x 50 reports; custom reporting Professional | "10 dashboards, 50 reports per dashboard" | Starter | https://www.hubspot.com/pricing/crm | OBSERVED |
| SEO | Basic recommendations | "SEO recommendations: basic only" | Starter | https://www.hubspot.com/pricing/crm | OBSERVED |

### 4.7 Money (Commerce Hub, now Revenue Hub, and HubSpot Payments)

| Feature | What the user can do | Notable details and limits | Tier | Source | Label |
|---|---|---|---|---|---|
| HubSpot Payments | Accept card, ACH, BNPL | US, UK, Canada; "available to all paid HubSpot customers"; card 2.9%, ACH 0.8% max $10, BNPL 5.99%; platform fee free one year then 0.5% (ACH capped $10) | Starter and up | https://www.hubspot.com/pricing/commerce ; https://www.hubspot.com/products/commerce | OBSERVED |
| Stripe processing option | Use your own Stripe | Platform fee 0.75%; Stripe 2.9% + $0.30, ACH 0.8% max $5, disputes $15 | All paid | https://www.hubspot.com/pricing/commerce | OBSERVED |
| Invoices and payment links | Branded invoices tied to records; payment links | Free tier includes invoices, payment links, subscriptions; "Billing and payments are available across all plans" | Free and up | https://www.hubspot.com/products/commerce ; https://www.hubspot.com/pricing/commerce | OBSERVED |
| Subscriptions | Recurring billing with mid-contract changes and retries | "Subscription Retries" listed | Free and up | https://www.hubspot.com/pricing/commerce | OBSERVED |
| Quotes | Build quotes from deal with pricing rules | Commerce page: "Quoting tools are available with Professional or Enterprise"; basic quotes exist in Sales Hub (not confirmed for Starter in this pass) | Professional (CPQ) | https://www.hubspot.com/pricing/commerce | OBSERVED |
| E-signature | Sign quotes | 25 per user per month Professional, 50 Enterprise | Professional | https://www.hubspot.com/products/commerce | OBSERVED |
| Products library | Product catalog | "Up to 100 products" Free; 15 million Professional | Free / Professional | https://www.hubspot.com/pricing/commerce | OBSERVED |
| Accounting sync | QuickBooks Online integration, Xero (Beta) | Listed; tier not clear | Starter | https://www.hubspot.com/pricing/commerce | OBSERVED |
| Revenue agent | AI follow-up on overdue invoices | Beta, credits | Paid | https://www.hubspot.com/products/commerce | OBSERVED |
| Checkout forms, order bumps | Sales pages with upsells | Not a HubSpot concept; payment links only | n/a | | not confirmed |

### 4.8 Reporting and dashboards

| Feature | What the user can do | Notable details and limits | Tier | Source | Label |
|---|---|---|---|---|---|
| Dashboards | Prebuilt dashboards and reports | "10 dashboards, 50 reports per dashboard" | Starter | https://www.hubspot.com/pricing/crm | OBSERVED |
| Custom report builder | Build cross-object reports | Professional | Professional | https://www.hubspot.com/pricing/marketing | OBSERVED |
| Email health and web analytics | Standard web analytics dashboard | | Starter | https://www.hubspot.com/pricing/marketing | OBSERVED |
| Goals | Sales goals | "limited features" | Starter | https://www.hubspot.com/pricing/crm | OBSERVED |

### 4.9 AI (Breeze)

| Feature | What the user can do | Notable details and limits | Tier | Source | Label |
|---|---|---|---|---|---|
| Breeze Assistant | In-app AI assistant for drafting, summarizing, finding records, reaching agents | Included in Core Seat: "built-in AI with Breeze Assistant" | Starter | https://legal.hubspot.com/hubspot-product-and-services-catalog | OBSERVED |
| Agent Hub and Agent Builder | Build custom agents on a canvas | "Agent Hub is included in all Starter, Professional, and Enterprise editions"; "Custom agents built in agent builder consume HubSpot Credits" | Starter | https://www.hubspot.com/products/artificial-intelligence | OBSERVED |
| Prospecting Agent | Monitor buying signals, launch personalized outreach | Listed on Starter product page; product page says Starter, Professional, Enterprise; knowledge base says "A Professional or Enterprise subscription is required to use some HubSpot-built agents" (conflict) | Starter per product page | https://www.hubspot.com/products/crm/starter ; https://knowledge.hubspot.com/ai/use-breeze | OBSERVED (conflicting) |
| Data Agent | Ask questions over CRM, calls, documents | Listed on Starter page; knowledge base lists it under Professional/Enterprise requirement | Starter per product page | https://www.hubspot.com/products/crm/starter | OBSERVED (conflicting) |
| Customer Agent | Resolve inquiries across channels | Knowledge base: Professional or Enterprise; third parties agree | Professional | https://knowledge.hubspot.com/ai/use-breeze | OBSERVED |
| Content Agent, Campaign Agent, Nurture Agent, Revenue Agent, Smart Deal Progression | Content generation, campaign planning, personalized nurture emails, invoice follow-up, next-step suggestions after calls | Most run on credits; Content & Image Generation and AI Meeting Prep & Notetaker listed on Starter page | Mixed | https://www.hubspot.com/products/artificial-intelligence ; https://www.hubspot.com/products/crm/starter | OBSERVED |
| Agentic workflows and AEO | AI steps inside workflows; answer engine optimization | Professional or Enterprise | Professional | https://knowledge.hubspot.com/ai/use-breeze | OBSERVED |
| Breeze Intelligence (enrichment, buyer intent) | Enrich records, see intent | "enriched data" in Core Seat; credits for enrichment | Starter | https://legal.hubspot.com/hubspot-product-and-services-catalog | OBSERVED |

---

## 5. Cross-product analysis

### 5.1 Common core across all four

Every one of the four offers, at its small business entry tier:

- Contact records with custom fields, tags or labels, notes and tasks, plus at least one visual deal pipeline with stages (Thryv's pipeline is the weakest: lead routing rather than a deal board).
- Two-way email sync (Gmail and Outlook) and 1:1 email from the record.
- A native booking page with calendar sync to Google and Microsoft and automated reminders.
- A marketing email builder (drag and drop) with templates and basic engagement reporting.
- Lead capture forms that write directly into the CRM and can start a follow-up.
- Some form of "when X then Y" automation at entry tier, with the full branching builder gated to a higher tier or a separate product (Keap Advanced Automations, HubSpot Professional workflows, Zoho Flow or Bigin advanced automations, Thryv via Keap).
- Invoices and online payment collection with a native processor option (Keap Pay, ThryvPay, HubSpot Payments, Zoho Books/Invoice gateways) plus Stripe and PayPal.
- Recurring billing or subscriptions.
- A built-in AI writing assistant for emails, with tier or credit metering.
- Mobile apps for iOS and Android.
- Zapier and a public API.
- Usage metering on something the business cannot predict: contacts (Keap, HubSpot, Campaigns), texts and minutes (Keap, Thryv), tasks (Flow), AI credits (HubSpot, Bigin), inbox channels (Thryv).

### 5.2 Unique or notably better features per product

Keap
- Two numbers by design: a Business Line for 1:1 calls and texts on the owner's own phone (auto-replies, voicemail, caller ID, snooze) and a separate Marketing Number for broadcasts and automated texts, with a reply inbox that shows which automation started a thread.
- Sales-page commerce in the CRM: checkout forms, order bumps, one-click upsells, promo codes, pay-from-quote, recurring payments managed on the contact record, credit card expiry reminders.
- Automation history on every contact and automation-stage reports (who is where).
- AI Automation Assistant builds a whole campaign's copy from a company profile and persona, not just one email.
- Mandatory paid implementation (done-for-you import and setup) is a product feature as much as a cost.

Thryv
- Command Center free tier: unified inbox (Gmail, Outlook, Facebook, Instagram, SMS, phone, video, webchat), new business number, voicemail transcription, TeamChat, up to 3 to 5 users at no cost.
- Local marketing stack nobody else bundles: listings sync to 30 to 60+ directories, Google Business Profile optimization, Yelp Request a Quote, Digital Marketing Score, competitor ranking, trackable call numbers, done-for-you Boosts.
- Client portal where customers pay, reschedule, upload paperwork and get directions.
- ThryvPay: ACH capped at $9, surcharging, tipping, installment plans, Tap to Pay, next-day funding, QuickBooks reconciliation, no monthly fee.
- Estimate to invoice to e-signature in one flow (5 free e-signatures a month).
- AI Lead Flow (score, tag, route, follow up with "no manual effort") and AI Call Analysis across Marketing Center and Keap.

Zoho
- Price floor: Bigin from $7 per user, Zoho Invoice free, Bookings free for one user, Campaigns free to 2,000 contacts, SalesIQ free for 3 operators, Flow free 100 tasks. A one-person business can run the whole stack for under $10 a month.
- Team Pipelines and Connected Pipelines: separate pipelines per function sharing one customer record, with hand-off automation between them.
- Stage transition rules and Zoho CRM Blueprint enforce process.
- WhatsApp Business inside the CRM at $9 per user, with Zia summaries and reply suggestions; SalesIQ adds Instagram, Messenger, Telegram, LINE, WeChat, audio and video calls and Gen AI Answer Bot.
- MCP support on the free CRM tier so external AI tools (ChatGPT, Claude) can read and act on CRM data.
- Bookings: collective and resource booking types, round robin with four algorithms, workspaces per location, custom domain and CSS.
- Email-In and File Cabinet toppings (create records from inbound email, collect documents via one link).
- Zoho Flow builds a flow from a plain-English description and exposes run history and auto rerun.

HubSpot Starter
- One per-seat price for every hub plus 500 AI credits; unlimited free view-only seats; no onboarding fee; no overage fees (you are upgraded instead).
- Agent Hub and Agent Builder at Starter: build custom agents on a canvas over CRM data; Prospecting Agent and Data Agent marketed at Starter (knowledge base conflicts).
- Payments as a platform: HubSpot Payments or bring-your-own Stripe with a transparent platform fee, payment links, invoices, subscriptions with retries, payment collection on meeting booking, a Revenue Agent chasing overdue invoices.
- Content Hub Starter gives a website and blog builder, cookie consent banners (up to 100, geotargeted) and multi-language pages.
- Ads management (3 accounts, audience creation, conversion sync) and social scheduling (50 accounts, 10K posts) at Starter.
- Group and round robin team scheduling at Starter.
- Data Hub daily data quality scan.

### 5.3 Pain points users report (sourced)

- Keap: price and value ("$299/mo" entry), mandatory implementation packages ($499 to $3,500 reported), aggressive price increases without new features, billing described as unauthorized charges, cancellation "extremely hard", dated interface, weak support, deliverability blocks where unsubscribe feedback counts as complaints. Trustpilot 1.2/5 on about 491 reviews; Capterra 4.1/5. Sources: https://www.trustpilot.com/review/infusionsoft.com ; https://hackceleration.com/labs/review/keap ; https://contractortoolstack.com/software/keap/ ; https://prospeo.io/s/keap-alternatives
- Thryv: cancellation and auto-renewal (30-day written notice, separate cancellation per service, billing after cancel, collections threats), six-month minimum terms (Australia FAQ confirms), trials converting to full price, marketing that did not produce leads, 350 BBB complaints in three years despite A+ rating. Sources: https://www.consumeraffairs.com/business/dex_yellow_pages.html ; https://prod.bbb.org/us/tx/dallas/profile/marketing-software/thryv-0875-90044496/complaints?page=3 ; https://bestguide.com/review/thryv/ ; https://www.thryv.com/faqs-2024/
- Zoho: Bigin "cannot customize it as we want", no native custom functions (needs extension or Sigma), Zoho Contracts cannot link to Bigin, slab pricing "lacks clarity", Flow task top-ups "too expensive" inside Zoho One, support quality complaints on Zoho's own forum, integration between Zoho apps not as seamless as marketed. Sources: https://www.peerspot.com/questions/what-needs-improvement-with-bigin-by-zoho-crm ; https://g2.com/products/bigin-by-zoho-crm/reviews/bigin-by-zoho-crm-review-10677985 ; https://help.zoho.com/portal/en-gb/community/topic/upgrade-zoho-flow-tasks-in-zoho-one-is-too-expensive ; https://help.zoho.com/portal/de/community/topic/terrible-customer-support-experiences-with-zoho-the-norm
- HubSpot Starter: the Starter to Professional jump ("way too steep", Marketing Pro about $800 to $890/month plus onboarding $1,500 to $3,000 and annual contract), automation gap is "the single biggest pain point", HubSpot branding on Starter emails, chat, pages and meeting links, calling and SMS limits, no deal creation from forms at Starter, contact caps hit quickly, Breeze agent tiering is confusing. Sources: https://community.latenode.com/t/hubspots-pricing-structure-needs-improvement-between-tiers/34244 ; https://community.hubspot.com/t5/Ask-Me-Anything-and-Panel/Closed-AMA-New-Automation-tools-for-Starter-Customers/td-p/656590 ; https://www.kixie.com/sales-blog/hubspot-starter-vs-professional-how-to-get-pro-features-for-less/ ; https://www.eesel.ai/blog/is-hubspot-breeze-worth-it

### 5.4 What this tells us a template must have

1. One customer record that every module writes to (appointments, payments, messages, automation history), with per-contact automation history visible on the record, as Keap does.
2. Two phone identities out of the box: a 1:1 business line (calls, texts, voicemail transcription, auto-replies, business hours) and a separate marketing sender for broadcasts, with replies threading back into the inbox and showing which automation started them.
3. A unified inbox that includes SMS, email, WhatsApp, Facebook and Instagram DMs, web chat and calls on day one, with no channel count cap; HubSpot gates WhatsApp, SMS and inbox calling to Professional and Thryv caps channels, which is the clearest gap to exploit.
4. A client portal (pay, reschedule, upload documents, sign) as a first-class surface, not a plug-in.
5. Scheduling with multiple appointment types, group and collective types, round robin, buffers, deposits at booking and reminders by text and email, since none of the four has all of these at entry tier.
6. Money as a platform: estimates to invoices to e-signature to payment in one flow, recurring billing with retries and card-expiry reminders, payment links, checkout forms with order bumps and promo codes, tipping and surcharging options, ACH with a fee cap, QuickBooks and Xero sync, and transparent processor fees.
7. A full automation builder (triggers, conditions, delays, goals, multi-branch) at the base tier, with run logs per contact and per run; the "simple automation at entry, real automation at 4x the price" pattern is the most hated gate across HubSpot and Keap.
8. Consent as data: per-channel opt-in status, double opt-in, consent timestamps and source, quiet hours and A2P registration state for SMS, GDPR fields, cookie banner; Keap and Thryv barely surface this.
9. Duplicate prevention at import and on create (email, phone, domain), a merge tool, and a done-for-you style import that maps messy spreadsheets (Keap's mandatory implementation shows people will pay for this).
10. Local marketing basics inside the platform: review requests with automation, review monitoring and AI reply, Google Business Profile and listings sync, since Thryv is the only one of the four with it and it is the main reason local businesses buy Thryv.
11. Landing pages and forms with lead source attribution, and a simple website builder with a custom domain and no vendor branding.
12. Social scheduling with AI captions and images, because HubSpot and Thryv include it and Keap and Bigin do not.
13. Team pipelines (sales, onboarding, service) that share one record and hand off automatically, plus stage transition rules, borrowed from Bigin.
14. AI that acts, not just drafts: lead scoring and routing (Thryv), campaign generation from a company profile and persona (Keap), record and thread summaries, reply suggestions, call transcription and analysis (Thryv, Bigin), overdue invoice chasing (HubSpot Revenue Agent), and an agent builder over the client's own data (HubSpot, Bigin via MCP). Expose an MCP endpoint so external AI tools can use the data.
15. Reporting that ties marketing to revenue: pipeline conversion by stage, time in stage, forecast, email and text engagement by automation, lead source ROI, with a report library and pinning, and no 10-dashboard cap.
16. No vendor branding anywhere on the client's surfaces, at any price.
17. Pricing that avoids the four resented gates: no mandatory implementation fee, no contact-tier cliff, no "upgrade to raise the cap" bump, no multi-month lock-in with 30-day written-notice cancellation; clear per-unit metering for texts, minutes and AI credits with top-ups the owner can enable.
18. Transparent usage dashboards for metered items (texts, minutes, AI credits, automation runs) so the owner sees what they are consuming before the bill.
19. Zapier, webhooks, a public REST API with SDKs, and native QuickBooks and Google integrations at the base tier.
20. A free or very cheap single-user entry point (Zoho's floor is under $10 a month) so solo operators start on the platform and grow into paid modules.

---

## 6. Unconfirmed items (flagged for a follow-up pass)

- Keap: Keap Pay processing rate; whether Pro and Max are still sold to new customers (official pricing page shows one plan); appointment types, buffers, round robin and deposits; call recording on Business Line; current contents of the October and December 2025 product updates (detail pages returned 404 under guessed slugs); QuickBooks or Xero native sync.
- Thryv: Business Center tier prices and user caps (official help article returned 403; third parties say $199 / $349 / $499 and "unlimited users" vs "up to 10"); Command Center Plus and Professional per-user prices; scheduling detail (types, deposits, buffers); CRM import and duplicate handling; whether WhatsApp is an inbox channel; AI receptionist and lead grading.
- Zoho: Bigin workflow model detail (help host did not resolve); Bookings deposits, buffers and cancellation policy; Campaigns current consent-management article; SalesIQ and Zoho CRM per-user prices (pages render prices client-side); Zoho Invoice free-plan invoice cap.
- HubSpot: Starter marketing contact add-on price; which Breeze agents are truly usable at Starter (product pages say Prospecting and Data agents, knowledge base says Professional for "some HubSpot-built agents"); the Manage duplicates tool tier; GDPR functionality article; basic quotes at Starter; pipeline count (15 total per account on pricing page vs 2 per hub in third-party summaries); segments count (10 vs 50 active).
- Web search budget for this session was exhausted before the last 8 planned lookups; those were replaced with direct fetches where possible.
