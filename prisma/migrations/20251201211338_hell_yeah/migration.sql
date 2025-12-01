-- CreateEnum
CREATE TYPE "EpicStatus" AS ENUM ('TODO', 'IN_PROGRESS', 'DONE');

-- CreateEnum
CREATE TYPE "StoryStatus" AS ENUM ('TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE');

-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "storyId" TEXT;

-- CreateTable
CREATE TABLE "Epic" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "EpicStatus" NOT NULL DEFAULT 'TODO',
    "priority" "TaskPriority" NOT NULL DEFAULT 'MEDIUM',
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "projectId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Epic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Story" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "StoryStatus" NOT NULL DEFAULT 'TODO',
    "priority" "TaskPriority" NOT NULL DEFAULT 'MEDIUM',
    "points" INTEGER DEFAULT 0,
    "projectId" TEXT NOT NULL,
    "epicId" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Story_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StoryMember" (
    "id" TEXT NOT NULL,
    "storyId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StoryMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StoryTeam" (
    "id" TEXT NOT NULL,
    "storyId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StoryTeam_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Epic_projectId_idx" ON "Epic"("projectId");

-- CreateIndex
CREATE INDEX "Epic_status_idx" ON "Epic"("status");

-- CreateIndex
CREATE INDEX "Story_projectId_idx" ON "Story"("projectId");

-- CreateIndex
CREATE INDEX "Story_epicId_idx" ON "Story"("epicId");

-- CreateIndex
CREATE INDEX "Story_status_idx" ON "Story"("status");

-- CreateIndex
CREATE INDEX "StoryMember_storyId_idx" ON "StoryMember"("storyId");

-- CreateIndex
CREATE INDEX "StoryMember_memberId_idx" ON "StoryMember"("memberId");

-- CreateIndex
CREATE UNIQUE INDEX "StoryMember_storyId_memberId_key" ON "StoryMember"("storyId", "memberId");

-- CreateIndex
CREATE INDEX "StoryTeam_storyId_idx" ON "StoryTeam"("storyId");

-- CreateIndex
CREATE INDEX "StoryTeam_teamId_idx" ON "StoryTeam"("teamId");

-- CreateIndex
CREATE UNIQUE INDEX "StoryTeam_storyId_teamId_key" ON "StoryTeam"("storyId", "teamId");

-- CreateIndex
CREATE INDEX "Task_storyId_idx" ON "Task"("storyId");

-- AddForeignKey
ALTER TABLE "Epic" ADD CONSTRAINT "Epic_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Story" ADD CONSTRAINT "Story_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Story" ADD CONSTRAINT "Story_epicId_fkey" FOREIGN KEY ("epicId") REFERENCES "Epic"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoryMember" ADD CONSTRAINT "StoryMember_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "Story"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoryMember" ADD CONSTRAINT "StoryMember_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "TeamMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoryTeam" ADD CONSTRAINT "StoryTeam_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "Story"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoryTeam" ADD CONSTRAINT "StoryTeam_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "Story"("id") ON DELETE SET NULL ON UPDATE CASCADE;
