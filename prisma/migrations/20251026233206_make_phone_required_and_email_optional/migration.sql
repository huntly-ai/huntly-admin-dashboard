/*
  Warnings:

  - Made the column `phone` on table `Lead` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "public"."Lead_email_key";

-- AlterTable
ALTER TABLE "Lead" ALTER COLUMN "email" DROP NOT NULL,
ALTER COLUMN "phone" SET NOT NULL;
