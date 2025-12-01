import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const epics = await prisma.epic.findMany({
      where: {
        projectId: id,
      },
      include: {
        stories: {
          include: {
            tasks: true,
            storyMembers: {
              include: {
                member: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(epics)
  } catch (error) {
    console.error("Error fetching epics:", error)
    return NextResponse.json(
      { error: "Error fetching epics" },
      { status: 500 }
    )
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const json = await request.json()
    const { title, description, status, priority, startDate, endDate } = json

    const epic = await prisma.epic.create({
      data: {
        title,
        description,
        status,
        priority,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        projectId: id,
      },
    })

    return NextResponse.json(epic)
  } catch (error) {
    console.error("Error creating epic:", error)
    return NextResponse.json(
      { error: "Error creating epic" },
      { status: 500 }
    )
  }
}

