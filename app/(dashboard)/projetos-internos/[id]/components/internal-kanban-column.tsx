"use client"

import { memo } from "react"
import { useDroppable } from "@dnd-kit/core"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

interface InternalKanbanColumnProps {
  id: string
  title: string
  count: number
  children: React.ReactNode
  onAddTask?: () => void
}

export const InternalKanbanColumn = memo(function InternalKanbanColumn({
  id,
  title,
  count,
  children,
  onAddTask,
}: InternalKanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id,
  })

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col bg-muted/30 border border-border p-3 min-h-[400px] transition-colors ${
        isOver ? "bg-muted/50 border-muted-foreground/30" : ""
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs tracking-[0.2em] uppercase text-muted-foreground font-medium">
            {title}
          </span>
          <span className="text-xs text-muted-foreground/70 bg-muted px-1.5 py-0.5">
            {count}
          </span>
        </div>
        {onAddTask && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={onAddTask}
          >
            <Plus className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
      <div className="flex-1 overflow-y-auto">{children}</div>
    </div>
  )
})
