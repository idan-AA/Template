# 12. Marketing features in small-business all-in-one platforms (late 2026)

Research date: 2026-11-06. Scope: email, SMS and MMS, segmentation, forms and surveys, funnels and sites, reputation, social posting, attribution, compliance, user pain points, and what a template must have.

Method note. The shared WebSearch budget was exhausted after the first 10 searches, so the remaining research (about 140 page reads) was done by fetching official help centers, pricing pages, developer docs, regulator pages and review sites directly. Every row cites the page it came from. OBSERVED means the claim is on the cited page. INFERRED means it is deduced from titles, snippets or a secondary source. "Not confirmed" means we could not reach a primary page.

Reference products: HighLevel (HL), Keap, ActiveCampaign (AC), Mailchimp (MC), Brevo, Thryv, Podium, Birdeye, Jobber Marketing Suite, Fresha, Vagaro, Square Marketing, HubSpot Marketing Hub Starter, Typeform, Tally, Webflow, Carrd, Unbounce.

Short URL prefix used below: `HL/` = `https://help.gohighlevel.com/support/solutions/articles/`.

---

## Part 1. Email marketing

| Feature | Products that have it | Details | Source |
|---|---|---|---|
| Drag and drop builder with element library | HL, MC, AC, Keap, Brevo, HubSpot, Thryv | OBSERVED (HL): element articles exist for Text, Image, Button, Logo, Video, Code, Social, FAQ, Footer, Spacer, Shopping Cart, GIFs, attachments, custom fonts, border and margin controls, inline editor, autosave, inbox preview. Thryv runs a "new" and a "legacy" builder in parallel (INFERRED from help article title). | HL search listing: https://help.gohighlevel.com/support/search/solutions?term=email+builder ; Thryv: https://learn.thryv.com/hc/en-us/articles/41416489368717 |
| Templates and template library | HL, MC, Keap, Brevo, HubSpot, Jobber (campaign templates), Fresha (campaign templates) | OBSERVED: HL has "Create Email Templates with Ask AI" and "Switch Email Templates Within the Email Builder". MC: pre-built templates on all plans, custom-coded templates can be sent only on Standard and above. Keap: curated template library plus custom designs. | HL/155000008500 ; https://mailchimp.com/pricing/marketing/ ; https://keap.com/features/email-marketing ; https://www.fresha.com/for-business/features |
| Saved blocks / reusable sections | Not confirmed in HL help titles (no "saved block" article found). MC "Branded templates" on Standard+. | INFERRED: HL has Brand Boards (colors, fonts) that the AI editor applies; a true saved-block library was not confirmed. | HL/155000009419 ; https://mailchimp.com/pricing/marketing/ |
| Personalization and merge fields | HL, MC, AC, Keap, HubSpot, Brevo | OBSERVED (HL): `{{object.field}}` syntax; groups: Contact, User, Custom values, Custom fields, Appointment, Calendar, Account, Current date, Message, Invoice, Service booking; `_raw` variants strip punctuation; per-occurrence fallback "Default Text" set in the editor, works in subject, preview text and body. | HL/155000008467 |
| Conditional content (show or hide blocks per contact) | HL (Conditional Elements), MC (Dynamic Content, Standard+), AC (Conditional Content, Pro and Enterprise) | OBSERVED (HL): element Visibility tab, operators Is, Is Not, Is Empty, Is Present; supported field types single-line text, number, radio, single dropdown; tags not confirmed as a condition. MC: conditions on audience field, group, tag; up to 10 conditions per block; not allowed in footer blocks. AC: tier-gated to Pro and Enterprise. | HL/155000003903 ; https://mailchimp.com/help/about-dynamic-content/ ; https://www.activecampaign.com/pricing |
| Spintax (random text variants) | HL | OBSERVED by article title only. | HL/155000008067 |
| A/B testing | HL, MC, AC, Keap (claimed), HubSpot (tier unclear) | OBSERVED (HL): test Subject OR Content, up to 6 variations, test-size slider, duration 30 min to 24 h (AI article) or e.g. 4 or 8 h, winner by unique open (subject) or unique click (content), minimum 40 contacts total and 10 per variation, Send Now and Schedule only (not Batch or RSS), first variation wins if no engagement. MC: one variable (subject, from name, content, send time), up to 3 variations, winner by open, click or revenue, manual or automatic; multivariate on Standard+. AC: email A/B on all tiers, automation A/B on Pro and Enterprise. | HL/155000006660 ; HL/155000009419 ; HL/155000006670 ; https://mailchimp.com/help/about-ab-tests/ ; https://www.activecampaign.com/pricing |
| Send time optimization | HL (Smart Send), MC (STO, Standard+), AC (Predictive Sending, Pro+), Brevo (listed, not confirmed) | OBSERVED (HL): optimizes at location level, not per contact; needs 1,000 delivered emails in the last 60 days; regular campaigns only, not A/B or batch; weights opens by hour, clicks weighted higher. MC: within 24 h of the chosen date, date must be 48 h out, not for automations. | HL/155000006628 ; https://mailchimp.com/help/use-send-time-optimization/ ; https://www.activecampaign.com/pricing |
| Throttling and batch sending | HL (Batch Schedule, Drip Mode for bulk actions) | OBSERVED: Batch Schedule splits a list by Batch Quantity with a repeat interval in hours or days. Drip Mode for bulk actions: batch 1 to 10,000, repeat after minutes/hours/days, "Process Between" hours, "Send On" weekdays, DND contacts deferred, resumable checkpoints. | HL/48001215384 ; HL/155000006472 |
| Campaign vs automated email | All reference products | OBSERVED (HL): Email Builder campaigns are separate from Workflow "Send Email" actions; workflow email actions are included in statistics. AI "Email Sequences" are distinct from workflows. | HL/155000004371 ; HL/155000009419 |
| RSS and recurring campaigns | HL, MC (STO note mentions RSS types exist) | OBSERVED (HL): RSS Schedule sends when the feed updates, daily or weekly at a set time, nothing sent if no new content; RSS blocks in builder; Resend to Unopened for RSS and Batch. | HL/48001215384 ; HL/155000005570 |
| Resend to unopened | HL | OBSERVED: supported for Send Now, Batch and RSS. | HL/155000006670 |
| List and segment management for sends | HL, MC, AC, HubSpot, Keap | OBSERVED (HL): targets Segments (dynamic), Pre-Built Segments (snapshotted), Smart Lists (evaluated at send) or Tags. | HL/155000006670 ; HL/155000005485 |
| Suppression / exclusion | HL: no exclusion filter in segments (tag workaround). MC: unsubscribed, bounced, abuse-reported contacts suppressed by system. | OBSERVED (HL): "no exclusion filter is described"; INFERRED for MC from report semantics. | HL/155000005485 ; https://mailchimp.com/help/about-email-campaign-reports/ |
| Unsubscribe link and flows | HL, MC, all | OBSERVED (HL): unsubscribe link auto-added to every LC Email; can be disabled per sub-account but then `{{email.unsubscribe_link}}` must be present or sending can be suspended. Flows: One-Step, Two-Step, Dynamic (confirmation required if clicked within 5 min of delivery or contact is under 1 h old). Resubscribe via "Unsubscribed by mistake". | HL/48001225534 ; HL/155000006071 |
| List-Unsubscribe header (one-click, RFC 8058) | HL (always on), Gmail requires it for bulk senders | OBSERVED: HL header "is not an optional feature"; Gmail and Outlook display it depending on reputation. Google requires one-click unsubscribe for 5,000+ messages/day. | HL/48001234940 ; https://support.google.com/a/answer/81126 |
| Preference center | HL (Preference Management Hub), MC (Groups + update profile form) | OBSERVED (HL): up to 5 active Subscription Types per sub-account, campaign linked to a type at send time, "Manage your preferences" link appended, per-type status visible on contact DND tab, cannot be turned off once enabled. MC: up to 60 group names per audience, shown on signup and update-profile forms. | HL/155000007291 ; https://mailchimp.com/help/getting-started-with-groups/ |
| Dedicated sending domain | HL (LC Email), HubSpot Starter (connect and authenticate domain), MC, AC, Brevo | OBSERVED (HL): subdomain such as mg.brand.com, DKIM required (multiple DKIM not supported), auto or manual DNS, up to 5 domains for calendar emails, SSL auto. Without one, newer sub-accounts get "email refactoring" to a shared plus-address. | HL/48001226115 ; https://www.hubspot.com/pricing/marketing |
| Domain warmup | HL (fixed-stage), Brevo dedicated IP (listed, not confirmed) | OBSERVED (HL): 15 stages, 1,000/day at Stage 1 to 250,000/day at Stage 15, advance only by hitting the full daily threshold, auto-start for new verified domains, "Start Warmup" for existing; exceeding a stage does not currently block sends. | HL/155000009082 |
| Dedicated IP | HL (purchase via LC Email, requires dedicated domain), Brevo (listed) | OBSERVED (HL) from search snippet; INFERRED for Brevo (pricing page did not render). | HL search results on dedicated IP ; https://www.brevo.com/pricing/ |
| Deliverability tooling | HL, MC, Keap | OBSERVED (HL): Google Postmaster connection, deliverability folder, "Why Are My Emails Going To Spam?", bot detection that stops stats and automations on bot clicks, email blocking for invalid domains. Keap: "email deliverability dashboard". | https://help.gohighlevel.com/support/solutions/48000449563 ; HL/155000002954 ; https://keap.com/pricing |
| Reporting: sent, delivered, opens, clicks, bounces, unsubscribes, complaints, revenue | HL, MC | OBSERVED (HL): Sent, Delivered, Opened, Unique Opens, Clicked, Unique Clicks, Unsubscribed, Bounced, plus Orders, Revenue, Conversion Rate, AOV, Revenue per Recipient; soft vs hard not split; complaints only at recipient level "where available"; delivered and bounced require LC Email or Mailgun, SMTP shows only opens and clicks. MC: adds abuse reports, forwards, 24-hour performance, click map, top locations, e-commerce orders and revenue, benchmarks. | HL/155000002176 ; HL/155000006670 ; https://mailchimp.com/help/about-email-campaign-reports/ |
| Email revenue attribution window | HL | OBSERVED: default 5 days, configurable; credit goes to the most recent qualifying open or click within the window; counts orders in HL Payments including Shopify. | HL/155000001701 |
| AI writing help | HL (Email AI Editor, Email Campaign Agent, Ask AI templates, AI countdown timer), MC (generative AI on Standard+), Keap AI, Jobber (AI drafts emails), Thryv (CaptionAI) | OBSERVED (HL): conversational editor applying Brand Boards, multi-email sequences from one prompt, AI-generated A/B variants. | HL/155000009419 ; HL/155000006670 ; https://mailchimp.com/pricing/marketing/ ; https://getjobber.com/features/marketing-suite/ |
| Plan and volume limits (reference points) | MC Free 250 contacts and 500 sends/mo; Essentials 10x contacts; Standard 12x; Premium 15x. HubSpot Starter 1,000 marketing contacts, 5x sends. AC 10,000 to 15,000 sends per 1,000 contacts by tier. Keap single plan from $320/mo, 2 users. Vagaro 1,000 free emails/mo. Fresha 50 free marketing emails/mo then $0.02. Square Plus and Premium unlimited email. | OBSERVED on each pricing page. | https://mailchimp.com/pricing/marketing/ ; https://www.hubspot.com/pricing/marketing ; https://www.activecampaign.com/pricing ; https://keap.com/pricing ; https://www.vagaro.com/pro/pricing ; https://www.fresha.com/pricing ; https://squareup.com/us/en/software/marketing |

---

## Part 2. SMS and MMS marketing

| Feature | Products that have it | Details | Source |
|---|---|---|---|
| Bulk SMS campaigns | HL (bulk actions with Drip Mode), Podium Text Marketing, Square, MC SMS add-on, Keap, Vagaro, Fresha blasts, Thryv (not confirmed), Brevo (listed). Jobber: no SMS marketing. | OBSERVED: Jobber FAQ says it does not offer text marketing campaigns. | HL/155000006472 ; https://www.podium.com/text-marketing/ ; https://getjobber.com/features/campaigns/ |
| Segments for SMS | HL (smart lists, SMS DND filter), Square (smart targeting groups), Podium (customer groups), MC (SMS subscription status, SMS phone number filters) | OBSERVED. | HL/155000007530 ; https://squareup.com/us/en/software/marketing ; https://mailchimp.com/help/all-the-segmenting-options/ |
| Scheduling and throttling | HL Drip Mode (batch 1 to 10,000; minutes/hours/days; process-between hours; weekdays; ~1,000 SMS/min platform cap mentioned) | OBSERVED. | HL/155000006472 |
| Quiet hours | MC SMS (country-specific quiet hours enforced), HL (no explicit quiet hours; Drip Mode time window and optional "Texas regional restriction" toggle), Square (not confirmed) | OBSERVED (MC, HL). Regulator baseline: TCPA bars telephone solicitations before 8 a.m. or after 9 p.m. local time of the called party. | https://mailchimp.com/help/about-sms-marketing/ ; HL/155000006771 ; https://www.law.cornell.edu/cfr/text/47/64.1200 |
| Opt-in handling | HL (consent must be collected by the sending sub-account; keyword workflows; forms with SMS verification), MC (records consent date and time; SMS signup forms; double opt-in option), Podium (website, in-store, email, QR, forms), Square (not confirmed) | OBSERVED. HL states a keyword request is not automatic consent for ongoing marketing. | HL/48001213941 ; HL/48001170758 ; https://mailchimp.com/help/about-sms-marketing/ ; https://www.podium.com/text-marketing/ |
| Opt-out handling (STOP) | All via carriers and Twilio | OBSERVED (HL/Twilio): STOP, STOPALL, UNSUBSCRIBE, CANCEL, END, QUIT set permanent DND; only the recipient can re-opt-in with START or YES (HL also lists UNSTOP). HL auto-appends "Reply STOP to unsubscribe" on the first message and re-inserts every 1 to 60 days (default 30) with sender name. MC keywords: stop, cancel, end, quit, unsubscribe, optout, revoke, plus 5 other languages. | HL/48001186075 ; HL/48001213941 ; HL/155000006771 ; https://mailchimp.com/help/about-sms-marketing/ |
| Keywords (text JOIN) | HL (built with Workflow trigger "Customer Replied", Exact Match Phrase filter), Podium (QR and forms), Square (not confirmed) | OBSERVED (HL): do not use STOP or HELP as promotional keywords; reply must identify the business and include opt-out language. | HL/48001170758 |
| MMS media | HL (up to 10 media files, 5 MB total per message), MC (Standard+, US and Canada only, 1,600 chars), Twilio MMS $0.022 per message | OBSERVED. | HL/48001203458 ; https://mailchimp.com/help/about-sms-marketing/ ; https://www.twilio.com/en-us/sms/pricing/us |
| Link shortening and click tracking | HL Trigger Links (click logged on contact timeline, fires workflows, agency-wide API domain for branding; no per-location domain), HL Social Planner link shortener (separate) | OBSERVED. Carrier note: AT&T blocks public shorteners; T-Mobile accepts branded short URLs and prohibits rotating domains. | HL/48000981404 ; HL/48001240115 |
| 10DLC implications for marketing | All US senders on long codes | OBSERVED (Twilio): Brand plus Campaign registration; Standard use cases include marketing; opt-in, opt-out and help flows must be described; throughput by brand type (Sole Prop ~3,000 segments/day across carriers, Low Volume Standard ~6,000, Standard 2,000 to unlimited by Trust Score). Twilio's rejection reasons: missing opt-in, opt-in flow that does not let the user decline and still complete the primary action. | https://www.twilio.com/docs/messaging/compliance/a2p-10dlc ; https://www.twilio.com/docs/api/errors/30931 ; https://www.twilio.com/en-us/blog/insights/best-practices/improving-your-chances-of-a2p10dlc-registration-approval |
| 10DLC fees (as passed through by HL) | HL | OBSERVED: one-time Sole Proprietor $22.50, Low Volume Standard $22.50, High Volume Standard $64.00; additional campaign vetting $15; Fast Track $3 for approval within 3 business days; monthly per campaign: Sole Prop $2, Standard $10, Low Volume Mixed $1.50, Charity $3, Emergency $5. No HL markup. | HL/155000005200 |
| Per-message costs | Twilio/HL: $0.0083 per outbound SMS segment plus carrier fees (AT&T $0.0035, T-Mobile $0.0045, Verizon $0.005); MMS $0.022 plus $0.009 to $0.01 carrier. Square: 500 texts included on Plus then 3 cents; 2,500 on Premium then 1.5 cents. Keap: 500 included, tiers to 25,000 for $279/mo, overage $0.015. Fresha: $0.08 per marketing text. | OBSERVED. | https://www.twilio.com/en-us/sms/pricing/us ; HL/48001203458 ; https://squareup.com/us/en/software/marketing ; https://keap.com/pricing ; https://www.fresha.com/pricing |
| Segment math | HL doc | OBSERVED: GSM-7 160 chars per segment; UCS-2 (emoji) 70 chars, 67 when concatenated; hidden characters from copy-paste inflate segments. | HL/48001203458 |
| Reporting | HL (delivery errors, SMS restriction history, Messaging Ramp Progress Card, opt-out rate monitoring), Podium (response rate, CTR, unsubscribes), MC (rate limits and % delivered live) | OBSERVED. HL warns opt-out rates above the 0 to 1% norm trigger warnings or suspension. | HL/48001213941 ; https://www.podium.com/text-marketing/ ; https://mailchimp.com/help/about-sms-marketing/ |
| Prohibited content | HL/carriers | OBSERVED: alcohol, firearms, gambling, tobacco, adult content; filter evasion and snowshoeing prohibited. | HL/48001213941 |

---

## Part 3. Segmentation and smart lists

| Feature | Products that have it | Details | Source |
|---|---|---|---|
| Filter model | HL Smart Lists: Date, DND, String, Numeric filter classes (e.g. Last Appointment At, Last Email Opened Date, Email DND, SMS DND, Tags, Opportunity Pipeline, Engagement Score). Custom fields inherit a standard type's operators. | OBSERVED. | HL/155000007530 |
| Saved and dynamic lists | HL (Smart Lists saved in Contacts; Segments in Email Builder; Pre-Built Segments snapshotted), HubSpot (active vs static segments; Starter up to 1,200 of each), MC (segments up to 10 conditions), AC | OBSERVED. | HL/155000005485 ; https://www.hubspot.com/pricing/marketing ; https://mailchimp.com/help/all-the-segmenting-options/ |
| Engagement filters | HL (Last Email Clicked/Opened dates, Engagement Score, "Filter Contacts by Email Statistics", "Tag Contacts from Campaign Statistics"), MC (email engagement New/Rarely/Sometimes/Often, sent/opened/clicked, SMS interaction), HubSpot (marketing email events, form submissions, page views on Pro+) | OBSERVED. | HL/155000007530 ; HL/155000000330 ; https://mailchimp.com/help/all-the-segmenting-options/ ; https://knowledge.hubspot.com/lists/determine-your-list-criteria |
| Purchase filters | MC (e-commerce purchase activity, predicted LTV, churn risk, next order date), Square (purchasing habits groups), Fresha (new, returning, inactive), Jobber (city, past services, quotes) | OBSERVED. HL has payments as scoring events but no explicit purchase filter in the advanced-filters article. | https://mailchimp.com/help/all-the-segmenting-options/ ; https://squareup.com/us/en/software/marketing ; https://www.fresha.com/for-business/features ; https://getjobber.com/features/campaigns/ |
| Appointment filters | HL (Last Appointment At date filter) | OBSERVED. | HL/155000007530 |
| Lead scoring | HL Contact Engagement Score (rules: email events, tags, payments, replies, forms, orders, trigger link clicks, appointments; Draft vs Publish; global rules only; no decay; no history), AC (Pipelines add-on), Keap (lead scoring listed), HubSpot (tier unclear) | OBSERVED. | HL/155000001251 ; https://www.activecampaign.com/pricing ; https://keap.com/pricing |
| Tag-based segmentation | Keap (auto-tagging drives nurture), HL, MC, AC | OBSERVED. | https://keap.com/features/email-marketing |
| Predictive segmentation | MC (Standard+): predicted demographics, churn, LTV | OBSERVED. | https://mailchimp.com/pricing/marketing/ ; https://mailchimp.com/help/all-the-segmenting-options/ |
| Who exposes which filters (summary) | HL: field, tag, DND, date-activity, pipeline, score. MC: tags, fields, engagement, e-commerce, reviews, signup source, predictive. HubSpot: properties, memberships, events (ads, CTAs, forms, emails, SMS on Pro+). Square/Fresha/Jobber: a few preset groups. | OBSERVED per rows above. | as above |

---

## Part 4. Forms and surveys

| Feature | Products that have it | Details | Source |
|---|---|---|---|
| Builder | HL (Forms single-step, Surveys multi-slide, Quizzes; inline editing; mobile editor; themes; custom CSS; right sidebar), Typeform, Tally, HubSpot, Keap, AC, Carrd forms, Webflow forms | OBSERVED (HL) from folder listings. | https://help.gohighlevel.com/support/solutions/folders/48000665899 ; https://help.gohighlevel.com/support/solutions/folders/48000665898 |
| Field types | HL: text, number, monetary, score, date, dropdown single and multi, checkbox, radio, terms and conditions, file upload, signature, rating element, address autocomplete, payment and product elements, math calculations, "Other" option | OBSERVED (from conditional logic field list and folder titles). | HL/155000001314 ; HL/155000005509 ; HL/155000003739 |
| Conditional logic | HL (v2: Show/Hide, Jump To slide in surveys, Custom Message, Redirect URL, Disqualify; AND or OR per rule but not both; top-down evaluation), Typeform (Basic+), Tally (free) | OBSERVED. | HL/155000005564 ; HL/155000001314 ; https://www.typeform.com/pricing/ ; https://tally.so/pricing |
| Multi-step | HL Surveys (slides, One Question at a Time mode, progress bar on mobile, Save Progress, create contact on partial completion) | OBSERVED. | HL/155000005354 ; HL/155000004191 ; HL/155000008305 |
| File upload | HL (empty/filled conditions; accepted types and size set per element), Typeform (1 GB Basic to 4 GB Business), Tally (10 MB free, unlimited paid) | OBSERVED. | HL/155000005564 ; https://www.typeform.com/pricing/ ; https://tally.so/pricing |
| Hidden fields and UTM capture | HL (Source field hidden, `?source=` URL override; UTMs captured separately as attribution on submission), HubSpot (hidden fields from default, query string, page URL; utm_campaign capture), Tally (hidden fields from URL params incl. UTMs), Typeform (URL parameters) | OBSERVED. HL explicitly says Source is not attribution; use First/Latest Attribution and utm_source fields. | HL/155000001506 ; HL/48001219997 ; https://knowledge.hubspot.com/forms/pass-contact-property-values-with-hidden-form-fields ; https://tally.so/help/hidden-fields |
| Embed and share modes | HL: Inline, Popup, Sticky Sidebar, Polite Slide-In; triggers Show on Scroll %, Show After X seconds, Always; activation on Nth visit; deactivate after X shows or once lead collected; static embed code must be regenerated after changes | OBSERVED. Exit-intent not confirmed. | HL/155000004538 ; HL/155000004524 |
| Spam protection | HL (CAPTCHA custom field, email and phone validation, IP/geo signals, Cloudflare DDoS, SMS verification, SMS geo-permissions), MC (reCAPTCHA mandatory on signup forms), Typeform (reCAPTCHA on Talent tier) | OBSERVED. Honeypot not confirmed in HL. | HL/155000004650 ; HL/155000003195 ; https://mailchimp.com/help/about-double-opt-in/ ; https://www.typeform.com/pricing/ |
| Notifications | HL (email notifications per form, automated via workflow) | OBSERVED. | HL/155000001640 ; HL/155000001900 |
| Routing to pipelines and automations | HL (form submission is a workflow trigger and attribution event; disqualify blocks appointment creation and payment), HubSpot (form submission list criteria), Typeform (webhooks, Contacts and Automations add-on) | OBSERVED. | HL/155000001314 ; HL/48001219997 ; https://www.typeform.com/pricing/ |
| Quizzes and scoring | HL Quizzes (points per answer, categories, percentage or raw score, result pages by range, highest/lowest category personalization, map results to CRM custom fields), Typeform (scores and quizzes; logic/scoring forms with partial submissions need Growth), Tally (calculator) | OBSERVED. | HL/155000004750 ; HL/155000006913 ; https://www.typeform.com/pricing/ ; https://tally.so/pricing |
| NPS and CSAT surveys | Not confirmed as a dedicated feature in HL (Rating element exists; no NPS article). Birdeye Surveys (listed), Typeform (templates, INFERRED). | INFERRED. | HL/155000005509 ; https://birdeye.com/pricing/ |
| Consent checkboxes | HL (Terms and Conditions field with checked/not checked conditions; ActiveProspect consent tracking integration; "Enhanced Consent Checking for Voice AI Outbound Calling"), HubSpot (not fetched) | OBSERVED (HL). | HL/155000001314 ; HL/48001175529 ; HL/155000007166 |
| Payments in forms | HL (payment element, products, donations, order bumps, order upsell, skip card for $0), Typeform (Stripe), Tally (free), Carrd (Standard+) | OBSERVED. | HL/155000001884 ; HL/155000006914 ; https://carrd.com/pro |
| Analytics and submissions | HL (Analytics for Forms and Surveys, revamped submissions page, export to Google Sheets, submission documents), Typeform Business (drop-off rates) | OBSERVED. | HL/155000004181 ; HL/48000979917 ; https://www.typeform.com/pricing/ |
| Scheduling availability | HL (open and expiry dates with custom experiences) | OBSERVED by title. | HL/155000008711 |
| Pricing reference | Typeform Basic $39/mo 100 responses to Business $129/mo 10,000; Tally free unlimited forms and responses, Pro $24, Business $74 | OBSERVED. | https://www.typeform.com/pricing/ ; https://tally.so/pricing |

---

## Part 5. Funnels, landing pages and websites

| Feature | Products that have it | Details | Source |
|---|---|---|---|
| Page builder model | HL (sections, rows, columns, elements; same engine for funnels and websites; global sections; versions and restore; draft vs publish), Webflow (not confirmed, page did not render), Carrd (single-page sites, no element limit), Unbounce | OBSERVED (HL, Carrd). | HL/155000001633 ; https://carrd.com/pro |
| Templates | HL (blank or template; ClickFunnels import; funnel/website import), Carrd (premium and custom templates all plans), Unbounce (all plans) | OBSERVED. | HL/155000001633 ; HL/48000980322 ; https://carrd.com/pro ; https://unbounce.com/pricing/ |
| Domains and SSL | HL: root A record 162.159.140.166 or CNAME sites.ludicrous.cloud; SSL auto-provisioned; www 301 redirect; default page and 404 page; same domain can be used in multiple sub-accounts. Carrd custom domains on Standard+. Unbounce root domains per tier (1 to 10). Typeform custom domain Enterprise only. | OBSERVED. | HL/48001153720 ; https://carrd.com/pro ; https://unbounce.com/pricing/ ; https://www.typeform.com/pricing/ |
| SEO settings | HL (SEO meta data per page, custom meta tags, schema markup folder, blog canonical URLs and sitemap) | OBSERVED. | HL/48000980312 ; HL/48001073924 ; HL/155000002451 |
| Forms and order forms | HL (two-step order forms, payment plans, products with Stripe, order bumps, order upsell) | OBSERVED. | HL/48000980307 ; HL/48001180752 ; HL/155000006914 |
| Upsells | HL (Order Upsell in Forms; order bumps in forms and surveys) | OBSERVED by title and article. Funnel-level one-click upsell step not confirmed in fetched pages. | HL/155000006914 ; HL/155000005805 |
| A/B split testing | HL (Create Variation per step, traffic slider, dedicated URLs, Stats tab; requires a domain on the funnel; available on all plans; no auto winner), Unbounce (Experiment tier $149/mo and above; AI traffic routing "Smart Traffic" on Optimize after as few as 50 visits), Webflow Optimize (not confirmed) | OBSERVED. | HL/48001230918 ; https://unbounce.com/pricing/ ; https://unbounce.com/product/smart-traffic/ |
| Analytics | HL Funnel Stats: page views (all and unique), opt-ins and opt-in rate, sales count, sales rate, sales value, earnings per page view, per-step rows, custom date range; Sites > Analytics for all sites; GA4 pageview recording | OBSERVED. | HL/48001190447 ; HL/48001219725 |
| Blogs | HL (posts, authors, categories, search, RSS feed, canonical URLs, sitemap, scheduling, statuses, template library, import by URL, blog element in funnels, analytics) | OBSERVED by titles. | https://help.gohighlevel.com/support/solutions/folders/48000686613 |
| Chat widget | HL (SMS/live chat/WhatsApp/Voice AI/all-in-one widget; install on Squarespace, Duda, WordPress; business hours; visitor details pre-chat; attribution captured as a "Widget Form") | OBSERVED. | HL/48000984860 ; HL/155000004104 ; HL/48001175057 |
| Booking widget embed | HL (calendar embed; QR codes for calendars), Vagaro (booking widget included), Fresha (book via website, Google, social) | OBSERVED. | HL/155000009359 ; https://www.vagaro.com/pro/pricing ; https://www.fresha.com/for-business |
| Countdown timers | HL (fixed and recurring timers, in funnels and emails, synced, timezone adaptation, AI smart timer) | OBSERVED by titles. | HL/155000003113 ; HL/155000003114 ; HL/155000003102 |
| QR codes | HL (QR for calendars, services, rentals, websites that follow page changes, review page, vCards, business cards, app download, bulk creation, Apple and Google Wallet) | OBSERVED by titles. Tracking analytics not confirmed. | https://help.gohighlevel.com/support/solutions/folders/155000000787 |
| Link in bio | Not confirmed in HL help. Carrd is widely used for single-page link pages (INFERRED from product shape). | INFERRED. | https://help.gohighlevel.com/support/search/solutions?term=link+in+bio ; https://carrd.com/pro |
| Popups and triggers | HL (Show Popup on entering funnel; form popups with scroll and time triggers; minute timer to delay elements) | OBSERVED. | HL/48001150093 ; HL/155000004538 |
| Tracking code | HL (header/body/footer scripts, Facebook pixel, CAPI via workflows, GA4) | OBSERVED. | HL/48000980311 ; HL/48001204042 |
| Included website in vertical tools | Jobber (website and GBP optimization included on every plan), Thryv (AI website builder on Starter $99/mo), Vagaro MySite | OBSERVED. | https://getjobber.com/features/marketing-suite/ ; https://www.thryv.com/pricing/ ; https://www.vagaro.com/pro/pricing |
| What small businesses actually use these for | INFERRED from the vertical products: a single brochure site with booking widget, a review landing page or QR, promo landing page with a form and payment, seasonal offer pages, and lead magnets. The agency-style funnel stack (split tests, upsells) is used mainly by HL agencies. | INFERRED. | Vertical product pages cited above |
| Pricing reference | Carrd Pro Standard $19/yr for 10 sites; Unbounce Starter $29/mo 5 pages to Optimize $249/mo; Webflow not confirmed | OBSERVED. | https://carrd.com/pro ; https://unbounce.com/pricing/ |

---

## Part 6. Reputation and reviews

| Feature | Products that have it | Details | Source |
|---|---|---|---|
| Review request flows | HL (manual via Quick Actions or Reputation tab; automated via workflow "Send Review Request"; channels SMS, email, WhatsApp; queued and failed states; guided setup wizard; recurring emails with multiple templates; QR code for reviews), Podium (AI textable invites and reminders), Birdeye (Review Generation Agent picks timing and channel), Jobber (auto after visit, completed job or paid invoice), Fresha (auto after checkout by text, WhatsApp or email; loyalty points for reviews), Square (Google review requests in automations) | OBSERVED. Note Fresha's loyalty points for reviews may conflict with Google's incentive ban (INFERRED). | HL/48001222668 ; HL/155000004326 ; https://www.podium.com/reviews/ ; https://birdeye.com/reviews/ ; https://getjobber.com/features/reviews/ ; https://www.fresha.com/for-business/features/online-reputation ; https://squareup.com/us/en/software/marketing |
| Multiple review sites | HL (Google and Facebook native; 52 to 53 additional platforms by public review URL, e.g. Yelp, TripAdvisor, Trustpilot, BBB, Healthgrades, Zillow, Houzz, Avvo, OpenTable; unlimited pages per platform; Sources filter), Birdeye ("every site", count not stated), Podium (consolidated, sites not named), Fresha (Google and Fresha only) | OBSERVED. | HL/155000004584 ; https://birdeye.com/reviews/ |
| Request balancing | HL (percentage split between Google and Facebook, default 50/50, configurable) | OBSERVED. | HL/155000004137 |
| Response management | HL (reply from Conversations and Reputation tab; page name shown for multi-location), Podium (inbox), Birdeye, Jobber dashboard, Fresha inbox | OBSERVED. | HL/48001222899 ; https://getjobber.com/features/reviews/ |
| AI responses | HL Reviews AI (Suggestive: up to 4 free suggestions per review then $0.01 per regeneration; Auto-Pilot: one charge per sent reply, per-source and per-star-rating rules, footer, wait time), Birdeye Review Response Agent (auto-post or hold for approval), Podium AI Reputation Specialist, Jobber (AI suggestions), Fresha AI Concierge (paid add-on, auto-publish rules), Thryv (AI review management on Starter) | OBSERVED. HL pricing text is internally inconsistent (4 free vs 3 free). | HL/155000001074 ; https://birdeye.com/reviews/ ; https://www.podium.com/reviews/ ; https://www.fresha.com/for-business/features/online-reputation ; https://www.thryv.com/pricing/ |
| Review widgets | HL (Google and Facebook reviews; element in funnels and websites or copy-code embed; "Powered By" link known bad request bug), Birdeye Review Marketing Agent (branded graphics to social and web) | OBSERVED. Star filter not confirmed in HL article. | HL/48001222766 ; https://birdeye.com/reviews/ |
| Monitoring and alerts | HL (New Review Received workflow trigger with rating, source and spam filters; spam detection of reviews; email notifications), Jobber (notifies on new reviews), Birdeye (Ticketing Agent routing) | OBSERVED. | HL/155000003873 ; HL/155000004162 ; https://getjobber.com/features/reviews/ |
| Reporting | HL Reputation Overview: Invite Goals, Reviews Received, Avg Rating, Sentiment (LLM-classified; 4 to 5 stars positive, 3 neutral, 1 to 2 negative when no text), Invite Trends, Review Trends month over month, Latest Requests; Podium (total reviews, attribution), Birdeye (Reputation Score per location), Thryv (digital marketing score) | OBSERVED. | HL/48001222767 ; https://www.podium.com/reviews/ ; https://birdeye.com/reviews/ |
| Google Business Profile integration specifics | HL: verified GBP required, Google account with Owner or Manager role, reviews sync near real time, reply in-app, optional call tracking, Google Messaging deprecated July 2024, reconnect for missing permissions. Google API access for any vendor: manage a verified profile active 60+ days with a website, apply via contact form with Cloud project number from an owner/manager email, quota 0 QPM until approved then 300 QPM. | OBSERVED. | HL/48001222899 ; https://developers.google.com/my-business/content/prereqs |
| Review disputes and negative handling | HL (dispute a Google review and track status; negative review guidance) | OBSERVED by title. | HL/48001180761 ; HL/155000004569 |
| Review gating rules | Google: "Discourage or prohibit negative reviews, or selectively solicit positive reviews" is rating manipulation; no incentives (payment, discounts, free goods) for any review; do not pressure customers to review on premises; asking via link or QR is allowed. FTC 2024 rule: bans fake or AI-fabricated reviews, incentives conditioned on sentiment, undisclosed insider reviews, and suppression by threats or by claiming a review set is representative when negatives were suppressed; civil penalties for knowing violations. | OBSERVED. | https://support.google.com/contributionpolicy/answer/7400114 ; https://support.google.com/business/answer/3474122 ; https://www.ftc.gov/news-events/news/press-releases/2024/08/federal-trade-commission-announces-final-rule-banning-fake-reviews-testimonials |
| Video testimonials | HL (collect video testimonials, workflow trigger on receipt) | OBSERVED by title. | HL/155000007009 |
| Listings management | HL (Yext scan, listings add-ons, listing performance reports), Thryv (60+ directories), Birdeye Listings | OBSERVED. | HL/155000003219 ; https://www.thryv.com/pricing/ ; https://birdeye.com/pricing/ |
| GBP posts | HL (Updates, Offers, Events; 1,500 chars; one JPEG or PNG up to 5 MB; 100 posts per 24 h per token; AI Assist; approval option; multi-location) | OBSERVED. | HL/155000007212 |

---

## Part 7. Social posting

| Feature | Products that have it | Details | Source |
|---|---|---|---|
| Supported networks | HL: Facebook Pages (feed, reels, stories), Instagram (feed, reels, stories, collaborator posts), LinkedIn profiles and pages (incl. PDF carousels), Google Business Profile, TikTok personal and business, Pinterest, YouTube (videos and Shorts), Threads, Bluesky, Communities. Thryv: 5 profiles on Signature. Birdeye: "active accounts you connect", networks not named. Jobber: AI drafts social and Google posts. Square: Facebook promotions. | OBSERVED. X (Twitter) not covered in HL content guidelines. | https://help.gohighlevel.com/support/solutions/folders/48000684282 ; HL/48001210585 ; HL/155000004101 ; https://www.thryv.com/pricing/ ; https://birdeye.com/social/ |
| Scheduling | HL (calendar, recurring posts, Category Queue, Best Time to Post, bulk CSV basic and advanced, RSS URL auto-posting, customize per network, watermarks, image auto-optimise), Birdeye (self-filling calendar with per-location cadence) | OBSERVED. | HL/155000005514 ; HL/155000005654 ; HL/155000005542 ; https://birdeye.com/social/ |
| Approval | HL (assign approver; Awaiting review, Approved, Rejected; email notification template; external client approval via secure links), Birdeye (approve one by one, in bulk, or auto-publish; thresholds per location and post type), Jobber (approve, edit or skip AI drafts) | OBSERVED. | HL/48001229834 ; https://birdeye.com/social/ ; https://getjobber.com/features/marketing-suite/ |
| Content AI | HL (AI Assist text and images for GBP posts; Ask AI), Birdeye Publishing Agent (brand voice, avoids repeating recent posts), Thryv CaptionAI and ImageAI (25 included), Jobber AI drafts | OBSERVED. | HL/155000007212 ; https://birdeye.com/social/ ; https://www.thryv.com/pricing/ |
| Review to social | HL (automate review posts in Social Planner), Birdeye Review Marketing Agent | OBSERVED by title and page. | HL/155000001620 ; https://birdeye.com/reviews/ |
| Reporting | HL Advanced Analytics: followers, impressions, engagement by network (Facebook, Instagram, LinkedIn pages, YouTube, Pinterest, TikTok business, GBP, Threads, Bluesky with gaps); link clicks only for shortened links; weekly view only; no export yet. Birdeye: conversational Reporting Agent. | OBSERVED. | HL/155000004101 ; https://birdeye.com/social/ |
| Limits | HL per-network: Facebook 62,000 chars, 10 images, 200 posts/hour; Instagram 2,200 chars, 10 media, 25 posts/24 h via HL (Meta API currently states 100 API-published posts per 24 h); LinkedIn 3,000 chars, 200/24 h; GBP 1,500 chars, 100/24 h; TikTok 15/24 h; Pinterest 25 per 5 min; YouTube 25/24 h. | OBSERVED. HL and Meta figures differ for Instagram. | HL/48001210585 ; https://developers.facebook.com/docs/instagram-platform/content-publishing |
| Social listening and link shortener | HL | OBSERVED by title. | HL/155000006365 ; HL/155000005008 |

---

## Part 8. Attribution and reporting

| Feature | Products that have it | Details | Source |
|---|---|---|---|
| UTM capture | HL (captured on form, survey, calendar booking, chat widget and order form submissions; External Tracking for third-party forms incl. iframes), HubSpot (hidden fields and traffic sources), Tally and Typeform (hidden fields) | OBSERVED. | HL/48001219997 ; HL/155000009476 ; https://knowledge.hubspot.com/forms/pass-contact-property-values-with-hidden-form-fields |
| First and last touch | HL (First Attribution fixed, Latest Attribution updates), HubSpot (Original Source and drill-downs set by system and locked; Latest Source) | OBSERVED. | HL/48001219997 ; https://knowledge.hubspot.com/properties/hubspots-default-contact-properties |
| Source and medium classification | HL rules: gclid/wbraid/gbraid/msclkid = Paid Search; utm_source fb_ad, linkedin_ad, twitter_ad, reddit_ad or ctwa_clid = Paid Social; referrer domains = Social, Organic Search, Referral; none = Direct; inbound call/SMS/email = Others; manual = CRM UI; Zapier = Third-Party. Case-sensitive UTMs. | OBSERVED. | HL/48001219997 |
| Conversion events | HL (form, survey, booking, chat, order form; Google Ads offline conversion actions; Facebook CAPI from workflows), Unbounce (unlimited conversions), Typeform Business (conversion tracking) | OBSERVED. | HL/48001220947 ; https://help.gohighlevel.com/support/solutions/folders/155000001015 ; https://unbounce.com/pricing/ |
| Revenue attribution | HL (email revenue 5-day window; Lead Source Report by Opportunity Source with Open/Won/Lost/Abandoned counts and values), AC (revenue attribution on Pro+), Square (sales attributed to campaigns and coupon redemptions), Jobber (campaigns that bring jobs and revenue), MC (e-commerce revenue per campaign) | OBSERVED. HL Lead Source Report counts opportunities, not contacts, and uses Opportunity Source, with UTMs as filters only. | HL/155000001701 ; HL/155000009036 ; https://www.activecampaign.com/pricing ; https://squareup.com/us/en/software/marketing |
| Call tracking numbers | HL (number pools, minimum 4 numbers, dynamic number insertion via snippet, PPC-only or all-visitors mode, keyword capture from Google Ads, whisper, recording, Call Report with source and keyword; GBP call tracking toggle), Thryv (trackable phone numbers), CallRail (DNI, recording, AI transcripts, from $55) | OBSERVED. | HL/48000981393 ; HL/48001222899 ; https://www.thryv.com/pricing/ ; https://www.callrail.com/call-tracking |
| Facebook and Google Ads reporting integrations | HL (Facebook Ad Reporting needs Business Manager, pixel plus CAPI, UTM template with fb_ad and campaign_id; Google Ad Reporting; client spend entry; Ad Manager creates and reports on Meta, Google and LinkedIn ads with budget optimizer and public APIs), HubSpot Starter (ads management, 2 retargeting audiences) | OBSERVED. | HL/48001204042 ; HL/48001219312 ; https://help.gohighlevel.com/support/solutions/folders/155000000587 ; https://www.hubspot.com/pricing/marketing |
| Dashboards | HL (customizable widgets; Contacts and Opportunities widgets; Custom Metrics with Meta Ads and Google Analytics; GA widgets; Dashboard Summary AI; Geographic analytics; Appointment and Call reports), HubSpot Starter (30 dashboards x 50 reports), Thryv (marketing dashboard, GBP analytics, heatmaps on Signature) | OBSERVED. | HL/155000007817 ; HL/155000006814 ; https://www.hubspot.com/pricing/marketing ; https://www.thryv.com/pricing/ |
| Chat widget attribution | HL (source stored with first chat message; fails for some iOS and privacy-mode users because the cookie is blocked) | OBSERVED. | HL/48001175057 |
| Marketing audit reports | HL (automated marketing audit report grades, listings audit, workflow action) | OBSERVED by title. | HL/155000007392 |

---

## Part 9. Compliance

| Topic | Rule or platform behavior | Details | Source |
|---|---|---|---|
| CAN-SPAM (US email) | Regulator | No false headers; no deceptive subject lines; identify the message as an ad; valid physical postal address; clear opt-out in every message; honor opt-outs within 10 business days with no fee or extra data; opt-out must work 30 days after send; sender stays liable for vendors; penalties up to $53,088 per email; transactional messages exempt except header accuracy. | https://www.ftc.gov/business-guidance/resources/can-spam-act-compliance-guide-business |
| Gmail/Yahoo bulk sender rules | Mailbox providers | For 5,000+ messages/day: SPF and DKIM plus DMARC, aligned From domain, TLS, PTR records, spam rate under 0.30% (target 0.10%), one-click List-Unsubscribe (RFC 8058) plus visible link. | https://support.google.com/a/answer/81126 |
| TCPA (US calls and texts) | Regulator | Prior express written consent for marketing autodialed texts must be a signed (electronic ok) agreement naming the number and stating purchase is not conditioned on consent; solicitations only 8 a.m. to 9 p.m. local; revocation by any reasonable means including stop, quit, end, revoke, opt out, cancel, unsubscribe; honor within 10 business days. | https://www.law.cornell.edu/cfr/text/47/64.1200 |
| TCPA 2025 to 2026 changes | Regulator | April 11, 2025: reasonable-means revocation rule in force; the "revoke all" scope provision was waived to 2026 then 2027. October 2026 FCC order (FCC 26-67): senders may designate exclusive revocation methods (key-press, standard reply keywords, designated website or phone) if disclosed clearly on every message; marketing opt-outs still cover all marketing from the sender; 10 business days; keep records; effective 30 days after Federal Register publication. | https://www.dlapiper.com/en-us/insights/publications/2026/10/fcc-tcpa-rule ; https://www.wiley.law/alert-FCC-Grants-Limited-Waiver-for-Part-of-the-TCPA-Consent-Revocation-Rule |
| Carrier rules (10DLC) | Carriers and TCR | Registration of brand and campaign; opt-in, opt-out and help flows documented; marketing use case named on the opt-in; unchecked-by-default consent box; unregistered traffic incurs carrier fees and filtering. | https://www.twilio.com/docs/messaging/compliance/a2p-10dlc ; https://www.twilio.com/docs/api/errors/30931 |
| GDPR consent (EU) | Regulator | Consent must be demonstrable, clearly distinguishable, freely given, and as easy to withdraw as to give (Art. 7); clear affirmative act, no pre-ticked boxes, silence is not consent (Recital 32). ePrivacy/PECR soft opt-in details: not confirmed (ICO page returned 403). | https://gdpr-info.eu/art-7-gdpr/ ; https://gdpr-info.eu/recitals/no-32/ |
| CASL (Canada) | Regulator | Applies to commercial electronic messages; consent required before sending. Express vs implied consent durations, identification and 10-business-day unsubscribe specifics: not confirmed from a primary page (CRTC pages returned 403; ISED overview page lacked detail). | https://ised-isde.canada.ca/site/canada-anti-spam-legislation/en |
| Review solicitation law | Google and FTC | See Part 6: no gating, no incentives, no suppression, insider disclosure. | https://support.google.com/contributionpolicy/answer/7400114 ; FTC 2024 rule |
| Consent capture per channel (platform behavior) | HL: SMS consent must be collected by the sending sub-account; keyword replies are not blanket consent; email DND and SMS DND are separate flags; per-category email preferences. MC: records SMS consent timestamp; SMS double opt-in option; reCAPTCHA on forms. Podium: opt-in via web, in-store, email, QR. | OBSERVED. | HL/48001213941 ; HL/48001170758 ; HL/155000007291 ; https://mailchimp.com/help/about-sms-marketing/ |
| Double opt-in | MC (per audience; EU accounts may default on; email double opt-in only via MC forms; SMS double opt-in required for abandoned cart texts), HL (built as a workflow with a trigger link; no native toggle confirmed) | OBSERVED (MC); INFERRED (HL article body did not load, title only). | https://mailchimp.com/help/about-double-opt-in/ ; HL/48001162996 |
| Unsubscribe mechanics done automatically | HL: footer link on every LC Email, List-Unsubscribe header always on, STOP keywords set permanent DND, auto "Reply STOP" on first SMS and periodic re-insertion, unsubscribe feedback and resubscribe. MC: unsubscribe link and footer required; abuse reports auto-unsubscribe. Twilio: STOP keyword blocking at carrier/provider level. | OBSERVED. | HL/48001225534 ; HL/48001234940 ; HL/155000006771 ; HL/48001186075 ; https://mailchimp.com/help/about-email-campaign-reports/ |
| Data retention | HL says under GDPR the sender must stop processing and retaining data of contacts who opt out; no automatic deletion feature confirmed. Typeform Enterprise offers EU data center and HIPAA/GDPR terms. | OBSERVED (statements); automated retention policies not confirmed in any reference product. | HL/48001225534 ; https://www.typeform.com/pricing/ |
| Platform enforcement | HL: ramp-up daily SMS limits, 24-hour restriction when exceeded, suspensions driven by opt-out, bounce and error rates, forbidden categories. | OBSERVED. | HL/48001213941 |

---

## Part 10. Pain points users report (sourced)

| Pain point | Product | Evidence | Source |
|---|---|---|---|
| Emails landing in junk on shared LC Email infrastructure; forced subdomain; shared-IP reputation | HighLevel | Feature request with 669 votes, status "In progress"; HL Support's own post says "GHL support has no recommendations or solution". | https://ideas.gohighlevel.com/lcemailsystem/p/lc-emails-ending-up-in-junk |
| Large unmet demand in attribution and reporting | HighLevel | Ideas board totals: Ad Reporting and Attribution 3,821, Forms 1,039, Phone System 939, Funnels 889, Email Builder 638, Reporting 525, Social Planner 435. | https://ideas.gohighlevel.com/ |
| Support slow on urgent issues; trial and billing pressure; AI assistant gives wrong setup steps | HighLevel | Trustpilot 4.9 overall but 1-star reviews cite porting, "figure it out on your own" support, paywalled features. | https://www.trustpilot.com/review/gohighlevel.com |
| Social analytics weekly only, no export; metric gaps for Threads and Bluesky | HighLevel | Stated in the analytics article. | HL/155000004101 |
| Engagement score is global, no decay, no history | HighLevel | Stated limits. | HL/155000001251 |
| Smart Send works per location, not per contact; needs 1,000 sends in 60 days | HighLevel | Stated requirements. | HL/155000006628 |
| Email A/B not available for Batch or RSS sends; conditional elements limited to 4 field types | HighLevel | Stated limits. | HL/155000006670 ; HL/155000003903 |
| Review widget "Powered By" link returns Bad Request | HighLevel | Listed as a known issue. | HL/48001222766 |
| Chat attribution breaks on iOS and privacy mode | HighLevel | Stated. | HL/48001175057 |
| Contracts, auto-renewal, charges after cancellation, no leads | Thryv | Trustpilot 2.5/5 from 450 reviews; "No leads, no calls, no new customers, no revenue." | https://www.trustpilot.com/review/thryv.com |
| Mass auto-opt-outs, duplicate emails, price increases, hard cancellation | Keap | Trustpilot score 1.1 shown (distribution chart conflicts); "Keap's system auto-opted out ~700 of my ~800 subscribers." | https://www.trustpilot.com/review/keap.com |
| 90-day cancellation notice, surprise annual debits, listing data errors | Birdeye | Trustpilot 3.1/5 from 685 reviews; "Birdeye automatically debited $9,240.18 from our credit card." | https://www.trustpilot.com/review/birdeye.com |
| 12-month auto-renewals, high price, slow CSV uploads and failed bulk texts | Podium | Trustpilot 4.0 but 33% 1-star; "Once you cancel - you will have to hound them to stop charging you." | https://www.trustpilot.com/review/podium.com |
| STO rigidity (48 h lead time, 24 h window, no automations) | Mailchimp | Stated requirements. | https://mailchimp.com/help/use-send-time-optimization/ |
| Opaque pricing (quote only) | Birdeye, Podium, ActiveCampaign (no amounts shown) | Pricing pages show no numbers. | https://birdeye.com/pricing/ ; https://www.podium.com/pricing/ ; https://www.activecampaign.com/pricing |
| G2, Capterra, Software Advice, TrustRadius, ICO, CRTC, Twilio Help Center, Brevo, Webflow | Multiple | Pages returned 403, 404 or JS-only shells; those vendors' claims are marked not confirmed where no alternative page was found. | n/a |

---

## Part 11. What this tells us a template must have

Priority legend: TABLE STAKES (every reference product has it or regulators require it), EXPECTED (most products have it; users notice its absence), DIFFERENTIATOR (few products do it well).

### Provider prerequisites (must be wired before any marketing module works)

| Prerequisite | Why | Source |
|---|---|---|
| Email sending provider with a dedicated subdomain, SPF, DKIM, DMARC, TLS and List-Unsubscribe headers | Gmail bulk rules and HL's own refactoring of shared domains; the top HL complaint is junk placement on shared infrastructure | https://support.google.com/a/answer/81126 ; HL/48001226115 ; https://ideas.gohighlevel.com/lcemailsystem/p/lc-emails-ending-up-in-junk |
| Domain warmup schedule and Postmaster monitoring | HL fixed-stage model: 1,000/day to 250,000/day over 15 stages | HL/155000009082 |
| SMS provider with 10DLC brand and campaign registration (or toll-free verification), STOP/START keyword handling, segment-based billing | Carrier mandate; fees $22.50 to $64 one-time, $1.50 to $10 per campaign per month | https://www.twilio.com/docs/messaging/compliance/a2p-10dlc ; HL/155000005200 |
| Google Business Profile API access | Needs a verified profile active 60+ days with a website, owner/manager email, Cloud project, approval to 300 QPM | https://developers.google.com/my-business/content/prereqs |
| Meta Business integration (Pages, Instagram professional account, Ads, CAPI) | Needed for Facebook reviews, Instagram posting (100 API posts per 24 h), ad reporting | https://developers.facebook.com/docs/instagram-platform/content-publishing ; HL/48001204042 |

### Email

| Priority | Requirement | Source basis |
|---|---|---|
| TABLE STAKES | Drag and drop builder, templates, merge fields with fallbacks, campaign vs automation separation, schedule send, unsubscribe link auto-appended plus one-click header, physical address footer, per-campaign stats (sent, delivered, opens, clicks, bounces, unsubscribes, complaints) | Part 1 rows; CAN-SPAM; Gmail bulk rules |
| TABLE STAKES | Suppression of unsubscribed, bounced and complained contacts enforced at send time, with Email DND separate from SMS DND | HL/48001225534 ; HL/155000007530 |
| EXPECTED | Segment picker on send (dynamic, snapshot, tag), A/B on subject or content with auto winner (open or click), batch sending, resend to unopened, AI copy and subject help, dedicated domain wizard with DNS auto-config | HL/155000006670 ; HL/155000006660 |
| EXPECTED | Preference center with 3 to 5 topic categories and global unsubscribe; one-step vs confirm unsubscribe flows; resubscribe path | HL/155000007291 ; HL/155000006071 |
| EXPECTED | Revenue attribution per campaign with a configurable window (5 days default) | HL/155000001701 |
| DIFFERENTIATOR | Per-contact send-time optimization (reference products do location-level or need 48 h lead time), conditional content keyed on tags and any custom field type, saved block library, bot-click filtering of stats | HL/155000006628 ; https://mailchimp.com/help/use-send-time-optimization/ ; HL/155000002954 |

### SMS and MMS

| Priority | Requirement | Source basis |
|---|---|---|
| TABLE STAKES | Consent record per contact (source, timestamp, wording), STOP/START keyword processing, auto opt-out text on first message, quiet hours 8 a.m. to 9 p.m. recipient local time, segment counter with GSM-7 vs UCS-2 detection, 10DLC status visible before sending | TCPA CFR; HL/155000006771 ; HL/48001203458 |
| EXPECTED | Drip or batch throttling with time window and weekdays, MMS with size validation, branded short tracking links (never public shorteners), keyword opt-in flows that identify the business and disclose frequency and rates, opt-out rate monitoring with alerts above about 1% | HL/155000006472 ; HL/48001240115 ; HL/48001170758 ; HL/48001213941 |
| EXPECTED | Per-message cost estimate shown before send (segments x rate plus carrier fee) | HL/48001203458 |
| DIFFERENTIATOR | Designated-revocation disclosure management for the 2026 FCC rule, state-specific windows (e.g. Texas toggle), country quiet-hour tables, consent re-verification before resuming after STOP | https://www.dlapiper.com/en-us/insights/publications/2026/10/fcc-tcpa-rule ; HL/155000006771 ; https://mailchimp.com/help/about-sms-marketing/ |

### Segmentation

| Priority | Requirement | Source basis |
|---|---|---|
| TABLE STAKES | Saved dynamic lists over fields, tags, DND flags, dates (created, last activity, last appointment, last email open or click), pipeline stage; AND/OR groups | HL/155000007530 ; HL/155000005485 |
| EXPECTED | Purchase and appointment history filters, engagement buckets, exclusion filters (HL lacks these), snapshot vs live list choice | https://mailchimp.com/help/all-the-segmenting-options/ ; HL/155000005485 |
| DIFFERENTIATOR | Lead or engagement scoring with per-segment rules, decay and history (HL has none of the three) | HL/155000001251 |

### Forms and surveys

| Priority | Requirement | Source basis |
|---|---|---|
| TABLE STAKES | Field types including consent checkbox, file upload, signature, rating; required validation; CAPTCHA and email/phone validation; notifications; submission list and export; embed inline and popup; hidden source field plus UTM capture on submit | HL/155000001314 ; HL/155000004650 ; HL/155000004538 ; HL/48001219997 |
| EXPECTED | Conditional logic (show/hide, jump, redirect, disqualify) with AND/OR rules, multi-step with progress and partial-save, payments and order bumps, workflow trigger on submit | HL/155000005564 ; HL/155000008305 |
| DIFFERENTIATOR | Quiz scoring with categories and result pages mapped to CRM fields, NPS and CSAT templates with automatic follow-up (not confirmed anywhere as native in the all-in-one set), exit-intent trigger | HL/155000004750 |

### Funnels, pages and sites

| Priority | Requirement | Source basis |
|---|---|---|
| TABLE STAKES | Section/row/column/element builder, templates, custom domain with automatic SSL and www redirect, per-page SEO meta, tracking scripts, forms and booking widget embeds, per-page stats (views, uniques, opt-ins, sales) | HL/155000001633 ; HL/48001153720 ; HL/48001190447 |
| EXPECTED | Order forms with bumps and upsells, popups with scroll/time triggers, countdown timers, blog with RSS and sitemap, chat widget, QR code generator for review page and booking, draft/publish with version restore | HL/155000006914 ; HL folders cited in Part 5 |
| DIFFERENTIATOR | Split testing with automatic winner (HL has manual only; Unbounce charges $149/mo), link-in-bio page, dynamic text replacement from UTMs | HL/48001230918 ; https://unbounce.com/pricing/ |

### Reputation

| Priority | Requirement | Source basis |
|---|---|---|
| TABLE STAKES | Automated review request after a completed job, visit or payment by SMS and email; direct link to Google (no gating screen, no incentives); review inbox with reply; new-review notification; average rating and count dashboard | Part 6; Google policy; FTC rule |
| EXPECTED | Facebook plus URL-based monitoring of other sites, request balancing by percentage, review widget with embed code, AI reply suggestions with approval, review-received automation with rating filter, GBP posts | HL/155000004584 ; HL/155000004137 ; HL/155000001074 ; HL/155000003873 ; HL/155000007212 |
| DIFFERENTIATOR | Auto-pilot replies with per-source and per-star rules and wait time, sentiment classification, video testimonials, listings sync, dispute tracking | HL/155000001074 ; HL/48001222767 |

### Social

| Priority | Requirement | Source basis |
|---|---|---|
| TABLE STAKES | Facebook Page, Instagram, Google Business Profile posting with scheduling and per-network validation of limits | HL/48001210585 |
| EXPECTED | LinkedIn, TikTok, YouTube, Pinterest; approval flow with external client link; AI captions; recurring and category queues; weekly analytics | HL/48001229834 ; HL/155000005514 ; HL/155000004101 |
| DIFFERENTIATOR | Daily analytics with export, review-to-social automation, best-time suggestions, social listening | HL/155000004101 ; HL/155000001620 |

### Attribution and reporting

| Priority | Requirement | Source basis |
|---|---|---|
| TABLE STAKES | First and latest attribution on every contact from forms, bookings, chat and checkout; UTM and click-id capture; source classification (paid search, paid social, organic, referral, direct, offline); lead source report with counts and values | HL/48001219997 ; HL/155000009036 |
| EXPECTED | Campaign revenue attribution, Meta and Google Ads spend and lead reporting with CAPI and offline conversions, call tracking numbers with DNI, dashboards with custom metrics | HL/48001204042 ; HL/48000981393 ; HL/155000007817 |
| DIFFERENTIATOR | Multi-touch models, cross-channel ROI per campaign including SMS cost and ad spend, cookie-less fallback for iOS chat attribution | HL/48001175057 |

### Compliance gates (block sending until satisfied)

1. Email: verified sending domain with SPF, DKIM, DMARC; footer with address and unsubscribe; List-Unsubscribe header; 10-business-day opt-out processing; suppression list enforced. Sources: FTC CAN-SPAM guide; Google bulk sender page.
2. SMS: approved 10DLC campaign (or verified toll-free) linked to the number; consent record per recipient; STOP/START keywords; first-message opt-out text; quiet hours; prohibited-content check. Sources: Twilio 10DLC docs; TCPA CFR; HL messaging policy.
3. Reviews: no gating screens, no incentives, insider disclosure; GBP owner/manager connection. Sources: Google content policy; FTC 2024 rule; HL GBP integration.
4. EU and Canada contacts: affirmative consent capture with proof, easy withdrawal; CASL specifics still to be confirmed from a primary source.

### Not confirmed in this pass

- Brevo plan limits and STO/A/B gating (site is JS-rendered; help center search blocked).
- Webflow site plan limits and Optimize pricing (header overflow on fetch).
- Thryv Marketing Center campaign features beyond the pricing page (feature page 404; help center 403).
- ActiveCampaign conditional content rule details beyond tier gating (help center 403; relied on search snippets).
- Twilio opt-out keyword article and 10DLC fee article (help center returns an empty shell); fees taken from HL's pass-through page instead.
- CASL express vs implied consent durations and penalties (CRTC 403; ISED overview lacked specifics).
- PECR soft opt-in conditions (ICO 403).
- HL native double opt-in toggle (article body did not load), HL saved blocks, HL NPS template, HL link-in-bio, HL exit-intent trigger, HL funnel one-click upsell step, HL QR analytics.
- Vagaro per-text pricing and review features; Fresha WhatsApp blast price; Square text-marketing quiet hours and keyword rules; Podium and Birdeye plan prices; Jobber Marketing Suite email volume limits.
- G2, Capterra, Software Advice and TrustRadius review content (403); pain points rely on Trustpilot and HL's public ideas board.
