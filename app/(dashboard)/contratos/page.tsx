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
import { 
  Plus, 
  Edit, 
  Trash2, 
  FileText, 
  Calendar, 
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
} from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { formatCurrency, formatCurrencyInput, prepareValueForCurrencyInput } from "@/lib/utils/formatters"

const statusLabels: Record<string, string> = {
  DRAFT: "Rascunho",
  ACTIVE: "Ativo",
  COMPLETED: "Concluído",
  CANCELLED: "Cancelado",
  SUSPENDED: "Suspenso",
}

const statusColors: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-800",
  ACTIVE: "bg-green-100 text-green-800",
  COMPLETED: "bg-blue-100 text-blue-800",
  CANCELLED: "bg-red-100 text-red-800",
  SUSPENDED: "bg-yellow-100 text-yellow-800",
}

const paymentStatusLabels: Record<string, string> = {
  PENDING: "Pendente",
  PAID: "Pago",
  LATE: "Atrasado",
  CANCELLED: "Cancelado",
}

const paymentStatusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  PAID: "bg-green-100 text-green-800",
  LATE: "bg-red-100 text-red-800",
  CANCELLED: "bg-gray-100 text-gray-800",
}

interface Client {
  id: string
  name: string
  email: string
  company?: string
}

interface Project {
  id: string
  name: string
  status: string
}

interface Payment {
  id: string
  installmentNumber: number
  amount: number
  dueDate: string
  paymentDate?: string
  status: string
}

interface ContractProject {
  id: string
  project: Project
}

interface Contract {
  id: string
  contractNumber: string
  title: string
  description?: string
  status: string
  totalValue: number
  startDate: string
  endDate: string
  signedDate?: string
  client: Client
  clientId: string
  contractProjects: ContractProject[]
  payments: Payment[]
  terms?: string
  notes?: string
  createdAt: string
  _count?: {
    payments: number
    contractProjects: number
  }
}

interface PaymentFormData {
  installmentNumber: number
  amount: string
  dueDate: string
}

export default function ContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingContract, setEditingContract] = useState<Contract | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "DRAFT",
    totalValue: "",
    startDate: "",
    endDate: "",
    signedDate: "",
    clientId: "",
    projectIds: [] as string[],
    terms: "",
    notes: "",
  })
  const [payments, setPayments] = useState<PaymentFormData[]>([])

  useEffect(() => {
    fetchContracts()
    fetchClients()
    fetchProjects()
  }, [])

  const fetchContracts = async () => {
    try {
      const response = await fetch("/api/contratos")
      const data = await response.json()
      setContracts(data)
    } catch (error) {
      console.error("Error fetching contracts:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchClients = async () => {
    try {
      const response = await fetch("/api/clientes")
      const data = await response.json()
      setClients(data.filter((c: Client) => c))
    } catch (error) {
      console.error("Error fetching clients:", error)
    }
  }

  const fetchProjects = async () => {
    try {
      const response = await fetch("/api/projetos")
      const data = await response.json()
      setProjects(data)
    } catch (error) {
      console.error("Error fetching projects:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const url = editingContract
        ? `/api/contratos/${editingContract.id}`
        : "/api/contratos"
      const method = editingContract ? "PUT" : "POST"

      const dataToSend = {
        ...formData,
        totalValue: formData.totalValue
          ? (parseFloat(formData.totalValue) / 100).toString()
          : "0",
        payments: payments.map(p => ({
          ...p,
          amount: p.amount ? (parseFloat(p.amount) / 100).toString() : "0",
        })),
      }

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend),
      })

      if (response.ok) {
        setIsDialogOpen(false)
        resetForm()
        fetchContracts()
      } else {
        const error = await response.json()
        alert(error.error || "Erro ao salvar contrato")
      }
    } catch (error) {
      console.error("Error saving contract:", error)
      alert("Erro ao salvar contrato")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este contrato?")) return

    try {
      const response = await fetch(`/api/contratos/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        fetchContracts()
      } else {
        const error = await response.json()
        alert(error.error || "Erro ao excluir contrato")
      }
    } catch (error) {
      console.error("Error deleting contract:", error)
      alert("Erro ao excluir contrato")
    }
  }

  const handleEdit = (contract: Contract) => {
    setEditingContract(contract)
    setFormData({
      title: contract.title,
      description: contract.description || "",
      status: contract.status,
      totalValue: prepareValueForCurrencyInput(contract.totalValue),
      startDate: contract.startDate.split("T")[0],
      endDate: contract.endDate.split("T")[0],
      signedDate: contract.signedDate ? contract.signedDate.split("T")[0] : "",
      clientId: contract.clientId,
      projectIds: contract.contractProjects.map(cp => cp.project.id),
      terms: contract.terms || "",
      notes: contract.notes || "",
    })
    setPayments(
      contract.payments.map(p => ({
        installmentNumber: p.installmentNumber,
        amount: prepareValueForCurrencyInput(p.amount),
        dueDate: p.dueDate.split("T")[0],
      }))
    )
    setIsDialogOpen(true)
  }

  const resetForm = () => {
    setEditingContract(null)
    setFormData({
      title: "",
      description: "",
      status: "DRAFT",
      totalValue: "",
      startDate: "",
      endDate: "",
      signedDate: "",
      clientId: "",
      projectIds: [],
      terms: "",
      notes: "",
    })
    setPayments([])
  }

  const addPayment = () => {
    const nextInstallment = payments.length + 1
    setPayments([
      ...payments,
      {
        installmentNumber: nextInstallment,
        amount: "",
        dueDate: "",
      },
    ])
  }

  const removePayment = (index: number) => {
    setPayments(payments.filter((_, i) => i !== index))
  }

  const updatePayment = (index: number, field: keyof PaymentFormData, value: string | number) => {
    const updated = [...payments]
    updated[index] = { ...updated[index], [field]: value }
    setPayments(updated)
  }

  const toggleProject = (projectId: string) => {
    setFormData(prev => ({
      ...prev,
      projectIds: prev.projectIds.includes(projectId)
        ? prev.projectIds.filter(id => id !== projectId)
        : [...prev.projectIds, projectId],
    }))
  }

  const calculatePaidAmount = (contract: Contract) => {
    return contract.payments
      .filter(p => p.status === "PAID")
      .reduce((sum, p) => sum + p.amount, 0)
  }

  const calculatePendingAmount = (contract: Contract) => {
    return contract.payments
      .filter(p => p.status === "PENDING" || p.status === "LATE")
      .reduce((sum, p) => sum + p.amount, 0)
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Contratos</h1>
            <p className="text-gray-500 mt-1">Gerencie contratos e pagamentos</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Contrato
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingContract ? "Editar Contrato" : "Novo Contrato"}
                </DialogTitle>
                <DialogDescription>
                  Preencha os dados do contrato abaixo
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Título *</Label>
                    <Input
                      id="title"
                      placeholder="Nome do contrato"
                      required
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
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
                            {client.name} {client.company ? `(${client.company})` : ""}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    placeholder="Descrição detalhada do contrato"
                    rows={3}
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="totalValue">Valor Total *</Label>
                    <Input
                      id="totalValue"
                      placeholder="R$ 0,00"
                      required
                      value={formatCurrencyInput(formData.totalValue)}
                      onChange={(e) => {
                        const onlyNumbers = e.target.value.replace(/\D/g, "")
                        setFormData({ ...formData, totalValue: onlyNumbers })
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Data Início *</Label>
                    <Input
                      id="startDate"
                      type="date"
                      required
                      value={formData.startDate}
                      onChange={(e) =>
                        setFormData({ ...formData, startDate: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">Data Fim *</Label>
                    <Input
                      id="endDate"
                      type="date"
                      required
                      value={formData.endDate}
                      onChange={(e) =>
                        setFormData({ ...formData, endDate: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="signedDate">Data de Assinatura</Label>
                    <Input
                      id="signedDate"
                      type="date"
                      value={formData.signedDate}
                      onChange={(e) =>
                        setFormData({ ...formData, signedDate: e.target.value })
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

                {/* Projects Selection */}
                <div className="space-y-2">
                  <Label>Projetos Vinculados</Label>
                  <div className="border rounded-md p-3 max-h-40 overflow-y-auto">
                    {projects
                      .filter(p => p && formData.clientId === "")
                      .length === 0 && formData.clientId !== "" ? (
                      <div className="grid grid-cols-2 gap-2">
                        {projects
                          .filter(p => p)
                          .map((project) => (
                            <label
                              key={project.id}
                              className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                            >
                              <input
                                type="checkbox"
                                checked={formData.projectIds.includes(project.id)}
                                onChange={() => toggleProject(project.id)}
                                className="rounded"
                              />
                              <span className="text-sm">{project.name}</span>
                            </label>
                          ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">
                        Selecione um cliente para ver os projetos disponíveis
                      </p>
                    )}
                  </div>
                </div>

                {/* Payments */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Parcelas de Pagamento</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addPayment}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Adicionar Parcela
                    </Button>
                  </div>
                  {payments.length > 0 ? (
                    <div className="space-y-2 max-h-60 overflow-y-auto border rounded-md p-3">
                      {payments.map((payment, index) => (
                        <div key={index} className="flex gap-2 items-end">
                          <div className="w-20">
                            <Label className="text-xs">Parcela</Label>
                            <Input
                              type="number"
                              placeholder="1"
                              min="1"
                              value={payment.installmentNumber}
                              onChange={(e) =>
                                updatePayment(index, "installmentNumber", parseInt(e.target.value))
                              }
                              className="h-9"
                            />
                          </div>
                          <div className="flex-1">
                            <Label className="text-xs">Valor</Label>
                            <Input
                              placeholder="R$ 0,00"
                              value={formatCurrencyInput(payment.amount)}
                              onChange={(e) => {
                                const onlyNumbers = e.target.value.replace(/\D/g, "")
                                updatePayment(index, "amount", onlyNumbers)
                              }}
                              className="h-9"
                            />
                          </div>
                          <div className="flex-1">
                            <Label className="text-xs">Vencimento</Label>
                            <Input
                              type="date"
                              value={payment.dueDate}
                              onChange={(e) =>
                                updatePayment(index, "dueDate", e.target.value)
                              }
                              className="h-9"
                            />
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removePayment(index)}
                            className="h-9"
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 text-center p-4 border rounded-md">
                      Nenhuma parcela adicionada
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="terms">Termos e Condições</Label>
                  <Textarea
                    id="terms"
                    placeholder="Termos contratuais, cláusulas, etc."
                    rows={3}
                    value={formData.terms}
                    onChange={(e) =>
                      setFormData({ ...formData, terms: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Observações</Label>
                  <Textarea
                    id="notes"
                    placeholder="Observações internas sobre o contrato"
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
                    {editingContract ? "Atualizar" : "Criar"} Contrato
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <Card>
            <CardContent className="p-8">
              <p className="text-center text-gray-500">Carregando contratos...</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Lista de Contratos ({contracts.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {contracts.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">
                    Nenhum contrato cadastrado ainda.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {contracts.map((contract) => {
                      const paidAmount = calculatePaidAmount(contract)
                      const pendingAmount = calculatePendingAmount(contract)
                      const paidPercentage = (paidAmount / contract.totalValue) * 100

                      return (
                        <div
                          key={contract.id}
                          className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <FileText className="h-5 w-5 text-blue-600" />
                                <h3 className="text-lg font-semibold">{contract.title}</h3>
                                <Badge className={statusColors[contract.status]}>
                                  {statusLabels[contract.status]}
                                </Badge>
                                <span className="text-sm text-gray-500">
                                  {contract.contractNumber}
                                </span>
                              </div>

                              <div className="grid grid-cols-2 gap-4 mb-3">
                                <div>
                                  <p className="text-sm text-gray-600">
                                    <span className="font-medium">Cliente:</span>{" "}
                                    {contract.client.name}
                                    {contract.client.company && ` (${contract.client.company})`}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    <span className="font-medium">Email:</span> {contract.client.email}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-600">
                                    <Calendar className="inline h-3 w-3 mr-1" />
                                    <span className="font-medium">Período:</span>{" "}
                                    {format(new Date(contract.startDate), "dd/MM/yyyy", { locale: ptBR })}
                                    {" até "}
                                    {format(new Date(contract.endDate), "dd/MM/yyyy", { locale: ptBR })}
                                  </p>
                                  {contract.signedDate && (
                                    <p className="text-sm text-gray-600">
                                      <span className="font-medium">Assinado em:</span>{" "}
                                      {format(new Date(contract.signedDate), "dd/MM/yyyy", { locale: ptBR })}
                                    </p>
                                  )}
                                </div>
                              </div>

                              {/* Financial Summary */}
                              <div className="bg-gray-50 rounded-lg p-3 mb-3">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-4">
                                    <div>
                                      <p className="text-xs text-gray-500">Valor Total</p>
                                      <p className="text-lg font-bold text-gray-900">
                                        {formatCurrency(contract.totalValue)}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-gray-500">Pago</p>
                                      <p className="text-lg font-bold text-green-600">
                                        {formatCurrency(paidAmount)}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-gray-500">Pendente</p>
                                      <p className="text-lg font-bold text-yellow-600">
                                        {formatCurrency(pendingAmount)}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-2xl font-bold text-blue-600">
                                      {paidPercentage.toFixed(0)}%
                                    </p>
                                    <p className="text-xs text-gray-500">Recebido</p>
                                  </div>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-green-600 h-2 rounded-full transition-all"
                                    style={{ width: `${Math.min(paidPercentage, 100)}%` }}
                                  />
                                </div>
                              </div>

                              {/* Payments */}
                              {contract.payments.length > 0 && (
                                <div className="space-y-2">
                                  <p className="text-sm font-medium text-gray-700">
                                    Parcelas ({contract.payments.length})
                                  </p>
                                  <div className="flex flex-wrap gap-2">
                                    {contract.payments.map((payment) => (
                                      <div
                                        key={payment.id}
                                        className="flex items-center gap-2 bg-white border rounded-md px-3 py-2"
                                      >
                                        {payment.status === "PAID" && (
                                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                                        )}
                                        {payment.status === "PENDING" && (
                                          <Clock className="h-4 w-4 text-yellow-600" />
                                        )}
                                        {payment.status === "LATE" && (
                                          <AlertCircle className="h-4 w-4 text-red-600" />
                                        )}
                                        {payment.status === "CANCELLED" && (
                                          <XCircle className="h-4 w-4 text-gray-600" />
                                        )}
                                        <div>
                                          <p className="text-xs font-medium">
                                            #{payment.installmentNumber} - {formatCurrency(payment.amount)}
                                          </p>
                                          <p className="text-xs text-gray-500">
                                            {format(new Date(payment.dueDate), "dd/MM/yyyy", { locale: ptBR })}
                                          </p>
                                        </div>
                                        <Badge
                                          className={`${paymentStatusColors[payment.status]} text-xs`}
                                        >
                                          {paymentStatusLabels[payment.status]}
                                        </Badge>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Projects */}
                              {contract.contractProjects.length > 0 && (
                                <div className="mt-3">
                                  <p className="text-sm font-medium text-gray-700 mb-1">
                                    Projetos Vinculados
                                  </p>
                                  <div className="flex flex-wrap gap-2">
                                    {contract.contractProjects.map((cp) => (
                                      <Badge key={cp.id} variant="outline">
                                        {cp.project.name}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {contract.description && (
                                <p className="text-sm text-gray-600 mt-3 bg-gray-50 p-2 rounded">
                                  {contract.description}
                                </p>
                              )}
                            </div>

                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEdit(contract)}
                                title="Editar Contrato"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDelete(contract.id)}
                                className="text-red-600 hover:text-red-700"
                                title="Excluir Contrato"
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
          </div>
        )}
      </div>
    </>
  )
}

