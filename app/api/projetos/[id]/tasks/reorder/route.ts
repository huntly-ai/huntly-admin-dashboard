import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAuth } from "@/lib/auth"

// PUT /api/projetos/[id]/tasks/reorder - Reorder tasks (for drag and drop)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await verifyAuth(request)
    if (!authResult.isValid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { taskId, newStatus, newOrder } = body

    // Verify task exists and belongs to project
    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        projectId: id,
      },
    })

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    const oldStatus = task.status
    const statusChanged = oldStatus !== newStatus

    // If status changed, update completedAt
    let completedAt = task.completedAt
    if (statusChanged) {
      if (newStatus === 'DONE' && oldStatus !== 'DONE') {
        completedAt = new Date()
      } else if (newStatus !== 'DONE') {
        completedAt = null
      }
    }

    // Update the task
    await prisma.task.update({
      where: { id: taskId },
      data: {
        status: newStatus,
        order: newOrder,
        completedAt,
      },
    })

    // Reorder other tasks in the new column
    if (statusChanged) {
      // Get all tasks in the new status column
      const tasksInNewColumn = await prisma.task.findMany({
        where: {
          projectId: id,
          status: newStatus,
          id: { not: taskId },
        },
        orderBy: {
          order: 'asc',
        },
      })

      // Reorder tasks
      const updates = tasksInNewColumn.map((t, index) => {
        const calculatedOrder = index >= newOrder ? index + 1 : index
        return prisma.task.update({
          where: { id: t.id },
          data: { order: calculatedOrder },
        })
      })

      await Promise.all(updates)
    }

    // Fetch all tasks to return updated state
    const tasks = await prisma.task.findMany({
      where: {
        projectId: id,
      },
      include: {
        taskMembers: {
          include: {
            member: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
                avatar: true,
              },
            },
          },
        },
        taskTeams: {
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
      orderBy: [
        { status: 'asc' },
        { order: 'asc' },
      ],
    })

    return NextResponse.json(tasks)
  } catch (error) {
    console.error("Error reordering tasks:", error)
    return NextResponse.json(
      { error: "Failed to reorder tasks" },
      { status: 500 }
    )
  }
}

