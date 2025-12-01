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
import { StorySwimlane } from "./story-swimlane"
import { TaskCard } from "./task-card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Search, Filter } from "lucide-react"

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
  dueDate?: string
  estimatedHours?: number
  completedAt?: string
  actualHours?: number
  tags?: string
  taskTeams?: { team: { id: string; name: string } }[]
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

interface KanbanBoardProps {
  stories: Story[]
  onTaskMove: (taskId: string, newStatus: string, newOrder: number) => void
  onStoryClick: (story: Story) => void
  onTaskClick: (task: Task) => void
  onAddSubtask: (storyId: string) => void
}

const COLUMNS = [
  { id: "TODO", title: "A Fazer" },
  { id: "IN_PROGRESS", title: "Em Progresso" },
  { id: "IN_REVIEW", title: "Em Revisão" },
  { id: "DONE", title: "Concluído" },
]

export function KanbanBoard({ stories, onTaskMove, onStoryClick, onTaskClick, onAddSubtask }: KanbanBoardProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  
  const storiesArray = useMemo(() => Array.isArray(stories) ? stories : [], [stories])

  // Flatten all tasks to find active one during drag
  const allTasks = useMemo(() => storiesArray.flatMap(s => s.tasks || []), [storiesArray])

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event
    const task = allTasks.find(t => t.id === active.id)
    if (task) {
      setActiveTask(task)
    }
  }, [allTasks])

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event
    setActiveTask(null)

    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string 

    const activeTask = allTasks.find(t => t.id === activeId)
    if (!activeTask) return

    let newStatus = activeTask.status
    
    // If dropping on a swimlane column container (id format: storyId::status)
    if (overId.includes("::")) {
       const parts = overId.split("::")
       newStatus = parts[1]
    } else {
       // If dropping on another Task card
       const overTask = allTasks.find(t => t.id === overId)
       if (overTask) {
         newStatus = overTask.status
       }
    }

    // Trigger move if status changed (or simply dropped to reorder)
    // We always trigger to handle both status change and reordering if needed
    // For now, passing 0 as order placeholder as per simplified plan
    if (newStatus !== activeTask.status || overId !== activeId) {
      onTaskMove(activeId, newStatus, 0)
    }
    
  }, [allTasks, onTaskMove])

  return (
    <div className="h-full flex flex-col">
       {/* Jira-like Filter Bar */}
       <div className="flex items-center gap-4 mb-6">
          <div className="relative w-64">
             <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
             <Input 
               placeholder="Search board" 
               className="pl-8 h-9 bg-white" 
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
             />
          </div>
          <div className="flex -space-x-2">
             <Avatar className="h-8 w-8 border-2 border-white cursor-pointer hover:z-10">
               <AvatarFallback className="bg-blue-100 text-blue-700 text-xs">AB</AvatarFallback>
             </Avatar>
             <Avatar className="h-8 w-8 border-2 border-white cursor-pointer hover:z-10">
               <AvatarFallback className="bg-green-100 text-green-700 text-xs">JD</AvatarFallback>
             </Avatar>
             <div className="h-8 w-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center cursor-pointer hover:bg-gray-200">
                <span className="text-xs font-medium text-gray-600">+2</span>
             </div>
          </div>
          <div className="ml-auto flex gap-2">
             <button className="text-sm text-gray-600 font-medium hover:bg-gray-100 px-3 py-1.5 rounded flex items-center gap-2">
                <Filter className="h-4 w-4" /> Clear filters
             </button>
          </div>
       </div>

       {/* Header Columns (Sticky) */}
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0 mb-2 px-0 bg-gray-50/80 backdrop-blur rounded-t-lg border-b border-gray-200 sticky top-0 z-10">
          {COLUMNS.map(col => (
             <div key={col.id} className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50 first:rounded-tl-lg last:rounded-tr-lg">
                {col.title}
             </div>
          ))}
       </div>

       {/* Swimlanes Area */}
       <DndContext
         sensors={sensors}
         collisionDetection={closestCorners}
         onDragStart={handleDragStart}
         onDragEnd={handleDragEnd}
       >
         <div className="space-y-4 pb-10">
            {storiesArray
              .filter(s => s.title.toLowerCase().includes(searchQuery.toLowerCase()))
              .map(story => (
               <StorySwimlane
                 key={story.id}
                 story={story}
                 columns={COLUMNS}
                 onTaskClick={onTaskClick}
                 onStoryClick={onStoryClick}
                 onAddSubtask={onAddSubtask}
               />
            ))}
            
            {storiesArray.length === 0 && (
               <div className="text-center py-12 text-gray-500">
                  No stories found in this sprint.
               </div>
            )}
         </div>

         <DragOverlay>
           {activeTask ? (
             <div className="opacity-90 rotate-2 cursor-grabbing w-[280px]">
               <TaskCard task={activeTask} onClick={() => {}} />
             </div>
           ) : null}
         </DragOverlay>
       </DndContext>
    </div>
  )
}
