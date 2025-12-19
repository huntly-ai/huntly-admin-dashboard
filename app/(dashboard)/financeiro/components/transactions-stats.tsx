"use client"

import { memo } from "react"
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react"

interface TransactionsStatsProps {
  totalIncome: number
  totalExpense: number
  balance: number
  periodLabel?: string
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value)
}

function TransactionsStatsComponent({
  totalIncome,
  totalExpense,
  balance,
  periodLabel,
}: TransactionsStatsProps) {
  const periodSuffix = periodLabel ? ` (${periodLabel})` : ""

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {/* Total Receitas */}
      <div className="group relative bg-card backdrop-blur-sm border border-border p-6 hover:border-border transition-all duration-300">
        {/* Corner accents */}
        <div className="absolute top-0 left-0 w-3 h-3 border-l border-t border-white/0 group-hover:border-emerald-500/50 transition-colors duration-300" />
        <div className="absolute top-0 right-0 w-3 h-3 border-r border-t border-white/0 group-hover:border-emerald-500/50 transition-colors duration-300" />
        <div className="absolute bottom-0 left-0 w-3 h-3 border-l border-b border-white/0 group-hover:border-emerald-500/50 transition-colors duration-300" />
        <div className="absolute bottom-0 right-0 w-3 h-3 border-r border-b border-white/0 group-hover:border-emerald-500/50 transition-colors duration-300" />

        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground">
            Receitas{periodSuffix}
          </span>
          <TrendingUp className="h-4 w-4 text-emerald-500" />
        </div>
        <p className="font-display text-2xl font-bold text-emerald-400 tracking-tight">
          {formatCurrency(totalIncome)}
        </p>
      </div>

      {/* Total Despesas */}
      <div className="group relative bg-card backdrop-blur-sm border border-border p-6 hover:border-border transition-all duration-300">
        {/* Corner accents */}
        <div className="absolute top-0 left-0 w-3 h-3 border-l border-t border-white/0 group-hover:border-red-500/50 transition-colors duration-300" />
        <div className="absolute top-0 right-0 w-3 h-3 border-r border-t border-white/0 group-hover:border-red-500/50 transition-colors duration-300" />
        <div className="absolute bottom-0 left-0 w-3 h-3 border-l border-b border-white/0 group-hover:border-red-500/50 transition-colors duration-300" />
        <div className="absolute bottom-0 right-0 w-3 h-3 border-r border-b border-white/0 group-hover:border-red-500/50 transition-colors duration-300" />

        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground">
            Despesas{periodSuffix}
          </span>
          <TrendingDown className="h-4 w-4 text-red-500" />
        </div>
        <p className="font-display text-2xl font-bold text-red-400 tracking-tight">
          {formatCurrency(totalExpense)}
        </p>
      </div>

      {/* Saldo */}
      <div className="group relative bg-card backdrop-blur-sm border border-border p-6 hover:border-border transition-all duration-300">
        {/* Corner accents */}
        <div className="absolute top-0 left-0 w-3 h-3 border-l border-t border-white/0 group-hover:border-blue-500/50 transition-colors duration-300" />
        <div className="absolute top-0 right-0 w-3 h-3 border-r border-t border-white/0 group-hover:border-blue-500/50 transition-colors duration-300" />
        <div className="absolute bottom-0 left-0 w-3 h-3 border-l border-b border-white/0 group-hover:border-blue-500/50 transition-colors duration-300" />
        <div className="absolute bottom-0 right-0 w-3 h-3 border-r border-b border-white/0 group-hover:border-blue-500/50 transition-colors duration-300" />

        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground">
            Saldo{periodSuffix}
          </span>
          <DollarSign className="h-4 w-4 text-blue-500" />
        </div>
        <p className={`font-display text-2xl font-bold tracking-tight ${
          balance >= 0 ? "text-blue-400" : "text-red-400"
        }`}>
          {formatCurrency(balance)}
        </p>
      </div>
    </div>
  )
}

export const TransactionsStats = memo(TransactionsStatsComponent)
