import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const client = await prisma.client.findUnique({
      where: { id },
      include: {
        projects: {
          orderBy: { createdAt: "desc" },
        },
        transactions: {
          orderBy: { date: "desc" },
          take: 10,
        },
        lead: true,
      },
    })

    if (!client) {
      return NextResponse.json(
        { error: "Client not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(client)
  } catch (error) {
    console.error("Error fetching client:", error)
    return NextResponse.json(
      { error: "Failed to fetch client" },
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

    const client = await prisma.client.update({
      where: { id },
      data: {
        name: body.name,
        email: body.email,
        phone: body.phone,
        company: body.company,
        position: body.position,
        status: body.status,
        cnpj: body.cnpj,
        address: body.address,
        website: body.website,
        notes: body.notes,
      },
    })

    return NextResponse.json(client)
  } catch (error: unknown) {
    console.error("Error updating client:", error)
    const prismaError = error as { code?: string }
    
    if (prismaError.code === "P2025") {
      return NextResponse.json(
        { error: "Client not found" },
        { status: 404 }
      )
    }
    
    if (prismaError.code === "P2002") {
      return NextResponse.json(
        { error: "Email ou CNPJ já cadastrado" },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: "Failed to update client" },
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
    
    // Check if client has projects
    const client = await prisma.client.findUnique({
      where: { id },
      include: {
        _count: {
          select: { projects: true },
        },
      },
    })

    if (client && client._count.projects > 0) {
      return NextResponse.json(
        { error: "Não é possível excluir cliente com projetos associados" },
        { status: 400 }
      )
    }

    await prisma.client.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    console.error("Error deleting client:", error)
    const prismaError = error as { code?: string }
    
    if (prismaError.code === "P2025") {
      return NextResponse.json(
        { error: "Client not found" },
        { status: 404 }
      )
    }
    
    return NextResponse.json(
      { error: "Failed to delete client" },
      { status: 500 }
    )
  }
}

