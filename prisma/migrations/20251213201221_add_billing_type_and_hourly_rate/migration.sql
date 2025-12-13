-- CreateEnum
CREATE TYPE "BillingType" AS ENUM ('FIXED_PRICE', 'HOURLY_RATE');

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "billingType" "BillingType" NOT NULL DEFAULT 'FIXED_PRICE',
ADD COLUMN     "hourlyRate" DOUBLE PRECISION,
ALTER COLUMN "projectValue" SET DEFAULT 0;

-- CreateIndex
CREATE INDEX "Project_billingType_idx" ON "Project"("billingType");
