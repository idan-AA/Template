-- CreateTable
CREATE TABLE "auditEvent" (
    "id" TEXT NOT NULL,
    "at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "module" TEXT NOT NULL,
    "actorType" TEXT NOT NULL,
    "actorId" TEXT,
    "actorLabel" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "before" JSONB,
    "after" JSONB,
    "reason" TEXT,
    "requestId" TEXT,

    CONSTRAINT "auditEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "auditEvent_entityType_entityId_at_idx" ON "auditEvent"("entityType", "entityId", "at");

-- CreateIndex
CREATE INDEX "auditEvent_module_action_at_idx" ON "auditEvent"("module", "action", "at");

-- CreateIndex
CREATE INDEX "auditEvent_actorId_at_idx" ON "auditEvent"("actorId", "at");

-- Hand-written: the audit trail is append-only. Prisma does not see triggers or
-- functions, so it neither reports drift for them nor drops them.
CREATE FUNCTION audit_event_refuse_change() RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'auditEvent is append-only: % is not allowed', TG_OP;
END;
$$;

CREATE TRIGGER audit_append_only
BEFORE UPDATE OR DELETE ON "auditEvent"
FOR EACH ROW EXECUTE FUNCTION audit_event_refuse_change();

CREATE TRIGGER audit_no_truncate
BEFORE TRUNCATE ON "auditEvent"
FOR EACH STATEMENT EXECUTE FUNCTION audit_event_refuse_change();
