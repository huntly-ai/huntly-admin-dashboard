"use client"

import { memo } from "react"
import { Button } from "@/components/ui/button"
import { Edit, Trash2, FileText, Calendar, CheckCircle2, Clock, XCircle, AlertCircle, DollarSign, FolderKanban } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { HuntlyEmpty } from "@/components/huntly-ui"
import { contractStatusColors, contractStatusLabels } from "@/lib/design-tokens"

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

const paymentStatusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  PENDING: { label: "Pendente", color: "text-amber-400 border-amber-900/50 bg-amber-950/20", icon: Clock },
  PAID: { label: "Pago", color: "text-emerald-400 border-emerald-900/50 bg-emerald-950/20", icon: CheckCircle2 },
  LATE: { label: "Atrasado", color: "text-red-400 border-red-900/50 bg-red-950/20", icon: AlertCircle },
  CANCELLED: { label: "Cancelado", color: "text-zinc-400 border-zinc-700 bg-zinc-900/50", icon: XCircle },
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
      <div className="p-8">
        <HuntlyEmpty
          title="Nenhum contrato cadastrado"
          description="Clique em 'Novo Contrato' para começar."
        />
      </div>
    )
  }

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)

  return (
    <div className="divide-y divide-zinc-800/50">
      {contracts.map((contract, index) => {
        const totalPaid = contract.payments
          .filter(p => p.status === "PAID")
          .reduce((sum, p) => sum + Number(p.amount), 0)
        const totalPending = contract.payments
          .filter(p => p.status === "PENDING")
          .reduce((sum, p) => sum + Number(p.amount), 0)
        const paymentProgress = contract.totalValue > 0
          ? (totalPaid / Number(contract.totalValue)) * 100
          : 0

        return (
          <div
            key={contract.id}
            className="group/item p-5 hover:bg-zinc-900/30 transition-colors"
          >
            <div className="flex items-start justify-between gap-4">
              {/* Contract Info */}
              <div className="flex-1 min-w-0">
                {/* Header */}
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-[10px] tracking-wider text-zinc-600 font-mono">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <FileText className="h-4 w-4 text-zinc-600" />
                  <h3 className="font-display text-base font-medium text-zinc-200 group-hover/item:text-white transition-colors truncate">
                    {contract.title}
                  </h3>
                  <span className={`inline-flex items-center px-2 py-0.5 text-[10px] tracking-wide uppercase border ${contractStatusColors[contract.status]}`}>
                    {contractStatusLabels[contract.status]}
                  </span>
                </div>

                {/* Contract Number and Client */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-500 mb-3">
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-zinc-600 font-mono">#</span>
                    <span className="font-mono text-xs">{contract.contractNumber}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-zinc-600">Cliente:</span>
                    <span className="text-zinc-400">{contract.client.company || contract.client.name}</span>
                  </div>
                </div>

                {/* Description */}
                {contract.description && (
                  <p className="text-xs text-zinc-500 mb-4 line-clamp-2 leading-relaxed">
                    {contract.description}
                  </p>
                )}

                {/* Financial Summary */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <span className="text-[10px] uppercase tracking-wide text-zinc-600 block mb-1">Valor Total</span>
                    <span className="text-blue-400 font-medium">{formatCurrency(Number(contract.totalValue))}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-wide text-zinc-600 block mb-1">Recebido</span>
                    <span className="text-emerald-400 font-medium">{formatCurrency(totalPaid)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-wide text-zinc-600 block mb-1">Pendente</span>
                    <span className="text-amber-400 font-medium">{formatCurrency(totalPending)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-wide text-zinc-600 block mb-1">Projetos</span>
                    <span className="text-zinc-300 font-medium flex items-center gap-1">
                      <FolderKanban className="h-3 w-3 text-zinc-600" />
                      {contract.contractProjects.length}
                    </span>
                  </div>
                </div>

                {/* Payment Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-[10px] text-zinc-500 mb-1">
                    <span>Progresso de Pagamento</span>
                    <span>{paymentProgress.toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-zinc-800 h-1">
                    <div
                      className="bg-emerald-500 h-1 transition-all"
                      style={{ width: `${Math.min(paymentProgress, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Dates */}
                {(contract.startDate || contract.endDate) && (
                  <div className="flex items-center gap-4 text-xs text-zinc-600 mb-4">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>
                        {contract.startDate && format(new Date(contract.startDate), "dd/MM/yyyy", { locale: ptBR })}
                        {contract.startDate && contract.endDate && " - "}
                        {contract.endDate && format(new Date(contract.endDate), "dd/MM/yyyy", { locale: ptBR })}
                      </span>
                    </div>
                  </div>
                )}

                {/* Payments */}
                {contract.payments.length > 0 && (
                  <div className="bg-zinc-900/50 border border-zinc-800/50 p-3">
                    <div className="flex items-center gap-2 mb-3">
                      <DollarSign className="h-3.5 w-3.5 text-zinc-600" />
                      <span className="text-[10px] tracking-wide uppercase text-zinc-500">
                        Parcelas ({contract.payments.length})
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {contract.payments.slice(0, 5).map((payment) => {
                        const config = paymentStatusConfig[payment.status] || paymentStatusConfig.PENDING
                        const Icon = config.icon
                        return (
                          <div
                            key={payment.id}
                            className={`flex items-center gap-1.5 text-[10px] px-2 py-1 border ${config.color}`}
                          >
                            <Icon className="h-3 w-3" />
                            <span>{payment.installmentNumber}ª</span>
                            <span className="text-zinc-400">{formatCurrency(Number(payment.amount))}</span>
                          </div>
                        )
                      })}
                      {contract.payments.length > 5 && (
                        <span className="text-[10px] text-zinc-500 self-center">
                          +{contract.payments.length - 5} parcelas
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 opacity-0 group-hover/item:opacity-100 transition-opacity">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onEdit(contract)}
                  className="h-8 w-8 p-0 text-zinc-500 hover:text-white hover:bg-zinc-800/50"
                  title="Editar Contrato"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onDelete(contract.id)}
                  className="h-8 w-8 p-0 text-zinc-500 hover:text-red-400 hover:bg-red-950/30"
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
  )
}

export const ContractsList = memo(ContractsListComponent)
