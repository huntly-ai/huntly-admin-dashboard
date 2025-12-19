import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAuth } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuth(request)
    if (!auth.isValid) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    // Get counts
    const [leadsCount, clientsCount, projectsCount, activeProjectsCount] = await Promise.all([
      prisma.lead.count(),
      prisma.client.count({ where: { status: "ACTIVE" } }),
      prisma.project.count(),
      prisma.project.count({ where: { status: "IN_PROGRESS" } }),
    ])

    // Get financial data
    const transactions = await prisma.transaction.findMany({
      where: {
        date: {
          gte: new Date(new Date().getFullYear(), 0, 1), // This year
        },
      },
    })

    const totalIncome = transactions
      .filter((t) => t.type === "INCOME")
      .reduce((sum, t) => sum + t.amount, 0)

    const totalExpense = transactions
      .filter((t) => t.type === "EXPENSE")
      .reduce((sum, t) => sum + t.amount, 0)

    const profit = totalIncome - totalExpense

    // Get leads by status
    const leadsByStatus = await prisma.lead.groupBy({
      by: ["status"],
      _count: true,
    })

    // Get monthly revenue for the last 6 months
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const monthlyTransactions = await prisma.transaction.findMany({
      where: {
        date: {
          gte: sixMonthsAgo,
        },
      },
      orderBy: {
        date: "asc",
      },
    })

    // Group by month
    const monthlyData = monthlyTransactions.reduce((acc: Record<string, { month: string; income: number; expense: number }>, transaction) => {
      const month = transaction.date.toLocaleString("pt-BR", { month: "short", year: "numeric" })
      if (!acc[month]) {
        acc[month] = { month, income: 0, expense: 0 }
      }
      if (transaction.type === "INCOME") {
        acc[month].income += transaction.amount
      } else {
        acc[month].expense += transaction.amount
      }
      return acc
    }, {})

    const monthlyRevenue = Object.values(monthlyData)

    // Get recent projects
    const recentProjects = await prisma.project.findMany({
      take: 5,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        client: {
          select: {
            name: true,
          },
        },
      },
    })

    return NextResponse.json({
      counts: {
        leads: leadsCount,
        clients: clientsCount,
        projects: projectsCount,
        activeProjects: activeProjectsCount,
      },
      financial: {
        totalIncome,
        totalExpense,
        profit,
      },
      leadsByStatus,
      monthlyRevenue,
      recentProjects,
    })
  } catch (error) {
    console.error("Error fetching dashboard metrics:", error)
    return NextResponse.json(
      { error: "Failed to fetch dashboard metrics" },
      { status: 500 }
    )
  }
}

