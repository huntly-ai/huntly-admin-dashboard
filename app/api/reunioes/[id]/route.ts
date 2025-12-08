import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const data = await request.json()

    // Parse tags if provided
    const tags = data.tags
      ? JSON.stringify(
          data.tags
            .split(",")
            .map((tag: string) => tag.trim())
            .filter((tag: string) => tag)
        )
      : null

    // Parse dates properly
    const startDate = new Date(data.startDate)
    const endDate = data.endDate ? new Date(data.endDate) : null

    // Validate dates
    if (isNaN(startDate.getTime())) {
      return NextResponse.json(
        { error: "Data de início inválida" },
        { status: 400 }
      )
    }

    if (endDate && isNaN(endDate.getTime())) {
      return NextResponse.json(
        { error: "Data de fim inválida" },
        { status: 400 }
      )
    }

    // Update meeting
    await prisma.meeting.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description || null,
        startDate,
        endDate,
        location: data.location || null,
        leadId: data.leadId || null,
        clientId: data.clientId || null,
        tags,
        notes: data.notes || null,
        status: data.status || "SCHEDULED",
      },
    })

    // Delete existing members and teams
    await prisma.meetingMember.deleteMany({
      where: { meetingId: id },
    })
    await prisma.meetingTeam.deleteMany({
      where: { meetingId: id },
    })

    // Add new members
    if (data.memberIds && data.memberIds.length > 0) {
      await Promise.all(
        data.memberIds.map((memberId: string) =>
          prisma.meetingMember.create({
            data: {
              meetingId: id,
              memberId,
            },
          })
        )
      )
    }

    // Add new teams
    if (data.teamIds && data.teamIds.length > 0) {
      await Promise.all(
        data.teamIds.map((teamId: string) =>
          prisma.meetingTeam.create({
            data: {
              meetingId: id,
              teamId,
            },
          })
        )
      )
    }

    // Fetch the updated meeting with all relations
    const updatedMeeting = await prisma.meeting.findUnique({
      where: { id },
      include: {
        lead: {
          select: {
            id: true,
            name: true,
          },
        },
        client: {
          select: {
            id: true,
            name: true,
          },
        },
        meetingMembers: {
          include: {
            member: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        meetingTeams: {
          include: {
            team: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    })

    return NextResponse.json(updatedMeeting)
  } catch (error) {
    console.error("Error updating meeting:", error)
    return NextResponse.json(
      { error: "Failed to update meeting" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Delete all related records
    await prisma.meetingMember.deleteMany({
      where: { meetingId: id },
    })
    await prisma.meetingTeam.deleteMany({
      where: { meetingId: id },
    })

    // Delete meeting
    await prisma.meeting.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting meeting:", error)
    return NextResponse.json(
      { error: "Failed to delete meeting" },
      { status: 500 }
    )
  }
}
