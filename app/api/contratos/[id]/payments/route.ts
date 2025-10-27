import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { PaymentStatus } from "@prisma/client"

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params
    const { id } = params

    const payments = await prisma.contractPayment.findMany({
      where: { contractId: id },
      orderBy: {
        installmentNumber: "asc",
      },
    })

    return NextResponse.json(payments)
  } catch (error) {
    console.error("Error fetching payments:", error)
    return NextResponse.json(
      { error: "Failed to fetch payments" },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params
    const { id } = params
    const body = await request.json()

    const payment = await prisma.contractPayment.create({
      data: {
        contractId: id,
        installmentNumber: body.installmentNumber,
        amount: parseFloat(body.amount),
        dueDate: new Date(body.dueDate),
        paymentDate: body.paymentDate ? new Date(body.paymentDate) : null,
        status: (body.status as PaymentStatus) || "PENDING",
        paymentMethod: body.paymentMethod,
        transactionId: body.transactionId,
        invoiceNumber: body.invoiceNumber,
        notes: body.notes,
      },
    })

    return NextResponse.json(payment, { status: 201 })
  } catch (error) {
    console.error("Error creating payment:", error)
    return NextResponse.json(
      { error: "Failed to create payment" },
      { status: 500 }
    )
  }
}

