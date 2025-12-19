"use client"

import { memo } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Edit, Trash2, Kanban, Clock, DollarSign, Calendar, Users, Briefcase } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import {
  projectStatusColors,
  projectStatusLabels,
  priorityColors,
  priorityLabels,
  billingTypeColors,
  billingTypeLabels,
} from "@/lib/design-tokens"
import { HuntlyEmpty } from "@/components/huntly-ui"

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
  billingType: string
  projectValue: number
  hourlyRate?: number
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
    tasks: number
  }
  financials?: {
    totalReceived: number
    totalCost: number
    profit: number
    remaining: number
    paymentProgress: number
  }
  hours?: {
    totalWorkedHours: number
    totalEstimatedHours: number
    calculatedValue: number
    effectiveHourlyRate: number
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
      <div className="p-8">
        <HuntlyEmpty
          title="Nenhum projeto cadastrado"
          description="Clique em 'Novo Projeto' para começar."
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
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 p-5">
      {projects.map((project, index) => (
        <div
          key={project.id}
          className="group/item relative bg-black/50 backdrop-blur-sm border border-zinc-800 hover:border-zinc-700 transition-all duration-300"
        >
          {/* Corner accents */}
          <div className="absolute top-0 left-0 w-3 h-3 border-l border-t border-white/0 group-hover/item:border-white/30 transition-colors duration-300" />
          <div className="absolute top-0 right-0 w-3 h-3 border-r border-t border-white/0 group-hover/item:border-white/30 transition-colors duration-300" />
          <div className="absolute bottom-0 left-0 w-3 h-3 border-l border-b border-white/0 group-hover/item:border-white/30 transition-colors duration-300" />
          <div className="absolute bottom-0 right-0 w-3 h-3 border-r border-b border-white/0 group-hover/item:border-white/30 transition-colors duration-300" />

          {/* Hover line */}
          <div className="absolute bottom-0 left-0 w-0 h-px bg-white/30 group-hover/item:w-full transition-all duration-500" />

          {/* Header */}
          <div className="p-4 border-b border-zinc-800/50">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] tracking-wider text-zinc-600 font-mono">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <h3 className="font-display text-base font-medium text-zinc-200 group-hover/item:text-white transition-colors truncate">
                    {project.name}
                  </h3>
                </div>
                <p className="text-xs text-zinc-500">
                  {project.client.name}
                  {project.client.company && ` • ${project.client.company}`}
                </p>
              </div>
              <div className="flex gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => router.push(`/projetos/${project.id}`)}
                  className="h-7 w-7 p-0 text-zinc-500 hover:text-blue-400 hover:bg-blue-950/30"
                  title="Ver Kanban"
                >
                  <Kanban className="h-3.5 w-3.5" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onEdit(project)}
                  className="h-7 w-7 p-0 text-zinc-500 hover:text-white hover:bg-zinc-800/50"
                  title="Editar"
                >
                  <Edit className="h-3.5 w-3.5" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onDelete(project.id)}
                  className="h-7 w-7 p-0 text-zinc-500 hover:text-red-400 hover:bg-red-950/30"
                  title="Excluir"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-1.5 mt-3">
              <span className={`inline-flex items-center px-2 py-0.5 text-[10px] tracking-wide uppercase border ${projectStatusColors[project.status]}`}>
                {projectStatusLabels[project.status]}
              </span>
              <span className={`inline-flex items-center px-2 py-0.5 text-[10px] tracking-wide uppercase border ${priorityColors[project.priority]?.bg} ${priorityColors[project.priority]?.text} ${priorityColors[project.priority]?.border}`}>
                {priorityLabels[project.priority]}
              </span>
              <span className={`inline-flex items-center px-2 py-0.5 text-[10px] tracking-wide uppercase border ${billingTypeColors[project.billingType] || billingTypeColors.FIXED_PRICE}`}>
                {billingTypeLabels[project.billingType] || billingTypeLabels.FIXED_PRICE}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 space-y-4">
            {/* Description */}
            {project.description && (
              <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed">
                {project.description}
              </p>
            )}

            {/* Hours & Rate Summary */}
            {project.hours && project.hours.totalWorkedHours > 0 && (
              <div className="bg-amber-950/20 border border-amber-900/30 p-3 space-y-2">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-3.5 w-3.5 text-amber-500" />
                  <span className="text-[10px] tracking-wide uppercase text-amber-400">Horas & Rentabilidade</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-zinc-500 block">Trabalhadas</span>
                    <span className="text-amber-400 font-medium">{project.hours.totalWorkedHours.toFixed(1)}h</span>
                  </div>
                  {project.hours.totalEstimatedHours > 0 && (
                    <div>
                      <span className="text-zinc-500 block">Estimadas</span>
                      <span className="text-zinc-400">{project.hours.totalEstimatedHours.toFixed(1)}h</span>
                    </div>
                  )}
                </div>
                {project.billingType === "HOURLY_RATE" && project.hourlyRate && (
                  <div className="text-xs pt-1 border-t border-amber-900/30">
                    <span className="text-zinc-500">Taxa: </span>
                    <span className="text-amber-400">{formatCurrency(project.hourlyRate)}/h</span>
                  </div>
                )}
                <div className="flex items-center justify-between text-xs pt-1 border-t border-amber-900/30">
                  <span className="text-zinc-500 flex items-center gap-1">
                    <DollarSign className="h-3 w-3" />
                    Rentabilidade
                  </span>
                  <span className="text-emerald-400 font-medium">
                    {project.hours.effectiveHourlyRate > 0
                      ? `${formatCurrency(project.hours.effectiveHourlyRate)}/h`
                      : "—"
                    }
                  </span>
                </div>
              </div>
            )}

            {/* Financial Summary */}
            {project.financials && (
              <div className="bg-zinc-900/50 border border-zinc-800/50 p-3 space-y-2">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-zinc-500 block">
                      {project.billingType === "HOURLY_RATE" ? "Valor Calculado" : "Valor"}
                    </span>
                    <span className="text-blue-400 font-medium">
                      {formatCurrency(project.hours?.calculatedValue || project.projectValue)}
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block">Recebido</span>
                    <span className="text-emerald-400 font-medium">
                      {formatCurrency(project.financials.totalReceived)}
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block">Custos</span>
                    <span className="text-red-400 font-medium">
                      {formatCurrency(project.financials.totalCost)}
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block">Lucro</span>
                    <span className={`font-medium ${project.financials.profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {formatCurrency(project.financials.profit)}
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="pt-2 border-t border-zinc-800/50">
                  <div className="flex justify-between text-[10px] text-zinc-500 mb-1">
                    <span>Progresso de Pagamento</span>
                    <span>{project.financials.paymentProgress.toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-zinc-800 h-1">
                    <div
                      className="bg-emerald-500 h-1 transition-all"
                      style={{ width: `${Math.min(project.financials.paymentProgress, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Team Members */}
            {project.projectMembers && project.projectMembers.length > 0 && (
              <div>
                <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 mb-2">
                  <Users className="h-3 w-3" />
                  <span className="tracking-wide uppercase">Membros</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {project.projectMembers.slice(0, 3).map((pm) => (
                    <span
                      key={pm.member.id}
                      className="inline-flex items-center px-2 py-0.5 text-[10px] bg-zinc-900/50 border border-zinc-800/50 text-zinc-400"
                    >
                      {pm.member.name}
                    </span>
                  ))}
                  {project.projectMembers.length > 3 && (
                    <span className="inline-flex items-center px-2 py-0.5 text-[10px] bg-zinc-900/50 border border-zinc-800/50 text-zinc-500">
                      +{project.projectMembers.length - 3}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Teams */}
            {project.projectTeams && project.projectTeams.length > 0 && (
              <div>
                <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 mb-2">
                  <Briefcase className="h-3 w-3" />
                  <span className="tracking-wide uppercase">Times</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {project.projectTeams.map((pt) => (
                    <span
                      key={pt.team.id}
                      className="inline-flex items-center px-2 py-0.5 text-[10px] border border-zinc-700 text-zinc-400"
                    >
                      {pt.team.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer - Dates */}
          <div className="px-4 py-3 border-t border-zinc-800/50 flex flex-wrap gap-3 text-[10px] text-zinc-600">
            {project.startDate && (
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>Início: {format(new Date(project.startDate), "dd/MM/yy", { locale: ptBR })}</span>
              </div>
            )}
            {project.deadline && (
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>Prazo: {format(new Date(project.deadline), "dd/MM/yy", { locale: ptBR })}</span>
              </div>
            )}
            {project.endDate && (
              <div className="flex items-center gap-1 text-emerald-600">
                <Calendar className="h-3 w-3" />
                <span>Conclusão: {format(new Date(project.endDate), "dd/MM/yy", { locale: ptBR })}</span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

export const ProjectsList = memo(ProjectsListComponent)
