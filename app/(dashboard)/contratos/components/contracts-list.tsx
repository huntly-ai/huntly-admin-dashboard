"use client"

import { memo } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, FileText, Calendar, CheckCircle2, Clock, XCircle, AlertCircle } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { formatCurrency } from "@/lib/utils/formatters"

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
  totalValue: number
  startDate?: string
  endDate?: string
  signedDate?: string
  status: string
  client: Client
  contractProjects: ContractProject[]
  payments: Payment[]
  createdAt: string
}

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

const getPaymentStatusIcon = (status: string) => {
  switch (status) {
    case "PAID":
      return <CheckCircle2 className="h-4 w-4 text-green-600" />
    case "PENDING":
      return <Clock className="h-4 w-4 text-yellow-600" />
    case "LATE":
      return <AlertCircle className="h-4 w-4 text-red-600" />
    case "CANCELLED":
      return <XCircle className="h-4 w-4 text-gray-600" />
    default:
      return null
  }
}

interface ContractsListProps {
  contracts: Contract[]
  onEdit: (contract: Contract) => void
  onDelete: (id: string) => void
}

function ContractsListComponent({
  contracts,
  onEdit,
  onDelete,
}: ContractsListProps) {
  if (contracts.length === 0) {
    return (
      <p className="text-center text-gray-500 py-8">
        Nenhum contrato cadastrado ainda. Clique em &quot;Novo Contrato&quot; para começar.
      </p>
    )
  }

  return (
    <div className="space-y-4">
      {contracts.map((contract) => {
        const totalPaid = contract.payments
          .filter(p => p.status === "PAID")
          .reduce((sum, p) => sum + Number(p.amount), 0)
        const totalPending = contract.payments
          .filter(p => p.status === "PENDING")
          .reduce((sum, p) => sum + Number(p.amount), 0)

        return (
          <div
            key={contract.id}
            className="border rounded-lg p-5 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <FileText className="h-5 w-5 text-gray-600" />
                  <h3 className="font-semibold text-lg">{contract.title}</h3>
                  <Badge className={statusColors[contract.status]}>
                    {statusLabels[contract.status]}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mb-1">
                  <span className="font-medium">Número:</span> {contract.contractNumber} |{" "}
                  <span className="font-medium">Cliente:</span>{" "}
                  {contract.client.company || contract.client.name}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onEdit(contract)}
                  title="Editar Contrato"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onDelete(contract.id)}
                  className="text-red-600 hover:text-red-700"
                  title="Excluir Contrato"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {contract.description && (
              <p className="text-sm text-gray-600 mb-3">{contract.description}</p>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
              <div>
                <p className="text-xs text-gray-500">Valor Total</p>
                <p className="font-semibold text-blue-600">
                  {formatCurrency(String(contract.totalValue))}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Recebido</p>
                <p className="font-semibold text-green-600">
                  {formatCurrency(String(totalPaid))}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Pendente</p>
                <p className="font-semibold text-yellow-600">
                  {formatCurrency(String(totalPending))}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Projetos</p>
                <p className="font-semibold">{contract.contractProjects.length}</p>
              </div>
            </div>

            {contract.startDate && contract.endDate && (
              <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {format(new Date(contract.startDate), "dd/MM/yyyy", { locale: ptBR })} -{" "}
                    {format(new Date(contract.endDate), "dd/MM/yyyy", { locale: ptBR })}
                  </span>
                </div>
              </div>
            )}

            {contract.payments.length > 0 && (
              <div className="border-t pt-3">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Parcelas ({contract.payments.length})
                </p>
                <div className="flex flex-wrap gap-2">
                  {contract.payments.slice(0, 5).map((payment) => (
                    <div
                      key={payment.id}
                      className="flex items-center gap-1 text-xs bg-gray-50 px-2 py-1 rounded"
                    >
                      {getPaymentStatusIcon(payment.status)}
                      <span>
                        {payment.installmentNumber}ª - {formatCurrency(String(payment.amount))}
                      </span>
                      <Badge className={`${paymentStatusColors[payment.status]} text-xs`}>
                        {paymentStatusLabels[payment.status]}
                      </Badge>
                    </div>
                  ))}
                  {contract.payments.length > 5 && (
                    <span className="text-xs text-gray-500">
                      +{contract.payments.length - 5} parcelas
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

export const ContractsList = memo(ContractsListComponent)

