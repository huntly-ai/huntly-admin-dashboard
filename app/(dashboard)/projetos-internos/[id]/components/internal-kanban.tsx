"use client"

import { memo, useCallback } from "react"
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core"
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { useState } from "react"
import { InternalTaskCard } from "./internal-task-card"
import { InternalKanbanColumn } from "./internal-kanban-column"

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

interface InternalKanbanProps {
  tasks: InternalTask[]
  onTaskMove: (taskId: string, newStatus: string, newOrder: number) => void
  onTaskClick: (task: InternalTask) => void
  onAddTask: () => void
}

const COLUMNS = [
  { id: "TODO", title: "A Fazer" },
  { id: "IN_PROGRESS", title: "Em Progresso" },
  { id: "IN_REVIEW", title: "Em Revisão" },
  { id: "DONE", title: "Concluído" },
]

export const InternalKanban = memo(function InternalKanban({
  tasks,
  onTaskMove,
  onTaskClick,
  onAddTask,
}: InternalKanbanProps) {
  const [activeTask, setActiveTask] = useState<InternalTask | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  const getTasksByStatus = useCallback(
    (status: string) => {
      return tasks
        .filter((t) => t.status === status)
        .sort((a, b) => a.order - b.order)
    },
    [tasks]
  )

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const task = tasks.find((t) => t.id === event.active.id)
      if (task) {
        setActiveTask(task)
      }
    },
    [tasks]
  )

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event
      setActiveTask(null)

      if (!over) return

      const taskId = active.id as string
      const task = tasks.find((t) => t.id === taskId)
      if (!task) return

      // Determine new status from the over target
      let newStatus = task.status
      const overIdStr = over.id as string

      // Check if dropped on a column
      const column = COLUMNS.find((c) => c.id === overIdStr)
      if (column) {
        newStatus = column.id
      } else {
        // Dropped on another task - get that task's status
        const overTask = tasks.find((t) => t.id === overIdStr)
        if (overTask) {
          newStatus = overTask.status
        }
      }

      // Calculate new order
      const tasksInColumn = getTasksByStatus(newStatus)
      const newOrder = tasksInColumn.length

      if (task.status !== newStatus || true) {
        onTaskMove(taskId, newStatus, newOrder)
      }
    },
    [tasks, getTasksByStatus, onTaskMove]
  )

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-4 gap-4 min-h-[500px]">
        {COLUMNS.map((column) => {
          const columnTasks = getTasksByStatus(column.id)
          return (
            <InternalKanbanColumn
              key={column.id}
              id={column.id}
              title={column.title}
              count={columnTasks.length}
              onAddTask={column.id === "TODO" ? onAddTask : undefined}
            >
              <SortableContext
                items={columnTasks.map((t) => t.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {columnTasks.map((task) => (
                    <InternalTaskCard
                      key={task.id}
                      task={task}
                      onClick={() => onTaskClick(task)}
                    />
                  ))}
                </div>
              </SortableContext>
            </InternalKanbanColumn>
          )
        })}
      </div>

      <DragOverlay>
        {activeTask && (
          <InternalTaskCard task={activeTask} onClick={() => {}} isDragging />
        )}
      </DragOverlay>
    </DndContext>
  )
})
