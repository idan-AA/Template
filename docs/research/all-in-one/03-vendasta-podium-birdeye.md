# Vendasta, Podium, Birdeye: user-level feature inventory (local business inbox and reputation all-in-ones)

Research date: 2026-11-06. Method: official feature pages, docs and help centers first, third-party pricing and review sites second (for pricing that vendors do not publish, and for pain points). About 70 searches and fetches. Every row cites a source and is labeled OBSERVED (seen on the cited page) or INFERRED (reasonable reading of a page or a third-party summary, not confirmed by the vendor). Where nothing confirmed a claim, the row says "not confirmed".

Scope note: Vendasta is sold to agencies and partners who resell to local businesses; its end-user surface is Business App. Podium and Birdeye sell directly to local businesses, per location. All three publish little or no pricing; Vendasta is the exception and publishes partner plan prices.

Blocked sources: G2 (403), Capterra and Software Advice (403), Birdeye Helpjuice (402, read via search snippets only), Podium knowledgebase (Salesforce site did not render), several docs.vendasta.com sub-paths (404). Pain points therefore lean on Trustpilot, BBB, and third-party review blogs that are often competitor-published; treat their numbers as directional.

---

## 1. Vendasta (vendasta.com)

Products covered: Business App (client dashboard), Conversations (inbox) and Conversations AI, Reputation AI (Reputation Management), Snapshot Report, Marketplace, Partner Center, white label, multi-location, CRM, Local SEO and Listing Sync, AI Workforce, pricing.

### 1.1 Unified inbox (Conversations, Conversations AI)

| Feature | What the user can do | Notable details and limits | Tier | Source | Label |
|---|---|---|---|---|---|
| Channels in one inbox | Read and reply to web chat, SMS, email, Facebook, Instagram, WhatsApp, and phone calls in one shared Conversations inbox inside Business App | Docs describe Conversations as "Unified messaging, chat, email, SMS, and social media management". SMS is available only to US and Canada businesses; international businesses get web chat, email, Facebook, Instagram, WhatsApp | All plans (inbox included on every partner plan) | https://docs.vendasta.com/business-app/ and https://docs.vendasta.com/business-app/conversations/conversations-ai/ | OBSERVED |
| Google Business Messages | Not offered | Google shut down Business Messages on 2024-07-31; no Vendasta page lists it as a channel | n/a | https://developers.google.com/business-communications/business-messages (shutdown notice) | INFERRED |
| AI web chat replies | Let the AI employee answer website chat 24/7, capture leads, qualify, hand off to a human | "Captures contact details from all communication channels"; lead summaries require Lead Capture enabled on the AI employee | Conversations AI Standard (all editions) | https://docs.vendasta.com/business-app/conversations/conversations-ai/ | OBSERVED |
| AI on WhatsApp, Facebook, Instagram | AI replies on social DMs and WhatsApp | Listed as "Yes" in all editions | Standard and up | same | OBSERVED |
| AI on SMS | AI replies on SMS threads | US and Canada only | Conversations AI Pro and Premium | same | OBSERVED |
| Missed call text back | Auto-text a caller when a call is missed; call appears in Inbox and is logged on the CRM contact | Setup path: Business App > Administration > Inbox Settings > Phone & SMS > Settings | Conversations AI Pro and Premium | same, plus search summary of help article | OBSERVED |
| AI voice receptionist | AI answers phone calls, books appointments by voice, transfers to a human on request | 300 included minutes per month, calls capped at 10 minutes, overage "approximately $0.10/min USD". Voice available in US, Canada, Italy | Conversations AI Premium | same | OBSERVED |
| Email handled by AI | AI "manages email inquiries through unified Conversations interface" | Not tied to an edition on the docs page | Unclear | same | OBSERVED (edition INFERRED) |
| Custom capabilities (tools) | Connect the AI to external APIs, for example "Check appointment availability in booking systems", create appointments, update CRM | Configured as Tools and Capabilities in Partner Center > AI > Workforce | All editions | https://docs.vendasta.com/ai/ and Conversations AI page | OBSERVED |
| Knowledge base | Upload documents and FAQs, connect website sources that auto-pull content, use business profile hours, location, services | | All editions | https://docs.vendasta.com/ai/ | OBSERVED |
| Human handoff | AI directs complex inquiries to staff; voice transfers to human when requested | | All editions (voice: Premium) | Conversations AI page | OBSERVED |
| Assignment, templates, scheduled and bulk messages inside inbox | Not confirmed on fetched pages | docs.vendasta.com/inbox returned 404; the Conversations product page was not reachable. Bulk SMS lives in Campaigns Pro, not the inbox | n/a | https://www.vendasta.com/pricing/ (Campaigns Pro listed) | not confirmed |
| Phone numbers | Publish a unique AI phone number or add a snippet to the website to deploy the receptionist | Numbers provisioned through the platform; carrier and pricing details not found | Premium for voice | https://vendasta.com/ai/receptionist (search summary) | INFERRED |

### 1.2 Reputation (Reputation AI, formerly Reputation Management)

| Feature | What the user can do | Notable details and limits | Tier | Source | Label |
|---|---|---|---|---|---|
| Review monitoring | See every new review from Google, Facebook, and "40+ other sources" in one feed | Exact list of the 40+ sources not published on the page; older pages name Yelp, YP.com, TripAdvisor, Apartment Ratings, CarGurus (auto) | Standard (Google and Facebook) and up | https://www.vendasta.com/reputation/reputation-ai/ | OBSERVED |
| Review requests | Send a text with a one-tap link to the Google profile; automate requests after a paid invoice or closed appointment | Triggers via QuickBooks, Jobber, Housecall Pro, PetExec integrations. Email requests are described on older marketing pages; QR and kiosk not confirmed | Premium ("automated review requests and responses") | same, and https://www.vendasta.com/pricing/ | OBSERVED (email INFERRED) |
| Pre-review survey | Short survey after each visit "tells you how customers feel before they post anything public" | Acts as a private feedback gate | Not stated | https://www.vendasta.com/reputation/reputation-ai/ | OBSERVED |
| AI review responses | AI drafts replies in brand voice for approval; with Premium it auto-publishes to Google and Facebook | "You can customize approval requirements by star rating and review source." Changelog describes rules for star thresholds, timing, platform, brand guidelines | Pro (AI drafts), Premium (auto-publish) | same, and https://feedback.vendasta.com/changelog/now-available-automate-review-responses-and-explore-review-insights-with-the-ai | OBSERVED |
| Multi-location brand monitoring | View every location's reviews and star rating side by side on one login | | Multi-location Business App (Premium and Custom partner plans) | same, and https://docs.vendasta.com/multi-location-business-app/ | OBSERVED |
| Review widgets | Showcase positive reviews on the website | Mentioned on marketing pages; configuration not documented in fetched sources | Not stated | search summary of vendasta.com reputation pages | INFERRED |
| Review insights (AI) | AI summaries of review themes | Changelog: "explore review insights with the AI Reputation Specialist" | Premium | https://feedback.vendasta.com/changelog/now-available-automate-review-responses-and-explore-review-insights-with-the-ai | OBSERVED |
| Competitor benchmarking | Snapshot Report compares to Industry Average and Industry Leader (6-month lookback) and lets you add competitors; a live competitor tracker in Reputation was not confirmed | | Snapshot: all plans | https://docs.vendasta.com/snapshot-report/ | OBSERVED (live tracker: not confirmed) |

### 1.3 Listings and local SEO (Local SEO and Listing Sync)

| Feature | What the user can do | Notable details and limits | Tier | Source | Label |
|---|---|---|---|---|---|
| Listing Sync | Push business data to Google and Facebook (Standard), add Apple, Bing, Instagram (Pro) | Pricing page wording | Local SEO and Listing Sync Standard and Pro | https://www.vendasta.com/pricing/ | OBSERVED |
| Listing Sync add-on | Sync to "30+ directories" | Pricing page says 30+; product pages variously say 40+, 50+, 125+. Treat the count as unstable | Add-on | https://www.vendasta.com/pricing/ and https://www.vendasta.com/local-listings/listing-sync-pro/ | OBSERVED (count conflict) |
| Keyword rank tracking | Track 3 keywords (Standard); Local SEO Pro tracks up to 15 keywords with AI-suggested keywords | | Standard: 3, Pro: 15 | https://www.vendasta.com/pricing/ and https://roadmap.vendasta.com/changelog/whats-new-local-seo-pro | OBSERVED |
| Local SEO Grid | See how the business ranks in different parts of a city on a geogrid, with competitor comparison | | Pro | https://www.vendasta.com/local-listings/local-seo/ | OBSERVED |
| Google Business Profile management | Update location data to GBP from one dashboard | Posts and Q&A management not confirmed | Standard and up | https://www.vendasta.com/local-listings/listing-builder/google-my-business/ | OBSERVED |
| AI search visibility | AI Search Specialist (beta) tracks visibility across ChatGPT, Gemini, Perplexity and auto-optimizes profiles | Beta as of 2026 | Not stated | search summary of feedback.vendasta.com changelog | INFERRED |

### 1.4 Payments and scheduling

| Feature | What the user can do | Notable details and limits | Tier | Source | Label |
|---|---|---|---|---|---|
| Partner billing (Vendasta Payments) | Partner bills clients by card, automates recurring billing, manages subscriptions, invoices for packages and custom products | Stripe-backed; "2.9% + $0.30 per transaction (Stripe)" | All plans | https://www.vendasta.com/pricing/ and https://docs.vendasta.com/partner-center/ | OBSERVED |
| End-client text to pay, card readers | Not confirmed | No Business App payments product found in fetched docs; a QuickBooks integration is listed for "Financial data integration" | n/a | https://docs.vendasta.com/business-app/ | not confirmed |
| Scheduling | Partner CRM "My Meetings" booking link tied to calendar; AI voice appointment booking; Custom Capabilities can check availability in external booking systems | No native end-client booking calendar product confirmed | CRM: all plans; voice booking: Conversations AI Premium | https://docs.vendasta.com/partner-center/ and Conversations AI page | OBSERVED |

### 1.5 Marketing

| Feature | What the user can do | Notable details and limits | Tier | Source | Label |
|---|---|---|---|---|---|
| Campaigns Pro | Email and SMS marketing campaigns for the local business | Listed as an AI Workforce product that counts toward the plan minimum | Campaigns Pro add-on | https://www.vendasta.com/pricing/ | OBSERVED |
| Partner campaigns | Partner publishes and tracks marketing campaigns to prospects, with Snapshot Report attached; email sender domain authorization generates DMARC, SPF, CNAME records | Pre-built "Local Marketing Snapshot" campaigns | Professional and up (starred features) | https://docs.vendasta.com/partner-center/ and https://docs.vendasta.com/snapshot-report/ | OBSERVED |
| Social AI | Manual posting to Google and Facebook (Standard), multi-channel posting with AI comments (Pro), autonomous AI Social Media Manager and AI Blogger (Premium) | | Standard, Pro, Premium | https://www.vendasta.com/pricing/ | OBSERVED |
| Referrals, NPS surveys | Not confirmed as products | Only the pre-review survey is confirmed | n/a | | not confirmed |

### 1.6 CRM depth

| Feature | What the user can do | Notable details and limits | Tier | Source | Label |
|---|---|---|---|---|---|
| Contacts and companies | Create records with automatic duplicate check; link companies to contacts and opportunities; field change history with old and new values | History "available on Starter subscription and above" | All plans | https://docs.vendasta.com/crm/ | OBSERVED |
| Field layouts and custom objects | Group, reorder, hide fields; create custom modules "like equipment, properties, or vehicles" | Custom fields and tags not named on the overview page | All plans | same | OBSERVED (tags: not confirmed) |
| Lists and segments | Static or smart lists; search by name, phone, website, address; filters such as salesperson | | All plans | same | OBSERVED |
| Import | CSV bulk import with field mapping | | All plans | same | OBSERVED |
| Pipeline | Opportunities in table or board views; tasks; activity feed; sales goals (Premium and above); leaderboard; sales teams | | All plans, goals Premium | same | OBSERVED |
| Forms and web chat capture | Form builder submissions overwrite matching CRM fields; AI lead capture widget creates records | | All plans | same | OBSERVED |
| Email logging | BCC and forwarding addresses log emails to contacts; body max 4000 characters | Yesware can add the BCC automatically | All plans; Yesware Pro and up | same | OBSERVED |
| CRM AI | AI Sales Assistant updates records from conversations, natural language chat with CRM data, meeting recording and sales coaching | CRM AI Pro includes 750 minutes; overage about $0.04 per minute after mid-2026 | CRM AI Standard and Pro | same | OBSERVED |

### 1.7 Reporting and dashboards

| Feature | What the user can do | Notable details and limits | Tier | Source | Label |
|---|---|---|---|---|---|
| Executive Report | Client sees a personalized proof-of-performance report with location-specific and aggregated insights | Vendasta positions it as the progress report; Snapshot is the sales tool | All plans | https://docs.vendasta.com/business-app/ and https://docs.vendasta.com/snapshot-report/ | OBSERVED |
| Multi-location roll-up | Aggregated dashboards across locations, business groups hierarchy, cross-location comparison, per-location user permissions, bulk operations (for example add 15 keywords per batch) | Multi-location Business App "included in the Premium and Custom subscription tiers" | Premium, Custom Enterprise | https://docs.vendasta.com/multi-location-business-app/ | OBSERVED |
| Inbox and AI reporting | Not confirmed | | | | not confirmed |

### 1.8 Snapshot Report (what it audits)

| Section | What it checks | Grading and limits | Source | Label |
|---|---|---|---|---|
| Listings | Presence and accuracy across directories, each source weighted by site popularity | Percentile vs same industry; letter grade A to F | https://docs.vendasta.com/snapshot-report/ and the interface guide | OBSERVED |
| Reviews | Volume, average rating, monthly review frequency, number of review sources | Percentile vs same industry | same | OBSERVED |
| Social | Facebook, Instagram, X follower counts, posting frequency, engagement, profile completeness | Percentile vs same industry | same | OBSERVED |
| Website | Speed, mobile-friendliness, UX on desktop and mobile from Google Core Web Vitals and PageSpeed Insights | | same | OBSERVED |
| SEO | Organic keyword performance, search visibility, on-site optimization (keyword usage, meta data, content, architecture, links, trust signals), local competitor ranking | | same | OBSERVED |
| Advertising | Online ad presence and performance on top industry keywords | "Only Google Ads are considered" | same | OBSERVED |
| Ecommerce | Storefront presence, payment processing, lead engagement tools, online scheduling | | same | OBSERVED |
| AI optimization | Appearance in Google AI Mode and ChatGPT results, AI readiness (robots.txt, llms.txt), persona and query visibility tests | New section | same | OBSERVED |
| Overall | Each section A to F (A=4 to F=0) rolls into a 0 to 100% Digital Score | Grade descriptions are system-controlled, not editable; sections can be reordered or removed but not added | same | OBSERVED |
| Lifecycle and cost | Wait 24 hours before viewing; data gathers for 7 days then freezes; refresh if older than a month; campaigns reuse reports under 30 days | Creation and refresh each $2; plans include 10, 25, 50 free creations per month; sent from noreply@snapshotreport.biz unless customized | https://docs.vendasta.com/snapshot-report/ and https://www.vendasta.com/pricing/ | OBSERVED |
| Competitors | Add competitor accounts after creation; must share primary category unless Google-pulled; Industry Average and Leader use 6-month lookback | | same | OBSERVED |

### 1.9 Marketplace, white label, Partner Center

| Feature | What the user can do | Notable details and limits | Tier | Source | Label |
|---|---|---|---|---|---|
| Marketplace resale | Browse "250+ curated products and services", see wholesale cost beside suggested retail, set own retail price, click Start Selling to add to the store | Mix of Vendasta and third-party vendor products; third-party spend does not count toward plan minimums | All plans | https://support.vendasta.com/marketplace/ and https://www.vendasta.com/pricing/ | OBSERVED |
| Custom products | Create own products with name, icon, subscription or one-time pricing, webhooks, SSO, invoicing | | All plans | https://support.vendasta.com/marketplace/ | OBSERVED |
| White-label store | Branded storefront with own URL, theme, colors, fonts, layout | | Professional and up (Starter is co-branding only) | same, and https://www.vendasta.com/pricing/ | OBSERVED |
| White-label Business App | Client dashboard "under your brand"; branding set in Partner Center > Administration > Partner Branding; custom domains via TXT and CNAME | Mobile app is "BusinessApp.io" on iOS and Android and "Market branding is not supported" there; PWA available | Professional (white-label), Starter (co-branding) | https://docs.vendasta.com/business-app/ and https://docs.vendasta.com/partner-center/ | OBSERVED |
| Business App tabs | Partner enables or disables Home, Conversations, CRM, Campaigns, Executive Report, My Products, Store, Automations, Administration; client can pin up to four products | | All plans | https://docs.vendasta.com/business-app/ | OBSERVED |
| Partner Center | Manage client accounts, users, admins, store, multi-location groups, campaigns, acquisition widgets, orders, salespeople and teams, fulfillment services, branding | Starred features "may only be available on select subscription levels" | Varies | https://docs.vendasta.com/partner-center/ | OBSERVED |
| Roles | Salesperson role gets CRM, opportunities, conversations, orders; Digital Agent gets task management | | All plans | same | OBSERVED |
| Automations | Workflow automation with templates and triggers (for example review requesting) | | All plans | https://docs.vendasta.com/business-app/ and https://www.vendasta.com/pricing/ | OBSERVED |
| API | API access excluded from Starter; API support on Custom Enterprise; developer docs exist | | Professional and up | https://www.vendasta.com/pricing/ | OBSERVED |

### 1.10 AI Workforce (concrete capabilities)

| Role | What it does | Details | Source | Label |
|---|---|---|---|---|
| Chat Receptionist | Answers web chat and social DMs, captures and qualifies leads, books via tools | Configured in Partner Center > AI > Workforce; brand colors and greeting are settable | https://docs.vendasta.com/ai/ and https://docs.vendasta.com/partner-center/ | OBSERVED |
| Voice Receptionist | Answers calls, books appointments, transfers to humans | 300 min/month, 10 min cap per call, about $0.10/min overage | Conversations AI page | OBSERVED |
| Sales Assistant (CRM AI) | Updates CRM from conversations, chat with CRM data, records meetings, coaches | 750 minutes on CRM AI Pro | https://docs.vendasta.com/crm/ | OBSERVED |
| Reputation Specialist | Drafts and auto-posts review replies by rules; review insights | Premium for auto-publish | https://www.vendasta.com/reputation/reputation-ai/ | OBSERVED |
| Social Media Manager, AI Blogger | Autonomous social content and blog posts | Social AI Premium | https://www.vendasta.com/pricing/ | OBSERVED |
| Search Specialist | Tracks AI search visibility (ChatGPT, Gemini, Perplexity), optimizes profiles | Beta | changelog via search | INFERRED |
| Custom AI Employees | Build role with own capabilities, knowledge, tools | | https://docs.vendasta.com/ai/ | OBSERVED |
| Conversation Intelligence minutes | 250, 500, 1,000 minutes per month by plan | | https://www.vendasta.com/pricing/ | OBSERVED |

### 1.11 Pricing (partner plans, published)

| Plan | Monthly minimum | Covers | Seats | Snapshot Reports/mo | Notes | Source | Label |
|---|---|---|---|---|---|---|---|
| Starter | $99 | 1 to 2 local businesses | 1 (extra $30) | 10 | Monthly, no contract; co-branding only; no API; no multi-location | https://www.vendasta.com/pricing/ | OBSERVED |
| Professional | $499 | 3 local businesses | 5 (extra $35) | 25 | 1-year contract; white label; chat and phone support | same | OBSERVED |
| Premium | $999 | 6 local businesses | 10 (extra $65) | 50 | 1-year contract; multi-location client portal | same | OBSERVED |
| Custom Enterprise | Custom | 20+ local businesses | Custom | Contact us | Invoiced billing, API support, priority support | same | OBSERVED |

Model notes: the minimum is a spend floor, qualifying product spend offsets it, "If you fall short, you pay only the difference", unused spend does not roll over, third-party Marketplace products do not qualify. Seats are charged only if a user views a page in a 90-day period. Payments 2.9% + $0.30. 14-day free trial, no onboarding fee. Older changelog prices for Inbox Standard $29 and Pro $39 per month exist but may be outdated (INFERRED).

---

## 2. Podium (podium.com)

Products covered: Inbox, Reviews, Webchat, Payments, Phones, Text Marketing, AI Employee, pricing.

### 2.1 Unified inbox

| Feature | What the user can do | Notable details and limits | Tier | Source | Label |
|---|---|---|---|---|---|
| Channels | One shared team inbox for "chats, texts, calls, and social messages"; the developer doc lists Facebook Messenger, Google Business Messaging, SMS, email, Instagram, with Apple Business Chat as an example channel | Google Business Messages was shut down by Google on 2024-07-31, so that doc entry is stale. WhatsApp not mentioned anywhere. MMS supported for marketing images and GIFs (Pro) | All plans | https://www.podium.com/inbox and https://docs.podium.com/docs/sync-messages-from-podium-conversations | OBSERVED (GBM status INFERRED) |
| Assignment | Conversations "can either remain unassigned or be tied to a user" | Automatic lead routing is a Pro feature per third-party summary | All plans; auto routing Pro | docs.podium.com and https://www.truereview.co/post/podium-pricing-explained-is-it-worth-it-in-2026 | OBSERVED (routing tier INFERRED) |
| Team collaboration | Mention teammates in a thread for handoffs | | All plans | https://www.podium.com/inbox | OBSERVED |
| Templates | "Build templates for consistent replies" | | All plans | same | OBSERVED |
| Scheduled messages | "Deliver messages when it's most convenient for your customers" | | All plans | same | OBSERVED |
| Intent categorization | "Automatically categorize conversations based on what is being talked about" | | Not stated | same | OBSERVED |
| AI replies and FAQs | AI answers instantly in business context, handles FAQs, re-engages stalled leads, works after hours | | AI Employee add-on, AI Concierge on Pro | same | OBSERVED |
| One-click review invite from thread | Send a review invite and draft a response from the conversation | | All plans | same | OBSERVED |
| Lead capture from webchat | Collect lead info before the chat starts; chat moves to SMS so the lead persists; track click path on site | | All plans (Webchat "free with Podium Starter" per linked article) | https://www.podium.com/webchat | OBSERVED |
| Missed call text back | "Automatically text missed or after-hours calls"; Switch to Text lets a caller press a key to get a text | Part of Podium Phones | Phones add-on | https://www.podium.com/phones | OBSERVED |
| Phone numbers and calls | VoIP system, call and text from the business number on mobile and desktop softphone, custom phone menus and auto routing, after-hours routing to extensions, numbers or voicemail boxes, automatic recording, transcripts, bulleted AI summaries, follow-up flags | Core includes 5 numbers, Pro 15, extra numbers $5 each (third-party). Phones seats $30/user (1 to 4) or $25 (5+), $500 one-time network optimization fee per location (third-party) | Phones add-on | https://www.podium.com/phones and truereview.co | OBSERVED (prices INFERRED) |
| Mobile app | Manage reviews and messages with "smart notifications that prioritize what matters most" | | All plans | https://www.podium.com/inbox | OBSERVED |
| Bulk messaging | See Text Marketing (2.5); credits are plan-metered | 250 credits Core, 500 Pro (third-party) | | truereview.co | INFERRED |

### 2.2 Reputation (Reviews)

| Feature | What the user can do | Notable details and limits | Tier | Source | Label |
|---|---|---|---|---|---|
| Review invites | Send textable review invites and reminders, manually or automated, including from the mobile app | Email, QR and kiosk flows not described on the page; a free Google reputation report is offered as a lead magnet | Core and up | https://www.podium.com/reviews | OBSERVED (email, QR, kiosk: not confirmed) |
| Sites | Google and Facebook emphasized; "Consolidate all of your review sites" into the inbox | Named list not published; DealerRater appears in a testimonial | Core and up | same | OBSERVED |
| AI Reputation Specialist | AI crafts review invites and personalized replies | Pro feature; third-party reports an AI review reply add-on around $99/month, not confirmed by Podium | Pro | same, and truereview.co | OBSERVED (price INFERRED) |
| Monitoring | Monitor, track and respond to reviews and inquiries from one inbox; reviews sync to customer profiles | | Core and up | https://www.podium.com/reviews | OBSERVED |
| Reporting | "Robust reporting and visibility that tracks total reviews received as well as detailed attribution" (which employee or invite produced the review) | | Core and up | same | OBSERVED |
| Widgets, competitor benchmarking | Not mentioned on the Reviews page | | | same | not confirmed |

### 2.3 Listings and local SEO

| Feature | What the user can do | Notable details and limits | Tier | Source | Label |
|---|---|---|---|---|---|
| Listings management | Not a Podium product line as of the fetched pages | Podium focuses on Google reviews and messaging; no listings sync page found | n/a | podium.com navigation on fetched pages | not confirmed |

### 2.4 Payments

| Feature | What the user can do | Notable details and limits | Tier | Source | Label |
|---|---|---|---|---|---|
| Text to Pay | Attach a secure invoice link in a text | | Payments add-on | https://www.podium.com/payments | OBSERVED |
| Card readers and Tap to Pay | In-store and mobile reader hardware; turn the phone into a reader | Hardware discounts on Signature (third-party) | Payments add-on | same | OBSERVED |
| Financing and subscriptions | "Accept every payment method, including financing and subscriptions"; Buy Now Pay Later | Provider not named | Payments add-on | same | OBSERVED |
| Recurring and auto-pay | Automate recurring payments, customers can enroll in auto-pay | | Payments add-on | same | OBSERVED |
| Fraud and chargeback protection | Offered "for a small transaction fee" | Fee amount not published | Payments add-on | same | OBSERVED |
| Payouts | "transferred to your bank account on the next business day" | | | same | OBSERVED |
| Processor and rates | Not published | Processor name and per-transaction rate not stated anywhere fetched | | same | not confirmed |
| Integrations | VinSolutions, CDK Global, ServiceTitan, Housecall Pro and a marketplace | | | same | OBSERVED |

### 2.5 Scheduling and marketing

| Feature | What the user can do | Notable details and limits | Tier | Source | Label |
|---|---|---|---|---|---|
| Scheduling | AI Employee "Books directly on your calendar", sends automatic confirmations and reminders, answers pre-appointment questions | Real-time access to "your calendar, customer records, and workflows" via integrations; no standalone Podium booking page product found | AI Employee add-on | https://www.podium.com/ai-employee | OBSERVED |
| Text marketing campaigns | Launch bulk text campaigns with AI-written copy and templates; target segments with personalized offers; opt-in via website, in-store, email, QR codes, forms; reports on response rate, click-through, unsubscribes; AI Employee answers replies and books | Bulk capacity scales with temporary add-ons; metered as Bulk Message credits. Images and GIFs plus advanced segmentation on Pro (third-party). A reviewer calls the credit cap the "251st-message cliff" | Core (250 credits), Pro (500) | https://www.podium.com/text-marketing, truereview.co, https://getomnichannel.com/sms-messaging-tools/podium-review/ | OBSERVED (credit numbers INFERRED) |
| Surveys | Listed as a Pro feature in third-party summaries | Not on fetched official pages | Pro | truereview.co | INFERRED |
| Referrals, NPS | Not confirmed | | | | not confirmed |

### 2.6 CRM depth

| Feature | What the user can do | Notable details and limits | Tier | Source | Label |
|---|---|---|---|---|---|
| Contact profiles | Leads and reviews consolidate into one shared inbox; every review syncs to the customer profile | Fields, tags, import not documented on fetched pages; the webhook contact object is deprecated in the API | All plans | https://www.podium.com/inbox and docs.podium.com | OBSERVED (fields, tags, import: not confirmed) |
| Segmentation | "Advanced segmentation" for text marketing | Pro | Pro | truereview.co | INFERRED |

### 2.7 Reporting

| Feature | What the user can do | Notable details and limits | Tier | Source | Label |
|---|---|---|---|---|---|
| Review reporting and attribution | Total reviews and attribution per invite or employee | | Core and up | https://www.podium.com/reviews | OBSERVED |
| Campaign reporting | Response rate, click-through, unsubscribes | | Core and up | https://www.podium.com/text-marketing | OBSERVED |
| AI Studio | "a complete view of how your AI Employee is performing", sandbox to test changes, escalation rules | | AI Employee | https://www.podium.com/ai-employee | OBSERVED |

### 2.8 AI Employee (concrete capabilities)

| Capability | Detail | Source | Label |
|---|---|---|---|
| 24/7 instant response on calls, text, webchat, email, social | "Covers every channel: calls, text, webchat, email, social" (vendor punctuation normalized) | https://www.podium.com/ai-employee | OBSERVED |
| Lead qualification and nurture | Asks questions, gathers details, works toward a booking | same | OBSERVED |
| Booking with no human handoff | Books on the connected calendar; confirmations and reminders | same | OBSERVED |
| Re-engagement | Proactively re-engages past customers | same | OBSERVED |
| Playbooks and knowledge | Custom playbooks with services, pricing, policies; plain-language feedback applied instantly | same | OBSERVED |
| AI Studio | Performance view, sandbox, escalation rules | same | OBSERVED |
| Industry versions | Automotive, Home Services, Aesthetics and Wellness, Retail | same | OBSERVED |
| Payments and review requests by AI | Not described on the AI Employee page (review invite crafting is on the Reviews page as AI Reputation Specialist) | same | not confirmed |
| Price | "Add on AI Employee to any plan"; no price published; search budget was exhausted before a third-party price could be checked | https://www.podium.com/pricing | not confirmed |

### 2.9 Pricing (not published by Podium; third-party reconstruction)

| Plan | Reported price | Reported inclusions | Source | Label |
|---|---|---|---|---|
| Core | $399/month (annual) | Up to 2 locations, 4 users, 5 phone numbers, 250 bulk messages/month, unified inbox, review requests, basic automation | truereview.co | INFERRED |
| Pro | $599/month per location | Up to 5 locations, 15 numbers, 500 bulk messages/month, AI Concierge, AI Reputation Specialist, AI call summaries, auto lead routing, advanced automations, surveys, image and GIF texts, advanced segmentation | truereview.co | INFERRED |
| Signature | Custom | Priority support, dedicated account management, API access, volume bulk discounts, hardware discounts | truereview.co | INFERRED |
| Fees | 10DLC $5/month per location (mandatory); extra users $25/month; extra numbers $5/month; Phones seats $30 or $25 per user; $500 per-location network optimization | Some sources report $15/month carrier fee on Core instead; a Canadian review lists $459 and $689 CAD | truereview.co and search summary | INFERRED (conflicting) |
| Contract | 12 months, auto-renew, 30 to 60 days notice | Official page: "talk to our sales team for details"; support included in every plan | https://www.podium.com/pricing and truereview.co | OBSERVED (terms INFERRED) |

---

## 3. Birdeye (birdeye.com)

Products covered: Reviews, Messaging, Listings, Payments, Surveys, Insights, Webchat, Referrals, BirdAI (Jay, Myna, Robin), pricing. Birdeye now frames the platform as an "Agent OS" with three named AI coworkers: Jay (marketing: AI Search, Reviews, Listings, Social, Marketing Automation, Chatbot, Pages, Content), Myna (operations: Frontdesk, Appointments, Reminders, Waitlist, Insurance Verification, Voice, Email, Text), Robin (CX: Surveys, Insights, Competitors, Ticketing, Reporting). Source: https://birdeye.com/birdai/ (OBSERVED).

### 3.1 Unified inbox (Messaging)

| Feature | What the user can do | Notable details and limits | Tier | Source | Label |
|---|---|---|---|---|---|
| Channels | "Respond to messages from Webchat, text, Facebook, Instagram, email, and voicemail" in one inbox; video chat mentioned | Google Business Messages not listed (shut down 2024). WhatsApp and Apple Messages not mentioned. MMS review requests supported in US and Canada only; not in Australia, Mexico, Puerto Rico, UK | Starter and up | https://birdeye.com/messaging/ and https://birdeye.helpjuice.com/en_US/setup-locations/which-countries-does-birdeye-support (search summary) | OBSERVED |
| Organization | Messages organized by customer and channel; flag conversations; notifications on new messages; Smart Inbox sorts by location, time, type | | Starter and up | https://birdeye.com/messaging/ and https://birdeye.com/webchat/ | OBSERVED |
| Assignment and teams | "Assign conversations to team members and locations"; assign to a team or individual; route fresh leads to the right teams | | Starter and up | same | OBSERVED |
| Templates | Reusable templates; Template Design Agent builds branded templates for emails, texts, newsletters, landing pages | | Starter and up; agent tier not stated | https://birdeye.com/messaging/ | OBSERVED |
| Scheduled and bulk messages | "Schedule mass text messages to drive sales"; reach thousands at once | Mass texting is a paid add-on per third-party pricing | Add-on | same, and https://wiserreview.com/blog/birdeye-pricing/ | OBSERVED (add-on INFERRED) |
| Automations in inbox | Trigger-based messages such as welcome offers and review requests; 3,000+ integrations | | Starter and up | https://birdeye.com/messaging/ | OBSERVED |
| AI replies | BirdAI rephrases responses and gives conversation recaps; agents generate branded, goal-driven responses; Lead Generation Agent, Contact Segmentation Agent | | Growth and up for chatbot per third-party | same | OBSERVED (tier INFERRED) |
| Voice | Auto-receptionist attends calls when busy; records and transcribes voicemails; Myna Frontdesk handles voice, email, text | Missed call text back not confirmed by name | Not stated | same, and https://birdeye.com/birdai/ | OBSERVED (MCTB: not confirmed) |
| Lead capture from webchat | Collect contact details before each chat; transition to text; Robin chatbot answers FAQs 24/7 and books appointments; separate chat window per brand or location; off-hours auto-replies | Widget loads after page load | Starter (webchat), chatbot on Dominate per third-party | https://birdeye.com/webchat/ | OBSERVED |
| Payments and reminders from inbox | Collect payments and set appointment reminders from customer management | | Add-ons | https://birdeye.com/messaging/ | OBSERVED |
| Reporting | Median response time, number of conversations, total messages, filterable by location, user, time | | Starter and up | same | OBSERVED |
| Security | "all incoming and outgoing messages are encrypted end-to-end" | Vendor claim | | same | OBSERVED |

### 3.2 Reputation (Reviews)

| Feature | What the user can do | Notable details and limits | Tier | Source | Label |
|---|---|---|---|---|---|
| Review request flows | Quick Send from dashboard or next to a contact (email or text); mobile app Quick Send; bulk contact upload, SFTP, API; automated campaigns with conditions; CMS and PMS integrations | Requires email or phone on the contact for that channel | Starter and up | search summary of https://birdeye.helpjuice.com/review-marketing/1205159-how-can-i-get-new-reviews-from-my-customers-using-birdeye | OBSERVED |
| Kiosk | Bookmark the "Write a review" link on an iPad in the front office | A link, not a dedicated kiosk mode | Starter and up | https://birdeye.helpjuice.com/en_US/review-marketing/1205381-how-can-i-get-new-reviews-from-my-customers-mobile-kiosk | OBSERVED |
| QR code | Review link generator produces a QR to the Google review page | Free tool | Free | https://birdeye.com/au/review-link-generator/ | OBSERVED |
| AI-timed requests | Review agent "Asks each customer at the moment they're most likely to respond" and "Reaches out on the channel that gets the most responses" | Vendor claims "128% more reviews" | BirdAI | https://birdeye.com/reviews/ | OBSERVED |
| Sites monitored | "Every rating and review, from every site, in one place" | Count not stated on current page; third-party sources cite 200+ sites | Starter and up | same, and wiserreview | OBSERVED (count INFERRED) |
| AI review responses | Response agent reads text, photos and past visits, replies in brand voice within industry rules, "Posts on its own, or holds for approval - you decide" | | Starter (Reviews AI) per third-party | https://birdeye.com/reviews/ | OBSERVED |
| Review marketing | Agent picks reviews worth showing, designs an on-brand graphic and posts to social and web | | | same | OBSERVED |
| Widgets | Badge, certificate badge, feed, rotating, slider, grid, "Review us" button; filter sources; featured reviews toggle; grid up to 20 reviews, rotating 10, slider most recent 20, feed unlimited; one source per button; copy embed code | Multi-location set per location under Settings | Starter and up | https://support.birdeye.com/en/articles/12653032-how-to-embed-birdeye-widget-on-your-business-website-iframe | OBSERVED |
| Google Seller Ratings | Birdeye sends a clean review feed to Google via its authorized partner; needs 100 unique Birdeye-collected reviews in 12 months, 3.5+ composite, 10 reviews in the searcher's language, per country; Google takes 4 to 6 weeks | Third-party reviews do not count; stars show under text ads | Add-on per third-party | https://support.birdeye.com/en/articles/12653490-enabling-google-seller-ratings-via-birdeye | OBSERVED |
| Reputation Score | One number per location from ratings, review counts and responses over time | | Starter and up | https://birdeye.com/reviews/ | OBSERVED |
| Competitor benchmarking | "See where you lead each competitor, location by location"; Competitors AI product | Add-on per third-party | Add-on | same, and https://birdeye.com/insights/ | OBSERVED |

### 3.3 Listings and local SEO

| Feature | What the user can do | Notable details and limits | Tier | Source | Label |
|---|---|---|---|---|---|
| Native real-time integrations | Google, Facebook, Apple, Yelp, Bing | Page argues against "200+ directories" vendors; third-party sources still cite 50+ directories for Birdeye | Starter and up | https://birdeye.com/listings/ | OBSERVED (directory count: conflicting) |
| AI listing audits and fixes | Jay scans listings, flags stale hours, photos, descriptions, recommends fixes guided by your prompts and keyword rules; "One approval can apply the update across every location" | | Starter and up | same | OBSERVED |
| Competitor keyword flags | Flags keywords competitors target | | | same | OBSERVED |
| AI search optimization | AI Search Optimization Agent hands listing fixes to the Listings agent; listings framed as trust signals for AI engines | | Jay | same | OBSERVED |
| Duplicate suppression, Google Posts, Q&A, rank tracking | Not mentioned on the page | | | same | not confirmed |

### 3.4 Payments

| Feature | What the user can do | Notable details and limits | Tier | Source | Label |
|---|---|---|---|---|---|
| Channels | Collect "via text, email, card readers, field readers, QR code, and on your website"; phone payments via a Birdeye-hosted checkout page | | Payments add-on | https://birdeye.com/payments/ | OBSERVED |
| Card readers | Contactless, EMV chip, swipe, in store or on the go | | Payments | same | OBSERVED |
| Methods | Visa, Mastercard, AmEx, HSA and FSA cards, ACH, Apple Pay, Google Pay | | Payments | same | OBSERVED |
| Financing and recurring | Buy now pay later, recurring subscriber campaigns, "flexible financing" | Provider not named | Payments | same | OBSERVED |
| Processor and fees | Stripe infrastructure, PCI Service Provider Level 1, "one flat fee for every transaction", "zero long-term contracts" for payments | Rate not published | Payments | same | OBSERVED (rate: not confirmed) |
| Invoices | Integrations "automatically send payment links and close invoices"; follow up on past-due balances | QuickBooks, Freshbooks, Eaglesoft, Opendental and "100's" of PMS and accounting systems | Payments | same | OBSERVED |

### 3.5 Scheduling and marketing

| Feature | What the user can do | Notable details and limits | Tier | Source | Label |
|---|---|---|---|---|---|
| Appointments | Myna coworker: Frontdesk, Appointments, Reminders, Waitlist, Insurance Verification; Robin chatbot books appointments from webchat | birdeye.com/appointments returned 404; details limited to the BirdAI and Webchat pages | Not stated | https://birdeye.com/birdai/ and https://birdeye.com/webchat/ | OBSERVED (depth not confirmed) |
| Referrals | Rule-based triggers after payments or positive reviews; 1:1 requests from the inbox; custom campaigns; templates for messaging, design, forms, rewards; cash discounts, gifts, coupons; send by email, text, social; dashboard tracks requests sent and shared | Add-on about $100/month per third-party | Add-on | https://birdeye.com/referrals/ and wiserreview | OBSERVED (price INFERRED) |
| Surveys | NPS, CSAT and custom surveys; agent drafts a ready-to-edit survey from your goal; branching logic and AI follow-ups; A/B test templates; send at each customer's best time; auto follow-up non-responders; sentiment, intent and topic reading | Distribution channels not named on the page; text surveys named on Messaging page | Growth and up per third-party; Surveys add-on in other summaries | https://birdeye.com/surveys/ and https://birdeye.com/messaging/ | OBSERVED (tier conflicting) |
| Ticketing | Route qualifying survey feedback to owners with priority, SLA and escalation | | Robin | https://birdeye.com/surveys/ | OBSERVED |
| Social | Social AI for publishing and engagement; review marketing graphics auto-posted | Growth and up per third-party | Growth | https://birdeye.com/reviews/ and wiserreview | INFERRED |

### 3.6 CRM depth

| Feature | What the user can do | Notable details and limits | Tier | Source | Label |
|---|---|---|---|---|---|
| Contacts | Contacts tab with Quick Send per contact; bulk upload, SFTP, API import; Contact Segmentation Agent | Custom fields and tags not confirmed on fetched pages; Helpjuice articles were paywalled to the fetcher | Starter and up | helpjuice search summary and https://birdeye.com/messaging/ | OBSERVED (fields, tags: not confirmed) |
| Integrations | "3,000+ integrations" and native PMS, CRM, accounting connectors; custom integrations may carry a $500 to $2,000 setup fee per third-party | | | https://birdeye.com/messaging/ and wiserreview | OBSERVED (fee INFERRED) |

### 3.7 Reporting and dashboards (Insights, Reporting Agent)

| Feature | What the user can do | Notable details and limits | Tier | Source | Label |
|---|---|---|---|---|---|
| Birdeye Score | Sentiment, reviews and listings health in one score benchmarked against industry at every location; adjust weightings to business priorities | | Insights (add-on per third-party) | https://birdeye.com/insights/ | OBSERVED |
| Themes and drivers | Issues surfaced by region, location and theme; main drivers of sentiment | | Insights | same | OBSERVED |
| Plain-English report summaries | "Get plain-English summaries for every report" | | Insights | same | OBSERVED |
| Multi-location roll-up | "rolls up and compares performance across 1000+ locations"; assign actions to teams | | Insights | same | OBSERVED |
| Reporting Agent | "Describe the report you need in plain English. Reporting Agent creates a usable multi-location report." | | Robin | https://birdeye.com/surveys/ | OBSERVED |
| Alerts and custom dashboards | Not mentioned | | | https://birdeye.com/insights/ | not confirmed |

### 3.8 BirdAI (concrete capabilities)

| Capability | Detail | Source | Label |
|---|---|---|---|
| Agent OS: Consolidate, Reason, Act | Pulls reviews, appointments, conversations and 3,000+ integrations; per-location knowledge graph and relationship memory; runs work through coworkers with traced, tested actions | https://birdeye.com/birdai/ | OBSERVED |
| Agent Studio | "builds one from sample call transcripts" for custom agents | same | OBSERVED |
| Multi-Agent Orchestration, Birdeye MCP | Listed pages; MCP implies an agent protocol endpoint for external AI clients | same | OBSERVED (MCP meaning INFERRED) |
| Jay | Reviews, listings, social, marketing automation, chatbot, pages, content, AI search | same | OBSERVED |
| Myna | Frontdesk, appointments, reminders, waitlist, insurance verification, voice, email, text | same | OBSERVED |
| Robin | Surveys, insights, competitors, ticketing, reporting | same | OBSERVED |
| Review response agent | Reads full review including photos and past visits, auto-post or hold for approval | https://birdeye.com/reviews/ | OBSERVED |
| Survey agent | Creates, refines, A/B tests, times sends, follows up, analyzes sentiment | https://birdeye.com/surveys/ | OBSERVED |

### 3.9 Pricing (not published by Birdeye; third-party reconstruction)

| Plan | Reported price per location per month | Reported inclusions | Source | Label |
|---|---|---|---|---|
| Starter (Standard) | $299 annual or $349 monthly | Reviews AI, Listings AI, basic messaging, campaigns, mobile app, unlimited users | wiserreview.com and search summary | INFERRED |
| Growth (Professional) | $349 to $599 depending on source | Adds Social AI, content scheduling, surveys | same | INFERRED (conflicting) |
| Dominate (Premium) | $449 to $699+ | Adds AI Chatbot, advanced analytics, dedicated account manager | same | INFERRED (conflicting) |
| Custom Premium | Negotiated; 4+ locations are custom quoted | Volume pricing, SLAs, white-glove onboarding | same | INFERRED |
| Add-ons | Mass texting, referrals, surveys and Insights AI, competitors, Google Seller Ratings setup, BI dashboards; "$50-$200/month per location" each; some summaries say $100/month for Surveys, Referrals, Mass Texting | SMS carrier fees about $0.01 to $0.03 per message in fine print | same | INFERRED |
| Contract | 12 months billed monthly, auto-renew, written cancellation 90 days before renewal, possible termination fee equal to remaining balance, "Innovation Fee" around 8% at renewal | Official page: "Pricing built around outcomes, not seat counts", location dropdown 1 to 3 up to 1000+ | https://birdeye.com/pricing/ and wiserreview | OBSERVED (terms INFERRED) |

---

## 4. Common core across the three

All three deliver the same backbone, which is the local business standard a template must match:

1. One shared inbox that merges SMS, web chat, Facebook Messenger, Instagram DMs and email, with conversation assignment to a person (and to a location for multi-location). Google Business Messages is gone everywhere since mid-2024. WhatsApp is confirmed only on Vendasta.
2. Website chat that captures name and mobile number first and then continues the conversation over SMS, so a lead survives the visitor leaving the page.
3. Review generation by SMS link (email secondary), with automation triggers from invoices, appointments or PMS integrations, and monitoring of Google and Facebook plus a long tail of sites.
4. AI review replies with a human approval gate that can be relaxed by star rating and source, and auto-publish as the premium step.
5. A 24/7 AI assistant that answers FAQs, qualifies leads, books appointments and hands off to a human (Podium AI Employee, Birdeye Robin and Myna, Vendasta Chat and Voice Receptionist). All three now also answer the phone with AI.
6. Missed call text back and voicemail transcription (confirmed on Podium and Vendasta; Birdeye has voicemail transcription and an auto-receptionist, MCTB not confirmed by name).
7. Templates, scheduled sends and metered bulk SMS (credits or add-on).
8. Payments by text link with Stripe or a Stripe-like processor underneath, card readers, recurring and BNPL.
9. Reporting that counts reviews, response time, conversations and campaign responses, rolled up per location.
10. Per-location pricing with annual contracts and auto-renewal; the per-location number is the pricing atom.

## 5. Unique features per product

Vendasta
- Partner-first architecture: Partner Center, white-label Business App, custom domain, 250+ product Marketplace with wholesale vs retail margin, custom products with SSO and webhooks, client billing.
- Snapshot Report: an eight-section prospect audit (listings, reviews, social, website, SEO, advertising, ecommerce, AI optimization) graded A to F into a 0 to 100% Digital Score, with a 7-day data window and $2 per creation or refresh.
- Executive Report as proof-of-performance to the client, separate from the sales audit.
- A full agency CRM (companies, opportunities, custom objects, smart lists, email logging, Yesware, conversation intelligence minutes) rather than a contacts list.
- Minimum-spend pricing where product spend offsets the plan floor and seats bill only on activity.
- Voice receptionist in Italy, and published overage economics (about $0.10/min voice, about $0.04/min meeting recording).

Podium
- Deepest phone stack of the three: VoIP with softphones, custom menus, after-hours routing, Switch to Text, recording, transcription and AI summaries.
- Text to Pay with Tap to Pay on phone, next-business-day payouts, financing and auto-pay enrollment.
- AI Employee positioned as a seller: re-engages past customers, books with no human handoff, AI Studio sandbox and escalation rules, industry-specific versions.
- Review attribution reporting (which invite or employee produced the review).
- Bulk Message credits as the metering unit for marketing texts.

Birdeye
- Agent OS framing with three named coworkers (Jay, Myna, Robin), Agent Studio from call transcripts, Multi-Agent Orchestration and a Birdeye MCP endpoint.
- Google Seller Ratings feed with stated thresholds (100 reviews, 3.5 stars, 10 in-language).
- Widget library with layouts and display caps, plus review marketing graphics auto-posted to social.
- Surveys with NPS and CSAT, branching, AI follow-ups, ticket routing with SLA and escalation, and a Reporting Agent that builds reports from a plain-English request.
- Referrals with incentives and triggers after payment or positive review.
- Insights score with adjustable weightings and roll-up across 1000+ locations; Competitors AI.
- Native listings integrations with Google, Facebook, Apple, Yelp, Bing and one-approval bulk fixes.

## 6. Pain points users report (sourced)

Podium
- Contract and cancellation friction is "the #1 documented complaint" on BBB and Trustpilot; a 2026 BBB complaint describes a refused cancellation and a $22,094.40 early termination buyout offer. Sources: https://www.truereview.co/post/podium-pricing-explained-is-it-worth-it-in-2026, https://www.bbb.org/us/ut/lehi/profile/computer-software-developers/podium-1126-90023083/complaints, https://fieldcamp.ai/reviews/podium/ (INFERRED, third-party and complaint-site summaries).
- Price increases at auto-renewal (5% in one BBB complaint, $2,732 in another) and add-on creep ("rising prices" as users, numbers, AI and Phones fees stack). Same sources.
- Bulk message credit caps hit mid-campaign (the "251st-message cliff"). Source: https://getomnichannel.com/sms-messaging-tools/podium-review/ (INFERRED).
- Per-location Pro pricing creates a "steep cost jump" at the third location. Source: truereview.co (INFERRED).
- No public pricing; sales-call only. Source: https://www.podium.com/pricing (OBSERVED).
- Conflicting public ratings (G2 4.6 across about 2,000 reviews vs Trustpilot figures from 1.5 to 4.2 and BBB grades from A- to D-), which itself signals billing disputes dominating the review stream. Source: search summary of review sites (INFERRED).

Birdeye
- Trustpilot TrustScore 3.1 on 685 reviews, 23% one-star; negatives concentrate on the 90-day cancellation notice, retention routing ("sends every request to retention"), surprise charges ("automatically debited $9,240.18"), an "Innovation Fee" that "never appeared on a single invoice", and support that fades after onboarding ("account representative repeatedly missed scheduled meetings"). Source: https://www.trustpilot.com/review/birdeye.com (OBSERVED on page).
- BBB complaint: cancellation requests from October through December 2025, still charged January 2026. Source: https://www.bbb.org/us/ca/palo-alto/profile/internet-marketing-services/birdeye-inc-1216-416252/complaints (INFERRED).
- Opaque, negotiable pricing and paying for unused modules ("will likely use 20% of the platform"); SMS carrier fees in fine print. Source: https://wiserreview.com/blog/birdeye-pricing/ (INFERRED, competitor-published).
- Data accuracy complaints ("got all of the stuff wrong on my business") and reviews left up after the origin platform removed them. Source: Trustpilot (OBSERVED).
- Praise: ease of use, replying to reviews from one dashboard, strong implementation reps. Source: Trustpilot (OBSERVED).

Vendasta
- Minimum-spend model confuses buyers: minimums do not roll over, third-party Marketplace spend does not qualify, seats bill when a user merely views a page, and higher tiers require one-year contracts. Sources: https://www.vendasta.com/pricing/ (OBSERVED terms) and https://realcostlabs.com/reviews/vendasta/ (INFERRED).
- Steep learning curve ("a maze for new users"), onboarding complexity for small agencies. Sources: https://www.selecthub.com/p/crm-software/vendasta/, https://www.getapp.com/all-software/a/vendasta/reviews/ (INFERRED).
- Cancellation friction and an unfulfilled refund in a G2 review; Trustpilot 3.4 across about 100 reviews. Source: search summary (INFERRED).
- Snapshot Report accuracy disputes: reviewers say the audit flagged errors that were not real. Source: Trustpilot via search summary (INFERRED).
- Marketplace vendor products described as expensive for small local businesses. Source: G2 via search summary (INFERRED).

Cross-cutting: the product is rarely the complaint. Contracts, auto-renewal windows, retention routing, hidden carrier and compliance fees, and per-location price jumps are.

## 7. What this tells us a template must have

1. One conversation object with a channel field (sms, mms, webchat, facebook, instagram, email, whatsapp, voice, voicemail) and a single thread per contact across channels; assignment to a user and to a location; unassigned queue. Do not build a Google Business Messages channel.
2. Webchat that asks for name and mobile first, then continues over SMS, with click-path capture and a per-location or per-brand widget config, off-hours greeting, and brand colors.
3. Missed call text back and voicemail transcription as a default-on automation, with the call logged to the contact timeline.
4. Review request engine: SMS first with a one-tap link, email fallback, QR and review-link generator, kiosk-safe link, per-contact Quick Send, and triggers from invoice paid, appointment completed, payment received; a private pre-review survey gate.
5. Review inbox pulling Google and Facebook natively plus a pluggable long tail, with AI drafted replies, approval rules by star rating and source, and an auto-publish toggle.
6. Review widgets (badge, feed, grid, slider, button) with source filters, featured toggle and display caps, plus schema markup (none of the three advertise schema; a gap to exploit).
7. Phone stack: numbers per location, softphone on web and mobile, menus and after-hours routing, recording, transcription, AI summary and follow-up flags. Podium proves this sells.
8. AI agent runtime with: knowledge base from uploaded docs and crawled site, per-business playbooks (services, pricing, policies), tool calls for availability, booking and CRM updates, escalation rules, a sandbox before go-live, and a performance view (AI Studio equivalent). Voice and chat share the same brain.
9. Metering and overage that is visible to the user: voice minutes, bulk SMS credits, meeting recording minutes, with soft warnings before the cap. The "251st-message cliff" is the anti-pattern.
10. Text to pay and payment links from the thread, card reader and tap to pay, recurring and auto-pay, next-day payouts, ACH and wallets, with the processor and the flat rate shown in the UI, not hidden.
11. Appointment booking native to the thread (chat and voice), reminders and confirmations, waitlist.
12. Marketing: segmented bulk SMS and email with opt-in sources (web, QR, in-store, form), unsubscribe handling, scheduling, response and click reporting; referrals with incentives triggered after payment or positive review; NPS and CSAT surveys with branching and ticket routing.
13. CRM record with timeline across channels, custom fields and objects, tags, static and smart lists, CSV import with mapping and duplicate check, field change history, forms that write to fields, email logging via BCC.
14. Reporting per location and rolled up: review counts and attribution, median response time, conversations, campaign results, AI agent outcomes; plain-language summaries; a Reporting Agent style natural-language report builder is now table stakes at Birdeye.
15. Multi-location model from day one: business groups, per-location permissions, cross-location comparison, bulk operations with one approval applied across locations.
16. Agency layer like Vendasta's: white-label with custom domain and app branding, a prospect audit report (listings, reviews, social, website, SEO, ads, ecommerce, AI visibility) graded and shareable, an ongoing executive report, and a marketplace or package catalog with wholesale and retail pricing.
17. Listings sync to Google, Facebook, Apple, Bing, Yelp at minimum, with audit of stale hours, photos and descriptions; keyword rank tracking and a geogrid; AI search visibility tracking (ChatGPT, Gemini, Perplexity, Google AI Mode) is the 2026 differentiator all three are racing toward.
18. Honest commercial terms as product features: published pricing, month-to-month option, in-app cancellation, no 90-day notice trap, no surprise renewal uplift, fees (10DLC, carrier) itemized in the UI. This is where all three bleed trust.
19. Country gating in the data model: SMS and MMS availability varies by country (US and Canada full; UK, Australia, Mexico limited), so channel availability must be a per-location capability, not a global assumption.
20. An MCP or API surface for external agents (Birdeye MCP, Podium webhooks, Vendasta API) so the platform can be driven by other AI clients.
