import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const stories = await prisma.story.findMany({
      where: {
        projectId: id,
      },
      include: {
        tasks: {
          include: {
            taskMembers: {
              include: {
                member: true,
              }
            }
          },
          orderBy: {
            order: "asc"
          }
        },
        storyMembers: {
          include: {
            member: true,
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
    console.error("Error fetching stories:", error)
    return NextResponse.json(
      { error: "Error fetching stories" },
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
    const { title, description, status, priority, points, epicId, memberIds } = json

    // Get the highest order to put the new story at the end
    const lastStory = await prisma.story.findFirst({
      where: { projectId: id, status },
      orderBy: { order: "desc" },
    })
    const newOrder = lastStory ? lastStory.order + 1 : 0

    const story = await prisma.story.create({
      data: {
        title,
        description,
        status,
        priority,
        points: points ? parseInt(points) : 0,
        projectId: id,
        epicId: epicId || null,
        order: newOrder,
        storyMembers: memberIds
          ? {
              create: memberIds.map((memberId: string) => ({
                memberId,
              })),
            }
          : undefined,
      },
      include: {
        storyMembers: {
          include: {
            member: true,
          },
        },
        epic: true,
      },
    })

    return NextResponse.json(story)
  } catch (error) {
    console.error("Error creating story:", error)
    return NextResponse.json(
      { error: "Error creating story" },
      { status: 500 }
    )
  }
}
