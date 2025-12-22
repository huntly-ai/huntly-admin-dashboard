"use client"

import { useEffect, useState, useCallback, useMemo } from "react"
import { prepareValueForCurrencyInput } from "@/lib/utils/formatters"
import { TransactionsList } from "./components/transactions-list"
import { TransactionFormDialog } from "./components/transaction-form-dialog"
import { DeleteTransactionDialog } from "./components/delete-transaction-dialog"
import { TransactionsStats } from "./components/transactions-stats"
import { PeriodSelector, type PeriodMode } from "./components/period-selector"
import {
  SectionHeader,
  HuntlyCard,
  HuntlyCardHeader,
  HuntlyCardContent,
  HuntlyLoading,
} from "@/components/huntly-ui"
import { startOfMonth, endOfMonth, isWithinInterval, parseISO } from "date-fns"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface Client {
  id: string
  name: string
}

interface Project {
  id: string
  name: string
  client?: {
    id: string
    name: string
  } | null
}

interface InternalProject {
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
  internalProject?: InternalProject
  invoiceNumber?: string
  paymentMethod?: string
  notes?: string
  isPaid?: boolean
  createdAt: string
}

export default function FinanceiroPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [internalProjects, setInternalProjects] = useState<InternalProject[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null)

  // Period filter state - defaults to current month
  const [selectedDate, setSelectedDate] = useState<Date>(() => startOfMonth(new Date()))
  const [periodMode, setPeriodMode] = useState<PeriodMode>("month")

  const [formData, setFormData] = useState({
    type: "INCOME",
    category: "",
    amount: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
    clientId: null as string | null,
    projectId: null as string | null,
    internalProjectId: null as string | null,
    invoiceNumber: "",
    paymentMethod: "",
    notes: "",
    isPaid: true,
  })

  const fetchTransactions = useCallback(async () => {
    try {
      const response = await fetch("/api/financeiro")
      const data = await response.json()
      setTransactions(data)
    } catch (error) {
      console.error("Error fetching transactions:", error)
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

  const fetchProjects = useCallback(async () => {
    try {
      const response = await fetch("/api/projetos")
      const data = await response.json()
      setProjects(data)
    } catch (error) {
      console.error("Error fetching projects:", error)
    }
  }, [])

  const fetchInternalProjects = useCallback(async () => {
    try {
      const response = await fetch("/api/projetos-internos")
      const data = await response.json()
      if (Array.isArray(data)) {
        setInternalProjects(data)
      }
    } catch (error) {
      console.error("Error fetching internal projects:", error)
    }
  }, [])

  useEffect(() => {
    fetchTransactions()
    fetchClients()
    fetchProjects()
    fetchInternalProjects()
  }, [fetchTransactions, fetchClients, fetchProjects, fetchInternalProjects])

  const resetForm = useCallback(() => {
    setEditingTransaction(null)
    setFormData({
      type: "INCOME",
      category: "",
      amount: "",
      description: "",
      date: new Date().toISOString().split("T")[0],
      clientId: null,
      projectId: null,
      internalProjectId: null,
      invoiceNumber: "",
      paymentMethod: "",
      notes: "",
      isPaid: true,
    })
  }, [])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const url = editingTransaction
        ? `/api/financeiro/${editingTransaction.id}`
        : "/api/financeiro"
      const method = editingTransaction ? "PUT" : "POST"

      // Convert amount to decimal
      const amountDecimal = (parseFloat(formData.amount) / 100).toFixed(2)

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          amount: amountDecimal,
          isPaid: formData.isPaid,
        }),
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
  }, [editingTransaction, formData, fetchTransactions, resetForm])

  const handleDelete = useCallback(async () => {
    if (!transactionToDelete) return

    try {
      const response = await fetch(`/api/financeiro/${transactionToDelete.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        fetchTransactions()
        setTransactionToDelete(null)
      } else {
        const error = await response.json()
        alert(error.error || "Erro ao excluir transação")
      }
    } catch (error) {
      console.error("Error deleting transaction:", error)
      alert("Erro ao excluir transação")
    }
  }, [transactionToDelete, fetchTransactions])

  const handleEdit = useCallback((transaction: Transaction) => {
    setEditingTransaction(transaction)
    setFormData({
      type: transaction.type,
      category: transaction.category,
      amount: prepareValueForCurrencyInput(transaction.amount),
      description: transaction.description,
      date: transaction.date ? transaction.date.split("T")[0] : "",
      clientId: transaction.client?.id || null,
      projectId: transaction.project?.id || null,
      internalProjectId: transaction.internalProject?.id || null,
      invoiceNumber: transaction.invoiceNumber || "",
      paymentMethod: transaction.paymentMethod || "",
      notes: transaction.notes || "",
      isPaid: transaction.isPaid ?? true,
    })
    setIsDialogOpen(true)
  }, [])

  const handleOpenDeleteDialog = useCallback((transaction: Transaction) => {
    setTransactionToDelete(transaction)
    setIsDeleteDialogOpen(true)
  }, [])

  const handleTogglePaid = useCallback(async (transaction: Transaction) => {
    try {
      const response = await fetch(`/api/financeiro/${transaction.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPaid: !transaction.isPaid }),
      })

      if (response.ok) {
        // Update local state for immediate feedback
        setTransactions((prev) =>
          prev.map((t) =>
            t.id === transaction.id ? { ...t, isPaid: !t.isPaid } : t
          )
        )
      } else {
        const error = await response.json()
        alert(error.error || "Erro ao atualizar status")
      }
    } catch (error) {
      console.error("Error toggling paid status:", error)
      alert("Erro ao atualizar status")
    }
  }, [])

  const handleFormChange = useCallback((field: keyof typeof formData, value: string | null | boolean) => {
    if (field === "isPaid") {
      // Handle isPaid as boolean
      const boolValue = typeof value === "boolean" ? value : value === "true"
      setFormData(prev => ({ ...prev, [field]: boolValue }))
    } else {
      setFormData(prev => ({ ...prev, [field]: value }))
    }
  }, [])

  const handleDialogChange = useCallback((open: boolean) => {
    setIsDialogOpen(open)
    if (!open) {
      resetForm()
    }
  }, [resetForm])

  // Filter transactions by selected period
  const filteredTransactions = useMemo(() => {
    if (periodMode === "all") {
      return transactions
    }

    const monthStart = startOfMonth(selectedDate)
    const monthEnd = endOfMonth(selectedDate)

    return transactions.filter((t) => {
      const transactionDate = parseISO(t.date)
      return isWithinInterval(transactionDate, { start: monthStart, end: monthEnd })
    })
  }, [transactions, selectedDate, periodMode])

  // Memoized calculations using filtered transactions
  const totalIncome = useMemo(
    () =>
      filteredTransactions
        .filter(t => t.type === "INCOME")
        .reduce((sum, t) => sum + Number(t.amount), 0),
    [filteredTransactions]
  )

  const totalExpense = useMemo(
    () =>
      filteredTransactions
        .filter(t => t.type === "EXPENSE")
        .reduce((sum, t) => sum + Number(t.amount), 0),
    [filteredTransactions]
  )

  const balance = useMemo(
    () => totalIncome - totalExpense,
    [totalIncome, totalExpense]
  )

  // Period label for display
  const periodLabel = useMemo(() => {
    if (periodMode === "all") {
      return "todas as transações"
    }
    const formatted = format(selectedDate, "MMMM 'de' yyyy", { locale: ptBR })
    return formatted.charAt(0).toUpperCase() + formatted.slice(1)
  }, [selectedDate, periodMode])

  if (loading) {
    return <HuntlyLoading text="Carregando transações..." />
  }

  return (
    <div className="space-y-8">
      <SectionHeader
        label="Finanças"
        title="Controle"
        titleBold="Financeiro"
        action={
          <div className="flex items-center gap-4">
            <PeriodSelector
              selectedDate={selectedDate}
              mode={periodMode}
              onDateChange={setSelectedDate}
              onModeChange={setPeriodMode}
            />
            <TransactionFormDialog
              isOpen={isDialogOpen}
              onOpenChange={handleDialogChange}
              editingTransaction={editingTransaction}
              formData={formData}
              clients={clients}
              projects={projects}
              internalProjects={internalProjects}
              onFormChange={handleFormChange}
              onSubmit={handleSubmit}
            />
          </div>
        }
      />

      <TransactionsStats
        totalIncome={totalIncome}
        totalExpense={totalExpense}
        balance={balance}
        periodLabel={periodLabel}
      />

      <HuntlyCard>
        <HuntlyCardHeader
          title="Transações"
          description={`${filteredTransactions.length} transações em ${periodLabel}`}
        />
        <HuntlyCardContent className="p-0">
          <TransactionsList
            transactions={filteredTransactions}
            onEdit={handleEdit}
            onDelete={handleOpenDeleteDialog}
            onTogglePaid={handleTogglePaid}
          />
        </HuntlyCardContent>
      </HuntlyCard>

      <DeleteTransactionDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        transaction={transactionToDelete}
        onConfirm={handleDelete}
      />
    </div>
  )
}
