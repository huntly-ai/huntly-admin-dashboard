"use client"

import { memo } from "react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { HuntlyBadge } from "@/components/huntly-ui"
import { Calendar, Clock } from "lucide-react"
import { format } from "date-fns"

interface InternalTask {
  id: string
  title: string
  description?: string | null
  status: string
  priority: string
  dueDate?: string | null
  completedAt?: string | null
  estimatedHours?: number | null
  actualHours?: number | null
  order: number
  storyId?: string | null
}

interface InternalTaskCardProps {
  task: InternalTask
  onClick: () => void
  isDragging?: boolean
}

const priorityVariants: Record<string, "default" | "warning" | "danger" | "info"> = {
  LOW: "default",
  MEDIUM: "info",
  HIGH: "warning",
  URGENT: "danger",
}

const priorityLabels: Record<string, string> = {
  LOW: "Baixa",
  MEDIUM: "Média",
  HIGH: "Alta",
  URGENT: "Urgente",
}

export const InternalTaskCard = memo(function InternalTaskCard({
  task,
  onClick,
  isDragging,
}: InternalTaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const isCurrentlyDragging = isDragging || isSortableDragging

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={`group relative bg-card border border-border p-3 cursor-pointer transition-all hover:border-muted-foreground/40 ${
        isCurrentlyDragging ? "opacity-50 shadow-lg" : ""
      }`}
    >
      {/* Corner accents */}
      <div className="absolute top-0 left-0 w-2 h-2 border-l border-t border-transparent group-hover:border-foreground/20 transition-colors" />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-r border-b border-transparent group-hover:border-foreground/20 transition-colors" />

      <div className="space-y-2">
        <h4 className="text-sm font-medium text-foreground line-clamp-2">
          {task.title}
        </h4>

        {task.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {task.description}
          </p>
        )}

        <div className="flex items-center gap-2 flex-wrap">
          <HuntlyBadge variant={priorityVariants[task.priority] || "default"}>
            {priorityLabels[task.priority] || task.priority}
          </HuntlyBadge>

          {task.dueDate && (
            <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <Calendar className="h-3 w-3" />
              {format(new Date(task.dueDate), "dd/MM")}
            </span>
          )}

          {(task.estimatedHours || task.actualHours) && (
            <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <Clock className="h-3 w-3" />
              {task.actualHours || 0}/{task.estimatedHours || 0}h
            </span>
          )}
        </div>
      </div>
    </div>
  )
})
