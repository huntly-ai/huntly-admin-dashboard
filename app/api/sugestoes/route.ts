import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { SuggestionCategory, SuggestionStatus } from "@prisma/client"
import { verifyAuth } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const category = searchParams.get("category")
    const status = searchParams.get("status")

    const suggestions = await prisma.suggestion.findMany({
      where: {
        ...(category && { category: category as SuggestionCategory }),
        ...(status && { status: status as SuggestionStatus }),
      },
      orderBy: {
        createdAt: "desc",
      },
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
          select: {
            id: true,
            memberId: true,
          },
        },
        comments: {
          select: {
            id: true,
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

    return NextResponse.json(suggestions)
  } catch (error) {
    console.error("Error fetching suggestions:", error)
    return NextResponse.json(
      { error: "Failed to fetch suggestions" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAuth(request)
    if (!auth.isValid || !auth.user?.memberId) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      )
    }

    const body = await request.json()

    if (!body.title || !body.description || !body.category) {
      return NextResponse.json(
        { error: "Título, descrição e categoria são obrigatórios" },
        { status: 400 }
      )
    }

    const suggestion = await prisma.suggestion.create({
      data: {
        title: body.title,
        description: body.description,
        category: body.category as SuggestionCategory,
        authorId: auth.user.memberId,
      },
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

    return NextResponse.json(suggestion, { status: 201 })
  } catch (error) {
    console.error("Error creating suggestion:", error)
    return NextResponse.json(
      { error: "Failed to create suggestion" },
      { status: 500 }
    )
  }
}
