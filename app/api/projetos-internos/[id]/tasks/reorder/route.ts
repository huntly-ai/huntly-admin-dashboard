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
    const body = await request.json()
    const { taskId, newStatus, newOrder } = body

    // Verify task exists and belongs to project
    const task = await prisma.internalTask.findFirst({
      where: {
        id: taskId,
        internalProjectId: id,
      },
    })

    if (!task) {
      return NextResponse.json({ error: "Task não encontrada" }, { status: 404 })
    }

    const oldStatus = task.status
    const statusChanged = oldStatus !== newStatus

    // If status changed, update completedAt
    let completedAt = task.completedAt
    if (statusChanged) {
      if (newStatus === "DONE" && oldStatus !== "DONE") {
        completedAt = new Date()
      } else if (newStatus !== "DONE") {
        completedAt = null
      }
    }

    // Update the task
    await prisma.internalTask.update({
      where: { id: taskId },
      data: {
        status: newStatus,
        order: newOrder,
        completedAt,
      },
    })

    // Reorder other tasks in the new column
    if (statusChanged) {
      const tasksInNewColumn = await prisma.internalTask.findMany({
        where: {
          internalProjectId: id,
          status: newStatus,
          id: { not: taskId },
        },
        orderBy: {
          order: "asc",
        },
      })

      const updates = tasksInNewColumn.map((t, index) => {
        const calculatedOrder = index >= newOrder ? index + 1 : index
        return prisma.internalTask.update({
          where: { id: t.id },
          data: { order: calculatedOrder },
        })
      })

      await Promise.all(updates)
    }

    // Fetch all tasks to return updated state
    const tasks = await prisma.internalTask.findMany({
      where: {
        internalProjectId: id,
      },
      orderBy: [{ status: "asc" }, { order: "asc" }],
    })

    return NextResponse.json(tasks)
  } catch (error) {
    console.error("Error reordering internal tasks:", error)
    return NextResponse.json(
      { error: "Failed to reorder tasks" },
      { status: 500 }
    )
  }
}
