import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAuth } from "@/lib/auth"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; taskId: string }> }
) {
  try {
    const auth = await verifyAuth(request)
    if (!auth.isValid) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { taskId } = await params

    const task = await prisma.internalTask.findUnique({
      where: { id: taskId },
      include: {
        story: true,
      },
    })

    if (!task) {
      return NextResponse.json({ error: "Task não encontrada" }, { status: 404 })
    }

    return NextResponse.json(task)
  } catch (error) {
    console.error("Error fetching internal task:", error)
    return NextResponse.json(
      { error: "Failed to fetch task" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; taskId: string }> }
) {
  try {
    const auth = await verifyAuth(request)
    if (!auth.isValid) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { taskId } = await params
    const body = await request.json()

    const existingTask = await prisma.internalTask.findUnique({
      where: { id: taskId },
    })

    if (!existingTask) {
      return NextResponse.json({ error: "Task não encontrada" }, { status: 404 })
    }

    // Handle status change - update order
    let newOrder = existingTask.order
    if (body.status && body.status !== existingTask.status) {
      const lastTaskInNewStatus = await prisma.internalTask.findFirst({
        where: {
          internalProjectId: existingTask.internalProjectId,
          status: body.status,
        },
        orderBy: { order: "desc" },
      })
      newOrder = lastTaskInNewStatus ? lastTaskInNewStatus.order + 1 : 0
    }

    const task = await prisma.internalTask.update({
      where: { id: taskId },
      data: {
        title: body.title ?? existingTask.title,
        description: body.description ?? existingTask.description,
        status: body.status ?? existingTask.status,
        priority: body.priority ?? existingTask.priority,
        storyId: body.storyId !== undefined ? body.storyId : existingTask.storyId,
        dueDate: body.dueDate !== undefined
          ? (body.dueDate ? new Date(body.dueDate) : null)
          : existingTask.dueDate,
        completedAt: body.status === "DONE" && existingTask.status !== "DONE"
          ? new Date()
          : body.status !== "DONE"
            ? null
            : existingTask.completedAt,
        estimatedHours: body.estimatedHours !== undefined
          ? (body.estimatedHours ? parseFloat(body.estimatedHours) : null)
          : existingTask.estimatedHours,
        actualHours: body.actualHours !== undefined
          ? (body.actualHours ? parseFloat(body.actualHours) : null)
          : existingTask.actualHours,
        tags: body.tags !== undefined
          ? (body.tags ? JSON.stringify(body.tags) : null)
          : existingTask.tags,
        order: body.order !== undefined ? body.order : newOrder,
      },
    })

    return NextResponse.json(task)
  } catch (error) {
    console.error("Error updating internal task:", error)
    return NextResponse.json(
      { error: "Failed to update task" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; taskId: string }> }
) {
  try {
    const auth = await verifyAuth(request)
    if (!auth.isValid) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { taskId } = await params

    const task = await prisma.internalTask.findUnique({
      where: { id: taskId },
    })

    if (!task) {
      return NextResponse.json({ error: "Task não encontrada" }, { status: 404 })
    }

    await prisma.internalTask.delete({
      where: { id: taskId },
    })

    return NextResponse.json({ message: "Task excluída com sucesso" })
  } catch (error) {
    console.error("Error deleting internal task:", error)
    return NextResponse.json(
      { error: "Failed to delete task" },
      { status: 500 }
    )
  }
}
