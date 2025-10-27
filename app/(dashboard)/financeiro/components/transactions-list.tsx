"use client"

import { memo } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, TrendingUp, TrendingDown } from "lucide-react"
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

function TransactionsListComponent({
  transactions,
  onEdit,
  onDelete,
}: TransactionsListProps) {
  if (transactions.length === 0) {
    return (
      <p className="text-center text-gray-500 py-8">
        Nenhuma transação cadastrada ainda. Clique em &quot;Nova Transação&quot; para começar.
      </p>
    )
  }

  return (
    <div className="space-y-3">
      {transactions.map((transaction) => (
        <div
          key={transaction.id}
          className={`border rounded-lg p-4 hover:bg-gray-50 transition-colors ${
            transaction.type === "INCOME"
              ? "border-l-4 border-l-green-500"
              : "border-l-4 border-l-red-500"
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                {transaction.type === "INCOME" ? (
                  <TrendingUp className="h-5 w-5 text-green-600" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-red-600" />
                )}
                <h3 className="font-semibold text-lg">{transaction.description}</h3>
                <Badge
                  variant="outline"
                  className={
                    transaction.type === "INCOME"
                      ? "bg-green-50 text-green-700 border-green-200"
                      : "bg-red-50 text-red-700 border-red-200"
                  }
                >
                  {typeLabels[transaction.type]}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {categoryLabels[transaction.category]}
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-2 text-sm text-gray-600">
                <div>
                  <span className="font-medium">Valor:</span>{" "}
                  <span
                    className={`font-bold ${
                      transaction.type === "INCOME" ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(transaction.amount)}
                  </span>
                </div>
                <div>
                  <span className="font-medium">Data:</span>{" "}
                  {format(new Date(transaction.date), "dd/MM/yyyy", { locale: ptBR })}
                </div>
                {transaction.client && (
                  <div>
                    <span className="font-medium">Cliente:</span> {transaction.client.name}
                  </div>
                )}
                {transaction.project && (
                  <div>
                    <span className="font-medium">Projeto:</span> {transaction.project.name}
                  </div>
                )}
                {transaction.invoiceNumber && (
                  <div>
                    <span className="font-medium">NF:</span> {transaction.invoiceNumber}
                  </div>
                )}
                {transaction.paymentMethod && (
                  <div>
                    <span className="font-medium">Método:</span> {transaction.paymentMethod}
                  </div>
                )}
              </div>
              
              {transaction.notes && (
                <p className="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                  {transaction.notes}
                </p>
              )}
            </div>
            
            <div className="flex gap-2 ml-4">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onEdit(transaction)}
                title="Editar Transação"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onDelete(transaction)}
                className="text-red-600 hover:text-red-700"
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

