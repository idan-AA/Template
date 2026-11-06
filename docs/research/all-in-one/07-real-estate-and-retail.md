# 07. Real estate teams and retail/food: user-level feature inventory (late 2026)

Research date: 2026-11-06. Scope: (A) real estate agents and teams, as served by Follow Up Boss (FUB), Lofty (formerly Chime), and a glance at kvCORE/BoldTrail; (B) retail, food and local commerce, as served by Square's business suite and a glance at Toast.

Method notes. Official feature pages, pricing pages, help centers and changelogs were preferred. The FUB help center (help.followupboss.com), Lofty help center (help.lofty.com), G2, Capterra, Software Advice, Inman, Toast's product pages and Reddit all refused automated fetches (HTTP 403 or blocked), so rows that cite those domains rely on the text snippets returned by web search, not a full page read. Those rows are still labeled OBSERVED when the snippet was a direct quote of the official article, and the limitation is noted in "Notable details". Prices are US unless stated. Labels: OBSERVED means stated on the cited page or snippet; INFERRED means a reasonable reading of what was stated; "not confirmed" means the research could not verify it.

---

## A1. Follow Up Boss (followupboss.com)

Positioning: a CRM and follow-up engine for agents and teams, owned by Zillow. It does not generate leads, does not include an IDX website, and relies on 250+ integrations for websites, transaction management and open-house capture.

### Pricing summary

| Plan | Price | Included | Source |
|---|---|---|---|
| Grow | $69 per user per month ($58 annual) | Per user; Calling add-on $39 per user per month ($33 annual) | https://www.followupboss.com/pricing |
| Pro | $499 per month ($416 annual), 10 users included | Extra users $49 ($41 annual); unlimited calling and texting; team inboxes; call reporting | https://www.followupboss.com/pricing |
| Platform | $1,000 per month ($833 annual), 30 users included | Extra users $20 ($17 annual); teams within teams; priority support | https://www.followupboss.com/pricing |
| All plans | Unlimited contacts, lead sources and integrations; 7-day support; "AI built right into how you already work"; free trial, no contract | | https://www.followupboss.com/pricing |

### Feature table

| Feature | What the user can do | Notable details and limits | Tier | Source | Label |
|---|---|---|---|---|---|
| Lead sources and inbox lead processing | Connect any lead source or website; leads arrive by API or by parsing lead emails from a connected Google or Microsoft 365 mailbox, or by forwarding to a FUB lead address | "Unlimited contacts, lead sources and integrations" on every plan | All | https://www.followupboss.com/pricing ; https://help.followupboss.com/hc/en-us/articles/4420151624343 | OBSERVED |
| Zillow Tech Connect | Receive Zillow Premier Agent leads (Zillow, Trulia, HotPads, StreetEasy) by API, including Concierge live transfers; optionally let Zillow's own routing (direct, percentage, round robin) assign the agent and keep assignment in sync | Direct calls to an agent's Zillow number and broadcast-routed leads do not sync; a live-transfer flag and two-way linking were announced as coming | All | https://www.followupboss.com/blog/adjusting-zillow-changes | OBSERVED |
| Realtor.com | Connections Plus leads come in by API; all other Realtor.com leads arrive through inbox lead processing | API path "speeds processing and adds more information" | All | https://help.followupboss.com/hc/en-us/articles/4420151624343 (search snippet) | OBSERVED |
| Lead Flow routing rules | Set routing rules per lead source or lead type: assign to a specific agent, round robin a group, first to claim, or send to a lead pond; attach an action plan to the rule | A lead provider that names a specific agent bypasses Lead Flow and goes straight to that agent. Help center refused fetch; rule details beyond this come from the section index and snippets. Minute-level claim timeouts and automatic reassignment of leads that were not followed up are listed as feature requests, so not available natively | All ("Customize lead distribution" on Grow) | https://www.followupboss.com/pricing ; https://help.followupboss.com/hc/en-us/sections/1500001951821-Lead-Flow ; https://help.followupboss.com/hc/en-us/articles/360015220474 ; https://www.followupboss.com/how-it-works/team-leader | OBSERVED (rule types), INFERRED (exact claim mechanics) |
| Lead ponds | Park unassigned leads in a shared pond that pond members can claim; ponds are commonly used with first to claim and a timed release to a second pond | Pond and First to Claim are separate help articles in the Lead Flow section; mechanics seen only via third-party SOPs | All | https://help.followupboss.com/hc/en-us/sections/1500001951821-Lead-Flow ; https://intercom.help/maverickre/en/articles/10302196-keeton-co-lead-conversion-sop | OBSERVED (existence), INFERRED (mechanics) |
| Action Plans | Build automated sequences of drip emails, texts, tasks and stage changes; start them manually, from Lead Flow for new leads, or from Automations for existing contacts | Managed under Admin > Action Plans; only owners and admins create Automations; delays are in days (minutes or hours listed as a feature request) | All ("Automate follow up with Action Plans" on Grow) | https://www.followupboss.com/pricing ; https://help.followupboss.com/hc/en-us/articles/4402126820119 (snippet) | OBSERVED |
| Automations | Trigger action plans and other changes from events such as stage change, tag added, deal custom date field | Example: start a plan one week before an appraisal deadline | All | https://updates.followupboss.com/en/level-up-your-deal-organization-and-workflow-track-commissions-splits-automation-more | OBSERVED |
| Smart Lists | Dynamic, auto-refreshing filtered lists of contacts (by stage, last contact, source, tags, website activity) that agents work top to bottom; call directly from the list | "Foundation of a solid follow-up system"; FUB Pixel adds website-activity filters | All | https://www.followupboss.com/pricing ; https://www.followupboss.com/how-it-works/team-leader ; https://help.followupboss.com/hc/en-us/articles/4402126820119 (snippet) | OBSERVED |
| Calling (dialer) | Click to call from web or mobile app; calls auto-logged, optionally recorded; agents with calling get their own number for inbound and outbound | Grow: paid add-on. Pro and Platform: unlimited calling for all users. No power dialer or multi-line dialer confirmed natively (third parties such as Callingly and CallAction fill this) | Add-on on Grow; included Pro and Platform | https://www.followupboss.com/pricing ; https://help.followupboss.com/hc/en-us/articles/360012327374 (snippet) ; https://help.followupboss.com/hc/en-us/articles/29446680744471-Inbox-Apps-Callingly | OBSERVED |
| Texting | Send one-off and quick texts from any FUB number; texts logged on the contact timeline for the whole team; choose the outbound "from" number | Without Calling add-on texts go out from the Company Number; Pro and Platform list unlimited texting; Grow texting limits not stated on pricing page; 10DLC pass-through fees not confirmed | All; unlimited on Pro and Platform | https://www.followupboss.com/pricing ; https://updates.followupboss.com/en/send-a-quick-text-from-any-of-your-follow-up-boss-numbers | OBSERVED |
| Company Number and Team Inbox | A shared business number whose inbound calls ring a group of agents at once (first to answer, keypress to accept, 30-second ring), with texts, missed calls and voicemails logged in a shared inbox; route known clients straight to their agent and new callers to ring groups; live transfer, after-hours forwarding, call tracking per marketing number | No limit on agents or numbers in a ring group since Nov 2021; team inboxes and call reporting not available on Grow | Pro and Platform | https://followupboss.com/features/company-number ; https://updates.followupboss.com/en/team-inbox-improvements-help-you-answer-and-track-every-call-to-your-business ; https://www.followupboss.com/pricing | OBSERVED |
| Personal inbox | A per-user inbox of calls, texts and emails with the user's own contacts | | All | https://help.followupboss.com/hc/en-us/articles/1500008632942 (snippet) | OBSERVED |
| Email sync and calendar sync | Two-way sync with Google or Microsoft 365 mail and calendar; appointments created in FUB appear on Google Calendar and vice versa | Official calendar article not fetched; marketplace listing and third-party guide confirm two-way sync | All ("Sync your calendar & email") | https://www.followupboss.com/pricing ; https://workspace.google.com/marketplace/app/follow_up_boss/849289429645 | OBSERVED |
| Appointments | Create appointments on a contact; appointments set is a tracked metric in the Agent Activity report | Online self-booking page for leads: not confirmed natively | All | https://help.followupboss.com/hc/en-us/articles/360025682274 (snippet) | OBSERVED |
| Deals (pipelines) | Drag-and-drop pipelines (default Buyers and Sellers), stages with total value per stage, close date, commission and agent/team split fields (dollar or percentage), deal custom fields including date fields that show on the calendar | Not a transaction management system: no document or e-signature workflow natively; Paperless Pipeline, Brokermint and others integrate | All | https://followupboss.com/features/deals ; https://updates.followupboss.com/en/level-up-your-deal-organization-and-workflow-track-commissions-splits-automation-more ; https://help.followupboss.com/hc/en-us/articles/360015220774 (snippet) | OBSERVED |
| Deal reporting | Conversion rate by agent and by lead source, total deal value, total commission, earned vs pending commission | | All | https://followupboss.com/features/deals ; https://help.followupboss.com/hc/en-us/articles/360047800793 (snippet) | OBSERVED |
| Reporting: speed to lead | Report "How Quickly We Follow Up On Leads": average speed to action, first call, first text, first email on new leads; export to spreadsheet | Also a Speed to Lead and Lead Source report and an Agent Activity report (appointments set, tasks completed, calls, texts, emails) | All ("Report on agent & lead source performance"); call reporting Pro and up | https://help.followupboss.com/hc/en-us/articles/360014693073 (snippet) ; https://help.followupboss.com/hc/en-us/articles/360025682274 (snippet) ; https://www.followupboss.com/pricing | OBSERVED |
| Team leaderboard | Rank agents on activity to motivate the team | | All | https://www.followupboss.com/how-it-works/team-leader | OBSERVED |
| Teams within teams | Nest sub-teams with their own leaders and visibility | | Platform | https://www.followupboss.com/pricing | OBSERVED |
| IDX website and listing alerts | Not native. Embedded apps such as RealSavvy let agents create IDX accounts, saved searches and listing alerts inside the CRM; Showcase IDX, Real Geeks, Sierra and others connect by API | "No native IDX website or landing page builder" | Integration | https://help.followupboss.com/hc/en-us/articles/360044859393-Embedded-App-RealSavvy ; https://theclose.com/follow-up-boss-review/ | OBSERVED |
| Open house capture | Not native. Showable and IDXAddons push open house sign-ins into FUB by API key, with tags such as idx-openhouse | | Integration | https://help.followupboss.com/hc/en-us/articles/39391985248535-Showable ; https://idxaddons.com/tutorial/open-house | OBSERVED |
| FUB Pixel | Install a tracking pixel on any website to see contact browsing activity and filter Smart Lists by it | | All | https://help.followupboss.com/hc/en-us/articles/4402126820119 (snippet) | OBSERVED |
| Inbox Apps and open API | Embed partner apps (Callingly, CallAction, Agent Legend, Paperless Pipeline) on the contact record; deals, commissions and custom fields exposed in the API | 250+ integrations | All | https://help.followupboss.com/hc/en-us/articles/29446680744471-Inbox-Apps-Callingly ; https://www.followupboss.com/how-it-works/team-leader | OBSERVED |
| AI: Smart Messages | Click the sparkle icon in the text or email composer to get a suggested reply based on the lead's recent actions and prior exchanges; a custom prompt option drafts from your instruction | "Available now for all accounts" (June 5, 2025); mobile support announced as coming soon; FUB advises reviewing every message | All | https://updates.followupboss.com/en/smart-messages-ai_suggested-text-and-email-replies-built-into-your-workflow | OBSERVED |
| AI: Smart Summary and Suggested Tasks | Call transcripts and the full lead profile (texts, calls, emails, notes, activity) summarized above the timeline, with suggested tasks that can be added to the record | Requires calls through a FUB number with recording on; calls must be 15 seconds to 60 minutes; transferred calls not summarized. Help article stated Smart Summary was in closed beta and "temporarily turned off for all users" at time of the Sept 2026 third-party check; status should be rechecked | Listed under Pro and Platform on pricing page | https://www.followupboss.com/pricing ; https://help.followupboss.com/hc/en-us/articles/30282773055127-Smart-Summary (snippet) ; https://theclose.com/follow-up-boss-review/ | OBSERVED (feature), not confirmed (current availability) |
| AI: Smart Actions (beta) | After a call through a FUB number, AI texts the agent suggested CRM updates: stage changes require a reply to approve, timeframe updates apply automatically | Only Zillow buyer lead stages supported; needs FUB Calling with recording and the Zillow two-way integration | Beta | https://help.followupboss.com/hc/en-us/articles/37957434220055-Smart-Actions (snippet) | OBSERVED |
| AI: Predictive lead prioritization | Contacts flagged (via tags) by likelihood to convert so agents can work the hottest first | Reviews note it leans on Zillow data; no official detail page found | Pro and Platform per pricing page | https://www.followupboss.com/pricing ; https://followupace.com/blog/follow-up-boss-ai-tools-complete-guide | OBSERVED (existence), INFERRED (scoring inputs) |
| Mobile app | iOS and Android app for calls, texts, lists and tasks | Reviews report some desktop-level tasks (tag management) are hard on mobile | All | https://www.followupboss.com/pricing ; https://theclose.com/follow-up-boss-review/ | OBSERVED |

### FUB: what is absent natively (OBSERVED via theclose.com review and FUB pages)
No IDX website, no listing management, no transaction management, no payment processing, no social publishing, no lead generation, no free plan (14-day trial), no 24/7 support (8am to 8pm ET).

---

## A2. Lofty, formerly Chime (lofty.com)

Positioning: an "agentic AI operating system" for real estate bundling CRM, IDX websites, lead generation services, dialer, Smart Plans, transaction management and a family of AI agents. Pricing is quote-only for all four tiers (Agent, Team, Broker, Enterprise).

### Pricing summary

| Item | Price | Source | Label |
|---|---|---|---|
| Lofty Agent / Team / Broker / Enterprise | "Request Pricing" on all tiers | https://www.lofty.com/pricing | OBSERVED |
| Entry pricing (secondhand) | About $449 per month, setup fees $299 to $1,499, per a competitor's May 2026 report | https://getdex.com/blog/dex-vs-lofty/ | INFERRED (secondhand) |
| Add-ons listed | Lead Gen Service, Power Dialer, additional text packages, Hyperlocal SEO Website, Website Design, SEO Setup, WordPress IDX Plugin, Lofty Present CMA Builder, Sales Agent, Social Agent, Homeowner Agent | https://www.lofty.com/pricing | OBSERVED |
| AI Sales Agent quota | Included version works 10 leads per month; paid tier starts at 200 leads for $60 per month, plus 100 leads for $30 per month | https://help.lofty.com/hc/en-us/articles/39659584983067-Getting-Started-with-AI-Sales-Agent (snippet) | OBSERVED |
| Lead gen | Buyer lead tiers 20 to 30, 50 to 70, more; seller lead tiers 10 to 20, 20 to 40, more; seller lead gen carries a 20% ad management fee and needs an IDX site or a $70 per month Home Evaluation Page; sphere ads carry a 15% fee | https://www.lofty.com/pricing | OBSERVED |

### Feature table

| Feature | What the user can do | Notable details and limits | Tier | Source | Label |
|---|---|---|---|---|---|
| Lead Routing Rules | Build ordered rules that assign leads to agents, assistants, lenders or custom roles by location, price, property type or source; rule types include Round Robin, Next Up (one agent at a time with a claim window), Blast Alert (everyone notified, first to claim), and routing to a Lead Pond; a default catch-all rule | Next Up and Blast Alert require a claim; Lofty recommends a catch-all Round Robin that does not require a claim so overnight leads still get assigned; rule order matters (drag to reorder) | Team and up ("Advanced lead routing") | https://help.lofty.com/hc/en-us/articles/360055177831-Lead-Routing-Rules (snippet) ; https://lofty.com/feature/strong-teamwork ; https://www.lofty.com/pricing | OBSERVED |
| Lead Pond | Store unassigned leads in a pond; permitted users claim them with a "Claim Lead Now" button; a claim log shows who claimed what in the last 30 days | All team accounts get one pond; Enterprise gets up to 5,000 ponds | Team (1 pond); Enterprise (up to 5,000) | https://help.lofty.com/hc/en-us/articles/360038382872-Lead-Pond (snippet) | OBSERVED |
| Speed to lead | Next Up and Blast Alert "ensure that leads are contacted within a predefined period of time"; AI Sales Agent engages web leads "within 5 seconds" | | Team and up; AI add-on | https://lofty.com/feature/strong-teamwork ; https://lofty.com/ai/sales-agent | OBSERVED |
| Smart Plans | Multi-step workflows (up to 80 steps) over email, text, calls, tasks and direct mail; building blocks are triggers (10 types: Lead Created, Website Behavior, Communication, etc., plus a yearly Date trigger for recurring plans), conditions (Wait Until an Event, Branch) and actions; Auto Email and Auto Text send automatically while Email/Text/Call steps create a to-do for the agent | A behavior-triggered plan fires once per lead; plans auto-pause when the lead replies by email, call, text or to the AI; "My Smart Plans" are private to their creator; a library of templates (new lead nurture, open house follow-up, expired listings, past client anniversaries) | All | https://help.lofty.com/hc/en-us/articles/4419016941083 (snippet) ; https://help.lofty.com/hc/en-us/articles/7626737520923 (snippet) ; https://help.lofty.com/hc/en-us/articles/53175453093659-Using-a-Smart-Plan-from-the-Library-Lofty-AOS ; https://lofty.com/ | OBSERVED |
| Email and texting | One-off, mass and auto email; mass and auto texting; campaign segments | Additional text packages are a paid add-on, implying included text volume caps (amount not published) | All | https://www.lofty.com/pricing | OBSERVED (features), INFERRED (caps) |
| Dialer | Basic dialer included; Power Dialer (scaled outbound calling to leads, team and past clients) is an add-on | Multi-line or voicemail-drop details not confirmed | Basic: all; Power Dialer: add-on | https://www.lofty.com/pricing ; https://lofty.com/ | OBSERVED |
| IDX website | Fully customizable, SEO-optimized IDX site with home search; unlimited agent subdomains; external listing widget; WordPress IDX plugin; Hyperlocal done-for-you site; Closely mobile home-search app for clients | Website behavior feeds Smart Plan triggers and AI Sales Agent triggers | All (IDX site); add-ons for Hyperlocal and WordPress | https://www.lofty.com/pricing ; https://lofty.com/ | OBSERVED |
| Listing alerts and saved searches | Implied by IDX site and Closely app with saved searches | Dedicated help article not fetched; not confirmed in detail | All | https://lofty.com/ | INFERRED |
| CMA and presentations | Unlimited basic CMAs; Lofty Present CMA Builder as add-on | | All (basic); add-on (Present) | https://www.lofty.com/pricing | OBSERVED |
| Transaction management and Back Office | Paperless transaction management from contract to close with a reporting suite; Back Office covers "operations, from hiring through closing" | Depth (e-signature, compliance review) not confirmed | Team/Broker (INFERRED) | https://lofty.com/ | OBSERVED (existence) |
| Social Studio and Lofty Blast | Automated social posting; turn a new listing into Facebook, Instagram and email ads in one click | | Social Studio Basic on all | https://www.lofty.com/pricing ; https://lofty.com/ | OBSERVED |
| Lead generation services | Managed Google, Facebook, Microsoft ads; OpenAI (ChatGPT) ads; Google LSA; "Own Your ZIP Code" (Facebook ads plus direct mail); SEO/GEO/AEO services | Lead counts are estimates, not guarantees | Add-on | https://lofty.com/ ; https://www.lofty.com/pricing | OBSERVED |
| Reporting | Team reporting with a Reporting Page Metrics help article | Help article refused fetch; response-time metric present per search result title only | Team and up | https://help.lofty.com/hc/en-us/articles/37938425417499-Reporting-Page-Metrics ; https://www.lofty.com/pricing | OBSERVED (existence), not confirmed (metric list) |
| Team and broker management | Team management, SSO, white label, customizable org structure, reporting | SSO, white label and org structure appear limited to one tier (likely Enterprise) | Broker/Enterprise | https://www.lofty.com/pricing | OBSERVED (features), INFERRED (tier) |
| AI: Lofty Cowork (July 28, 2026) | A chat-style AI workspace with no setup: "Your Morning Read" prioritizes the day's high-value tasks, "What Needs You Now" ranks items only a human can do; give it a task once or on a schedule and it runs inside Lofty; one-click execution of recommended steps; review leads, send mass texts, build Smart Plans from chat | Listed as included on pricing grid ("Lofty Cowork", "AI task prioritization", "scheduled AI tasks", "custom AI agents", "AI agent library", "AI CLI access", "AI lead scoring") | Included (tier mapping unclear) | https://retechnology.com/news/lofty-expands-aos-its-agentic-ai-operating-system-for-real-estate-anchored-by-new-cowork-experience ; https://lofty.com/ ; https://www.lofty.com/pricing | OBSERVED |
| AI: Sales Agent (ISA) | 24/7 virtual ISA over text, email and website chat (plus an AI Outbound Call feature) that engages within 5 seconds, asks timeline, budget and must-haves, logs answers to the lead record, books appointments on the agent's calendar with confirmations, nurtures non-responders on a configurable cadence, and hands off with a brief; live-transfers on calls when the lead asks for a human | Most texts are triggered by lead activity on the website; skips wrong numbers, DNC, landlines, and leads that had no phone when created; AI identity disclosure setting; day-of-week texting schedule; company-level vs individual-agent versions; languages: English, Spanish, Mandarin, French | Included 10 leads per month; paid from $60 per month for 200 leads | https://lofty.com/ai/sales-agent ; https://help.lofty.com/hc/en-us/articles/39659584983067-Getting-Started-with-AI-Sales-Agent (snippet) | OBSERVED |
| AI: Homeowner Agent | Scans the database for likely sellers and flags real intent to move | | Add-on | https://lofty.com/ ; https://www.lofty.com/pricing | OBSERVED |
| AI: Social Agent | Plans posts, writes captions, keeps social channels active | | Add-on | https://lofty.com/ | OBSERVED |
| AI: Custom Agents, MCP server, Developer Platform | Build agents for repetitive listing, transaction and recruiting work; connect external AI agents to Lofty data via an MCP server; developer platform for custom apps | | Included per pricing grid; tier mapping unclear | https://lofty.com/ ; https://www.lofty.com/pricing | OBSERVED |
| Mobile app | CRM, leads and communications on phone | | All | https://www.lofty.com/pricing | OBSERVED |
| Onboarding and support | Help center, phone and chat support, live webinars, 1:1 onboarding, dedicated CSM at higher tiers; Set Up & Success program with data migration | | Varies | https://www.lofty.com/pricing ; https://lofty.com/ | OBSERVED |

---

## A3. kvCORE / BoldTrail (glance)

Inside Real Estate merged kvCORE, BoomTown and Brokermint into BoldTrail in mid-2024 and is phasing out the kvCORE name.

| Feature | What the user can do | Notable details and limits | Tier | Source | Label |
|---|---|---|---|---|---|
| Smart CRM with behavioral nurturing | Follow-up is tailored to what a lead searches on the IDX site, how often they return and which properties they view; leads are scored in real time | | Agent and up | https://boldtrail.com/?p=30881 ; https://boldtrail.com/blog/kvcore-vs-boldtrail/ | OBSERVED |
| Smart Campaigns | Pre-built and customizable automated email and text sequences for new buyers, long-cycle nurture, sellers and past clients; triggered by actions | "AI-driven drip sequences", "retained and expanded" from kvCORE | Agent and up | https://boldtrail.com/?p=30881 ; https://boldtrail.com/blog/kvcore-vs-boldtrail/ | OBSERVED |
| Speed to lead | A lead that registers on the IDX site or arrives from paid traffic receives "a relevant first touchpoint within minutes" automatically | | Agent and up | https://boldtrail.com/?p=30881 | OBSERVED |
| IDX website and Page Editor | Branded IDX site on your domain connected to 600+ MLS boards; drag-and-drop editor for home valuation, listing and market report capture pages | | Agent and up | https://boldtrail.com/?p=30881 | OBSERVED |
| Lead routing and ponds | Team routing, accountability dashboards and multi-agent tools "available but not required"; pond accounts hold unassigned leads that pond members can claim; a lead sits in only one pond at a time | Detailed routing article returned 404 | Team and up | https://boldtrail.com/blog/kvcore-vs-boldtrail/ ; https://intercom.help/kvcore/en/articles/8358981-overview-of-pond-accounts (snippet) | OBSERVED |
| Mobile calling and texting | In-app calling and texting with automatic logging, lead alerts, pipeline visibility | | Agent and up | https://boldtrail.com/?p=30881 | OBSERVED |
| Lead Engine and Marketplace | Google and Facebook lead gen and squeeze pages; add-on marketplace for lead gen, social ads and post-close nurture | | Add-on | https://boldtrail.com/blog/kvcore-vs-boldtrail/ | OBSERVED |
| BackOffice (ex Brokermint) | Commission management and reporting for brokerages | | Brokerage | https://boldtrail.com/blog/kvcore-vs-boldtrail/ | OBSERVED |
| Recruiting module | Agent recruiting and retention tools, new vs kvCORE | | Brokerage | https://boldtrail.com/blog/kvcore-vs-boldtrail/ | OBSERVED |

---

## B1. Square business suite (squareup.com)

Positioning: a payments-first operating system for retail, food and services. In early 2025 Square collapsed its vertical plans into three tiers that apply across Retail, Restaurants, Appointments and Online: Free ($0), Plus ($49 per location per month), Premium ($149 per location per month), plus "Square Pro" custom pricing above $250,000 processed per year. Processing rates drop by tier.

### Pricing summary (OBSERVED unless noted)

| Item | Free | Plus | Premium | Source |
|---|---|---|---|---|
| Software | $0 | $49 per location per month | $149 per location per month | https://fitsmallbusiness.com/square-fees-pricing-guide/ (Jan 2026) ; https://www.getsauce.com/post/square-online-ordering-pricing-fees |
| In-person card | 2.6% + 15c | 2.5% + 15c | 2.4% + 15c | https://fitsmallbusiness.com/square-fees-pricing-guide/ |
| Online and invoices | 3.3% + 30c | 2.9% + 30c | 2.9% + 30c | same |
| Keyed or card on file | 3.5% + 15c | 3.5% + 15c | 3.5% + 15c | same |
| ACH | 1%, min $1, cap $10 | | | https://www.getsauce.com/post/square-online-ordering-pricing-fees |
| Afterpay 6% + 30c; instant transfer +1.75%; international cards +1.5% | | | | same two sources |
| Marketing texts | n/a (Marketing requires Plus or Premium) | 500 per month included, 3c each after | 2,500 per month included, 1.5c each after | https://squareup.com/us/en/software/marketing |
| Messages Plus | $10 per location per month (for Square Free sellers who only want Messages Plus) | included | included | https://squareup.com/help/us/en/article/8071-compare-square-messages-free-and-square-messages-plus (snippet) ; https://squareup.com/help/us/en/article/7985-get-started-with-square-messages-plus |
| Loyalty | From about $45 per month, priced by visit volume, one plan for the whole business, 30-day trial | | | https://www.upmenu.com/blog/square-pricing (secondary) ; https://squareup.com/us/en/software/loyalty |
| Invoices Plus | US price not confirmed (CA and AU $30 per month; IE 20 euro); a third-party review cites $20 | | | https://squareup.com/help/ca/en/article/7650 ; https://wise.com/us/blog/square-invoices-review |
| KDS app | | $30 per device per month | $20 per device per month | https://squareup.com/us/en/point-of-sale/restaurants/pricing |
| Kiosk app | | $99 per device per month ($50 Kiosk Lite iOS) | $99 ($30 Kiosk Lite iOS) | same |
| Gift cards | eGift free to set up; physical cards priced by volume (about $0.80 each per review); 2.5% load fee plus processing; no redemption fee | | | https://squareup.com/us/en/gift-cards ; https://www.merchantmaverick.com/reviews/square-retail-review/ |
| Payroll | $35 per month plus $6 per person paid; contractor-only $6 per person | | | https://fitsmallbusiness.com/square-fees-pricing-guide/ |

### Square for Retail

| Feature | What the user can do | Notable details and limits | Tier | Source | Label |
|---|---|---|---|---|---|
| Catalog and items | Automatic item and SKU creation, discounts and refunds, barcode scanning at checkout | Exchanges are Plus-only since the 2025 repricing | Free | https://squareup.com/us/en/point-of-sale/retail/pricing ; https://www.merchantmaverick.com/reviews/square-retail-review/ | OBSERVED |
| Inventory management | Stock intake, low-stock alerts, unit cost, inventory counting tool, barcode label printing, transfer stock between locations | Label printing and unit cost are paid-tier features per review | Plus | https://squareup.com/us/en/point-of-sale/retail/pricing ; https://www.merchantmaverick.com/reviews/square-retail-review/ | OBSERVED |
| Vendors and purchase orders | Create and send POs, manage vendors and pending restocks; import POs and vendor sales reports on Premium | | Plus (POs); Premium (PO import) | https://squareup.com/us/en/point-of-sale/retail/pricing ; https://www.merchantmaverick.com/reviews/square-retail-review/ | OBSERVED |
| COGS and advanced reporting | COGS, projected profit, vendor sales, inventory by category, labor vs sales | | Plus | same | OBSERVED |
| Cross-location returns, fulfillment, transfer orders | Return or fulfill at any location; formal transfer orders | | Premium | https://squareup.com/us/en/point-of-sale/retail/pricing | OBSERVED |
| Team permissions | Manage staff and set user permissions | Moved to Plus in 2025 repricing | Plus | https://www.merchantmaverick.com/reviews/square-retail-review/ | OBSERVED |
| Support | Free plan support limited to first 90 days; 24/7 phone support on Premium | | Free (90 days); Premium (24/7) | https://www.merchantmaverick.com/reviews/square-retail-review/ ; https://squareup.com/us/en/point-of-sale/retail/pricing | OBSERVED |

### Square for Restaurants

| Feature | What the user can do | Notable details and limits | Tier | Source | Label |
|---|---|---|---|---|---|
| Menu and order management | Item and menu management, fast order entry, open bills, service charges, automatic gratuity, pickup and local delivery, a branded online ordering page | | Free | https://squareup.com/us/en/point-of-sale/restaurants/pricing | OBSERVED |
| Table management | Drag-and-drop floor plans, open bills per table | Listed as included on all three plans on Square's regional pages | Free and up | https://squareup.com/ie/en/point-of-sale/restaurants/bars (snippet) ; https://square.com/gb/en/point-of-sale/restaurants/features/table-management-system | OBSERVED (regional pages) |
| Kitchen Display System | Route tickets to kitchen screens | $30 per device per month on Plus, $20 on Premium | Add-on | https://squareup.com/us/en/point-of-sale/restaurants/pricing | OBSERVED |
| Integrated inventory and close-of-day reports | Track ingredient or item stock; end-of-day summaries | | Plus | same | OBSERVED |
| Coursing and seat management | Fire courses and track by seat | | Premium | same | OBSERVED |
| Kiosk | Self-order kiosk app | $99 per device per month; Kiosk Lite on iOS $50 (Plus) or $30 (Premium) | Add-on | same | OBSERVED |

### Square Customer Directory (free CRM)

| Feature | What the user can do | Notable details and limits | Tier | Source | Label |
|---|---|---|---|---|---|
| Automatic profiles | A profile is created from every sale; later transactions de-duplicated and merged into it | Identity match is by card, phone, email or receipt interaction | Free | https://squareup.com/us/en/customer-directory | OBSERVED |
| Purchase history and visit frequency | See purchases across channels; reporting on new vs returning visit frequency | | Free | same | OBSERVED |
| Smart groups and filters | Auto-populating groups (marketing subscribers, loyalty participants, lapsed customers); filter and segment by buying habits; search by name, phone, email or custom field | Custom fields supported | Free | same | OBSERVED |
| Feedback | Collect satisfaction from digital receipts, reply to resolve issues, thank or send a coupon | | Free | same | OBSERVED |
| Import, export, merge, delete at scale | Bulk operations described as enterprise features | Standard CSV import not confirmed from this page | Free / enterprise | same | OBSERVED (existence), not confirmed (standard import details) |
| Links to Marketing, Loyalty, Messages | Segments feed campaigns; loyalty status on profile; communication history in Messages | | Free (directory), paid (Marketing, Loyalty) | same | OBSERVED |

### Square Marketing

| Feature | What the user can do | Notable details and limits | Tier | Source | Label |
|---|---|---|---|---|---|
| One-time and recurring campaigns | Email and text blasts for promotions, events, new products; weekly or monthly recurring coupons; schedule in advance; customizable templates | Requires Square Plus or Premium | Plus and up | https://squareup.com/us/en/software/marketing | OBSERVED |
| Automations | Welcome new customers or subscribers, birthday offers, win-back lapsed customers, abandoned cart reminders, re-engage after a set period of inactivity | No explicit "first purchase" trigger shown; birthday requires a stored date | Plus and up | same | OBSERVED |
| Segmentation | Smart targeting groups and custom groups from purchasing habits; automatic opt-in list building | | Plus and up | same | OBSERVED |
| Coupons | Create and send coupons by email or text; redemption tracked at POS | | Plus and up | same | OBSERVED |
| Facebook posting | Publish promotions and events to Facebook with results in Dashboard | | Plus and up | same | OBSERVED |
| Google review requests | Automatic review request after a sale at no extra cost | | Plus and up (INFERRED) | same | OBSERVED |
| Attribution reporting | Campaign success and attributed sales across channels and locations; on-demand reports | | Plus and up | same | OBSERVED |
| Text volume | 500 texts per month on Plus (3c after), 2,500 on Premium (1.5c after); unlimited email | | Plus, Premium | same | OBSERVED |

### Square Loyalty

| Feature | What the user can do | Notable details and limits | Tier | Source | Label |
|---|---|---|---|---|---|
| Earning rules | Points per visit, per amount spent, or per item or category; points on cash purchases | | Paid add-on | https://squareup.com/us/en/software/loyalty | OBSERVED |
| Rewards | Dollar off or free item, redeemable in store or online | | | same | OBSERVED |
| Status (VIP) tiers | Customizable tier names; multipliers such as Bronze 1.5x, Silver 2x, Gold 3x | | | same | OBSERVED |
| Enrollment | Sign up at POS (phone number), on the Square website, or via invoice | Phone-number enrollment at checkout described in a testimonial | | same | OBSERVED |
| Promotions | Limited-time or recurring bonus-point promotions | | | same | OBSERVED |
| Customer notifications | Automatic transactional texts when points or rewards are earned; Apple Wallet loyalty pass | | | same | OBSERVED |
| Reporting | Top loyalty customers, loyalty-attributed sales, loyalty vs non-loyalty average spend, promotion performance | | | same | OBSERVED |
| Pricing | One plan for the whole business; 30-day trial; third parties report from about $45 per month by visit volume | Official pricing page returned 404 | | same ; https://www.upmenu.com/blog/square-pricing | OBSERVED (trial), INFERRED (price) |

### Square Messages

| Feature | What the user can do | Notable details and limits | Tier | Source | Label |
|---|---|---|---|---|---|
| Unified inbox | Texts and emails in one inbox on Dashboard, POS apps and Square hardware; reply to feedback, receipts, appointment updates, invoices, orders and loyalty status messages | Channels are SMS and email only; Instagram and Facebook not supported (not confirmed anywhere official) | Free | https://squareup.com/help/us/en/article/7370-square-messages-get-started-guide | OBSERVED |
| Send from a conversation | Photos and payment links on all plans; coupons and PDF attachments on paid plans; invoices and estimates described as sendable on free per comparison snippet | | Free / paid | same ; https://squareup.com/help/us/en/article/8071-compare-square-messages-free-and-square-messages-plus (snippet) | OBSERVED |
| Start new conversations | Initiate text or email to a customer and receive messages from new (unknown) customers | Free tier is reply-only | Plus, Premium, or Messages Plus ($10 per location) | https://squareup.com/help/us/en/article/7985-get-started-with-square-messages-plus | OBSERVED |
| Dedicated business number | A verified toll-free business number for texting; voicemail transcription; redirect missed calls to text | Toll-free verification can fail and be resubmitted; texts to Philippine numbers unsupported | Plus and up / Messages Plus | same | OBSERVED |
| Square Assistant | AI auto-replies for appointment confirmations and rescheduling | Only with Square Appointments | Appointments | https://squareup.com/help/us/en/article/8071-compare-square-messages-free-and-square-messages-plus (snippet) | OBSERVED |

### Square Invoices

| Feature | What the user can do | Notable details and limits | Tier | Source | Label |
|---|---|---|---|---|---|
| Invoices, recurring invoices, estimates, contracts, projects | Send unlimited invoices and recurring invoices; create estimates and contracts with e-signature; group work into projects | | Free | https://squareup.com/help/us/en/article/7650 | OBSERVED |
| Deposits and reminders | Request an upfront deposit with a separate balance due date; automatic reminders before, on, or after due date | | Free | same | OBSERVED |
| Payment schedules (milestones) | One invoice with several scheduled payments tied to milestones | | Plus | same | OBSERVED |
| Multi-package estimates and auto-conversion | Offer several packages in one estimate; accepted estimate converts to invoice automatically | | Plus | https://squareup.com/help/ca/en/article/7650 ; https://squareup.com/us/en/blog/invoices-plus | OBSERVED |
| Custom invoice templates and fields; $10 ACH cap | | | Plus | https://squareup.com/help/us/en/article/7650 | OBSERVED |
| Processing | Invoice card payments 3.3% + 30c (Free), 2.9% + 30c (Plus and Premium) | | | https://fitsmallbusiness.com/square-fees-pricing-guide/ | OBSERVED |
| Payment links | Create a checkout link for any amount or item and send it by text, email or from Messages | | Free | https://squareup.com/help/us/en/article/7370-square-messages-get-started-guide | OBSERVED |

### Square Online

| Feature | What the user can do | Notable details and limits | Tier | Source | Label |
|---|---|---|---|---|---|
| Free store and ordering page | Online store or restaurant ordering page with pickup, local delivery and shipping; hosting and SSL included; .square.site address with Square ads | 3.3% + 30c online on Free | Free | https://www.getsauce.com/post/square-online-ordering-pricing-fees ; https://www.websitebuilderexpert.com/?p=42076 | OBSERVED |
| Custom domain, no Square ads, abandoned cart recovery, product reviews, subscriptions | | | Plus and up | https://www.websitebuilderexpert.com/?p=42076 | OBSERVED |
| Real-time shipping rates | | | Premium | same ; https://www.merchantmaverick.com/reviews/square-retail-review/ | OBSERVED |
| QR code ordering | Table-side QR ordering for restaurants | Named on Square pricing nav and third-party lists; tier not confirmed | not confirmed | https://www.capterra.com/p/275800/Square-Online/pricing/ (search snippet) | INFERRED |
| Loyalty and gift cards online | Earn and redeem loyalty online; sell eGift cards on the ordering page | eGift online purchase processed at 2.9% + 30c | Free and up | https://squareup.com/us/en/software/loyalty ; https://squareup.com/us/en/gift-cards | OBSERVED |

### Square Appointments (where present)

| Feature | What the user can do | Notable details and limits | Tier | Source | Label |
|---|---|---|---|---|---|
| Booking site and integrations | Online booking page, booking from Instagram and Facebook, QR code booking, Google Calendar sync, unlimited staff calendars, reminders | Free tier for solo pros | Free | https://squareup.com/us/en/appointments/pricing ; https://squareup.com/us/en/appointments | OBSERVED |
| No-show protection | Cancellation policy and no-show fees, deposits and prepayment, multi-staff bookings, waitlist | | Plus ("Growing teams") | https://squareup.com/us/en/appointments/pricing | OBSERVED |
| Resource management and reports | Book rooms or equipment; future bookings report; service cost tracking | | Premium ("Large salons") | same | OBSERVED |
| Square Assistant | AI texting that confirms, cancels and reschedules appointments | | Appointments | https://squareup.com/us/en/appointments | OBSERVED (existence) |

### Square Gift Cards, Team, AI

| Feature | What the user can do | Notable details and limits | Tier | Source | Label |
|---|---|---|---|---|---|
| Gift cards | Sell physical (QR and barcode) and eGift cards in store and online; no expiry; redeem at any location; customer self-serve balance check and reload; refund to gift card as store credit; stored on customer profile as card on file | 2.5% load fee plus processing; no redemption fee | All | https://squareup.com/us/en/gift-cards | OBSERVED |
| Team management and Shifts | Roles and permissions, time tracking, scheduling, team communication, payroll | Staff pages returned only navigation; permissions moved to Plus for Retail per review | Plus (permissions); Payroll separate | https://www.merchantmaverick.com/reviews/square-retail-review/ ; https://squareup.com/us/en/point-of-sale/retail | OBSERVED (existence), not confirmed (detail) |
| Square AI | Ask plain-language questions about sales trends, voided transactions, staff overtime and labor cost, top customers, best sellers by hour; get how-to answers from Square's knowledge base; export answers to CSV; view pie, line or bar charts; keep conversation context; pin AI charts to the Dashboard; conversation history; mobile Dashboard app with voice; local weather, events, news and reviews for neighborhood recommendations | US open beta June 2025; owners and admins only; UK Feb 2026 free; an April 2026 "AI agent that automates daily tasks" was reported by one secondary source only (not confirmed) | Included | https://squareup.com/us/en/press/square-ai-open-beta ; https://squareup.com/us/en/press/square-releases-ai ; https://www.businesswire.com/news/home/20260210922162/en | OBSERVED (features), not confirmed (agentic tasks) |

---

## B2. Toast (glance)

| Feature | What the user can do | Notable details and limits | Tier | Source | Label |
|---|---|---|---|---|---|
| Plans and contracts | Quick Start Bundle $0 per month; Core $69 per month; Custom quote adds gift cards, loyalty, marketing, payroll; Toast Now apps $75 to $175 per month | Flat-rate processing mandatory; card-not-present 3.5% + 15c (3.89% Amex); contracts up to 3 years auto-renewing; early termination equals remaining software fees; $0 hardware in exchange for higher processing | | https://www.merchantmaverick.com/reviews/toast-pos-review/ (Jan 2026) | OBSERVED |
| Guest engagement bundle | Email Marketing, SMS Marketing, Loyalty (tiered rewards, sign-up bonuses), Gift Cards, Social Media Marketing, Toast Websites, Online Ordering, Delivery Services, Guest CRM, Toast Advertising | | Marketing Essentials and IQ Grow | https://www.destinationcrm.com/Articles/CRM-News/CRM-Across-the-Wire/Toast-Debuts-Toast-IQ-Grow-174691.aspx | OBSERVED |
| Toast IQ Grow (May 2026) | Bundle of the growth tools plus an AI Marketing Agent that reads POS data, spots opportunities (BOGO, holiday, slow shifts), builds audiences and drafts email, SMS and social campaigns, plus a human Marketing Success Manager | Marketing Agent in beta; one source cites $499 per month and an 8% average sales lift from a pilot (Toast's figure) | Purchased via Toast Shop | https://www.destinationcrm.com/Articles/CRM-News/CRM-Across-the-Wire/Toast-Debuts-Toast-IQ-Grow-174691.aspx ; https://support.toasttab.com/en/article/Everything-Toast-announced-in-our-Spring-26-Release ; https://www.businesswire.com/news/home/20260505034143/en/ (search snippet) | OBSERVED (bundle), INFERRED (price) |
| Toast IQ assistant | Ask operational questions over sales, labor, menu, guest data; multi-location comparison in one chat; replies in Spanish, Chinese, Korean; reads catering setup | | All POS users (translation); multi-location requires multiple sites | https://support.toasttab.com/en/article/Everything-Toast-announced-in-our-Spring-26-Release | OBSERVED |
| Menu Upsells | AI upsell recommendations on handhelds, terminals, kiosks and guest displays | | All POS users | same | OBSERVED |
| Toast Local | Consumer app where guests discover restaurants, book or join waitlist (Toast Tables or Resy), prepay for experiences, order pickup or delivery, see offers and loyalty balances | Pieces require Toast Tables, Digital Storefront, or Marketing Essentials | Varies | same | OBSERVED |
| Finance and payroll | Toast Checking with "Jars" for tax and payroll set-asides; Auto Payroll; Payroll Success Partners | | Eligible US customers | same | OBSERVED |
| Retail | AI Invoice Scanning (beta) for receiving; inventory counts in Toast Now app (iOS only) | | Toast Retail | same | OBSERVED |

---

## What is specific to each family (module content)

### Real estate module
1. Lead intake from portals (Zillow Tech Connect, Realtor.com Connections Plus) and from email parsing of every other provider, with source attribution carried onto the contact.
2. Routing engine with four native modes seen across all three vendors: direct to agent, round robin, first to claim (Blast Alert), one-at-a-time with timeout (Next Up), and a shared pond with a claim button and a claim log. Rules keyed on source, price band, location/zip, property type, lead type. Order of rules matters.
3. Speed-to-lead instrumentation: time to first call, first text, first email per agent and per source, plus an AI ISA that engages inside 5 seconds and books appointments.
4. Behavior-triggered nurture: website search and listing-view events, saved searches, listing alerts, open house sign-ins and anniversaries as triggers; long sequences (Lofty allows 80 steps) that auto-pause when the lead replies.
5. Real estate deal pipeline: Buyers and Sellers pipelines, close date, commission, agent split and team split, deal custom date fields (appraisal, inspection) that spawn automations.
6. IDX website or integration with one, plus CMA builder, listing-to-ads tools, open house capture.
7. Agent accountability: leaderboard, agent activity (calls, texts, appointments set, tasks done), conversion by agent and by lead source, teams within teams, hidden personal leads vs company leads.
8. Compliance: AI identity disclosure setting, DNC and landline skipping, 10DLC registration for A2P texting.

### Retail and food module
1. Identity from the transaction: profiles created automatically from a sale and merged by card, phone or email; visit frequency and lifetime purchases are the primary CRM fields.
2. Catalog, inventory, vendors, purchase orders, COGS, barcode labels, transfer orders, cross-location returns.
3. Loyalty: points per visit, spend or item; VIP tiers with multipliers; phone-number enrollment at checkout; bonus-point promotions; loyalty-attributed sales report.
4. Gift cards with load fees, store-credit refunds and card-on-file.
5. Commerce surfaces: online store or ordering page, pickup and local delivery, QR ordering, kiosk, KDS, table and course management.
6. Marketing automations keyed on purchase events: welcome, birthday, lapsed win-back, abandoned cart, post-sale Google review request; coupons redeemed at the POS with attribution.
7. Staff: roles and permissions tied to the register, shifts, tips, payroll.
8. Money: tiered processing rates as the main upsell, instant transfer fees, business checking and set-aside jars (Toast), cash flow questions answered by an AI assistant.

---

## What they share with other business types

| Shared capability | Real estate evidence | Retail and food evidence |
|---|---|---|
| Unified inbox for SMS and email with a shared business number and team claiming | FUB Team Inbox and Company Number; Lofty texting | Square Messages with dedicated toll-free number, voicemail transcription, call-to-text |
| Contact timeline that logs every call, text, email and note for the whole team | FUB and Lofty contact records | Square Customer Directory with Messages history |
| Segments that refresh automatically | FUB Smart Lists; Lofty campaign segments | Square smart groups (lapsed, subscribers, loyalty) |
| Trigger-based automation with wait, branch and auto-pause on reply | FUB Action Plans and Automations; Lofty Smart Plans | Square Marketing automations; Toast Marketing Agent |
| Appointment booking with reminders and calendar sync | FUB Google and Microsoft calendar sync; Lofty AI books on calendar | Square Appointments, Square Assistant, Toast Tables |
| Invoices, estimates, payment links, deposits | Not native in FUB; Lofty transaction management | Square Invoices, payment links from Messages |
| Review requests and feedback loop | Not native in FUB or Lofty (integrations) | Square automatic Google review request; Square Feedback on receipts |
| Reporting on response time, conversion by source, team leaderboard | FUB speed-to-lead and Lead Source reports | Square AI questions over sales, labor, customers; loyalty vs non-loyalty spend |
| AI assistant that drafts replies, summarizes, suggests next actions and (increasingly) executes scheduled tasks | FUB Smart Messages, Smart Summary, Smart Actions; Lofty Cowork and Sales Agent | Square AI chat over business data with pinned charts; Toast IQ and Marketing Agent |
| Per-seat or per-location pricing with a paid communications add-on | FUB Calling add-on, Lofty text packages | Square Messages Plus, Marketing text overages |
| Mobile app that mirrors core actions | FUB, Lofty, BoldTrail apps | Square POS and Dashboard apps with voice AI |
| Open API, embedded partner apps, MCP server | FUB Inbox Apps and API; Lofty MCP Server and Developer Platform | Square App Marketplace |

---

## Pain points users report (sourced)

Real estate
- FUB: "No native IDX website or landing page builder"; "does not offer complete transaction management natively"; no payments, no social publishing; calling is a paid add-on on Grow; setup with a large database takes time and tag sprawl makes the system harder to use; mobile app users report trouble with desktop-level tasks; support is 8am to 8pm ET, not 24/7. Source: https://theclose.com/follow-up-boss-review/ (OBSERVED).
- FUB: shorter action plan delays (minutes or hours) and automatic reassignment of leads that were not followed up are open feature requests, meaning teams build these with Zapier or third-party tools. Source: FUB help center snippet via https://help.followupboss.com/hc/en-us/articles/4402126820119 and https://followupace.com/learn/follow-up-boss-automation/ (OBSERVED as snippet).
- FUB AI: Smart Summary was reported "temporarily turned off for all users" during closed beta, and Smart Actions only supports Zillow buyer stages and requires FUB Calling with recording plus the Zillow integration. Sources: https://help.followupboss.com/hc/en-us/articles/30282773055127-Smart-Summary and https://help.followupboss.com/hc/en-us/articles/37957434220055-Smart-Actions (snippets) (OBSERVED).
- Zillow dependency: direct calls to a Zillow number and broadcast-routed leads do not sync into FUB; Zillow Concierge contacts leads before the agent. Source: https://www.followupboss.com/blog/adjusting-zillow-changes (OBSERVED).
- Lofty: no public pricing (all tiers "Request Pricing"), setup fees reported at $299 to $1,499 and entry pricing around $449 per month secondhand; "SmartPlans and AI automation need hours to configure"; G2 reviewers rate FUB higher on ease of use, onboarding and support and say Lofty setup is harder. Sources: https://www.lofty.com/pricing ; https://getdex.com/blog/dex-vs-lofty/ ; https://www.kdsdevelopment.net/articles/lofty-review-2026-ai-powered-agent-crm (search snippet) ; https://www.g2.com/compare/follow-up-boss-vs-lofty-lofty (search snippet) (OBSERVED as snippets; G2 page itself not fetched).
- Lofty AI Sales Agent: included quota is only 10 leads per month; it will not text leads with DNC, landline, wrong or missing numbers. Source: https://help.lofty.com/hc/en-us/articles/39659584983067-Getting-Started-with-AI-Sales-Agent (snippet) (OBSERVED).
- BoldTrail/kvCORE: a March 2026 Capterra review warns that if automation, lead routing, website content and CRM workflows are not configured correctly "it can feel underwhelming". Source: https://www.capterra.com/p/176447/kvCORE/reviews/ (search snippet; page refused fetch) (OBSERVED as snippet).
- Texting cost pressure: 10DLC carrier fees rose in 2026 (T-Mobile $0.0030 to $0.0045 per SMS; Verizon $0.0040 to $0.0050 per segment); whether FUB or Lofty pass these through is not confirmed. Source: https://www.telgorithm.com/news/2026-10dlc-carrier-fee-increases-annual-recap (OBSERVED).
- Reddit r/realtors could not be fetched (blocked); no Reddit-sourced pain points are included.

Retail and food
- Square: the 2025 repricing moved exchanges, staff permissions, label printing, unit cost and ongoing phone support out of the Free plan (Free support limited to 90 days) and raised Free-plan processing to 2.6% + 15c in person and 3.3% + 30c online. Sources: https://www.merchantmaverick.com/reviews/square-retail-review/ ; https://fitsmallbusiness.com/square-fees-pricing-guide/ ; https://beancount.io/de/blog/2026/09/02/square-free-plan-card-rate-increase-annual-cost-small-business-guide (search snippet) (OBSERVED).
- Square: "Account stability issues": funds held or accounts terminated suddenly, "uncommon but not rare", with customer service unable to help once an account is terminated; "Limited features" and a dated interface hard to read in bright light on iPad; inventory poorly suited to businesses that sell both services and goods. Source: https://www.merchantmaverick.com/reviews/square-retail-review/ (OBSERVED).
- Square Messages: free tier is reply-only; starting a conversation or texting a new customer requires Plus, Premium or the $10 per location Messages Plus, and the business number needs toll-free verification that can fail. Source: https://squareup.com/help/us/en/article/7985-get-started-with-square-messages-plus (OBSERVED).
- Square Marketing: no email or text marketing at all on the Free plan; text volume capped at 500 or 2,500 per month with per-text overages. Source: https://squareup.com/us/en/software/marketing (OBSERVED).
- Toast: contracts up to three years that auto-renew, early termination equal to remaining software fees, fees that can rise mid-contract with 30 days notice, "hit or miss" support after a strong sales process, pushy hardware financing, and at least one report of incomplete tickets reaching the kitchen. Source: https://www.merchantmaverick.com/reviews/toast-pos-review/ (OBSERVED).
- Toast: most add-on prices (Payroll, Marketing, Loyalty, KDS, Inventory) are not published. Source: same (OBSERVED).
- Reddit r/smallbusiness and r/restaurateur could not be fetched (blocked); Capterra Square reviews refused fetch.

---

## What this tells us a template must have

1. A routing engine with the five modes every real estate vendor ships (direct, round robin, first to claim, one-at-a-time with timeout, shared pond with claim button and claim log), driven by ordered rules on source, price band, location and type, with a catch-all rule that never leaves a lead unassigned. The same engine serves inbound calls and chats for a shop or restaurant.
2. Speed-to-lead as a first-class metric: time to first call, text and email per agent and per source, visible on a leaderboard and feeding an alert when a threshold is missed. FUB and Lofty both sell on this.
3. An AI first responder that engages inside seconds on web chat, text and email, qualifies with a configurable question set, books on the assigned person's calendar, hands off with a brief, and respects DNC, landline, AI-disclosure and quiet-hour settings. Lofty prices this per lead worked (10 free, then $60 per 200), which is a usable pricing model.
4. Sequences with wait-until-event and branch steps, automatic pause on any reply, one-fire-per-behavior semantics, and delays measured in minutes as well as days (FUB users are still asking for this).
5. Dynamic lists (smart lists, smart groups) that refresh in real time and can be worked top to bottom with click to call; lapsed, new, subscribed and loyalty states as built-in filters for retail.
6. A shared inbox over SMS and email with a verified business number per location, ring groups with press-to-accept and configurable ring time, voicemail transcription, missed-call-to-text, and per-contact history visible to the whole team. Free tier reply-only is a pattern users resent; include outbound from day one.
7. Customer identity built from transactions, not forms: automatic profile creation from a sale, merge by card, phone or email, visit frequency and lifetime spend on the profile, and the same profile reused for marketing, loyalty and messaging.
8. Loyalty with points per visit, spend or item, VIP tiers with multipliers, phone-number enrollment at checkout, bonus promotions, wallet passes and a loyalty vs non-loyalty spend report.
9. Purchase-event marketing automations: welcome, birthday, win-back after N days, abandoned cart, post-sale review request, with coupon redemption tracked back to the campaign and location.
10. Invoices, estimates with multiple packages, deposits, milestone schedules, contracts with e-signature, recurring billing and payment links sendable from the inbox. Square puts milestones and multi-package estimates behind a paid tier, a template should not.
11. A pipeline object with per-stage totals, close date, commission and split fields, custom date fields that can trigger automations, and conversion by owner and by source. Real estate names it deals; retail does not need it on by default.
12. Calendar sync both ways with Google and Microsoft, self-booking pages, reminders, no-show fees and deposits, waitlists, and an AI that confirms and reschedules by text (Square Assistant pattern).
13. Vertical commerce surfaces as optional modules: catalog and inventory with vendors and purchase orders, online store or ordering page with pickup and delivery, gift cards with load fee and store-credit refunds, KDS and table management. These belong only to the retail and food module.
14. An AI business analyst over the tenant's own data that answers plain-language questions about sales, labor, customers and response times, exports CSV, renders charts, pins them to the dashboard, remembers context and works by voice on mobile, with how-to answers from the product's own help content (Square AI pattern), and that can run scheduled tasks and surface "what needs you now" (Lofty Cowork pattern).
15. AI drafting inside the composer (suggested replies with a custom-prompt option), summaries on the contact timeline, and suggested next tasks and stage changes that require approval, with recording and transcription of calls made through platform numbers as the data source.
16. Portal and lead-source connectors with attribution preserved, including email parsing for sources without an API, a website pixel, and open-house and form capture; an open API, embedded partner apps and an MCP server so external agents can act on tenant data.
17. Transparent, published pricing with no long contracts and no early termination fees, since Toast's contracts and Lofty's quote-only pricing are the most repeated complaints; communications usage (texts, minutes) metered openly with 10DLC registration handled for the tenant.
18. Role-based permissions, teams within teams, hidden personal records vs company records, and per-location scoping, since both families run multi-agent or multi-location operations.
19. Reporting that ties money to actions: conversion and commission by agent and source for real estate; attributed sales by campaign, loyalty and location for retail; both exported to spreadsheet.
20. Reliability and account stability as a feature: clear fund-hold and dispute workflows and support that does not end at 90 days, since account holds and terminated accounts are the sharpest Square complaint.

---

## Unconfirmed items (for follow-up)
- FUB: exact First to Claim and Lead Pond timeout mechanics; Grow-plan texting limits; whether 10DLC fees are passed through; current status of Smart Summary (closed beta, reported off); native self-booking page.
- Lofty: tier-by-tier feature mapping (pricing grid uses unlabeled checkmarks); actual prices; Reporting Page metrics; listing alert details; Power Dialer capabilities; contract length and cancellation terms.
- BoldTrail: routing rule details (help article 404).
- Square: US price of Invoices Plus; Loyalty official pricing (page 404); QR ordering tier; Team Plus pricing and Shifts detail; Instagram or Facebook messaging (no evidence it exists); the April 2026 "AI agent that automates daily tasks" (single secondary source).
- Toast: $499 per month for IQ Grow and the 8% pilot lift (press-release figures via secondary sources); product pages refused fetch.
- Reddit pain points for both families: not collected (blocked).
