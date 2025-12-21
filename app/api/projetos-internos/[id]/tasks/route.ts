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

    const tasks = await prisma.internalTask.findMany({
      where: {
        internalProjectId: id,
      },
      orderBy: [{ status: "asc" }, { order: "asc" }],
    })

    return NextResponse.json(tasks)
  } catch (error) {
    console.error("Error fetching internal tasks:", error)
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
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
      storyId,
    } = body

    // Verify project exists
    const project = await prisma.internalProject.findUnique({
      where: { id },
    })

    if (!project) {
      return NextResponse.json(
        { error: "Projeto interno não encontrado" },
        { status: 404 }
      )
    }

    // Get the highest order for this status column
    const lastTask = await prisma.internalTask.findFirst({
      where: {
        internalProjectId: id,
        status: status || "TODO",
      },
      orderBy: {
        order: "desc",
      },
    })

    const order = lastTask ? lastTask.order + 1 : 0

    const task = await prisma.internalTask.create({
      data: {
        title,
        description,
        status: status || "TODO",
        priority: priority || "MEDIUM",
        internalProjectId: id,
        storyId: storyId || null,
        dueDate: dueDate ? new Date(dueDate) : null,
        estimatedHours: estimatedHours ? parseFloat(estimatedHours) : null,
        actualHours: actualHours ? parseFloat(actualHours) : null,
        tags: tags ? JSON.stringify(tags) : null,
        order,
      },
    })

    return NextResponse.json(task, { status: 201 })
  } catch (error) {
    console.error("Error creating internal task:", error)
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 }
    )
  }
}
