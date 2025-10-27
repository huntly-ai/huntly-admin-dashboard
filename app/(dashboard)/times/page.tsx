"use client"

import { useEffect, useState, useCallback, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TeamsList } from "./components/teams-list"
import { TeamFormDialog } from "./components/team-form-dialog"
import { TeamsStats } from "./components/teams-stats"

interface Member {
  id: string
  name: string
  email: string
  role: string
}

interface TeamMembership {
  id: string
  member: Member
}

interface Team {
  id: string
  name: string
  description?: string
  leadId?: string
  teamMemberships: TeamMembership[]
  createdAt: string
  _count?: {
    projectTeams: number
    teamMemberships: number
  }
}

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTeam, setEditingTeam] = useState<Team | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    leadId: "",
    memberIds: [] as string[],
  })

  const fetchTeams = useCallback(async () => {
    try {
      const response = await fetch("/api/times")
      const data = await response.json()
      setTeams(data)
    } catch (error) {
      console.error("Error fetching teams:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchMembers = useCallback(async () => {
    try {
      const response = await fetch("/api/membros")
      const data = await response.json()
      setMembers(data.filter((m: Member) => m))
    } catch (error) {
      console.error("Error fetching members:", error)
    }
  }, [])

  useEffect(() => {
    fetchTeams()
    fetchMembers()
  }, [fetchTeams, fetchMembers])

  const resetForm = useCallback(() => {
    setEditingTeam(null)
    setFormData({
      name: "",
      description: "",
      leadId: "",
      memberIds: [],
    })
  }, [])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const url = editingTeam
        ? `/api/times/${editingTeam.id}`
        : "/api/times"
      const method = editingTeam ? "PUT" : "POST"

      // Prepare data, converting empty leadId to null
      const dataToSend = {
        ...formData,
        leadId: formData.leadId || null,
      }

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend),
      })

      if (response.ok) {
        setIsDialogOpen(false)
        resetForm()
        fetchTeams()
      } else {
        const error = await response.json()
        alert(error.error || "Erro ao salvar time")
      }
    } catch (error) {
      console.error("Error saving team:", error)
      alert("Erro ao salvar time")
    }
  }, [editingTeam, formData, fetchTeams, resetForm])

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este time?")) return

    try {
      const response = await fetch(`/api/times/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        fetchTeams()
      } else {
        const error = await response.json()
        alert(error.error || "Erro ao excluir time")
      }
    } catch (error) {
      console.error("Error deleting team:", error)
      alert("Erro ao excluir time")
    }
  }, [fetchTeams])

  const handleEdit = useCallback((team: Team) => {
    setEditingTeam(team)
    setFormData({
      name: team.name,
      description: team.description || "",
      leadId: team.leadId || "",
      memberIds: team.teamMemberships.map(tm => tm.member.id),
    })
    setIsDialogOpen(true)
  }, [])

  const handleFormChange = useCallback((field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }, [])

  const handleMemberToggle = useCallback((memberId: string) => {
    setFormData(prev => ({
      ...prev,
      memberIds: prev.memberIds.includes(memberId)
        ? prev.memberIds.filter(id => id !== memberId)
        : [...prev.memberIds, memberId],
    }))
  }, [])

  const handleDialogChange = useCallback((open: boolean) => {
    setIsDialogOpen(open)
    if (!open) {
      resetForm()
    }
  }, [resetForm])

  // Memoized calculations
  const activeMembers = useMemo(
    () => members.filter(m => m),
    [members]
  )

  const averagePerTeam = useMemo(
    () => teams.length > 0
      ? teams.reduce((acc, t) => acc + (t._count?.teamMemberships || 0), 0) / teams.length
      : 0,
    [teams]
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando times...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Times</h1>
            <p className="text-gray-500 mt-1">
              Organize equipes por projetos e especialidades
            </p>
          </div>
          <TeamFormDialog
            isOpen={isDialogOpen}
            onOpenChange={handleDialogChange}
            editingTeam={editingTeam}
            formData={formData}
            members={members}
            onFormChange={handleFormChange}
            onMemberToggle={handleMemberToggle}
            onSubmit={handleSubmit}
          />
        </div>

        <TeamsStats
          totalTeams={teams.length}
          totalMembers={activeMembers.length}
          averagePerTeam={averagePerTeam}
        />

        <Card>
          <CardHeader>
            <CardTitle>Lista de Times ({teams.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <TeamsList
              teams={teams}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </CardContent>
        </Card>
      </div>
    </>
  )
}
