-- CreateEnum
CREATE TYPE "InternalProjectStatus" AS ENUM ('ACTIVE', 'ARCHIVED');

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "internalProjectId" TEXT;

-- CreateTable
CREATE TABLE "InternalProject" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" "InternalProjectStatus" NOT NULL DEFAULT 'ACTIVE',
    "icon" TEXT,
    "color" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InternalProject_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "InternalProject_status_idx" ON "InternalProject"("status");

-- CreateIndex
CREATE INDEX "InternalProject_createdAt_idx" ON "InternalProject"("createdAt");

-- CreateIndex
CREATE INDEX "Transaction_internalProjectId_idx" ON "Transaction"("internalProjectId");

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_internalProjectId_fkey" FOREIGN KEY ("internalProjectId") REFERENCES "InternalProject"("id") ON DELETE SET NULL ON UPDATE CASCADE;
