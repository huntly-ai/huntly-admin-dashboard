"use client"

import { useEffect, useState, useCallback, useMemo } from "react"
import { prepareValueForCurrencyInput } from "@/lib/utils/formatters"
import { TransactionsList } from "./components/transactions-list"
import { TransactionFormDialog } from "./components/transaction-form-dialog"
import { DeleteTransactionDialog } from "./components/delete-transaction-dialog"
import { TransactionsStats } from "./components/transactions-stats"
import {
  SectionHeader,
  HuntlyCard,
  HuntlyCardHeader,
  HuntlyCardContent,
  HuntlyLoading,
} from "@/components/huntly-ui"

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
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null)
  const [formData, setFormData] = useState({
    type: "INCOME",
    category: "",
    amount: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
    clientId: null as string | null,
    projectId: null as string | null,
    invoiceNumber: "",
    paymentMethod: "",
    notes: "",
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

  useEffect(() => {
    fetchTransactions()
    fetchClients()
    fetchProjects()
  }, [fetchTransactions, fetchClients, fetchProjects])

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
      invoiceNumber: "",
      paymentMethod: "",
      notes: "",
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
      invoiceNumber: transaction.invoiceNumber || "",
      paymentMethod: transaction.paymentMethod || "",
      notes: transaction.notes || "",
    })
    setIsDialogOpen(true)
  }, [])

  const handleOpenDeleteDialog = useCallback((transaction: Transaction) => {
    setTransactionToDelete(transaction)
    setIsDeleteDialogOpen(true)
  }, [])

  const handleFormChange = useCallback((field: keyof typeof formData, value: string | null) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }, [])

  const handleDialogChange = useCallback((open: boolean) => {
    setIsDialogOpen(open)
    if (!open) {
      resetForm()
    }
  }, [resetForm])

  // Memoized calculations
  const totalIncome = useMemo(
    () =>
      transactions
        .filter(t => t.type === "INCOME")
        .reduce((sum, t) => sum + Number(t.amount), 0),
    [transactions]
  )

  const totalExpense = useMemo(
    () =>
      transactions
        .filter(t => t.type === "EXPENSE")
        .reduce((sum, t) => sum + Number(t.amount), 0),
    [transactions]
  )

  const balance = useMemo(
    () => totalIncome - totalExpense,
    [totalIncome, totalExpense]
  )

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
          <TransactionFormDialog
            isOpen={isDialogOpen}
            onOpenChange={handleDialogChange}
            editingTransaction={editingTransaction}
            formData={formData}
            clients={clients}
            projects={projects}
            onFormChange={handleFormChange}
            onSubmit={handleSubmit}
          />
        }
      />

      <TransactionsStats
        totalIncome={totalIncome}
        totalExpense={totalExpense}
        balance={balance}
      />

      <HuntlyCard>
        <HuntlyCardHeader
          title="Transações"
          description={`${transactions.length} transações registradas`}
        />
        <HuntlyCardContent className="p-0">
          <TransactionsList
            transactions={transactions}
            onEdit={handleEdit}
            onDelete={handleOpenDeleteDialog}
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
