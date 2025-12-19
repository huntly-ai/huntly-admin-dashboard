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
    const auth = await verifyAuth(request)
    if (!auth.isValid) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    // Convert empty strings to null for unique fields
    const cnpj = body.cnpj?.trim() || null

    const client = await prisma.client.update({
      where: { id },
      data: {
        name: body.name,
        email: body.email,
        phone: body.phone || null,
        company: body.company || null,
        position: body.position || null,
        status: body.status,
        cnpj,
        address: body.address || null,
        website: body.website || null,
        notes: body.notes || null,
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
    const auth = await verifyAuth(request)
    if (!auth.isValid) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

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

