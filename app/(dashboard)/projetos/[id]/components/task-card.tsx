"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowUp, ArrowDown, Minus, CheckSquare } from "lucide-react"
import { Badge } from "@/components/ui/badge"

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
  tags?: string
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

  // Parse tags safely
  let tags: string[] = []
  try {
    if (task.tags) {
      tags = JSON.parse(task.tags)
    }
  } catch (e) {
    console.error("Failed to parse tags", e)
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={handleClick}
      className="bg-white p-3 rounded-md shadow-sm border border-gray-200 hover:bg-gray-50 hover:shadow-md hover:border-gray-300 transition-all cursor-grab active:cursor-grabbing group"
    >
      <div className="space-y-2.5">
        {/* Header: Title */}
        <div className="flex items-start gap-2">
            <span className="text-sm text-gray-900 font-medium leading-tight line-clamp-3 group-hover:text-blue-600">
                {task.title}
            </span>
        </div>

        {/* Body: Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag, index) => (
              <span 
                key={index}
                className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-600 uppercase tracking-wide"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Footer: Metadata */}
        <div className="flex items-center justify-between pt-1">
           <div className="flex items-center gap-3">
             {/* Task Type Icon + Key */}
             <div className="flex items-center gap-1.5 text-gray-500">
                <div className="bg-blue-50 p-0.5 rounded">
                    <CheckSquare className="h-3.5 w-3.5 text-blue-600" />
                </div>
                <span className="text-[10px] font-mono font-medium group-hover:underline">
                  TSK-{task.id.slice(-4).toUpperCase()}
                </span>
             </div>

             {/* Priority */}
             <div className="flex items-center" title={`Priority: ${task.priority}`}>
                <PriorityIcon priority={task.priority} />
             </div>
           </div>

           {/* Assignees */}
           {task.taskMembers && task.taskMembers.length > 0 ? (
             <div className="flex -space-x-2">
                {task.taskMembers.slice(0, 3).map(tm => (
                  <Avatar key={tm.member.id} className="h-6 w-6 border-2 border-white ring-1 ring-gray-100">
                    <AvatarImage src={tm.member.avatar} />
                    <AvatarFallback className="text-[9px] bg-blue-100 text-blue-700 font-bold">
                      {tm.member.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                ))}
                {task.taskMembers.length > 3 && (
                    <div className="h-6 w-6 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center ring-1 ring-gray-100">
                        <span className="text-[9px] font-medium text-gray-600">+{task.taskMembers.length - 3}</span>
                    </div>
                )}
             </div>
           ) : (
               <div className="h-6 w-6 rounded-full border border-dashed border-gray-300 flex items-center justify-center">
                   <span className="text-gray-300 text-[10px]">?</span>
               </div>
           )}
        </div>
      </div>
    </div>
  )
}
