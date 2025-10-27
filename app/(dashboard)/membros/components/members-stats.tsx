"use client"

import { memo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total de Membros
          </CardTitle>
          <UsersIcon className="h-4 w-4 text-gray-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalMembers}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Membros Ativos
          </CardTitle>
          <UserCheck className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{activeMembers}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Inativos / Férias
          </CardTitle>
          <UserX className="h-4 w-4 text-gray-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{inactiveMembers}</div>
        </CardContent>
      </Card>
    </div>
  )
}

export const MembersStats = memo(MembersStatsComponent)

