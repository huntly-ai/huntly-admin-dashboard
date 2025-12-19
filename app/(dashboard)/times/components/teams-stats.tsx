"use client"

import { memo } from "react"
import { StatCard } from "@/components/huntly-ui"
import { Users as UsersIcon, UserPlus, BarChart3 } from "lucide-react"

interface TeamsStatsProps {
  totalTeams: number
  totalMembers: number
  averagePerTeam: number
}

function TeamsStatsComponent({
  totalTeams,
  totalMembers,
  averagePerTeam,
}: TeamsStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <StatCard
        label="Total de Times"
        value={totalTeams}
        icon={UsersIcon}
      />
      <StatCard
        label="Total de Membros"
        value={totalMembers}
        icon={UserPlus}
        className="[&_.font-display]:text-blue-400"
      />
      <StatCard
        label="Média por Time"
        value={averagePerTeam.toFixed(1)}
        icon={BarChart3}
        className="[&_.font-display]:text-emerald-400"
      />
    </div>
  )
}

export const TeamsStats = memo(TeamsStatsComponent)
