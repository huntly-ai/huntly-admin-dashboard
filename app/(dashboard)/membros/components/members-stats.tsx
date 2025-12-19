"use client"

import { memo } from "react"
import { StatCard } from "@/components/huntly-ui"
import { Users as UsersIcon, UserCheck, UserX } from "lucide-react"

interface MembersStatsProps {
  totalMembers: number
  activeMembers: number
  inactiveMembers: number
}

function MembersStatsComponent({
  totalMembers,
  activeMembers,
  inactiveMembers,
}: MembersStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <StatCard
        label="Total de Membros"
        value={totalMembers}
        icon={UsersIcon}
      />
      <StatCard
        label="Membros Ativos"
        value={activeMembers}
        icon={UserCheck}
        className="[&_.font-display]:text-emerald-400"
      />
      <StatCard
        label="Inativos / Férias"
        value={inactiveMembers}
        icon={UserX}
        className="[&_.font-display]:text-muted-foreground"
      />
    </div>
  )
}

export const MembersStats = memo(MembersStatsComponent)
