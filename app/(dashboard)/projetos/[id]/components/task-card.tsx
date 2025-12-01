"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowUp, ArrowDown, Minus } from "lucide-react"

interface Member {
  id: string
  name: string
  email: string
  role: string
  avatar?: string
}

interface Task {
  id: string
  title: string
  status: string
  priority: string
  taskMembers?: { member: Member }[]
}

interface TaskCardProps {
  task: Task
  onClick: () => void
}

const PriorityIcon = ({ priority }: { priority: string }) => {
  switch (priority) {
    case "URGENT":
      return <ArrowUp className="h-3.5 w-3.5 text-red-600" />
    case "HIGH":
      return <ArrowUp className="h-3.5 w-3.5 text-orange-500" />
    case "MEDIUM":
      return <Minus className="h-3.5 w-3.5 text-yellow-500" />
    case "LOW":
      return <ArrowDown className="h-3.5 w-3.5 text-blue-500" />
    default:
      return <Minus className="h-3.5 w-3.5 text-gray-400" />
  }
}

export function TaskCard({ task, onClick }: TaskCardProps) {
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: "Task",
      task,
    },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const handleClick = (e: React.MouseEvent) => {
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
      onClick={handleClick}
      className="bg-white p-2.5 rounded shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors cursor-grab active:cursor-grabbing group"
    >
      <div className="space-y-2">
        <div className="flex items-start gap-2">
            <div className="mt-0.5 shrink-0">
                 <PriorityIcon priority={task.priority} />
            </div>
            <span className="text-sm text-gray-900 font-medium leading-tight line-clamp-3 group-hover:text-blue-600 group-hover:underline">
                {task.title}
            </span>
        </div>

        <div className="flex items-center justify-between mt-1">
           <div className="flex items-center gap-2">
             <span className="text-[10px] font-mono text-gray-500 font-medium">
                {/* Mocking key based on ID for visual similarity */}
                TSK-{task.id.slice(-4).toUpperCase()}
             </span>
           </div>

           {task.taskMembers && task.taskMembers.length > 0 && (
             <div className="flex -space-x-1.5">
                {task.taskMembers.slice(0, 2).map(tm => (
                  <Avatar key={tm.member.id} className="h-5 w-5 border border-white ring-1 ring-gray-100">
                    <AvatarImage src={tm.member.avatar} />
                    <AvatarFallback className="text-[8px] bg-gray-100 text-gray-600">
                      {tm.member.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                ))}
             </div>
           )}
        </div>
      </div>
    </div>
  )
}
