import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const meetings = await prisma.meeting.findMany({
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
      orderBy: {
        startDate: "desc",
      },
    })

    return NextResponse.json(meetings)
  } catch (error) {
    console.error("Error fetching meetings:", error)
    return NextResponse.json(
      { error: "Failed to fetch meetings" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
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

    // Create meeting
    const meeting = await prisma.meeting.create({
      data: {
        title: data.title,
        description: data.description || null,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
        location: data.location || null,
        leadId: data.leadId || null,
        clientId: data.clientId || null,
        tags,
        notes: data.notes || null,
        status: data.status || "SCHEDULED",
      },
    })

    // Add members
    if (data.memberIds && data.memberIds.length > 0) {
      await Promise.all(
        data.memberIds.map((memberId: string) =>
          prisma.meetingMember.create({
            data: {
              meetingId: meeting.id,
              memberId,
            },
          })
        )
      )
    }

    // Add teams
    if (data.teamIds && data.teamIds.length > 0) {
      await Promise.all(
        data.teamIds.map((teamId: string) =>
          prisma.meetingTeam.create({
            data: {
              meetingId: meeting.id,
              teamId,
            },
          })
        )
      )
    }

    // Fetch the created meeting with all relations
    const createdMeeting = await prisma.meeting.findUnique({
      where: { id: meeting.id },
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

    return NextResponse.json(createdMeeting, { status: 201 })
  } catch (error) {
    console.error("Error creating meeting:", error)
    return NextResponse.json(
      { error: "Failed to create meeting" },
      { status: 500 }
    )
  }
}
