import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

import { LeadStatus } from "@prisma/client"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get("status")
    
    const leads = await prisma.lead.findMany({
      where: status ? { status: status as LeadStatus } : undefined,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        convertedToClient: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    return NextResponse.json(leads)
  } catch (error) {
    console.error("Error fetching leads:", error)
    return NextResponse.json(
      { error: "Failed to fetch leads" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const lead = await prisma.lead.create({
      data: {
        name: body.name,
        email: body.email,
        phone: body.phone,
        company: body.company,
        position: body.position,
        status: body.status || "NEW",
        source: body.source || "OTHER",
        notes: body.notes,
        estimatedValue: body.estimatedValue ? parseFloat(body.estimatedValue) : null,
      },
    })

    return NextResponse.json(lead, { status: 201 })
  } catch (error: unknown) {
    console.error("Error creating lead:", error)
    const prismaError = error as { code?: string }
    
    if (prismaError.code === "P2002") {
      return NextResponse.json(
        { error: "Email já cadastrado" },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: "Failed to create lead" },
      { status: 500 }
    )
  }
}

