-- Additive only: two new tables for the QuickBooks module. Nothing existing is
-- altered, dropped or backfilled, and nothing reads them until the module is
-- switched on, so it is safe to apply before the code that uses them. IF NOT
-- EXISTS makes a second run a no-op. Status and environment are text kept in range
-- by CHECK constraints (no enum types to rewrite later).

-- CreateTable
CREATE TABLE IF NOT EXISTS "quickbooksConnection" (
    "id" TEXT NOT NULL DEFAULT 'quickbooks',
    "realmId" TEXT NOT NULL,
    "environment" TEXT NOT NULL,
    "companyName" TEXT,
    "homeCurrency" TEXT,
    "country" TEXT,
    "status" TEXT NOT NULL,
    "encryptedAccessToken" TEXT,
    "encryptedRefreshToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenIssuedAt" TIMESTAMP(3),
    "connectedById" TEXT,
    "connectedAt" TIMESTAMP(3),
    "lastCheckedAt" TIMESTAMP(3),
    "lastSyncedAt" TIMESTAMP(3),
    "cdcWatermark" TIMESTAMP(3),
    "lastError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quickbooksConnection_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "quickbooksConnection_single_row" CHECK ("id" = 'quickbooks'),
    CONSTRAINT "quickbooksConnection_status_check" CHECK ("status" IN ('CONNECTED', 'NEEDS_RECONNECT', 'DISCONNECTED')),
    CONSTRAINT "quickbooksConnection_environment_check" CHECK ("environment" IN ('sandbox', 'production'))
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "quickbooksOauthState" (
    "stateHash" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "environment" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quickbooksOauthState_pkey" PRIMARY KEY ("stateHash"),
    CONSTRAINT "quickbooksOauthState_environment_check" CHECK ("environment" IN ('sandbox', 'production'))
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "quickbooksOauthState_expiresAt_idx" ON "quickbooksOauthState"("expiresAt");
