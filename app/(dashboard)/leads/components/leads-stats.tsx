"use client"

import { memo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, UserCheck, TrendingUp } from "lucide-react"

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
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Leads</CardTitle>
          <Users className="h-4 w-4 text-gray-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalLeads}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Qualificados</CardTitle>
          <UserCheck className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{qualifiedLeads}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Convertidos</CardTitle>
          <TrendingUp className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">{convertedLeads}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
          <TrendingUp className="h-4 w-4 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-600">{conversionRate}%</div>
        </CardContent>
      </Card>
    </div>
  )
}

export const LeadsStats = memo(LeadsStatsComponent)

