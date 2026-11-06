# 09. Conversations inbox and channels: how the all-in-one platforms build it, and the provider and compliance reality behind each channel

Research date: 2026-11-06. Scope: HighLevel Conversations, Podium Inbox, Birdeye Messaging (Inbox), Thryv Inbox (Command Center), Keap Business Line, HubSpot Conversations inbox, Front and Intercom (inbox design references), Jobber and Housecall Pro messaging, Fresha Client Connect and Mangomint two-way texting.

Method: 14 web searches plus roughly 95 direct fetches of official help centers, developer docs, provider pricing pages, regulator text and review sites. The shared web-search budget was exhausted part way through, so most of the compliance and provider material came from fetching known primary URLs directly. Every claim carries a source URL and a label:

- OBSERVED: stated on the cited page as fetched on the research date.
- INFERRED: a conclusion drawn from one or more observed facts; the reasoning is stated.
- not confirmed: I could not reach a primary source in this run. Treat as a to-do, not as fact.

Pages that failed to render or returned 403/404 are listed in Appendix B so nobody re-fetches them expecting different results.

---

## Part 1. Inbox features as users see them

Each feature lists which reference products have it, with the source. Where a product is not listed it means "not confirmed in this run", not "does not have it".

### 1.1 Conversation list, tabs and filters

| Capability | Products and sources |
|---|---|
| Unread tab or filter | HighLevel: "Mark as Read" and "Mark as Unread" bulk actions, a "New" divider at the first unread message, unread count updates in real time, archived threads return to the Unread tab on a new message (OBSERVED, https://help.gohighlevel.com/support/solutions/articles/155000006610-getting-started-with-the-new-conversations-experience). Jobber: conversations can be marked unread from More Actions; read status is shared across the account, "opening a message marks it read for everyone" (OBSERVED, https://help.getjobber.com/en/articles/two-way-text-messaging-in-the-jobber-app/). Housecall Pro: an unread toggle limits the view to unread messages; "Mark all as read" on web, Global Chat and mobile (OBSERVED, https://help.housecallpro.com/en/articles/5981299-messaging-within-your-housecall-pro-inbox). Birdeye: "Mark as unread" in the Actions drop-down, blue dot indicator (OBSERVED, https://support.birdeye.com/en/articles/12653992-how-do-i-manage-birdeye-inbox-conversations). |
| Assigned to me / Unassigned | HighLevel: Inbox Panel switches between "My Inbox", "Team Inbox" and "Internal Chat"; filter types "Assigned" and "Follower" with a "Logged In User" option (OBSERVED, https://help.gohighlevel.com/support/solutions/articles/48001222121-overview-of-conversation-filters). Front: "Assigned to me" section; items stay there "until you archive or snooze it" (OBSERVED, https://help.front.com/en/articles/2257). Intercom: "Unassigned" view where new conversations land unless a Workflow assigns them (OBSERVED, https://www.intercom.com/help/en/articles/6258745-the-help-desk-explained). HubSpot: "Owner" dropdown, triage of unassigned conversations (OBSERVED, https://knowledge.hubspot.com/inbox/collaborate-with-your-team-in-the-conversations-inbox). Birdeye: customer-started conversations are unassigned by default (OBSERVED, Birdeye manage-conversations article above). |
| Starred / flagged | HighLevel: "Starred" inbox tab, "Add Star" and "Remove Star" bulk actions, star icon in list and thread (OBSERVED, HighLevel filters article). Intercom: priority marking from the table view (OBSERVED, Intercom help desk article). No other reference product confirmed. |
| Filter by channel | HighLevel: "Last Message Channel" filter with SMS, Email, Calls, Voicemail, Live Chat, WhatsApp, Facebook, Instagram, GBP; AND/OR groups (OBSERVED, HighLevel filters article). Housecall Pro: Global Chat filters All Comms, Customers, Employees, AI Team, Job inbox (OBSERVED, HCP inbox article). Birdeye: custom "smart inbox" organizes interactions across channels; a smart inbox cannot be edited after creation and pre-existing ones cannot be deleted (OBSERVED, https://support.birdeye.com/en_US/birdeye-inbox/how-to-get-the-most-out-of-birdeye-inbox). |
| Saved views | HighLevel: "Conversation Views" are "saved sets of conversation filters", private by default, admins can share; filters include Assigned To, Followers, Mentions, last message direction, last outbound type (manual or automated), last message channel, tags, SLA; "No, there are no limits" on count (OBSERVED, https://gohighlevelassist.freshdesk.com/support/solutions/articles/155000007311-how-to-create-and-share-conversation-views). Note the older filters article says filters are session based and cannot be saved; the Views article supersedes it (INFERRED from the two pages). Intercom: "Inbox Views allow you to define a set of filters" that update in real time (OBSERVED, Intercom help desk article). |
| Sort options | HighLevel: Latest All Messages, Oldest All Messages, Latest Manual Messages, Oldest Manual Messages, Longest SLA Overdue, Next SLA Target (OBSERVED, HighLevel filters article). Intercom: table layout, sortable columns including "Snooze time" (OBSERVED). |
| Open / Closed status | Birdeye: "Open" and "Closed" tabs, "Close" and "Reopen" buttons, a customer message reopens a closed thread automatically (OBSERVED, Birdeye manage-conversations article). Fresha Client Connect: chats are Open or Closed, a new client message reopens (OBSERVED via search summary of https://www.fresha.com/help-center/knowledge-base/messaging/101841-manage-client-messages-in-client-connect; page body did not render on direct fetch). Intercom: filter by open, closed or snoozed; close from table or in bulk (OBSERVED). Front: "Open", "Later" (snoozed or waiting), "Done" (archived or resolved) (OBSERVED, Front sections article). |
| Archive | HighLevel: archived conversations leave Recents but stay under All, "Unarchive" restores, nothing is deleted (OBSERVED, HighLevel getting-started article). Housecall Pro: archive on web and mobile, "Archived chats unarchive when the customer messages again" (OBSERVED). Front: archive is the Done state (OBSERVED). |
| Snooze | Front: shared-inbox snooze applies to all teammates, personal-section snooze applies only to you; up to 34 custom snooze times; "If a recipient replies before your snooze expires, the conversation will reopen in your inbox, and automatically cancel the snooze" (OBSERVED, https://help.front.com/en/articles/2088). Intercom: snooze from table or keyboard; "Snooze time" column; a support engineer recommends snoozing after posting an internal note so the note does not reopen the thread, shortcut "z" (OBSERVED, https://community.intercom.com/inbox-9/snoozed-conversations-reopen-when-adding-a-note-8095). HubSpot: snooze was a long-standing community request opened 2021-11-01 and is marked "In Beta" and "Delivered" on 2026-06-12 (OBSERVED, https://community.hubspot.com/t/snooze-functionality/46258). Small-business suites (HighLevel, Podium, Birdeye, Jobber, HCP): snooze not confirmed. |
| Bulk actions | HighLevel: checkboxes with select-all; Mark as Read/Unread, Add/Remove Star, Delete ("Deleted conversations cannot be recovered") (OBSERVED). Podium: multi-select conversations and assign multiple users or user groups at once (OBSERVED via search summary of https://podium.my.site.com/knowledgebase/s/article/Managing-Conversations-in-Podium; the Salesforce page did not render on direct fetch). Intercom: bulk assign, close, and apply macros (OBSERVED). |
| Search | HighLevel: global search with Ctrl/Cmd+K plus a timeline filter search for message and activity types (OBSERVED). Intercom: search by keyword, tag, user, assignee, date range (OBSERVED). Pain point: Housecall Pro reviewer, "there's no way to properly search conversations by phone number or message content!" (OBSERVED, https://www.trustpilot.com/review/housecallpro.com, 2026-10-20). |

### 1.2 Threading model: per contact across channels vs per channel

- HighLevel: one timeline per contact that shows Email, SMS, WhatsApp, Facebook/Instagram and Internal Comments together; the composer has a channel selector to switch the channel for each reply; timeline filters narrow by type (OBSERVED, HighLevel getting-started article). INFERRED: HighLevel threads per contact, not per channel.
- Podium: "Linked Conversations" let you "see all conversations linked in one place" for "conversations over different channels with a contact" (OBSERVED, https://www.podium.com/whats-new/25-4). INFERRED: Podium's base unit is a per-channel conversation that is then linked, which is why linking had to be shipped as a feature.
- Thryv: "every message from each customer in a consolidated, chronological thread"; each connected account (each email login, each social page) is a separate "channel" with per-plan channel caps: Free 3, Plus 6, Professional unlimited (OBSERVED, https://www.thryv.com/faqs-2024/).
- Birdeye: webchat, text, email, voicemail, Google, Instagram and Facebook land in one inbox; staff can "switch between 'Text' and 'Email' modes at any point" inside a conversation (OBSERVED, https://support.birdeye.com/en_US/birdeye-inbox/how-to-get-the-most-out-of-birdeye-inbox and https://birdeye.helpjuice.com/birdeye-inbox/1205382-how-do-i-send-emails-via-birdeye-inbox).
- Housecall Pro: separate inboxes by audience (Customers, Employees, Community, Job inbox) with a "Global Chat" bubble aggregating them; job events, calls (with recordings if Voice is on) and reviews appear inside the customer thread (OBSERVED, HCP inbox article).
- Mangomint: "Manage all your conversations in one inbox"; automated texts and the staff replies share the client's thread (OBSERVED, https://www.mangomint.com/features/two-way-texting/; the launch blog says the Messages tab holds each client's full history including automated texts, https://www.mangomint.com/blog/two-way-texting).
- Keap: two separate inboxes, one for the Business Line and one for the text-marketing number; "Messages from Text Broadcasts or Easy Automations appear there" (OBSERVED via search summary of help.keap.com PDF exports; help.keap.com now 301-redirects to Thryv's help center, see Appendix B).

Design takeaway (INFERRED): the products users rate best for small teams thread per contact and let the agent pick the outbound channel per reply. Per-channel threads force a linking feature later.

### 1.3 Contact context panel

- HighLevel: Right Panel with tabs "Contact", "Activities", "Associations", "Documents", "Payments"; edit fields, custom fields, folders, tags, owner; create or view opportunities, appointments, invoices, payments; panel widths persist (OBSERVED, HighLevel getting-started article).
- Intercom: right sidebar apps "Recent conversations" (3, expandable to 20), "Similar conversations", duplicate detection with "Merge Lead into User" preview (OBSERVED).
- Housecall Pro: customer profile reachable from the thread; job activity feed inside the chat (OBSERVED).
- Birdeye: hover the eye icon to see who viewed the conversation; hover the link icon to see which page a webchat visitor started from (OBSERVED, Birdeye manage-conversations article).

### 1.4 Assignment, teams, routing

- Podium: "+ Assign" control at top right of a conversation; bulk assign users or user groups; "Auto-Assign (Round Robin) is available only to Inbox Pro users"; escalation rules exist (OBSERVED via search summary of https://podium.my.site.com/knowledgebase/s/article/Setting-Up-Auto-Assign-Escalation-Rules). Assigned user visible in the conversation list since May 2024 (OBSERVED, https://www.podium.com/whats-new/exciting-updates-to-inbox). "Intent Routing" categorizes conversations automatically (OBSERVED, https://www.podium.com/product/inbox).
- Birdeye: "Assign to" dropdown picks a team or user and can attach a note; assignee gets an email or push notification; Enterprise accounts create teams by location or skill (OBSERVED, Birdeye manage-conversations article and https://birdeye.helpjuice.com/team-chat/1205070-how-do-i-manage-teams-within-my-birdeye-account). Conversations can be transferred to other locations (OBSERVED, https://birdeye.helpjuice.com/en_US/birdeye-inbox/1205261-how-do-i-transfer-conversations-to-other-locations-within-birdeye).
- HubSpot: "Automatically assign conversations" per channel; assign to "Customer agent" (AI), "Specific users and teams", or "Contact owner"; "Assign to available users only" default; routing requires a Sales or Service seat; multiple inboxes need Professional or Enterprise (OBSERVED, https://knowledge.hubspot.com/inbox/set-up-the-conversations-inbox). Moving a conversation to another inbox also needs Professional or Enterprise (OBSERVED, HubSpot collaborate article).
- HighLevel: "Assigned" is the primary owner, "Follower" is a user added for visibility (OBSERVED, filters article).
- Intercom: assign to teammates or teams, keyboard "A"; March 2026 change lets unsnoozed conversations route to an available teammate (OBSERVED via search summary of Intercom changelog; not re-fetched).
- Housecall Pro: technicians are auto-added to a customer chat when assigned to that customer's job and removed when the job completes; permission toggle "Allow user to chat with customers" (OBSERVED, HCP inbox article).
- Jobber: only admins and users with the two-way text permission see the message center; permission is set on the web, not in the app (OBSERVED, Jobber app article).
- Mangomint: "Choose which staff members can make phone calls and reply to messages" (OBSERVED, Mangomint feature page).

### 1.5 Internal notes and mentions

- HighLevel: "Internal Comment" is a channel in the composer; comments are "never sent to or visible by the contact"; "cannot be edited or deleted" once posted; attachments not supported; @mention notifies per the user's preferences; Quick Filters "Mentions of Me" and "Mentions of a Specific User"; a workflow action "Add Internal Comment" and a public API endpoint exist (OBSERVED, https://help.gohighlevel.com/support/solutions/articles/155000003877-conversations-adding-internal-comments-and-mentioning-users and https://help.gohighlevel.com/support/solutions/articles/155000008456-workflow-actions-add-internal-comment).
- HubSpot: Comment tab in the reply editor, "This comment will not be visible to the contact", @mention sends a notification with a link, comments can be deleted (OBSERVED, HubSpot collaborate article).
- Front: "Mentions" section; @all notifies only teammates with access to that inbox (OBSERVED, https://help.front.com/t/k924vw and sections article).
- Intercom: notes; April 2026 added editing of posted notes behind a "Can edit notes" permission (OBSERVED via search summary of Intercom changelog).
- Podium: notes with "hover over the note to delete it"; mobile push when mentioned in a note (OBSERVED, Podium 25.4); API "Create Conversation Notes" (OBSERVED, https://docs.podium.com/changelog/new-endpoints-create-conversation-notes-writeback-leads-list-all-conversations-and-attachments-in-the-message-object).
- Birdeye: "Internal note" shown in red (OBSERVED). Housecall Pro: internal notes highlighted yellow, @mentions require the person to already be in the channel, emoji reactions on internal items only (OBSERVED). Mangomint: notes "your clients never see inside conversation threads" with "@mention staff members" (OBSERVED, feature page).

### 1.6 Snippets, templates, merge fields

- Podium: templates created, saved and shared per team; "Type a colon (:) when composing a message, template, or bulk message to see available variables" (OBSERVED, Podium May 2024 update and https://www.podium.com.au/article/inbox-faqs).
- HighLevel: "Snippets" are referenced as a related feature; existing "canned responses", templates and signatures carry over to the new composer (OBSERVED, filters and getting-started articles). Merge field syntax not confirmed in this run.
- Intercom macros: bundle reply text with actions (tag, assign, snooze, close); insert with "\" or "#"; actions "run automatically and are recorded in the conversation timeline"; on Facebook, WhatsApp and Instagram "images and GIFs are removed, links appear in parentheses, and formatting is stripped" (OBSERVED, https://www.intercom.com/help/en/articles/6584504-using-macros-in-the-inbox).
- Birdeye: "predefined templates" (OBSERVED). Keap: templates usable from the web Business Line view (OBSERVED via search summary). Mangomint: "Using Quick Replies" article exists in the help index (OBSERVED, https://www.mangomint.com/learn/help-articles/two-way-texting; body not fetched).

### 1.7 Scheduled send and bulk messaging

- Podium: scheduled messages, team view of all scheduled messages, deleting another user's scheduled message leaves a note in the conversation; bulk messaging with CSV upload; "Only users in your locations will see your bulk message sends, drafts and scheduled messages" (OBSERVED, Podium May 2024 update and 25.4). Pain point: "Bulk messaging takes forever to upload a csv and then occasionally fails to send the message with no indication as to why" (OBSERVED, https://www.trustpilot.com/review/podium.com, 2026-06-10).
- Twilio-level scheduling exists as an add-on ("Messaging Engagement Suite", $0.015 per message, first 1,000 free monthly) (OBSERVED, https://www.twilio.com/en-us/messaging/channels/whatsapp/pricing).
- HighLevel scheduled send from the composer: not confirmed in this run. Keap: Text Broadcasts go to a separate marketing-number inbox (OBSERVED via search summary).

### 1.8 Read, delivery and failure status

- Fresha Client Connect: one tick sent, two ticks delivered, white ticks read (OBSERVED via search summary of Fresha help; body did not render).
- Jobber: text delivery "can't be tracked as opened" in the communications report (OBSERVED, https://help.getjobber.com/en/articles/client-communications-report/).
- Podium: "Failed message handling" (find failed messages, see why, fix, dashboard report) announced as coming soon in May 2024 (OBSERVED).
- HighLevel: a failed missed-call text-back attempt is logged in the contact's conversation with the reason (OBSERVED, missed call article).
- Birdeye: eye icon shows who on the team viewed a conversation (OBSERVED).
- INFERRED: SMS "read" is not available from carriers; only sent, delivered, undelivered and failed states exist. WhatsApp and Messenger expose read receipts; email read tracking is pixel based and unreliable.

### 1.9 Mobile app and push

- Jobber: push notifications show the client's name and message text; previews honor device settings; admins toggle "Client message" notifications (OBSERVED, Jobber app article).
- Housecall Pro: employees in a thread receive push for customer replies; desktop notifications in Chrome; chat notifications can be turned off (OBSERVED).
- Birdeye: mobile app can assign, add notes and change status; push notifications (OBSERVED, https://support.birdeye.com/en/articles/12653929-how-do-i-manage-inbox-conversations-within-birdeye-mobile-app).
- Podium: mobile app with shared inbox and mobile push on @mention (OBSERVED). Intercom: mobile shows mentions but has "No read/unread filter or ability to sort by mentions"; macros on mobile insert content only, not actions (OBSERVED, https://www.intercom.com/help/en/articles/447-respond-to-users-and-visitors-on-the-go and macros article). Thryv: "respond to emails, SMSs, calls and social media messages all from one platform" in the app (OBSERVED, Thryv FAQ). Mangomint: calls through the mobile app (OBSERVED). HighLevel: Conversation AI usable in the LeadConnector mobile app (OBSERVED via search, https://help.gohighlevel.com/support/solutions/articles/155000002669).

### 1.10 AI reply suggestions, auto replies, after-hours

- HighLevel Conversation AI: three modes Off, Suggestive, Auto-Pilot. Suggestive generates reply options a user reviews, edits and sends. Auto-Pilot "is enabled by default for all Conversation AI bots", works across all connected channels, quoted on the page as "SMS, Facebook Messenger, Instagram, WhatsApp, and more", per-bot cap "Maximum messages a Bot can send in a Conversation" from 1 to 100, bot sleeps at the cap and resumes when a human marks the conversation Read or a workflow updates bot status; every generated message counts toward the Conversation AI quota (OBSERVED, https://help.gohighlevel.com/support/solutions/articles/155000008094-auto-pilot-mode-in-conversation-ai-for-efficient-communication and https://gohighlevelassist.freshdesk.com/support/solutions/articles/155000007994-conversations-ai-suggestive-mode). Per-message price conflicting between third-party sources ($0.02 vs $0.05): not confirmed.
- Podium: "AI Employee", "Instantly respond, using your business's context", "After Hours Responder" to "handle conversations after your team logs off" (OBSERVED, https://www.podium.com/product/inbox). Webchat visitors can "explicitly opt in to marketing texts after starting a Webchat conversation" (OBSERVED, 25.4).
- Birdeye: chatbot "Robin" answers basic questions (OBSERVED). HubSpot: "Customer agent" AI as an assignment target (OBSERVED). Housecall Pro: "AI Team" filter in Global Chat (OBSERVED). Keap: business-hours auto replies not confirmed.

### 1.11 Missed call text back, voicemail drops, call recording, transcription, dialer

- HighLevel missed call text back: Settings > Phone System > Voice > "Voicemail & Missed Call Text Back"; ring timeout slider with 10 to 20 seconds suggested; sender selection tries the dialed number if SMS-capable, then a number previously used with that contact, then the default outbound number, then any eligible number; "count toward your phone messaging usage limits"; every missed call triggers a text (dedupe via workflow wait step); DND contacts are skipped; no text if no number is A2P or toll-free verified; SMS only, a separate "Missed Call WhatsApp Back" exists (OBSERVED, https://help.gohighlevel.com/support/solutions/articles/48001239140-where-and-how-to-configure-the-missed-call-text-back-feature and https://gohighlevelassist.freshdesk.com/support/solutions/articles/155000002417-missed-call-whatsapp-back-overview-setup).
- Mangomint "Automated Follow-Up": "Let callers know you got their message right away with an automated text follow up"; call recordings and transcripts; live call indicators on desktop; Phone add-on "$70/mo" per line (OBSERVED, Mangomint feature page).
- HighLevel: call cards include "View Transcript" shown in the Message History Panel (OBSERVED). Housecall Pro: calls with recordings appear in the feed when Voice is enabled; "Call Customer" populates the dialer with VoIP (OBSERVED). Thryv: voicemails "automatically transcribed"; each user gets a Business Service Line; Free includes 60 minutes, Plus/Professional add 100 minutes for $5; "Users cannot use their own number" (OBSERVED, Thryv FAQ). Birdeye: "Start a video chat" action; voicemail is an inbox channel (OBSERVED).
- Voicemail drops: not confirmed for any reference product in this run.
- Jobber: the dedicated number is "meant for text messages only"; calls forward to the company phone or play an automated message (OBSERVED, Jobber FAQ).

### 1.12 Numbers: shared vs personal, pools, porting

- Jobber: one dedicated number per account, "Once selected, dedicated phone numbers cannot be changed", area code availability varies (OBSERVED, Jobber FAQ). Housecall Pro: "a custom, randomly generated phone number within the area code you choose", cannot be swapped later, calls forward to the business number (OBSERVED, https://help.housecallpro.com/en/articles/887351-texting-number). Mangomint: keep your phone number or set up a new one (page wording, with the dash removed), and porting articles exist (OBSERVED). Thryv: new Thryv number only (OBSERVED). HighLevel: multiple numbers per location with a default outbound and "Selecting SMS To and From Numbers" (OBSERVED, filters and missed call articles). Keap Business Line: US and Canada only (OBSERVED via search summary).
- Number pools for throughput: not a feature of any reference product as far as confirmed. Twilio's A2P model instead raises per-brand throughput with Trust Score (OBSERVED, Part 2.1).

### 1.13 DND, opt-out per channel, consent capture, spam and blocking

- HighLevel: DND and "communication preferences" are honored by missed call text back (OBSERVED). "DND for Phishing and Spam emails" is a 25-vote idea, which implies no built-in email spam quarantine (OBSERVED, https://ideas.gohighlevel.com/conversations; INFERRED).
- Housecall Pro: block numbers; "Do Not Service" flag (OBSERVED). Fresha: block a client from messaging from their profile (OBSERVED via search summary). Front: Spam and Trash sections (OBSERVED).
- Podium webchat captures an explicit marketing-text opt-in (OBSERVED, 25.4). Jobber registration collects EIN for corporations, none for sole proprietors (OBSERVED, Jobber FAQ). Housecall Pro registration requires legal name, address and EIN "exactly as it is displayed in your EIN" letter (CP-575) and a public website with description, service area, services and contact info; "Any inaccuracy will result in registration failure with Twilio" (OBSERVED, HCP texting-number article). INFERRED: Housecall Pro and Jobber both run on Twilio-style 10DLC ISV flows; HCP names Twilio directly.

### 1.14 Internal team chat alongside the inbox

HighLevel "Internal Chat" tab (OBSERVED), Housecall Pro "Employees" channel (OBSERVED), Thryv "TeamChat" (OBSERVED). INFERRED: small-business suites bundle staff chat into the same surface; help-desk tools (Front, Intercom) do not.

---

## Part 2. Per channel: technical and compliance reality

### 2.1 SMS and MMS in the United States

Registration regime (A2P 10DLC)
- "US carriers treat all messages sent from a Twilio number as application-to-person traffic"; anyone sending SMS/MMS from a 10-digit long code to the US must register, including individuals; toll-free and short codes are outside 10DLC (OBSERVED, https://www.twilio.com/docs/messaging/compliance/a2p-10dlc).
- Brand types: Sole Proprietor (no EIN, one campaign, one number), Low-Volume Standard and Standard (EIN required, up to five brands per EIN, up to five campaigns per brand without extra justification) (OBSERVED, same page).
- Campaign use case types: Standard, Low-Volume Mixed (under 2,000 segments per day on T-Mobile, lower fee), Special (non-profit, emergency and similar) (OBSERVED, same page).
- Daily caps (segments): Sole Proprietor 1,000 on T-Mobile and roughly 3,000 across US carriers; Low-Volume Standard up to 2,000 on T-Mobile and roughly 6,000 across carriers; Standard "From 2,000 and up to unlimited" by Trust Score (OBSERVED, same page). Per-carrier TPM tables: the Twilio help article is JavaScript only and did not render; not confirmed.
- Who registers: brands cannot register directly with TCR; "Before you register please make sure you are a CSP (Campaign Service Provider)"; the CSP registers the brand and campaign, gets a Campaign ID and passes it to the connectivity partner (OBSERVED, https://www.campaignregistry.com/). INFERRED: a platform builder is either a CSP itself or, far more commonly, uses an aggregator's ISV program.
- ISV path on Twilio: one Primary Customer Profile for the ISV, a Secondary Customer Profile plus Brand per customer, a Campaign per use case, subaccount per customer is the "preferred architecture"; "Each Brand comes with its own Brand registration fee"; registration is automatable through APIs; restructuring resets opt-out lists so export them first (OBSERVED, https://www.twilio.com/docs/messaging/compliance/a2p-10dlc/onboarding-isv).
- Fees: Twilio's pricing page says only that 10DLC "is subject to registration onboarding fees" and points to a help article that did not render (OBSERVED, https://www.twilio.com/en-us/sms/pricing/us). Sinch lists a $1.00 one-time setup and $1.00 monthly per 10DLC number plus "carrier fees apply" (OBSERVED, https://sinch.com/pricing/sms/). Exact TCR brand, vetting and monthly campaign fee amounts: not confirmed in this run. Budget a one-time brand fee, an optional vetting fee, and a monthly campaign fee that differs between Standard and Low-Volume, and verify the numbers on the aggregator's current fee page before quoting a client.
- Approval time: not stated on any fetched primary page; Housecall Pro tells customers registration "is under review" with no timeframe and to call support (OBSERVED, HCP texting-number article). Bandwidth's glossary gives "Expected Time to Market: 1 Week" for 10DLC in its comparison table (OBSERVED, https://www.bandwidth.com/glossary/10dlc/). Pain point: a HighLevel reviewer, "I think we are going to finally get through the A2P compliance approval" (OBSERVED, https://www.trustpilot.com/review/gohighlevel.com, 2026-11-05).

Toll-free verification
- Toll-free numbers must be verified before sending; verification needs an approved Business Profile, business name, website, use case summary, "a sample message", "Link to an image that shows the opt-in workflow", estimated monthly volume; "Twilio reviews TFV requests within three business days"; rejected numbers "can't use it to send messages"; approved numbers send "with minimal traffic filtering"; edits allowed for seven days after submission (OBSERVED, https://www.twilio.com/docs/messaging/compliance/toll-free).
- INFERRED: toll-free is the fastest compliant path for a brand-new client with a website because there is no TCR brand or campaign; the trade-off is a non-local number.

Short codes
- Twilio leased random short code $1,000 per month, vanity $1,500 per month, bring-your-own vanity $500 per month, billed quarterly plus one-time setup; MMS enablement $500 one time (OBSERVED, Twilio US SMS pricing). INFERRED: not for a per-client small-business template; relevant only for the platform's own high-volume traffic.

Per-message costs (US, per segment)
- Twilio: $0.0083 outbound and inbound SMS on long code, toll-free and short code; MMS $0.022 out; failed message fee $0.001; carrier pass-through on long code AT&T $0.0035 out, T-Mobile $0.0045 out and $0.0025 in, Verizon $0.005 out and $0.007 in, US Cellular $0.005 out (OBSERVED, https://www.twilio.com/en-us/sms/pricing/us, "current as of October 2026").
- Telnyx: $0.004 outbound and inbound SMS local, $0.0055 toll-free, $0.007 short code, plus carrier fees; numbers $1.00 per month (OBSERVED, https://telnyx.com/pricing/messaging).
- Bandwidth: 10DLC SMS $0.004, toll-free $0.007, short code $0.008; MMS 10DLC $0.015; "Full product pricing available on request" (OBSERVED, https://www.bandwidth.com/pricing/).
- Plivo: SMS $0.0077 long code, $0.0079 toll-free; MMS $0.018 and $0.020; long code $0.50 per month, toll-free $1.00 per month; same carrier surcharge table as Twilio (OBSERVED, https://www.plivo.com/sms/pricing/us/).
- Sinch: SMS $0.0078 10DLC and toll-free, $0.009 short code; MMS $0.02; 10DLC number $1.00 per month, toll-free $2.00 per month (OBSERVED, https://sinch.com/pricing/sms/).
- INFERRED: all-in cost for a typical outbound long-code SMS segment is about $0.012 to $0.013 on Twilio or Plivo and about $0.008 to $0.009 on Telnyx or Bandwidth once carrier fees are added.

Consent, opt-out, HELP (TCPA, carrier policy)
- TCPA rule text: telephone solicitations only between 8 a.m. and 9 p.m. "local time at the called party's location" (47 CFR 64.1200(c)(1)); prior express written consent requires a signed agreement that clearly authorizes marketing, lists the number, and is not a condition of purchase ((f)(9)); consumers may revoke "using any reasonable method", replies of "stop," "quit," "end," "revoke," "opt out," "cancel," or "unsubscribe" are valid, and requests "must be honored within a reasonable time not to exceed ten business days" ((a)(10)); revocation by other channels creates a rebuttable presumption ((a)(11)); company-specific do-not-call entries must be kept "for 5 years" ((d)(6)) (OBSERVED, https://www.law.cornell.edu/cfr/text/47/64.1200).
- Status of the FCC one-to-one consent rule and April 2025 revocation effective dates: fcc.gov returned 403; not confirmed in this run.
- Carrier-side policy (Twilio Messaging Policy, which mirrors CTIA principles): informational messages need "prior express consent", promotional messages need "prior express written consent"; consent is "for each message subject" and cannot be bought, sold or transferred; keep "proof of all consents"; first message must include "Reply STOP to unsubscribe" or equivalent; standard keywords STOPALL, UNSUBSCRIBE, OPTOUT, CANCEL, END, REVOKE, QUIT; opt-out must be "a single step"; one confirmation message allowed, then "any subsequent messages are prohibited"; snowshoeing, misspelling to evade filters, P2P use and phishing simulations prohibited (OBSERVED, https://www.twilio.com/en-us/legal/messaging-policy).
- CTIA Messaging Principles and Best Practices (May 2023 PDF) was downloaded but could not be text-extracted in this environment; HELP response wording, SHAFT content list and shared public URL shortener prohibition: not confirmed from the primary document in this run (URL: https://api.ctia.org/wp-content/uploads/2023/05/230523-CTIA-Messaging-Principles-and-Best-Practices-FINAL.pdf).
- Other best practice statements on Twilio country guidelines: "SMS campaigns should support HELP/STOP messages, and similar messages, in the end-user's local language"; "Only communicate during an end-user's daytime hours unless it is urgent"; do not contact do-not-call registrants (OBSERVED, https://www.twilio.com/en-us/guidelines/ca/sms and others).

Carrier filtering and deliverability
- "Registration results in lower message filtering and higher throughput"; unregistered traffic incurs additional carrier fees (OBSERVED, Twilio A2P overview). Jobber: "If your number is not registered, it will lead to a heightened risk of text message delivery failure" (OBSERVED, Jobber FAQ). Canada: "Canadian mobile carriers enforce strict filtering on A2P messages" (OBSERVED, Twilio CA guidelines).

MMS limits
- Jobber: "Messages can contain up to 10 images and 1600 characters, as long as the entire message is under 5MB"; receiving MMS "is not supported in Great Britain" (OBSERVED, Jobber FAQ).

### 2.2 SMS outside the US

- United Kingdom: dynamic alphanumeric sender IDs supported without pre-registration except protected IDs; avoid generic IDs "like SMS, TEXT, InfoSMS, INFO, Verify, Notify"; BT blocks brand-related sender IDs by default until allowlisted; two-way SMS supported; short codes take 8 to 12 weeks; cannabis content prohibited, CBD allowed; UK landlines may be converted to voice by some carriers (OBSERVED, https://www.twilio.com/en-us/guidelines/gb/sms). INFERRED: for UK two-way you need a UK long code or short code; an alphanumeric sender is one-way.
- Canada: alphanumeric sender IDs "Not Supported"; toll-free "Requires Verification"; "Twilio recommends sending application-to-person (A2P) traffic over short codes or verified toll-free numbers"; short codes 12 to 16 weeks and messages over 160 characters are not delivered on short codes (OBSERVED, https://www.twilio.com/en-us/guidelines/ca/sms). CASL consent specifics: not confirmed from a primary source in this run.
- Germany (EU example): dynamic alphanumeric sender IDs supported with no provisioning time; domestic long codes supported but sender ID not preserved; two-way supported; short codes 6 to 8 weeks; "You cannot send SMS to a landline destination number" (OBSERVED, https://www.twilio.com/en-us/guidelines/de/sms). GDPR specifics are not on the Twilio page; consent and record keeping fall under GDPR and the ePrivacy rules (INFERRED, not confirmed from a regulator page in this run).
- Israel: domestic pre-registered alphanumeric sender IDs about one week to provision; dynamic alphanumeric supported; short codes not supported; "International traffic submitted over local long codes is actively blocked by the operators"; using a local non-real number as sender "will most probably result in SMS rejection"; gambling, politics, drugs and adult content prohibited for alphanumeric senders; MMS converted to SMS with a URL; SMS to landline fails with error 21614 (OBSERVED, https://www.twilio.com/en-us/guidelines/il/sms). Israel's anti-spam law (Communications Law Amendment 40, "Spam Law") specifics: not confirmed from a primary source in this run.
- Jobber ships two-way text only in the US, Canada and UK (OBSERVED). Thryv: "SMS is not available in New Zealand" (OBSERVED).

### 2.3 WhatsApp Business Platform

Access model
- Cloud API sends via Graph API and receives via webhooks; "Business phone numbers can send up to 80 messages per second by default, with capacity upgrades available" (OBSERVED, https://developers.facebook.com/docs/whatsapp/cloud-api/overview). BSP vs direct Tech Provider distinction: not confirmed from the fetched page.
- Business verification is required for apps that need Advanced Access or that act for other businesses; only a Business Admin can complete it; documents list lives in the Business Help Center (OBSERVED, https://developers.facebook.com/docs/development/release/business-verification).
- Messaging limits: new portfolios start at 250 business-initiated conversations per 24 hours; tiers 250, 2,000, 10,000, 100,000, unlimited; to reach 2,000 either verify the business, have a partner verify it, or send 2,000 delivered template messages in 30 days with high quality; above 2,000 it scales automatically "within 6 hours" when quality is high and at least half the limit was used in 7 days (OBSERVED, https://developers.facebook.com/docs/whatsapp/messaging-limits).

Customer service window and templates
- "When a WhatsApp user messages you or calls you, a 24-hour timer called a customer service window starts"; it resets on each new inbound; inside it any free-form "service message" is allowed; "When the window closes, you can only send pre-approved template messages" (OBSERVED, https://developers.facebook.com/docs/whatsapp/cloud-api/guides/send-messages).
- Template categories: authentication, marketing, utility; "Templates are automatically reviewed upon creation or after editing"; review "can take up to 24 hours"; statuses include Active - Low Quality, Paused ("recurring negative feedback from customers, or low read-rates") and Disabled (OBSERVED, https://developers.facebook.com/docs/whatsapp/message-templates/guidelines).
- Opt-in: required for business-initiated messages; "It is up to businesses to determine the method of opt-in"; it "can be general and not specifically for WhatsApp" if local law allows; must name the business and state that the user is opting in; recommended separate opt-ins per category and clear opt-out instructions; low quality leads to rate limiting (OBSERVED, https://developers.facebook.com/docs/whatsapp/overview/getting-opt-in).

Pricing timeline (this moved several times; build billing as data, not constants)
- 2024-11-01: service conversations became free. 2025-07-01: "Conversation-based pricing is deprecated. It was replaced with per-message pricing"; utility messages inside an open window became free; volume tiers for utility and authentication introduced. 2025-10-01: tiering webhooks. 2026-07-01: new "Meta Business Agent" message category at $2.00 per million tokens. 2026-10-01: Meta "resumed charging, on a per-message basis, for messages that were previously free", meaning service messages and in-window utility messages; "Each business phone number has one free tier of 1,000 delivered service messages per month"; unused free messages do not roll over; messages inside a Click-to-WhatsApp free entry point window (up to 7 days) stay free except Meta Business Agent; inbound is never charged; non-profits and governments keep free service messages through 2027-12-31 (OBSERVED, https://developers.facebook.com/docs/whatsapp/pricing and https://developers.facebook.com/docs/whatsapp/pricing/updates-to-pricing).
- Through Twilio: $0.005 Twilio fee per message in or out plus Meta pass-through, with US examples of $0.0034 for utility, authentication and service messages; WhatsApp calling $0.005 per minute plus Meta $0.0121 per minute outbound US (OBSERVED, https://www.twilio.com/en-us/messaging/channels/whatsapp/pricing, "current as of September 2026").
- Through 360dialog: €49, €99 or €500 per number per month with "no markup on Meta fees"; Partner Platform from €250 per month plus €49 per channel (5 included) (OBSERVED, https://www.360dialog.com/pricing).
- HubSpot requires Marketing Hub or Service Hub Professional or Enterprise for WhatsApp (OBSERVED, https://knowledge.hubspot.com/inbox/connect-channels-to-the-conversations-inbox). Fresha notes "WhatsApp charges businesses like Fresha for access to its WhatsApp Business API" and tries WhatsApp first then SMS for waitlist updates (OBSERVED via search summary of https://www.fresha.com/help-center/knowledge-base/calendar/169-send-waitlist-updates).

Unofficial APIs
- Whapi.Cloud: "Connect any existing WhatsApp number instantly by scanning a QR code"; "The API works through a linked-device session"; $29 per month per number, no per-message fee; sandbox capped at 150 messages per day; "In some cases, WhatsApp may still reset linked sessions and require re-authorization"; "Any automation can carry a risk of WhatsApp restrictions" (OBSERVED, https://whapi.cloud/).
- Evolution API: open source (Apache 2.0 per the foundation page), supports both "WhatsApp API - Baileys", a free "API based on WhatsApp Web", and the official "WhatsApp Cloud API" (OBSERVED, https://docs.evolutionfoundation.com.br/evolution-api/index.md and https://docs.evolutionfoundation.com.br/).
- WhatsApp's position: unofficial apps are "developed by third parties without WhatsApp's approval", using them or linking your account to them violates the Terms, and the account "might also be temporarily or permanently banned" (OBSERVED, https://faq.whatsapp.com/1217634902127718). "Our products are not intended for bulk or automated messaging"; WhatsApp bans "based on machine-learning classifiers" and may pursue legal action (OBSERVED, https://faq.whatsapp.com/5957850900902049).
- INFERRED: a QR-linked (Baileys style) channel is acceptable only as a client's own-risk, clearly labeled option for low-volume conversational use, never for marketing blasts, and never as the default for a template sold to many clients. The Cloud API through Meta directly or a no-markup BSP is the default.

### 2.4 Email

Sending reputation and authentication
- Gmail, all senders since 2024-02-01: SPF or DKIM, valid PTR, TLS, RFC 5322 formatting, spam rate under 0.10% and never at or above 0.30%. Bulk senders (5,000 or more per day to Gmail): SPF and DKIM, DMARC (p=none accepted), From domain aligned with SPF or DKIM, "Marketing messages and subscribed messages must support one-click unsubscribe" via List-Unsubscribe and List-Unsubscribe-Post headers plus a visible link (OBSERVED, https://support.google.com/a/answer/81126).
- Outlook.com consumer domains, senders over 5,000 per day, effective 2025-05-05: SPF "Must Pass", DKIM "Must Pass", DMARC "At least p=none and align with either SPF or DKIM"; non-compliant mail first routed to Junk, later rejected with "550; 5.7.515"; safe-sender lists do not bypass it (OBSERVED, https://techcommunity.microsoft.com/blog/microsoftdefenderforoffice365blog/strengthening-email-ecosystem-outlook%E2%80%99s-new-requirements-for-high%E2%80%90volume-senders/4399730).
- CAN-SPAM: accurate headers, truthful subject, identify ads, "Your message must include your valid physical postal address", clear opt-out, "must honor a recipient's opt-out request within 10 business days", responsibility cannot be contracted away, penalties "up to $53,088" per email (OBSERVED, https://www.ftc.gov/business-guidance/resources/can-spam-act-compliance-guide-business).
- Transactional vs marketing separation: Postmark runs Broadcast on "dedicated infrastructure so transactional delivery stays fast and reliable" and recommends a separate subdomain with its own DKIM and Return-Path for broadcasts, warming a new stream with the most engaged recipients (OBSERVED, https://postmarkapp.com/support/article/1207-how-to-create-and-send-through-message-streams).
- INFERRED: a template must give each client a dedicated sending subdomain (for example mail.clientdomain.com) with SPF, DKIM and DMARC, separate transactional and marketing streams, and bounce and complaint webhooks that suppress addresses automatically.

Two-way sync and threading
- Gmail API push: Cloud Pub/Sub topic, users.watch, "You must call the watch method at least once every 7 days or you'll stop receiving updates", recommended daily renewal, history.list from the stored historyId, one notification per second per user cap, occasional drops so poll as a fallback (OBSERVED, https://developers.google.com/workspace/gmail/api/guides/push).
- Gmail threading: replies join a thread only when "The Subject headers match" and "The References and In-Reply-To headers follow the" RFC 2822 standard (OBSERVED, https://developers.google.com/workspace/gmail/api/guides/sending).
- Microsoft Graph: Outlook message subscriptions last at most "10,080 minutes (under seven days)", or 1,440 minutes for rich notifications with resource data; "A maximum of 1,000 active subscriptions per mailbox"; average latency under a minute, maximum three minutes; lifecycle notifications warn before expiry (OBSERVED, https://learn.microsoft.com/en-us/graph/change-notifications-overview).
- RFC 5322 3.6.4: every message "SHOULD have a Message-ID", which "MUST be a globally unique identifier"; In-Reply-To carries the parent's Message-ID; References carries the parent's References plus its Message-ID and "may be used to identify a thread" (OBSERVED, https://www.rfc-editor.org/rfc/rfc5322#section-3.6.4).
- Product evidence that this is hard: HighLevel's top two Conversations ideas are "2-way Gmail Sync and Outlook sync: Allow us to exclude domains and contacts from syncing" (236 votes, planned) and "Ignore internal emails in Conversations" (101 votes, planned), plus "True Shared Mailbox Support with Real-Time Inbound Email Sync" (17 votes) (OBSERVED, https://ideas.gohighlevel.com/conversations). Thryv imports "the past 90 days" of connected email (OBSERVED, Thryv FAQ). Front's "Individual inbox" is a connected personal mailbox, unshared unless delegated or @mentioned; drafts do not sync with Gmail or Office 365 (OBSERVED, Front sections article).
- INFERRED: store Message-ID, In-Reply-To and References on every email; match inbound to a conversation by References first, then by contact and subject; let the client exclude internal domains from sync on day one.

### 2.5 Facebook Messenger and Instagram DMs

- Standard messaging window: "For most user actions, it lasts 24 hours"; up to 7 days after a Click-to-Messenger or Click-to-Direct ad; promotional content allowed inside the window; outside it only message tags for approved use cases, Sponsored Messages (Messenger only) and One-Time Notification (Messenger only, token expires within 1 year); the Human Agent tag "allows businesses to manually respond to user messages within a separate 7-day period"; misuse of tags "may result in restrictions on your ability to send messages" (OBSERVED, https://developers.facebook.com/docs/messenger-platform/policy/policy-overview). The individual tag list (CONFIRMED_EVENT_UPDATE, POST_PURCHASE_UPDATE, ACCOUNT_UPDATE, HUMAN_AGENT) and their approval requirements: the tags reference page did not render; not confirmed in this run.
- Instagram messaging: permissions instagram_business_basic and instagram_business_manage_messages; Advanced Access needed to serve accounts you do not own; app can message only after the user messages first; webhooks for messages, messaging_optins, messaging_postbacks, messaging_reactions, messaging_referrals, messaging_seen; text up to 1000 bytes, images 8MB, audio/video/files 25MB, up to ten attachments; "Group messaging is not supported"; Requests-folder messages inactive 30 days are not returned (OBSERVED, https://developers.facebook.com/docs/instagram-platform/instagram-api-with-instagram-login/messaging-api).
- App review: the app "must submit it to Meta for review and approval" before general availability; the linked Page must be published; webhook must return 200 within 20 seconds; subscribe to messaging_policy_enforcement (OBSERVED, https://developers.facebook.com/docs/messenger-platform/app-review). Business verification is a prerequisite for Advanced Access (OBSERVED, business verification page).
- Product side: HubSpot needs an Admin role on the Facebook Page to connect it, available on all plans (OBSERVED, HubSpot connect-channels article). HighLevel Auto-Pilot covers Facebook and Instagram (OBSERVED). Intercom strips formatting and images for Facebook, WhatsApp and Instagram macros (OBSERVED).
- INFERRED: the platform needs its own Meta app with Advanced Access for pages_messaging and the Instagram permissions, and must enforce the 24-hour and 7-day windows in the composer (disable free-form send and show why).

### 2.6 Google Business Messages

- The former Business Messages developer site now serves an "RCS for Business" landing page with no Business Messages content (OBSERVED, https://developers.google.com/business-communications/business-messages). The current Google Business Profile help article describes chat as a link: businesses add a "WhatsApp" click-to-chat URL or a "Text message" phone number under Edit profile > Contact > Chat; if both are set "only the text message option will be shown to customers"; "Chat options are currently available for select regions" (OBSERVED, https://support.google.com/business/answer/15013580).
- INFERRED: Google-hosted Business Messages is gone and was replaced by a deep link to the business's own SMS number or WhatsApp. The exact shutdown date (reported as July 2024) was not confirmed from a primary Google page in this run. HighLevel still lists "GBP" as a channel filter; that now refers to Google review conversations and, per the getting-started article, Google review threads show the GBP page name (OBSERVED). Thryv marketing still names "Google's Business Messages" on some pages (OBSERVED via search), which is stale (INFERRED).
- Template implication: "Google chat" for a client means pointing the GBP chat link at the client's verified SMS number or WhatsApp number, both of which must already be compliant.

### 2.7 Web chat widgets

- Three patterns in the reference set: live chat into the inbox (Birdeye webchat routes to departments and lands "together with messages from Google, social, text, email"; visitor page shown in the thread; OBSERVED), SMS-first chat (Podium webchat asks for the visitor's number and offers an explicit marketing text opt-in; OBSERVED, 25.4), and AI chat (Birdeye "Robin", Podium "AI Employee", HighLevel Conversation AI; OBSERVED). HubSpot chat channel adds chatflows to pages on all plans (OBSERVED).
- INFERRED: SMS-first chat moves the conversation onto a channel the business can follow up on later, but it immediately triggers 10DLC consent language and quiet-hours rules; the opt-in checkbox Podium added is the compliance artifact.

### 2.8 Voice

- Numbers and rates (Twilio US): local number $1.15 per month, toll-free $2.15; outbound $0.0140 per minute, inbound local $0.0085, inbound toll-free $0.0220; recording $0.0025 per minute, storage $0.0005 per minute per month, transcription $0.05 per minute (OBSERVED, https://www.twilio.com/en-us/voice/pricing/us). Bandwidth local outbound $0.0100, inbound $0.0055 (OBSERVED).
- Porting: Twilio's porting API covers "US non-toll-free phone numbers (up to 1,000 numbers per request)", generates an electronic LOA the authorized person signs within 30 days, requires a utility bill, can be rejected by the losing carrier, and numbers must meet "all messaging and voice compliance requirements" before use (OBSERVED, https://www.twilio.com/docs/phone-numbers/porting). Pain points: "a toll-free number had been stuck in porting for months" (HighLevel, Trustpilot), "We have now been without an operating business phone number for over two months!!" (Housecall Pro, Trustpilot 2026-10-12) (OBSERVED).
- Missed call detection: with TwiML Dial, set an action URL and read DialCallStatus; "no-answer", "busy", "failed" and "canceled" mean the forwarded call was not answered; default timeout 30 seconds, minimum 5, maximum 600, with a 5-second buffer (OBSERVED, https://www.twilio.com/docs/voice/twiml/dial). HighLevel suggests a 10 to 20 second ring timeout before text-back (OBSERVED).
- Recording consent: federal law makes one-party consent "the minimum requirement"; all-party consent states listed by RCFP are California, Delaware, Florida, Illinois, Maryland, Massachusetts, Michigan, Montana, New Hampshire, Pennsylvania and Washington, with Connecticut and Nevada requiring all-party consent for phone calls specifically (OBSERVED, https://www.rcfp.org/introduction-to-reporters-recording-guide/). INFERRED: a template should play a recording disclosure on every recorded call rather than maintain a state lookup, since the called party's location is unknown.
- Transcription providers: Deepgram Nova-3 streaming $0.0077 per minute, pre-recorded $0.0043 per minute, $200 free credit (OBSERVED, https://deepgram.com/pricing). AssemblyAI async $0.15 to $0.21 per hour, streaming $0.15 to $0.45 per hour billed on session time, $50 free credit (OBSERVED, https://www.assemblyai.com/pricing). Twilio built-in transcription $0.05 per minute (OBSERVED). INFERRED: dedicated STT is 5 to 10 times cheaper than Twilio's built-in transcription.
- IVR: not a feature confirmed in the small-business reference products; Thryv provides a per-user Business Service Line, Mangomint a $70 per line Phone add-on with recordings and transcripts, Housecall Pro a VoIP dialer and Podium desk-phone assignment (OBSERVED, cited above).

---

## Part 3. Providers a builder would use

| Provider | What it offers | Rough pricing (OBSERVED unless noted) | Registration burden | Constraints |
|---|---|---|---|---|
| Twilio | SMS/MMS, voice, WhatsApp, email via SendGrid, Trust Hub for 10DLC and toll-free, ISV onboarding APIs | SMS $0.0083 per segment plus carrier fees; MMS $0.022; local number $1.15, toll-free $2.15; voice $0.014 out, $0.0085 in; recording $0.0025 per minute; WhatsApp $0.005 per message plus Meta (Twilio pricing pages above) | Highest documentation quality for 10DLC; ISV model with secondary customer profiles per client (OBSERVED, ISV guide) | Most expensive base rate in the set; fee amounts for 10DLC live on a JS-only help page |
| Telnyx | SMS/MMS, voice, numbers, 10DLC as "its own primitive" | SMS $0.004 local plus carrier fee; toll-free $0.0055; numbers $1.00 per month (https://telnyx.com/pricing/messaging) | 10DLC registration via Telnyx portal or API; fee page not fetched | Volume discounts start at 100M messages |
| Bandwidth | Carrier-owned network; SMS, MMS, voice | SMS 10DLC $0.004, toll-free $0.007, short code $0.008; MMS $0.015; voice $0.0100 out, $0.0055 in (https://www.bandwidth.com/pricing/) | "Full product pricing available on request" (OBSERVED); INFERRED: sales-led, better for platform scale than for a first client | No self-serve number pricing on the page |
| Sinch | SMS, MMS, voice, RCS, WhatsApp | SMS $0.0078 10DLC and toll-free, $0.009 short code; MMS $0.02; 10DLC number $1.00 per month plus $1.00 setup; toll-free $2.00 (https://sinch.com/pricing/sms/) | 10DLC "carrier fees apply" with details in an FAQ not fetched | Short code "500 random or 1000 vanity per month" |
| Vonage | SMS, voice, WhatsApp | Pricing page returned 403; not confirmed | not confirmed | not confirmed |
| Plivo | SMS/MMS, voice | SMS $0.0077 long code, $0.0079 toll-free; MMS $0.018 and $0.020; long code $0.50 per month, toll-free $1.00 (https://www.plivo.com/sms/pricing/us/) | 10DLC docs page returned 404 in this run | Cheapest number rental in the set |
| Resend | Transactional email API, inbound email on all plans | Free 3,000 per month (100 per day); Pro $20 for 50,000; Scale $90 for 100,000; dedicated IP $30 per month on Scale over 3,000 per day; 30-day retention (https://resend.com/pricing) | Domain DNS only | Inbound counts against quota |
| Postmark | Transactional and Broadcast message streams, inbound | Free 100 per month; Basic $15, Pro $16.50, Platform $18 for 10,000 minimum; dedicated IP from $50 at 300,000 or more per month; inbound on Pro and up (https://postmarkapp.com/pricing) | Domain DNS; strict content review for marketing streams (INFERRED from stream separation) | No tier between 100 and 10,000 |
| SendGrid | Email API, marketing, inbound parse | Pricing page redirect loop between sendgrid.com and twilio.com; not confirmed | not confirmed | not confirmed |
| Mailgun | Email API, inbound routes, validation | Free 100 per day; Basic $15 for 10,000; Foundation $35 for 50,000; Scale $90 for 100,000; extra dedicated IP $59 per month (https://www.mailgun.com/pricing/) | Domain DNS | Log retention 1 to 30 days by plan |
| Amazon SES | Lowest-cost email, inbound | $0.10 per 1,000 outbound and inbound; dedicated IP $24.95 per month or managed $15 per account plus $0.08 per 1,000; VDM $0.07 per 1,000 (https://aws.amazon.com/ses/pricing/) | Production access request, domain DNS; no built-in suppression UI beyond the account-level list (INFERRED) | You build bounce and complaint handling from SNS events |
| Meta Cloud API (direct) | WhatsApp hosted by Meta | Meta per-message rates only; 1,000 free service messages per number per month since 2026-10-01; 80 messages per second default | Meta business verification, display name, template approvals | Messaging limit starts at 250 per 24 hours |
| 360dialog | WhatsApp BSP, "no markup on Meta fees" | €49 to €500 per number per month; Partner Platform from €250 plus €49 per channel (https://www.360dialog.com/pricing) | Partner handles onboarding and can verify the client (OBSERVED, Meta messaging limits page) | Per-number fee dominates for tiny clients |
| Twilio WhatsApp | WhatsApp via Twilio's messaging API | $0.005 per message plus Meta pass-through | Twilio Senders onboarding | Adds Twilio fee to every message including inbound |
| Whapi.Cloud | Unofficial QR-linked WhatsApp API | $29 per month per number, no per-message fee | None, which is the problem | ToS violation, ban risk, session resets (OBSERVED and INFERRED, Part 2.3) |
| Evolution API | Open source, Baileys or official Cloud API | Self-hosted | Depends on mode | Baileys mode carries the same ban risk |
| Retell | AI voice agents | voice infra $0.055 per minute plus TTS $0.015 plus LLM (for example GPT 5 mini $0.008) plus telephony $0.015; calculator example $0.11 per minute; numbers $2 per month; 20 concurrent included; $10 free credit (https://www.retellai.com/pricing) | None beyond telephony compliance | Billing includes silence and hold time |
| Vapi | AI voice orchestration with pass-through providers | $0.05 per minute hosting on pay-as-you-go plus Deepgram about $0.01, LLM $0.008 to $0.045, ElevenLabs $0.015 to $0.024; Twilio telephony $0.008 in and $0.014 out; 4 concurrent on the base tier, extra $10 per line; example $82 to $129 per 1,000 minutes (https://vapi.ai/pricing) | None | Pro plan $999 minimum per month |
| Bland | Bundled AI voice | Start $0.14 per minute all-in, 10 concurrent, 100 calls per day; Build $0.12 per minute plus $299 per month, 50 concurrent (https://www.bland.ai/pricing) | None | Daily and hourly call caps on lower tiers |
| Deepgram | STT | Nova-3 streaming $0.0077 per minute; pre-recorded $0.0043; $200 free | None | Diarization extra for streaming |
| AssemblyAI | STT | async $0.15 to $0.21 per hour; streaming $0.15 to $0.45 per hour; $50 free | None | Streaming billed on open session time |

Provider recommendation (INFERRED from the above): Twilio or Telnyx for SMS and voice (Twilio for documentation and ISV tooling, Telnyx for cost), Meta Cloud API directly or 360dialog for WhatsApp, Postmark or Resend for transactional plus a separate marketing stream (or SES if the team will build suppression handling), Deepgram for transcription, Retell or Vapi for AI voice. Keep provider adapters behind one interface so a client can be moved.

---

## Part 4. Pain points users report about these inboxes

All OBSERVED on the cited pages; review content is user-authored and unverified by the review sites.

- Email sync noise in HighLevel: top ideas are excluding domains and contacts from Gmail/Outlook two-way sync (236 votes) and ignoring internal emails (101 votes); also "DND for Phishing and Spam emails" (25) and "True Shared Mailbox Support with Real-Time Inbound Email Sync" (17) (https://ideas.gohighlevel.com/conversations).
- A2P and porting delays: HighLevel reviewers thank support for getting them "through the A2P compliance approval" while another reports a toll-free port stuck for months with a CSR mismatch (https://www.trustpilot.com/review/gohighlevel.com, Nov 2026). Housecall Pro: "We have now been without an operating business phone number for over two months!!" (https://www.trustpilot.com/review/housecallpro.com, 2026-10-12).
- Delivery and duplication: Podium, "text messages have been duplicated, delayed, or sent and received multiple times at inappropriate hours" (2026-10-15) and bulk CSV sends that fail "with no indication as to why" (2026-06-10) (https://www.trustpilot.com/review/podium.com).
- Search and organization: Housecall Pro, "there's no way to properly search conversations by phone number or message content!" (2026-10-20) and duplicate conversation threads (https://www.trustpilot.com/review/housecallpro.com).
- Messages look like spam to clients: Thryv, "our clients have questioned whether communications from our system are spam" (2026-10-21) (https://www.trustpilot.com/review/thryv.com).
- Snooze and notes: HubSpot users waited from 2021 to June 2026 for snooze (https://community.hubspot.com/t/snooze-functionality/46258); Intercom users found that notes appeared to reopen conversations and were told to snooze with "z" as the workaround (https://community.intercom.com/inbox-9/snoozed-conversations-reopen-when-adding-a-note-8095).
- Mobile parity: Intercom mobile has "No read/unread filter or ability to sort by mentions" and macros without actions (Intercom help); Jobber permission for two-way text can only be set on the web (Jobber help).
- Hard-coded number choices: Jobber and Housecall Pro numbers "cannot be changed" once picked (help articles). Thryv customers "cannot use their own number" (Thryv FAQ).
- Read-state semantics: Jobber's read state is account-wide, so one person opening a text marks it read for everyone (Jobber help). INFERRED: teams then rely on "mark unread" as a to-do flag, which is why that feature appears in product updates (https://productupdates.getjobber.com/6373-keep-your-client-communications-organized-by-filtering-unread-messages).
- Repeated missed-call texts: HighLevel sends a text on every missed call unless a workflow adds a wait step (missed call article).
- Pricing and contracts dominate the review sites for Podium, Birdeye and Thryv (auto-renewals, 90-day notice windows, paywalled features), which is adjacent to inbox quality: features such as round-robin assignment are gated to "Inbox Pro" at Podium and routing to paid seats at HubSpot (OBSERVED, cited above).
- Reddit and Capterra could not be fetched in this run; G2 was not attempted. Pain points from those sources: not confirmed.

---

## Part 5. What this tells us a template must have

Priority tiers: table stakes (clients will churn without it), expected (sales demos assume it), differentiator (few reference products do it well). Compliance prerequisites are the gates that must be green before the channel is switched on for a client.

### 5.1 Inbox core (channel independent)

1. Table stakes: one conversation per contact with a mixed-channel timeline and a per-reply channel selector (HighLevel model). Store every message with channel, direction, provider message id, status, and the raw provider payload.
2. Table stakes: list tabs or filters for Unread, Assigned to me, Unassigned, All, plus filter by channel, tag, owner, last message direction, and date; real-time counts. Shared read state plus a per-conversation "mark unread" flag (Jobber lesson).
3. Table stakes: assignment to a user or team, followers, a visible assignee in the list, and a permission that decides who can message customers at all.
4. Table stakes: internal comments with @mentions rendered inside the thread, never sent to the contact, recorded with author and time, with a Mentions filter. Decide up front whether notes are editable (HighLevel: no; Intercom: yes behind a permission).
5. Table stakes: mobile push for inbound customer messages and mentions, honoring per-user notification preferences.
6. Table stakes: contact context panel with editable fields, tags, owner, and links to appointments, jobs, invoices and payments.
7. Expected: saved views shared by admins, with a "Logged In User" token so one view serves everyone.
8. Expected: archive or close with automatic reopen on new inbound; snooze with scope rules (shared vs personal) and auto-cancel on reply (Front model); bulk actions (read/unread, star, assign, close, apply template).
9. Expected: templates with merge fields that work across channels, with channel-aware rendering (strip formatting for WhatsApp, Messenger and Instagram as Intercom does).
10. Expected: scheduled send per message, visible to the team, deletable with an audit note (Podium model).
11. Expected: delivery and failure states surfaced in the thread with the provider reason, plus a failed-messages report.
12. Expected: AI reply suggestions (suggestive mode) first, auto-pilot behind a per-bot message cap and a human-takeover rule (HighLevel model), with every generated message metered for billing.
13. Differentiator: sync exclusions for email (ignore internal domains and specific contacts) on day one; this is the most requested missing feature at HighLevel.
14. Differentiator: unified search across message bodies and phone numbers, which Housecall Pro users say is missing.
15. Differentiator: linked job or appointment context inside the thread and automatic technician membership tied to job assignment (Housecall Pro model).

### 5.2 Per channel: capability and compliance gate

SMS and MMS (US)
- Table stakes: two-way SMS and MMS from a dedicated local number per client, STOP/HELP keyword handling at both the provider level and in the application, opt-out stored per number and per channel, quiet-hours guard based on the contact's time zone (8 a.m. to 9 p.m. local), missed call text back with dedupe, segment and MMS size limits in the composer.
- Expected: multiple numbers per location with a default and per-contact sticky sender; toll-free as a fast-start option; number porting workflow with LOA and bill upload and status tracking.
- Compliance gate before enabling: approved brand (EIN, legal name and address exactly matching IRS records, or sole-proprietor OTP path) and approved campaign with opt-in description, sample messages and opt-out language; or toll-free verification approved with an opt-in screenshot; consent record per contact with source, timestamp and wording; first-message "Reply STOP to unsubscribe" text; one-step opt-out and a single confirmation; a public website for the client describing the business, service area, services and contact details; export and import of opt-out lists when moving providers.

SMS outside the US
- Expected: country-aware sender selection (alphanumeric one-way for UK/EU/IL notifications, local long code for two-way), local-language STOP/HELP, no SMS to landlines in DE/IL, carrier content rules per country.
- Compliance gate: sender ID registration where required (UK protected IDs, Israel domestic pre-registration about one week), consent records that satisfy GDPR and local anti-spam law (not confirmed in detail here), and awareness that Canada has no alphanumeric support and strict A2P filtering.

WhatsApp
- Table stakes: Cloud API connection per client with its own business phone number and display name, template library with categories and approval status, composer that blocks free-form text outside the 24-hour window and offers templates instead, read receipts.
- Expected: per-message cost display by category, free-tier counter (1,000 service messages per number per month), quality rating and tier shown to the client, click-to-WhatsApp entry point attribution.
- Compliance gate: Meta business verification (or partner verification), opt-in captured and recorded for business-initiated messages with the business name shown at opt-in, approved templates only outside the window, no unofficial QR-linked gateways in the default configuration (if offered at all, label as unsupported by WhatsApp with ban risk acknowledged by the client).

Email
- Table stakes: per-client sending subdomain with SPF, DKIM, DMARC; separate transactional and marketing streams; bounce and complaint webhooks that auto-suppress; threading by Message-ID, In-Reply-To and References; one-click unsubscribe headers and a physical address on marketing mail.
- Expected: two-way sync of a staff mailbox via Gmail watch (renew daily, poll fallback) and Microsoft Graph subscriptions (renew before 7 days, 1 day for rich notifications), with domain and contact exclusions and an "ignore internal email" rule.
- Compliance gate: DNS verified, DMARC at least p=none and aligned, warmup plan for new domains, spam rate monitoring under 0.10%, unsubscribe honored within 10 business days (CAN-SPAM) and immediately in practice.

Facebook Messenger and Instagram
- Table stakes: page and professional account connection with webhooks, 24-hour window enforcement in the composer, Human Agent 7-day window for manual replies, media limits per Instagram API.
- Compliance gate: platform's Meta app has passed App Review with Advanced Access for messaging permissions and business verification; client is a Page Admin; messaging_policy_enforcement webhook wired to alert.

Google
- Table stakes: Google review conversations in the inbox; GBP "Chat" set to the client's verified SMS or WhatsApp number (Google-hosted chat no longer exists).
- Compliance gate: the underlying SMS or WhatsApp channel is already compliant; nothing Google-specific.

Web chat
- Table stakes: embeddable widget that creates an inbox conversation with the visitor's page URL; choice of live chat, SMS-first (number capture plus explicit marketing opt-in checkbox) or AI-first.
- Compliance gate for SMS-first: the client's SMS channel is approved and the opt-in wording and checkbox state are stored with the contact.

Voice
- Table stakes: inbound number with forwarding, missed-call detection through the dial status callback, voicemail with transcription, call log cards in the thread, click-to-call from the contact.
- Expected: recording with a spoken disclosure on every call, transcripts in the thread, per-user lines or extensions, porting workflow.
- Differentiator: AI voice agent for after-hours answering that writes a summary into the conversation and hands off to SMS.
- Compliance gate: recording disclosure configured (all-party consent states exist, so always disclose), number ownership documents for porting, emergency-calling and address requirements handled by the voice provider.

### 5.3 Build-order implication (INFERRED)

Ship the inbox core with email and web chat first because they have no registration gate, start 10DLC or toll-free registration during onboarding since approval time is the long pole, add Messenger and Instagram once the platform app has Advanced Access, and treat WhatsApp as a paid add-on whose per-message costs change by Meta's published calendar.

---

## Appendix A. Reference product quick facts

- HighLevel: Conversations tab with My Inbox / Team Inbox / Internal Chat, channel filter list of SMS, Email, Calls, Voicemail, Live Chat, WhatsApp, Facebook, Instagram, GBP; Conversation AI modes; missed call text back and WhatsApp back; internal comments immutable (sources in Part 1).
- Podium: SMS, Google, Facebook, webchat today with Instagram, TikTok and eBay planned on the AU FAQ page; templates with ":" variables; scheduled and bulk messages; round robin on Inbox Pro; Linked Conversations; AI Employee and After Hours Responder (sources in Part 1).
- Birdeye: webchat, text, email, voicemail, Google, Instagram, Facebook; Open/Closed; assign with note; smart inboxes; Robin chatbot; payments from inbox; video chat (sources in Part 1).
- Thryv Command Center: email (Gmail, Outlook, iCloud, Hotmail, AOL, Yahoo, IMAP), Facebook, Instagram, phone, SMS, video, webchat, text-to-landline; channel caps by plan; 90-day email import; voicemail transcription (https://www.thryv.com/faqs-2024/).
- Keap: Business Line (US and Canada, Pro and Max plans, mobile-first with web continuation) and a separate text-marketing inbox; help.keap.com now redirects to Thryv's help center (OBSERVED redirect; Keap content on the new site not confirmed).
- HubSpot: team email, chat, Messenger, forms on all plans; WhatsApp and calling on Professional or Enterprise; SMS with Marketing Hub Professional plus SMS add-on; routing needs a paid seat; snooze delivered June 2026 (sources in Parts 1 and 2).
- Front: Open / Assigned to me / Subscribed / Individual inbox / Later / Done / Mentions / Drafts / Sent / Trash / Spam; scoped snooze with 34 custom times (sources in Part 1).
- Intercom: Unassigned, Inbox Views, table layout, macros with actions, Fin AI, snooze column, duplicate merge (sources in Part 1).
- Jobber: two-way text on select plans in US, Canada, UK; one unchangeable dedicated number; account-wide read state; mark unread; 10 images and 1,600 characters under 5MB (sources in Part 1).
- Housecall Pro: Customers / Employees / Community / Job inbox and Global Chat; SMS number by area code after A2P registration with EIN and website; internal notes, mentions, archive, block, Do Not Service; calls and reviews in thread (sources in Part 1).
- Fresha: Client Connect is in-app and email-link messaging for clients who have booked; Open/Closed; tick read receipts; block clients; outbound WhatsApp then SMS for notifications; no two-way SMS or WhatsApp inbox confirmed (search summaries; page bodies did not render).
- Mangomint: one inbox for texts and calls; keep or get a number; internal notes with @mentions; staff permissions; call recordings and transcripts; Phone add-on $70 per month per line; automated text follow-up to missed callers (https://www.mangomint.com/features/two-way-texting/).

## Appendix B. Not confirmed in this run, and why

- 10DLC fee amounts (brand, vetting, monthly campaign by type): Twilio help center is JavaScript rendered; Plivo and Telnyx fee pages returned 404; Bandwidth glossary shows "$" only.
- CTIA Messaging Principles text (HELP wording, SHAFT list, URL shortener rule): PDF downloaded but no PDF text extractor available in the environment; ctia.org HTML page rendered empty.
- FCC 2024/2025 TCPA orders (one-to-one consent vacatur, revocation effective dates): fcc.gov returned 403. The CFR text was used instead.
- Google Business Messages shutdown date and announcement: developer pages now show RCS content with no sunset notice; GBP help page shows the current link-based chat only.
- Messenger message tag list and approvals: tags page and Send API reference did not render.
- Vonage pricing (403), SendGrid pricing (redirect loop), Sinch 10DLC FAQ (not fetched).
- Podium knowledge base article bodies (Salesforce Lightning did not render); Fresha help bodies (title only); Mangomint help article bodies (navigation only); Keap help (redirects to Thryv; learn.thryv.com returned 403).
- HighLevel scheduled send from the composer, snippet merge-field syntax, and Conversation AI per-message price.
- Reddit, Capterra, Jobber community and G2 for pain points (blocked or not attempted).
- Canada CASL, EU GDPR/ePrivacy and Israel anti-spam law specifics from regulator pages.
