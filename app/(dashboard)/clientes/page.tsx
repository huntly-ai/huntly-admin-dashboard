"use client"

import { useEffect, useState } from "react"
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
import { Plus, Edit, Trash2, FolderKanban, DollarSign } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { formatPhone, formatCNPJ } from "@/lib/utils/formatters"
import { useRouter } from "next/navigation"

const statusLabels: Record<string, string> = {
  ACTIVE: "Ativo",
  INACTIVE: "Inativo",
  CHURNED: "Perdido",
}

const statusColors: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-800",
  INACTIVE: "bg-yellow-100 text-yellow-800",
  CHURNED: "bg-red-100 text-red-800",
}

interface Client {
  id: string
  name: string
  email: string
  phone?: string
  company?: string
  position?: string
  status: string
  cnpj?: string
  address?: string
  website?: string
  notes?: string
  createdAt: string
  _count?: {
    projects: number
    transactions: number
  }
}

export default function ClientsPage() {
  const router = useRouter()
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    position: "",
    status: "ACTIVE",
    cnpj: "",
    address: "",
    website: "",
    notes: "",
  })

  useEffect(() => {
    fetchClients()
  }, [])

  const fetchClients = async () => {
    try {
      const response = await fetch("/api/clientes")
      const data = await response.json()
      setClients(data)
    } catch (error) {
      console.error("Error fetching clients:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const url = editingClient
        ? `/api/clientes/${editingClient.id}`
        : "/api/clientes"
      const method = editingClient ? "PUT" : "POST"

      // Remove máscaras antes de enviar
      const dataToSend = {
        ...formData,
        phone: formData.phone.replace(/\D/g, ""),
        cnpj: formData.cnpj.replace(/\D/g, ""),
      }

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend),
      })

      if (response.ok) {
        setIsDialogOpen(false)
        resetForm()
        fetchClients()
      } else {
        const error = await response.json()
        alert(error.error || "Erro ao salvar cliente")
      }
    } catch (error) {
      console.error("Error saving client:", error)
      alert("Erro ao salvar cliente")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este cliente?")) return

    try {
      const response = await fetch(`/api/clientes/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        fetchClients()
      } else {
        const error = await response.json()
        alert(error.error || "Erro ao excluir cliente")
      }
    } catch (error) {
      console.error("Error deleting client:", error)
      alert("Erro ao excluir cliente")
    }
  }

  const handleEdit = (client: Client) => {
    setEditingClient(client)
    setFormData({
      name: client.name,
      email: client.email,
      phone: formatPhone(client.phone || ""),
      company: client.company || "",
      position: client.position || "",
      status: client.status,
      cnpj: formatCNPJ(client.cnpj || ""),
      address: client.address || "",
      website: client.website || "",
      notes: client.notes || "",
    })
    setIsDialogOpen(true)
  }

  const resetForm = () => {
    setEditingClient(null)
    setFormData({
      name: "",
      email: "",
      phone: "",
      company: "",
      position: "",
      status: "ACTIVE",
      cnpj: "",
      address: "",
      website: "",
      notes: "",
    })
  }

  const handleDialogChange = (open: boolean) => {
    setIsDialogOpen(open)
    if (!open) {
      resetForm()
    }
  }

  if (loading) {
    return (
      <>
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando clientes...</p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Clientes</h1>
            <p className="text-gray-600 mt-1">Gerencie seus clientes ativos</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={handleDialogChange}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo Cliente
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingClient ? "Editar Cliente" : "Novo Cliente"}
                </DialogTitle>
                <DialogDescription>
                  Preencha os dados do cliente abaixo
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome *</Label>
                    <Input
                      id="name"
                      placeholder="Nome do cliente"
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
                      placeholder="email@exemplo.com"
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
                    <Label htmlFor="cnpj">CNPJ</Label>
                    <Input
                      id="cnpj"
                      placeholder="12.345.678/0001-90"
                      value={formData.cnpj}
                      onChange={(e) => {
                        const formatted = formatCNPJ(e.target.value)
                        setFormData({ ...formData, cnpj: formatted })
                      }}
                      maxLength={18}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="company">Empresa</Label>
                    <Input
                      id="company"
                      placeholder="Nome da empresa"
                      value={formData.company}
                      onChange={(e) =>
                        setFormData({ ...formData, company: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="position">Cargo</Label>
                    <Input
                      id="position"
                      placeholder="Cargo do contato"
                      value={formData.position}
                      onChange={(e) =>
                        setFormData({ ...formData, position: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      type="url"
                      placeholder="https://www.exemplo.com"
                      value={formData.website}
                      onChange={(e) =>
                        setFormData({ ...formData, website: e.target.value })
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
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Endereço</Label>
                  <Input
                    id="address"
                    placeholder="Rua, número, bairro, cidade - UF"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Observações</Label>
                  <Textarea
                    id="notes"
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
            <CardTitle>Lista de Clientes ({clients.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {clients.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                Nenhum cliente cadastrado ainda. Clique em &quot;Novo Cliente&quot; para começar.
              </p>
            ) : (
              <div className="space-y-4">
                {clients.map((client) => (
                  <div
                    key={client.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">{client.name}</h3>
                          <Badge className={statusColors[client.status]}>
                            {statusLabels[client.status]}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">Email:</span> {client.email}
                          </div>
                          {client.phone && (
                            <div>
                              <span className="font-medium">Telefone:</span> {formatPhone(client.phone)}
                            </div>
                          )}
                          {client.company && (
                            <div>
                              <span className="font-medium">Empresa:</span> {client.company}
                            </div>
                          )}
                          {client.cnpj && (
                            <div>
                              <span className="font-medium">CNPJ:</span> {formatCNPJ(client.cnpj)}
                            </div>
                          )}
                          {client.website && (
                            <div>
                              <span className="font-medium">Website:</span>{" "}
                              <a
                                href={client.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                              >
                                {client.website}
                              </a>
                            </div>
                          )}
                          <div>
                            <span className="font-medium">Cadastrado em:</span>{" "}
                            {format(new Date(client.createdAt), "dd/MM/yyyy", {
                              locale: ptBR,
                            })}
                          </div>
                        </div>
                        {client.address && (
                          <p className="mt-2 text-sm text-gray-600">
                            <span className="font-medium">Endereço:</span> {client.address}
                          </p>
                        )}
                        {client.notes && (
                          <p className="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                            {client.notes}
                          </p>
                        )}
                        {client._count && (
                          <div className="flex gap-4 mt-3">
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <FolderKanban className="h-4 w-4" />
                              <span>{client._count.projects} projetos</span>
                            </div>
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <DollarSign className="h-4 w-4" />
                              <span>{client._count.transactions} transações</span>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => router.push(`/projetos?clientId=${client.id}&clientName=${encodeURIComponent(client.name)}`)}
                          className="text-blue-600 hover:text-blue-700"
                          title="Criar Projeto"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Projeto
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(client)}
                          title="Editar Cliente"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(client.id)}
                          className="text-red-600 hover:text-red-700"
                          title="Excluir Cliente"
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
    </>
  )
}

