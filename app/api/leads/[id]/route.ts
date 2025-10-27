import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params
    const { id } = params
    const { id } = await params
    const lead = await prisma.lead.findUnique({
      where: { id },
      include: {
        convertedToClient: true,
      },
    })

    if (!lead) {
      return NextResponse.json(
        { error: "Lead not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(lead)
  } catch (error) {
    console.error("Error fetching lead:", error)
    return NextResponse.json(
      { error: "Failed to fetch lead" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params
    const { id } = params
    const { id } = await params
    const body = await request.json()

    const lead = await prisma.lead.update({
      where: { id },
      data: {
        name: body.name,
        email: body.email,
        phone: body.phone,
        company: body.company,
        position: body.position,
        status: body.status,
        source: body.source,
        notes: body.notes,
        estimatedValue: body.estimatedValue ? parseFloat(body.estimatedValue) : null,
      },
    })

    return NextResponse.json(lead)
  } catch (error: unknown) {
    console.error("Error updating lead:", error)
    const prismaError = error as { code?: string }
    
    if (prismaError.code === "P2025") {
      return NextResponse.json(
        { error: "Lead not found" },
        { status: 404 }
      )
    }
    
    if (prismaError.code === "P2002") {
      return NextResponse.json(
        { error: "Email já cadastrado" },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: "Failed to update lead" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params
    const { id } = params
    const { id } = await params
    await prisma.lead.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    console.error("Error deleting lead:", error)
    const prismaError = error as { code?: string }
    
    if (prismaError.code === "P2025") {
      return NextResponse.json(
        { error: "Lead not found" },
        { status: 404 }
      )
    }
    
    return NextResponse.json(
      { error: "Failed to delete lead" },
      { status: 500 }
    )
  }
}

