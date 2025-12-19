"use client"

import { useEffect, useState, useCallback, useMemo } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { prepareValueForCurrencyInput, formatCurrencyInput } from "@/lib/utils/formatters"
import { ProjectsList } from "./components/projects-list"
import { ProjectFormDialog } from "./components/project-form-dialog"
import { ProjectsStats } from "./components/projects-stats"
import { Filter, X } from "lucide-react"
import {
  SectionHeader,
  HuntlyCard,
  HuntlyCardHeader,
  HuntlyCardContent,
  HuntlyLoading,
  HuntlyLabel,
} from "@/components/huntly-ui"

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
  billingType: string
  projectValue: number
  hourlyRate?: number
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
    tasks: number
  }
  financials?: {
    totalReceived: number
    totalCost: number
    profit: number
    remaining: number
    paymentProgress: number
  }
  hours?: {
    totalWorkedHours: number
    totalEstimatedHours: number
    calculatedValue: number
    effectiveHourlyRate: number
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

  // Filters
  const [filterBillingType, setFilterBillingType] = useState<string>("")
  const [filterStatus, setFilterStatus] = useState<string>("")
  const [filterMinRate, setFilterMinRate] = useState<string>("")
  const [filterMaxRate, setFilterMaxRate] = useState<string>("")
  const [showFilters, setShowFilters] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: "PLANNING",
    priority: "MEDIUM",
    billingType: "FIXED_PRICE",
    projectValue: "",
    hourlyRate: "",
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

  useEffect(() => {
    const clientId = searchParams?.get("clientId")
    const clientName = searchParams?.get("clientName")

    if (clientId && clientName) {
      setFormData((prev) => ({ ...prev, clientId }))
      setIsDialogOpen(true)
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
      billingType: "FIXED_PRICE",
      projectValue: "",
      hourlyRate: "",
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

      const projectValueDecimal = formData.billingType === "FIXED_PRICE" && formData.projectValue
        ? (parseFloat(formData.projectValue) / 100).toFixed(2)
        : "0"

      const hourlyRateDecimal = formData.billingType === "HOURLY_RATE" && formData.hourlyRate
        ? (parseFloat(formData.hourlyRate) / 100).toFixed(2)
        : null

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          projectValue: projectValueDecimal,
          hourlyRate: hourlyRateDecimal,
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
      billingType: project.billingType || "FIXED_PRICE",
      projectValue: prepareValueForCurrencyInput(project.projectValue || 0),
      hourlyRate: prepareValueForCurrencyInput(project.hourlyRate || 0),
      startDate: project.startDate ? project.startDate.split("T")[0] : "",
      endDate: project.endDate ? project.endDate.split("T")[0] : "",
      deadline: project.deadline ? project.deadline.split("T")[0] : "",
      clientId: project.clientId,
      teamMembers: project.teamMembers || "",
      notes: project.notes || "",
    })

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

  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      if (filterBillingType && p.billingType !== filterBillingType) {
        return false
      }
      if (filterStatus && p.status !== filterStatus) {
        return false
      }
      if (filterMinRate) {
        const minRate = parseFloat(filterMinRate) / 100
        const effectiveRate = p.hours?.effectiveHourlyRate || 0
        if (effectiveRate < minRate) {
          return false
        }
      }
      if (filterMaxRate) {
        const maxRate = parseFloat(filterMaxRate) / 100
        const effectiveRate = p.hours?.effectiveHourlyRate || 0
        if (effectiveRate > maxRate && effectiveRate > 0) {
          return false
        }
      }
      return true
    })
  }, [projects, filterBillingType, filterStatus, filterMinRate, filterMaxRate])

  const clearFilters = useCallback(() => {
    setFilterBillingType("")
    setFilterStatus("")
    setFilterMinRate("")
    setFilterMaxRate("")
  }, [])

  const hasActiveFilters = filterBillingType || filterStatus || filterMinRate || filterMaxRate

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

  const totalWorkedHours = useMemo(
    () => projects.reduce((sum, p) => sum + (p.hours?.totalWorkedHours || 0), 0),
    [projects]
  )

  const averageHourlyRate = useMemo(() => {
    const projectsWithHours = projects.filter(p => (p.hours?.totalWorkedHours || 0) > 0)
    if (projectsWithHours.length === 0) return 0
    const totalRate = projectsWithHours.reduce((sum, p) => sum + (p.hours?.effectiveHourlyRate || 0), 0)
    return totalRate / projectsWithHours.length
  }, [projects])

  if (loading) {
    return <HuntlyLoading text="Carregando projetos..." />
  }

  return (
    <div className="space-y-8">
      <SectionHeader
        label="Gestão"
        title="Projetos"
        titleBold="& Entregas"
        action={
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
        }
      />

      <ProjectsStats
        totalProjects={projects.length}
        inProgressProjects={inProgressProjects}
        completedProjects={completedProjects}
        plannedProjects={plannedProjects}
        totalWorkedHours={totalWorkedHours}
        averageHourlyRate={averageHourlyRate}
      />

      <HuntlyCard>
        <HuntlyCardHeader
          title="Lista de Projetos"
          description={`${filteredProjects.length}${hasActiveFilters ? ` de ${projects.length}` : ""} projetos`}
          action={
            <div className="flex items-center gap-2">
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="h-8 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5 mr-1" />
                  Limpar
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className={`h-8 ${showFilters ? "text-foreground bg-zinc-800" : "text-muted-foreground hover:text-foreground"}`}
              >
                <Filter className="h-3.5 w-3.5 mr-1" />
                Filtros
              </Button>
            </div>
          }
        />

        {showFilters && (
          <div className="px-5 pb-5">
            <div className="p-4 bg-muted/50 border border-border/50 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <HuntlyLabel>Tipo de Cobrança</HuntlyLabel>
                  <Select value={filterBillingType} onValueChange={setFilterBillingType}>
                    <SelectTrigger className="bg-card border-border h-10">
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="FIXED_PRICE">Valor Fixo</SelectItem>
                      <SelectItem value="HOURLY_RATE">Por Hora</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <HuntlyLabel>Status</HuntlyLabel>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="bg-card border-border h-10">
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="PLANNING">Planejamento</SelectItem>
                      <SelectItem value="IN_PROGRESS">Em Andamento</SelectItem>
                      <SelectItem value="ON_HOLD">Pausado</SelectItem>
                      <SelectItem value="COMPLETED">Concluído</SelectItem>
                      <SelectItem value="CANCELLED">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <HuntlyLabel>Rentabilidade Mínima</HuntlyLabel>
                  <Input
                    placeholder="R$ 0,00"
                    value={formatCurrencyInput(filterMinRate)}
                    onChange={(e) => {
                      const onlyNumbers = e.target.value.replace(/\D/g, "")
                      setFilterMinRate(onlyNumbers)
                    }}
                    className="bg-card border-border h-10"
                  />
                </div>

                <div className="space-y-2">
                  <HuntlyLabel>Rentabilidade Máxima</HuntlyLabel>
                  <Input
                    placeholder="R$ 0,00"
                    value={formatCurrencyInput(filterMaxRate)}
                    onChange={(e) => {
                      const onlyNumbers = e.target.value.replace(/\D/g, "")
                      setFilterMaxRate(onlyNumbers)
                    }}
                    className="bg-card border-border h-10"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        <HuntlyCardContent className="p-0">
          <ProjectsList
            projects={filteredProjects}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </HuntlyCardContent>
      </HuntlyCard>
    </div>
  )
}
