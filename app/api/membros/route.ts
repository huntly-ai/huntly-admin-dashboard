import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { MemberRole, MemberStatus } from "@prisma/client"

export async function GET() {
  try {
    const members = await prisma.teamMember.findMany({
      include: {
        teamMemberships: {
          include: {
            team: {
              include: {
                projectTeams: {
                  select: {
                    projectId: true,
                  },
                },
              },
            },
          },
        },
        projectMembers: {
          select: {
            projectId: true,
          },
        },
        _count: {
          select: {
            teamMemberships: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    })

    // Calculate total unique projects for each member
    const membersWithProjectCount = members.map(member => {
      // Get direct project IDs
      const directProjectIds = member.projectMembers.map(pm => pm.projectId)
      
      // Get project IDs from teams
      const teamProjectIds = member.teamMemberships.flatMap(tm => 
        tm.team.projectTeams.map(pt => pt.projectId)
      )
      
      // Combine and deduplicate
      const allProjectIds = [...new Set([...directProjectIds, ...teamProjectIds])]
      
      return {
        ...member,
        _count: {
          ...member._count,
          projects: allProjectIds.length,
        },
      }
    })

    return NextResponse.json(membersWithProjectCount)
  } catch (error) {
    console.error("Error fetching members:", error)
    return NextResponse.json(
      { error: "Failed to fetch members" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const member = await prisma.teamMember.create({
      data: {
        name: body.name,
        email: body.email,
        phone: body.phone,
        role: body.role as MemberRole,
        roles: body.roles,
        status: (body.status as MemberStatus) || "ACTIVE",
        department: body.department,
        hireDate: body.hireDate ? new Date(body.hireDate) : null,
        avatar: body.avatar,
        bio: body.bio,
        skills: body.skills,
        notes: body.notes,
      },
    })

    return NextResponse.json(member, { status: 201 })
  } catch (error) {
    console.error("Error creating member:", error)
    
    // Check for unique constraint violation
    const prismaError = error as { code?: string }
    if (prismaError.code === "P2002") {
      return NextResponse.json(
        { error: "Um membro com este email já existe" },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: "Failed to create member" },
      { status: 500 }
    )
  }
}

