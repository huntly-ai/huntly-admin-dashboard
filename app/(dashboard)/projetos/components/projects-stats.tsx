"use client"

import { memo } from "react"
import { StatCard } from "@/components/huntly-ui"
import { FolderKanban, TrendingUp, CheckCircle2, Clock, Timer, DollarSign } from "lucide-react"

interface ProjectsStatsProps {
  totalProjects: number
  inProgressProjects: number
  completedProjects: number
  plannedProjects: number
  totalWorkedHours: number
  averageHourlyRate: number
}

function ProjectsStatsComponent({
  totalProjects,
  inProgressProjects,
  completedProjects,
  plannedProjects,
  totalWorkedHours,
  averageHourlyRate,
}: ProjectsStatsProps) {
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)

  return (
    <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
      <StatCard
        label="Total de Projetos"
        value={totalProjects}
        icon={FolderKanban}
      />
      <StatCard
        label="Em Andamento"
        value={inProgressProjects}
        icon={TrendingUp}
        className="[&_.font-display]:text-emerald-400"
      />
      <StatCard
        label="Concluídos"
        value={completedProjects}
        icon={CheckCircle2}
        className="[&_.font-display]:text-blue-400"
      />
      <StatCard
        label="Planejamento"
        value={plannedProjects}
        icon={Clock}
        className="[&_.font-display]:text-violet-400"
      />
      <StatCard
        label="Horas Trabalhadas"
        value={`${totalWorkedHours.toFixed(1)}h`}
        icon={Timer}
        className="[&_.font-display]:text-amber-400"
      />
      <StatCard
        label="Rentab. Média/h"
        value={averageHourlyRate > 0 ? formatCurrency(averageHourlyRate) : "—"}
        icon={DollarSign}
        className="[&_.font-display]:text-emerald-400"
      />
    </div>
  )
}

export const ProjectsStats = memo(ProjectsStatsComponent)
