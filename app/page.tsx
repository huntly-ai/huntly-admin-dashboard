"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Users, 
  UserPlus, 
  FolderKanban, 
  DollarSign, 
  TrendingUp,
  TrendingDown
} from "lucide-react"
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts"
import { Badge } from "@/components/ui/badge"

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

const statusLabels: Record<string, string> = {
  NEW: "Novo",
  CONTACTED: "Contactado",
  QUALIFIED: "Qualificado",
  PROPOSAL_SENT: "Proposta Enviada",
  NEGOTIATION: "Negociação",
  WON: "Ganho",
  LOST: "Perdido",
}

interface MetricsData {
  counts: {
    leads: number
    clients: number
    projects: number
    activeProjects: number
  }
  financial: {
    totalIncome: number
    totalExpense: number
    profit: number
  }
  leadsByStatus: Array<{ status: string; _count: number }>
  monthlyRevenue: Array<{ month: string; income: number; expense: number }>
  recentProjects: Array<{
    id: string
    name: string
    status: string
    budget: number
    client: { name: string }
  }>
}

const projectStatusColors: Record<string, string> = {
  PLANNING: "bg-blue-100 text-blue-800",
  IN_PROGRESS: "bg-green-100 text-green-800",
  ON_HOLD: "bg-yellow-100 text-yellow-800",
  COMPLETED: "bg-purple-100 text-purple-800",
  CANCELLED: "bg-red-100 text-red-800",
}

export default function Home() {
  const [metrics, setMetrics] = useState<MetricsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMetrics()
  }, [])

  const fetchMetrics = async () => {
    try {
      const response = await fetch("/api/dashboard/metrics")
      const data = await response.json()
      setMetrics(data)
    } catch (error) {
      console.error("Error fetching metrics:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  const leadsPieData = metrics?.leadsByStatus?.map((item) => ({
    name: statusLabels[item.status] || item.status,
    value: item._count,
  })) || []

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Visão geral da Huntly</p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Leads</CardTitle>
              <UserPlus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics?.counts?.leads || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Leads cadastrados no sistema
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Clientes Ativos</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics?.counts?.clients || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Clientes atualmente ativos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Projetos</CardTitle>
              <FolderKanban className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics?.counts?.projects || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {metrics?.counts?.activeProjects || 0} em andamento
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Receita Líquida</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(metrics?.financial?.profit || 0)}
              </div>
              <div className="flex items-center text-xs mt-1">
                {(metrics?.financial?.profit || 0) >= 0 ? (
                  <>
                    <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                    <span className="text-green-600">Positivo</span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="h-3 w-3 text-red-600 mr-1" />
                    <span className="text-red-600">Negativo</span>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Revenue Chart */}
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Receitas e Despesas (Últimos 6 meses)</CardTitle>
              <CardDescription>
                Comparativo mensal de entradas e saídas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={metrics?.monthlyRevenue || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: number) => 
                      new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(value)
                    }
                  />
                  <Legend />
                  <Bar dataKey="income" fill="#10b981" name="Receitas" />
                  <Bar dataKey="expense" fill="#ef4444" name="Despesas" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Leads Distribution */}
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Distribuição de Leads por Status</CardTitle>
              <CardDescription>
                Status atual dos leads no pipeline
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={leadsPieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent as number * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {leadsPieData.map((_entry, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Recent Projects */}
        <Card>
          <CardHeader>
            <CardTitle>Projetos Recentes</CardTitle>
            <CardDescription>Últimos 5 projetos cadastrados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {metrics?.recentProjects?.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">
                  Nenhum projeto cadastrado ainda
                </p>
              ) : (
                metrics?.recentProjects?.map((project) => (
                  <div
                    key={project.id}
                    className="flex items-center justify-between border-b pb-4 last:border-0"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{project.name}</p>
                      <p className="text-xs text-gray-500">{project.client.name}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-semibold">
                          {new Intl.NumberFormat("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          }).format(project.budget)}
                        </p>
                      </div>
                      <Badge className={projectStatusColors[project.status]}>
                        {project.status.replace("_", " ")}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Financial Summary */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(metrics?.financial?.totalIncome || 0)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Este ano</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Despesas Totais</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(metrics?.financial?.totalExpense || 0)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Este ano</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Margem de Lucro</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {metrics?.financial?.totalIncome
                  ? (
                      ((metrics.financial.profit / metrics.financial.totalIncome) * 100).toFixed(1)
                    )
                  : "0"}
                %
              </div>
              <p className="text-xs text-muted-foreground mt-1">Este ano</p>
            </CardContent>
          </Card>
        </div>
    </div>
    </DashboardLayout>
  )
}
