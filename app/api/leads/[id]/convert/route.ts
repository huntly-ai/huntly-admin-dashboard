import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Get the lead
    const lead = await prisma.lead.findUnique({
      where: { id },
    })

    if (!lead) {
      return NextResponse.json(
        { error: "Lead not found" },
        { status: 404 }
      )
    }

    if (lead.convertedToClientId) {
      return NextResponse.json(
        { error: "Lead já foi convertido em cliente" },
        { status: 400 }
      )
    }

    // Create client from lead
    const client = await prisma.client.create({
      data: {
        name: lead.name,
        email: lead.email || "N/A",
        phone: lead.phone,
        company: lead.company,
        position: lead.position,
        notes: lead.notes,
        status: "ACTIVE",
        leadId: lead.id,
      },
    })

    // Update lead
    await prisma.lead.update({
      where: { id },
      data: {
        convertedToClientId: client.id,
        convertedAt: new Date(),
        status: "WON",
      },
    })

    return NextResponse.json(client)
  } catch (error: unknown) {
    console.error("Error converting lead:", error)
    const prismaError = error as { code?: string }
    
    if (prismaError.code === "P2002") {
      return NextResponse.json(
        { error: "Email já cadastrado como cliente" },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: "Failed to convert lead" },
      { status: 500 }
    )
  }
}

