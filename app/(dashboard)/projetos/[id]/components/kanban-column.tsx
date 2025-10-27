"use client"

import { useDroppable } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
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

interface KanbanColumnProps {
  id: string
  title: string
  color: string
  tasks: Task[]
  onTaskClick: (task: Task) => void
}

export function KanbanColumn({ id, title, color, tasks, onTaskClick }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id })

  return (
    <div
      ref={setNodeRef}
      className={`rounded-lg p-4 min-h-[500px] transition-colors ${color} ${
        isOver ? "ring-2 ring-blue-500" : ""
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg">{title}</h3>
        <span className="text-sm text-gray-600 bg-white px-2 py-1 rounded">
          {tasks.length}
        </span>
      </div>

      <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-3">
          {tasks.map(task => (
            <TaskCard key={task.id} task={task} onClick={() => onTaskClick(task)} />
          ))}
        </div>
      </SortableContext>
    </div>
  )
}

