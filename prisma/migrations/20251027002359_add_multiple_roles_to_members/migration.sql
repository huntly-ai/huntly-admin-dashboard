-- AlterEnum
ALTER TYPE "MemberRole" ADD VALUE 'FOUNDER';

-- AlterTable
ALTER TABLE "TeamMember" ADD COLUMN     "roles" TEXT;
