"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Edit, Trash2 } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { formatCurrencyInput, prepareValueForCurrencyInput } from "@/lib/utils/formatters"

const statusLabels: Record<string, string> = {
  PLANNING: "Planejamento",
  IN_PROGRESS: "Em Andamento",
  ON_HOLD: "Pausado",
  COMPLETED: "Concluído",
  CANCELLED: "Cancelado",
}

const priorityLabels: Record<string, string> = {
  LOW: "Baixa",
  MEDIUM: "Média",
  HIGH: "Alta",
  URGENT: "Urgente",
}

const statusColors: Record<string, string> = {
  PLANNING: "bg-blue-100 text-blue-800",
  IN_PROGRESS: "bg-green-100 text-green-800",
  ON_HOLD: "bg-yellow-100 text-yellow-800",
  COMPLETED: "bg-purple-100 text-purple-800",
  CANCELLED: "bg-red-100 text-red-800",
}

const priorityColors: Record<string, string> = {
  LOW: "bg-gray-100 text-gray-800",
  MEDIUM: "bg-blue-100 text-blue-800",
  HIGH: "bg-orange-100 text-orange-800",
  URGENT: "bg-red-100 text-red-800",
}

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

  useEffect(() => {
    fetchProjects()
    fetchClients()
    fetchMembers()
    fetchTeams()
  }, [])

  // Handle URL parameters (clientId and clientName from client page)
  useEffect(() => {
    const clientId = searchParams.get("clientId")
    const clientName = searchParams.get("clientName")
    
    if (clientId && clientName) {
      setFormData(prev => ({
        ...prev,
        clientId: clientId,
      }))
      setIsDialogOpen(true)
      
      // Clean URL after capturing params
      window.history.replaceState({}, "", "/projetos")
    }
  }, [searchParams])

  const fetchProjects = async () => {
    try {
      const response = await fetch("/api/projetos")
      const data = await response.json()
      setProjects(data)
    } catch (error) {
      console.error("Error fetching projects:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchClients = async () => {
    try {
      const response = await fetch("/api/clientes?status=ACTIVE")
      const data = await response.json()
      setClients(data)
    } catch (error) {
      console.error("Error fetching clients:", error)
    }
  }

  const fetchMembers = async () => {
    try {
      const response = await fetch("/api/membros?status=ACTIVE")
      const data = await response.json()
      setMembers(data)
    } catch (error) {
      console.error("Error fetching members:", error)
    }
  }

  const fetchTeams = async () => {
    try {
      const response = await fetch("/api/times")
      const data = await response.json()
      setTeams(data)
    } catch (error) {
      console.error("Error fetching teams:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const url = editingProject
        ? `/api/projetos/${editingProject.id}`
        : "/api/projetos"
      const method = editingProject ? "PUT" : "POST"

      // Convert values from cents to decimal
      const dataToSend = {
        ...formData,
        projectValue: formData.projectValue
          ? (parseFloat(formData.projectValue) / 100).toString()
          : "0",
        memberIds: selectedMemberIds,
        teamIds: selectedTeamIds,
      }

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend),
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
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este projeto?")) return

    try {
      const response = await fetch(`/api/projetos/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        fetchProjects()
      } else {
        alert("Erro ao excluir projeto")
      }
    } catch (error) {
      console.error("Error deleting project:", error)
      alert("Erro ao excluir projeto")
    }
  }

  const handleEdit = (project: Project) => {
    setEditingProject(project)
    setFormData({
      name: project.name,
      description: project.description || "",
      status: project.status,
      priority: project.priority,
      projectValue: prepareValueForCurrencyInput(project.projectValue),
      startDate: project.startDate ? format(new Date(project.startDate), "yyyy-MM-dd") : "",
      endDate: project.endDate ? format(new Date(project.endDate), "yyyy-MM-dd") : "",
      deadline: project.deadline ? format(new Date(project.deadline), "yyyy-MM-dd") : "",
      clientId: project.clientId,
      teamMembers: project.teamMembers || "",
      notes: project.notes || "",
    })
    
    // Load member and team IDs
    setSelectedMemberIds(
      project.projectMembers?.map((pm) => pm.member.id) || []
    )
    setSelectedTeamIds(
      project.projectTeams?.map((pt) => pt.team.id) || []
    )
    
    setIsDialogOpen(true)
  }

  const resetForm = () => {
    setEditingProject(null)
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
    setSelectedMemberIds([])
    setSelectedTeamIds([])
  }

  const handleDialogChange = (open: boolean) => {
    setIsDialogOpen(open)
    if (!open) {
      resetForm()
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando projetos...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Projetos</h1>
            <p className="text-gray-600 mt-1">Gerencie os projetos da empresa</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={handleDialogChange}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo Projeto
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingProject ? "Editar Projeto" : "Novo Projeto"}
                </DialogTitle>
                <DialogDescription>
                  Preencha os dados do projeto abaixo
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome do Projeto *</Label>
                  <Input
                    id="name"
                    placeholder="Gerador de Variações de Vídeos"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    placeholder="Descreva o escopo e objetivos do projeto"
                    rows={3}
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="clientId">Cliente *</Label>
                  <Select
                    value={formData.clientId}
                    onValueChange={(value) =>
                      setFormData({ ...formData, clientId: value })
                    }
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name} {client.company && `(${client.company})`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) =>
                        setFormData({ ...formData, status: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(statusLabels).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="priority">Prioridade</Label>
                    <Select
                      value={formData.priority}
                      onValueChange={(value) =>
                        setFormData({ ...formData, priority: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(priorityLabels).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="projectValue">Valor do Projeto (R$) *</Label>
                  <Input
                    id="projectValue"
                    placeholder="R$ 0,00"
                    required
                    value={formatCurrencyInput(formData.projectValue)}
                    onChange={(e) => {
                      const onlyNumbers = e.target.value.replace(/\D/g, "")
                      setFormData({ ...formData, projectValue: onlyNumbers })
                    }}
                  />
                  <p className="text-sm text-muted-foreground">
                    Valor total cobrado do cliente por este projeto
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Data de Início</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) =>
                        setFormData({ ...formData, startDate: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="deadline">Prazo</Label>
                    <Input
                      id="deadline"
                      type="date"
                      value={formData.deadline}
                      onChange={(e) =>
                        setFormData({ ...formData, deadline: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">Data de Conclusão</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) =>
                        setFormData({ ...formData, endDate: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-base font-semibold">Membros da Equipe</Label>
                    <div className="border rounded-lg p-4 max-h-48 overflow-y-auto">
                      {members.length === 0 ? (
                        <p className="text-sm text-muted-foreground">Nenhum membro cadastrado</p>
                      ) : (
                        <div className="space-y-3">
                          {members.map((member) => (
                            <div key={member.id} className="flex items-center space-x-2">
                              <Checkbox
                                id={`member-${member.id}`}
                                checked={selectedMemberIds.includes(member.id)}
                                onCheckedChange={(checked: boolean) => {
                                  if (checked) {
                                    setSelectedMemberIds([...selectedMemberIds, member.id])
                                  } else {
                                    setSelectedMemberIds(
                                      selectedMemberIds.filter((id) => id !== member.id)
                                    )
                                  }
                                }}
                              />
                              <Label
                                htmlFor={`member-${member.id}`}
                                className="text-sm font-normal cursor-pointer"
                              >
                                {member.name} <span className="text-muted-foreground">({member.role})</span>
                              </Label>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-base font-semibold">Times Alocados</Label>
                    <div className="border rounded-lg p-4 max-h-48 overflow-y-auto">
                      {teams.length === 0 ? (
                        <p className="text-sm text-muted-foreground">Nenhum time cadastrado</p>
                      ) : (
                        <div className="space-y-3">
                          {teams.map((team) => (
                            <div key={team.id} className="flex items-center space-x-2">
                              <Checkbox
                                id={`team-${team.id}`}
                                checked={selectedTeamIds.includes(team.id)}
                                onCheckedChange={(checked: boolean) => {
                                  if (checked) {
                                    setSelectedTeamIds([...selectedTeamIds, team.id])
                                  } else {
                                    setSelectedTeamIds(
                                      selectedTeamIds.filter((id) => id !== team.id)
                                    )
                                  }
                                }}
                              />
                              <Label
                                htmlFor={`team-${team.id}`}
                                className="text-sm font-normal cursor-pointer"
                              >
                                {team.name}
                              </Label>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Observações</Label>
                  <Textarea
                    id="notes"
                    placeholder="Observações e anotações sobre o projeto"
                    rows={4}
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleDialogChange(false)}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit">Salvar</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Projetos ({projects.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {projects.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                Nenhum projeto cadastrado ainda. Clique em &quot;Novo Projeto&quot; para começar.
              </p>
            ) : (
              <div className="space-y-4">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">{project.name}</h3>
                          <Badge className={statusColors[project.status]}>
                            {statusLabels[project.status]}
                          </Badge>
                          <Badge className={priorityColors[project.priority]}>
                            {priorityLabels[project.priority]}
                          </Badge>
                        </div>
                        {project.description && (
                          <p className="text-sm text-gray-600 mb-3">
                            {project.description}
                          </p>
                        )}
                        <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">Cliente:</span>{" "}
                            {project.client.name}
                            {project.client.company && ` (${project.client.company})`}
                          </div>
                          <div>
                            <span className="font-medium">Valor do Projeto:</span>{" "}
                            {new Intl.NumberFormat("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            }).format(project.projectValue)}
                          </div>
                          {project.startDate && (
                            <div>
                              <span className="font-medium">Início:</span>{" "}
                              {format(new Date(project.startDate), "dd/MM/yyyy", {
                                locale: ptBR,
                              })}
                            </div>
                          )}
                          {project.deadline && (
                            <div>
                              <span className="font-medium">Prazo:</span>{" "}
                              {format(new Date(project.deadline), "dd/MM/yyyy", {
                                locale: ptBR,
                              })}
                            </div>
                          )}
                          {project.teamMembers && (
                            <div className="col-span-2">
                              <span className="font-medium">Equipe:</span>{" "}
                              {project.teamMembers}
                            </div>
                          )}
                        </div>
                        {project.notes && (
                          <p className="mt-3 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                            {project.notes}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(project)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(project.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

