"use client"

import { useEffect, useState, useCallback, useMemo } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { prepareValueForCurrencyInput } from "@/lib/utils/formatters"
import { ProjectsList } from "./components/projects-list"
import { ProjectFormDialog } from "./components/project-form-dialog"
import { ProjectsStats } from "./components/projects-stats"

interface Client {
  id: string
  name: string
  company?: string
}

interface Member {
  id: string
  name: string
  role: string
}

interface Team {
  id: string
  name: string
}

interface Project {
  id: string
  name: string
  description?: string
  status: string
  priority: string
  projectValue: number
  startDate?: string
  endDate?: string
  deadline?: string
  client: Client
  clientId: string
  teamMembers?: string
  notes?: string
  createdAt: string
  _count?: {
    transactions: number
  }
  financials?: {
    totalReceived: number
    totalCost: number
    profit: number
    remaining: number
    paymentProgress: number
  }
  projectMembers?: Array<{
    member: {
      id: string
      name: string
      role: string
    }
  }>
  projectTeams?: Array<{
    team: {
      id: string
      name: string
    }
  }>
}

export default function ProjectsPage() {
  const searchParams = useSearchParams()
  const [projects, setProjects] = useState<Project[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([])
  const [selectedTeamIds, setSelectedTeamIds] = useState<string[]>([])
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: "PLANNING",
    priority: "MEDIUM",
    projectValue: "",
    startDate: "",
    endDate: "",
    deadline: "",
    clientId: "",
    teamMembers: "",
    notes: "",
  })

  const fetchProjects = useCallback(async () => {
    try {
      const response = await fetch("/api/projetos")
      const data = await response.json()
      setProjects(data)
    } catch (error) {
      console.error("Error fetching projects:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchClients = useCallback(async () => {
    try {
      const response = await fetch("/api/clientes")
      const data = await response.json()
      setClients(data)
    } catch (error) {
      console.error("Error fetching clients:", error)
    }
  }, [])

  const fetchMembers = useCallback(async () => {
    try {
      const response = await fetch("/api/membros")
      const data = await response.json()
      setMembers(data)
    } catch (error) {
      console.error("Error fetching members:", error)
    }
  }, [])

  const fetchTeams = useCallback(async () => {
    try {
      const response = await fetch("/api/times")
      const data = await response.json()
      setTeams(data)
    } catch (error) {
      console.error("Error fetching teams:", error)
    }
  }, [])

  useEffect(() => {
    fetchProjects()
    fetchClients()
    fetchMembers()
    fetchTeams()
  }, [fetchProjects, fetchClients, fetchMembers, fetchTeams])

  // Check for clientId in URL params and pre-fill form
  useEffect(() => {
    const clientId = searchParams?.get("clientId")
    const clientName = searchParams?.get("clientName")

    if (clientId && clientName) {
      setFormData((prev) => ({ ...prev, clientId }))
      setIsDialogOpen(true)

      // Clean URL after opening dialog
      window.history.replaceState({}, "", "/projetos")
    }
  }, [searchParams])

  const resetForm = useCallback(() => {
    setEditingProject(null)
    setSelectedMemberIds([])
    setSelectedTeamIds([])
    setFormData({
      name: "",
      description: "",
      status: "PLANNING",
      priority: "MEDIUM",
      projectValue: "",
      startDate: "",
      endDate: "",
      deadline: "",
      clientId: "",
      teamMembers: "",
      notes: "",
    })
  }, [])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const url = editingProject
        ? `/api/projetos/${editingProject.id}`
        : "/api/projetos"
      const method = editingProject ? "PUT" : "POST"

      // Convert projectValue to decimal
      const projectValueDecimal = (parseFloat(formData.projectValue) / 100).toFixed(2)

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          projectValue: projectValueDecimal,
          memberIds: selectedMemberIds,
          teamIds: selectedTeamIds,
        }),
      })

      if (response.ok) {
        setIsDialogOpen(false)
        resetForm()
        fetchProjects()
      } else {
        const error = await response.json()
        alert(error.error || "Erro ao salvar projeto")
      }
    } catch (error) {
      console.error("Error saving project:", error)
      alert("Erro ao salvar projeto")
    }
  }, [editingProject, formData, selectedMemberIds, selectedTeamIds, fetchProjects, resetForm])

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este projeto?")) return

    try {
      const response = await fetch(`/api/projetos/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        fetchProjects()
      } else {
        const error = await response.json()
        alert(error.error || "Erro ao excluir projeto")
      }
    } catch (error) {
      console.error("Error deleting project:", error)
      alert("Erro ao excluir projeto")
    }
  }, [fetchProjects])

  const handleEdit = useCallback((project: Project) => {
    setEditingProject(project)
    setFormData({
      name: project.name,
      description: project.description || "",
      status: project.status,
      priority: project.priority,
      projectValue: prepareValueForCurrencyInput(project.projectValue),
      startDate: project.startDate ? project.startDate.split("T")[0] : "",
      endDate: project.endDate ? project.endDate.split("T")[0] : "",
      deadline: project.deadline ? project.deadline.split("T")[0] : "",
      clientId: project.clientId,
      teamMembers: project.teamMembers || "",
      notes: project.notes || "",
    })

    // Set selected members and teams
    if (project.projectMembers) {
      setSelectedMemberIds(project.projectMembers.map((pm) => pm.member.id))
    }
    if (project.projectTeams) {
      setSelectedTeamIds(project.projectTeams.map((pt) => pt.team.id))
    }

    setIsDialogOpen(true)
  }, [])

  const handleFormChange = useCallback((field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }, [])

  const handleMemberToggle = useCallback((memberId: string) => {
    setSelectedMemberIds(prev =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId]
    )
  }, [])

  const handleTeamToggle = useCallback((teamId: string) => {
    setSelectedTeamIds(prev =>
      prev.includes(teamId)
        ? prev.filter((id) => id !== teamId)
        : [...prev, teamId]
    )
  }, [])

  const handleDialogChange = useCallback((open: boolean) => {
    setIsDialogOpen(open)
    if (!open) {
      resetForm()
    }
  }, [resetForm])

  // Memoized calculations
  const inProgressProjects = useMemo(
    () => projects.filter(p => p.status === "IN_PROGRESS").length,
    [projects]
  )

  const completedProjects = useMemo(
    () => projects.filter(p => p.status === "COMPLETED").length,
    [projects]
  )

  const plannedProjects = useMemo(
    () => projects.filter(p => p.status === "PLANNING").length,
    [projects]
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando projetos...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Projetos</h1>
            <p className="text-gray-500 mt-1">
              Gerencie seus projetos e acompanhe o andamento
            </p>
          </div>
          <ProjectFormDialog
            isOpen={isDialogOpen}
            onOpenChange={handleDialogChange}
            editingProject={editingProject}
            formData={formData}
            clients={clients}
            members={members}
            teams={teams}
            selectedMemberIds={selectedMemberIds}
            selectedTeamIds={selectedTeamIds}
            onFormChange={handleFormChange}
            onMemberToggle={handleMemberToggle}
            onTeamToggle={handleTeamToggle}
            onSubmit={handleSubmit}
          />
        </div>

        <ProjectsStats
          totalProjects={projects.length}
          inProgressProjects={inProgressProjects}
          completedProjects={completedProjects}
          plannedProjects={plannedProjects}
        />

        <Card>
          <CardHeader>
            <CardTitle>Lista de Projetos ({projects.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <ProjectsList
              projects={projects}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </CardContent>
        </Card>
      </div>
    </>
  )
}
