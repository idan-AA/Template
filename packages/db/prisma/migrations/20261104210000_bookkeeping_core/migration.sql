-- CreateEnum
CREATE TYPE "AccountType" AS ENUM ('ASSET', 'LIABILITY', 'EQUITY', 'INCOME', 'EXPENSE');

-- CreateEnum
CREATE TYPE "AccountSubtype" AS ENUM ('BANK', 'CASH', 'CREDIT_CARD', 'ACCOUNTS_RECEIVABLE', 'CURRENT_ASSET', 'FIXED_ASSET', 'OTHER_ASSET', 'ACCOUNTS_PAYABLE', 'CURRENT_LIABILITY', 'TAX_LIABILITY', 'LONG_TERM_LIABILITY', 'OWNER_EQUITY', 'RETAINED_EARNINGS', 'REVENUE', 'OTHER_INCOME', 'COST_OF_SALES', 'OPERATING_EXPENSE', 'OTHER_EXPENSE');

-- CreateEnum
CREATE TYPE "AccountSystemRole" AS ENUM ('ACCOUNTS_RECEIVABLE', 'ACCOUNTS_PAYABLE', 'RETAINED_EARNINGS', 'OPENING_BALANCE_EQUITY', 'FX_GAIN_LOSS', 'ROUNDING', 'SUSPENSE');

-- CreateEnum
CREATE TYPE "EntryStatus" AS ENUM ('DRAFT', 'POSTED');

-- CreateEnum
CREATE TYPE "EntrySource" AS ENUM ('MANUAL', 'ADJUSTMENT', 'OPENING_BALANCE', 'INVOICE', 'BILL', 'CREDIT_NOTE', 'VENDOR_CREDIT', 'PAYMENT', 'ALLOCATION', 'BANK_SPEND', 'BANK_RECEIVE', 'TRANSFER', 'REVERSAL');

-- CreateEnum
CREATE TYPE "LineKind" AS ENUM ('NORMAL', 'TAX', 'FX_ADJUSTMENT', 'ROUNDING');

-- CreateEnum
CREATE TYPE "FxOrigin" AS ENUM ('IDENTITY', 'MANUAL', 'FETCHED');

-- CreateTable
CREATE TABLE "ledgerSettings" (
    "id" TEXT NOT NULL,
    "baseCurrency" VARCHAR(3) NOT NULL,
    "timezone" TEXT NOT NULL,
    "fiscalYearStartMonth" INTEGER NOT NULL DEFAULT 1,
    "lockDate" DATE,
    "hardLockDate" DATE,
    "conversionDate" DATE,
    "firstPostedAt" TIMESTAMP(3),
    "attentionStaleDays" INTEGER NOT NULL DEFAULT 7,
    "setupCompletedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ledgerSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "numberSequence" (
    "key" TEXT NOT NULL,
    "prefix" VARCHAR(12) NOT NULL,
    "padding" INTEGER NOT NULL DEFAULT 4,
    "nextValue" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "numberSequence_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "ledgerAccount" (
    "id" TEXT NOT NULL,
    "code" VARCHAR(16) NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "type" "AccountType" NOT NULL,
    "subtype" "AccountSubtype" NOT NULL,
    "systemRole" "AccountSystemRole",
    "parentId" TEXT,
    "currency" VARCHAR(3),
    "description" TEXT,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "archivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ledgerAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "journalEntry" (
    "id" TEXT NOT NULL,
    "number" TEXT,
    "date" DATE NOT NULL,
    "memo" TEXT,
    "status" "EntryStatus" NOT NULL DEFAULT 'DRAFT',
    "source" "EntrySource" NOT NULL,
    "sourceId" TEXT,
    "sourceKey" TEXT,
    "baseCurrency" VARCHAR(3) NOT NULL,
    "reversesId" TEXT,
    "proposalId" TEXT,
    "postedAt" TIMESTAMP(3),
    "postedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" TEXT NOT NULL,

    CONSTRAINT "journalEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "journalLine" (
    "id" TEXT NOT NULL,
    "entryId" TEXT NOT NULL,
    "lineNo" INTEGER NOT NULL,
    "accountId" TEXT NOT NULL,
    "kind" "LineKind" NOT NULL DEFAULT 'NORMAL',
    "currency" VARCHAR(3) NOT NULL,
    "debitMinor" BIGINT NOT NULL DEFAULT 0,
    "creditMinor" BIGINT NOT NULL DEFAULT 0,
    "baseDebitMinor" BIGINT NOT NULL DEFAULT 0,
    "baseCreditMinor" BIGINT NOT NULL DEFAULT 0,
    "fxRate" DECIMAL(24,10) NOT NULL,
    "fxOrigin" "FxOrigin" NOT NULL,
    "fxRateAt" TIMESTAMP(3) NOT NULL,
    "counterpartyId" TEXT,
    "documentId" TEXT,
    "paymentId" TEXT,
    "taxRateId" TEXT,
    "memo" TEXT,

    CONSTRAINT "journalLine_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ledgerAccount_code_key" ON "ledgerAccount"("code");

-- CreateIndex
CREATE UNIQUE INDEX "ledgerAccount_systemRole_key" ON "ledgerAccount"("systemRole");

-- CreateIndex
CREATE INDEX "ledgerAccount_type_sortOrder_idx" ON "ledgerAccount"("type", "sortOrder");

-- CreateIndex
CREATE INDEX "ledgerAccount_parentId_idx" ON "ledgerAccount"("parentId");

-- CreateIndex
CREATE INDEX "ledgerAccount_archivedAt_idx" ON "ledgerAccount"("archivedAt");

-- CreateIndex
CREATE UNIQUE INDEX "journalEntry_number_key" ON "journalEntry"("number");

-- CreateIndex
CREATE UNIQUE INDEX "journalEntry_sourceKey_key" ON "journalEntry"("sourceKey");

-- CreateIndex
CREATE UNIQUE INDEX "journalEntry_reversesId_key" ON "journalEntry"("reversesId");

-- CreateIndex
CREATE INDEX "journalEntry_date_status_idx" ON "journalEntry"("date", "status");

-- CreateIndex
CREATE INDEX "journalEntry_source_sourceId_idx" ON "journalEntry"("source", "sourceId");

-- CreateIndex
CREATE INDEX "journalEntry_status_createdAt_idx" ON "journalEntry"("status", "createdAt");

-- CreateIndex
CREATE INDEX "journalLine_accountId_entryId_idx" ON "journalLine"("accountId", "entryId");

-- CreateIndex
CREATE INDEX "journalLine_documentId_idx" ON "journalLine"("documentId");

-- CreateIndex
CREATE INDEX "journalLine_paymentId_idx" ON "journalLine"("paymentId");

-- CreateIndex
CREATE INDEX "journalLine_counterpartyId_accountId_idx" ON "journalLine"("counterpartyId", "accountId");

-- CreateIndex
CREATE INDEX "journalLine_taxRateId_idx" ON "journalLine"("taxRateId");

-- CreateIndex
CREATE UNIQUE INDEX "journalLine_entryId_lineNo_key" ON "journalLine"("entryId", "lineNo");

-- AddForeignKey
ALTER TABLE "ledgerAccount" ADD CONSTRAINT "ledgerAccount_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "ledgerAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "journalEntry" ADD CONSTRAINT "journalEntry_reversesId_fkey" FOREIGN KEY ("reversesId") REFERENCES "journalEntry"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "journalLine" ADD CONSTRAINT "journalLine_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "journalEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "journalLine" ADD CONSTRAINT "journalLine_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "ledgerAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

