"use client"

import { useCallback, useState, useMemo } from "react"
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
import { KanbanColumn } from "./kanban-column"
import { TaskCard } from "./task-card"

interface Member {
  id: string
  name: string
  email: string
  role: string
  avatar?: string
}

interface Team {
  id: string
  name: string
}

interface TaskMember {
  member: Member
}

interface TaskTeam {
  team: Team
}

interface Task {
  id: string
  title: string
  description?: string
  status: string
  priority: string
  dueDate?: string
  completedAt?: string
  estimatedHours?: number
  actualHours?: number
  tags?: string
  order: number
  taskMembers?: TaskMember[]
  taskTeams?: TaskTeam[]
  createdAt: string
  updatedAt: string
}

interface KanbanBoardProps {
  tasks: Task[]
  onTaskMove: (taskId: string, newStatus: string, newOrder: number) => void
  onTaskClick: (task: Task) => void
}

const COLUMNS = [
  { id: "TODO", title: "A Fazer", color: "bg-gray-100" },
  { id: "IN_PROGRESS", title: "Em Progresso", color: "bg-blue-100" },
  { id: "IN_REVIEW", title: "Em Revisão", color: "bg-yellow-100" },
  { id: "DONE", title: "Concluído", color: "bg-green-100" },
]

export function KanbanBoard({ tasks, onTaskMove, onTaskClick }: KanbanBoardProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  
  // Ensure tasks is always an array
  const tasksArray = useMemo(() => Array.isArray(tasks) ? tasks : [], [tasks])

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event
    const task = tasksArray.find(t => t.id === active.id)
    if (task) {
      setActiveTask(task)
    }
  }, [tasksArray])

  const handleDragOver = useCallback(() => {
    // Visual feedback is handled by CSS and DragOverlay
    // No state updates needed here to avoid performance issues
  }, [])

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event
    setActiveTask(null)

    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    const activeTask = tasksArray.find(t => t.id === activeId)
    if (!activeTask) return

    // Determine the new status
    let newStatus = activeTask.status
    const overColumn = COLUMNS.find(col => col.id === overId)
    if (overColumn) {
      newStatus = overColumn.id
    } else {
      const overTask = tasksArray.find(t => t.id === overId)
      if (overTask) {
        newStatus = overTask.status
      }
    }

    // Get tasks in the new status column
    const tasksInColumn = tasksArray.filter(t => 
      t.status === newStatus && t.id !== activeId
    ).sort((a, b) => a.order - b.order)

    // Find the new order
    let newOrder = 0
    if (overId === newStatus) {
      // Dropped directly on the column, put at the end
      newOrder = tasksInColumn.length
    } else {
      // Dropped on another task
      const overTask = tasksArray.find(t => t.id === overId)
      if (overTask && overTask.status === newStatus) {
        newOrder = overTask.order
      } else {
        newOrder = tasksInColumn.length
      }
    }

    // Only update if something changed
    if (newStatus !== activeTask.status || newOrder !== activeTask.order) {
      onTaskMove(activeId, newStatus, newOrder)
    }
  }, [tasksArray, onTaskMove])

  const getTasksForColumn = useCallback((columnId: string) => {
    return tasksArray
      .filter(task => task.status === columnId)
      .sort((a, b) => a.order - b.order)
  }, [tasksArray])

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {COLUMNS.map(column => {
          const columnTasks = getTasksForColumn(column.id)
          return (
            <KanbanColumn
              key={column.id}
              id={column.id}
              title={column.title}
              color={column.color}
              tasks={columnTasks}
              onTaskClick={onTaskClick}
            />
          )
        })}
      </div>

      <DragOverlay>
        {activeTask ? (
          <div className="rotate-3 opacity-80">
            <TaskCard task={activeTask} onClick={() => {}} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}

