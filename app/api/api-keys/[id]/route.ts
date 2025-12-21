import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAuth } from "@/lib/auth"
import { isValidPermission } from "@/lib/api-keys"

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

    const apiKey = await prisma.apiKey.findUnique({
      where: { id },
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
        updatedAt: true,
      },
    })

    if (!apiKey) {
      return NextResponse.json(
        { error: "API Key não encontrada" },
        { status: 404 }
      )
    }

    return NextResponse.json(apiKey)
  } catch (error) {
    console.error("Error fetching API key:", error)
    return NextResponse.json(
      { error: "Failed to fetch API key" },
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
    if (!auth.isValid) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    const existingKey = await prisma.apiKey.findUnique({
      where: { id },
    })

    if (!existingKey) {
      return NextResponse.json(
        { error: "API Key não encontrada" },
        { status: 404 }
      )
    }

    // Validate permissions if provided
    if (body.permissions) {
      for (const permission of body.permissions) {
        if (!isValidPermission(permission)) {
          return NextResponse.json(
            { error: `Permissão inválida: ${permission}` },
            { status: 400 }
          )
        }
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

    const apiKey = await prisma.apiKey.update({
      where: { id },
      data: {
        name: body.name ?? existingKey.name,
        permissions: body.permissions ?? existingKey.permissions,
        internalProjectId: body.internalProjectId !== undefined
          ? body.internalProjectId
          : existingKey.internalProjectId,
        isActive: body.isActive ?? existingKey.isActive,
      },
      select: {
        id: true,
        name: true,
        prefix: true,
        permissions: true,
        internalProjectId: true,
        expiresAt: true,
        isActive: true,
        updatedAt: true,
      },
    })

    return NextResponse.json(apiKey)
  } catch (error) {
    console.error("Error updating API key:", error)
    return NextResponse.json(
      { error: "Failed to update API key" },
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
    if (!auth.isValid) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { id } = await params

    const existingKey = await prisma.apiKey.findUnique({
      where: { id },
    })

    if (!existingKey) {
      return NextResponse.json(
        { error: "API Key não encontrada" },
        { status: 404 }
      )
    }

    await prisma.apiKey.delete({
      where: { id },
    })

    return NextResponse.json({ message: "API Key excluída com sucesso" })
  } catch (error) {
    console.error("Error deleting API key:", error)
    return NextResponse.json(
      { error: "Failed to delete API key" },
      { status: 500 }
    )
  }
}
