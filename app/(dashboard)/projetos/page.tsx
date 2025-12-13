"use client"

import { useEffect, useState, useCallback, useMemo } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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

      // Convert values to decimal based on billing type
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

  // Filter projects
  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      // Filter by billing type
      if (filterBillingType && p.billingType !== filterBillingType) {
        return false
      }
      
      // Filter by status
      if (filterStatus && p.status !== filterStatus) {
        return false
      }
      
      // Filter by min effective hourly rate
      if (filterMinRate) {
        const minRate = parseFloat(filterMinRate) / 100
        const effectiveRate = p.hours?.effectiveHourlyRate || 0
        if (effectiveRate < minRate) {
          return false
        }
      }
      
      // Filter by max effective hourly rate
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
          totalWorkedHours={totalWorkedHours}
          averageHourlyRate={averageHourlyRate}
        />

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Lista de Projetos ({filteredProjects.length}{hasActiveFilters ? ` de ${projects.length}` : ""})</CardTitle>
              <div className="flex items-center gap-2">
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    <X className="h-4 w-4 mr-1" />
                    Limpar Filtros
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowFilters(!showFilters)}
                  className={showFilters ? "bg-gray-100" : ""}
                >
                  <Filter className="h-4 w-4 mr-1" />
                  Filtros
                </Button>
              </div>
            </div>
            
            {showFilters && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="filterBillingType">Tipo de Cobrança</Label>
                    <Select value={filterBillingType} onValueChange={setFilterBillingType}>
                      <SelectTrigger>
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
                    <Label htmlFor="filterStatus">Status</Label>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger>
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
                    <Label htmlFor="filterMinRate">Rentabilidade Mínima (R$/h)</Label>
                    <Input
                      id="filterMinRate"
                      placeholder="R$ 0,00"
                      value={formatCurrencyInput(filterMinRate)}
                      onChange={(e) => {
                        const onlyNumbers = e.target.value.replace(/\D/g, "")
                        setFilterMinRate(onlyNumbers)
                      }}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="filterMaxRate">Rentabilidade Máxima (R$/h)</Label>
                    <Input
                      id="filterMaxRate"
                      placeholder="R$ 0,00"
                      value={formatCurrencyInput(filterMaxRate)}
                      onChange={(e) => {
                        const onlyNumbers = e.target.value.replace(/\D/g, "")
                        setFilterMaxRate(onlyNumbers)
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
          </CardHeader>
          <CardContent>
            <ProjectsList
              projects={filteredProjects}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </CardContent>
        </Card>
      </div>
    </>
  )
}
