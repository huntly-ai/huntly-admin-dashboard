"use client"

import { useEffect, useState } from "react"
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
import { UpcomingMeetings } from "./components/upcoming-meetings"
import {
  chartColors,
  projectStatusColors,
  projectStatusLabels,
  leadStatusLabels,
} from "@/lib/design-tokens"

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
    projectValue: number
    client: { name: string }
  }>
}

// Huntly-style section header component
function SectionHeader({ label, title, titleBold }: { label: string; title: string; titleBold?: string }) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-4 mb-3">
        <div className="w-8 h-px bg-white/20" />
        <span className="text-[10px] tracking-[0.3em] text-muted-foreground uppercase">
          {label}
        </span>
      </div>
      <h2 className="font-display text-2xl font-light text-foreground">
        <span className="font-medium animate-blink">_</span> {title} {titleBold && <span className="font-medium">{titleBold}</span>}
      </h2>
    </div>
  )
}

// Huntly-style stat card
function StatCard({
  label,
  value,
  description,
  icon: Icon,
  trend
}: {
  label: string
  value: string | number
  description?: string
  icon: React.ElementType
  trend?: { positive: boolean; label: string }
}) {
  return (
    <div className="group relative bg-card backdrop-blur-sm border border-border hover:border-border transition-all duration-300 p-5">
      {/* Corner accents */}
      <div className="absolute top-0 left-0 w-3 h-3 border-l border-t border-white/0 group-hover:border-white/30 transition-colors duration-300" />
      <div className="absolute bottom-0 right-0 w-3 h-3 border-r border-b border-white/0 group-hover:border-white/30 transition-colors duration-300" />

      <div className="flex items-start justify-between mb-3">
        <span className="text-xs tracking-[0.2em] uppercase text-muted-foreground">
          {label}
        </span>
        <Icon className="h-4 w-4 text-muted-foreground/70 group-hover:text-muted-foreground dark:text-zinc-400 transition-colors" />
      </div>

      <div className="font-display text-2xl font-medium text-foreground mb-1">
        {value}
      </div>

      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}

      {trend && (
        <div className="flex items-center text-xs mt-2">
          {trend.positive ? (
            <>
              <TrendingUp className="h-3 w-3 text-emerald-400 mr-1" />
              <span className="text-emerald-400">{trend.label}</span>
            </>
          ) : (
            <>
              <TrendingDown className="h-3 w-3 text-red-400 mr-1" />
              <span className="text-red-400">{trend.label}</span>
            </>
          )}
        </div>
      )}

      {/* Hover line */}
      <div className="absolute bottom-0 left-0 w-0 h-px bg-white/30 group-hover:w-full transition-all duration-500" />
    </div>
  )
}

// Huntly-style card wrapper
function HuntlyCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`group relative bg-card backdrop-blur-sm border border-border hover:border-border transition-all duration-300 ${className}`}>
      {/* Corner accents */}
      <div className="absolute top-0 left-0 w-3 h-3 border-l border-t border-white/0 group-hover:border-white/30 transition-colors duration-300" />
      <div className="absolute top-0 right-0 w-3 h-3 border-r border-t border-white/0 group-hover:border-white/30 transition-colors duration-300" />
      <div className="absolute bottom-0 left-0 w-3 h-3 border-l border-b border-white/0 group-hover:border-white/30 transition-colors duration-300" />
      <div className="absolute bottom-0 right-0 w-3 h-3 border-r border-b border-white/0 group-hover:border-white/30 transition-colors duration-300" />
      {children}
      {/* Hover line */}
      <div className="absolute bottom-0 left-0 w-0 h-px bg-white/30 group-hover:w-full transition-all duration-500" />
    </div>
  )
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
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center">
          <div className="relative w-12 h-12 mx-auto mb-4">
            <div className="absolute inset-0 border border-border animate-pulse" />
            <div className="absolute top-0 left-0 w-3 h-3 border-l border-t border-white/30" />
            <div className="absolute bottom-0 right-0 w-3 h-3 border-r border-b border-white/30" />
          </div>
          <p className="text-muted-foreground text-sm tracking-wide">Carregando dashboard...</p>
        </div>
      </div>
    )
  }

  const leadsPieData = metrics?.leadsByStatus?.map((item) => ({
    name: leadStatusLabels[item.status] || item.status,
    value: item._count,
  })) || []

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <SectionHeader
        label="Visão Geral"
        title="Dashboard"
        titleBold="Huntly"
      />

      {/* Upcoming Meetings */}
      <UpcomingMeetings />

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total de Leads"
          value={metrics?.counts?.leads || 0}
          description="Leads cadastrados"
          icon={UserPlus}
        />
        <StatCard
          label="Clientes Ativos"
          value={metrics?.counts?.clients || 0}
          description="Clientes atualmente ativos"
          icon={Users}
        />
        <StatCard
          label="Projetos"
          value={metrics?.counts?.projects || 0}
          description={`${metrics?.counts?.activeProjects || 0} em andamento`}
          icon={FolderKanban}
        />
        <StatCard
          label="Receita Líquida"
          value={formatCurrency(metrics?.financial?.profit || 0)}
          icon={DollarSign}
          trend={{
            positive: (metrics?.financial?.profit || 0) >= 0,
            label: (metrics?.financial?.profit || 0) >= 0 ? "Positivo" : "Negativo"
          }}
        />
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Revenue Chart */}
        <HuntlyCard>
          <div className="p-5 border-b border-border/50">
            <h3 className="font-display text-base font-medium text-foreground">
              Receitas e Despesas
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Últimos 6 meses
            </p>
          </div>
          <div className="p-5">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={metrics?.monthlyRevenue || []}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                <XAxis dataKey="month" stroke={chartColors.axis} fontSize={11} />
                <YAxis stroke={chartColors.axis} fontSize={11} />
                <Tooltip
                  formatter={(value) => formatCurrency(value as number)}
                  contentStyle={{
                    backgroundColor: "#09090b",
                    borderColor: "#27272a",
                    color: "#fafafa",
                    fontSize: 12,
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="income" fill={chartColors.income} name="Receitas" radius={[2, 2, 0, 0]} />
                <Bar dataKey="expense" fill={chartColors.expense} name="Despesas" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </HuntlyCard>

        {/* Leads Distribution */}
        <HuntlyCard>
          <div className="p-5 border-b border-border/50">
            <h3 className="font-display text-base font-medium text-foreground">
              Distribuição de Leads
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Status atual no pipeline
            </p>
          </div>
          <div className="p-5">
            <ResponsiveContainer width="100%" height={280}>
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
                  stroke="#09090b"
                  strokeWidth={2}
                >
                  {leadsPieData.map((_entry, index: number) => (
                    <Cell key={`cell-${index}`} fill={chartColors.palette[index % chartColors.palette.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#09090b",
                    borderColor: "#27272a",
                    color: "#fafafa",
                    fontSize: 12,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </HuntlyCard>
      </div>

      {/* Recent Projects */}
      <HuntlyCard>
        <div className="p-5 border-b border-border/50">
          <h3 className="font-display text-base font-medium text-foreground">
            Projetos Recentes
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Últimos 5 projetos cadastrados
          </p>
        </div>
        <div className="p-5">
          <div className="space-y-4">
            {metrics?.recentProjects?.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Nenhum projeto cadastrado ainda
              </p>
            ) : (
              metrics?.recentProjects?.map((project, index) => (
                <div
                  key={project.id}
                  className="flex items-center justify-between py-3 border-b border-border/50 last:border-0 group/item"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-[10px] tracking-wider text-muted-foreground/70 font-mono">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-foreground/80 group-hover/item:text-foreground transition-colors">
                        {project.name}
                      </p>
                      <p className="text-xs text-muted-foreground">{project.client.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-medium text-muted-foreground/70 dark:text-zinc-300">
                        {formatCurrency(project.projectValue)}
                      </p>
                    </div>
                    <Badge className={`${projectStatusColors[project.status]} text-[10px] tracking-wide`}>
                      {projectStatusLabels[project.status] || project.status.replace("_", " ")}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </HuntlyCard>

      {/* Financial Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <HuntlyCard className="p-5">
          <span className="text-xs tracking-[0.2em] uppercase text-muted-foreground block mb-3">
            Receita Total
          </span>
          <div className="font-display text-2xl font-medium text-emerald-400">
            {formatCurrency(metrics?.financial?.totalIncome || 0)}
          </div>
          <p className="text-xs text-muted-foreground/70 mt-1">Este ano</p>
        </HuntlyCard>

        <HuntlyCard className="p-5">
          <span className="text-xs tracking-[0.2em] uppercase text-muted-foreground block mb-3">
            Despesas Totais
          </span>
          <div className="font-display text-2xl font-medium text-red-400">
            {formatCurrency(metrics?.financial?.totalExpense || 0)}
          </div>
          <p className="text-xs text-muted-foreground/70 mt-1">Este ano</p>
        </HuntlyCard>

        <HuntlyCard className="p-5">
          <span className="text-xs tracking-[0.2em] uppercase text-muted-foreground block mb-3">
            Margem de Lucro
          </span>
          <div className="font-display text-2xl font-medium text-foreground">
            {metrics?.financial?.totalIncome
              ? ((metrics.financial.profit / metrics.financial.totalIncome) * 100).toFixed(1)
              : "0"}%
          </div>
          <p className="text-xs text-muted-foreground/70 mt-1">Este ano</p>
        </HuntlyCard>
      </div>
    </div>
  )
}
