"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Calendar, Clock, AlertCircle } from "lucide-react"
import { format, isPast, isToday } from "date-fns"
import { ptBR } from "date-fns/locale"

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

interface TaskCardProps {
  task: Task
  onClick: () => void
}

const priorityColors: Record<string, string> = {
  LOW: "bg-gray-100 text-gray-800",
  MEDIUM: "bg-blue-100 text-blue-800",
  HIGH: "bg-orange-100 text-orange-800",
  URGENT: "bg-red-100 text-red-800",
}

const priorityLabels: Record<string, string> = {
  LOW: "Baixa",
  MEDIUM: "Média",
  HIGH: "Alta",
  URGENT: "Urgente",
}

export function TaskCard({ task, onClick }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const tags = task.tags ? JSON.parse(task.tags) : []
  
  const isOverdue = task.dueDate && isPast(new Date(task.dueDate)) && task.status !== 'DONE'
  const isDueToday = task.dueDate && isToday(new Date(task.dueDate))

  const handleClick = (e: React.MouseEvent) => {
    // Only trigger onClick if not dragging
    e.stopPropagation()
    if (!isDragging) {
      onClick()
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-move"
      onClick={handleClick}
    >
      {/* Priority Badge */}
      <div className="flex items-start justify-between mb-2">
        <Badge className={`${priorityColors[task.priority]} text-xs`}>
          {priorityLabels[task.priority]}
        </Badge>
        {isOverdue && (
          <AlertCircle className="h-4 w-4 text-red-500" />
        )}
      </div>

      {/* Title */}
      <h4 className="font-semibold text-sm mb-2 line-clamp-2">{task.title}</h4>

      {/* Description */}
      {task.description && (
        <p className="text-xs text-gray-600 mb-3 line-clamp-2">
          {task.description}
        </p>
      )}

      {/* Tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {tags.slice(0, 3).map((tag: string, index: number) => (
            <span
              key={index}
              className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
            >
              {tag}
            </span>
          ))}
          {tags.length > 3 && (
            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
              +{tags.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Due Date and Estimated Hours */}
      <div className="flex items-center gap-3 mb-3 text-xs text-gray-600">
        {task.dueDate && (
          <div className={`flex items-center gap-1 ${
            isOverdue ? 'text-red-600 font-semibold' : 
            isDueToday ? 'text-orange-600 font-semibold' : ''
          }`}>
            <Calendar className="h-3 w-3" />
            <span>{format(new Date(task.dueDate), "dd/MM", { locale: ptBR })}</span>
          </div>
        )}
        {task.estimatedHours && (
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{task.estimatedHours}h</span>
          </div>
        )}
      </div>

      {/* Assigned Members and Teams */}
      <div className="space-y-2">
        {task.taskMembers && task.taskMembers.length > 0 && (
          <div className="flex items-center gap-1">
            <div className="flex -space-x-2">
              {task.taskMembers.slice(0, 3).map((tm) => (
                <Avatar key={tm.member.id} className="h-6 w-6 border-2 border-white">
                  <AvatarFallback className="text-xs">
                    {tm.member.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
              ))}
            </div>
            {task.taskMembers.length > 3 && (
              <span className="text-xs text-gray-600">
                +{task.taskMembers.length - 3}
              </span>
            )}
          </div>
        )}

        {task.taskTeams && task.taskTeams.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {task.taskTeams.slice(0, 2).map((tt) => (
              <Badge key={tt.team.id} variant="outline" className="text-xs">
                {tt.team.name}
              </Badge>
            ))}
            {task.taskTeams.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{task.taskTeams.length - 2}
              </Badge>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

