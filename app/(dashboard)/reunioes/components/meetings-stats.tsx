"use client"

import { memo } from "react"
import { StatCard } from "@/components/huntly-ui"
import { Calendar, CheckCircle, Clock } from "lucide-react"

interface MeetingsStatsProps {
  totalMeetings: number
  upcomingMeetings: number
  completedMeetings: number
}

function MeetingsStatsComponent({
  totalMeetings,
  upcomingMeetings,
  completedMeetings,
}: MeetingsStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <StatCard
        label="Total de Reuniões"
        value={totalMeetings}
        icon={Calendar}
      />
      <StatCard
        label="Próximas Reuniões"
        value={upcomingMeetings}
        icon={Clock}
        className="[&_.font-display]:text-amber-400"
      />
      <StatCard
        label="Reuniões Concluídas"
        value={completedMeetings}
        icon={CheckCircle}
        className="[&_.font-display]:text-emerald-400"
      />
    </div>
  )
}

export const MeetingsStats = memo(MeetingsStatsComponent)
