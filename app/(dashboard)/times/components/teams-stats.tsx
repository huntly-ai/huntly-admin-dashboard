"use client"

import { memo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users as UsersIcon, UserPlus } from "lucide-react"

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
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total de Times
          </CardTitle>
          <UsersIcon className="h-4 w-4 text-gray-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalTeams}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total de Membros
          </CardTitle>
          <UserPlus className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">{totalMembers}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Média por Time
          </CardTitle>
          <UsersIcon className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {averagePerTeam.toFixed(1)}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export const TeamsStats = memo(TeamsStatsComponent)

