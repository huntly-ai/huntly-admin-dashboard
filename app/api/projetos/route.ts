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
        transactions: {
          select: {
            id: true,
            type: true,
            amount: true,
          },
        },
        _count: {
          select: {
            transactions: true,
          },
        },
      },
    })

    // Calculate financial data for each project
    const projectsWithFinancials = projects.map(project => {
      const totalReceived = project.transactions
        .filter(t => t.type === 'INCOME')
        .reduce((sum, t) => sum + Number(t.amount), 0)
      
      const totalCost = project.transactions
        .filter(t => t.type === 'EXPENSE')
        .reduce((sum, t) => sum + Number(t.amount), 0)
      
      const profit = totalReceived - totalCost
      const remaining = project.projectValue - totalReceived
      const paymentProgress = project.projectValue > 0 
        ? (totalReceived / project.projectValue) * 100 
        : 0

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { transactions, ...projectData } = project

      return {
        ...projectData,
        financials: {
          totalReceived,
          totalCost,
          profit,
          remaining,
          paymentProgress,
        },
      }
    })

    return NextResponse.json(projectsWithFinancials)
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
    
    // Use transaction to create project and relationships
    const project = await prisma.$transaction(async (tx) => {
      // Create the project
      const newProject = await tx.project.create({
        data: {
          name: body.name,
          description: body.description,
          status: body.status || "PLANNING",
          priority: body.priority || "MEDIUM",
          projectValue: parseFloat(body.projectValue),
          startDate: body.startDate ? new Date(body.startDate) : null,
          endDate: body.endDate ? new Date(body.endDate) : null,
          deadline: body.deadline ? new Date(body.deadline) : null,
          clientId: body.clientId,
          notes: body.notes,
        },
      })

      // Create ProjectMember relationships
      if (body.memberIds && body.memberIds.length > 0) {
        await tx.projectMember.createMany({
          data: body.memberIds.map((memberId: string) => ({
            projectId: newProject.id,
            memberId: memberId,
          })),
        })
      }

      // Create ProjectTeam relationships
      if (body.teamIds && body.teamIds.length > 0) {
        await tx.projectTeam.createMany({
          data: body.teamIds.map((teamId: string) => ({
            projectId: newProject.id,
            teamId: teamId,
          })),
        })
      }

      // Fetch the complete project with relationships
      return await tx.project.findUnique({
        where: { id: newProject.id },
        include: {
          client: {
            select: {
              id: true,
              name: true,
              company: true,
            },
          },
          projectMembers: {
            include: {
              member: {
                select: {
                  id: true,
                  name: true,
                  role: true,
                },
              },
            },
          },
          projectTeams: {
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

