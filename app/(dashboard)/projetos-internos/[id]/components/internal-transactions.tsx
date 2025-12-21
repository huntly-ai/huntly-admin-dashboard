"use client"

import { memo, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  HuntlyCard,
  HuntlyCardHeader,
  HuntlyCardContent,
  HuntlyBadge,
  HuntlyLabel,
  HuntlyEmpty,
} from "@/components/huntly-ui"
import { formatCurrency, formatCurrencyInput } from "@/lib/utils/formatters"
import { Plus, TrendingUp, TrendingDown, Trash2 } from "lucide-react"
import { format } from "date-fns"

interface Transaction {
  id: string
  type: string
  category: string
  amount: number
  description: string
  date: string
  paymentMethod?: string | null
  notes?: string | null
}

interface InternalTransactionsProps {
  projectId: string
  transactions: Transaction[]
  onRefresh: () => void
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

const paymentMethods = [
  { value: "PIX", label: "PIX" },
  { value: "BOLETO", label: "Boleto" },
  { value: "CARTAO_CREDITO", label: "Cartão de Crédito" },
  { value: "TRANSFERENCIA", label: "Transferência" },
  { value: "CRIPTO", label: "Cripto" },
]

export const InternalTransactions = memo(function InternalTransactions({
  projectId,
  transactions,
  onRefresh,
}: InternalTransactionsProps) {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [formData, setFormData] = useState({
    type: "EXPENSE",
    category: "",
    amount: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
    paymentMethod: "",
    notes: "",
  })

  const totalIncome = transactions
    .filter((t) => t.type === "INCOME")
    .reduce((sum, t) => sum + Number(t.amount), 0)

  const totalExpense = transactions
    .filter((t) => t.type === "EXPENSE")
    .reduce((sum, t) => sum + Number(t.amount), 0)

  const profit = totalIncome - totalExpense

  const resetForm = useCallback(() => {
    setFormData({
      type: "EXPENSE",
      category: "",
      amount: "",
      description: "",
      date: new Date().toISOString().split("T")[0],
      paymentMethod: "",
      notes: "",
    })
  }, [])

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()

      try {
        const amountDecimal = (parseFloat(formData.amount) / 100).toFixed(2)

        const response = await fetch(
          `/api/projetos-internos/${projectId}/transactions`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...formData,
              amount: amountDecimal,
            }),
          }
        )

        if (response.ok) {
          setIsFormOpen(false)
          resetForm()
          onRefresh()
        } else {
          const error = await response.json()
          alert(error.error || "Erro ao criar transação")
        }
      } catch (error) {
        console.error("Error creating transaction:", error)
        alert("Erro ao criar transação")
      }
    },
    [formData, projectId, onRefresh, resetForm]
  )

  const handleDelete = useCallback(
    async (id: string) => {
      if (!confirm("Tem certeza que deseja excluir esta transação?")) return

      try {
        const response = await fetch(`/api/financeiro/${id}`, {
          method: "DELETE",
        })

        if (response.ok) {
          onRefresh()
        }
      } catch (error) {
        console.error("Error deleting transaction:", error)
      }
    },
    [onRefresh]
  )

  const availableCategories =
    formData.type === "INCOME" ? incomeCategories : expenseCategories

  const handleTypeChange = useCallback((value: string) => {
    // Reset category when type changes
    setFormData((prev) => ({ ...prev, type: value, category: "" }))
  }, [])

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <HuntlyCard className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-emerald-400" />
            <span className="text-xs uppercase tracking-wider text-muted-foreground">
              Receita
            </span>
          </div>
          <p className="text-xl font-medium text-emerald-400">
            {formatCurrency(totalIncome)}
          </p>
        </HuntlyCard>

        <HuntlyCard className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="h-4 w-4 text-red-400" />
            <span className="text-xs uppercase tracking-wider text-muted-foreground">
              Despesas
            </span>
          </div>
          <p className="text-xl font-medium text-red-400">
            {formatCurrency(totalExpense)}
          </p>
        </HuntlyCard>

        <HuntlyCard className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs uppercase tracking-wider text-muted-foreground">
              Resultado
            </span>
          </div>
          <p
            className={`text-xl font-medium ${
              profit >= 0 ? "text-emerald-400" : "text-red-400"
            }`}
          >
            {formatCurrency(profit)}
          </p>
        </HuntlyCard>
      </div>

      {/* Transactions List */}
      <HuntlyCard>
        <HuntlyCardHeader
          title="Transações"
          description={`${transactions.length} transações`}
          action={
            <Button
              size="sm"
              onClick={() => setIsFormOpen(true)}
              className="gap-2 bg-white text-black hover:bg-zinc-200"
            >
              <Plus className="h-4 w-4" />
              Nova
            </Button>
          }
        />
        <HuntlyCardContent className="p-0">
          {transactions.length === 0 ? (
            <HuntlyEmpty
              title="Nenhuma transação"
              description="Adicione receitas e despesas deste projeto"
            />
          ) : (
            <div className="divide-y divide-border">
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 hover:bg-muted/30"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-8 h-8 flex items-center justify-center ${
                        transaction.type === "INCOME"
                          ? "bg-emerald-950/50"
                          : "bg-red-950/50"
                      }`}
                    >
                      {transaction.type === "INCOME" ? (
                        <TrendingUp className="h-4 w-4 text-emerald-400" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-400" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {transaction.description}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <HuntlyBadge>
                          {categoryLabels[transaction.category] ||
                            transaction.category}
                        </HuntlyBadge>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(transaction.date), "dd/MM/yyyy")}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span
                      className={`text-sm font-medium ${
                        transaction.type === "INCOME"
                          ? "text-emerald-400"
                          : "text-red-400"
                      }`}
                    >
                      {transaction.type === "INCOME" ? "+" : "-"}
                      {formatCurrency(transaction.amount)}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-red-400"
                      onClick={() => handleDelete(transaction.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </HuntlyCardContent>
      </HuntlyCard>

      {/* Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[425px] bg-card border-border">
          <DialogHeader>
            <DialogTitle className="font-display">Nova Transação</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <HuntlyLabel>Tipo *</HuntlyLabel>
                <Select
                  value={formData.type}
                  onValueChange={handleTypeChange}
                >
                  <SelectTrigger className="bg-card border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INCOME">Receita</SelectItem>
                    <SelectItem value="EXPENSE">Despesa</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <HuntlyLabel>Categoria *</HuntlyLabel>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, category: value }))
                  }
                >
                  <SelectTrigger className="bg-card border-border">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCategories.map((cat) => (
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
                <HuntlyLabel>Valor *</HuntlyLabel>
                <Input
                  placeholder="R$ 0,00"
                  value={formatCurrencyInput(formData.amount)}
                  onChange={(e) => {
                    const onlyNumbers = e.target.value.replace(/\D/g, "")
                    setFormData((prev) => ({ ...prev, amount: onlyNumbers }))
                  }}
                  className="bg-card border-border"
                  required
                />
              </div>

              <div className="space-y-2">
                <HuntlyLabel>Data *</HuntlyLabel>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, date: e.target.value }))
                  }
                  className="bg-card border-border"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <HuntlyLabel>Descrição *</HuntlyLabel>
              <Input
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Descrição da transação"
                className="bg-card border-border"
                required
              />
            </div>

            <div className="space-y-2">
              <HuntlyLabel>Método de Pagamento</HuntlyLabel>
              <Select
                value={formData.paymentMethod}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, paymentMethod: value }))
                }
              >
                <SelectTrigger className="bg-card border-border">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethods.map((method) => (
                    <SelectItem key={method.value} value={method.value}>
                      {method.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <HuntlyLabel>Observações</HuntlyLabel>
              <Textarea
                value={formData.notes}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, notes: e.target.value }))
                }
                placeholder="Observações adicionais"
                className="bg-card border-border min-h-[60px]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsFormOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-white text-black hover:bg-zinc-200"
              >
                Criar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
})
