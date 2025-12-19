import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAuth } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuth(request)
    if (!auth.isValid) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const teams = await prisma.team.findMany({
      include: {
        teamMemberships: {
          include: {
            member: true,
          },
        },
        _count: {
          select: {
            projectTeams: true,
            teamMemberships: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    })

    return NextResponse.json(teams)
  } catch (error) {
    console.error("Error fetching teams:", error)
    return NextResponse.json(
      { error: "Failed to fetch teams" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAuth(request)
    if (!auth.isValid) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const body = await request.json()

    const { memberIds, ...teamData } = body

    const team = await prisma.team.create({
      data: {
        name: teamData.name,
        description: teamData.description,
        leadId: teamData.leadId,
        teamMemberships: memberIds?.length
          ? {
              create: memberIds.map((memberId: string) => ({
                memberId,
              })),
            }
          : undefined,
      },
      include: {
        teamMemberships: {
          include: {
            member: true,
          },
        },
      },
    })

    return NextResponse.json(team, { status: 201 })
  } catch (error) {
    console.error("Error creating team:", error)
    return NextResponse.json(
      { error: "Failed to create team" },
      { status: 500 }
    )
  }
}

