import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { MemberRole, MemberStatus } from "@prisma/client"

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params
    const { id } = params

    const member = await prisma.teamMember.findUnique({
      where: { id },
      include: {
        teamMemberships: {
          include: {
            team: true,
          },
        },
        projectMembers: {
          include: {
            project: {
              select: {
                id: true,
                name: true,
                status: true,
              },
            },
          },
        },
      },
    })

    if (!member) {
      return NextResponse.json(
        { error: "Member not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(member)
  } catch (error) {
    console.error("Error fetching member:", error)
    return NextResponse.json(
      { error: "Failed to fetch member" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params
    const { id } = params
    const body = await request.json()

    const member = await prisma.teamMember.update({
      where: { id },
      data: {
        name: body.name,
        email: body.email,
        phone: body.phone,
        role: body.role as MemberRole,
        roles: body.roles,
        status: body.status as MemberStatus,
        department: body.department,
        hireDate: body.hireDate ? new Date(body.hireDate) : null,
        avatar: body.avatar,
        bio: body.bio,
        skills: body.skills,
        notes: body.notes,
      },
    })

    return NextResponse.json(member)
  } catch (error) {
    console.error("Error updating member:", error)
    
    const prismaError = error as { code?: string }
    if (prismaError.code === "P2002") {
      return NextResponse.json(
        { error: "Um membro com este email já existe" },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: "Failed to update member" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params
    const { id } = params

    await prisma.teamMember.delete({
      where: { id },
    })

    return NextResponse.json({ message: "Member deleted successfully" })
  } catch (error) {
    console.error("Error deleting member:", error)
    return NextResponse.json(
      { error: "Failed to delete member" },
      { status: 500 }
    )
  }
}

