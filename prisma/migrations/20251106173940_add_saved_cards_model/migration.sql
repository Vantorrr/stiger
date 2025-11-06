-- CreateTable
CREATE TABLE "SavedCard" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "cardLastFour" TEXT NOT NULL,
    "cardFirstSix" TEXT,
    "cardType" TEXT,
    "cardExpDate" TEXT,
    "issuer" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SavedCard_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SavedCard_token_key" ON "SavedCard"("token");

-- CreateIndex
CREATE INDEX "SavedCard_userId_idx" ON "SavedCard"("userId");

-- CreateIndex
CREATE INDEX "SavedCard_accountId_idx" ON "SavedCard"("accountId");

-- CreateIndex
CREATE INDEX "SavedCard_token_idx" ON "SavedCard"("token");

-- AddForeignKey
ALTER TABLE "SavedCard" ADD CONSTRAINT "SavedCard_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
