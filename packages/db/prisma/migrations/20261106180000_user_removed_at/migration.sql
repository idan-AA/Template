-- Additive only: one nullable column, no default, no backfill. Nothing reads it
-- until the code that removes members ships, and a second run is a no-op.

-- AlterTable
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "removedAt" TIMESTAMP(3);
