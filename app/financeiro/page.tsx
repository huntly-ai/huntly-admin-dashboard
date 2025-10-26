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
import { Plus, Edit, Trash2, TrendingUp, TrendingDown, DollarSign } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

const typeLabels: Record<string, string> = {
  INCOME: "Receita",
  EXPENSE: "Despesa",
}

const categoryLabels: Record<string, string> = {
  PROJECT_PAYMENT: "Pagamento de Projeto",
  CONSULTING: "Consultoria",
  LICENSE: "Licença",
  SUBSCRIPTION: "Assinatura",
  OTHER_INCOME: "Outra Receita",
  SALARIES: "Salários",
  INFRASTRUCTURE: "Infraestrutura",
  SOFTWARE: "Software",
  MARKETING: "Marketing",
  OFFICE: "Escritório",
  TAXES: "Impostos",
  OTHER_EXPENSE: "Outra Despesa",
}

const incomeCategories = [
  "PROJECT_PAYMENT",
  "CONSULTING",
  "LICENSE",
  "SUBSCRIPTION",
  "OTHER_INCOME",
]

const expenseCategories = [
  "SALARIES",
  "INFRASTRUCTURE",
  "SOFTWARE",
  "MARKETING",
  "OFFICE",
  "TAXES",
  "OTHER_EXPENSE",
]

interface Client {
  id: string
  name: string
}

interface Project {
  id: string
  name: string
}

interface Transaction {
  id: string
  type: string
  category: string
  amount: number
  description: string
  date: string
  client?: Client
  project?: Project
  invoiceNumber?: string
  paymentMethod?: string
  notes?: string
  createdAt: string
}

export default function FinanceiroPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [formData, setFormData] = useState({
    type: "INCOME",
    category: "PROJECT_PAYMENT",
    amount: "",
    description: "",
    date: format(new Date(), "yyyy-MM-dd"),
    clientId: "",
    projectId: "",
    invoiceNumber: "",
    paymentMethod: "",
    notes: "",
  })

  useEffect(() => {
    fetchTransactions()
    fetchClients()
    fetchProjects()
  }, [])

  const fetchTransactions = async () => {
    try {
      const response = await fetch("/api/financeiro")
      const data = await response.json()
      setTransactions(data)
    } catch (error) {
      console.error("Error fetching transactions:", error)
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
      const url = editingTransaction
        ? `/api/financeiro/${editingTransaction.id}`
        : "/api/financeiro"
      const method = editingTransaction ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setIsDialogOpen(false)
        resetForm()
        fetchTransactions()
      } else {
        const error = await response.json()
        alert(error.error || "Erro ao salvar transação")
      }
    } catch (error) {
      console.error("Error saving transaction:", error)
      alert("Erro ao salvar transação")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta transação?")) return

    try {
      const response = await fetch(`/api/financeiro/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        fetchTransactions()
      } else {
        alert("Erro ao excluir transação")
      }
    } catch (error) {
      console.error("Error deleting transaction:", error)
      alert("Erro ao excluir transação")
    }
  }

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction)
    setFormData({
      type: transaction.type,
      category: transaction.category,
      amount: transaction.amount.toString(),
      description: transaction.description,
      date: format(new Date(transaction.date), "yyyy-MM-dd"),
      clientId: transaction.client?.id || "",
      projectId: transaction.project?.id || "",
      invoiceNumber: transaction.invoiceNumber || "",
      paymentMethod: transaction.paymentMethod || "",
      notes: transaction.notes || "",
    })
    setIsDialogOpen(true)
  }

  const resetForm = () => {
    setEditingTransaction(null)
    setFormData({
      type: "INCOME",
      category: "PROJECT_PAYMENT",
      amount: "",
      description: "",
      date: format(new Date(), "yyyy-MM-dd"),
      clientId: "",
      projectId: "",
      invoiceNumber: "",
      paymentMethod: "",
      notes: "",
    })
  }

  const handleDialogChange = (open: boolean) => {
    setIsDialogOpen(open)
    if (!open) {
      resetForm()
    }
  }

  const handleTypeChange = (value: string) => {
    const newCategory = value === "INCOME" ? "PROJECT_PAYMENT" : "SALARIES"
    setFormData({ ...formData, type: value, category: newCategory })
  }

  // Calculate totals
  const totalIncome = transactions
    .filter((t) => t.type === "INCOME")
    .reduce((sum, t) => sum + t.amount, 0)

  const totalExpense = transactions
    .filter((t) => t.type === "EXPENSE")
    .reduce((sum, t) => sum + t.amount, 0)

  const balance = totalIncome - totalExpense

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando transações...</p>
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
            <h1 className="text-3xl font-bold text-gray-900">Financeiro</h1>
            <p className="text-gray-600 mt-1">Gerencie receitas e despesas</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={handleDialogChange}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nova Transação
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingTransaction ? "Editar Transação" : "Nova Transação"}
                </DialogTitle>
                <DialogDescription>
                  Preencha os dados da transação abaixo
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Tipo *</Label>
                    <Select
                      value={formData.type}
                      onValueChange={handleTypeChange}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(typeLabels).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Categoria *</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) =>
                        setFormData({ ...formData, category: value })
                      }
                      required
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(formData.type === "INCOME"
                          ? incomeCategories
                          : expenseCategories
                        ).map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {categoryLabels[cat]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Valor (R$) *</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      required
                      value={formData.amount}
                      onChange={(e) =>
                        setFormData({ ...formData, amount: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date">Data *</Label>
                    <Input
                      id="date"
                      type="date"
                      required
                      value={formData.date}
                      onChange={(e) =>
                        setFormData({ ...formData, date: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição *</Label>
                  <Input
                    id="description"
                    required
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="clientId">Cliente</Label>
                    <Select
                      value={formData.clientId}
                      onValueChange={(value) =>
                        setFormData({ ...formData, clientId: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione (opcional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Nenhum</SelectItem>
                        {clients.map((client) => (
                          <SelectItem key={client.id} value={client.id}>
                            {client.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="projectId">Projeto</Label>
                    <Select
                      value={formData.projectId}
                      onValueChange={(value) =>
                        setFormData({ ...formData, projectId: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione (opcional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Nenhum</SelectItem>
                        {projects.map((project) => (
                          <SelectItem key={project.id} value={project.id}>
                            {project.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="invoiceNumber">Número da Nota</Label>
                    <Input
                      id="invoiceNumber"
                      value={formData.invoiceNumber}
                      onChange={(e) =>
                        setFormData({ ...formData, invoiceNumber: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="paymentMethod">Método de Pagamento</Label>
                    <Input
                      id="paymentMethod"
                      placeholder="Ex: PIX, Boleto, Cartão"
                      value={formData.paymentMethod}
                      onChange={(e) =>
                        setFormData({ ...formData, paymentMethod: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Observações</Label>
                  <Textarea
                    id="notes"
                    rows={3}
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

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Receitas</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(totalIncome)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {transactions.filter((t) => t.type === "INCOME").length} transações
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Despesas</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(totalExpense)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {transactions.filter((t) => t.type === "EXPENSE").length} transações
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Saldo</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold ${
                  balance >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(balance)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {balance >= 0 ? "Positivo" : "Negativo"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Transactions List */}
        <Card>
          <CardHeader>
            <CardTitle>Transações ({transactions.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                Nenhuma transação cadastrada ainda. Clique em &quot;Nova Transação&quot; para começar.
              </p>
            ) : (
              <div className="space-y-3">
                {transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold">
                            {transaction.description}
                          </h3>
                          <Badge
                            className={
                              transaction.type === "INCOME"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }
                          >
                            {typeLabels[transaction.type]}
                          </Badge>
                          <Badge variant="outline">
                            {categoryLabels[transaction.category]}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-2 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">Valor:</span>{" "}
                            <span
                              className={
                                transaction.type === "INCOME"
                                  ? "text-green-600 font-semibold"
                                  : "text-red-600 font-semibold"
                              }
                            >
                              {transaction.type === "INCOME" ? "+" : "-"}
                              {new Intl.NumberFormat("pt-BR", {
                                style: "currency",
                                currency: "BRL",
                              }).format(transaction.amount)}
                            </span>
                          </div>
                          <div>
                            <span className="font-medium">Data:</span>{" "}
                            {format(new Date(transaction.date), "dd/MM/yyyy", {
                              locale: ptBR,
                            })}
                          </div>
                          {transaction.client && (
                            <div>
                              <span className="font-medium">Cliente:</span>{" "}
                              {transaction.client.name}
                            </div>
                          )}
                          {transaction.project && (
                            <div>
                              <span className="font-medium">Projeto:</span>{" "}
                              {transaction.project.name}
                            </div>
                          )}
                          {transaction.invoiceNumber && (
                            <div>
                              <span className="font-medium">NF:</span>{" "}
                              {transaction.invoiceNumber}
                            </div>
                          )}
                          {transaction.paymentMethod && (
                            <div>
                              <span className="font-medium">Pagamento:</span>{" "}
                              {transaction.paymentMethod}
                            </div>
                          )}
                        </div>
                        {transaction.notes && (
                          <p className="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                            {transaction.notes}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(transaction)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(transaction.id)}
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

