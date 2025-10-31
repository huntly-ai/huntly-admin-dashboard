-- CreateTable
CREATE TABLE "Meeting" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "location" TEXT,
    "leadId" TEXT,
    "clientId" TEXT,
    "tags" TEXT,
    "notes" TEXT,
    "recordingUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Meeting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MeetingMember" (
    "id" TEXT NOT NULL,
    "meetingId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "rsvpStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "rsvpAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MeetingMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MeetingTeam" (
    "id" TEXT NOT NULL,
    "meetingId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MeetingTeam_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Meeting_leadId_idx" ON "Meeting"("leadId");

-- CreateIndex
CREATE INDEX "Meeting_clientId_idx" ON "Meeting"("clientId");

-- CreateIndex
CREATE INDEX "Meeting_startDate_idx" ON "Meeting"("startDate");

-- CreateIndex
CREATE INDEX "Meeting_status_idx" ON "Meeting"("status");

-- CreateIndex
CREATE INDEX "MeetingMember_meetingId_idx" ON "MeetingMember"("meetingId");

-- CreateIndex
CREATE INDEX "MeetingMember_memberId_idx" ON "MeetingMember"("memberId");

-- CreateIndex
CREATE UNIQUE INDEX "MeetingMember_meetingId_memberId_key" ON "MeetingMember"("meetingId", "memberId");

-- CreateIndex
CREATE INDEX "MeetingTeam_meetingId_idx" ON "MeetingTeam"("meetingId");

-- CreateIndex
CREATE INDEX "MeetingTeam_teamId_idx" ON "MeetingTeam"("teamId");

-- CreateIndex
CREATE UNIQUE INDEX "MeetingTeam_meetingId_teamId_key" ON "MeetingTeam"("meetingId", "teamId");

-- AddForeignKey
ALTER TABLE "Meeting" ADD CONSTRAINT "Meeting_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Meeting" ADD CONSTRAINT "Meeting_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MeetingMember" ADD CONSTRAINT "MeetingMember_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "Meeting"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MeetingMember" ADD CONSTRAINT "MeetingMember_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "TeamMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MeetingTeam" ADD CONSTRAINT "MeetingTeam_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "Meeting"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MeetingTeam" ADD CONSTRAINT "MeetingTeam_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;
