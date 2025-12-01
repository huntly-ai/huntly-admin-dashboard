import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params
    const json = await request.json()
    const { storyId, newStatus, newOrder } = json

    // Start a transaction to ensure consistency
    const updatedStories = await prisma.$transaction(async (tx) => {
      // 1. Get the story to be moved
      const storyToMove = await tx.story.findUnique({
        where: { id: storyId },
      })

      if (!storyToMove) {
        throw new Error("Story not found")
      }

      const oldStatus = storyToMove.status
      const oldOrder = storyToMove.order

      // 2. If status changed, update the story status first
      if (oldStatus !== newStatus) {
        // Shift up items in the old column
        await tx.story.updateMany({
          where: {
            projectId,
            status: oldStatus,
            order: { gt: oldOrder },
          },
          data: {
            order: { decrement: 1 },
          },
        })

        // Shift down items in the new column
        await tx.story.updateMany({
          where: {
            projectId,
            status: newStatus,
            order: { gte: newOrder },
          },
          data: {
            order: { increment: 1 },
          },
        })

        // Update the story
        await tx.story.update({
          where: { id: storyId },
          data: {
            status: newStatus,
            order: newOrder,
          },
        })
      } else {
        // Same column reorder
        if (newOrder > oldOrder) {
          // Moved down
          await tx.story.updateMany({
            where: {
              projectId,
              status: oldStatus,
              order: { gt: oldOrder, lte: newOrder },
            },
            data: {
              order: { decrement: 1 },
            },
          })
        } else {
          // Moved up
          await tx.story.updateMany({
            where: {
              projectId,
              status: oldStatus,
              order: { gte: newOrder, lt: oldOrder },
            },
            data: {
              order: { increment: 1 },
            },
          })
        }

        // Update the story
        await tx.story.update({
          where: { id: storyId },
          data: {
            order: newOrder,
          },
        })
      }

      // Return all stories for this project to update local state
      return await tx.story.findMany({
        where: { projectId },
        include: {
          tasks: true,
          storyMembers: {
            include: {
              member: true,
            },
          },
          epic: true,
        },
        orderBy: { order: "asc" },
      })
    })

    return NextResponse.json(updatedStories)
  } catch (error) {
    console.error("Error reordering stories:", error)
    return NextResponse.json(
      { error: "Error reordering stories" },
      { status: 500 }
    )
  }
}

