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
import { kanbanColumnStyles, taskStatusLabels, getAvatarColor } from "@/lib/design-tokens"

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
  members: Member[]
  onTaskMove: (taskId: string, newStatus: string, newOrder: number) => void
  onStoryClick: (story: Story) => void
  onTaskClick: (task: Task) => void
  onAddSubtask: (storyId: string) => void
}

const COLUMNS = [
  { id: "TODO", title: taskStatusLabels.TODO, headerClass: kanbanColumnStyles.TODO.header },
  { id: "IN_PROGRESS", title: taskStatusLabels.IN_PROGRESS, headerClass: kanbanColumnStyles.IN_PROGRESS.header },
  { id: "IN_REVIEW", title: taskStatusLabels.IN_REVIEW, headerClass: kanbanColumnStyles.IN_REVIEW.header },
  { id: "DONE", title: taskStatusLabels.DONE, headerClass: kanbanColumnStyles.DONE.header },
]

export function KanbanBoard({ stories, members, onTaskMove, onStoryClick, onTaskClick, onAddSubtask }: KanbanBoardProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  
  const storiesArray = useMemo(() => Array.isArray(stories) ? stories : [], [stories])

  // Flatten all tasks to find active one during drag
  const allTasks = useMemo(() => storiesArray.flatMap(s => s.tasks || []), [storiesArray])

  // Get unique members involved in the project
  const projectMembers = useMemo(() => {
    const memberIds = new Set<string>()
    storiesArray.forEach(story => {
      story.tasks?.forEach(task => {
        task.taskMembers?.forEach(tm => {
          memberIds.add(tm.member.id)
        })
      })
    })
    
    return Array.from(memberIds)
      .map(id => members.find(m => m.id === id))
      .filter((m): m is Member => m !== undefined)
      .slice(0, 3) // Show first 3 members
  }, [storiesArray, members])

  // Count remaining members not shown
  const remainingMembersCount = useMemo(() => {
    const memberIds = new Set<string>()
    storiesArray.forEach(story => {
      story.tasks?.forEach(task => {
        task.taskMembers?.forEach(tm => {
          memberIds.add(tm.member.id)
        })
      })
    })
    return Math.max(0, memberIds.size - 3)
  }, [storiesArray])

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
             <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
             <Input
               placeholder="Buscar no board"
               className="pl-8 h-9 bg-background border-border"
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
             />
          </div>
          <div className="flex -space-x-2">
             {projectMembers.length === 0 ? (
               <div className="h-8 w-8 rounded-full bg-secondary border-2 border-background flex items-center justify-center">
                 <span className="text-xs font-medium text-muted-foreground">-</span>
               </div>
             ) : (
               <>
                 {projectMembers.map((member) => {
                   const bgColorClass = getAvatarColor(member.id)
                   const initials = member.name
                     .split(" ")
                     .map(n => n.charAt(0))
                     .join("")
                     .substring(0, 2)
                     .toUpperCase()

                   return (
                     <Avatar key={member.id} className="h-8 w-8 border-2 border-background cursor-pointer hover:z-10" title={member.name}>
                       <AvatarFallback className={`text-xs font-medium ${bgColorClass}`}>
                         {initials}
                       </AvatarFallback>
                     </Avatar>
                   )
                 })}
                 {remainingMembersCount > 0 && (
                   <div className="h-8 w-8 rounded-full bg-secondary border-2 border-background flex items-center justify-center cursor-pointer hover:bg-zinc-700" title={`${remainingMembersCount} mais membros`}>
                     <span className="text-xs font-medium text-muted-foreground">+{remainingMembersCount}</span>
                   </div>
                 )}
               </>
             )}
          </div>
          <div className="ml-auto flex gap-2">
             <button className="text-sm text-muted-foreground font-medium hover:bg-secondary px-3 py-1.5 rounded flex items-center gap-2">
                <Filter className="h-4 w-4" /> Limpar filtros
             </button>
          </div>
       </div>

       {/* Header Columns (Sticky) */}
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 mb-2 px-2 sticky top-0 z-10 pb-2">
          {COLUMNS.map(col => (
             <div key={col.id} className={`px-4 py-3 text-xs font-bold uppercase tracking-wider rounded-md shadow-sm ${col.headerClass}`}>
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
               <div className="text-center py-12 text-muted-foreground">
                  Nenhuma story encontrada neste projeto.
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
