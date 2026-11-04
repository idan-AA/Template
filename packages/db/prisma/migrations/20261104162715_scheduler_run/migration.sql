-- CreateTable
CREATE TABLE "schedulerRun" (
    "job" TEXT NOT NULL,
    "lastSuccessAt" TIMESTAMP(3),
    "lastFailureAt" TIMESTAMP(3),
    "lastError" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "schedulerRun_pkey" PRIMARY KEY ("job")
);
