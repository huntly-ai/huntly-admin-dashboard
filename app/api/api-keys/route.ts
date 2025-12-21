import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAuth } from "@/lib/auth"
import { generateApiKey, isValidPermission } from "@/lib/api-keys"

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuth(request)
    if (!auth.isValid) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const apiKeys = await prisma.apiKey.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        prefix: true,
        permissions: true,
        internalProjectId: true,
        internalProject: {
          select: {
            id: true,
            name: true,
          },
        },
        lastUsedAt: true,
        expiresAt: true,
        isActive: true,
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
        createdAt: true,
      },
    })

    return NextResponse.json(apiKeys)
  } catch (error) {
    console.error("Error fetching API keys:", error)
    return NextResponse.json(
      { error: "Failed to fetch API keys" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAuth(request)
    if (!auth.isValid) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const body = await request.json()

    // Validate required fields
    if (!body.name) {
      return NextResponse.json(
        { error: "Nome é obrigatório" },
        { status: 400 }
      )
    }

    // Validate permissions
    const permissions: string[] = body.permissions || ["transactions:read", "transactions:write"]
    for (const permission of permissions) {
      if (!isValidPermission(permission)) {
        return NextResponse.json(
          { error: `Permissão inválida: ${permission}` },
          { status: 400 }
        )
      }
    }

    // Validate internal project if provided
    if (body.internalProjectId) {
      const project = await prisma.internalProject.findUnique({
        where: { id: body.internalProjectId },
      })
      if (!project) {
        return NextResponse.json(
          { error: "Projeto interno não encontrado" },
          { status: 404 }
        )
      }
    }

    // Generate API key
    const { key, hash, prefix } = generateApiKey()

    // Parse expiration
    let expiresAt: Date | null = null
    if (body.expiresIn) {
      const now = new Date()
      switch (body.expiresIn) {
        case "7d":
          expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
          break
        case "30d":
          expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
          break
        case "90d":
          expiresAt = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000)
          break
        case "1y":
          expiresAt = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000)
          break
        case "never":
        default:
          expiresAt = null
      }
    }

    // Create API key
    const apiKey = await prisma.apiKey.create({
      data: {
        name: body.name,
        key: hash,
        prefix,
        permissions,
        internalProjectId: body.internalProjectId || null,
        expiresAt,
        createdById: auth.user?.memberId || null,
      },
      select: {
        id: true,
        name: true,
        prefix: true,
        permissions: true,
        internalProjectId: true,
        expiresAt: true,
        createdAt: true,
      },
    })

    // Return the full key only on creation (will never be shown again)
    return NextResponse.json(
      {
        ...apiKey,
        key, // Raw key - show only once!
        message: "Guarde esta chave com segurança. Ela não será exibida novamente.",
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error creating API key:", error)
    return NextResponse.json(
      { error: "Failed to create API key" },
      { status: 500 }
    )
  }
}
