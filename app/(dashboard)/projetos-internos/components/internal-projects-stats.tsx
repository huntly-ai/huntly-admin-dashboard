"use client"

import { memo } from "react"
import { StatCard } from "@/components/huntly-ui"
import { Box, TrendingUp, TrendingDown, DollarSign } from "lucide-react"
import { formatCurrency } from "@/lib/utils/formatters"

interface InternalProjectsStatsProps {
  totalProjects: number
  activeProjects: number
  totalIncome: number
  totalExpense: number
  totalProfit: number
}

export const InternalProjectsStats = memo(function InternalProjectsStats({
  totalProjects,
  activeProjects,
  totalIncome,
  totalExpense,
  totalProfit,
}: InternalProjectsStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      <StatCard
        label="Total"
        value={totalProjects}
        description="projetos internos"
        icon={Box}
      />
      <StatCard
        label="Ativos"
        value={activeProjects}
        description="em andamento"
        icon={Box}
      />
      <StatCard
        label="Receita"
        value={formatCurrency(totalIncome)}
        description="total gerado"
        icon={TrendingUp}
      />
      <StatCard
        label="Despesas"
        value={formatCurrency(totalExpense)}
        description="total gasto"
        icon={TrendingDown}
      />
      <StatCard
        label="Lucro"
        value={formatCurrency(totalProfit)}
        description="resultado líquido"
        icon={DollarSign}
        trend={
          totalProfit !== 0
            ? {
                positive: totalProfit > 0,
                label: totalProfit > 0 ? "Positivo" : "Negativo",
              }
            : undefined
        }
      />
    </div>
  )
})
