"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatPhone, formatCNPJ } from "@/lib/utils/formatters"
import { ClientsList } from "./components/clients-list"
import { ClientFormDialog } from "./components/client-form-dialog"

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

  const fetchClients = useCallback(async () => {
    try {
      const response = await fetch("/api/clientes")
      const data = await response.json()
      setClients(data)
    } catch (error) {
      console.error("Error fetching clients:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchClients()
  }, [fetchClients])

  const resetForm = useCallback(() => {
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
  }, [])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
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
  }, [editingClient, formData, fetchClients, resetForm])

  const handleDelete = useCallback(async (id: string) => {
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
  }, [fetchClients])

  const handleEdit = useCallback((client: Client) => {
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
  }, [])

  const handleDialogChange = useCallback((open: boolean) => {
    setIsDialogOpen(open)
    if (!open) {
      resetForm()
    }
  }, [resetForm])

  const handleFormChange = useCallback((field: keyof typeof formData, value: string) => {
    if (field === "phone") {
      setFormData(prev => ({ ...prev, [field]: formatPhone(value) }))
    } else if (field === "cnpj") {
      setFormData(prev => ({ ...prev, [field]: formatCNPJ(value) }))
    } else {
      setFormData(prev => ({ ...prev, [field]: value }))
    }
  }, [])

  const handleCreateProject = useCallback((clientId: string, clientName: string) => {
    router.push(`/projetos?clientId=${clientId}&clientName=${encodeURIComponent(clientName)}`)
  }, [router])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando clientes...</p>
        </div>
      </div>
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
          <ClientFormDialog
            isOpen={isDialogOpen}
            onOpenChange={handleDialogChange}
            editingClient={editingClient}
            formData={formData}
            onFormChange={handleFormChange}
            onSubmit={handleSubmit}
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Clientes ({clients.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <ClientsList
              clients={clients}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onCreateProject={handleCreateProject}
            />
          </CardContent>
        </Card>
      </div>
    </>
  )
}
