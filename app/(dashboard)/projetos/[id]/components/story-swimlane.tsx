"use client"

import { useState } from "react"
import { useDroppable } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { TaskCard } from "./task-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronRight, Plus } from "lucide-react"

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
  order: number
  taskMembers?: { member: Member }[]
  tags?: string
  createdAt: string
  updatedAt: string
}

interface Story {
  id: string
  title: string
  status: string
  priority: string
  points?: number
  tasks: Task[]
  order: number
  createdAt: string
  updatedAt: string
}

interface StorySwimlaneProps {
  story: Story
  columns: { id: string; title: string; headerClass?: string }[]
  onTaskClick: (task: Task) => void
  onStoryClick: (story: Story) => void
  onAddSubtask: (storyId: string) => void
}

export function StorySwimlane({ story, columns, onTaskClick, onStoryClick, onAddSubtask }: StorySwimlaneProps) {
  const [isOpen, setIsOpen] = useState(true)

  return (
    <div className="border rounded-lg bg-white shadow-sm mb-4 overflow-hidden">
      {/* Header */}
      <div className="flex items-center px-4 py-2 bg-gray-50 border-b">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="p-1 hover:bg-gray-200 rounded mr-2 transition-colors"
        >
          {isOpen ? <ChevronDown className="h-4 w-4 text-gray-500" /> : <ChevronRight className="h-4 w-4 text-gray-500" />}
        </button>

        <div className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer" onClick={() => onStoryClick(story)}>
           <div className="flex items-center gap-2">
             <span className="font-mono text-xs font-medium text-gray-500 bg-white border px-1.5 py-0.5 rounded">
                ST-{story.id.slice(-4).toUpperCase()}
             </span>
             <h3 className="text-sm font-medium text-gray-900 truncate hover:text-blue-600 hover:underline">
                {story.title}
             </h3>
           </div>
           
           <div className="flex items-center gap-2 ml-2">
             <Badge variant="outline" className="text-[10px] h-5 font-normal text-gray-500 border-gray-300">
               {story.status}
             </Badge>
             {story.points !== undefined && story.points > 0 && (
               <Badge variant="secondary" className="text-[10px] h-5 bg-gray-200 text-gray-700 hover:bg-gray-300">
                 {story.points}
               </Badge>
             )}
           </div>
        </div>

        <div className="flex items-center gap-2">
           <Button 
             size="sm" 
             variant="ghost" 
             className="h-7 text-xs font-normal text-gray-600 hover:bg-gray-200"
             onClick={() => onAddSubtask(story.id)}
           >
              <Plus className="h-3 w-3 mr-1" /> Create subtask
           </Button>
        </div>
      </div>

      {/* Body */}
      {isOpen && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 bg-gray-50/50 min-h-[120px] p-2">
           {columns.map(col => {
             const tasks = story.tasks?.filter(t => t.status === col.id).sort((a, b) => a.order - b.order) || []
             
             return (
               <SwimlaneColumn 
                 key={col.id} 
                 id={`${story.id}::${col.id}`} // Composite ID for Droppable
                 tasks={tasks}
                 onTaskClick={onTaskClick}
               />
             )
           })}
        </div>
      )}
    </div>
  )
}

function SwimlaneColumn({ id, tasks, onTaskClick }: { id: string, tasks: Task[], onTaskClick: (t: Task) => void }) {
  const { setNodeRef, isOver } = useDroppable({ id })

  return (
    <div 
      ref={setNodeRef}
      className={`p-2 rounded transition-colors ${isOver ? 'bg-blue-100/50' : 'bg-transparent'}`}
    >
      <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2 min-h-[50px]">
           {tasks.map(task => (
             <TaskCard key={task.id} task={task} onClick={() => onTaskClick(task)} />
           ))}
        </div>
      </SortableContext>
    </div>
  )
}
