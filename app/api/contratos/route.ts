import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { ContractStatus } from "@prisma/client"
import { verifyAuth } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuth(request)
    if (!auth.isValid) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const contracts = await prisma.contract.findMany({
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            company: true,
          },
        },
        contractProjects: {
          include: {
            project: {
              select: {
                id: true,
                name: true,
                status: true,
              },
            },
          },
        },
        payments: {
          select: {
            id: true,
            status: true,
            amount: true,
            dueDate: true,
            paymentDate: true,
          },
        },
        _count: {
          select: {
            payments: true,
            contractProjects: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(contracts)
  } catch (error) {
    console.error("Error fetching contracts:", error)
    return NextResponse.json(
      { error: "Failed to fetch contracts" },
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

    // Generate contract number (format: CONT-YYYYMM-XXX)
    const now = new Date()
    const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`
    
    const lastContract = await prisma.contract.findFirst({
      where: {
        contractNumber: {
          startsWith: `CONT-${yearMonth}`,
        },
      },
      orderBy: {
        contractNumber: "desc",
      },
    })

    let sequenceNumber = 1
    if (lastContract) {
      const lastNumber = parseInt(lastContract.contractNumber.split("-")[2])
      sequenceNumber = lastNumber + 1
    }

    const contractNumber = `CONT-${yearMonth}-${String(sequenceNumber).padStart(3, "0")}`

    // Create contract with projects relation
    const { projectIds, payments, ...contractData } = body

    const contract = await prisma.contract.create({
      data: {
        ...contractData,
        contractNumber,
        totalValue: parseFloat(contractData.totalValue),
        startDate: new Date(contractData.startDate),
        endDate: new Date(contractData.endDate),
        signedDate: contractData.signedDate ? new Date(contractData.signedDate) : null,
        status: contractData.status as ContractStatus,
        contractProjects: projectIds?.length
          ? {
              create: projectIds.map((projectId: string) => ({
                projectId,
              })),
            }
          : undefined,
        payments: payments?.length
          ? {
              create: payments.map((payment: { installmentNumber: number; amount: string; dueDate: string }) => ({
                installmentNumber: payment.installmentNumber,
                amount: parseFloat(payment.amount),
                dueDate: new Date(payment.dueDate),
              })),
            }
          : undefined,
      },
      include: {
        client: true,
        contractProjects: {
          include: {
            project: true,
          },
        },
        payments: true,
      },
    })

    return NextResponse.json(contract, { status: 201 })
  } catch (error) {
    console.error("Error creating contract:", error)
    return NextResponse.json(
      { error: "Failed to create contract" },
      { status: 500 }
    )
  }
}

