"use client"

import { memo } from "react"
import { Button } from "@/components/ui/button"
import {
  Edit,
  Trash2,
  TrendingUp,
  TrendingDown,
  Calendar,
  User,
  FolderKanban,
  Receipt,
  CreditCard,
} from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { HuntlyEmpty } from "@/components/huntly-ui"
import { transactionTypeColors, transactionTypeLabels } from "@/lib/design-tokens"

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

interface TransactionsListProps {
  transactions: Transaction[]
  onEdit: (transaction: Transaction) => void
  onDelete: (transaction: Transaction) => void
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value)
}

function TransactionsListComponent({
  transactions,
  onEdit,
  onDelete,
}: TransactionsListProps) {
  if (transactions.length === 0) {
    return (
      <div className="p-8">
        <HuntlyEmpty
          title="Nenhuma transação cadastrada"
          description="Clique em 'Nova Transação' para começar."
        />
      </div>
    )
  }

  return (
    <div className="divide-y divide-border">
      {transactions.map((transaction, index) => (
        <div
          key={transaction.id}
          className="group/item p-5 hover:bg-muted/30 transition-colors"
        >
          <div className="flex items-start justify-between gap-4">
            {/* Transaction Info */}
            <div className="flex-1 min-w-0">
              {/* Header */}
              <div className="flex items-center gap-3 mb-3">
                <span className="text-[10px] tracking-wider text-muted-foreground/70 font-mono">
                  {String(index + 1).padStart(2, '0')}
                </span>
                {transaction.type === "INCOME" ? (
                  <TrendingUp className="h-4 w-4 text-emerald-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                )}
                <h3 className="font-display text-base font-medium text-foreground/80 group-hover/item:text-foreground transition-colors truncate">
                  {transaction.description}
                </h3>
                <span className={`inline-flex items-center px-2 py-0.5 text-[10px] tracking-wide uppercase ${transactionTypeColors[transaction.type]}`}>
                  {transactionTypeLabels[transaction.type]}
                </span>
                <span className="inline-flex items-center px-2 py-0.5 text-[10px] border border-border text-muted-foreground dark:text-zinc-400">
                  {categoryLabels[transaction.category] || transaction.category}
                </span>
              </div>

              {/* Amount */}
              <div className="mb-3">
                <span className={`font-display text-xl font-bold tracking-tight ${
                  transaction.type === "INCOME" ? "text-emerald-400" : "text-red-400"
                }`}>
                  {transaction.type === "INCOME" ? "+" : "-"} {formatCurrency(transaction.amount)}
                </span>
              </div>

              {/* Details Grid */}
              <div className="flex flex-wrap gap-4 text-xs">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground/70" />
                  <span>{format(new Date(transaction.date), "dd/MM/yyyy", { locale: ptBR })}</span>
                </div>

                {transaction.client && (
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <User className="h-3.5 w-3.5 text-muted-foreground/70" />
                    <span>{transaction.client.name}</span>
                  </div>
                )}

                {transaction.project && (
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <FolderKanban className="h-3.5 w-3.5 text-muted-foreground/70" />
                    <span>{transaction.project.name}</span>
                  </div>
                )}

                {transaction.invoiceNumber && (
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Receipt className="h-3.5 w-3.5 text-muted-foreground/70" />
                    <span>NF: {transaction.invoiceNumber}</span>
                  </div>
                )}

                {transaction.paymentMethod && (
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <CreditCard className="h-3.5 w-3.5 text-muted-foreground/70" />
                    <span>{transaction.paymentMethod}</span>
                  </div>
                )}
              </div>

              {/* Notes */}
              {transaction.notes && (
                <p className="mt-3 text-xs text-muted-foreground bg-muted/50 border border-border/50 p-2 leading-relaxed">
                  {transaction.notes}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 opacity-0 group-hover/item:opacity-100 transition-opacity">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onEdit(transaction)}
                className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-muted"
                title="Editar Transação"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onDelete(transaction)}
                className="h-8 w-8 p-0 text-muted-foreground hover:text-red-400 hover:bg-red-950/30"
                title="Excluir Transação"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export const TransactionsList = memo(TransactionsListComponent)
