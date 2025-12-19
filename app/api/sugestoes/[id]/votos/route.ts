import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAuth } from "@/lib/auth"

// Toggle vote (like/unlike)
export async function POST(
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

    const { id: suggestionId } = await params
    const memberId = auth.user.memberId

    // Check if suggestion exists
    const suggestion = await prisma.suggestion.findUnique({
      where: { id: suggestionId },
    })

    if (!suggestion) {
      return NextResponse.json(
        { error: "Sugestão não encontrada" },
        { status: 404 }
      )
    }

    // Check if user already voted
    const existingVote = await prisma.suggestionVote.findUnique({
      where: {
        suggestionId_memberId: {
          suggestionId,
          memberId,
        },
      },
    })

    if (existingVote) {
      // Remove vote
      await prisma.suggestionVote.delete({
        where: { id: existingVote.id },
      })

      const voteCount = await prisma.suggestionVote.count({
        where: { suggestionId },
      })

      return NextResponse.json({
        voted: false,
        voteCount,
        message: "Voto removido",
      })
    } else {
      // Add vote
      await prisma.suggestionVote.create({
        data: {
          suggestionId,
          memberId,
        },
      })

      const voteCount = await prisma.suggestionVote.count({
        where: { suggestionId },
      })

      return NextResponse.json({
        voted: true,
        voteCount,
        message: "Voto adicionado",
      })
    }
  } catch (error) {
    console.error("Error toggling vote:", error)
    return NextResponse.json(
      { error: "Failed to toggle vote" },
      { status: 500 }
    )
  }
}
