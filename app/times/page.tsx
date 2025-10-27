"use client"

import { useEffect, useState } from "react"
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
import { 
  Plus, 
  Edit, 
  Trash2, 
  Users as UsersIcon,
  UserPlus,
  Crown,
} from "lucide-react"

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

const roleLabels: Record<string, string> = {
  DEVELOPER: "Desenvolvedor",
  DESIGNER: "Designer",
  PROJECT_MANAGER: "Gerente de Projeto",
  PRODUCT_MANAGER: "Gerente de Produto",
  QA_ENGINEER: "Engenheiro de QA",
  DEVOPS: "DevOps",
  DATA_SCIENTIST: "Cientista de Dados",
  BUSINESS_ANALYST: "Analista de Negócios",
  CEO: "CEO",
  CTO: "CTO",
  CFO: "CFO",
  OTHER: "Outro",
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

  useEffect(() => {
    fetchTeams()
    fetchMembers()
  }, [])

  const fetchTeams = async () => {
    try {
      const response = await fetch("/api/times")
      const data = await response.json()
      setTeams(data)
    } catch (error) {
      console.error("Error fetching teams:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMembers = async () => {
    try {
      const response = await fetch("/api/membros")
      const data = await response.json()
      setMembers(data.filter((m: Member) => m))
    } catch (error) {
      console.error("Error fetching members:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
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
  }

  const handleDelete = async (id: string) => {
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
  }

  const handleEdit = (team: Team) => {
    setEditingTeam(team)
    setFormData({
      name: team.name,
      description: team.description || "",
      leadId: team.leadId || "",
      memberIds: team.teamMemberships.map(tm => tm.member.id),
    })
    setIsDialogOpen(true)
  }

  const resetForm = () => {
    setEditingTeam(null)
    setFormData({
      name: "",
      description: "",
      leadId: "",
      memberIds: [],
    })
  }

  const toggleMember = (memberId: string) => {
    setFormData(prev => ({
      ...prev,
      memberIds: prev.memberIds.includes(memberId)
        ? prev.memberIds.filter(id => id !== memberId)
        : [...prev.memberIds, memberId],
    }))
  }

  const activeMembers = members.filter(m => m)

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Times</h1>
            <p className="text-gray-500 mt-1">Organize equipes por projetos e especialidades</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Time
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingTeam ? "Editar Time" : "Novo Time"}
                </DialogTitle>
                <DialogDescription>
                  Preencha os dados do time abaixo
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome do Time *</Label>
                  <Input
                    id="name"
                    placeholder="Time de Desenvolvimento Backend"
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
                    placeholder="Descrição do time e suas responsabilidades"
                    rows={3}
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="leadId">Líder do Time</Label>
                  <Select
                    value={formData.leadId}
                    onValueChange={(value) =>
                      setFormData({ ...formData, leadId: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um líder (opcional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {activeMembers.map((member) => (
                        <SelectItem key={member.id} value={member.id}>
                          {member.name} - {roleLabels[member.role]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Membros do Time</Label>
                  <div className="border rounded-md p-3 max-h-60 overflow-y-auto">
                    {activeMembers.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-4">
                        Nenhum membro disponível. Cadastre membros primeiro.
                      </p>
                    ) : (
                      <div className="grid grid-cols-2 gap-2">
                        {activeMembers.map((member) => (
                          <label
                            key={member.id}
                            className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                          >
                            <input
                              type="checkbox"
                              checked={formData.memberIds.includes(member.id)}
                              onChange={() => toggleMember(member.id)}
                              className="rounded"
                            />
                            <div className="flex-1">
                              <p className="text-sm font-medium">{member.name}</p>
                              <p className="text-xs text-gray-500">
                                {roleLabels[member.role]}
                              </p>
                            </div>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    Selecione os membros que farão parte deste time
                  </p>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {editingTeam ? "Atualizar" : "Criar"} Time
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total de Times
              </CardTitle>
              <UsersIcon className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{teams.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total de Membros
              </CardTitle>
              <UserPlus className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeMembers.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Média por Time
              </CardTitle>
              <UsersIcon className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {teams.length > 0
                  ? (teams.reduce((acc, t) => acc + (t._count?.teamMemberships || 0), 0) / teams.length).toFixed(1)
                  : 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {loading ? (
          <Card>
            <CardContent className="p-8">
              <p className="text-center text-gray-500">Carregando times...</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Lista de Times ({teams.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {teams.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  Nenhum time cadastrado ainda.
                </p>
              ) : (
                <div className="space-y-4">
                  {teams.map((team) => {
                    const leader = team.leadId
                      ? team.teamMemberships.find(tm => tm.member.id === team.leadId)?.member
                      : null

                    return (
                      <div
                        key={team.id}
                        className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <UsersIcon className="h-5 w-5 text-blue-600" />
                              <h3 className="text-lg font-semibold">{team.name}</h3>
                              <Badge variant="outline">
                                {team._count?.teamMemberships || 0} membros
                              </Badge>
                            </div>

                            {team.description && (
                              <p className="text-sm text-gray-600 mb-3">
                                {team.description}
                              </p>
                            )}

                            {leader && (
                              <div className="flex items-center gap-2 mb-3 text-sm">
                                <Crown className="h-4 w-4 text-yellow-600" />
                                <span className="font-medium">Líder:</span>
                                <span className="text-gray-600">{leader.name}</span>
                                <Badge variant="outline" className="text-xs">
                                  {roleLabels[leader.role]}
                                </Badge>
                              </div>
                            )}

                            {/* Members */}
                            {team.teamMemberships.length > 0 && (
                              <div className="space-y-2">
                                <p className="text-sm font-medium text-gray-700">
                                  Membros
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  {team.teamMemberships.map((tm) => (
                                    <div
                                      key={tm.id}
                                      className="flex items-center gap-2 bg-white border rounded-md px-3 py-1.5"
                                    >
                                      <div className="h-6 w-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs">
                                        {tm.member.name.charAt(0).toUpperCase()}
                                      </div>
                                      <div>
                                        <p className="text-sm font-medium">{tm.member.name}</p>
                                        <p className="text-xs text-gray-500">
                                          {roleLabels[tm.member.role]}
                                        </p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {team._count && team._count.projectTeams > 0 && (
                              <div className="mt-3 pt-3 border-t">
                                <p className="text-sm text-gray-600">
                                  <span className="font-medium">{team._count.projectTeams}</span>{" "}
                                  {team._count.projectTeams === 1 ? "projeto" : "projetos"} alocado(s)
                                </p>
                              </div>
                            )}
                          </div>

                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(team)}
                              title="Editar Time"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDelete(team.id)}
                              className="text-red-600 hover:text-red-700"
                              title="Excluir Time"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}

