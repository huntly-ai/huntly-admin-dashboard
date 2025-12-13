import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params
    const { id } = params
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        client: true,
        transactions: {
          orderBy: { date: "desc" },
        },
        tasks: {
          select: {
            id: true,
            actualHours: true,
            estimatedHours: true,
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

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      )
    }

    // Calculate hours metrics
    const totalWorkedHours = project.tasks
      .reduce((sum, t) => sum + (Number(t.actualHours) || 0), 0)
    
    const totalEstimatedHours = project.tasks
      .reduce((sum, t) => sum + (Number(t.estimatedHours) || 0), 0)
    
    // Calculate project value based on billing type
    let calculatedValue: number
    if (project.billingType === 'HOURLY_RATE' && project.hourlyRate) {
      calculatedValue = project.hourlyRate * totalWorkedHours
    } else {
      calculatedValue = project.projectValue
    }
    
    // Calculate effective hourly rate
    const effectiveHourlyRate = totalWorkedHours > 0 
      ? calculatedValue / totalWorkedHours 
      : 0

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { tasks, ...projectData } = project

    return NextResponse.json({
      ...projectData,
      hours: {
        totalWorkedHours,
        totalEstimatedHours,
        calculatedValue,
        effectiveHourlyRate,
      },
    })
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
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params
    const { id } = params
    const body = await request.json()

    // Use transaction to update project and relationships
    const project = await prisma.$transaction(async (tx) => {
      // Update the project
      await tx.project.update({
        where: { id },
        data: {
          name: body.name,
          description: body.description,
          status: body.status,
          priority: body.priority,
          billingType: body.billingType,
          projectValue: body.projectValue !== undefined ? parseFloat(body.projectValue) : undefined,
          hourlyRate: body.hourlyRate !== undefined 
            ? (body.hourlyRate ? parseFloat(body.hourlyRate) : null) 
            : undefined,
          startDate: body.startDate ? new Date(body.startDate) : null,
          endDate: body.endDate ? new Date(body.endDate) : null,
          deadline: body.deadline ? new Date(body.deadline) : null,
          clientId: body.clientId,
          notes: body.notes,
        },
      })

      // Update ProjectMember relationships if provided
      if (body.memberIds !== undefined) {
        // Delete existing relationships
        await tx.projectMember.deleteMany({
          where: { projectId: id },
        })

        // Create new relationships
        if (body.memberIds.length > 0) {
          await tx.projectMember.createMany({
            data: body.memberIds.map((memberId: string) => ({
              projectId: id,
              memberId: memberId,
            })),
          })
        }
      }

      // Update ProjectTeam relationships if provided
      if (body.teamIds !== undefined) {
        // Delete existing relationships
        await tx.projectTeam.deleteMany({
          where: { projectId: id },
        })

        // Create new relationships
        if (body.teamIds.length > 0) {
          await tx.projectTeam.createMany({
            data: body.teamIds.map((teamId: string) => ({
              projectId: id,
              teamId: teamId,
            })),
          })
        }
      }

      // Fetch the complete project with relationships
      return await tx.project.findUnique({
        where: { id },
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
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params
    const { id } = params
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

