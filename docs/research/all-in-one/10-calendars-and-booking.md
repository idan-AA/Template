# 10. Calendars and Booking: Feature Catalog Across Small-Business Platforms

Research date: 2026-11-06. Purpose: catalog scheduling and booking features across reference products so a template scheduling module can fit consultations, salon appointments, service calls and classes.

Reference products: HighLevel Calendars (GHL), Calendly, Acuity Scheduling, Square Appointments, Fresha, Mangomint, Vagaro, Jobber, Housecall Pro (HCP), HubSpot Meetings, Zoho Bookings, Microsoft Bookings (MS Bookings), Google Calendar appointment schedules (Google), Cal.com.

Labels: OBSERVED means read directly from the cited page in this session. INFERRED means a reasonable reading of a cited page or a pattern across several pages. "Not confirmed" means no official page confirmed it in this session; do not treat it as fact.

Method notes and limits:
- About 77 web searches and fetches, official help centers and developer docs preferred.
- The shared web-search budget ran out after the first 16 searches; the rest of the work used direct fetches of official URLs. Some help centers block automated fetches (Acuity help center returned 403; Fresha's first booking-flow article was empty; Vagaro's feature page and support site were not reachable). Where only marketing pages or third-party summaries were available, the table says so.
- The Cal.com Prisma schema fetched from raw.githubusercontent.com/calcom/cal.com/main/packages/prisma/schema.prisma did not contain the Workflow models, and the GitHub contents API for that path reported a download URL under calcom/cal.diy (a community fork with workflows removed). Treat the schema details below as the core Cal.com model; the Workflow enums are marked not confirmed.

---

## Part 1. Calendar and event types

| Feature | Products that have it | Details | Source |
|---|---|---|---|
| One-on-one (one host, one booker) | All 14 | Cal.com "personal" event types (OBSERVED). GHL `calendarType: personal` requires exactly one team member (OBSERVED). Calendly "One-on-one: one host, one invitee" (OBSERVED). HubSpot "One-on-One: one host" (OBSERVED). MS Bookings "Assign any of your selected staff" books a single staff member (OBSERVED). Zoho "One-on-One Service" (OBSERVED). | https://cal.com/blog/event-types-guide-calcom ; https://marketplace.gohighlevel.com/docs/ghl/calendars/create-calendar ; https://calendly.com/help/event-types ; https://knowledge.hubspot.com/meetings-tool/create-and-edit-scheduling-pages ; https://learn.microsoft.com/en-us/microsoft-365/bookings/define-service-offerings ; https://help.zoho.com/portal/en/kb/bookings/services |
| Round robin with priority | Cal.com, GHL, Calendly, HubSpot | Cal.com: hosts default to medium priority; higher priority hosts win when available; ties go to least recently booked, then random (OBSERVED). GHL: `teamMembers[].priority` is 0, 0.5 or 1; `eventType` is `RoundRobin_OptimizeForAvailability` or `RoundRobin_OptimizeForEqualDistribution` (OBSERVED). Calendly: "priority stars" in Maximize-for-availability mode; equal-priority tie goes to host without a recent meeting, then random (OBSERVED). HubSpot: "the user who has gone the longest without being assigned a meeting will be selected"; "Prioritize contact owner" option (OBSERVED). | https://cal.com/help/event-types/round-robin ; https://marketplace.gohighlevel.com/docs/ghl/calendars/create-calendar ; https://calendly.com/help/round-robin-distribution-overview ; https://knowledge.hubspot.com/meetings-tool/understand-group-and-round-robin-meeting-availability |
| Round robin with weighting | Cal.com, HubSpot (rotations) | Cal.com: optional weights, each host starts at 100%, only confirmed bookings count, new host gets a proportional weight adjustment; schema has `Host.weight`, `EventType.isRRWeightsEnabled`, `Team.rrResetInterval` (MONTH or DAY), `Team.rrTimestampBasis` (CREATED_AT or START_TIME) (OBSERVED). HubSpot meeting rotations: "even or weighted distribution" (OBSERVED). Calendly: no percentage weighting described; equal-distribution mode keeps hosts within three meetings of each other and hides a host who is three or more ahead (OBSERVED). | https://cal.com/help/event-types/round-robin ; Cal.com schema ; HubSpot KB above ; https://calendly.com/help/round-robin-distribution-overview |
| Round robin: fixed hosts, host groups, reassignment | Cal.com, Calendly | Cal.com: fixed hosts attend every meeting while others rotate ("Collective behavior" inside round robin); multiple round-robin groups, one host from each group per booking; "Reassign" from the bookings list; `rescheduleWithSameRoundRobinHost`, `includeNoShowInRRCalculation`, `AssignmentReason` with `REASSIGNED`, `RR_REASSIGNED`, `REROUTED`, `SALESFORCE_ASSIGNMENT` (OBSERVED). Calendly: rescheduled meetings are reassigned through round robin by default, can be changed to keep original host (OBSERVED). | https://cal.com/help/event-types/round-robin ; Cal.com schema ; https://calendly.com/help/round-robin-distribution-overview |
| Collective (all hosts must be free) | Cal.com, GHL, Calendly, HubSpot (group), Zoho, MS Bookings (multiple staff), Google (co-hosts) | Cal.com `SchedulingType.COLLECTIVE` (OBSERVED). GHL `collective` requires `isPrimary` on one member (OBSERVED). Calendly "Collective: multiple hosts meet one invitee when all are available" (OBSERVED). HubSpot "Group" page shows times when all selected members are free (OBSERVED). Zoho collective: staff groups up to ten members, slot bookable only when every member is free, one organizer per group (OBSERVED). MS Bookings "Multiple staff": booking only when all assigned staff are available (OBSERVED). Google: up to 20 co-hosts; co-host calendars not checked by default (OBSERVED). | Cal.com schema ; GHL API ; Calendly event-types ; HubSpot KB ; https://help.zoho.com/portal/en/kb/bookings/services/collective-booking-service/articles/collective-booking-service ; MS define-service-offerings ; https://support.google.com/calendar/answer/10729749?hl=en |
| Group or class with capacity (seats) | Cal.com, GHL, Calendly, Acuity, MS Bookings, Zoho, Vagaro (not confirmed from official help) | Cal.com `seatsPerTimeSlot`, `seatsShowAttendees`, `seatsShowAvailabilityCount`, `BookingSeat` (OBSERVED). GHL `class_booking` with `appointmentPerSlot` as max seats (OBSERVED). Calendly group event: invitee limit 2 to 9,999, "Display remaining spots", one host only (OBSERVED). Acuity appointment type `type` is `service`, `class` or `series`; `classSize` (OBSERVED). MS Bookings "Maximum attendees per event", called 1:N service (OBSERVED). Zoho group booking "up to the specified" seats per slot with Class Availability slots (OBSERVED). Square: waitlist "not available for class bookings" implies class bookings exist (INFERRED). | Cal.com schema ; GHL API ; https://calendly.com/help/group-event-type-overview ; https://developers.acuityscheduling.com/reference/appointment-types ; MS define-service-offerings ; https://help.zoho.com/portal/en/kb/bookings/services/group-booking-service ; https://squareup.com/help/us/en/article/7923 |
| Service with staff and resources | GHL (Services), Square, Fresha, Mangomint, Zoho (resource booking), Vagaro (not confirmed) | GHL Calendar View "Services" supports variations, add-ons, multiple services, staff-specific pricing; related articles "Resources in Services", "Add-ons in Services" (OBSERVED titles). Square `appointment_segments` with `service_variation_id`, `team_member_id`, `resource_ids` (field names listed on reference page; segment attributes collapsed, INFERRED). Fresha: assign rooms, equipment, saunas to services with utilisation reporting (OBSERVED, marketing). Mangomint: a service can require several resources, e.g. room plus machine; resource-only bookings (OBSERVED). Zoho: separate "Resource Booking Service" (OBSERVED). | https://help.gohighlevel.com/support/solutions/articles/155000006096-calendar-view-services ; https://developer.squareup.com/reference/square/objects/Booking ; https://www.fresha.com/en-GB/for-business/features/scheduling ; https://mangomint.com/blog/resource-scheduling ; https://help.zoho.com/portal/en/kb/bookings/services |
| Recurring bookings | Cal.com, GHL, Acuity (series), Jobber (recurring jobs) | Cal.com `EventType.recurringEvent` JSON and `Booking.recurringEventId`; blog: choose frequency and "set a maximum number of occurrences" (OBSERVED). GHL `enableRecurring` (single team member only), `recurring.freq` DAILY, WEEKLY, MONTHLY, `count` max 24, `bookingOption` skip, continue or book_next when a slot is unavailable, `bookingOverlapDefaultStatus` confirmed or new (OBSERVED). Acuity `type: series` (OBSERVED). Jobber recurring jobs: set frequency, reassign a single visit or update the series (OBSERVED, marketing). | Cal.com schema ; https://cal.com/blog/event-types-guide-calcom ; GHL API ; Acuity appointment-types ; https://www.getjobber.com/features/scheduling/ |
| Multiple durations per event type | Cal.com, GHL, Calendly, HubSpot | Cal.com "Allow booker to select from multiple durations" (OBSERVED). GHL `durationOptions` max 3, one default (OBSERVED). Calendly multiple-durations article exists (OBSERVED title). HubSpot "one or more preset lengths, plus custom durations" (OBSERVED). | Cal.com blog ; GHL API ; Calendly event-types ; HubSpot create-and-edit |
| Multi-day or all-day bookings | Square (`all_day` flag), Jobber (jobs with visits) | Square Booking `all_day` read-only boolean (OBSERVED). Jobber arrival window "applies to all visits on that job" (OBSERVED). Others: not confirmed. | Square Booking reference ; https://help.getjobber.com/hc/en-us/articles/13004689565463 |
| Managed event types for teams (templates with locked fields) | Cal.com, Calendly | Cal.com `SchedulingType.MANAGED`, `EventType.parent`/`children`, unique `[userId, parentId]` (OBSERVED). Calendly Managed Events: admins create shared templates, lock or allow edits per section, push synced updates (OBSERVED). | Cal.com schema ; https://calendly.com/help/managed-events-automations |
| Personal calendar vs team calendar | Cal.com (user vs team event types), GHL (`personal`), Calendly | Cal.com unique `[userId, slug]` and `[teamId, slug]` (OBSERVED). GHL "Personal calendars need exactly one member" (OBSERVED). | Cal.com schema ; GHL API |
| Event calendars (one-off events) | GHL | `calendarType: event`; Zoom, Google and Teams location kinds not supported for event calendars (OBSERVED). | GHL API |
| Instant meetings | Cal.com | `isInstantEvent`, `instantMeetingExpiryTimeOffsetInSeconds` default 90 (OBSERVED). | Cal.com schema |
| One-off links, single-use links, meeting polls | Calendly | Single-use link expires after one booking; meeting poll up to 40 participants (OBSERVED). | https://calendly.com/help/event-types |
| Field-service jobs with arrival windows | Jobber, HCP | Jobber windows: none, 15 min, 30 min, 1, 2, 3, 4 hours; "after start" or "centered" style (OBSERVED). HCP arrival window becomes default for all jobs and estimates; three time modes: Flexible (30-min increments), Set start time, Manual (unscheduled job) (OBSERVED). | https://help.getjobber.com/hc/en-us/articles/13004689565463 ; https://help.housecallpro.com/en/articles/7034474-new-online-booking |

---

## Part 2. Availability model

| Feature | Products that have it | Details | Source |
|---|---|---|---|
| Working hours per staff, multiple schedules | Cal.com, GHL, Calendly, MS Bookings, Fresha, Jobber, HCP, Google | Cal.com `Schedule` (per user, named, timeZone) with `Availability` rows (`days[]`, `startTime`, `endTime`) and per-host `Host.scheduleId` (OBSERVED). GHL `openHours` by `daysOfTheWeek` with open/close hour and minute (OBSERVED). MS Bookings "Use business hours" or custom staff hours (OBSERVED). Fresha team shifts, breaks, time off (OBSERVED, marketing). Jobber: each team member's bookable hours set individually (OBSERVED). HCP "Available for booking" toggle per employee (OBSERVED). Google: weekly slots, copy to all days (OBSERVED). | Cal.com schema ; GHL API ; https://learn.microsoft.com/en-us/microsoft-365/bookings/add-staff ; Fresha scheduling ; Jobber online-booking ; HCP new-online-booking ; Google 10729749 |
| Date overrides (date-specific hours) | Cal.com, GHL, Google, Zoho | Cal.com `Availability.date` (OBSERVED). GHL `availabilities[]` with `date` and `hours`, `deleted` flag (OBSERVED). Google "Adjusted availability" for specific dates (OBSERVED). Zoho service availability: "mark times when you're unavailable" (OBSERVED). Calendly: article does not mention date-specific hours (OBSERVED gap). | Cal.com schema ; GHL API ; Google 10729749 ; https://help.zoho.com/portal/en/kb/bookings/services/features |
| Time off, out of office | Cal.com, Fresha, MS Bookings (time off, not confirmed on fetched page) | Cal.com `OutOfOfficeEntry` with `start`, `end`, `toUserId` (redirect), `reasonId`, `showNotePublicly`; webhook `OOO_CREATED` (OBSERVED). Fresha "time blocking" for lunch, training, holidays (OBSERVED). | Cal.com schema ; Fresha scheduling |
| Buffer before and after | Cal.com, GHL, Calendly, Acuity, MS Bookings, Zoho, HubSpot, Google, Jobber | Cal.com `beforeEventBuffer`, `afterEventBuffer` (OBSERVED). GHL `preBuffer`, `slotBuffer` (after) (OBSERVED). Calendly "before and/or after" (OBSERVED). Acuity `paddingBefore`, `paddingAfter` (OBSERVED). MS Bookings buffer blocks free/busy, example 10 minutes after (OBSERVED). Zoho pre-buffer and post-buffer (OBSERVED). HubSpot "Buffer time" (OBSERVED). Google "Buffer time" (OBSERVED). Jobber "time allotted between appointments" (OBSERVED). | respective pages above |
| Minimum notice | Cal.com, GHL, Calendly, Acuity, MS Bookings, HubSpot, Google, Jobber, HCP, Square | Cal.com `minimumBookingNotice` default 120 minutes, plus `minimumRescheduleNotice` (OBSERVED). GHL `allowBookingAfter` with units mins, hours, days, weeks, months (OBSERVED). Calendly example 4 hours (OBSERVED). MS "Lead time in hours" (OBSERVED). Google default 4 hours (OBSERVED). HCP "Earliest availability" same day to one week (OBSERVED). Square `min_booking_lead_time_seconds` (OBSERVED). | Cal.com schema ; GHL API ; Calendly fine-tune ; MS set-scheduling-policies ; Google 10729749 ; HCP new-online-booking ; Square BusinessAppointmentSettings |
| Booking window (how far ahead) | Cal.com, GHL, Calendly, MS Bookings, HubSpot, Google, Square | Cal.com `periodType` UNLIMITED, ROLLING, ROLLING_WINDOW, RANGE; `periodDays`, `periodStartDate`, `periodEndDate`, `periodCountCalendarDays` (OBSERVED). GHL `allowBookingFor` days, weeks, months plus `countAvailableDaysOnly` (OBSERVED). Calendly: calendar or week days, specific date window, or no limit (OBSERVED). MS "Maximum days in advance", 365 days or more (OBSERVED). HubSpot rolling business days, calendar days or weeks, or custom range capped at 10 weeks (OBSERVED). Square `max_booking_lead_time_seconds` (OBSERVED). | as above |
| Maximum bookings per day, week, month | Cal.com, GHL, Calendly, Google, Square, HubSpot | Cal.com `bookingLimits` JSON, `durationLimits` JSON, `maxActiveBookingsPerBooker` (OBSERVED). GHL `appointmentPerDay` (OBSERVED). Calendly per event type and across all event types, per day, week or month; whichever hits first blocks (OBSERVED). Google "Max bookings per day" (OBSERVED). Square `max_appointments_per_day_limit` per team member or per location (OBSERVED). HubSpot daily limits: not covered on fetched pages (not confirmed). | as above |
| Slot interval (start time increments) | Cal.com, GHL, Calendly, MS Bookings, HubSpot, HCP | Cal.com `slotInterval`, `offsetStart` (OBSERVED). GHL `slotInterval` default 30 (OBSERVED). MS 5 minutes to 4 hours or custom (OBSERVED). HubSpot "Start time increment" (OBSERVED). HCP flexible mode uses 30-minute increments (OBSERVED). Square `alignment_time` (OBSERVED name, values collapsed). | as above |
| Appointments per slot (same host) | GHL | `appointmentPerSlot` default 1, max bookings per slot per user (OBSERVED). | GHL API |
| Time zones: visitor vs business, lock | Cal.com, Calendly, HubSpot, Square | Cal.com `lockTimeZoneToggleOnBookingPage`, `lockedTimeZone`, `Schedule.timeZone`, `Attendee.timeZone` (OBSERVED). Calendly detects both zones by default; lock recommended for in-person (OBSERVED). HubSpot: availability based on business zone, visitor can view another zone (OBSERVED). Square `customer_timezone_choice` on BusinessBookingProfile (named in prompt; not confirmed on fetched page). | Cal.com schema ; Calendly fine-tune ; HubSpot create-and-edit |
| Holidays | Google (adjusted availability), HCP (Events), Fresha (time blocking) | HCP: "To block dates such as holidays, use Events" (OBSERVED). Others handle via date overrides (INFERRED). | HCP getting-started ; Google 10729749 |
| Multiple calendars checked for conflicts | Cal.com, Calendly, HubSpot, Google, MS Bookings, GHL | Cal.com `SelectedCalendar` per user and per event type with sync tokens and watch channels, `CalendarCache` (OBSERVED). Calendly "choose which connected calendars are checked for busy times and where new bookings are added" (OBSERVED). HubSpot checks all of a member's calendars (OBSERVED). Google "availability check" across calendars, co-hosts not checked by default (OBSERVED). MS "Events on Microsoft 365 calendar affect availability", on by default (OBSERVED). GHL: third-party summary says each round-robin member must connect their own calendar (INFERRED). | Cal.com schema ; Calendly fine-tune ; HubSpot KB ; Google 10729749 ; MS add-staff |
| Overlapping events rules, free/busy priority | Calendly, Cal.com (requested) | Calendly "Free/busy rules" choose which meetings take priority over others (OBSERVED). Cal.com open issue #21467 asks to allow overlapping bookings across team members (OBSERVED). | Calendly meeting-limits ; Cal.com issues |
| Look busy (hide a percentage of slots) | GHL | `lookBusyConfig.enabled`, `lookBusyPercentage` (OBSERVED). | GHL API |
| Only show first available slot | Cal.com | `onlyShowFirstAvailableSlot` (OBSERVED). | Cal.com schema |
| Drive time and service area | Jobber, HCP | Jobber: limit service area and distance between appointments; bookings scheduled around existing ones (OBSERVED). HCP drive time: not covered (not confirmed). | Jobber online-booking |
| Restriction schedule | Cal.com | `EventType.restrictionSchedule` relation (OBSERVED, purpose INFERRED: additional allowed-time window). | Cal.com schema |

---

## Part 3. Booking experience

| Feature | Products that have it | Details | Source |
|---|---|---|---|
| Booking page plus embed widget | All 14 | Cal.com booker embed and embed events, CSS variables (OBSERVED index). GHL `widgetType` default or classic, `widgetSlug` (OBSERVED). HubSpot embed code, pop-up CTA, share link (OBSERVED). HCP embed button opens modal, hosted link (OBSERVED). Google share link or embed (OBSERVED). Zoho iframe widget (OBSERVED). | https://cal.com/docs/llms.txt ; GHL API ; HubSpot create-and-edit ; HCP new-online-booking ; Google 11608416 ; Zoho group-booking |
| Service selection, multiple services in one booking | GHL Services, Square, Fresha, HCP | GHL "multiple services" (OBSERVED). Square `multiple_service_booking_enabled` (OBSERVED). Fresha: add multiple services, different professional per service (OBSERVED). | GHL calendar-view-services ; Square BusinessAppointmentSettings ; Fresha 102398 |
| Staff selection and "any available" | Square, MS Bookings, Zoho, Fresha, Jobber, HCP | Square `any_team_member_booking_enabled`, `skip_booking_flow_staff_selection` (OBSERVED). MS "Allow customers to choose a particular staff" (OBSERVED). Zoho collective "auto-assign" any available group (OBSERVED via search snippet). Jobber auto-assigns an available team member (OBSERVED). | as above |
| Add-ons and extras | GHL Services, Acuity, Fresha (extra time) | GHL add-ons article title (OBSERVED title only). Acuity `addonIDs` on appointment (OBSERVED). Fresha "service extra time" (OBSERVED). | GHL calendar-view-services ; https://developers.acuityscheduling.com/reference/get-appointments ; Fresha scheduling |
| Intake questions and custom forms | Cal.com, GHL, Calendly, Acuity, MS Bookings, HubSpot, Zoho, Google, Fresha | Cal.com `bookingFields` JSON, `Booking.responses` JSON; open issue #11900 asks for conditional questions (OBSERVED). GHL `formId` (OBSERVED). Acuity `forms`, `formsText`, filter by `field:id` (OBSERVED). MS custom fields; email, phone, address, notes non-removable but can be optional (OBSERVED). HubSpot contact property fields and custom text questions, CAPTCHA, block free email domains (OBSERVED). Google: first name, last name, email required, add fields, email verification (OBSERVED). Fresha digital forms and patch tests before appointments (OBSERVED). | as above |
| Guests (additional attendees) | Cal.com, GHL, HubSpot, Google, Zoho | Cal.com `disableGuests` (OBSERVED). GHL `guestType` count_only or collect_detail (OBSERVED). HubSpot "Allow guests" (OBSERVED). Google "Guest permissions: let guests invite others" (OBSERVED). Zoho "Invite Multiple Guests" (OBSERVED). | as above |
| Deposits | GHL, Fresha, Mangomint, Square (full prepayment), HCP, Vagaro (not confirmed) | GHL deposit flat or percentage; balance appears as pending order collected manually; supported on Event, Round Robin, Collective, Class, Service Calendar, Service Menu (OBSERVED). Fresha deposits with configurable non-refundable point; remaining balance at checkout (OBSERVED). Mangomint "card details, partial deposits, or full payment upfront" (OBSERVED). HCP "collect deposits or full upfront payment at booking" (OBSERVED). Square "Require full prepayment", clients cannot self-cancel prepaid (OBSERVED). | https://help.gohighlevel.com/support/solutions/articles/155000002184-partial-payment-collect-deposit-amount ; https://www.fresha.com/help-center/knowledge-base/payments/613-payments-policies-overview ; https://www.mangomint.com/features/express-booking.md ; HCP new-online-booking ; https://squareup.com/help/us/en/article/5493 |
| Card on file (no-show protection) | Square, Fresha, Mangomint | Square: card held for a single appointment, fee chargeable up to 14 days after (OBSERVED). Fresha: card stored, no payment taken (OBSERVED). Mangomint Express Booking collects card and policy acceptance (OBSERVED). | as above |
| Pay at booking | Cal.com, Calendly, HubSpot, Google, GHL | Cal.com `Payment` with `paymentOption` ON_BOOKING or HOLD; Stripe via metadata.apps.stripe (OBSERVED). Calendly Stripe, meeting packages, invoices (OBSERVED). HubSpot payment link via HubSpot Payments or Stripe (OBSERVED). Google Stripe (OBSERVED). GHL gateways Stripe, NMI, Authorize.net, PayPal article (OBSERVED). | as above |
| Coupons | GHL, Cal.com (requested) | GHL "Coupon Codes in Calendars" article title (OBSERVED title). Cal.com issue #12462 "Accept Stripe coupons" open (OBSERVED). | GHL deposits article ; Cal.com issues |
| Waitlist | Square, Fresha, Mangomint, Vagaro (marketing only) | Square: Plus or Premium, toggle on booking site, "Join Waitlist" prompt, no notification if client notified within six hours, not for classes (OBSERVED). Fresha modes: first in line, high-value first, or offer to all (OBSERVED). Mangomint Intelligent Waitlist watches cancellations, reschedules and hour changes; email to front desk or provider; alert at top of calendar; pre-filled booking; Express Booking text (OBSERVED). | https://squareup.com/help/us/en/article/7923 ; Fresha scheduling ; https://www.mangomint.com/blog/intelligent-waitlist-is-here/ |
| Confirmation page and redirect | Cal.com, GHL, HubSpot, HCP | Cal.com `successRedirectUrl` (OBSERVED). GHL `formSubmitType` RedirectURL or ThankYouMessage (OBSERVED). HubSpot redirect works with ad pixels (OBSERVED). HCP redirect must be HTTPS on company domain (OBSERVED). | as above |
| Add to calendar | Calendly (ics per invitee for group events), Cal.com (iCalUID) | Calendly group events send .ics per invitee (OBSERVED). Cal.com `Booking.iCalUID`, `iCalSequence` (OBSERVED). | Calendly group-event ; Cal.com schema |
| UTM capture and tracking | Cal.com, HCP, GHL (pixel) | Cal.com `Tracking` model with `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content`, unique per booking (OBSERVED). HCP "Tracking Attributes" on links tag jobs by source (OBSERVED). GHL `pixelId` (OBSERVED). | Cal.com schema ; HCP new-online-booking ; GHL API |
| Requires confirmation (request mode) | Cal.com, GHL, Square | Cal.com `requiresConfirmation`, `requiresConfirmationWillBlockSlot`, `requiresConfirmationForFreeEmail`; status PENDING (OBSERVED). GHL `autoConfirm` default true (OBSERVED). Square `booking_policy` ACCEPT_ALL or REQUIRES_ACCEPTANCE (not confirmed on fetched page; "if you don't auto-accept requests" is OBSERVED in help). | Cal.com schema ; GHL API ; Square 5493 |
| Email verification of booker | Cal.com, Calendly, Google, HubSpot | Cal.com `requiresBookerEmailVerification` (OBSERVED). Calendly email verification article (OBSERVED title). Google email verification for signed-out visitors (OBSERVED). | as above |
| SEO listing or marketplace | Fresha, Vagaro, Square, HCP and Jobber (Reserve with Google) | Fresha marketplace: 20% one-time commission, minimum $6 for new clients, none for returning (OBSERVED via pricing snippet). Fresha channels: marketplace, Facebook and Instagram buttons, Reserve with Google, direct links (OBSERVED). HCP Reserve with Google via Google Business Profile (OBSERVED). Vagaro marketplace commission complaints (OBSERVED on Trustpilot). | https://fresha.com/pricing ; Fresha 102398 ; HCP new-online-booking ; https://www.trustpilot.com/review/vagaro.com |
| Staff-initiated booking link (text to complete) | Mangomint | Express Booking: staff text a link; client confirms details, card, policy; expiry configurable; expired requests do not block availability (OBSERVED). | Mangomint express-booking |
| "No available times" fallback | HCP | "Send request" creates a Lead in Job Inbox (OBSERVED). | HCP new-online-booking |
| Private or secret event types | Cal.com, Calendly, Acuity, MS Bookings | Cal.com `hidden` (OBSERVED). Calendly secret events bookable via direct link (OBSERVED). Acuity `private` (OBSERVED). MS "Publishing options" hide a service (OBSERVED). | as above |

---

## Part 4. Lifecycle

| Feature | Products that have it | Details | Source |
|---|---|---|---|
| Appointment statuses | Cal.com, GHL, Square, Acuity | Cal.com `BookingStatus`: CANCELLED, ACCEPTED, REJECTED, PENDING, AWAITING_HOST (OBSERVED). GHL notification types reveal statuses: unconfirmed, confirmed, canceled, no-show, invalid (OBSERVED). Square status "position in the booking state machine"; values collapsed on page (named values PENDING, ACCEPTED, DECLINED, CANCELLED_BY_CUSTOMER, CANCELLED_BY_SELLER, NO_SHOW not confirmed). Acuity: `canceled` query flag, `noShow` true only on canceled appointments (OBSERVED). | Cal.com schema ; GHL notifications ; Square Booking ; Acuity get-appointments |
| Confirmations | All 14 | MS: confirmation, reminders and follow-up emails, to customer, staff or both, multiple per appointment (OBSERVED). GHL "Booked (unconfirmed)" and "Booked (confirmed)" notifications (OBSERVED). HCP text and email to both sides including arrival window (OBSERVED). | MS define-service-offerings ; GHL notifications ; HCP new-online-booking |
| Reminders: channels and timing | GHL (email, in-app, SMS, WhatsApp), MS (email, SMS with Teams Premium, North America only), Google (up to 5, text not editable), HubSpot (up to 3 pre-meeting), Calendly (Automations), Cal.com (Workflows) | GHL reminders set by lead time before, follow-ups by time after, multiple triggers for follow-ups; SMS billed per segment; WhatsApp needs approved templates; calendar emails bypass Email DND (OBSERVED). Cal.com Workflow actions and triggers: not confirmed in this session (schema fetched lacked Workflow models). | https://help.gohighlevel.com/support/solutions/articles/155000003441-calendar-email-in-app-sms-whatsapp-appointment-notifications ; MS define-service-offerings ; Google 10729749 ; HubSpot create-and-edit |
| Reschedule and cancel links | Cal.com, GHL, HubSpot, Calendly, Square, Fresha | Cal.com `rescheduled`, `fromReschedule`, `cancelledBy`, `rescheduledBy`, `cancellationReason`, `requiresCancellationReason` default MANDATORY_HOST_ONLY (OBSERVED). GHL `allowReschedule`, `allowCancellation` default true; links blank unless message is appointment-triggered (OBSERVED). HubSpot toggle adds links to event description (OBSERVED). Fresha clients "manage, reschedule, or rebook" from account (OBSERVED). | as above |
| Cancellation windows and fees | Square, Fresha, MS Bookings, Cal.com (requested) | Square cut-off one hour to two weeks or none; flat per appointment, flat per service, or percentage; charge within 14 days; declined card requires contacting client (OBSERVED). Fresha policies by client, service, appointment or booking value (OBSERVED). MS per-service cancellation notice example three days (OBSERVED). Cal.com issue #15647 "Limit how late people can cancel or reschedule" open; `minimumRescheduleNotice` exists in schema (OBSERVED). | Square 5493 ; Fresha 613 ; MS set-scheduling-policies ; Cal.com issues |
| No-show marking and fees | Cal.com, Square, Acuity, GHL, Fresha | Cal.com `Attendee.noShow`, `Booking.noShowHost`, webhook `BOOKING_NO_SHOW_UPDATED`, `AFTER_HOSTS_CAL_VIDEO_NO_SHOW`, `AFTER_GUESTS_CAL_VIDEO_NO_SHOW` (OBSERVED). Square: no-shows shown red in client record; fee at seller discretion (OBSERVED). Acuity `noShow` (OBSERVED). Fresha: block repeat no-show clients from online booking (OBSERVED via blog snippet). | as above |
| Check-in | Not confirmed | No fetched page described a check-in action. Square and Fresha POS flows likely include it (INFERRED, not confirmed). | n/a |
| Follow-up after appointment | GHL, MS Bookings, Calendly, Fresha | GHL follow-up notifications (OBSERVED). MS "Email follow-up" at a specified time after (OBSERVED). Calendly group article: Automations for reminders or follow-ups (OBSERVED). | as above |
| Review request | Fresha, Jobber (not confirmed) | Fresha "Thank You for Visiting" messages prompt star rating and review (OBSERVED). Cal.com `Booking.rating`, `ratingFeedback` (OBSERVED). | Fresha 102398 ; Cal.com schema |
| Rebooking prompt | Fresha | Clients can "rebook appointments anytime" from account (OBSERVED). Automated rebooking reminders: not confirmed. | Fresha 102398 |
| Tags and labels on booking | Acuity, Cal.com | Acuity `labels` (OBSERVED). Cal.com `Booking.metadata`, `internalNote[]` (OBSERVED). | Acuity get-appointments ; Cal.com schema |
| Host reassignment and reroute | Cal.com | `reassignReason`, `reassignBy`, `AssignmentReason` (OBSERVED). | Cal.com schema |
| Locked fields after first booking | Calendly | Group event language, location, duration cannot change after booking (OBSERVED). | Calendly group-event |

---

## Part 5. Sync and integrations

| Feature | Products that have it | Details | Source |
|---|---|---|---|
| Google Calendar two-way | Cal.com, Calendly, HubSpot, GHL, Google (native) | Cal.com `SelectedCalendar.googleChannelId`, `syncToken`, `watchAttempts`; `DestinationCalendar` for where bookings are written (OBSERVED). GHL limitation: "Changes made directly in Google Calendar, Outlook, or iCal don't sync back" for Services view (OBSERVED). Cal.com issue #16872 "Google Calendar move not reflected" (OBSERVED). | Cal.com schema ; GHL calendar-view-services ; Cal.com issues |
| Outlook and Microsoft 365 | Cal.com, Calendly, HubSpot, GHL, MS Bookings (native) | Cal.com Outlook connect atom (OBSERVED index). MS staff free/busy from Microsoft 365 affects availability by default (OBSERVED). | Cal.com llms.txt ; MS add-staff |
| iCloud (Apple) and CalDAV | Cal.com | Apple calendar connect atom (OBSERVED). CalDAV not listed in index fetched (not confirmed). | Cal.com llms.txt |
| Conflict checking | Cal.com, Calendly, HubSpot, Google, MS | See Part 2. HubSpot: disconnected calendar member treated as always available (OBSERVED). | HubSpot KB |
| Zoom, Google Meet, Teams | Cal.com, GHL, HubSpot, MS Bookings (Teams or Skype), Zoho, Google (Meet) | GHL location kinds: custom, zoom_conference, google_conference, inbound_call, outbound_call, physical, booker, ms_teams_conference (OBSERVED). HubSpot: Teams, Zoom, UberConference, Google Meet (OBSERVED). MS unique Teams link per booking with dial-in (OBSERVED). Cal.com `BookingReference` with `meetingId`, `meetingUrl`, `meetingPassword` (OBSERVED). | GHL API ; HubSpot create-and-edit ; MS define-service-offerings ; Cal.com schema |
| CRM contact creation and assignment | GHL, HubSpot, Cal.com (HubSpot, Zoho, Pipedrive apps) | GHL `shouldAssignContactToTeamMember`, `shouldSkipAssigningContactForExisting`, `stickyContact` (OBSERVED). HubSpot contact owner prioritization (OBSERVED). | GHL API ; HubSpot KB |
| Payments | See Part 3 | Stripe is the common denominator (Cal.com, Calendly, HubSpot, Google, GHL). GHL also NMI, Authorize.net, PayPal (OBSERVED). | as above |
| Webhooks | Cal.com, Square | Cal.com `Webhook` with `subscriberUrl`, `payloadTemplate`, `secret`, `time` and `timeUnit` (delayed triggers); events: BOOKING_CREATED, BOOKING_PAYMENT_INITIATED, BOOKING_PAID, BOOKING_RESCHEDULED, BOOKING_REQUESTED, BOOKING_CANCELLED, BOOKING_REJECTED, BOOKING_NO_SHOW_UPDATED, FORM_SUBMITTED, MEETING_ENDED, MEETING_STARTED, RECORDING_READY, RECORDING_TRANSCRIPTION_GENERATED, OOO_CREATED, AFTER_HOSTS_CAL_VIDEO_NO_SHOW, AFTER_GUESTS_CAL_VIDEO_NO_SHOW, FORM_SUBMITTED_NO_EVENT, DELEGATION_CREDENTIAL_ERROR, WRONG_ASSIGNMENT_REPORT (OBSERVED). Square `booking.created`, `booking.updated` (OBSERVED). | Cal.com schema ; https://developer.squareup.com/docs/bookings-api/what-it-is |
| Public API | Cal.com (v1 and v2), GHL, Square, Acuity | Square seller-level writes require Appointments Plus or Premium, else 403 (OBSERVED). | Square what-it-is ; GHL API ; Acuity reference |
| Facebook Pixel, ad pixels | GHL, HubSpot | GHL `pixelId`; HubSpot redirect fires installed pixels (OBSERVED). | GHL API ; HubSpot create-and-edit |
| Reserve with Google | Fresha, HCP, Vagaro (not confirmed) | See Part 3. | Fresha 102398 ; HCP new-online-booking |

---

## Part 6. Team and resources

| Feature | Products that have it | Details | Source |
|---|---|---|---|
| Staff roles and permissions | Cal.com, MS Bookings, Zoho, GHL, Calendly | Cal.com `MembershipRole` MEMBER, ADMIN, OWNER plus `customRoleId` (OBSERVED). MS roles: Team member, Scheduler, Viewer, Guest; up to 100 staff per page (OBSERVED). Zoho: super admins and admins edit, managers view, staff no access to service details (OBSERVED). GHL "User Permissions in Calendars" article (OBSERVED title). Calendly event permissions on Standard plan and up; admins can view but not edit host limits (OBSERVED). | Cal.com schema ; MS add-staff ; Zoho group-booking ; GHL search ; Calendly meeting-limits |
| Assignment rules | Cal.com, GHL, Calendly, HubSpot, HCP, Jobber | Cal.com `assignAllTeamMembers`, `assignRRMembersUsingSegment`, `rrSegmentQueryValue` (attribute-based routing) (OBSERVED). HCP auto-scheduling considers only employees assigned to the booked service; manual mode routes to Point of Contact (OBSERVED). | Cal.com schema ; HCP new-online-booking |
| Resources: rooms and equipment | Mangomint, Fresha, GHL Services, Square, Zoho | Mangomint: resource groups with quantity and availability hours; auto-assigned; appear as calendar columns; drag to another resource column (OBSERVED). Zoho round robin across near-identical resources (OBSERVED, marketing snippet). | Mangomint resource-scheduling ; Zoho resource-bookings |
| Capacity | See Part 1 group and class rows | | |
| Multiple locations | GHL, Square, Fresha, Jobber (service area) | GHL `locationId` required on every calendar (OBSERVED). Square waitlist setting "applies to all locations"; daily limit per location (OBSERVED). Fresha multi-location dashboard (OBSERVED). | GHL API ; Square 7923 ; Fresha scheduling |
| Admin booking on behalf of a client | Square, Fresha, Mangomint, MS Bookings, Cal.com (requested) | Square staff-created appointments with no-show protection must be made from Dashboard, not app (OBSERVED via community summary). Fresha: add clients manually from calendar by name and mobile (OBSERVED). MS "Calendar tab" manual booking with bookable-only-internally publishing option (OBSERVED). Cal.com issue #11477 asks to add bookings without pre-filling email and name (OBSERVED). | Square search ; Fresha 102398 ; MS define-service-offerings ; Cal.com issues |
| Calendar views and drag and drop | Mangomint, Jobber, HCP, GHL, Fresha | Mangomint resource columns and drag between columns (OBSERVED). Jobber drag and drop reschedule and reassign (OBSERVED, marketing). GHL Calendar View: Meetings vs Services types, filters Staff, Services, Categories, Location; Unified Service Booking View groups appointments in one block; mini month view (OBSERVED). HCP dispatch board drag and drop (third-party review, INFERRED). | Mangomint ; https://www.getjobber.com/features/drag-drop-calendar/ ; GHL calendar-view-services |
| Color coding | GHL, Cal.com, Acuity, Jobber | GHL `eventColor` default #039be5 (OBSERVED). Cal.com `eventTypeColor` (OBSERVED). Acuity `color` (OBSERVED). | GHL API ; Cal.com schema ; Acuity |
| Printing | Not confirmed | No fetched page described print views. | n/a |
| Crews and multi-assignee jobs | Jobber | Named crews assigned in one action (OBSERVED, marketing). | Jobber scheduling |
| Staff notifications | MS, GHL, Zoho | MS "Notify all staff via email when a booking assigned to them is created or changed" (OBSERVED). GHL `shouldSendAlertEmailsToAssignedMember`, `alertEmail` (OBSERVED). | MS add-staff ; GHL API |

---

## Part 7. Reporting

| Feature | Products that have it | Details | Source |
|---|---|---|---|
| Resource utilisation | Fresha | "reporting on utilisation" for rooms and equipment (OBSERVED, marketing). | Fresha scheduling |
| Insights and booking charts | Cal.com, Zoho | Cal.com Insights (developer guide "add new booking charts") (OBSERVED index). Zoho KB has a Reports category (OBSERVED). | Cal.com llms.txt ; https://help.zoho.com/portal/en/kb/bookings |
| No-show rate | Cal.com (data available), Square (data available) | Cal.com `Attendee.noShow`, `noShowHost`, `includeNoShowInRRCalculation` make a no-show rate computable (INFERRED). Dedicated no-show-rate report: not confirmed on any product. | Cal.com schema |
| Bookings by source | Cal.com, HCP, Square | Cal.com `Tracking` UTM fields (OBSERVED). HCP tracking attributes tag jobs by source (OBSERVED). Square `Booking.source` (OBSERVED, values collapsed). | as above |
| Revenue per staff | Not confirmed in fetched pages | Salon POS suites (Fresha, Vagaro, Mangomint, Square) advertise staff and commission reports in general, but no fetched page confirmed a revenue-per-staff booking report. | n/a |
| Assignment audit | Cal.com | `AssignmentReason`, webhook `WRONG_ASSIGNMENT_REPORT` (OBSERVED). | Cal.com schema |

---

## Part 8. Data model (synthesized)

Normalized model built mainly from Cal.com's schema (OBSERVED fields), extended with Square, GHL, Acuity and Mangomint concepts (OBSERVED where cited, INFERRED where merged). Field names are suggestions for the template.

### EventType (a bookable thing: consultation, service, class, job)
- id, workspace_id (tenant), location_id (physical branch, GHL and Square require it), team_id nullable, owner_user_id nullable, parent_event_type_id nullable (managed template child, Cal.com)
- title, slug (unique per owner or team), description, hidden, color, cover_image_url
- kind: one_on_one, round_robin, collective, group_class, service, event, personal (union of Cal.com SchedulingType and GHL calendarType, OBSERVED)
- length_minutes, duration_options JSON (max 3 with one default per GHL), slot_interval_minutes, offset_start_minutes
- before_buffer_minutes, after_buffer_minutes, minimum_notice_minutes, minimum_reschedule_notice_minutes
- period_type: unlimited, rolling, rolling_window, range; period_days, period_count_calendar_days, period_start, period_end
- booking_limits JSON (per day, week, month, year counts), duration_limits JSON, max_active_bookings_per_booker, appointments_per_slot, appointments_per_day
- seats_per_time_slot, seats_show_attendees, seats_show_availability_count
- requires_confirmation, requires_confirmation_will_block_slot, requires_booker_email_verification, disable_guests, guest_mode (count_only or collect_detail)
- locations JSON (kinds: custom, zoom, google_meet, ms_teams, inbound_call, outbound_call, physical, booker_chooses)
- booking_fields JSON (ordered questions with type, required, conditional rules)
- recurring_rule JSON (freq, interval, count, unavailable_slot_policy skip, continue, book_next)
- rr: assign_all_team_members, weights_enabled, reset_interval (day or month), timestamp_basis (created_at or start_time), reschedule_with_same_host, include_no_show_in_calculation, segment_query JSON
- lock_time_zone, locked_time_zone
- success_redirect_url, thank_you_message, pixel_id
- price_cents, currency, payment_mode: none, pay_on_booking, deposit_fixed, deposit_percent, card_hold, full_prepayment; deposit_value; cancellation_window_minutes; cancellation_fee_type: none, flat_per_appointment, flat_per_service, percent; cancellation_fee_value; cancellation_policy_text
- schedule_id (default availability), restriction_schedule_id nullable
- resource_requirements: list of {resource_group_id, quantity} (Mangomint, INFERRED)
- addon_ids (Acuity, GHL)
- created_at, updated_at

### Host (who can be booked for an EventType)
- event_type_id, user_id (composite key), is_fixed, priority (int or 0, 0.5, 1 scale), weight, schedule_id nullable (per-host schedule), group_id nullable (round-robin group), location_config JSON

### Schedule (availability set)
- id, user_id nullable, workspace_id, name, time_zone, is_default

### AvailabilityRule (rows inside a Schedule)
- schedule_id, days int[] (0 to 6), start_time, end_time, date nullable (when set it is a date override and days is ignored)

### Override / TimeOff
- OutOfOffice: id, user_id, start, end, reason_id, notes, show_note_publicly, redirect_to_user_id
- BlockedTime (business-level): id, location_id, resource_id nullable, user_id nullable, start, end, label

### Booking
- id, uid (public), idempotency_key, event_type_id, host_user_id nullable, location_id, status: pending, awaiting_host, accepted, rejected, cancelled, no_show, completed (Cal.com set plus Square and GHL additions), start_time, end_time, time_zone_of_booker
- title, description, location JSON (kind plus value), responses JSON, metadata JSON
- recurring_event_id nullable, from_reschedule_uid nullable, rescheduled bool, rescheduled_by, cancelled_by, cancellation_reason, rejection_reason, reassign_reason
- no_show_host bool, paid bool, source (online, marketplace, admin, api, waitlist), tracking (utm_source, utm_medium, utm_campaign, utm_term, utm_content)
- ical_uid, ical_sequence, rating int, rating_feedback, internal_notes[]
- segments[] for multi-service bookings: {service_variation_id, team_member_id, duration_minutes, intermission_minutes, resource_ids[]} (Square shape, OBSERVED names)
- arrival_window_minutes and arrival_window_style (field service, Jobber and HCP)
- created_at, updated_at, version (optimistic concurrency, Square)

### Attendee
- id, booking_id, name, email, phone, time_zone, locale, no_show bool, seat_reference_uid nullable (BookingSeat), is_guest bool, contact_id nullable (CRM link)

### BookingSeat
- reference_uid, booking_id, attendee_id, data JSON, metadata JSON

### Resource and ResourceGroup
- ResourceGroup: id, location_id, name, kind (room, equipment, vehicle, chair), quantity
- Resource: id, group_id, name, availability_schedule_id, color
- BookingResource: booking_id, resource_id, start, end (allows resource-only bookings with host_user_id null, Mangomint)

### Reminder / Workflow
- Workflow: id, workspace_id or team_id, name, trigger (before_event, after_event, new_event, event_cancelled, reschedule_event, no_show), offset_value, offset_unit (minute, hour, day), active_on_all_event_types, event_type_ids[]
- WorkflowStep: workflow_id, step_number, action (email_host, email_attendee, email_address, sms_attendee, sms_number, whatsapp_attendee, whatsapp_number, in_app_user), template (reminder, custom, rating), send_to, subject, body, include_calendar_event
- ScheduledReminder: id, booking_id, step_id, scheduled_at, method, sent_at, cancelled bool, provider_message_id
- The Cal.com Workflow enum values were not confirmed this session; the trigger and action lists above are the union of GHL notification types (OBSERVED) and Cal.com webhook names (OBSERVED).

### Payment
- id, uid, booking_id, provider (stripe, paypal, nmi, authorize_net, square), external_id, amount_cents, fee_cents, currency, kind: charge, deposit, hold, cancellation_fee, no_show_fee, refund; status: pending, succeeded, failed, refunded; payment_option: on_booking, hold; data JSON; charged_at; chargeable_until (Square 14-day rule)

### Webhook
- id, workspace_id, event_type_id nullable, subscriber_url, secret, payload_template, active, version, event_triggers[] (booking.created, booking.requested, booking.paid, booking.rescheduled, booking.cancelled, booking.rejected, booking.no_show_updated, meeting.started, meeting.ended, form.submitted, ooo.created), delay_time and delay_unit for scheduled triggers

### CalendarConnection, SelectedCalendar, DestinationCalendar
- Credential: id, user_id or team_id, provider (google, microsoft, apple, caldav), encrypted_key, invalid bool
- SelectedCalendar (read for conflicts): user_id, credential_id, external_id, event_type_id nullable, channel_id, channel_expiration, sync_token, synced_at, sync_error_count
- DestinationCalendar (write bookings to): user_id or event_type_id (unique), credential_id, external_id, primary_email
- CalendarCache: credential_id, key, value JSON, expires_at

### Waitlist
- WaitlistEntry: id, location_id, contact_id, service_ids[], preferred_staff_id nullable, preferred_windows JSON or asap bool, notes, status (open, notified, booked, expired), last_notified_at (Square six-hour rule), created_by (client or staff)

### Relations summary
- Workspace 1..n Location 1..n EventType; EventType n..n User through Host; EventType 1 Schedule; Schedule 1..n AvailabilityRule; EventType 1..n Booking; Booking 1..n Attendee; Booking 1..n Payment; Booking 1..n BookingResource; Booking 1..n ScheduledReminder; Workflow n..n EventType; Webhook n..1 Workspace; User 1..n Credential 1..n SelectedCalendar.

---

## Part 9. Pain points users report (sourced)

| Pain point | Product | Evidence | Source |
|---|---|---|---|
| Conditional booking questions missing | Cal.com | Most upvoted open issue #11900 (37 reactions) (OBSERVED). | https://github.com/calcom/cal.com/issues?q=is%3Aissue+is%3Aopen+sort%3Areactions-%2B1-desc |
| Coupons at checkout, more payment options | Cal.com | Issues #12462 (32) and #8775 (OBSERVED). | same |
| Overriding own schedule for one booking; overlapping bookings across team members; override times when rescheduling | Cal.com | Issues #5779 (17), #21467 (14), #11842 (OBSERVED). | same |
| External calendar edits not reflected | Cal.com, GHL | Cal.com #16872 "Google Calendar move not reflected" (OBSERVED). GHL Services view: edits in Google, Outlook or iCal do not sync back (OBSERVED). | same ; GHL calendar-view-services |
| Late cancel or reschedule not limitable | Cal.com | Issue #15647 (OBSERVED). | same |
| No-show or cancellation fee charges fail or cannot be applied | Square | Community threads "No Show/Cancellation Fee never works" and "Unable to charge no-show fee for Appointments not booked online"; a moderator said app-created appointments cannot carry no-show protection (OBSERVED via search summaries). | https://community.squareup.com/t5/Appointments-Bookings/No-Show-Cancellation-Fee-never-works/m-p/752807 ; https://community.squareup.com/t5/Appointments-Bookings/Unable-to-charge-quot-no-show-quot-cancelation-fee-for/m-p/702470 |
| Percentage fee not available across all services (AU) | Square | AU help page: no percentage-based fee across all services (OBSERVED via search summary; US page lists a percentage option). | https://squareup.com/help/au/article/5493 |
| Disconnected calendar treated as always available | HubSpot | "A member with a disconnected calendar is treated as always available" (OBSERVED). | HubSpot KB |
| Co-host calendars not checked by default | Google | Google recommends including co-host calendars to avoid double bookings (OBSERVED). | Google 10729749 |
| Reminder text not editable | Google | "You can't edit the reminder email text" (OBSERVED). | Google 10729749 |
| Locked event settings after first booking | Calendly | Group event language, location, duration cannot change; must duplicate and rebook (OBSERVED). | Calendly group-event |
| Equal distribution lowers total bookings | Calendly | Equal mode hides hosts three or more ahead, so "total bookings may be lower" (OBSERVED). | Calendly round-robin |
| Arrival window only at creation in mobile app | Jobber | Existing jobs must be edited on jobber.com (OBSERVED). | Jobber arrival windows |
| Deposit balance must be collected manually | GHL | Remaining balance appears as pending order; staff click "Collect payment" (OBSERVED). | GHL deposits |
| Pricing, add-on fees, marketplace commission on own-advertising bookings, weak post-onboarding support, slow or buggy booking | Vagaro | Trustpilot 3.5 of 5 from 726 reviews; "I have several open tech support tickets currently that have still not been resolved" (OBSERVED). | https://www.trustpilot.com/review/vagaro.com |
| Lingering "Book Online" links after cancellation; billing transparency | Fresha | Trustpilot 4.8 of 5 from 7,714 reviews, mostly consumer reviews; owner complaint about links active "even after six months" (OBSERVED). | https://www.trustpilot.com/review/fresha.com |
| Unconnected calendars cause double bookings in round robin | GHL | Third-party guides state every member must connect a calendar (INFERRED). | https://intercom.help/warplan-ai/en/articles/10523785-understanding-different-calendar-types-in-gohighlevel |
| Calendar type cannot be changed after creation | GHL | Third-party guides (INFERRED, not confirmed on official page). | same |

---

## Part 10. What this tells us a template must have

Priority tiers: Table stakes (every reference product has it), Expected (most products in the relevant vertical have it), Differentiator (few have it, high value).

### Table stakes
1. EventType with duration, buffers before and after, minimum notice, booking window (rolling or fixed range), slot interval, color, hidden flag. (All 14.)
2. Per-staff weekly schedule in a time zone, with date overrides and blocked time. (Cal.com, GHL, Google, MS, Fresha.)
3. Booking page plus embeddable widget, visitor time zone detection with optional lock. (All.)
4. Custom intake questions per event type, with required flag; conditional logic is a near-term expectation (Cal.com top issue).
5. Confirmation, reminder and follow-up messages by email and SMS with offsets before and after; separate templates for booker and staff. (GHL, MS, Google, HubSpot, Calendly.)
6. Self-service reschedule and cancel links with a configurable cut-off window. (Cal.com, GHL, HubSpot, Square, Fresha.)
7. Statuses: pending, confirmed, cancelled, no_show, completed; cancellation reason; who cancelled or rescheduled.
8. Google and Microsoft 365 two-way sync: read busy from selected calendars, write to a destination calendar, keep sync tokens and watch channels, surface sync errors. (Cal.com, Calendly, HubSpot, Google, MS.)
9. Video links generated per booking (Zoom, Google Meet, Teams) and physical or phone locations.
10. Stripe payment at booking with full price or deposit (fixed or percent). (Cal.com, Calendly, HubSpot, Google, GHL, Fresha, HCP.)
11. Admin booking on behalf of a client, including outside published hours. (Square, Fresha, MS, Mangomint.)
12. Webhooks on booking created, rescheduled, cancelled, no-show updated, paid. (Cal.com, Square.)

### Expected
1. Round robin with priority and least-recently-booked tie break, plus optimize-for-availability vs equal-distribution mode. (Cal.com, GHL, Calendly, HubSpot.)
2. Collective bookings (all hosts free) and fixed hosts inside round robin. (Cal.com, Calendly, Zoho, MS, HubSpot.)
3. Group or class events with seats, remaining-seat display, and per-attendee no-show. (Cal.com, Calendly, GHL, Acuity, MS, Zoho.)
4. Multiple durations per event type (max 3 is common). (Cal.com, GHL, Calendly, HubSpot.)
5. Booking limits per day, week, month, both per event type and per host. (Cal.com, Calendly, GHL, Google, Square.)
6. Card on file with cancellation and no-show fee rules: window from one hour to two weeks, flat or percent fee, charge up to 14 days after, declined-card handling, policy text shown at booking and in confirmations. (Square, Fresha, Mangomint.)
7. Multi-service bookings in one checkout with per-service staff. (Square, Fresha, GHL Services.)
8. Resources (rooms, equipment) with quantity, availability, auto-assignment, and resource columns in the calendar. (Mangomint, Fresha, GHL, Zoho.)
9. Multiple locations with per-location calendars, staff and daily limits. (GHL, Square, Fresha.)
10. Recurring bookings with a max count and a policy for unavailable occurrences (skip, continue, book next). (GHL, Cal.com.)
11. UTM and source capture on each booking, plus post-booking redirect for pixel tracking. (Cal.com, HCP, HubSpot, GHL.)
12. Staff roles: owner, admin, scheduler, member, viewer; staff see only their own bookings unless elevated. (Cal.com, MS, Zoho.)
13. Out-of-office with optional redirect to another host. (Cal.com.)
14. Field-service variant: arrival window (none to 4 hours, after or centered), manual vs auto scheduling, "send request" when no slot fits, drive-time or service-area limit. (Jobber, HCP.)

### Differentiators
1. Waitlist with automatic opening detection (cancellation, reschedule, hours change) and notification modes: first in line, high-value first, offer to all; six-hour re-notify guard. (Mangomint, Fresha, Square.)
2. Staff-initiated "finish on your phone" booking link with expiry that does not block availability. (Mangomint Express Booking.)
3. Weighted round robin with reset interval and timestamp basis, segment-based host selection, reassignment with hidden host details, assignment-reason audit log. (Cal.com.)
4. Managed event templates with locked sections pushed to team members. (Cal.com, Calendly.)
5. Requires-confirmation mode with option to block the slot while pending and to require confirmation only for free-email domains. (Cal.com.)
6. Look-busy percentage hiding slots. (GHL.)
7. WhatsApp and in-app reminder channels alongside email and SMS, with calendar emails bypassing marketing DND. (GHL.)
8. Instant meetings with expiry window. (Cal.com.)
9. Smart pricing by demand (busy vs quiet periods) and per-client policy exceptions. (Fresha.)
10. Resource-only bookings with no staff member (saunas, float tanks). (Mangomint.)
11. Booking rating and feedback stored on the booking; post-visit review prompt. (Cal.com, Fresha.)
12. Marketplace or Reserve with Google listing as a channel, with per-channel attribution in reporting. (Fresha, HCP, Vagaro.)

### Design rules the evidence supports
- Store every time as UTC plus the booker's time zone and the schedule's time zone; let the event type lock the displayed zone.
- Treat a disconnected calendar as "unknown", not "free" (the HubSpot behavior is a documented pain point).
- Check co-hosts' and resources' calendars by default (Google's opt-in default is a documented double-booking risk).
- Make the calendar type changeable or make conversion trivial (GHL locks it at creation).
- Keep cancellation policy and fee rules on the EventType but allow per-booking overrides (Fresha applies policies by client, service, appointment or value).
- Record `source` and UTM on every booking so "bookings by source" is a query, not a feature.
- Model deposits as Payments of kind deposit with the balance as a receivable so the front desk is not collecting it manually (GHL pain point).
