import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { InternalProjectStatus } from "@prisma/client"
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

    const internalProject = await prisma.internalProject.findUnique({
      where: { id },
      include: {
        transactions: {
          orderBy: {
            date: "desc",
          },
        },
        stories: {
          include: {
            tasks: {
              orderBy: {
                order: "asc",
              },
            },
            epic: true,
          },
          orderBy: {
            order: "asc",
          },
        },
        tasks: {
          orderBy: [{ status: "asc" }, { order: "asc" }],
        },
        _count: {
          select: {
            transactions: true,
            stories: true,
            tasks: true,
          },
        },
      },
    })

    if (!internalProject) {
      return NextResponse.json(
        { error: "Projeto interno não encontrado" },
        { status: 404 }
      )
    }

    // Calculate financial data
    const totalIncome = internalProject.transactions
      .filter((t) => t.type === "INCOME")
      .reduce((sum, t) => sum + Number(t.amount), 0)

    const totalExpense = internalProject.transactions
      .filter((t) => t.type === "EXPENSE")
      .reduce((sum, t) => sum + Number(t.amount), 0)

    const profit = totalIncome - totalExpense

    return NextResponse.json({
      ...internalProject,
      financials: {
        totalIncome,
        totalExpense,
        profit,
      },
    })
  } catch (error) {
    console.error("Error fetching internal project:", error)
    return NextResponse.json(
      { error: "Failed to fetch internal project" },
      { status: 500 }
    )
  }
}

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

    const existingProject = await prisma.internalProject.findUnique({
      where: { id },
    })

    if (!existingProject) {
      return NextResponse.json(
        { error: "Projeto interno não encontrado" },
        { status: 404 }
      )
    }

    const internalProject = await prisma.internalProject.update({
      where: { id },
      data: {
        name: body.name ?? existingProject.name,
        description: body.description ?? existingProject.description,
        status: (body.status as InternalProjectStatus) ?? existingProject.status,
        icon: body.icon ?? existingProject.icon,
        color: body.color ?? existingProject.color,
      },
    })

    return NextResponse.json(internalProject)
  } catch (error) {
    console.error("Error updating internal project:", error)
    return NextResponse.json(
      { error: "Failed to update internal project" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await verifyAuth(request)
    if (!auth.isValid) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { id } = await params

    const existingProject = await prisma.internalProject.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            transactions: true,
          },
        },
      },
    })

    if (!existingProject) {
      return NextResponse.json(
        { error: "Projeto interno não encontrado" },
        { status: 404 }
      )
    }

    // Check if project has transactions
    if (existingProject._count.transactions > 0) {
      return NextResponse.json(
        { error: "Não é possível excluir projeto com transações. Arquive-o em vez disso." },
        { status: 400 }
      )
    }

    await prisma.internalProject.delete({
      where: { id },
    })

    return NextResponse.json({ message: "Projeto interno excluído com sucesso" })
  } catch (error) {
    console.error("Error deleting internal project:", error)
    return NextResponse.json(
      { error: "Failed to delete internal project" },
      { status: 500 }
    )
  }
}
