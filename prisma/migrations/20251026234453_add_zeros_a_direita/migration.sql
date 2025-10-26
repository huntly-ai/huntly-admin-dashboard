/*
  Warnings:

  - The values [EMAIL_CAMPAIGN,COLD_CALL] on the enum `LeadSource` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "LeadSource_new" AS ENUM ('WEBSITE', 'REFERRAL', 'SOCIAL_MEDIA', 'ZEROS_A_DIREITA', 'EVENT', 'OTHER');
ALTER TABLE "public"."Lead" ALTER COLUMN "source" DROP DEFAULT;
ALTER TABLE "Lead" ALTER COLUMN "source" TYPE "LeadSource_new" USING ("source"::text::"LeadSource_new");
ALTER TYPE "LeadSource" RENAME TO "LeadSource_old";
ALTER TYPE "LeadSource_new" RENAME TO "LeadSource";
DROP TYPE "public"."LeadSource_old";
ALTER TABLE "Lead" ALTER COLUMN "source" SET DEFAULT 'OTHER';
COMMIT;
