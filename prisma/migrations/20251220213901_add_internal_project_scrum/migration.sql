-- CreateTable
CREATE TABLE "InternalEpic" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "EpicStatus" NOT NULL DEFAULT 'TODO',
    "priority" "TaskPriority" NOT NULL DEFAULT 'MEDIUM',
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "internalProjectId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InternalEpic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InternalStory" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "StoryStatus" NOT NULL DEFAULT 'TODO',
    "priority" "TaskPriority" NOT NULL DEFAULT 'MEDIUM',
    "points" INTEGER DEFAULT 0,
    "internalProjectId" TEXT NOT NULL,
    "epicId" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InternalStory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InternalTask" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "TaskStatus" NOT NULL DEFAULT 'TODO',
    "priority" "TaskPriority" NOT NULL DEFAULT 'MEDIUM',
    "internalProjectId" TEXT NOT NULL,
    "storyId" TEXT,
    "dueDate" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "order" INTEGER NOT NULL DEFAULT 0,
    "estimatedHours" DOUBLE PRECISION,
    "actualHours" DOUBLE PRECISION,
    "tags" TEXT,
    "attachments" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InternalTask_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "InternalEpic_internalProjectId_idx" ON "InternalEpic"("internalProjectId");

-- CreateIndex
CREATE INDEX "InternalEpic_status_idx" ON "InternalEpic"("status");

-- CreateIndex
CREATE INDEX "InternalStory_internalProjectId_idx" ON "InternalStory"("internalProjectId");

-- CreateIndex
CREATE INDEX "InternalStory_epicId_idx" ON "InternalStory"("epicId");

-- CreateIndex
CREATE INDEX "InternalStory_status_idx" ON "InternalStory"("status");

-- CreateIndex
CREATE INDEX "InternalTask_internalProjectId_idx" ON "InternalTask"("internalProjectId");

-- CreateIndex
CREATE INDEX "InternalTask_storyId_idx" ON "InternalTask"("storyId");

-- CreateIndex
CREATE INDEX "InternalTask_status_idx" ON "InternalTask"("status");

-- CreateIndex
CREATE INDEX "InternalTask_priority_idx" ON "InternalTask"("priority");

-- CreateIndex
CREATE INDEX "InternalTask_dueDate_idx" ON "InternalTask"("dueDate");

-- AddForeignKey
ALTER TABLE "InternalEpic" ADD CONSTRAINT "InternalEpic_internalProjectId_fkey" FOREIGN KEY ("internalProjectId") REFERENCES "InternalProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InternalStory" ADD CONSTRAINT "InternalStory_internalProjectId_fkey" FOREIGN KEY ("internalProjectId") REFERENCES "InternalProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InternalStory" ADD CONSTRAINT "InternalStory_epicId_fkey" FOREIGN KEY ("epicId") REFERENCES "InternalEpic"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InternalTask" ADD CONSTRAINT "InternalTask_internalProjectId_fkey" FOREIGN KEY ("internalProjectId") REFERENCES "InternalProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InternalTask" ADD CONSTRAINT "InternalTask_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "InternalStory"("id") ON DELETE SET NULL ON UPDATE CASCADE;
