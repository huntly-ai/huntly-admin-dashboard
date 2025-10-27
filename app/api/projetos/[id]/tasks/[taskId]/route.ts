import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAuth } from "@/lib/auth"

// GET /api/projetos/[id]/tasks/[taskId] - Get a specific task
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; taskId: string }> }
) {
  try {
    const authResult = await verifyAuth(request)
    if (!authResult.isValid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { taskId } = await params

    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
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
    })

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    return NextResponse.json(task)
  } catch (error) {
    console.error("Error fetching task:", error)
    return NextResponse.json(
      { error: "Failed to fetch task" },
      { status: 500 }
    )
  }
}

// PUT /api/projetos/[id]/tasks/[taskId] - Update a task
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; taskId: string }> }
) {
  try {
    const authResult = await verifyAuth(request)
    if (!authResult.isValid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { taskId } = await params
    const body = await request.json()
    const {
      title,
      description,
      status,
      priority,
      dueDate,
      estimatedHours,
      actualHours,
      tags,
      memberIds,
      teamIds,
      order,
      completedAt,
    } = body

    // Check if task exists
    const existingTask = await prisma.task.findUnique({
      where: { id: taskId },
    })

    if (!existingTask) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    // Handle status change to DONE
    let completedAtDate = completedAt
    if (status === 'DONE' && existingTask.status !== 'DONE' && !completedAt) {
      completedAtDate = new Date()
    } else if (status !== 'DONE') {
      completedAtDate = null
    }

    // Update task
    await prisma.task.update({
      where: { id: taskId },
      data: {
        title,
        description,
        status,
        priority,
        dueDate: dueDate ? new Date(dueDate) : null,
        estimatedHours: estimatedHours ? parseFloat(estimatedHours) : null,
        actualHours: actualHours ? parseFloat(actualHours) : null,
        tags: tags ? JSON.stringify(tags) : null,
        order: order !== undefined ? order : undefined,
        completedAt: completedAtDate,
      },
    })

    // Update members if provided
    if (memberIds !== undefined) {
      // Delete existing members
      await prisma.taskMember.deleteMany({
        where: { taskId },
      })

      // Create new members
      if (memberIds.length > 0) {
        await prisma.taskMember.createMany({
          data: memberIds.map((memberId: string) => ({
            taskId,
            memberId,
          })),
        })
      }
    }

    // Update teams if provided
    if (teamIds !== undefined) {
      // Delete existing teams
      await prisma.taskTeam.deleteMany({
        where: { taskId },
      })

      // Create new teams
      if (teamIds.length > 0) {
        await prisma.taskTeam.createMany({
          data: teamIds.map((teamId: string) => ({
            taskId,
            teamId,
          })),
        })
      }
    }

    // Fetch updated task with all relations
    const updatedTask = await prisma.task.findUnique({
      where: { id: taskId },
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
    })

    return NextResponse.json(updatedTask)
  } catch (error) {
    console.error("Error updating task:", error)
    return NextResponse.json(
      { error: "Failed to update task" },
      { status: 500 }
    )
  }
}

// DELETE /api/projetos/[id]/tasks/[taskId] - Delete a task
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; taskId: string }> }
) {
  try {
    const authResult = await verifyAuth(request)
    if (!authResult.isValid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { taskId } = await params

    // Check if task exists
    const existingTask = await prisma.task.findUnique({
      where: { id: taskId },
    })

    if (!existingTask) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    // Delete task (cascade will handle taskMembers and taskTeams)
    await prisma.task.delete({
      where: { id: taskId },
    })

    return NextResponse.json({ message: "Task deleted successfully" })
  } catch (error) {
    console.error("Error deleting task:", error)
    return NextResponse.json(
      { error: "Failed to delete task" },
      { status: 500 }
    )
  }
}

