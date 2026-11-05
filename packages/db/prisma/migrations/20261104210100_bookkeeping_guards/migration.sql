-- Bookkeeping phase 1.1: CHECK constraints and database guards G1 to G5, G7, G8, G13 (G12 is core's).
-- Manager review 2026-11-04 added: G7 and G8 also fire on DELETE, and G13 (numberSequence).
-- Hand written (Prisma does not model CHECKs, triggers or functions).
--
-- DATABASE GATE: Tier 2 (ADD). Every object below is new. Confirmed against the
-- repo test database before applying: none of the five tables, no ledger_* or number_sequence*
-- function, none of the seven enum types existed; the only triggers were core's two audit ones.
-- Access rules: this app has no RLS. These are integrity triggers, not row visibility.
-- All functions are SECURITY INVOKER (the default); none is callable as an API by clients.
--
-- Session variables the service sets with set_config(name, value, true) inside each
-- posting transaction: app.actor_type, app.actor_id, app.soft_lock_override, app.reopen.
-- Trigger functions are named exactly like their triggers (docs/plan/bookkeeping.md 3.2).
-- G6, G9, G10, G11 belong to later phases (bank, documents, allocations).
-- G4 covers journalEntry and journalLine; bankMatch joins it in phase 5. The audit trail's own
-- append-only and no-truncate triggers (audit_append_only, audit_no_truncate) already exist in core
-- migration 20261104193000_audit_event, so they are NOT created here.

-- ---------------------------------------------------------------------------
-- CHECK constraints
-- ---------------------------------------------------------------------------

ALTER TABLE "ledgerSettings"
  ADD CONSTRAINT "ledgerSettings_singleton_chk" CHECK ("id" = 'ledger'),
  ADD CONSTRAINT "ledgerSettings_base_currency_chk" CHECK ("baseCurrency" ~ '^[A-Z]{3}$'),
  ADD CONSTRAINT "ledgerSettings_fiscal_month_chk" CHECK ("fiscalYearStartMonth" BETWEEN 1 AND 12),
  ADD CONSTRAINT "ledgerSettings_lock_order_chk" CHECK ("hardLockDate" IS NULL OR "lockDate" IS NULL OR "hardLockDate" <= "lockDate"),
  ADD CONSTRAINT "ledgerSettings_stale_days_chk" CHECK ("attentionStaleDays" >= 0);

ALTER TABLE "numberSequence"
  ADD CONSTRAINT "numberSequence_padding_chk" CHECK ("padding" BETWEEN 1 AND 12),
  ADD CONSTRAINT "numberSequence_next_chk" CHECK ("nextValue" >= 1);

ALTER TABLE "ledgerAccount"
  ADD CONSTRAINT "ledgerAccount_type_family_chk" CHECK (
    ("type" = 'ASSET' AND "subtype" IN ('BANK','CASH','ACCOUNTS_RECEIVABLE','CURRENT_ASSET','FIXED_ASSET','OTHER_ASSET'))
    OR ("type" = 'LIABILITY' AND "subtype" IN ('CREDIT_CARD','ACCOUNTS_PAYABLE','CURRENT_LIABILITY','TAX_LIABILITY','LONG_TERM_LIABILITY'))
    OR ("type" = 'EQUITY' AND "subtype" IN ('OWNER_EQUITY','RETAINED_EARNINGS'))
    OR ("type" = 'INCOME' AND "subtype" IN ('REVENUE','OTHER_INCOME'))
    OR ("type" = 'EXPENSE' AND "subtype" IN ('COST_OF_SALES','OPERATING_EXPENSE','OTHER_EXPENSE'))
  ),
  ADD CONSTRAINT "ledgerAccount_system_role_chk" CHECK ("systemRole" IS NULL OR "isSystem"),
  ADD CONSTRAINT "ledgerAccount_currency_chk" CHECK ("currency" IS NULL OR "currency" ~ '^[A-Z]{3}$'),
  ADD CONSTRAINT "ledgerAccount_not_own_parent_chk" CHECK ("parentId" IS NULL OR "parentId" <> "id");

ALTER TABLE "journalEntry"
  ADD CONSTRAINT "journalEntry_base_currency_chk" CHECK ("baseCurrency" ~ '^[A-Z]{3}$'),
  ADD CONSTRAINT "journalEntry_posted_fields_chk" CHECK ("status" = 'DRAFT' OR ("number" IS NOT NULL AND "postedAt" IS NOT NULL AND "postedById" IS NOT NULL)),
  ADD CONSTRAINT "journalEntry_reversal_chk" CHECK (("source" = 'REVERSAL') = ("reversesId" IS NOT NULL)),
  ADD CONSTRAINT "journalEntry_not_self_reversal_chk" CHECK ("reversesId" IS NULL OR "reversesId" <> "id");

ALTER TABLE "journalLine"
  ADD CONSTRAINT "journalLine_amounts_nonneg_chk" CHECK ("debitMinor" >= 0 AND "creditMinor" >= 0 AND "baseDebitMinor" >= 0 AND "baseCreditMinor" >= 0),
  ADD CONSTRAINT "journalLine_one_side_chk" CHECK (("debitMinor" > 0) <> ("creditMinor" > 0)),
  ADD CONSTRAINT "journalLine_base_side_chk" CHECK (("debitMinor" = 0 OR "baseCreditMinor" = 0) AND ("creditMinor" = 0 OR "baseDebitMinor" = 0)),
  ADD CONSTRAINT "journalLine_rate_chk" CHECK ("fxRate" > 0),
  ADD CONSTRAINT "journalLine_currency_chk" CHECK ("currency" ~ '^[A-Z]{3}$'),
  ADD CONSTRAINT "journalLine_target_chk" CHECK (NOT ("documentId" IS NOT NULL AND "paymentId" IS NOT NULL)),
  ADD CONSTRAINT "journalLine_line_no_chk" CHECK ("lineNo" >= 1);

-- ---------------------------------------------------------------------------
-- G1 ledger_entry_post_guard: DRAFT -> POSTED
-- ---------------------------------------------------------------------------

CREATE FUNCTION ledger_entry_post_guard() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE
  s            "ledgerSettings"%ROWTYPE;
  v_first      timestamp(3);
  v_actor      text := coalesce(current_setting('app.actor_type', true), '');
  v_override   text := coalesce(current_setting('app.soft_lock_override', true), '');
  v_lines      integer;
  v_base_dr    numeric;
  v_base_cr    numeric;
  v_ccy_count  integer;
  v_txn_dr     numeric;
  v_txn_cr     numeric;
  v_foreign    integer;
  v_rounding   numeric;
  v_bad        integer;
  v_prefix     text;
  v_pad        integer;
  v_n          integer;
BEGIN
  -- Lock ordering: read firstPostedAt unlocked. If it is still null take FOR UPDATE (the very
  -- first post sets it), otherwise FOR SHARE. FOR SHARE then UPDATE would deadlock two posters.
  SELECT "firstPostedAt" INTO v_first FROM "ledgerSettings" WHERE "id" = 'ledger';
  IF NOT FOUND THEN
    RAISE EXCEPTION 'G1 ledger_entry_post_guard: ledger settings do not exist';
  END IF;
  IF v_first IS NULL THEN
    SELECT * INTO s FROM "ledgerSettings" WHERE "id" = 'ledger' FOR UPDATE;
  ELSE
    SELECT * INTO s FROM "ledgerSettings" WHERE "id" = 'ledger' FOR SHARE;
  END IF;

  -- (i) who may post
  IF NEW."postedById" IS NULL THEN
    RAISE EXCEPTION 'G1 ledger_entry_post_guard: a posted entry must name who posted it';
  END IF;
  IF v_actor = '' OR v_actor = 'AGENT' THEN
    RAISE EXCEPTION 'G1 ledger_entry_post_guard: actor "%" may not post; a human posts (app.actor_type must be set and not AGENT)', v_actor;
  END IF;

  -- (e) base currency
  IF NEW."baseCurrency" <> s."baseCurrency" THEN
    RAISE EXCEPTION 'G1 ledger_entry_post_guard: entry base currency % is not the ledger base currency %', NEW."baseCurrency", s."baseCurrency";
  END IF;

  -- (g) (h) lock dates
  IF s."hardLockDate" IS NOT NULL AND NEW."date" <= s."hardLockDate" THEN
    RAISE EXCEPTION 'G1 ledger_entry_post_guard: date % is on or before the hard lock date %', NEW."date", s."hardLockDate";
  END IF;
  IF s."lockDate" IS NOT NULL AND NEW."date" <= s."lockDate" AND v_override <> 'on' THEN
    RAISE EXCEPTION 'G1 ledger_entry_post_guard: date % is on or before the lock date % and no override was given', NEW."date", s."lockDate";
  END IF;

  -- (a) (b) shape and balance in base
  SELECT count(*), coalesce(sum("baseDebitMinor"), 0), coalesce(sum("baseCreditMinor"), 0)
    INTO v_lines, v_base_dr, v_base_cr
    FROM "journalLine" WHERE "entryId" = NEW."id";
  IF v_lines < 2 THEN
    RAISE EXCEPTION 'G1 ledger_entry_post_guard: an entry needs at least two lines, found %', v_lines;
  END IF;
  IF v_base_dr <> v_base_cr THEN
    RAISE EXCEPTION 'G1 ledger_entry_post_guard: unbalanced, base debits % do not equal base credits %', v_base_dr, v_base_cr;
  END IF;

  -- (c) one currency among non-rounding lines must balance in that currency
  SELECT count(DISTINCT "currency"), coalesce(sum("debitMinor"), 0), coalesce(sum("creditMinor"), 0)
    INTO v_ccy_count, v_txn_dr, v_txn_cr
    FROM "journalLine" WHERE "entryId" = NEW."id" AND "kind" <> 'ROUNDING';
  IF v_ccy_count = 1 AND v_txn_dr <> v_txn_cr THEN
    RAISE EXCEPTION 'G1 ledger_entry_post_guard: unbalanced, debits % do not equal credits % in one currency', v_txn_dr, v_txn_cr;
  END IF;

  -- (d) adjustment lines are base currency at rate 1; base lines are rate 1 and equal amounts
  SELECT count(*) INTO v_bad FROM "journalLine"
    WHERE "entryId" = NEW."id" AND "kind" IN ('FX_ADJUSTMENT', 'ROUNDING')
      AND ("currency" <> NEW."baseCurrency" OR "fxRate" <> 1);
  IF v_bad > 0 THEN
    RAISE EXCEPTION 'G1 ledger_entry_post_guard: FX_ADJUSTMENT and ROUNDING lines must be in the base currency at rate 1';
  END IF;
  SELECT count(*) INTO v_bad FROM "journalLine"
    WHERE "entryId" = NEW."id" AND "currency" = NEW."baseCurrency"
      AND ("fxRate" <> 1 OR "baseDebitMinor" <> "debitMinor" OR "baseCreditMinor" <> "creditMinor");
  IF v_bad > 0 THEN
    RAISE EXCEPTION 'G1 ledger_entry_post_guard: a base currency line must have rate 1 and equal base amounts';
  END IF;
  SELECT count(*) INTO v_foreign FROM "journalLine"
    WHERE "entryId" = NEW."id" AND "kind" <> 'ROUNDING' AND "currency" <> NEW."baseCurrency";
  SELECT coalesce(sum("baseDebitMinor" + "baseCreditMinor"), 0) INTO v_rounding
    FROM "journalLine" WHERE "entryId" = NEW."id" AND "kind" = 'ROUNDING';
  IF v_rounding > floor(v_foreign / 2.0) THEN
    RAISE EXCEPTION 'G1 ledger_entry_post_guard: rounding % is larger than % foreign lines can explain', v_rounding, v_foreign;
  END IF;

  -- (f) archived accounts
  SELECT count(*) INTO v_bad FROM "journalLine" l
    JOIN "ledgerAccount" a ON a."id" = l."accountId"
    WHERE l."entryId" = NEW."id" AND a."archivedAt" IS NOT NULL;
  IF v_bad > 0 THEN
    RAISE EXCEPTION 'G1 ledger_entry_post_guard: a line posts to an archived account';
  END IF;

  -- (j) firstPostedAt freezes the base currency
  IF v_first IS NULL THEN
    UPDATE "ledgerSettings" SET "firstPostedAt" = now() WHERE "id" = 'ledger';
  END IF;

  -- (k) gapless number from the ENTRY sequence; the UPDATE row lock serialises posters and a
  -- rollback returns the number.
  IF NEW."number" IS NULL THEN
    UPDATE "numberSequence" SET "nextValue" = "nextValue" + 1 WHERE "key" = 'ENTRY'
      RETURNING "prefix", "padding", "nextValue" - 1 INTO v_prefix, v_pad, v_n;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'G1 ledger_entry_post_guard: number sequence ENTRY does not exist';
    END IF;
    NEW."number" := v_prefix || lpad(v_n::text, v_pad, '0');
  END IF;
  IF NEW."postedAt" IS NULL THEN
    NEW."postedAt" := now();
  END IF;
  RETURN NEW;
END $$;

CREATE TRIGGER ledger_entry_post_guard
  BEFORE UPDATE ON "journalEntry"
  FOR EACH ROW WHEN (OLD."status" = 'DRAFT' AND NEW."status" = 'POSTED')
  EXECUTE FUNCTION ledger_entry_post_guard();

-- ---------------------------------------------------------------------------
-- G2 ledger_entry_immutable
-- ---------------------------------------------------------------------------

CREATE FUNCTION ledger_entry_immutable() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW."status" <> 'DRAFT' THEN
      RAISE EXCEPTION 'G2 ledger_entry_immutable: an entry is born DRAFT and posted by the transition, not inserted as %', NEW."status";
    END IF;
    RETURN NEW;
  END IF;
  IF OLD."status" = 'POSTED' THEN
    RAISE EXCEPTION 'G2 ledger_entry_immutable: posted entry % cannot be % (reverse it instead)', OLD."id", lower(TG_OP);
  END IF;
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END $$;

CREATE TRIGGER ledger_entry_immutable
  BEFORE INSERT OR UPDATE OR DELETE ON "journalEntry"
  FOR EACH ROW EXECUTE FUNCTION ledger_entry_immutable();

-- ---------------------------------------------------------------------------
-- G3 ledger_line_immutable
-- ---------------------------------------------------------------------------

CREATE FUNCTION ledger_line_immutable() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE
  v_status "EntryStatus";
BEGIN
  IF TG_OP IN ('UPDATE', 'DELETE') THEN
    SELECT "status" INTO v_status FROM "journalEntry" WHERE "id" = OLD."entryId";
    -- parent not found: it is being deleted (cascade from a DRAFT entry), which G2 allows
    IF FOUND AND v_status = 'POSTED' THEN
      RAISE EXCEPTION 'G3 ledger_line_immutable: lines of posted entry % cannot be % (reverse it instead)', OLD."entryId", lower(TG_OP);
    END IF;
  END IF;
  IF TG_OP IN ('INSERT', 'UPDATE') THEN
    SELECT "status" INTO v_status FROM "journalEntry" WHERE "id" = NEW."entryId";
    IF FOUND AND v_status = 'POSTED' THEN
      RAISE EXCEPTION 'G3 ledger_line_immutable: posted entry % cannot receive line changes (reverse it instead)', NEW."entryId";
    END IF;
  END IF;
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END $$;

CREATE TRIGGER ledger_line_immutable
  BEFORE INSERT OR UPDATE OR DELETE ON "journalLine"
  FOR EACH ROW EXECUTE FUNCTION ledger_line_immutable();

-- ---------------------------------------------------------------------------
-- G4 ledger_no_truncate
-- ---------------------------------------------------------------------------

CREATE FUNCTION ledger_no_truncate() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'G4 ledger_no_truncate: TRUNCATE of % is not allowed', TG_TABLE_NAME;
END $$;

CREATE TRIGGER ledger_no_truncate_entry
  BEFORE TRUNCATE ON "journalEntry"
  FOR EACH STATEMENT EXECUTE FUNCTION ledger_no_truncate();
CREATE TRIGGER ledger_no_truncate_line
  BEFORE TRUNCATE ON "journalLine"
  FOR EACH STATEMENT EXECUTE FUNCTION ledger_no_truncate();

-- ---------------------------------------------------------------------------
-- G5 ledger_reversal_guard: DRAFT -> POSTED with reversesId set
-- ---------------------------------------------------------------------------

CREATE FUNCTION ledger_reversal_guard() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE
  o "journalEntry"%ROWTYPE;
  v_diff integer;
BEGIN
  IF NEW."reversesId" IS NULL THEN
    RETURN NEW;
  END IF;
  SELECT * INTO o FROM "journalEntry" WHERE "id" = NEW."reversesId";
  IF NOT FOUND OR o."status" <> 'POSTED' THEN
    RAISE EXCEPTION 'G5 ledger_reversal_guard: the entry being reversed must exist and be POSTED';
  END IF;
  IF o."source" = 'REVERSAL' OR o."reversesId" IS NOT NULL THEN
    RAISE EXCEPTION 'G5 ledger_reversal_guard: a reversal cannot be reversed; enter the correction as a new entry';
  END IF;

  -- each line mirrors the original: same account, kind, currency, tags and amounts, side swapped
  SELECT count(*) INTO v_diff FROM (
    (SELECT "accountId", "kind", "currency", "creditMinor" AS d, "debitMinor" AS c,
            "baseCreditMinor" AS bd, "baseDebitMinor" AS bc,
            "counterpartyId", "documentId", "paymentId", "taxRateId"
       FROM "journalLine" WHERE "entryId" = o."id"
     EXCEPT ALL
     SELECT "accountId", "kind", "currency", "debitMinor", "creditMinor",
            "baseDebitMinor", "baseCreditMinor",
            "counterpartyId", "documentId", "paymentId", "taxRateId"
       FROM "journalLine" WHERE "entryId" = NEW."id")
    UNION ALL
    (SELECT "accountId", "kind", "currency", "debitMinor", "creditMinor",
            "baseDebitMinor", "baseCreditMinor",
            "counterpartyId", "documentId", "paymentId", "taxRateId"
       FROM "journalLine" WHERE "entryId" = NEW."id"
     EXCEPT ALL
     SELECT "accountId", "kind", "currency", "creditMinor", "debitMinor",
            "baseCreditMinor", "baseDebitMinor",
            "counterpartyId", "documentId", "paymentId", "taxRateId"
       FROM "journalLine" WHERE "entryId" = o."id")
  ) x;
  IF v_diff > 0 THEN
    RAISE EXCEPTION 'G5 ledger_reversal_guard: the lines do not mirror the original entry % (same accounts, sides swapped, same base amounts and tags)', o."id";
  END IF;
  RETURN NEW;
END $$;

CREATE TRIGGER ledger_reversal_guard
  BEFORE UPDATE ON "journalEntry"
  FOR EACH ROW WHEN (OLD."status" = 'DRAFT' AND NEW."status" = 'POSTED')
  EXECUTE FUNCTION ledger_reversal_guard();

-- ---------------------------------------------------------------------------
-- G7 ledger_account_guard
-- ---------------------------------------------------------------------------

CREATE FUNCTION ledger_account_guard() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE
  v_has_lines boolean;
  v_balance   numeric;
BEGIN
  -- DELETE: a system account is never deleted (the engine finds it by role). An ordinary account
  -- with lines is protected by the FK (Restrict); an unused ordinary account may be deleted.
  IF TG_OP = 'DELETE' THEN
    IF OLD."isSystem" THEN
      RAISE EXCEPTION 'G7 ledger_account_guard: system account % (%) cannot be deleted', OLD."code", OLD."name";
    END IF;
    RETURN OLD;
  END IF;
  SELECT EXISTS (SELECT 1 FROM "journalLine" WHERE "accountId" = OLD."id") INTO v_has_lines;
  IF v_has_lines AND (
       NEW."type" IS DISTINCT FROM OLD."type"
    OR NEW."subtype" IS DISTINCT FROM OLD."subtype"
    OR NEW."currency" IS DISTINCT FROM OLD."currency"
    OR NEW."systemRole" IS DISTINCT FROM OLD."systemRole") THEN
    RAISE EXCEPTION 'G7 ledger_account_guard: type, subtype, currency and system role cannot change once the account has lines';
  END IF;
  IF OLD."isSystem" AND NEW."isSystem" IS DISTINCT FROM OLD."isSystem" THEN
    RAISE EXCEPTION 'G7 ledger_account_guard: a system account stays a system account';
  END IF;
  IF OLD."archivedAt" IS NULL AND NEW."archivedAt" IS NOT NULL THEN
    IF OLD."isSystem" THEN
      RAISE EXCEPTION 'G7 ledger_account_guard: a system account cannot be archived';
    END IF;
    SELECT coalesce(sum("baseDebitMinor" - "baseCreditMinor"), 0) INTO v_balance
      FROM "journalLine" WHERE "accountId" = OLD."id";
    IF v_balance <> 0 THEN
      RAISE EXCEPTION 'G7 ledger_account_guard: an account with a balance of % cannot be archived', v_balance;
    END IF;
  END IF;
  RETURN NEW;
END $$;

CREATE TRIGGER ledger_account_guard
  BEFORE UPDATE OR DELETE ON "ledgerAccount"
  FOR EACH ROW EXECUTE FUNCTION ledger_account_guard();

-- ---------------------------------------------------------------------------
-- G8 ledger_settings_guard
-- ---------------------------------------------------------------------------

CREATE FUNCTION ledger_settings_guard() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE
  v_actor  text := coalesce(current_setting('app.actor_type', true), '');
  v_reopen text := coalesce(current_setting('app.reopen', true), '');
BEGIN
  -- DELETE: the singleton holds the base currency and the lock dates. Deleting it and
  -- re-inserting would bypass every check below, so it is never deleted.
  IF TG_OP = 'DELETE' THEN
    RAISE EXCEPTION 'G8 ledger_settings_guard: the ledger settings row cannot be deleted';
  END IF;
  IF OLD."firstPostedAt" IS NOT NULL THEN
    IF NEW."baseCurrency" <> OLD."baseCurrency" THEN
      RAISE EXCEPTION 'G8 ledger_settings_guard: the base currency cannot change after the first posting';
    END IF;
    IF NEW."firstPostedAt" IS DISTINCT FROM OLD."firstPostedAt" THEN
      RAISE EXCEPTION 'G8 ledger_settings_guard: firstPostedAt is set once and never changes';
    END IF;
  END IF;
  -- moving a lock date backwards reopens closed books: owner-only service call sets app.reopen
  IF (OLD."hardLockDate" IS NOT NULL AND (NEW."hardLockDate" IS NULL OR NEW."hardLockDate" < OLD."hardLockDate"))
     OR (OLD."lockDate" IS NOT NULL AND (NEW."lockDate" IS NULL OR NEW."lockDate" < OLD."lockDate")) THEN
    IF NOT (v_actor = 'USER' AND v_reopen = 'on') THEN
      RAISE EXCEPTION 'G8 ledger_settings_guard: lowering a lock date needs the reopen permission (app.actor_type USER and app.reopen on)';
    END IF;
  END IF;
  RETURN NEW;
END $$;

CREATE TRIGGER ledger_settings_guard
  BEFORE UPDATE OR DELETE ON "ledgerSettings"
  FOR EACH ROW EXECUTE FUNCTION ledger_settings_guard();

-- ---------------------------------------------------------------------------
-- G13 number_sequence_guard: gapless numbering cannot be rewound or removed
-- ---------------------------------------------------------------------------

CREATE FUNCTION number_sequence_guard() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    RAISE EXCEPTION 'G13 number_sequence_guard: number sequence % cannot be deleted', OLD."key";
  END IF;
  IF NEW."key" <> OLD."key" THEN
    RAISE EXCEPTION 'G13 number_sequence_guard: a number sequence cannot be renamed';
  END IF;
  IF NEW."nextValue" < OLD."nextValue" THEN
    RAISE EXCEPTION 'G13 number_sequence_guard: sequence % cannot move backwards from % to % (numbers already issued would repeat)', OLD."key", OLD."nextValue", NEW."nextValue";
  END IF;
  RETURN NEW;
END $$;

CREATE TRIGGER number_sequence_guard
  BEFORE UPDATE OR DELETE ON "numberSequence"
  FOR EACH ROW EXECUTE FUNCTION number_sequence_guard();
