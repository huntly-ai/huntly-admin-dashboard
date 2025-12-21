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

    const transactions = await prisma.transaction.findMany({
      where: {
        internalProjectId: id,
      },
      orderBy: {
        date: "desc",
      },
    })

    return NextResponse.json(transactions)
  } catch (error) {
    console.error("Error fetching internal project transactions:", error)
    return NextResponse.json(
      { error: "Failed to fetch transactions" },
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

    const transaction = await prisma.transaction.create({
      data: {
        type: body.type,
        category: body.category,
        amount: parseFloat(body.amount),
        description: body.description,
        date: body.date ? new Date(body.date) : new Date(),
        internalProjectId: id,
        invoiceNumber: body.invoiceNumber,
        paymentMethod: body.paymentMethod,
        notes: body.notes,
      },
    })

    return NextResponse.json(transaction, { status: 201 })
  } catch (error) {
    console.error("Error creating internal project transaction:", error)
    return NextResponse.json(
      { error: "Failed to create transaction" },
      { status: 500 }
    )
  }
}
