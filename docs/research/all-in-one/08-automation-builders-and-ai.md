# 08. Automation builders and AI in small-business platforms (late 2026)

Research date: 2026-11-06. Purpose: catalog how all-in-one small-business platforms and general-purpose automation tools model automation, so we can design an "Automations" layer that offers everything users expect by name while running on an AI agent runtime underneath.

Products covered: HighLevel (GoHighLevel) Workflows, HubSpot Workflows, Keap Easy and Advanced Automations, ActiveCampaign Automations, Zoho CRM Workflow Rules, Zoho Flow, Jobber, Housecall Pro, TaxDome, Zapier, Make, n8n. AI layers: HighLevel Workflow AI / Conversation AI / Voice AI, HubSpot Breeze agents, Zoho Zia, Keap AI, Podium AI Employee, Jobber AI (Copilot / AI Receptionist), n8n AI Agent nodes, plus Zapier Agents, Make AI Agents, ActiveCampaign Active Intelligence and Housecall Pro AI Team where found.

## Confidence legend and method notes

- OBSERVED: read directly on the cited page during this research.
- OBSERVED (snippet): confirmed only through a search engine excerpt of the cited official page (the page itself refused automated fetching).
- INFERRED: from product knowledge or third-party mirrors, not confirmed on an official page during this research. Treat as "verify before relying on it".
- "not confirmed": we looked and could not confirm.

Method caveats that matter for reading this document:
1. The shared web-search budget for this session was exhausted after 16 searches, so most of the work was direct fetching of known official documentation URLs (about 80 fetches).
2. Several help centers block automated fetching: HighLevel's Freshdesk help center (redirects to login), ActiveCampaign's Zendesk (403), Keap's help (now redirects to Thryv's Zendesk), learn.thryv.com (403), TaxDome help and taxdome.com (403), Podium pricing content (loaded without plan figures). For those products, the trigger and action lists below are built from official search snippets, official marketing pages, white-label mirrors, and product knowledge, with the confidence label on each row.
3. Community pain points could not be re-verified by search in this session; they are labeled INFERRED and should be re-checked.

Sources are listed per section. No source is invented; where no URL confirms a claim, it is labeled INFERRED or "not confirmed".

---

# Part 1. Per-product catalog

## 1.1 HighLevel (GoHighLevel) Workflows

### Builder model

| Item | Details | Confidence | Source |
|---|---|---|---|
| Canvas | Vertical tree canvas: one trigger block (multiple triggers allowed, OR'd) feeding a linear action list that branches at If/Else, Split and Goal steps. | INFERRED (consistent with the action list, which contains If/Else, Split, Goal, Go To) | https://help.gohighlevel.com/support/solutions/articles/155000002294 |
| Draft vs published | Workflows have a Draft / Publish toggle; a saved draft does not run. | INFERRED | product knowledge |
| Versions | Workflow version history exists in newer builder (restore previous versions). | INFERRED, not confirmed this session | product knowledge |
| Testing | "Test workflow" against a chosen contact; execution log then shows the run. | INFERRED | product knowledge |
| Templates | "Recipes" library of prebuilt workflows (appointment confirmation and reminders, birthday, missed-call text back, no-show, FAQ auto reply, lead nurture, review request, webinar, etc.). The official pricing page lists "Workflow Builder" and "Campaign Builder" as included in Starter ($97/mo). | OBSERVED (pricing) / INFERRED (recipe names) | https://www.gohighlevel.com/pricing |
| AI build | "Workflow AI Assistant" builds a workflow from a text prompt inside the builder; "Agent Studio" is marketed as a drag-and-drop builder for multi-step AI automations with custom agents and decision logic. | OBSERVED (marketing) | https://www.gohighlevel.com/ai |
| Workflow settings | Allow re-entry (re-enrollment), Stop on response (exit when contact replies), Time window (only send between hours / days), Sender settings, Auto mark as read, Conversation status on completion. | INFERRED | product knowledge |

### Triggers (as complete as could be confirmed)

The official article "A List of Workflow Triggers" (help.gohighlevel.com, last modified 2026-06-19) was readable only through search excerpts. A partner mirror states "more than 80 triggers organized into 14 categories" and names 8 categories. Rows marked OBSERVED (snippet) came from the official article's excerpt; rows marked INFERRED are known triggers that the excerpt did not show.

| Category | Trigger | Confidence |
|---|---|---|
| Contact | Birthday Reminder | OBSERVED (snippet) |
| Contact | Contact Changed | OBSERVED (snippet) |
| Contact | Contact Created | OBSERVED (snippet) |
| Contact | Contact DND | OBSERVED (snippet) |
| Contact | Contact Tag (added / removed) | OBSERVED (snippet) |
| Contact | Custom Date Reminder | OBSERVED (snippet) |
| Contact | Note Added | OBSERVED (snippet) |
| Contact | Note Changed | OBSERVED (snippet) |
| Contact | Task Added | OBSERVED (snippet) |
| Contact | Task Reminder | OBSERVED (snippet) |
| Contact | Task Completed | OBSERVED (snippet) |
| Contact | Contact Engagement Score | OBSERVED (snippet) |
| Events | Form Submitted | OBSERVED (snippet) |
| Events | Survey Submitted | OBSERVED (snippet) |
| Events | Quiz Submitted | OBSERVED (snippet) |
| Events | Trigger Link Clicked | OBSERVED (snippet) |
| Events | Email Events (opened, clicked, bounced, unsubscribed, complained, delivered) | OBSERVED (snippet) |
| Events | Customer Replied (SMS, email, FB, IG, WhatsApp, live chat, GMB) | OBSERVED (snippet) |
| Events | Facebook Lead Form Submitted | OBSERVED (snippet) |
| Events | TikTok Form Submitted | OBSERVED (snippet) |
| Events | LinkedIn Lead Form Submitted | OBSERVED (snippet) |
| Events | Video Tracking | OBSERVED (snippet) |
| Events | Number Validation | OBSERVED (snippet) |
| Events | Messaging Error (SMS) | OBSERVED (snippet) |
| Events | Funnel / Website PageView | OBSERVED (snippet) |
| Events | New Review Received | OBSERVED (snippet) |
| Events | Inbound Webhook (unique URL per workflow; POST body becomes custom values) | OBSERVED (snippet + partner mirror) |
| Events | Scheduler (recurring, contact-less) | OBSERVED (snippet + partner mirror) |
| Events | Conversation AI Trigger | OBSERVED (snippet) |
| Events | Custom Trigger (marketplace app triggers) | OBSERVED (snippet) |
| Events | Call Status (answered, no answer, busy, voicemail) | INFERRED |
| Appointments | Appointment Status (booked, confirmed, showed, no-show, cancelled, rescheduled) | INFERRED (category confirmed by partner mirror: bookings, reschedules, cancellations, no-shows) |
| Appointments | Customer Booked Appointment | INFERRED |
| Opportunities | Opportunity Created, Opportunity Changed, Pipeline Stage Changed, Opportunity Status Changed (open, won, lost, abandoned), Stale Opportunities | INFERRED (category confirmed: pipeline movement, status changes, stale deals) |
| Payments | Invoice (sent, paid, partially paid, overdue, void), Order Submitted / Order Form Submission, Payment Received, Subscription (created, charged, cancelled, failed), Refund, Estimate / Proposal events, Document Signed | INFERRED (category confirmed: invoices, subscriptions, refunds, order submissions) |
| Courses / Memberships | Offer Access Granted / Removed, Product Access Granted / Removed, Lesson Started / Completed, Category Completed, Product Completed, New Signup, User Login | INFERRED (category confirmed: learner progress, lesson completion, offer access) |
| Affiliate | Affiliate Created, New Affiliate Sale, Affiliate Added to Campaign | INFERRED (category confirmed) |
| Social | Facebook Comment, Instagram Comment, TikTok Comment on posts | INFERRED (category confirmed) |
| Shopify / eCommerce | Abandoned Checkout, Order Placed, Order Fulfilled | INFERRED |
| Communities | Group member joined / left | INFERRED |
| Voice AI | Voice AI call completed | INFERRED |
| Ads | Ads lead captured | INFERRED |

Trigger filters: forms, tags, pipelines, calendars, campaigns, specific emails, and generic "filter by resource". OBSERVED (partner mirror).

Sources: https://help.gohighlevel.com/support/solutions/articles/155000002292-a-list-of-workflow-triggers (snippet only); https://partner-program-43p.pages.dev/ghl-features/triggers (partner mirror, OBSERVED).

### Actions (complete, OBSERVED)

Official article "What Are Workflow Actions? (Complete List)", last modified 2026-06-03, 69 actions in 14 categories. Source: https://help.gohighlevel.com/support/solutions/articles/155000002294

Contact: Create Contact; Find Contact; Update Contact Field; Add Contact Tag; Remove Contact Tag; Assign to User; Remove Assigned User; Edit Conversation (mark read, archive, unarchive); Disable/Enable DND; Add Note; Add Task; Copy Contact (to another sub-account); Delete Contact; Modify Contact Engagement Score; Add/Remove Contact Followers.

Communication: Send Email; Send SMS; Send Slack Message; Call (ring a user and connect to the contact); Messenger; Instagram DM; Manual Action (queue a manual call or SMS for a user); GMB Messaging; Send Internal Notification (email, SMS, or in-app to users); Send Review Request; Conversation AI (hand the conversation to the bot); Facebook Interactive Messenger (reply to post comments); Instagram Interactive Messenger; Reply in Comments; WhatsApp; Send Live Chat Message.

Send Data: Webhook / Custom Webhook (configurable method, headers, auth, JSON body); Google Sheets (create, update, lookup rows).

Internal Tools: If/Else; Wait Step (for a duration, until a date/time, until an event such as a reply, or until a time window); Goal Event (skip ahead when the contact meets the goal); Split (A/B random split); Update Custom Value; Go To (jump to another step; also used to link workflows); Remove from Workflow; Arrays (find, filter, transform, calculate over list data); Drip Mode (release contacts in batches); Text Formatter; Custom Code (JavaScript or Python, returns values for later steps).

Workflow AI: AI Prompt (GPT-powered; generates text or a decision and stores the result in a variable). Partner mirror also lists "Hand to AI".

Eliza: Eliza AI Appointment Booking; Send to Eliza Agent Platform.

Appointments: Update Appointment Status (confirmed, showed, no-show, cancelled, etc.); Generate One Time Booking Link.

Opportunities: Create/Update Opportunity (including pipeline stage move); Remove Opportunity.

Payments: Stripe One-Time Charge; Send Invoice; Send Documents and Contracts.

Marketing: Add to Google Analytics; Add to Google AdWords; Add to Custom Audience (Facebook); Remove from Custom Audience; Facebook Conversion API.

Affiliate: Add to Affiliate Manager; Update Affiliate; Add/Remove from Affiliate Campaign.

Courses: Course Grant Offer; Course Revoke Offer.

IVR: Gather Input on Call; Play Message; Connect to Call; End Call; Record Voicemail.

Communities: Grant Group Access; Revoke Group Access.

Not in the official list but known from product knowledge (INFERRED): Voice AI action (place an outbound AI call), AI Agent / Agent Studio step, Number Lookup (number validation, premium), Translate (premium), Array functions and Math operation (premium "Premium Actions"), Google Sheets is premium, Custom Webhook is premium, Date/Time Formatter.

### Control flow, data, communication, CRM, external

| Primitive | HighLevel implementation | Confidence |
|---|---|---|
| If/Else | Multi-branch with AND/OR conditions on contact fields, tags, trigger data, custom values, appointment and opportunity fields. | OBSERVED (action exists), details INFERRED |
| Wait / Delay | Wait for duration; wait until date/time; wait until contact reply or event; wait until time window; wait for condition on contact. | OBSERVED (action), modes INFERRED |
| Goal | Goal Event action: when contact meets the goal anywhere in the workflow they jump to the goal step. | OBSERVED |
| Loops | No loop primitive; Arrays action and Go To approximate iteration. | OBSERVED (no loop action in list) |
| Parallel paths | Not true parallelism; Split action creates A/B random branches. | OBSERVED |
| Go To | Go To step; "Go to another workflow" via Add to Workflow action (INFERRED name). | OBSERVED (Go To) |
| Merge fields / custom values | {{contact.first_name}} style merge tags, {{custom_values.x}}, trigger data {{inboundWebhookRequest.x}}, workflow variables from AI Prompt and Custom Code. Update Custom Value action. Text Formatter, Arrays, Custom Code for math and formatting. | OBSERVED (actions) + INFERRED (syntax) |
| Communication | SMS, Email, WhatsApp, Messenger, Instagram DM, GMB, Live Chat, Call (ring user), Voicemail drop (INFERRED: "Voicemail" action exists in older lists, not in the 2026 list fetched), Internal notification (email, SMS, in-app), Slack, Review request, Manual action queue. | OBSERVED |
| CRM | Tags, fields, assign user, DND, notes, tasks, engagement score, followers, opportunities (create, update, stage move, remove), appointment status, invoices, documents, Stripe charge, course access. | OBSERVED |
| External | Webhook, Custom Webhook, Google Sheets, Custom Code, Inbound Webhook trigger, Marketplace Custom Triggers and actions, Facebook CAPI, Google Ads / Analytics. Zapier via LeadConnector app. | OBSERVED (actions) / INFERRED (Zapier app name) |

### Observability, limits, pricing

| Item | Details | Confidence | Source |
|---|---|---|---|
| Execution logs | Per-workflow "Execution Logs" tab listing each contact run with step-by-step status; filter by status and date. | INFERRED | product knowledge |
| Enrollment history | Per-contact view of active and completed workflows; manual add/remove. | INFERRED | product knowledge |
| Error handling / retries | No user-configurable retry; failed steps appear in execution log with error reason; Messaging Error trigger lets you build fallback workflows for SMS failures. | OBSERVED (Messaging Error trigger) / INFERRED (no retry config) | trigger list |
| Re-enrollment | "Allow re-entry" setting per workflow; "Stop on response" exits the contact on reply. | INFERRED | product knowledge |
| Premium actions | Marked as "Premium Actions" and billed per execution (Google Sheets, Custom Webhook, Slack, Number Validation, Translate, Array functions, Date formatter, AI steps). Commonly cited at about $0.01 per execution with rebilling markup for agencies. | INFERRED, exact price not confirmed | https://www.gohighlevel.com/pricing (states usage based pricing exists and is rebillable; no rate shown) |
| Plans | Starter $97/mo, Unlimited $297/mo, Founder $497/mo (SaaS mode, reselling). Unlimited adds pass-through (rebilling) of usage. AI Employee: Growth $50/mo per sub-account, Unlimited $97/mo per sub-account. | OBSERVED | https://www.gohighlevel.com/pricing |
| Pain points | Commonly reported: silent step failures only visible in logs, Wait steps drifting when time windows apply, re-entry confusion, premium action charges surprising sub-accounts, Conversation AI replying when a human already replied, trigger filters not matching on custom fields. | INFERRED (community sentiment, not re-verified this session) | |

## 1.2 HubSpot Workflows

### Builder model

| Item | Details | Confidence | Source |
|---|---|---|---|
| Canvas | Vertical flowchart canvas: enrollment trigger card at top, actions below, if/then branches fan out, "Go to action" links allowed only inside branches to prevent loops. | OBSERVED | https://knowledge.hubspot.com/workflows/choose-your-workflow-actions |
| Object-based | Workflow type chosen per object: contact, company, deal, ticket, quote, conversation, feedback submission, custom object, lead, and so on. | OBSERVED | enrollment triggers article |
| Draft vs on | Workflow is Off until turned On; edits save as a new version; test checks "the workflow's current version only". | OBSERVED | https://knowledge.hubspot.com/workflows/test-your-workflow |
| Versions | Version history exists ("the workflow's version history ... may also explain the result"). | OBSERVED | test-your-workflow article |
| Testing | Test button: pick a record, Automatic (simulate triggers) or Manual enrollment; simulated path highlighted green; predicted outcome and timestamps per action; branch override; "Send preview" sends emails to your own address. No real actions executed. | OBSERVED | https://knowledge.hubspot.com/workflows/test-your-workflow |
| Templates | Workflow templates library plus "Generate a trigger with AI" option when choosing a trigger. | OBSERVED (AI trigger option) / INFERRED (template library) | enrollment triggers article |
| Placeholders | Create task and Send email actions can be saved without details as placeholders. | OBSERVED | choose-your-workflow-actions |

### Enrollment triggers (OBSERVED)

Source: https://knowledge.hubspot.com/workflows/set-your-workflow-enrollment-triggers

1. When an event occurs (form submission, page view, email open/click, meeting booked, call logged, ad interaction, custom behavioral events, integrator events, "Record meets a set of filter conditions" event). Enroll once or every time the event occurs.
2. When filter criteria is met (property values on the record and associated records, list membership, activity; up to 250 filters; "has not" conditions supported).
3. When a webhook is received (Data Hub Professional and Enterprise).
4. Based on a schedule (calendar date, or a date property such as renewal date, with additional filter criteria).
5. Manual (from a record, a list, another workflow's enrollment action, or a chatflow).

Re-enrollment: off by default; filter-based workflows need explicit re-enrollment criteria; event-based can be "every time". Only one "refine by" criterion per event trigger (for example, page view refined by date or by count, not both).

### Actions (OBSERVED, by group)

Source: https://knowledge.hubspot.com/workflows/choose-your-workflow-actions

Delays: Set amount of time; Until a day of the week; Until a time of day; Until a calendar date; Until a date property; Until an event occurs (page visit, form submit, property change, and so on).

Branches: If/then based on one property or action output (up to 250 branches, no AND/OR); If/then based on AND/OR filter logic; Random distribution by percentage (Marketing Hub Pro/Ent).

Navigation: Go to workflow (enrolls in another workflow of the same type, bypassing its triggers); Go to action (within branches only).

Communication: Send Email (marketing email, Marketing/Service Pro+); Send SMS (Marketing SMS add-on); Send WhatsApp message (Pro+); Send in-app notification; Send internal email notification; Send internal marketing email; Send survey (beta); Enroll in sequence / Unenroll from sequence (Sales/Service Enterprise); Assign conversation owner.

CRM: Edit record (set, copy, clear property on record or associated record); Create record (contact, company, deal, ticket, lead, custom object); Copy ticket; Add line item to deal; Create task; Create note; Create Salesforce task / Set Salesforce campaign; Delete contact (restorable 90 days); Increase or decrease property value; Manage communication subscriptions; Rotate record to owner (round robin, Sales/Service Pro+); Rotate record by skill; Rotate conversation owners; Create associations; Apply / Update / Remove association labels; Track / Stop tracking intent signals; Enrich record; Validate and format phone number; Convert to invoice; Create quote; Create renewal quote from contract (Revenue Hub); Edit/create record in another account; Create deal in another account.

AI (HubSpot Credits): Assign to Customer Agent; Data Agent custom prompt; Data Agent research; Data Agent fill smart property; Summarize record; Infer company value proposition and ICP; Enroll / Unenroll in prospecting agent; Use a custom LLM; Run Agent (custom agents from Agent Builder); Generate prospect profile.

Marketing: Add to / Remove from ads audience; Add to / Remove from campaign; Add to / Remove from static segment; Set marketing contact status; Add participant to marketing event.

Data ops (Data Hub Pro/Ent): Custom code (JavaScript or Python); Format data (text, number, date, math; must pair with Edit record to save); Send a webhook (with response parsing into later actions).

Connected apps: Slack notification, Create Slack channel, Google Chat, Asana task, Trello card, Zoom webinar registration, NetSuite sales order, Docusign template, Salesforce task and campaign.

### Observability, settings, limits

| Item | Details | Confidence | Source |
|---|---|---|---|
| Timing settings | Run actions only at specific days/hours (actions outside the window are rescheduled into a 15-minute spread), pause dates (yearly repeat), auto-turn-off at a date; default time zone EST if unset. | OBSERVED | https://knowledge.hubspot.com/workflows/manage-your-workflow-settings |
| Unenrollment and suppression | Unenrollment triggers and suppression lists in Settings; "Connections" setting removes contact from other workflows at enrollment. | OBSERVED | same |
| Performance notifications (Enterprise) | Needs-review alerts; enrollment rate anomaly alerts (Breeze Intelligence or manual thresholds); branch and endpoint conversion comparison. | OBSERVED | same |
| Enrollment history and action logs | Per-workflow History tab with enrollment events and per-action logs with statuses (completed, error, skipped), filterable by record and status; "Needs review" workflow status when actions fail repeatedly. | INFERRED (article URL not reachable this session), consistent with "Needs review" status in settings article | |
| Retries | HubSpot retries transient failures internally (webhooks retried for a period); no user-configurable retry count. | INFERRED | |
| Goals | Workflow goals (contact-based) end enrollment when met and report conversion. | INFERRED | |
| Limits | 250 filters per trigger; 250 branches per single-property branch; 100 steps not a HubSpot limit (that is Zapier). Workflow counts per tier are in the product catalog (not extracted this session). | OBSERVED (250s) / not confirmed (counts) | |
| AI action pricing | One AI action in a workflow = 10 HubSpot Credits. | OBSERVED | https://legal.hubspot.com/hubspot-product-and-services-catalog |

## 1.3 Keap: Easy Automations and Advanced Automations

### Builder model

| Item | Details | Confidence | Source |
|---|---|---|---|
| Easy Automations | List-style "When ... Then ..." builder: one trigger, one or more sequential actions with optional delay timers and a stop condition. Uses only the simple email builder. Supports tag-based integrations. Available on Pro, Max, Ultimate (Lite gets only Easy). | OBSERVED (blog + snippets) | https://keap.com/business-success-blog/marketing/automation/introducing-easy-automations ; help.keap.com/help/easy-automations (snippet) |
| Advanced Automations | Formerly "Campaigns" (Campaign Builder). Horizontal canvas of Goals (triggers and stop points) connected to Sequences (time-released steps). Decision diamonds appear automatically when a goal or sequence connects to two or more sequences and route contacts by rules; a "Catch-All" empty sequence is a recommended pattern. Decision diamond logic has a built-in tester. | OBSERVED (snippets of help.keap.com/help/decision-diamonds and advanced-automation-builder-terminology) | search results |
| Draft vs published | Both types have Published and Draft (unpublished) states; My Automations lists both with filters by status and custom category; quick actions include edit, reporting, details, add contacts. | OBSERVED | https://keap.com/product-updates/automation-builder-updates-youve-been-asking-for |
| Templates | 12 prebuilt templates grouped into marketing, sales, services, operations; pricing page lists a library organized by Marketing, Sales, Service, Operations (lead magnet offer, cart abandonment, billing automation, pipeline automation, task management). | OBSERVED | same + https://keap.com/pricing |
| AI build | "AI Automation Assistant" uses templates and AI to build a campaign; "AI Content Assistant" composes emails. | OBSERVED (named on pricing page) | https://keap.com/pricing |

### Triggers

Easy Automations "When" (OBSERVED examples): public form submitted; invoice submitted; any product purchased; landing page form submitted; appointment booked (INFERRED); tag applied (INFERRED); new lead or contact added (INFERRED); deal moved to stage (INFERRED); quote accepted (INFERRED); invoice paid (INFERRED).

Advanced Automations goals (INFERRED from product knowledge of Campaign Builder): web form submitted; landing page form; internal form submitted; tag applied; product purchased; appointment scheduled (Appointments); link clicked; email opened (older); note applied; API goal (integration); lead score achieved; quote accepted; order form submitted; shopping cart purchased; invoice paid; deal stage moved (Pipeline); task completed; WordPress opt-in; webinar registration (integrations).

### Actions

Easy Automations "Then" (OBSERVED): send email; send text (SMS, US only); send invoice reminder emails with "stop if paid"; send review request; apply tag; send notification; create deal; add delay timer; "and more".

Advanced Automations sequence steps (INFERRED from product knowledge): Email; Text message (Keap Text); Voice broadcast (legacy); Fax (legacy); Letter / fulfillment list; Task; Appointment; Apply tag / Remove tag; Apply note; Create opportunity / Move deal; Assign owner; Update contact field (Set field value); HTTP Post (webhook); Start / Stop other campaign sequence; Send internal notification; Timers: Delay timer, Date timer, Field timer (relative to a contact date field), Action set.

### Control flow, data, observability, pricing

| Item | Details | Confidence | Source |
|---|---|---|---|
| Branching | Decision diamonds (rule-based, multiple sequences); no if/else inside a sequence. | OBSERVED (snippets) | |
| Wait | Delay timers, date timers, field timers in sequences; Easy Automations have delay timers and "stop if paid". | OBSERVED (Easy) / INFERRED (Advanced timer types) | |
| Goals | The whole model is goal-driven: a contact reaching a goal exits the preceding sequence and enters the next. | OBSERVED (snippet: "your when and stop are goals") | |
| Loops / parallel | Sequences can connect in parallel from one goal; no loop primitive. | INFERRED | |
| Merge fields | ~Contact.FirstName~ style merge fields; custom fields; no math action. | INFERRED | |
| Observability | Reporting per published automation; Campaign reporting shows contacts per goal and sequence; contact record shows active sequences. | OBSERVED ("view reporting" quick action) / INFERRED (details) | |
| Pricing | Single platform plan "starting at $320/mo" (or $3,195/yr), 2 users included, extra users $39/mo; text tiers from 500 included messages up to 25,000 for $279/mo; overage $0.015 per message, $0.01 per minute. | OBSERVED | https://keap.com/pricing |
| Pain points | Advanced builder learning curve; Easy Automations too limited for multi-branch flows; help center migration to Thryv broke many old links (observed: help.keap.com redirects to thryv.zendesk.com). | OBSERVED (redirect) / INFERRED (sentiment) | |

## 1.4 ActiveCampaign Automations

### Builder model

| Item | Details | Confidence | Source |
|---|---|---|---|
| Canvas | Vertical flowchart; start triggers at top (multiple allowed), actions below, If/Else creates Yes/No branches, Split creates N paths, Goal steps "act like a magnet", Jump To links steps. Automations Map shows how automations connect (Plus and above). | OBSERVED (help snippets + pricing) | https://help.activecampaign.com/hc/en-us/articles/218251828 (snippet); https://www.activecampaign.com/pricing |
| Active vs inactive | Automation must be set back to "Active" after editing for contacts to enter and proceed. | OBSERVED (snippet) | same |
| Templates | Recipe library (hundreds of recipes: welcome series, abandoned cart, birthday, re-engagement, webinar, deal follow-up); AI-powered automation builder on all plans; AI campaign builder on all plans. | OBSERVED (AI builder on pricing page) / INFERRED (recipe count) | pricing page |
| Testing | No simulated test mode; the norm is to add a test contact and watch the automation report. | INFERRED | |

### Triggers

Confirmed by official snippets: Subscribes to a list; Submits a form; Tag is added; Tag is removed; Event is recorded (event tracking, run once or multiple times). "More than 20 start triggers; multiple triggers per automation." Source: https://help.activecampaign.com/hc/en-us/articles/218788707 (snippet); https://help.activecampaign.com/hc/en-us/articles/224653688 (snippet).

Remaining known triggers (INFERRED): Unsubscribes from a list; Opens/reads an email; Clicks a link in an email; Web page is visited (site tracking); Shares an email; Forwards an email; Replies to an email; Field changes; Date based (relative to a date field, with recurrence); Goal is achieved; Score changes (contact or deal score); Enters a pipeline; Deal stage changes; Deal status changes; Deal field changes; Conversation started (Conversations); Makes a purchase (ecommerce); Abandons cart; Account field changes; Sends an SMS / Receives SMS reply; WhatsApp message received; Webhook (API-triggered via "start automation" endpoint rather than a trigger block).

Each trigger has "Runs once / runs multiple times" and optional segment conditions. OBSERVED (snippet for event tracking) / INFERRED (general).

### Actions (categories from official article; details partially OBSERVED)

Sending options: Send email; Send SMS; Send WhatsApp (INFERRED); Send site message; Notify someone (internal email); Send 1:1 email (INFERRED); Wait (for a period, or until conditions are met, with optional max wait).

Conditions and workflow: If/Else (segment builder, Yes/No); Wait; Goal; Split (random or even split across paths, with a winner option); Jump To / Go to; Start another automation; End this automation; End other automation; Webhook (POST contact data to a URL); Perform math on a custom field ("Math operation", INFERRED name); AI Actions Library (transform a field value into another field using AI); Extract phone numbers or URLs; Jump to a step in another automation (INFERRED).

Contacts: Add/remove tag; Subscribe/unsubscribe to list; Update contact field; Add note; Adjust contact score; Update account field (B2B); Enroll in a sequence (INFERRED naming).

CRM / Deals: Add a deal; Update deal title, value, stage, owner, status, custom field; Add a deal task; Mark task complete; Add note to deal; Adjust deal score; Create / update Salesforce lead (integration).

Ecommerce: Add to / remove from Shopify or WooCommerce customer segments; send product-driven content (conditional content). INFERRED.

Sources: https://help.activecampaign.com/hc/en-us/articles/218251828 (snippet confirms AI Actions Library, Jump To, Webhook, Extract phone/URL, Wait until conditions); ActiveCampaign platform demo transcript (wait, if/else).

### Observability, limits, pricing

| Item | Details | Confidence | Source |
|---|---|---|---|
| Reports | Per-automation report: contacts entered, completed, currently in each step; per-contact automation history on the contact record; "View contacts in this step". | INFERRED | |
| Error handling | Steps that fail (for example, bounced email) do not retry; no error branch. | INFERRED | |
| Re-entry | Trigger "runs multiple times" controls re-entry; contact cannot be in the same automation twice at once by default. | INFERRED | |
| Plan limits | Starter: 5 actions per automation, email-only cross-channel, no sales automation, no automations map. Plus: unlimited actions, sales automation, email-only A/B. Pro: automation split testing, conditional content, predictive sending, automations map. All plans: AI-powered automation builder, AI campaign builder, 500 Active Intelligence credits. | OBSERVED | https://www.activecampaign.com/pricing |
| Pain points | Starter 5-action cap; Wait-until conditions not firing when conditions were met before the step; goal steps pulling contacts unexpectedly; no sandbox test. | INFERRED | |

## 1.5 Zoho CRM Workflow Rules

### Builder model (OBSERVED)

Source: https://help.zoho.com/portal/en/kb/crm/automate-business-processes/workflows/articles/configuring-workflow-rules

- List and form based (no canvas): Basics (module, name) -> one trigger family fixed at creation -> ordered Conditions (up to 10 on Enterprise/Ultimate, 5 on Standard/Professional), each with Instant Actions and Scheduled Actions.
- Rules are evaluated in order; the first matching condition wins per record; a new condition can be added only after at least one action exists on the current one.
- Rules can be locked by admins (clone instead of edit), reordered, cloned, disabled on downgrade.
- Summary view of all rules and their field updates per module; Usage tab (email open rates per rule over 7 days); audit log of every rule edit.

### Triggers (OBSERVED)

- Record action: Create; Create or Edit; Edit (any field, specific fields up to 5 criteria, or any field in selected sections); Delete (only email, webhook, function actions).
- Date/time field: Created Time, Modified Time, Last Activity Time, Unsubscribed Time or any date field; offset in days/weeks/months before or after; execution time; recurrence Once, Every Month, Every Year; 5,000 records per 10-minute window.
- Score: increased, decreased, updated (paid editions).
- Recommendation (Zia): on, before or after the recommendation day.
- Notes: added, modified, deleted, with attribute filters.
- Competitors (Zia Competitor Alert): mention sentiment.
- Module-specific: Events add Cancel; Visits only Create.
- Repeat option: "Repeat this workflow every time a record is edited".

### Actions (OBSERVED)

Instant: Email notifications (5 per set); Tasks (5); Meetings; Calls (Leads and Contacts only); Field updates (5); Tags; Webhooks (1); Custom functions (Deluge, 1); Create record (Leads, Contacts, Accounts, Deals, Cases; Professional+); Zia Agent (name, deployed agent, query with merge fields); Cliq, Slack, Cisco Webex notifications; Convert (leads, quotes, sales orders) on Edit or Field Update rules.

Scheduled (up to 5 per rule, each with 5 emails, 5 tasks, 5 field updates, 5 functions, 5 webhooks): delay in minutes, hours, days or keyed to a custom date/time field; Enterprise can send at the recipient's Zia-suggested best time; scheduled items appear under "Upcoming Actions" on the record; edits reschedule pending actions; records that stop meeting criteria have pending actions deleted.

### Control flow, data, observability, limits (OBSERVED)

- Control flow: conditions act as the branch (first match); scheduled actions are the delay; no loop; loop control: self-retriggering rule runs twice, chains stop after three executions.
- Execution order on platform: assignment rules, review process, scoring, workflow rules, approvals, Blueprint, scoring, CommandCenter. Field updates, tags, convert run sequentially; alerts, tasks, webhooks, functions, create-record run in parallel.
- Data: merge fields in templates and Zia Agent query; Deluge functions for math and lookups; Field Update for writes.
- Limits: emails per day Free/Starter users x 50 (max 5,000), Standard x 100 (5,000), Professional x 200 (10,000), Enterprise x 500 (25,000), Ultimate x 1,000 (50,000); custom functions 20,000/day or 200 per user; webhooks Professional 50,000/day, Enterprise 500,000, Ultimate 1,000,000.
- Observability: Usage tab, audit log, Upcoming Actions on record, Super Admin notified on limit overflow. No per-run execution log comparable to a canvas builder; CommandCenter (journeys) provides visual orchestration with reports (INFERRED).
- Pricing: Free for 3 users includes workflow automation; Professional adds "AI agents"; Enterprise adds custom functions / buttons and "extended AI". Per-edition prices not shown on the fetched page. Source: https://www.zoho.com/crm/pricing/

## 1.6 Zoho Flow

Sources: https://help.zoho.com/portal/en/kb/flow/user-guide/create-a-flow/articles/logic-elements ; https://help.zoho.com/portal/en/kb/flow/user-guide/create-a-flow/actions-logic/articles/flow-control ; https://help.zoho.com/portal/en/kb/flow/user-guide/overview/articles/general-overview ; https://www.zoho.com/flow/pricing/

| Item | Details | Confidence |
|---|---|---|
| Canvas | Vertical canvas; trigger at top; App actions and Logic elements dragged from a left panel; Decision branches fan out; If-else true path to the right, false path below. | OBSERVED |
| States | My Flows: switch on/off, copy, delete; Dashboard counts live, paused, draft flows. | OBSERVED |
| Triggers | App triggers (polling at 15 min on Free/Standard, 5 min on Professional; realtime webhook triggers for supported apps); Schedule; Webhook; filter criteria on the trigger itself. Email, form and RSS triggers: not confirmed. | OBSERVED (polling intervals, filter on trigger) |
| Logic | Set Variable; Decision (multi-branch with AND/OR groups and default path); If-else; Delay For (minutes to weeks, natural-language input) and Delay Until (date/time); Subflow (call a subflow, wait or not, Return data); Custom Functions (Deluge); Send Email notification (under 5,000/day). Loops: not confirmed as a block. | OBSERVED |
| Data | Variables, formulas, Deluge; webhook payload fields must be stored in a variable before use in a Decision. | OBSERVED |
| Observability | History tab per execution with input/output of every task, filter by time; Summary with success rate; history retention 30 / 60 / 90 days by plan. | OBSERVED |
| Pricing | Free 100 tasks/mo and 5 flows; Standard 5k to 5M tasks, unlimited flows; Professional 10k to 5M tasks; overage billing optional. Dollar prices not rendered on the fetched page. | OBSERVED |
| AI | Zia: generate flows from plain English; text summarize and rephrase utilities; "let AI choose and run the best actions based on prompt and context" (agentic action). Plan placement not confirmed. | OBSERVED (feature names) |

## 1.7 Jobber

Sources: https://help.getjobber.com/hc/en-us/articles/24244124296471 ; https://getjobber.com/features/automations/ ; https://getjobber.com/features/ai/ ; https://getjobber.com/pricing/ ; community post https://community.getjobber.com/discussions/operations-forum/best-jobber-automations/208/replies/548

| Item | Details | Confidence |
|---|---|---|
| Builder model | Settings > Automations: a list of built-in toggles plus a "Custom automation builder" that composes trigger -> conditions -> actions (list style, not a canvas). Admin-only. | OBSERVED |
| Built-in automations | Requests: auto-archive unconverted requests after N days. Quotes: two quote follow-ups (up to 90 days after sending), auto-archive, auto-draft quotes from new requests (Jobber AI), high-value quote alerts. Invoices: two past-due follow-ups (up to 90 days after due). Review requests after jobs (Reviews add-on). Appointment reminders and on-my-way texts (client communications, not in the automation list). Automatic payments / saved cards. | OBSERVED |
| Custom builder triggers | New Client, Client Updated, New Quote, Quote Approved, New Job Created, New Invoice (community-reported list; official article not reachable). Likely also Quote sent, Invoice paid, Job completed, Request created (INFERRED). | OBSERVED (community) / INFERRED |
| Custom builder actions | Create Client, Add Tags to Client, Create Request, Create Quote, Create Job (community); send email / text to client, internal notification (INFERRED). | OBSERVED (community) / INFERRED |
| Conditions | Field-based conditions (client tags, quote total, lead source) (INFERRED). | INFERRED |
| Control flow | Single trigger, flat conditions, sequential actions; delays only in the built-in follow-ups (fixed days). No branches, goals or loops. | OBSERVED (structure) |
| Observability | Automation activity visible on the client/quote timeline; no run log UI confirmed. | INFERRED |
| Plans | Core $39/mo (1 user, annual commit) ; Connect $119 to $339/mo by seat band (adds quote and invoice follow-ups); Grow $169 to $429/mo (adds custom automation builder); Plus $439 to $599/mo (includes AI Receptionist and Marketing Suite). Add-ons elsewhere: AI Receptionist $29/mo, Marketing Suite $99/mo; extra users $29/mo. | OBSERVED |

## 1.8 Housecall Pro

Sources: https://help.housecallpro.com/en/articles/13755667-campaigns-send-automated-campaigns ; https://www.housecallpro.com/features/pipeline/ ; https://www.housecallpro.com/features/ai-team/ ; https://www.housecallpro.com/pricing/

| Item | Details | Confidence |
|---|---|---|
| Automated Campaigns (Marketing Center) | Wizard: 1) Audience list (tags, location, lead source, lifetime value, created date, last service date, customer type); fixed exclusions (unsubscribed, do-not-service, invalid contact, last serviced over 3 years ago). 2) Flow: template or custom; trigger is a Job or Estimate event (example: Job Completed) with filters. 3) Early exit rules: new job scheduled, new estimate scheduled, estimate won or lost. 4) Steps: email, text, time delay; each delay counts from the previous step. 5) Preview and launch. Postcards supported; AI-written content. Campaigns is an add-on (price not shown). | OBSERVED |
| Pipeline | Lead and job board with stages; automated follow-up texts and emails per stage for leads, estimates and jobs; online booking leads land in real time; Pipeline AI drafts follow-up messages. Add-on (price not shown). | OBSERVED |
| Core automations | Appointment reminders, on-my-way texts, review requests ("Review management" in all plans), invoice reminders, estimate follow-ups (INFERRED for the last two as built-in toggles). | OBSERVED (reviews) / INFERRED |
| Control flow | Linear sequence with delays and exit rules; no branching; no run log confirmed. | OBSERVED |
| Plans | Basic $59/mo annual ($79 monthly, 1 user); Essentials $149 ($189, 5 users); Max $299 ($329, 8 users, +$35 per extra user). Pipeline, Campaigns, and CSR AI call answering are separately priced add-ons. | OBSERVED |

## 1.9 TaxDome

Sources (snippets; pages blocked automated fetching): https://help.taxdome.com/article/108-using-automations ; https://help.taxdome.com/article/282-jump-in-your-first-pipeline-with-automations ; https://help.taxdome.com/article/1693-zapier-integration-basic-triggers

| Item | Details | Confidence |
|---|---|---|
| Model | Pipelines (kanban of stages) hold Jobs. Automations are attached to stages and fire when a job enters the stage. "Add as many automations for each stage as needed." Conditional automations are marked in the stage detail; hovering shows the tag that gates them. | OBSERVED (snippet) |
| Automove | Jobs auto-advance to the next stage when the stage's requirements are met (for example, the client signs, pays, uploads, or a task is completed). | OBSERVED (snippet) |
| Automation types | Send email; Send message (secure chat) ; Create task; Send organizer (questionnaire); Send proposal / engagement letter; Send contract for e-signature; Create invoice (and recurring invoice); Request documents / folder templates; Apply or remove account tag; Update account field (custom fields); Add to another pipeline; Create recurring job schedule; Send SMS (where available). | INFERRED (consistent with product; the snippet only confirms "documents sent automatically" and tag-gated conditions) |
| Templates | Email, message, organizer, proposal, task, invoice templates are referenced from automations; pipeline templates in the marketplace; duplicating a pipeline copies stages and automations. | OBSERVED (snippet for duplication) / INFERRED (template types) |
| Observability | Clients cannot see pipelines or automations; firm sees automations in the Automations sidebar per stage; job timeline shows fired automations (INFERRED). | OBSERVED (client invisibility) / INFERRED |
| External | Zapier triggers: account or contact created, updated, deleted (Basic). | OBSERVED (snippet) |
| Control flow | Stage-gated linear flow; conditions by tag; delays via scheduled job start dates rather than wait steps. | INFERRED |

## 1.10 Zapier

Sources: https://zapier.com/pricing ; https://help.zapier.com/hc/en-us/articles/8496288555917 (Paths) ; https://help.zapier.com/hc/en-us/articles/8496106701453 (Looping) ; https://help.zapier.com/hc/en-us/articles/8496241726989 (Replay) ; https://zapier.com/apps/delay/integrations ; https://zapier.com/apps/formatter/integrations ; https://zapier.com/apps/filter/integrations ; https://zapier.com/agents

| Item | Details | Confidence |
|---|---|---|
| Canvas | Vertical step list (trigger then actions), Paths fan out into branch columns; a Paths step must be the last step; up to 10 branches per group, 3 nested levels, 100 steps per Zap. Branches run left to right, one at a time. | OBSERVED |
| Draft vs published | Zaps are Off until published; edits must be published before replay works; Zap versions kept 1 month (Pro), 6 months (Team), 1 year (Enterprise). "Next Gen Zaps" in early access. | OBSERVED |
| Triggers | Instant (webhook) vs polling (15 min Free, 2 min Pro, 1 min Team/Enterprise); Schedule by Zapier; Webhooks by Zapier (Pro+); Email parser; RSS; Zapier Tables / Interfaces triggers. | OBSERVED (intervals) / INFERRED (list) |
| Built-in tools | Filter (Only continue if...; does not consume tasks); Paths (custom rules, always run, fallback); Delay (Delay For, Delay Until with handle-past option, Delay After Queue for rate limiting); Formatter (Date/Time, Numbers incl. math and currency, Text incl. find/replace, case, truncate, HTML strip, Markdown to HTML, Utilities incl. lookup table and pick from list, line items); Looping (text, line items, numeric range; each iteration is a separate Zap run; Pro+); Sub-Zap; Digest; Storage; Code by Zapier (JS/Python; 1s Free, 30s Pro/Team, 2 min Enterprise); Email by Zapier; SMS by Zapier; AI by Zapier and AI fields (Pro+); Human in the Loop step. | OBSERVED (most) / INFERRED (Sub-Zap, Digest, Storage names) |
| Observability | Zap history with run statuses; manual replay on all plans for errored runs; Autoreplay (Pro+) retries errored runs automatically, account-wide default on Team/Enterprise with per-Zap override; "replay entire run" with original or edited trigger data (paid). Paths: if one path errors others still run. | OBSERVED |
| Pricing | Free 100 tasks, two-step Zaps; Pro $19.99/mo annual (750 tasks) to $49 (2,000); Team $69/mo annual (2,000 tasks); Enterprise custom. Overage 2.5x base (monthly) or 1.25x (annual), capped at 3x. Agents: 400 activities Free, 1,500 Pro, custom Enterprise; Pro Agents from about $33.33/mo. Chatbots tiers. Copilot unlimited on paid. | OBSERVED |

## 1.11 Make

Sources: https://help.make.com/router ; https://help.make.com/iterator ; https://help.make.com/error-handlers ; https://help.make.com/incomplete-executions ; https://help.make.com/scenario-history ; https://help.make.com/manage-ai-agents ; https://www.make.com/en/pricing

| Item | Details | Confidence |
|---|---|---|
| Canvas | Free-form 2D canvas of circular modules; Router creates ordered routes with per-route filters and one fallback route; routes run sequentially, not in parallel; Iterator splits arrays into bundles; Array Aggregator recombines; Repeater; Sleep; Set/Get variable; Text parser; JSON; HTTP; Webhooks (custom webhook and mailhook); Data stores; Tools. | OBSERVED (router, iterator) / INFERRED (remaining tool names) |
| States | Scenario active or inactive; scheduling: immediately (instant trigger), at regular intervals, once, every day, days of week, days of month, specified dates; minimum interval by plan (Free 15 min, Core 1 min, Pro/Teams 1 min; not confirmed this session). | INFERRED (scheduling detail) |
| Error handling | Error handler routes with directives: Ignore/Skip, Resume (substitute value), Break (store incomplete execution for retry), Commit, Rollback; Retry via Break; automatic exponential-backoff retry for certain error types; "Store incomplete executions" off by default; scenario is deactivated after repeated consecutive errors (standard behavior, INFERRED). Error handlers do not consume credits. | OBSERVED (directives, incomplete executions) / INFERRED (deactivation) |
| Observability | History tab: each run with time, status (Success, Warning, Error), duration, operations, credits, data size, replay option, details with per-module output bundles and simple/advanced logs; change log of edits and activation; CSV export; full-text search (Pro+); "Explain error" and "Resolve error with Maia" (consumes credits). Retention by plan (not listed). | OBSERVED |
| Pricing | Credits replace operations: most actions 1 credit; Free 1,000 credits/mo; Core, Pro, Teams, Business, Enterprise; prices not rendered. Incomplete executions storage 10 MB per 10k operations, 2 GB max. Start-up plan 50% off Business. | OBSERVED |
| AI Agents | Created under AI Agents tab: provider connection and model (Make provider on all plans; OpenAI or Anthropic on paid), system prompt, Context files (TXT, PDF, DOCX, CSV, MD, JSON; 20 MB each, 20 per agent; stored in RAG vector DB), Tools (MCP servers, modules, scenarios), Model configuration (max tokens, max steps, max history with Thread ID). Invoked in scenarios via "Run an agent" module; shared per team; cannot change provider after creation. | OBSERVED |

## 1.12 n8n

Sources: https://docs.n8n.io/workflows/settings/ ; https://docs.n8n.io/workflows/components/nodes/ ; https://docs.n8n.io/workflows/executions/ ; https://docs.n8n.io/flow-logic/error-handling/ ; https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.wait/ ; https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.splitinbatches/ ; https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.form/ ; https://docs.n8n.io/integrations/builtin/cluster-nodes/root-nodes/n8n-nodes-langchain.agent/ ; .../tools-agent/ ; https://n8n.io/pricing/

| Item | Details | Confidence |
|---|---|---|
| Canvas | Free-form node graph with typed connections; items flow as arrays; branches by IF (two outputs), Switch (N outputs), Filter, Merge (append, combine by key or position, SQL join), Loop Over Items (batch size, loop and done outputs, Reset option), Wait, Execute Sub-workflow, Stop and Error, No-Op, Compare Datasets, Code (JS/Python), Edit Fields (Set), Aggregate, Split Out, Sort, Limit, Remove Duplicates, Summarize, Date and Time, Crypto, HTML, XML, Markdown, HTTP Request, Send Email, Respond to Webhook. | OBSERVED (Wait, Loop, Form, settings) / INFERRED (full core node names, index page did not render the list) |
| Triggers | Manual, Schedule, Webhook, Form Trigger (Test and Production URLs), Chat Trigger, Error Trigger, Execute Workflow Trigger, n8n Trigger (instance events), Email (IMAP), RSS, SSE, MCP Server Trigger, app triggers. | OBSERVED (Form, Error, Chat, MCP Server) / INFERRED (rest) |
| States | Manual execution in editor vs production once a workflow version is published (Active); workflow history retention 1 day (Starter), 5 days (Pro), 365+ (Enterprise). | OBSERVED |
| Error handling | Workflow setting "Error Workflow" (must start with Error Trigger; one error workflow can serve many); Stop and Error node; node settings Retry On Fail (max tries, wait between tries), On Error: Stop Workflow / Continue / Continue (using error output); Always Output Data; Execute Once; Save execution progress to resume after error; Timeout. | OBSERVED |
| Observability | Executions list per workflow and across all; statuses; copy execution data into editor for debugging; redaction; log streaming; Insights with estimated time saved; OpenTelemetry attributes; execution retention 7 days (Starter), 30 days (Pro), unlimited (Enterprise); max saved executions 2.5k / 25k / 50k. | OBSERVED |
| Wait | After time interval; at specified time; on webhook call (resume URL, auth options, IP whitelist, limit wait time); on form submitted. Waits over 65 s are persisted to DB. Server time, not workflow timezone. | OBSERVED |
| Pricing | Cloud Starter 20 EUR/mo (2.5k executions, 5 concurrent, 5 min max duration), Pro 50 EUR/mo (10k executions, 20 to 50 concurrent, 40 min), Enterprise custom; self-hosted community edition free. | OBSERVED |
| AI | AI Agent node (Tools Agent; agent type setting deprecated since 1.82): chat model sub-node (OpenAI, Anthropic, Groq, Mistral, Microsoft Foundry, others), memory sub-node (session memory; "does not persist between sessions" without a store), tool sub-nodes (Call n8n Workflow, Code, HTTP Request, Calculator, Wikipedia, Vector Store, app nodes as tools with $fromAI() parameter filling, MCP Client), output parsers (Structured, Auto-fixing, Item List), System Message, options Max Iterations (default 10), Return Intermediate Steps, binary image passthrough, streaming. Human review can require approval before sensitive tools run (Chat, Slack, Telegram). Evaluations for AI workflows. Human fallback example routes "don't know" to a Slack channel via sub-workflow tool. | OBSERVED |

---

# Part 2. Normalized taxonomy across products

Column "Products" counts, out of 12 (HighLevel, HubSpot, Keap, ActiveCampaign, Zoho CRM, Zoho Flow, Jobber, Housecall Pro, TaxDome, Zapier, Make, n8n), how many offer the item. Table stakes = 9 or more; expected in all-in-ones = present in HighLevel, HubSpot, Keap, ActiveCampaign and Zoho CRM.

## 2.1 Trigger categories

| Trigger category | Products | Who | Notes |
|---|---|---|---|
| Record created (contact, lead, client, job) | 12 | all | Table stakes. |
| Record field changed / updated | 11 | all except Housecall Pro (not confirmed) | Field-specific filters in HubSpot, Zoho, HighLevel, ActiveCampaign. |
| Tag added / removed | 7 | HighLevel, HubSpot (via list/property), Keap, ActiveCampaign, Zoho CRM (tags in criteria), Jobber (actions only), TaxDome (conditions) | Tag-as-universal-entry-point is the HighLevel and Keap idiom. |
| Form or survey submitted | 9 | HighLevel, HubSpot, Keap, ActiveCampaign, Zoho CRM (web forms), Zoho Flow (Zoho Forms), Jobber (request form), Zapier, n8n | Table stakes. |
| Inbound message / customer replied | 5 | HighLevel, ActiveCampaign (replies, conversations), HubSpot (conversation workflows), Podium (AI), n8n (chat trigger) | Core for speed-to-lead. |
| Call events (missed, completed, voicemail) | 2 | HighLevel, HubSpot (call logged) | Missed-call text back needs this. |
| Email engagement (open, click, bounce, unsubscribe) | 4 | HighLevel, HubSpot, Keap (legacy), ActiveCampaign | |
| Link clicked (trigger link) | 3 | HighLevel, ActiveCampaign, Keap | |
| Page visit / site tracking | 3 | HighLevel, HubSpot, ActiveCampaign | |
| Appointment booked / status changed / no-show | 6 | HighLevel, HubSpot (meeting booked), Keap, Jobber (job scheduled), Housecall Pro (job/estimate), TaxDome (job stage) | |
| Pipeline / deal stage changed, won, lost, stale | 7 | HighLevel, HubSpot, Keap, ActiveCampaign, Zoho CRM, TaxDome (stage entry), Housecall Pro (pipeline stage) | Table stakes for CRM-centric products. |
| Quote / estimate sent, approved, declined | 4 | Jobber, Housecall Pro, HighLevel (estimates), HubSpot (quotes) | |
| Invoice sent, paid, overdue; payment received; refund; subscription events | 7 | HighLevel, Keap, Jobber, Housecall Pro, TaxDome (automove on payment), HubSpot (invoice object), Zoho (Books via Flow) | |
| Review received | 2 | HighLevel, Podium | |
| Date-based (birthday, anniversary, custom date field, renewal) | 6 | HighLevel, HubSpot (schedule on date property), Keap (field timer), ActiveCampaign, Zoho CRM, Zoho Flow (schedule) | |
| Schedule / recurring (no record) | 6 | HighLevel (Scheduler), HubSpot (schedule), Zoho Flow, Zapier, Make, n8n | |
| Inbound webhook / API | 7 | HighLevel, HubSpot (Data Hub Pro+), Keap (API goal), Zoho Flow, Zapier, Make, n8n | |
| Task created / completed / reminder | 4 | HighLevel, HubSpot (task object), Keap, TaxDome (automove on task) | |
| Note added | 3 | HighLevel, Zoho CRM, Keap | |
| Score changed | 3 | HighLevel (engagement score), ActiveCampaign, Zoho CRM | |
| Social comment / lead ad form | 2 | HighLevel, HubSpot (ads) | |
| Ecommerce (order, abandoned cart) | 4 | HighLevel (Shopify), ActiveCampaign, Keap, HubSpot | |
| Course / membership / community | 1 | HighLevel | |
| Affiliate | 1 | HighLevel | |
| AI event (bot goal reached, call completed) | 3 | HighLevel (Conversation AI trigger, Voice AI), HubSpot (agent handoff), Podium | Emerging category. |
| Manual enrollment / bulk add | 8 | HighLevel, HubSpot, Keap, ActiveCampaign, Zoho (mass update fires rules), Zapier (manual run), Make, n8n | |

## 2.2 Action categories

| Action category | Products | Who | Notes |
|---|---|---|---|
| Send email (template) | 12 | all | Table stakes. |
| Send SMS | 9 | HighLevel, HubSpot (add-on), Keap, ActiveCampaign, Zoho (via Flow/SMS apps), Jobber, Housecall Pro, Zapier, n8n | Table stakes for local businesses. |
| Send WhatsApp | 5 | HighLevel, HubSpot, ActiveCampaign, Zoho Flow (apps), n8n | |
| Social DM (Messenger, Instagram, GMB, live chat) | 1 | HighLevel | Differentiator. |
| Voice: ring user / connect call / voicemail drop / IVR | 1 | HighLevel | Differentiator. |
| Internal notification (email, in-app, SMS to staff) | 11 | all except TaxDome (task to staff instead) | Table stakes. |
| Slack / Teams / Chat notification | 6 | HighLevel, HubSpot, Zoho CRM (Cliq, Slack, Webex), Zapier, Make, n8n | |
| Review request | 4 | HighLevel, Jobber, Housecall Pro, Podium | |
| Add / remove tag | 7 | HighLevel, Keap, ActiveCampaign, Zoho CRM, Jobber, TaxDome, HubSpot (lists/segments as proxy) | |
| Update field / custom value | 11 | all except Housecall Pro | Table stakes. |
| Create / update / move opportunity or deal | 7 | HighLevel, HubSpot, Keap, ActiveCampaign, Zoho CRM, TaxDome (job stage), Housecall Pro (pipeline) | |
| Create task | 9 | HighLevel, HubSpot, Keap, ActiveCampaign (deal task), Zoho CRM, TaxDome, Zapier, Make, n8n (via apps) | |
| Assign owner / round robin | 5 | HighLevel (assign user; round robin in calendars), HubSpot (rotate to owner), Zoho CRM (assignment rules), ActiveCampaign (deal owner), Keap (owner) | |
| DND / subscription management | 3 | HighLevel, HubSpot (manage subscriptions), ActiveCampaign (unsubscribe) | |
| Create record (contact, deal, ticket, client, job, invoice) | 11 | all except Housecall Pro | |
| Send invoice / charge card / send quote or document for signature | 6 | HighLevel, HubSpot (quote, invoice), Keap (invoice reminder), Jobber (auto payments), TaxDome (invoice, contract, proposal), Zoho (Books via Flow) | |
| Appointment status update / booking link | 2 | HighLevel, HubSpot (meeting) | |
| Add to ads audience / conversion API | 2 | HighLevel, HubSpot | |
| Webhook out / HTTP request | 10 | HighLevel, HubSpot (Data Hub), Keap (HTTP post), ActiveCampaign, Zoho CRM, Zoho Flow, Zapier, Make, n8n, TaxDome (Zapier only) | Table stakes except for field-service tools. |
| Custom code | 6 | HighLevel (JS/Python), HubSpot (JS/Python), Zoho CRM (Deluge), Zoho Flow (Deluge), Zapier (JS/Python), n8n (JS/Python); Make (via functions) | |
| Google Sheets / spreadsheet | 4 | HighLevel, Zapier, Make, n8n | |
| AI step (prompt, summarize, classify, decide) | 8 | HighLevel, HubSpot, ActiveCampaign, Zoho CRM (Zia Agent), Zoho Flow, Zapier, Make, n8n | Now table stakes. |
| Hand to AI agent (conversation takeover) | 4 | HighLevel (Conversation AI action), HubSpot (Assign to Customer Agent), Podium, n8n (agent node) | |
| Enroll in / remove from another automation | 8 | HighLevel, HubSpot, Keap, ActiveCampaign, Zoho CRM (chain rules), Zapier (Sub-Zap), Make (call scenario), n8n (sub-workflow) | |
| Manual action for a human (queue a call, approval) | 4 | HighLevel (Manual Action), Zapier (Human in the Loop), n8n (approval / send and wait), Make (approval via scenario) | |

## 2.3 Control-flow primitives

| Primitive | Products | Who | Notes |
|---|---|---|---|
| If/Else or multi-branch condition | 11 | all except Housecall Pro (exit rules only) | Table stakes. Jobber and TaxDome use conditions as gates, not branches. |
| Wait for duration | 12 | all (Zoho CRM as scheduled actions, TaxDome via dates) | Table stakes. |
| Wait until date/time or date field | 9 | HighLevel, HubSpot, Keap, ActiveCampaign, Zoho CRM, Zoho Flow, Zapier, Make (Sleep is bounded), n8n | |
| Wait until event / condition (reply, page view, property change) | 5 | HighLevel, HubSpot, ActiveCampaign, n8n (webhook/form resume), Zapier (Human in the Loop) | |
| Time window / business hours gating | 3 | HighLevel, HubSpot, Zoho CRM (scheduled at time) | Deterministic requirement for SMS compliance. |
| Goal (skip ahead when condition met) | 3 | HighLevel, ActiveCampaign, Keap (goal-driven model); HubSpot has goals for reporting and exit | |
| Random / A/B split | 4 | HighLevel, HubSpot, ActiveCampaign, Keap (no) ; Zapier no | |
| Go to step / jump | 4 | HighLevel, HubSpot (within branches), ActiveCampaign, Zoho Flow (no) | |
| Loop over items | 5 | Zapier (Looping), Make (Iterator), n8n (Loop Over Items), HighLevel (Arrays, limited), Zoho Flow (not confirmed) | Rare in CRM builders. |
| Parallel branches | 3 | n8n (branches), Make (routes, sequential), Zoho CRM (parallel action classes) | Most run branches sequentially. |
| Sub-workflow / call another automation | 8 | see "enroll in another" above | |
| Early exit / unenrollment rules | 7 | HighLevel (stop on response, remove from workflow), HubSpot (unenrollment triggers, suppression), ActiveCampaign (end automation, goals), Keap (stop goal), Housecall Pro (exit rules), Zoho CRM (criteria no longer met deletes scheduled), Jobber (stop if paid) | Table stakes in spirit: "stop texting when they reply or pay". |
| Re-enrollment control | 7 | HighLevel, HubSpot, ActiveCampaign, Zoho CRM (repeat on edit), Keap (goal re-entry), Zapier (dedupe by trigger id), n8n (none) | |
| Drip / throttle / batch release | 2 | HighLevel (Drip Mode), Zoho CRM (5,000 per 10 min) | |

## 2.4 Data primitives

| Primitive | Products | Who |
|---|---|---|
| Merge fields / tokens in messages | 12 | all |
| Custom fields read/write | 11 | all except Housecall Pro (limited) |
| Workflow-level variables / custom values | 7 | HighLevel, HubSpot (action outputs), Zoho Flow (Set Variable), Zapier (mapped outputs), Make (variables), n8n (items), ActiveCampaign (custom fields as variables) |
| Text formatting (case, trim, split, replace) | 6 | HighLevel (Text Formatter), HubSpot (Format data), Zapier (Formatter), Make (functions), n8n (Edit Fields, expressions), Zoho Flow (functions) |
| Math | 7 | HighLevel (Arrays/Math premium), HubSpot (Format data, increase/decrease), ActiveCampaign (math on field), Zapier (Formatter numbers), Make, n8n, Zoho (Deluge) |
| Date math and formatting | 7 | HighLevel, HubSpot, Zapier, Make, n8n, Zoho Flow, ActiveCampaign (wait relative to date) |
| Lookup table / find record | 7 | HighLevel (Find Contact, Google Sheets lookup), HubSpot (associated records), Zapier (Formatter lookup, search actions), Make (search modules, data stores), n8n, Zoho Flow (fetch actions), Zoho CRM (lookups in criteria) |
| Arrays / line items | 5 | HighLevel (Arrays), Zapier (line items, Looping), Make (Iterator/Aggregator), n8n, HubSpot (line items on deals) |
| Trigger payload mapping (webhook body to fields) | 6 | HighLevel, HubSpot, Zoho Flow, Zapier, Make, n8n |
| Phone validation / formatting | 3 | HighLevel (Number Validation), HubSpot (Validate and format phone), ActiveCampaign (extract phone) |

## 2.5 Observability primitives

| Primitive | Products | Who | Notes |
|---|---|---|---|
| Per-run execution log with step statuses | 9 | HighLevel, HubSpot, Zoho Flow, Zapier, Make, n8n, ActiveCampaign (per-contact history), Keap (reporting), Zoho CRM (upcoming actions, audit) | Table stakes. Jobber, Housecall Pro, TaxDome: not confirmed. |
| Per-record enrollment history | 7 | HighLevel, HubSpot, Keap, ActiveCampaign, Zoho CRM (upcoming actions), TaxDome (job timeline), Jobber (client timeline) | |
| Simulated test mode | 2 | HubSpot (Test with record), n8n (manual execution with test data); Zapier tests each step live; Make "Run once" | HubSpot is the model. |
| Error surfacing (needs review status, error badge) | 7 | HubSpot, Zapier, Make, n8n, Zoho Flow, HighLevel, Zoho CRM (admin notify) | |
| Automatic retry | 5 | Zapier (Autoreplay), Make (exponential backoff, Break), n8n (Retry On Fail), HubSpot (internal), Zoho (none) | |
| Manual replay | 4 | Zapier, Make, n8n, HubSpot (re-enroll) | |
| Error branch / error workflow | 4 | Make (error handler routes), n8n (error output, Error Workflow), Zapier (fallback path after replays), HighLevel (Messaging Error trigger) | |
| Alerts on anomalies / failures | 4 | HubSpot (Enterprise), Zapier (email on errors), Make (email), n8n (error workflow) | |
| Versioning and rollback | 5 | HubSpot, Zapier (versions), n8n (workflow history), HighLevel (INFERRED), Make (blueprints export) | |
| Usage / cost metering visible per run | 4 | Make (credits per run), Zapier (tasks), HubSpot (credits), HighLevel (wallet usage) | |
| Conversion / goal reporting per branch | 3 | HubSpot, ActiveCampaign, Keap | |

---

# Part 3. The 25 most common small-business automation recipes

Format: trigger; steps; which products ship it as a named template or built-in toggle (OBSERVED where the product page or doc named it; INFERRED otherwise).

1. Missed call text back. Trigger: call status = no answer / missed (inbound). Steps: wait 0 to 1 min; if no reply from staff, SMS "Sorry we missed you, how can we help?"; tag "missed-call"; if reply, hand to Conversation AI or notify staff; stop on response. Ships: HighLevel recipe (INFERRED, canonical HighLevel recipe), Podium AI Employee (built in, OBSERVED behavior), Jobber AI Receptionist (answers instead), Housecall Pro CSR AI (answers instead).

2. Appointment confirmation and reminder sequence. Trigger: appointment booked. Steps: instant confirmation SMS and email with reschedule link; wait until 24 h before, SMS reminder; wait until 1 h before, SMS reminder; if status = confirmed skip; time window. Ships: HighLevel recipe (INFERRED), Jobber and Housecall Pro built-in reminders (OBSERVED), Keap Easy Automation "appointment reminders" (OBSERVED), HubSpot meeting reminder emails (INFERRED).

3. Review request after job or visit. Trigger: job completed / invoice paid / appointment showed. Steps: wait 1 to 24 h; send review request SMS and email with Google link; if review received, thank; else one reminder after 3 days; stop. Ships: Jobber (OBSERVED, Reviews add-on), Housecall Pro review management (OBSERVED), HighLevel Send Review Request action (OBSERVED), Keap Easy Automation "Customer Review Request, wait 7 days" (OBSERVED), Podium (OBSERVED, core product).

4. New lead instant reply and speed to lead. Trigger: form submitted / FB lead form / chat widget / inbound webhook. Steps: SMS within seconds; email; create opportunity in "New Lead"; notify owner (SMS and in-app); call-connect action to ring the rep; if no reply in 10 min, AI follows up. Ships: HighLevel recipe (INFERRED), Keap Easy Automation "Email Follow Up when public form submitted" (OBSERVED), HubSpot template (INFERRED), ActiveCampaign welcome recipe (OBSERVED in blog as welcome workflow), Podium AI Employee (OBSERVED).

5. Lead nurture drip. Trigger: tag "nurture" added or lead created with no appointment. Steps: day 0, 2, 5, 9, 14 messages alternating email and SMS; goal: appointment booked exits; if/else on engagement. Ships: ActiveCampaign (OBSERVED recipe category), HubSpot (lead nurturing template), Keap (OBSERVED template "lead magnet offer"), HighLevel (INFERRED).

6. Abandoned quote / estimate follow-up. Trigger: quote sent and status "awaiting response" after N days. Steps: reminder 1 at day 2 to 3; reminder 2 at day 7; notify rep; archive at day 30 to 90. Ships: Jobber two quote follow-ups up to 90 days plus auto-archive (OBSERVED), Housecall Pro estimate campaign with exit on won/lost (OBSERVED), HighLevel (estimate triggers, INFERRED), HubSpot quote workflows (INFERRED).

7. Unpaid invoice follow-up. Trigger: invoice overdue or invoice sent and unpaid. Steps: reminder at due date, +3, +7, +14 days; stop if paid; escalate to owner at +14. Ships: Jobber two invoice follow-ups up to 90 days (OBSERVED), Keap Easy Automation "Invoice Reminder, stop if paid" (OBSERVED), HighLevel invoice triggers (OBSERVED category), HubSpot Revenue agent for invoice follow-up (OBSERVED, AI), TaxDome invoice automations (INFERRED).

8. Birthday and anniversary. Trigger: birthday reminder / custom date field yearly. Steps: send greeting with offer code; tag; optional SMS. Ships: HighLevel Birthday Reminder trigger (OBSERVED), ActiveCampaign birthday coupon (OBSERVED blog), Zoho CRM date-based rule (OBSERVED model), HubSpot schedule on date property (OBSERVED model), Keap date timer (INFERRED).

9. Re-engagement and win back. Trigger: last service date older than 6 to 12 months or no engagement in 90 days (scheduler + filter). Steps: "we miss you" email, SMS with offer after 3 days, tag "winback"; exit when job booked. Ships: Housecall Pro campaigns on last service date (OBSERVED list criteria), ActiveCampaign re-engage recipe (OBSERVED), HubSpot (INFERRED), HighLevel (INFERRED), Podium AI re-engages past customers (OBSERVED).

10. Pipeline stage change notifications. Trigger: opportunity stage changed. Steps: internal notification to owner or Slack; update fields; create follow-up task; customer-facing status email. Ships: HubSpot deal-stage workflows (OBSERVED actions), Zoho CRM scenario "task on Closed Won plus email 5 days later" (OBSERVED), HighLevel (OBSERVED trigger category), Keap pipeline automation (OBSERVED name), TaxDome stage automations (OBSERVED model).

11. No-show follow-up. Trigger: appointment status = no-show. Steps: SMS "sorry we missed you, rebook" with link; wait 2 days; second nudge; move opportunity to "no-show"; tag. Ships: HighLevel recipe (INFERRED), HubSpot (INFERRED), Jobber/Housecall Pro not confirmed.

12. Form submission routing. Trigger: form submitted. Steps: if/else on service type or location; assign to owner or team; create opportunity in the matching pipeline; tag; notify. Ships: HubSpot (OBSERVED branches and rotate), HighLevel (OBSERVED If/Else and Assign), Zoho CRM assignment rules (OBSERVED order of execution), ActiveCampaign, Keap decision diamonds (OBSERVED).

13. Round robin lead assignment. Trigger: lead created. Steps: rotate to owner among active reps; notify assigned rep; set SLA task. Ships: HubSpot Rotate record to owner (OBSERVED), Zoho CRM assignment rules (OBSERVED), HighLevel Assign to User with round robin option (INFERRED), ActiveCampaign deal owner round robin (INFERRED).

14. Welcome / onboarding series for new customers. Trigger: first invoice paid or tag "customer". Steps: welcome email, what to expect, how to reach us, review ask later. Ships: ActiveCampaign onboarding (OBSERVED blog), Keap thank-you after payment (OBSERVED), HubSpot, HighLevel (INFERRED).

15. Appointment booked from AI conversation to CRM update. Trigger: Conversation AI / Voice AI booked appointment. Steps: tag source "AI", update opportunity stage, notify staff with call summary, start reminder recipe. Ships: HighLevel (OBSERVED Conversation AI trigger; booking "then triggers your reminders"), Podium (OBSERVED), Jobber AI Receptionist creates requests (OBSERVED).

16. Payment failed / subscription dunning. Trigger: subscription payment failed. Steps: SMS and email with update-card link; retry notification at +3 days; cancel access at +10; notify owner. Ships: HighLevel subscription triggers plus Course revoke (OBSERVED actions), Keap billing automation (OBSERVED name), HubSpot (Commerce, INFERRED).

17. Service reminder / recurring maintenance. Trigger: custom date (next service due) or schedule with filter on last service date. Steps: reminder email and SMS with booking link; second nudge; create opportunity. Ships: Housecall Pro campaigns on service history (OBSERVED), Jobber recurring jobs (INFERRED), HighLevel Custom Date Reminder (OBSERVED), Zoho date-based (OBSERVED), TaxDome recurring jobs (INFERRED).

18. Internal task creation and SLA escalation. Trigger: ticket or lead created, or stage change. Steps: create task due in 1 day; wait until task overdue; if not completed, notify manager. Ships: HubSpot (OBSERVED create task, delays), Zoho CRM (OBSERVED tasks, scheduled actions), HighLevel Task Reminder trigger (OBSERVED), TaxDome tasks per stage (INFERRED).

19. Document / contract sent and signed. Trigger: proposal accepted or stage reached. Steps: send contract for e-signature; wait until signed; move stage; send invoice. Ships: TaxDome automove on signature (OBSERVED model), HighLevel Send Documents and Contracts (OBSERVED), HubSpot Docusign action (OBSERVED), Jobber quote approval (OBSERVED trigger).

20. Lead scoring and hot-lead alert. Trigger: score changed / engagement score threshold. Steps: if score over X, tag hot, notify rep, create task; else continue nurture. Ships: ActiveCampaign (INFERRED score trigger), Zoho CRM score trigger (OBSERVED), HighLevel engagement score (OBSERVED), HubSpot lead scoring with filter trigger (INFERRED).

21. Unsubscribe / DND and compliance handling. Trigger: inbound SMS "STOP" or DND changed. Steps: set DND, remove from all workflows, tag, notify. Ships: HighLevel Contact DND trigger and Remove from Workflow (OBSERVED), HubSpot manage subscriptions (OBSERVED), ActiveCampaign unsubscribe (INFERRED). Usually handled by carrier-level stop words plus a workflow.

22. Post-visit upsell / cross-sell. Trigger: job completed with service type X. Steps: wait 14 days; offer related service; tag interest; exit on booking. Ships: ActiveCampaign renewal/upsell (OBSERVED blog), Housecall Pro campaigns (OBSERVED), HighLevel (INFERRED).

23. Webinar / event registration and reminders. Trigger: form submitted (registration). Steps: confirmation with calendar link; reminders at 24 h and 1 h; post-event replay and offer; split by attended. Ships: ActiveCampaign recipe (INFERRED), HubSpot marketing event participant action (OBSERVED), HighLevel (INFERRED).

24. Internal daily digest / scheduled report. Trigger: schedule (daily 8 am). Steps: query records (leads today, overdue invoices); format; send Slack or email digest. Ships: Zoho Flow schedule trigger example "email a task list every morning at 10 am" (OBSERVED), Zapier Schedule plus Digest (OBSERVED tool names), Make, n8n (OBSERVED schedule), HubSpot (not a workflow feature), HighLevel Scheduler trigger (OBSERVED).

25. Sync to external systems (sheet, accounting, ads). Trigger: contact created or invoice paid. Steps: add row to Google Sheets; post webhook; add to Facebook custom audience; fire conversion API. Ships: HighLevel Google Sheets, Webhook, Facebook CAPI (OBSERVED), HubSpot webhook and ads audience (OBSERVED), Zapier, Make, n8n (OBSERVED), Zoho Flow (OBSERVED).

Observation: field-service tools (Jobber, Housecall Pro, TaxDome) ship recipes 2, 3, 6, 7, 17 as fixed toggles with a couple of knobs (days, message text). CRM suites (HighLevel, HubSpot, Keap, ActiveCampaign, Zoho) ship them as editable templates. General tools ship none of them as domain templates; users rebuild them.

---

# Part 4. AI in automation, per product

## 4.1 HighLevel: Workflow AI, Conversation AI, Voice AI, AI Employee

| Aspect | Details | Confidence | Source |
|---|---|---|---|
| Workflow AI step | "AI Prompt (GPT powered)": generate text or a decision from a prompt, store in a variable, use in later If/Else or messages. Also "Conversation AI" action (hand the thread to the bot), "Eliza" marketplace actions, and marketing of "Agent Studio" as a drag-and-drop multi-step AI automation builder with custom agents and decision logic. "Workflow AI Assistant" builds workflows from a prompt. | OBSERVED | actions article; https://www.gohighlevel.com/ai |
| Conversation AI | Channels: SMS, WhatsApp, Facebook Messenger, Instagram, live chat, GMB. Trained on website content, FAQs, product and service details, knowledge bases, documents, Brand Voice guidelines and additional instructions. Books on a connected calendar, which "then triggers your reminders". Hands off to a human when needed. Modes (Suggestive vs Auto-pilot), bot goals (Appointment Booking, General Support, Custom), per-bot calendars, sleep timers, response delay, max messages before handoff: INFERRED. | OBSERVED (channels, training sources, booking, handoff) / INFERRED (modes and goals) | https://www.gohighlevel.com/conversation-ai |
| Voice AI | "AI receptionist" that answers the phone, qualifies callers, books appointments, takes actions 24 hours a day; demo scenarios include after-hours emergency, price question, rescheduling, caller wants a human (transfer). Configuration (prompt, voice, knowledge base, call transfer rules, post-call actions such as tag, field update, workflow trigger, SMS during call): INFERRED. | OBSERVED (capabilities) / INFERRED (configuration) | https://www.gohighlevel.com/voice-ai |
| Other AI | Reviews AI (auto-reply to Google reviews with control over which reviews), Content AI, Funnel AI, AI Scheduler, AI Marketer, AI Sales Agent, Ask AI. | OBSERVED | https://www.gohighlevel.com/ai |
| Pricing | Usage-based for Voice AI and Conversation AI (rates not shown on the pricing page); AI Employee bundle: Growth $50/mo per sub-account, Unlimited $97/mo per sub-account; agencies rebill with markup on Unlimited and above. Widely cited usage rates (Voice AI about $0.13 per minute, Conversation AI about $0.02 per message, Workflow AI about $0.02 to $0.03 per execution, Reviews AI about $0.08 per reply) are INFERRED and not confirmed this session. | OBSERVED (bundle prices) / INFERRED (per-unit) | https://www.gohighlevel.com/pricing |
| Complaints | Bot answering after a human replied; hallucinated prices when the knowledge base is thin; Voice AI latency and interruptions; surprise usage bills for sub-accounts; weak visibility into why the bot said something. | INFERRED (community sentiment, not re-verified) | |

## 4.2 HubSpot: Breeze agents and Credits

| Aspect | Details | Confidence | Source |
|---|---|---|---|
| Agents | Customer Agent (answers customer questions 24/7 from knowledge base, website and CRM context; escalates to humans), Prospecting Agent (monitors buying signals, drafts outreach, proposes CRM updates for approval), Content Agent, Data Agent (custom research questions per record), Campaign Agent, Nurture Agent, Smart Deal Progression, Revenue Agent (invoice follow-up and payment reminders), Knowledge Base Agent, Social Agent. Agent Builder: custom agents on one canvas, no code, built on prompts, knowledge and CRM data. Agent Hub: central place to activate and manage, included in Starter, Professional and Enterprise. | OBSERVED | https://www.hubspot.com/products/artificial-intelligence/breeze |
| Workflow integration | Workflow actions: Assign to Customer Agent, Data Agent prompt / research / fill smart property, Summarize record, Run Agent, Enroll in prospecting agent, Use a custom LLM. Enrollment trigger "Generate a trigger with AI". Breeze Intelligence anomaly alerts on enrollment rate (Enterprise). | OBSERVED | choose-your-workflow-actions; manage-your-workflow-settings |
| Credits | Included monthly: 500 (Starter), 3,000 (Professional), 5,000 (Enterprise) for Marketing/Sales/Service/Content/Revenue Hub; 500 / 5,000 / 10,000 for Data Hub or Customer Platform; not additive, no rollover; pay-as-you-go $0.010 per credit in increments of 10; capacity pack $10 per 1,000 credits per month. Costs: Customer agent 50 credits per resolved text conversation and 50 per minute of voice; Prospecting agent 100 per lead recommendation; Data agent 10 per prompt per record; Workflow AI action 10; Content agent 1,000 per piece; Revenue agent 500 per invoice; Knowledge Base agent 200 per article. | OBSERVED | https://legal.hubspot.com/hubspot-product-and-services-catalog |
| Configuration | Customer Agent: knowledge sources (knowledge base articles, website pages, documents, snippets), instructions and tone, channels (chat, email, WhatsApp, Messenger), handoff rules to inbox or team, meeting booking, test chat; guardrails via least-privilege access and provider controls. Details beyond the marketing page are INFERRED. | OBSERVED (summary) / INFERRED (specifics) | Breeze page |
| Complaints | Credit consumption opacity; agents limited to HubSpot-hosted knowledge; Pro+ gating for most workflow features; AI actions in beta changing names. | INFERRED | |

## 4.3 Zoho Zia (CRM and Flow)

| Aspect | Details | Confidence | Source |
|---|---|---|---|
| In workflows | Zia Agent instant action in Workflow Rules: name, deployed agent, query with merge fields. Zia suggests workflows and macros from repetitive activity; generative AI can "create modules, reports, and workflows in seconds"; best time to contact (Enterprise scheduled emails at Zia-suggested time); anomaly detection; churn, conversion and field predictions; next best experience; competitor alert and recommendation triggers. | OBSERVED | configuring-workflow-rules; https://www.zoho.com/crm/zia/ |
| Agents | "Purpose-built AI agents to support your specific business processes" that "execute business tasks autonomously"; Professional edition lists "AI agents", Enterprise "Extended AI capabilities". Zia Agent Studio, prebuilt agent names, and credit model: not confirmed on fetched pages. | OBSERVED (existence) / not confirmed (studio, list, credits) | https://www.zoho.com/zia/ ; https://www.zoho.com/crm/pricing/ |
| Zoho Flow | Zia generates flows from plain English, text summarize / rephrase utilities, and an action that lets AI choose and run the best actions based on prompt and context. | OBSERVED | https://www.zoho.com/flow/pricing/ |
| Pricing | Zoho positions AI as included rather than separately licensed; no per-use figures found. | OBSERVED (claim) | https://www.zoho.com/zia/ |
| Complaints | Zia features scattered across editions; agent capabilities new and lightly documented; Deluge needed for anything non-trivial. | INFERRED | |

## 4.4 Keap AI

| Aspect | Details | Confidence | Source |
|---|---|---|---|
| Features | AI Content Assistant (compose emails), AI Automation Assistant (build a campaign from templates and AI), "Keap AI" resource link. Lead-response AI agent or chat agent: not confirmed. | OBSERVED (names) | https://keap.com/pricing |
| Pricing | No separate AI price listed; included in the single platform plan. | OBSERVED | same |
| Complaints | Thin AI compared to peers; documentation moved to Thryv. | INFERRED | |

## 4.5 ActiveCampaign Active Intelligence and AI agents

| Aspect | Details | Confidence | Source |
|---|---|---|---|
| Features | Active Intelligence co-pilot (drafts campaigns, flags issues, insights; Memory and Custom Instructions; External Intelligence); AI agents acting on Business Goals ("one-prompt campaigns"); AI campaign builder with proactive campaigns and gap finding; Predictive Sending; AI Brand Kit; Scheduled Tasks; AI-suggested segments; MCP connectors for Claude and ChatGPT. In automations: AI Actions Library (transform a field value with AI), AI-powered automation builder on all plans. | OBSERVED | https://www.activecampaign.com/ai ; pricing page; actions article snippet |
| Pricing | 500 Active Intelligence credits on all plans; workspace access limited on Starter and Plus, unlimited on Pro and Enterprise. | OBSERVED | pricing page |

## 4.6 Podium AI Employee

| Aspect | Details | Confidence | Source |
|---|---|---|---|
| Capabilities | Phone calls, text, email, social and webchat from one inbox; responds to new leads immediately using business playbooks; qualifies and nurtures; books appointments directly on the calendar without handoff; sends confirmations and reminders; answers pre-appointment questions; re-engages past customers. Payments and review requests are Podium core features, not described on the AI page. | OBSERVED | https://www.podium.com/ai-employee/ |
| Configuration | Knows services, pricing, policies; plain-language feedback applies immediately; AI Studio with performance view and sandbox; escalation rules define when a human steps in; real-time access to calendars, records and workflows. | OBSERVED | same |
| Pricing | Add-on to any plan (named "Jerry" on the pricing page); plan prices not rendered; 10DLC base fee mentioned. Commonly cited Core about $399/mo and Pro about $599/mo per location: INFERRED, not confirmed. | OBSERVED (add-on) / not confirmed (prices) | https://www.podium.com/pricing/ |
| Complaints | Contract length and price; AI over-eager to book; limited control over tone without AI Studio. | INFERRED | |

## 4.7 Jobber AI (Copilot / Jobber AI Chat and Voice, AI Receptionist)

| Aspect | Details | Confidence | Source |
|---|---|---|---|
| Jobber AI (formerly marketed as Copilot) | Built-in assistant via Chat (web, mobile) and Voice (mobile). Reads your Jobber data plus benchmarks from thousands of home-service businesses; drafts quotes, suggests automations to turn on, creates marketing content, answers product questions; Voice completes "100+ tasks" (create quotes, directions, reschedule). Custom Report Builder from live data. | OBSERVED | https://getjobber.com/features/ai/ |
| AI Receptionist | Answers calls and texts around the clock, captures leads, schedules jobs and creates requests, takes messages, sends real-time notifications, operates "within the limits you set". Included in Plus; $29/mo add-on on other plans. | OBSERVED | same; https://getjobber.com/pricing/ |
| Quote auto-drafting | Jobber AI drafts quotes from past work and templates; you review before sending; can run from Automations. | OBSERVED | https://getjobber.com/features/automations/ |
| Complaints | Not re-verified. | not confirmed | |

## 4.8 Housecall Pro AI Team

CSR AI (answers calls, books jobs, nights and weekends; chat and text "coming soon"; call answering sold separately), Analyst AI (reports from job history), Coach AI (growth, pricing, hiring advice), Marketing AI (drafts emails, campaigns, descriptions; included in all plans), Pipeline AI (drafts follow-up messages), Help AI. Prices not listed. OBSERVED. Source: https://www.housecallpro.com/features/ai-team/

## 4.9 n8n AI Agent nodes

| Aspect | Details | Confidence | Source |
|---|---|---|---|
| Model | AI Agent root node (Tools Agent) with sub-nodes: Chat Model, Memory, Tools, Output Parser. Prompt from previous node (chatInput) or defined; System Message; Max Iterations (default 10); Return Intermediate Steps; streaming; binary image passthrough. | OBSERVED | tools-agent docs |
| Tools | Call n8n Workflow Tool (any workflow becomes a tool), Code Tool, HTTP Request Tool, Calculator, Wikipedia, Vector Store, hundreds of app nodes as tools with $fromAI() parameter filling, MCP Client Tool; one-click registry MCP servers; MCP Server Trigger exposes workflows to external agents. | OBSERVED | same; pricing page |
| Guardrails and humans | Human review can require approval before sensitive tools run (Chat, Slack, Telegram); "human approval for tool calls" listed on all cloud plans; human fallback pattern via a dont_know_tool sub-workflow posting to Slack; Evaluations (light on all plans, metric-based limited to 1 workflow on Starter); Error Workflow; Guardrails node: not confirmed. | OBSERVED | pricing; human-fallback example |
| Memory | Session memory sub-nodes (window buffer, Redis, Postgres, etc.); "memory doesn't persist between sessions" by default. | OBSERVED (quote) / INFERRED (store types) | tools-agent docs |
| Pricing | Included in execution pricing; Assistant credits 1,600/mo Starter, up to 9,600 Pro; AI models available without API keys on cloud (gateway credits). | OBSERVED | https://n8n.io/pricing/ |
| Complaints | Non-determinism in tool selection, token cost, memory configuration confusion, agent type deprecations. | INFERRED | |

## 4.10 Zapier Agents and Make AI Agents (for comparison)

- Zapier Agents: AI teammates with knowledge (FAQs, docs, public links), tools across 9,000+ apps, built with Copilot, monitored via activity log, Chrome extension; priced in "activities" (400 Free, 1,500 Pro, custom Enterprise; runs capped at 10 or 40 activities). Human in the Loop step exists in Zaps. OBSERVED. Sources: https://zapier.com/agents ; https://zapier.com/pricing
- Make AI Agents: see 1.11. "Run an agent" module inside scenarios; scenarios as tools; RAG context files; max steps and history. OBSERVED.

## 4.11 Cross-product AI pattern

All vendors converge on the same shape: (1) a knowledge pack (site, docs, FAQs, CRM data), (2) instructions / persona / goals, (3) a bounded tool set (book, tag, update field, create task, send message, transfer), (4) escalation rules to a human, (5) a sandbox or test chat, (6) usage metering (credits, per minute, per message, activities). The AI sits either as a step inside a deterministic flow (HubSpot AI actions, HighLevel AI Prompt, Zoho Zia Agent action, n8n Agent node) or as a channel owner that the flow hands a conversation to (HighLevel Conversation AI, HubSpot Customer Agent, Podium, Jobber AI Receptionist, Housecall CSR AI).

---

# Part 5. Designing automation on an agent runtime

## 5.1 What must stay deterministic (never left to an agent's judgment)

| Capability | Why deterministic | Evidence from the market |
|---|---|---|
| Timing of reminders, follow-ups, dunning | Users expect "24 hours before" to mean exactly that; every product exposes explicit waits, time windows and pause dates. | HubSpot timing settings with 15-minute spread; Zoho scheduled actions and PST daily counters; HighLevel Wait and time window; Housecall delays measured from the previous step. |
| Compliance: consent, DND, quiet hours, STOP handling, marketing-only lists | Legal exposure (TCPA, 10DLC, CAN-SPAM); vendors hard-code exclusions. | Housecall Pro fixed exclusions (unsubscribed, do-not-service, invalid, over 3 years); HubSpot Manage communication subscriptions and lawful basis; HighLevel DND actions and triggers; Podium 10DLC fee. |
| Billing and money movement | Charging a card, sending an invoice, refunds; must be idempotent and auditable. | HighLevel Stripe charge, HubSpot Convert to invoice, Jobber automatic payments: all plain actions with no AI in the loop. |
| Record mutations with side effects | Stage moves, owner assignment, tag writes feed other automations and reports; loops must be bounded. | Zoho loop control (self-retrigger twice, chains stop at three); HubSpot Go to action only within branches to prevent loops; HighLevel Allow re-entry. |
| Exit and suppression rules | "Stop texting when they reply, book or pay" is a promise, not a suggestion. | HighLevel Stop on response; Housecall early-exit rules; Keap stop-if-paid; HubSpot unenrollment and suppression; ActiveCampaign goals. |
| Routing fairness | Round robin and skill routing must be provably even. | HubSpot Rotate record to owner "distributes records equally". |
| Retry, dedupe and idempotency | Webhooks and API calls; replay must not double-send. | Zapier Autoreplay with fallback after replays; Make Break / incomplete executions; n8n Retry On Fail. |
| Metering and spend caps | Users are angry about surprise AI bills. | HubSpot credit pauses at zero; Zapier 3x cap; HighLevel rebilling. |

## 5.2 What is naturally agent behavior

| Capability | Why an agent | Market precedent |
|---|---|---|
| Replying to inbound messages and calls in natural language | Infinite input space; scripts fail. | HighLevel Conversation AI and Voice AI; HubSpot Customer Agent; Podium AI Employee; Jobber AI Receptionist; Housecall CSR AI. |
| Qualifying leads (ask, extract, score) | Needs follow-up questions and judgment. | Podium "asks questions and gathers key details until ready to book"; HubSpot Prospecting agent. |
| Summarizing (calls, threads, records) | Pure text work with no side effects. | HubSpot Summarize record (10 credits); HighLevel call summaries; Jobber AI reports. |
| Drafting (follow-ups, quotes, review replies, campaign copy) with human review | Content quality matters, risk is low if a human approves. | Jobber quote auto-draft "reviewed by you"; Housecall Pipeline AI drafts; HighLevel Reviews AI with control; HubSpot Prospecting agent "for approval". |
| Deciding the next best step within a bounded menu | Choose among allowed actions given context. | Zoho "next best experience"; HubSpot Smart Deal Progression; Zoho Flow "let AI choose and run the best actions"; n8n Tools Agent selecting tools. |
| Classifying and extracting (intent, service type, urgency, address) | Replaces brittle keyword If/Else. | ActiveCampaign AI Actions Library; HighLevel AI Prompt stored to a variable; HubSpot Data Agent fill smart property. |
| Building the automation itself from a description | Every vendor now ships this. | HighLevel Workflow AI Assistant; HubSpot Generate a trigger with AI; Keap AI Automation Assistant; ActiveCampaign AI automation builder; Zoho Flow Zia generate; Zapier Copilot. |

## 5.3 One "Automations" surface without a visual canvas

Recommendation: present automations as a list of plain-language rules ("playbooks"), each compiled into a deterministic plan with optional agent steps, and show the plan as an ordered, inspectable outline rather than a free-form canvas. This mirrors the three models users already accept: Jobber and Housecall Pro toggles with knobs, Keap Easy Automations "When ... Then ...", and Zoho CRM's ordered conditions with instant and scheduled actions, while matching HubSpot's enrollment-trigger plus timing-settings rigor.

Design elements:

1. Catalog first. Ship the 25 recipes in Part 3 as named, toggleable playbooks with 2 to 5 knobs each (delay days, channel, message, exit rules). This is what field-service users expect by name ("quote follow-up", "review request", "missed call text back"). Each shows the compiled plan beneath it.

2. Plain-language rule editor for custom playbooks. "When [trigger with filters], [wait/condition], then [actions]; stop when [exit rules]." The agent runtime translates the sentence into a typed plan (trigger, filters, steps, exits, time window) and asks clarifying questions, the way HighLevel Workflow AI Assistant and Keap AI Automation Assistant do. The plan, not the sentence, is what executes.

3. Typed step kinds in the compiled plan, so both deterministic and agent steps live in one outline:
   - Deterministic: wait (duration, until date/field, until event, time window), condition (if/else on fields and tags), message (template with merge fields), record (tag, field, stage, owner, task, DND), money (invoice, charge), external (webhook, sheet), control (goal, exit, enroll in another playbook, drip).
   - Agent: reply (owns a conversation until a goal or handoff), decide (choose among listed next steps), extract (fill fields), draft (produce content for approval), summarize.
   - Human: approve (send-and-wait, like Zapier Human in the Loop and n8n approvals), manual action (queue a call).
   Every agent step declares its allowed tools, its budget (messages, minutes, credits) and its handoff rule, matching the market's knowledge, instructions, tools, escalation, sandbox, metering pattern (Part 4.11).

4. Deterministic skeleton, agent inside the bounds. Timing, compliance, money, routing and exits are always compiled to deterministic steps even when the user asked in natural language ("remind them the day before" becomes wait-until appointment minus 24 h inside the quiet-hours window). The agent cannot move or skip these; it can only act inside its step.

5. Testing like HubSpot, logging like Zapier and Make. Provide "Test with a record" that simulates the plan and shows the predicted path and timestamps with no real sends (HubSpot's model), plus a per-run log with step statuses, agent transcripts, tool calls, credits used, and replay (Zapier Autoreplay and Make history). Add a "Needs review" status and anomaly alerts (HubSpot Enterprise) for free.

6. Settings that users look for by name: Allow re-entry, Stop on response, Time window, Pause dates, Suppression lists, Remove from other playbooks on enrollment, Daily send caps, AI spend cap per playbook. These are the first questions power users ask.

7. Versioning: every edit creates a version; in-flight runs finish on the version they started (Zoho's observed behavior for scheduled actions) or migrate explicitly; show version history with restore.

## 5.4 What users would miss without a canvas, and the mitigation

| Loss | Who feels it | Mitigation |
|---|---|---|
| Seeing the whole shape at a glance, especially branches and goals | HighLevel and ActiveCampaign power users, agencies who sell "funnels" | Auto-rendered read-only diagram of the compiled plan (outline to flowchart), exportable; it is a view, not the editor. |
| Drag-and-drop reordering and inserting steps mid-flow | Everyone who has used Zapier or HighLevel | Outline editor with insert-between and move controls; natural-language edits ("add a 2-day wait before the second text") applied by the agent and shown as a diff. |
| Multi-branch logic (If/Else with 3+ branches, A/B splits, goals that pull contacts forward) | Marketers | Support branch and goal step kinds in the outline; render as indented sub-outlines; offer A/B as a first-class "experiment" knob rather than a split block. |
| Debugging by clicking a node to see its payload | Zapier, Make, n8n users | Per-step inspector in the run log with input/output and the agent's reasoning summary; copy a past run into test mode (n8n style). |
| Trust that "the AI will not improvise" | Owners worried about compliance | Show deterministic steps with a lock icon and agent steps with their tool list and budget; keep a plain "What this will never do" panel per playbook. |
| Parity marketing: "we have a visual builder" | Sales conversations against HighLevel | Position the outline plus diagram as "readable automations"; ship a canvas later as an alternate view of the same plan if demand is proven. |
| Loops, arrays, custom code | Integrators | Expose an "advanced step" that calls a webhook or a script, and let the agent step handle list iteration internally with bounded fan-out; do not try to out-n8n n8n. |

## 5.5 Summary recommendation

Build one Automations surface with three layers: (1) a recipe catalog of named playbooks with knobs, (2) a plain-language rule editor that compiles to a typed, inspectable plan, (3) a runtime where deterministic steps (timing, compliance, money, routing, exits) are enforced by the scheduler and agent steps (reply, qualify, summarize, draft, decide, extract) run inside declared tools, budgets and handoff rules. Match HubSpot on simulation and settings, Zapier and Make on logs and replay, HighLevel on channel breadth (SMS, email, WhatsApp, voice, social DMs) and on AI handoff, and field-service tools on the fixed recipe names users search for. Add a read-only diagram view to blunt the "no canvas" objection, and keep per-playbook AI spend caps visible from day one because surprise AI bills are the loudest complaint across HighLevel, HubSpot and Zapier users.

---

# Appendix A. Unconfirmed items to verify later

- HighLevel: full official trigger list (article 155000002292 requires login); premium action per-execution prices; Voice AI per-minute and Conversation AI per-message rates; existence and naming of Voice AI action, AI Agent step, version history, execution-log fields.
- HubSpot: workflow history and action-log article contents; per-tier workflow count limits; Customer Agent configuration specifics.
- Keap: current Easy Automations full trigger and action menu; Advanced Automations sequence step list; any Keap AI agent beyond content and automation assistants.
- ActiveCampaign: official full trigger list (help center blocked); recipe library count; Math operation action naming.
- Zoho: Zia Agent Studio, prebuilt agent names, credit model; Zoho Flow loops and dollar prices; Zoho CRM per-edition prices.
- Jobber: official custom automation builder trigger, condition and action lists; run history UI.
- Housecall Pro: Pipeline, Campaigns and CSR AI add-on prices; full campaign trigger list.
- TaxDome: official automation type list and pricing (site blocks fetching).
- Podium: plan prices and AI Employee price.
- Make: plan prices, minimum intervals, history retention days, deactivation after consecutive errors.
- n8n: Guardrails node existence; complete core node index (page did not render).
- All community pain points in this document are INFERRED and were not re-verified this session.

# Appendix B. Source index

HighLevel: https://help.gohighlevel.com/support/solutions/articles/155000002294 ; https://help.gohighlevel.com/support/solutions/articles/155000002292-a-list-of-workflow-triggers (snippet) ; https://partner-program-43p.pages.dev/ghl-features/actions-library ; https://partner-program-43p.pages.dev/ghl-features/triggers ; https://www.gohighlevel.com/pricing ; https://www.gohighlevel.com/ai ; https://www.gohighlevel.com/conversation-ai ; https://www.gohighlevel.com/voice-ai
HubSpot: https://knowledge.hubspot.com/workflows/choose-your-workflow-actions ; https://knowledge.hubspot.com/workflows/set-your-workflow-enrollment-triggers ; https://knowledge.hubspot.com/workflows/manage-your-workflow-settings ; https://knowledge.hubspot.com/workflows/test-your-workflow ; https://www.hubspot.com/products/artificial-intelligence/breeze ; https://legal.hubspot.com/hubspot-product-and-services-catalog
Keap: https://keap.com/business-success-blog/marketing/automation/introducing-easy-automations ; https://keap.com/product-updates/automation-builder-updates-youve-been-asking-for ; https://keap.com/features/automation ; https://keap.com/pricing ; help.keap.com/help/easy-automations, /decision-diamonds, /advanced-automation-builder-terminology (snippets)
ActiveCampaign: https://help.activecampaign.com/hc/en-us/articles/218251828 (snippet) ; https://help.activecampaign.com/hc/en-us/articles/218788707 (snippet) ; https://help.activecampaign.com/hc/en-us/articles/224653688 (snippet) ; https://www.activecampaign.com/pricing ; https://www.activecampaign.com/ai ; https://www.activecampaign.com/blog/marketing-automation-workflow
Zoho: https://help.zoho.com/portal/en/kb/crm/automate-business-processes/workflows/articles/configuring-workflow-rules ; https://help.zoho.com/portal/en/kb/crm/automate-business-processes/workflows/articles/workflow-scenarios ; https://www.zoho.com/crm/zia/ ; https://www.zoho.com/zia/ ; https://www.zoho.com/crm/pricing/ ; https://help.zoho.com/portal/en/kb/flow/user-guide/create-a-flow/articles/logic-elements ; https://help.zoho.com/portal/en/kb/flow/user-guide/create-a-flow/actions-logic/articles/flow-control ; https://help.zoho.com/portal/en/kb/flow/user-guide/overview/articles/general-overview ; https://www.zoho.com/flow/pricing/
Jobber: https://help.getjobber.com/hc/en-us/articles/24244124296471 ; https://getjobber.com/features/automations/ ; https://getjobber.com/features/ai/ ; https://getjobber.com/pricing/ ; https://community.getjobber.com/discussions/operations-forum/best-jobber-automations/208/replies/548
Housecall Pro: https://help.housecallpro.com/en/articles/13755667-campaigns-send-automated-campaigns ; https://www.housecallpro.com/features/pipeline/ ; https://www.housecallpro.com/features/ai-team/ ; https://www.housecallpro.com/pricing/
TaxDome: https://help.taxdome.com/article/108-using-automations (snippet) ; https://help.taxdome.com/article/282-jump-in-your-first-pipeline-with-automations (snippet) ; https://help.taxdome.com/article/1693-zapier-integration-basic-triggers (snippet)
Podium: https://www.podium.com/ai-employee/ ; https://www.podium.com/pricing/
Zapier: https://zapier.com/pricing ; https://zapier.com/agents ; https://help.zapier.com/hc/en-us/articles/8496288555917 ; https://help.zapier.com/hc/en-us/articles/8496106701453 ; https://help.zapier.com/hc/en-us/articles/8496241726989 ; https://zapier.com/apps/delay/integrations ; https://zapier.com/apps/formatter/integrations ; https://zapier.com/apps/filter/integrations
Make: https://help.make.com/router ; https://help.make.com/iterator ; https://help.make.com/error-handlers ; https://help.make.com/incomplete-executions ; https://help.make.com/scenario-history ; https://help.make.com/manage-ai-agents ; https://www.make.com/en/pricing
n8n: https://docs.n8n.io/workflows/settings/ ; https://docs.n8n.io/workflows/components/nodes/ ; https://docs.n8n.io/workflows/executions/ ; https://docs.n8n.io/flow-logic/error-handling/ ; https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.wait/ ; https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.splitinbatches/ ; https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.form/ ; https://docs.n8n.io/integrations/builtin/cluster-nodes/root-nodes/n8n-nodes-langchain.agent/ ; https://docs.n8n.io/integrations/builtin/cluster-nodes/root-nodes/n8n-nodes-langchain.agent/tools-agent/ ; https://docs.n8n.io/advanced-ai/examples/human-fallback/ ; https://n8n.io/pricing/
