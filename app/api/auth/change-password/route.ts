import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyToken, verifyPassword, hashPassword } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json(
        { error: "Não autenticado" },
        { status: 401 }
      )
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json(
        { error: "Token inválido" },
        { status: 401 }
      )
    }

    const { currentPassword, newPassword } = await request.json()

    // Validate input
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Senha atual e nova senha são obrigatórias" },
        { status: 400 }
      )
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "A nova senha deve ter pelo menos 6 caracteres" },
        { status: 400 }
      )
    }

    // Get user with password
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    })

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      )
    }

    // Verify current password
    const isPasswordValid = await verifyPassword(currentPassword, user.password)
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Senha atual incorreta" },
        { status: 401 }
      )
    }

    // Hash new password
    const hashedNewPassword = await hashPassword(newPassword)

    // Update password
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedNewPassword },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Change password error:", error)
    return NextResponse.json(
      { error: "Erro ao alterar senha" },
      { status: 500 }
    )
  }
}

