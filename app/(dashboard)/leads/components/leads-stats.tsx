"use client"

import { memo } from "react"
import { Users, UserCheck, TrendingUp, Target } from "lucide-react"
import { StatCard } from "@/components/huntly-ui"

interface LeadsStatsProps {
  totalLeads: number
  qualifiedLeads: number
  convertedLeads: number
}

function LeadsStatsComponent({
  totalLeads,
  qualifiedLeads,
  convertedLeads,
}: LeadsStatsProps) {
  const conversionRate = totalLeads > 0
    ? ((convertedLeads / totalLeads) * 100).toFixed(1)
    : "0.0"

  return (
    <div className="grid gap-4 md:grid-cols-4">
      <StatCard
        label="Total de Leads"
        value={totalLeads}
        icon={Users}
      />
      <StatCard
        label="Qualificados"
        value={qualifiedLeads}
        icon={UserCheck}
        className="[&_.font-display]:text-emerald-400"
      />
      <StatCard
        label="Convertidos"
        value={convertedLeads}
        icon={TrendingUp}
        className="[&_.font-display]:text-blue-400"
      />
      <StatCard
        label="Taxa de Conversão"
        value={`${conversionRate}%`}
        icon={Target}
        className="[&_.font-display]:text-violet-400"
      />
    </div>
  )
}

export const LeadsStats = memo(LeadsStatsComponent)
