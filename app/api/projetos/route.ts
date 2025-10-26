import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { ProjectStatus } from "@prisma/client"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get("status")
    const clientId = searchParams.get("clientId")
    
    const projects = await prisma.project.findMany({
      where: {
        ...(status && { status: status as ProjectStatus }),
        ...(clientId && { clientId }),
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            company: true,
          },
        },
        _count: {
          select: {
            transactions: true,
          },
        },
      },
    })

    return NextResponse.json(projects)
  } catch (error) {
    console.error("Error fetching projects:", error)
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const project = await prisma.project.create({
      data: {
        name: body.name,
        description: body.description,
        status: body.status || "PLANNING",
        priority: body.priority || "MEDIUM",
        budget: parseFloat(body.budget),
        actualCost: body.actualCost ? parseFloat(body.actualCost) : 0,
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

    return NextResponse.json(project, { status: 201 })
  } catch (error: unknown) {
    console.error("Error creating project:", error)
    const prismaError = error as { code?: string }
    
    if (prismaError.code === "P2003") {
      return NextResponse.json(
        { error: "Cliente não encontrado" },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    )
  }
}

