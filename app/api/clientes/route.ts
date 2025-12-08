import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { ClientStatus } from "@prisma/client"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get("status")
    
    const clients = await prisma.client.findMany({
      where: status ? { status: status as ClientStatus } : undefined,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        _count: {
          select: {
            projects: true,
            transactions: true,
          },
        },
      },
    })

    return NextResponse.json(clients)
  } catch (error) {
    console.error("Error fetching clients:", error)
    return NextResponse.json(
      { error: "Failed to fetch clients" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Convert empty strings to null for unique fields
    const cnpj = body.cnpj?.trim() || null
    
    const client = await prisma.client.create({
      data: {
        name: body.name,
        email: body.email,
        phone: body.phone || null,
        company: body.company || null,
        position: body.position || null,
        status: body.status || "ACTIVE",
        cnpj,
        address: body.address || null,
        website: body.website || null,
        notes: body.notes || null,
      },
    })

    return NextResponse.json(client, { status: 201 })
  } catch (error: unknown) {
    console.error("Error creating client:", error)
    const prismaError = error as { code?: string }
    
    if (prismaError.code === "P2002") {
      return NextResponse.json(
        { error: "Email ou CNPJ já cadastrado" },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: "Failed to create client" },
      { status: 500 }
    )
  }
}

