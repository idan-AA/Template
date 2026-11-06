-- Additive only: one new table and one new nullable column. Nothing is dropped,
-- rewritten or backfilled, and no existing code reads either, so it is safe to
-- apply before the code that uses it. IF NOT EXISTS makes a second run a no-op.

-- CreateTable
CREATE TABLE IF NOT EXISTS "moduleSwitch" (
    "moduleId" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL,
    "changedById" TEXT,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "moduleSwitch_pkey" PRIMARY KEY ("moduleId")
);

-- AlterTable
ALTER TABLE "appSetting" ADD COLUMN IF NOT EXISTS "developerUserId" TEXT;
