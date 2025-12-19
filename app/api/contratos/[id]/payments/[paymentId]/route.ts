import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { PaymentStatus } from "@prisma/client"
import { verifyAuth } from "@/lib/auth"

export async function PUT(
  request: NextRequest,
  props: { params: Promise<{ id: string; paymentId: string }> }
) {
  try {
    const auth = await verifyAuth(request)
    if (!auth.isValid) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const params = await props.params
    const { paymentId } = params
    const body = await request.json()

    const payment = await prisma.contractPayment.update({
      where: { id: paymentId },
      data: {
        installmentNumber: body.installmentNumber,
        amount: body.amount ? parseFloat(body.amount) : undefined,
        dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
        paymentDate: body.paymentDate ? new Date(body.paymentDate) : undefined,
        status: body.status as PaymentStatus,
        paymentMethod: body.paymentMethod,
        transactionId: body.transactionId,
        invoiceNumber: body.invoiceNumber,
        notes: body.notes,
      },
    })

    return NextResponse.json(payment)
  } catch (error) {
    console.error("Error updating payment:", error)
    return NextResponse.json(
      { error: "Failed to update payment" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  props: { params: Promise<{ id: string; paymentId: string }> }
) {
  try {
    const auth = await verifyAuth(request)
    if (!auth.isValid) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const params = await props.params
    const { paymentId } = params

    await prisma.contractPayment.delete({
      where: { id: paymentId },
    })

    return NextResponse.json({ message: "Payment deleted successfully" })
  } catch (error) {
    console.error("Error deleting payment:", error)
    return NextResponse.json(
      { error: "Failed to delete payment" },
      { status: 500 }
    )
  }
}

