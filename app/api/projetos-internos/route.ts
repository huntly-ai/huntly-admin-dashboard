import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { InternalProjectStatus } from "@prisma/client"
import { verifyAuth } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuth(request)
    if (!auth.isValid) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get("status")

    const internalProjects = await prisma.internalProject.findMany({
      where: {
        ...(status && { status: status as InternalProjectStatus }),
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        transactions: {
          select: {
            id: true,
            type: true,
            amount: true,
            category: true,
            date: true,
          },
        },
        _count: {
          select: {
            transactions: true,
            tasks: true,
          },
        },
      },
    })

    // Calculate financial data for each project
    const projectsWithFinancials = internalProjects.map((project) => {
      const totalIncome = project.transactions
        .filter((t) => t.type === "INCOME")
        .reduce((sum, t) => sum + Number(t.amount), 0)

      const totalExpense = project.transactions
        .filter((t) => t.type === "EXPENSE")
        .reduce((sum, t) => sum + Number(t.amount), 0)

      const profit = totalIncome - totalExpense

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { transactions, ...projectData } = project

      return {
        ...projectData,
        financials: {
          totalIncome,
          totalExpense,
          profit,
        },
      }
    })

    return NextResponse.json(projectsWithFinancials)
  } catch (error) {
    console.error("Error fetching internal projects:", error)
    return NextResponse.json(
      { error: "Failed to fetch internal projects" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAuth(request)
    if (!auth.isValid) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const body = await request.json()

    if (!body.name) {
      return NextResponse.json(
        { error: "Nome é obrigatório" },
        { status: 400 }
      )
    }

    const internalProject = await prisma.internalProject.create({
      data: {
        name: body.name,
        description: body.description,
        status: body.status || "ACTIVE",
        icon: body.icon,
        color: body.color,
      },
    })

    return NextResponse.json(internalProject, { status: 201 })
  } catch (error) {
    console.error("Error creating internal project:", error)
    return NextResponse.json(
      { error: "Failed to create internal project" },
      { status: 500 }
    )
  }
}
