import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { hashPassword } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { email, password, memberId } = await request.json()

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email e senha são obrigatórios" },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "A senha deve ter pelo menos 6 caracteres" },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "Este email já está cadastrado" },
        { status: 400 }
      )
    }

    // If memberId is provided, check if member exists and doesn't have a user yet
    if (memberId) {
      const member = await prisma.teamMember.findUnique({
        where: { id: memberId },
        include: { user: true },
      })

      if (!member) {
        return NextResponse.json(
          { error: "Membro não encontrado" },
          { status: 404 }
        )
      }

      if (member.user) {
        return NextResponse.json(
          { error: "Este membro já possui uma conta de usuário" },
          { status: 400 }
        )
      }
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create user
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        memberId: memberId || null,
      },
      select: {
        id: true,
        email: true,
        memberId: true,
      },
    })

    return NextResponse.json({ user }, { status: 201 })
  } catch (error) {
    console.error("Register error:", error)
    return NextResponse.json(
      { error: "Erro ao criar usuário" },
      { status: 500 }
    )
  }
}

