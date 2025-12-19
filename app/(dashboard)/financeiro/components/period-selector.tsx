"use client"

import { memo } from "react"
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { format, subMonths, addMonths, startOfMonth, isSameMonth } from "date-fns"
import { ptBR } from "date-fns/locale"

export type PeriodMode = "month" | "all"

interface PeriodSelectorProps {
  selectedDate: Date
  mode: PeriodMode
  onDateChange: (date: Date) => void
  onModeChange: (mode: PeriodMode) => void
}

function PeriodSelectorComponent({
  selectedDate,
  mode,
  onDateChange,
  onModeChange,
}: PeriodSelectorProps) {
  const currentMonth = startOfMonth(new Date())
  const isCurrentMonth = isSameMonth(selectedDate, currentMonth)

  const handlePreviousMonth = () => {
    onDateChange(subMonths(selectedDate, 1))
    if (mode === "all") {
      onModeChange("month")
    }
  }

  const handleNextMonth = () => {
    if (!isCurrentMonth) {
      onDateChange(addMonths(selectedDate, 1))
    }
  }

  const handleGoToCurrentMonth = () => {
    onDateChange(currentMonth)
    onModeChange("month")
  }

  const formattedDate = format(selectedDate, "MMMM 'de' yyyy", { locale: ptBR })
  const capitalizedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1)

  return (
    <div className="flex items-center gap-3">
      {/* Period Mode Selector */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="h-9 gap-2 bg-card border-border hover:bg-muted text-foreground"
          >
            <Calendar className="h-4 w-4" />
            <span className="text-xs tracking-wide uppercase">
              {mode === "all" ? "Todos" : "Mensal"}
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-card border-border">
          <DropdownMenuItem
            onClick={handleGoToCurrentMonth}
            className={mode === "month" ? "bg-muted" : ""}
          >
            <span className="text-sm">Visualizar por mês</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onModeChange("all")}
            className={mode === "all" ? "bg-muted" : ""}
          >
            <span className="text-sm">Visualizar todos</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Month Navigation - only show when in month mode */}
      {mode === "month" && (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePreviousMonth}
            className="h-9 w-9 hover:bg-muted text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="min-w-[160px] text-center">
            <span className="text-sm font-medium text-foreground">
              {capitalizedDate}
            </span>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleNextMonth}
            disabled={isCurrentMonth}
            className="h-9 w-9 hover:bg-muted text-muted-foreground hover:text-foreground disabled:opacity-30"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}

export const PeriodSelector = memo(PeriodSelectorComponent)
