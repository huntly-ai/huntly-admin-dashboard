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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Plus, 
  Edit, 
  Trash2, 
  Users as UsersIcon,
  Mail,
  Phone,
  Briefcase,
  Calendar,
  UserCheck,
  UserX,
} from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { formatPhone } from "@/lib/utils/formatters"

const roleLabels: Record<string, string> = {
  DEVELOPER: "Desenvolvedor",
  DESIGNER: "Designer",
  PROJECT_MANAGER: "Gerente de Projeto",
  PRODUCT_MANAGER: "Gerente de Produto",
  QA_ENGINEER: "Engenheiro de QA",
  DEVOPS: "DevOps",
  DATA_SCIENTIST: "Cientista de Dados",
  BUSINESS_ANALYST: "Analista de Negócios",
  FOUNDER: "Fundador",
  CEO: "CEO",
  CTO: "CTO",
  CFO: "CFO",
  OTHER: "Outro",
}

const statusLabels: Record<string, string> = {
  ACTIVE: "Ativo",
  INACTIVE: "Inativo",
  ON_LEAVE: "De Férias",
}

const statusColors: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-800",
  INACTIVE: "bg-gray-100 text-gray-800",
  ON_LEAVE: "bg-yellow-100 text-yellow-800",
}

interface TeamMembership {
  id: string
  team: {
    id: string
    name: string
  }
}

interface Member {
  id: string
  name: string
  email: string
  phone?: string
  role: string
  roles?: string
  status: string
  department?: string
  hireDate?: string
  avatar?: string
  bio?: string
  skills?: string
  notes?: string
  teamMemberships: TeamMembership[]
  createdAt: string
  _count?: {
    projects: number
    teamMemberships: number
  }
}

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingMember, setEditingMember] = useState<Member | null>(null)
  const [selectedRoles, setSelectedRoles] = useState<string[]>(["DEVELOPER"])
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "DEVELOPER",
    status: "ACTIVE",
    department: "",
    hireDate: "",
    bio: "",
    skills: "",
    notes: "",
  })

  useEffect(() => {
    fetchMembers()
  }, [])

  const fetchMembers = async () => {
    try {
      const response = await fetch("/api/membros")
      const data = await response.json()
      setMembers(data)
    } catch (error) {
      console.error("Error fetching members:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const url = editingMember
        ? `/api/membros/${editingMember.id}`
        : "/api/membros"
      const method = editingMember ? "PUT" : "POST"

      const dataToSend = {
        ...formData,
        phone: formData.phone.replace(/\D/g, ""),
        roles: JSON.stringify(selectedRoles),
      }

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend),
      })

      if (response.ok) {
        setIsDialogOpen(false)
        resetForm()
        fetchMembers()
      } else {
        const error = await response.json()
        alert(error.error || "Erro ao salvar membro")
      }
    } catch (error) {
      console.error("Error saving member:", error)
      alert("Erro ao salvar membro")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este membro?")) return

    try {
      const response = await fetch(`/api/membros/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        fetchMembers()
      } else {
        const error = await response.json()
        alert(error.error || "Erro ao excluir membro")
      }
    } catch (error) {
      console.error("Error deleting member:", error)
      alert("Erro ao excluir membro")
    }
  }

  const handleEdit = (member: Member) => {
    setEditingMember(member)
    
    // Parse roles from JSON
    const memberRoles = member.roles ? JSON.parse(member.roles) : [member.role]
    setSelectedRoles(memberRoles)
    
    setFormData({
      name: member.name,
      email: member.email,
      phone: formatPhone(member.phone || ""),
      role: member.role,
      status: member.status,
      department: member.department || "",
      hireDate: member.hireDate ? member.hireDate.split("T")[0] : "",
      bio: member.bio || "",
      skills: member.skills || "",
      notes: member.notes || "",
    })
    setIsDialogOpen(true)
  }

  const resetForm = () => {
    setEditingMember(null)
    setSelectedRoles(["DEVELOPER"])
    setFormData({
      name: "",
      email: "",
      phone: "",
      role: "DEVELOPER",
      status: "ACTIVE",
      department: "",
      hireDate: "",
      bio: "",
      skills: "",
      notes: "",
    })
  }
  
  const toggleRole = (role: string) => {
    setSelectedRoles(prev => {
      if (prev.includes(role)) {
        // Don't allow removing the last role
        if (prev.length === 1) return prev
        return prev.filter(r => r !== role)
      }
      return [...prev, role]
    })
    
    // Update primary role if needed
    if (!selectedRoles.includes(formData.role)) {
      setFormData(prev => ({ ...prev, role: selectedRoles[0] || role }))
    }
  }

  const activeMembers = members.filter(m => m.status === "ACTIVE")
  const inactiveMembers = members.filter(m => m.status !== "ACTIVE")

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Membros da Equipe</h1>
            <p className="text-gray-500 mt-1">Gerencie os membros da Huntly</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Membro
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingMember ? "Editar Membro" : "Novo Membro"}
                </DialogTitle>
                <DialogDescription>
                  Preencha os dados do membro abaixo
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome Completo *</Label>
                    <Input
                      id="name"
                      placeholder="João Silva"
                      required
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="joao@huntly.com"
                      required
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      placeholder="+55 (11) 98765-4321"
                      value={formData.phone}
                      onChange={(e) => {
                        const formatted = formatPhone(e.target.value)
                        setFormData({ ...formData, phone: formatted })
                      }}
                      maxLength={19}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Cargo *</Label>
                    <Select
                      value={formData.role}
                      onValueChange={(value) =>
                        setFormData({ ...formData, role: value })
                      }
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o cargo" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(roleLabels).map(([key, label]) => (
                          <SelectItem key={key} value={key}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Todos os Cargos</Label>
                  <div className="border rounded-md p-3 max-h-48 overflow-y-auto">
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(roleLabels).map(([key, label]) => (
                        <label
                          key={key}
                          className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                        >
                          <input
                            type="checkbox"
                            checked={selectedRoles.includes(key)}
                            onChange={() => toggleRole(key)}
                            className="rounded"
                          />
                          <span className="text-sm">{label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">
                    Selecione todos os cargos deste membro (obrigatório ter pelo menos 1)
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="department">Departamento</Label>
                    <Input
                      id="department"
                      placeholder="Engenharia"
                      value={formData.department}
                      onChange={(e) =>
                        setFormData({ ...formData, department: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hireDate">Data de Contratação</Label>
                    <Input
                      id="hireDate"
                      type="date"
                      value={formData.hireDate}
                      onChange={(e) =>
                        setFormData({ ...formData, hireDate: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) =>
                        setFormData({ ...formData, status: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o status" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(statusLabels).map(([key, label]) => (
                          <SelectItem key={key} value={key}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio / Sobre</Label>
                  <Textarea
                    id="bio"
                    placeholder="Breve descrição sobre o membro"
                    rows={2}
                    value={formData.bio}
                    onChange={(e) =>
                      setFormData({ ...formData, bio: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="skills">Habilidades</Label>
                  <Input
                    id="skills"
                    placeholder="React, Node.js, TypeScript, PostgreSQL"
                    value={formData.skills}
                    onChange={(e) =>
                      setFormData({ ...formData, skills: e.target.value })
                    }
                  />
                  <p className="text-xs text-gray-500">
                    Separe as habilidades por vírgula
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Observações Internas</Label>
                  <Textarea
                    id="notes"
                    placeholder="Observações sobre o membro"
                    rows={2}
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                  />
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
                    {editingMember ? "Atualizar" : "Criar"} Membro
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
                Total de Membros
              </CardTitle>
              <UsersIcon className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{members.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Membros Ativos
              </CardTitle>
              <UserCheck className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeMembers.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Inativos / Férias
              </CardTitle>
              <UserX className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{inactiveMembers.length}</div>
            </CardContent>
          </Card>
        </div>

        {loading ? (
          <Card>
            <CardContent className="p-8">
              <p className="text-center text-gray-500">Carregando membros...</p>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="all" className="space-y-4">
            <TabsList>
              <TabsTrigger value="all">
                Todos ({members.length})
              </TabsTrigger>
              <TabsTrigger value="active">
                Ativos ({activeMembers.length})
              </TabsTrigger>
              <TabsTrigger value="inactive">
                Inativos ({inactiveMembers.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              <MembersList 
                members={members} 
                onEdit={handleEdit} 
                onDelete={handleDelete} 
              />
            </TabsContent>

            <TabsContent value="active" className="space-y-4">
              <MembersList 
                members={activeMembers} 
                onEdit={handleEdit} 
                onDelete={handleDelete} 
              />
            </TabsContent>

            <TabsContent value="inactive" className="space-y-4">
              <MembersList 
                members={inactiveMembers} 
                onEdit={handleEdit} 
                onDelete={handleDelete} 
              />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </DashboardLayout>
  )
}

function MembersList({
  members,
  onEdit,
  onDelete,
}: {
  members: Member[]
  onEdit: (member: Member) => void
  onDelete: (id: string) => void
}) {
  if (members.length === 0) {
    return (
      <Card>
        <CardContent className="p-8">
          <p className="text-center text-gray-500">
            Nenhum membro encontrado.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {members.map((member) => (
        <Card key={member.id} className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                  {member.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg truncate">{member.name}</h3>
                  <p className="text-sm text-gray-600">{roleLabels[member.role]}</p>
                </div>
              </div>
              <Badge className={`${statusColors[member.status]} flex-shrink-0`}>
                {statusLabels[member.status]}
              </Badge>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail className="h-4 w-4" />
                <span className="truncate">{member.email}</span>
              </div>
              {member.phone && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="h-4 w-4" />
                  <span>{formatPhone(member.phone)}</span>
                </div>
              )}
              {member.department && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Briefcase className="h-4 w-4" />
                  <span>{member.department}</span>
                </div>
              )}
              {member.hireDate && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Desde {format(new Date(member.hireDate), "MMM yyyy", { locale: ptBR })}
                  </span>
                </div>
              )}
            </div>

            {member.roles && JSON.parse(member.roles).length > 1 && (
              <div className="mb-4 pb-4 border-b">
                <p className="text-xs text-gray-500 mb-2 font-medium">Todos os Cargos:</p>
                <div className="flex flex-wrap gap-1">
                  {JSON.parse(member.roles).map((role: string, index: number) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {roleLabels[role]}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {member.skills && (
              <div className="mb-4">
                <p className="text-xs text-gray-500 mb-1">Habilidades:</p>
                <div className="flex flex-wrap gap-1">
                  {member.skills.split(",").slice(0, 3).map((skill, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {skill.trim()}
                    </Badge>
                  ))}
                  {member.skills.split(",").length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{member.skills.split(",").length - 3}
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {member._count && (
              <div className="flex gap-4 text-sm text-gray-600 mb-4 pt-2 border-t">
                <div>
                  <span className="font-medium">{member._count.projects}</span> projetos
                </div>
                <div>
                  <span className="font-medium">{member._count.teamMemberships}</span> times
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onEdit(member)}
                className="flex-1"
                title="Editar Membro"
              >
                <Edit className="h-4 w-4 mr-1" />
                Editar
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onDelete(member.id)}
                className="text-red-600 hover:text-red-700"
                title="Excluir Membro"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

