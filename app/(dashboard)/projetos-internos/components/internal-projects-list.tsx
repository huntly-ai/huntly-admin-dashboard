"use client"

import { memo } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { HuntlyBadge, HuntlyEmpty } from "@/components/huntly-ui"
import { formatCurrency } from "@/lib/utils/formatters"
import { Pencil, Trash2, Archive, Box, Kanban, TrendingUp, TrendingDown } from "lucide-react"

interface InternalProject {
  id: string
  name: string
  description?: string | null
  status: string
  icon?: string | null
  color?: string | null
  createdAt: string
  _count?: {
    transactions: number
    tasks: number
  }
  financials?: {
    totalIncome: number
    totalExpense: number
    profit: number
  }
}

interface InternalProjectsListProps {
  projects: InternalProject[]
  onEdit: (project: InternalProject) => void
  onDelete: (id: string) => void
  onArchive: (id: string) => void
}

export const InternalProjectsList = memo(function InternalProjectsList({
  projects,
  onEdit,
  onDelete,
  onArchive,
}: InternalProjectsListProps) {
  const router = useRouter()

  if (projects.length === 0) {
    return (
      <HuntlyEmpty
        icon={Box}
        title="Nenhum projeto interno"
        description="Crie seu primeiro projeto interno para começar a acompanhar receitas e despesas"
      />
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 p-5">
      {projects.map((project, index) => (
        <div
          key={project.id}
          className="group/item relative bg-card backdrop-blur-sm border border-border hover:border-border transition-all duration-300"
        >
          {/* Corner accents */}
          <div className="absolute top-0 left-0 w-3 h-3 border-l border-t border-white/0 group-hover/item:border-white/30 transition-colors duration-300" />
          <div className="absolute top-0 right-0 w-3 h-3 border-r border-t border-white/0 group-hover/item:border-white/30 transition-colors duration-300" />
          <div className="absolute bottom-0 left-0 w-3 h-3 border-l border-b border-white/0 group-hover/item:border-white/30 transition-colors duration-300" />
          <div className="absolute bottom-0 right-0 w-3 h-3 border-r border-b border-white/0 group-hover/item:border-white/30 transition-colors duration-300" />

          {/* Hover line */}
          <div className="absolute bottom-0 left-0 w-0 h-px bg-white/30 group-hover/item:w-full transition-all duration-500" />

          {/* Header */}
          <div className="p-4 border-b border-border/50">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] tracking-wider text-muted-foreground/70 font-mono">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3 className="font-display text-base font-medium text-foreground/80 group-hover/item:text-foreground transition-colors truncate">
                    {project.name}
                  </h3>
                </div>
                {project.description && (
                  <p className="text-xs text-muted-foreground truncate">
                    {project.description}
                  </p>
                )}
              </div>
              <div className="flex gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity z-10 relative">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => router.push(`/projetos-internos/${project.id}`)}
                  className="h-7 w-7 p-0 text-muted-foreground hover:text-blue-400 hover:bg-blue-950/30"
                  title="Ver Kanban & Financeiro"
                >
                  <Kanban className="h-3.5 w-3.5" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation()
                    onEdit(project)
                  }}
                  className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground hover:bg-muted"
                  title="Editar"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation()
                    onArchive(project.id)
                  }}
                  className="h-7 w-7 p-0 text-muted-foreground hover:text-amber-400 hover:bg-amber-950/30"
                  title={project.status === "ACTIVE" ? "Arquivar" : "Reativar"}
                >
                  <Archive className="h-3.5 w-3.5" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete(project.id)
                  }}
                  className="h-7 w-7 p-0 text-muted-foreground hover:text-red-400 hover:bg-red-950/30"
                  title="Excluir"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            {/* Status Badge */}
            <div className="flex flex-wrap gap-1.5 mt-3">
              <HuntlyBadge variant={project.status === "ACTIVE" ? "success" : "default"}>
                {project.status === "ACTIVE" ? "Ativo" : "Arquivado"}
              </HuntlyBadge>
              {(project._count?.tasks || 0) > 0 && (
                <span className="inline-flex items-center px-2 py-0.5 text-[10px] tracking-wide uppercase border border-blue-900/50 bg-blue-950/30 text-blue-400">
                  {project._count?.tasks} tarefas
                </span>
              )}
            </div>
          </div>

          {/* Financial Summary */}
          <div className="p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <TrendingUp className="h-3 w-3 text-emerald-500" />
                  <span className="text-[10px] tracking-wide uppercase text-muted-foreground">
                    Receita
                  </span>
                </div>
                <p className="text-sm font-medium text-emerald-400">
                  {formatCurrency(project.financials?.totalIncome || 0)}
                </p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <TrendingDown className="h-3 w-3 text-red-500" />
                  <span className="text-[10px] tracking-wide uppercase text-muted-foreground">
                    Despesas
                  </span>
                </div>
                <p className="text-sm font-medium text-red-400">
                  {formatCurrency(project.financials?.totalExpense || 0)}
                </p>
              </div>
            </div>

            {/* Profit/Loss */}
            <div className="pt-3 border-t border-border/50">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Resultado</span>
                <span
                  className={`text-sm font-medium ${
                    (project.financials?.profit || 0) >= 0
                      ? "text-emerald-400"
                      : "text-red-400"
                  }`}
                >
                  {formatCurrency(project.financials?.profit || 0)}
                </span>
              </div>
            </div>
          </div>

          {/* Click to open action */}
          <button
            onClick={() => router.push(`/projetos-internos/${project.id}`)}
            className="absolute inset-0 w-full h-full z-0"
            aria-label={`Abrir projeto ${project.name}`}
          />
        </div>
      ))}
    </div>
  )
})
