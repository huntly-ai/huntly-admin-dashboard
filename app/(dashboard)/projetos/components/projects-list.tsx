"use client"

import { memo } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, Kanban } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

const statusLabels: Record<string, string> = {
  PLANNING: "Planejamento",
  IN_PROGRESS: "Em Andamento",
  ON_HOLD: "Pausado",
  COMPLETED: "Concluído",
  CANCELLED: "Cancelado",
}

const priorityLabels: Record<string, string> = {
  LOW: "Baixa",
  MEDIUM: "Média",
  HIGH: "Alta",
  URGENT: "Urgente",
}

const statusColors: Record<string, string> = {
  PLANNING: "bg-blue-100 text-blue-800",
  IN_PROGRESS: "bg-green-100 text-green-800",
  ON_HOLD: "bg-yellow-100 text-yellow-800",
  COMPLETED: "bg-purple-100 text-purple-800",
  CANCELLED: "bg-red-100 text-red-800",
}

const priorityColors: Record<string, string> = {
  LOW: "bg-gray-100 text-gray-800",
  MEDIUM: "bg-blue-100 text-blue-800",
  HIGH: "bg-orange-100 text-orange-800",
  URGENT: "bg-red-100 text-red-800",
}

interface Client {
  id: string
  name: string
  company?: string
}

interface Project {
  id: string
  name: string
  description?: string
  status: string
  priority: string
  projectValue: number
  startDate?: string
  endDate?: string
  deadline?: string
  client: Client
  clientId: string
  teamMembers?: string
  notes?: string
  createdAt: string
  _count?: {
    transactions: number
  }
  financials?: {
    totalReceived: number
    totalCost: number
    profit: number
    remaining: number
    paymentProgress: number
  }
  projectMembers?: Array<{
    member: {
      id: string
      name: string
      role: string
    }
  }>
  projectTeams?: Array<{
    team: {
      id: string
      name: string
    }
  }>
}

interface ProjectsListProps {
  projects: Project[]
  onEdit: (project: Project) => void
  onDelete: (id: string) => void
}

function ProjectsListComponent({
  projects,
  onEdit,
  onDelete,
}: ProjectsListProps) {
  const router = useRouter()

  if (projects.length === 0) {
    return (
      <p className="text-center text-gray-500 py-8">
        Nenhum projeto cadastrado ainda. Clique em &quot;Novo Projeto&quot; para começar.
      </p>
    )
  }

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => (
        <div
          key={project.id}
          className="border rounded-lg p-5 hover:shadow-lg transition-shadow bg-white"
        >
          {/* Header with title and actions */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg mb-1 pr-2">{project.name}</h3>
              <p className="text-sm text-gray-600">
                {project.client.name}
                {project.client.company && ` (${project.client.company})`}
              </p>
            </div>
            <div className="flex gap-1 flex-shrink-0">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => router.push(`/projetos/${project.id}`)}
                title="Ver Kanban"
                className="hover:bg-blue-50"
              >
                <Kanban className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onEdit(project)}
                title="Editar Projeto"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onDelete(project.id)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                title="Excluir Projeto"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Status and Priority badges */}
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge className={statusColors[project.status]}>
              {statusLabels[project.status]}
            </Badge>
            <Badge className={priorityColors[project.priority]}>
              {priorityLabels[project.priority]}
            </Badge>
          </div>

          {/* Description */}
          {project.description && (
            <p className="text-sm text-gray-600 mb-4 line-clamp-2">
              {project.description}
            </p>
          )}

          {/* Financial Summary */}
          {project.financials && (
            <div className="bg-gray-50 rounded-lg p-4 mb-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Valor do Projeto:</span>
                <span className="font-semibold text-blue-600">
                  {formatCurrency(project.projectValue)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Recebido:</span>
                <span className="font-semibold text-green-600">
                  {formatCurrency(project.financials.totalReceived)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Custos:</span>
                <span className="font-semibold text-red-600">
                  {formatCurrency(project.financials.totalCost)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Lucro:</span>
                <span
                  className={`font-semibold ${
                    project.financials.profit >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {formatCurrency(project.financials.profit)}
                </span>
              </div>
              
              {/* Payment Progress Bar */}
              <div className="pt-2">
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>Progresso de Pagamento</span>
                  <span>{project.financials.paymentProgress.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all"
                    style={{ width: `${Math.min(project.financials.paymentProgress, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Team Members */}
          {project.projectMembers && project.projectMembers.length > 0 && (
            <div className="mb-3">
              <p className="text-xs font-medium text-gray-500 mb-2">Membros:</p>
              <div className="flex flex-wrap gap-1">
                {project.projectMembers.slice(0, 3).map((pm) => (
                  <Badge key={pm.member.id} variant="secondary" className="text-xs">
                    {pm.member.name}
                  </Badge>
                ))}
                {project.projectMembers.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{project.projectMembers.length - 3}
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Teams */}
          {project.projectTeams && project.projectTeams.length > 0 && (
            <div className="mb-3">
              <p className="text-xs font-medium text-gray-500 mb-2">Times:</p>
              <div className="flex flex-wrap gap-1">
                {project.projectTeams.map((pt) => (
                  <Badge key={pt.team.id} variant="outline" className="text-xs">
                    {pt.team.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Dates */}
          <div className="text-xs text-gray-500 space-y-1 pt-3 border-t border-gray-100">
            {project.startDate && (
              <div>
                Início: {format(new Date(project.startDate), "dd/MM/yyyy", { locale: ptBR })}
              </div>
            )}
            {project.deadline && (
              <div>
                Prazo: {format(new Date(project.deadline), "dd/MM/yyyy", { locale: ptBR })}
              </div>
            )}
            {project.endDate && (
              <div>
                Conclusão: {format(new Date(project.endDate), "dd/MM/yyyy", { locale: ptBR })}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

export const ProjectsList = memo(ProjectsListComponent)

