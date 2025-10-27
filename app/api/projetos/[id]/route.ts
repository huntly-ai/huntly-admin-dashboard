import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params
    const { id } = params
    const { id } = await params
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        client: true,
        transactions: {
          orderBy: { date: "desc" },
        },
      },
    })

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(project)
  } catch (error) {
    console.error("Error fetching project:", error)
    return NextResponse.json(
      { error: "Failed to fetch project" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params
    const { id } = params
    const { id } = await params
    const body = await request.json()

    const project = await prisma.project.update({
      where: { id },
      data: {
        name: body.name,
        description: body.description,
        status: body.status,
        priority: body.priority,
        budget: body.budget ? parseFloat(body.budget) : undefined,
        actualCost: body.actualCost ? parseFloat(body.actualCost) : undefined,
        startDate: body.startDate ? new Date(body.startDate) : null,
        endDate: body.endDate ? new Date(body.endDate) : null,
        deadline: body.deadline ? new Date(body.deadline) : null,
        clientId: body.clientId,
        teamMembers: body.teamMembers,
        notes: body.notes,
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            company: true,
          },
        },
      },
    })

    return NextResponse.json(project)
  } catch (error: unknown) {
    console.error("Error updating project:", error)
    const prismaError = error as { code?: string }
    
    if (prismaError.code === "P2025") {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      )
    }
    
    if (prismaError.code === "P2003") {
      return NextResponse.json(
        { error: "Cliente não encontrado" },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: "Failed to update project" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params
    const { id } = params
    const { id } = await params
    await prisma.project.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    console.error("Error deleting project:", error)
    const prismaError = error as { code?: string }
    
    if (prismaError.code === "P2025") {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      )
    }
    
    return NextResponse.json(
      { error: "Failed to delete project" },
      { status: 500 }
    )
  }
}

