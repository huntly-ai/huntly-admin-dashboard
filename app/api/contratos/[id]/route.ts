import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { ContractStatus } from "@prisma/client"
import { verifyAuth } from "@/lib/auth"

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await verifyAuth(request)
    if (!auth.isValid) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const params = await props.params
    const { id } = params

    const contract = await prisma.contract.findUnique({
      where: { id },
      include: {
        client: true,
        contractProjects: {
          include: {
            project: true,
          },
        },
        payments: {
          orderBy: {
            installmentNumber: "asc",
          },
        },
      },
    })

    if (!contract) {
      return NextResponse.json(
        { error: "Contract not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(contract)
  } catch (error) {
    console.error("Error fetching contract:", error)
    return NextResponse.json(
      { error: "Failed to fetch contract" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await verifyAuth(request)
    if (!auth.isValid) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const params = await props.params
    const { id } = params
    const body = await request.json()

    const { projectIds, ...contractData } = body

    // Handle project associations separately if needed
    const updateData: Record<string, unknown> = {
      ...contractData,
      totalValue: contractData.totalValue ? parseFloat(contractData.totalValue) : undefined,
      startDate: contractData.startDate ? new Date(contractData.startDate) : undefined,
      endDate: contractData.endDate ? new Date(contractData.endDate) : undefined,
      signedDate: contractData.signedDate ? new Date(contractData.signedDate) : undefined,
      status: contractData.status as ContractStatus,
    }

    // Update project associations if provided
    if (projectIds !== undefined) {
      // Delete existing associations
      await prisma.contractProject.deleteMany({
        where: { contractId: id },
      })

      // Create new associations
      if (projectIds.length > 0) {
        updateData.contractProjects = {
          create: projectIds.map((projectId: string) => ({
            projectId,
          })),
        }
      }
    }

    const contract = await prisma.contract.update({
      where: { id },
      data: updateData,
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

    return NextResponse.json(contract)
  } catch (error) {
    console.error("Error updating contract:", error)
    return NextResponse.json(
      { error: "Failed to update contract" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await verifyAuth(request)
    if (!auth.isValid) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const params = await props.params
    const { id } = params

    await prisma.contract.delete({
      where: { id },
    })

    return NextResponse.json({ message: "Contract deleted successfully" })
  } catch (error) {
    console.error("Error deleting contract:", error)
    return NextResponse.json(
      { error: "Failed to delete contract" },
      { status: 500 }
    )
  }
}

