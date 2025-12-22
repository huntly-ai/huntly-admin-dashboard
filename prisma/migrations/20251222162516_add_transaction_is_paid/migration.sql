-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "isPaid" BOOLEAN NOT NULL DEFAULT true;

-- CreateIndex
CREATE INDEX "Transaction_isPaid_idx" ON "Transaction"("isPaid");
