import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { SuggestionStatus } from "@prisma/client"
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

    const suggestion = await prisma.suggestion.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatar: true,
            role: true,
          },
        },
        votes: {
          include: {
            member: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
        },
        comments: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                avatar: true,
                role: true,
              },
            },
          },
          orderBy: {
            createdAt: "asc",
          },
        },
        _count: {
          select: {
            votes: true,
            comments: true,
          },
        },
      },
    })

    if (!suggestion) {
      return NextResponse.json(
        { error: "Sugestão não encontrada" },
        { status: 404 }
      )
    }

    return NextResponse.json(suggestion)
  } catch (error) {
    console.error("Error fetching suggestion:", error)
    return NextResponse.json(
      { error: "Failed to fetch suggestion" },
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
    if (!auth.isValid || !auth.user?.memberId) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      )
    }

    const { id } = await params
    const body = await request.json()

    // Check if suggestion exists and user is the author
    const existingSuggestion = await prisma.suggestion.findUnique({
      where: { id },
    })

    if (!existingSuggestion) {
      return NextResponse.json(
        { error: "Sugestão não encontrada" },
        { status: 404 }
      )
    }

    // Only author can edit title/description, but status can be changed by anyone (admin feature)
    const updateData: Record<string, unknown> = {}

    if (existingSuggestion.authorId === auth.user.memberId) {
      if (body.title) updateData.title = body.title
      if (body.description) updateData.description = body.description
      if (body.category) updateData.category = body.category
    }

    if (body.status) {
      updateData.status = body.status as SuggestionStatus
    }

    const suggestion = await prisma.suggestion.update({
      where: { id },
      data: updateData,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatar: true,
            role: true,
          },
        },
        _count: {
          select: {
            votes: true,
            comments: true,
          },
        },
      },
    })

    return NextResponse.json(suggestion)
  } catch (error) {
    console.error("Error updating suggestion:", error)
    return NextResponse.json(
      { error: "Failed to update suggestion" },
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
    if (!auth.isValid || !auth.user?.memberId) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      )
    }

    const { id } = await params

    // Check if suggestion exists and user is the author
    const suggestion = await prisma.suggestion.findUnique({
      where: { id },
    })

    if (!suggestion) {
      return NextResponse.json(
        { error: "Sugestão não encontrada" },
        { status: 404 }
      )
    }

    if (suggestion.authorId !== auth.user.memberId) {
      return NextResponse.json(
        { error: "Você só pode excluir suas próprias sugestões" },
        { status: 403 }
      )
    }

    await prisma.suggestion.delete({
      where: { id },
    })

    return NextResponse.json({ message: "Sugestão excluída com sucesso" })
  } catch (error) {
    console.error("Error deleting suggestion:", error)
    return NextResponse.json(
      { error: "Failed to delete suggestion" },
      { status: 500 }
    )
  }
}
