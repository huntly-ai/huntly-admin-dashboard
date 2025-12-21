import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAuth } from "@/lib/auth"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await verifyAuth(request)
    if (!auth.isValid) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { id } = await params
    const stories = await prisma.internalStory.findMany({
      where: {
        internalProjectId: id,
      },
      include: {
        tasks: {
          orderBy: {
            order: "asc",
          },
        },
        epic: true,
      },
      orderBy: {
        order: "asc",
      },
    })

    return NextResponse.json(stories)
  } catch (error) {
    console.error("Error fetching internal stories:", error)
    return NextResponse.json(
      { error: "Error fetching stories" },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await verifyAuth(request)
    if (!auth.isValid) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { id } = await params
    const json = await request.json()
    const { title, description, status, priority, points, epicId } = json

    // Get the highest order to put the new story at the end
    const lastStory = await prisma.internalStory.findFirst({
      where: { internalProjectId: id, status },
      orderBy: { order: "desc" },
    })
    const newOrder = lastStory ? lastStory.order + 1 : 0

    const story = await prisma.internalStory.create({
      data: {
        title,
        description,
        status: status || "TODO",
        priority: priority || "MEDIUM",
        points: points ? parseInt(points) : 0,
        internalProjectId: id,
        epicId: epicId || null,
        order: newOrder,
      },
      include: {
        epic: true,
      },
    })

    return NextResponse.json(story)
  } catch (error) {
    console.error("Error creating internal story:", error)
    return NextResponse.json(
      { error: "Error creating story" },
      { status: 500 }
    )
  }
}
