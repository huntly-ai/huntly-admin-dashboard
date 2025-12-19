import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAuth } from "@/lib/auth"

export async function PUT(
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
    const { title, description, status, priority, points, epicId, memberIds } = json

    // Handle members update if provided
    if (memberIds) {
      // First delete existing members
      await prisma.storyMember.deleteMany({
        where: { storyId: id },
      })
    }

    const story = await prisma.story.update({
      where: { id },
      data: {
        title,
        description,
        status,
        priority,
        points: points !== undefined ? parseInt(points) : undefined,
        epicId: epicId === "unassigned" ? null : epicId,
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
    console.error("Error updating story:", error)
    return NextResponse.json(
      { error: "Error updating story" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await verifyAuth(request)
    if (!auth.isValid) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { id } = await params
    await prisma.story.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting story:", error)
    return NextResponse.json(
      { error: "Error deleting story" },
      { status: 500 }
    )
  }
}

