import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const transaction = await prisma.transaction.findUnique({
      where: { id },
      include: {
        client: true,
        project: true,
      },
    })

    if (!transaction) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(transaction)
  } catch (error) {
    console.error("Error fetching transaction:", error)
    return NextResponse.json(
      { error: "Failed to fetch transaction" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    // Get old transaction to check if amount/type changed
    const oldTransaction = await prisma.transaction.findUnique({
      where: { id },
    })

    if (!oldTransaction) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      )
    }

    const transaction = await prisma.transaction.update({
      where: { id },
      data: {
        type: body.type,
        category: body.category,
        amount: body.amount ? parseFloat(body.amount) : undefined,
        description: body.description,
        date: body.date ? new Date(body.date) : undefined,
        projectId: body.projectId || null,
        clientId: body.clientId || null,
        invoiceNumber: body.invoiceNumber,
        paymentMethod: body.paymentMethod,
        notes: body.notes,
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    // Update project actual cost if necessary
    if (oldTransaction.projectId && oldTransaction.type === "EXPENSE") {
      const project = await prisma.project.findUnique({
        where: { id: oldTransaction.projectId },
      })
      if (project) {
        // Remove old amount and add new if still expense
        let newCost = project.actualCost - oldTransaction.amount
        if (body.projectId === oldTransaction.projectId && body.type === "EXPENSE") {
          newCost += parseFloat(body.amount)
        }
        await prisma.project.update({
          where: { id: oldTransaction.projectId },
          data: { actualCost: Math.max(0, newCost) },
        })
      }
    }

    // If project changed and is expense, update new project
    if (
      body.projectId &&
      body.projectId !== oldTransaction.projectId &&
      body.type === "EXPENSE"
    ) {
      const project = await prisma.project.findUnique({
        where: { id: body.projectId },
      })
      if (project) {
        await prisma.project.update({
          where: { id: body.projectId },
          data: {
            actualCost: project.actualCost + parseFloat(body.amount),
          },
        })
      }
    }

    return NextResponse.json(transaction)
  } catch (error: unknown) {
    console.error("Error updating transaction:", error)
    const prismaError = error as { code?: string }
    
    if (prismaError.code === "P2025") {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      )
    }
    
    if (prismaError.code === "P2003") {
      return NextResponse.json(
        { error: "Cliente ou projeto não encontrado" },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: "Failed to update transaction" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Get transaction to update project if necessary
    const transaction = await prisma.transaction.findUnique({
      where: { id },
    })

    if (transaction && transaction.projectId && transaction.type === "EXPENSE") {
      const project = await prisma.project.findUnique({
        where: { id: transaction.projectId },
      })
      if (project) {
        await prisma.project.update({
          where: { id: transaction.projectId },
          data: {
            actualCost: Math.max(0, project.actualCost - transaction.amount),
          },
        })
      }
    }

    await prisma.transaction.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    console.error("Error deleting transaction:", error)
    const prismaError = error as { code?: string }
    
    if (prismaError.code === "P2025") {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      )
    }
    
    return NextResponse.json(
      { error: "Failed to delete transaction" },
      { status: 500 }
    )
  }
}

