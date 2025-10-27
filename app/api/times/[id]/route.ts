import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const team = await prisma.team.findUnique({
      where: { id },
      include: {
        teamMemberships: {
          include: {
            member: true,
          },
        },
        projectTeams: {
          include: {
            project: {
              select: {
                id: true,
                name: true,
                status: true,
              },
            },
          },
        },
      },
    })

    if (!team) {
      return NextResponse.json(
        { error: "Team not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(team)
  } catch (error) {
    console.error("Error fetching team:", error)
    return NextResponse.json(
      { error: "Failed to fetch team" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()

    const { memberIds, ...teamData } = body

    // Update team members if provided
    if (memberIds !== undefined) {
      // Delete existing memberships
      await prisma.teamMembership.deleteMany({
        where: { teamId: id },
      })

      // Create new memberships
      if (memberIds.length > 0) {
        await prisma.teamMembership.createMany({
          data: memberIds.map((memberId: string) => ({
            teamId: id,
            memberId,
          })),
        })
      }
    }

    const team = await prisma.team.update({
      where: { id },
      data: {
        name: teamData.name,
        description: teamData.description,
        leadId: teamData.leadId,
      },
      include: {
        teamMemberships: {
          include: {
            member: true,
          },
        },
      },
    })

    return NextResponse.json(team)
  } catch (error) {
    console.error("Error updating team:", error)
    return NextResponse.json(
      { error: "Failed to update team" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    await prisma.team.delete({
      where: { id },
    })

    return NextResponse.json({ message: "Team deleted successfully" })
  } catch (error) {
    console.error("Error deleting team:", error)
    return NextResponse.json(
      { error: "Failed to delete team" },
      { status: 500 }
    )
  }
}

