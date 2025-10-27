import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { TransactionType, TransactionCategory } from "@prisma/client"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const type = searchParams.get("type")
    const category = searchParams.get("category")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    
    const transactions = await prisma.transaction.findMany({
      where: {
        ...(type && { type: type as TransactionType }),
        ...(category && { category: category as TransactionCategory }),
        ...(startDate && endDate && {
          date: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          },
        }),
      },
      orderBy: {
        date: "desc",
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

    return NextResponse.json(transactions)
  } catch (error) {
    console.error("Error fetching transactions:", error)
    return NextResponse.json(
      { error: "Failed to fetch transactions" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const transaction = await prisma.transaction.create({
      data: {
        type: body.type,
        category: body.category,
        amount: parseFloat(body.amount),
        description: body.description,
        date: body.date ? new Date(body.date) : new Date(),
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

    return NextResponse.json(transaction, { status: 201 })
  } catch (error: unknown) {
    console.error("Error creating transaction:", error)
    const prismaError = error as { code?: string }
    
    if (prismaError.code === "P2003") {
      return NextResponse.json(
        { error: "Cliente ou projeto não encontrado" },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: "Failed to create transaction" },
      { status: 500 }
    )
  }
}

