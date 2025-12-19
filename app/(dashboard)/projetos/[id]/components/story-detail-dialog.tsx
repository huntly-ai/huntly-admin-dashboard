"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Edit, Trash2, ChevronDown, ChevronUp, CheckCircle2, Circle, Clock, AlertCircle } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { taskStatusColors, taskStatusLabels, priorityColors, priorityLabels, getAvatarColor, iconColors } from "@/lib/design-tokens"

interface Member {
  id: string
  name: string
  email: string
  role: string
  avatar?: string
}

interface Epic {
  id: string
  title: string
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
  taskMembers?: { member: Member }[]
  createdAt: string
  updatedAt: string
}

interface Story {
  id: string
  title: string
  description?: string
  status: string
  priority: string
  points?: number
  epic?: Epic | null
  storyMembers?: { member: Member }[]
  tasks: Task[]
  order: number
  createdAt: string
  updatedAt: string
}

interface StoryDetailDialogProps {
  isOpen: boolean
  onClose: () => void
  story: Story | null
  onEdit: (story: Story) => void
  onDelete: (storyId: string) => void
}

const TaskStatusIcon = ({ status }: { status: string }) => {
  switch (status) {
    case "DONE":
      return <CheckCircle2 className="h-4 w-4 text-emerald-400" />
    case "IN_PROGRESS":
      return <Clock className="h-4 w-4 text-blue-400" />
    case "IN_REVIEW":
      return <AlertCircle className="h-4 w-4 text-violet-400" />
    default:
      return <Circle className="h-4 w-4 text-zinc-500" />
  }
}

export function StoryDetailDialog({
  isOpen,
  onClose,
  story,
  onEdit,
  onDelete,
}: StoryDetailDialogProps) {
  const [isTasksOpen, setIsTasksOpen] = useState(true)

  if (!story) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-border">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
               <div className="flex items-center gap-2 mb-1">
                 <span className="font-mono text-xs font-medium text-muted-foreground bg-secondary px-2 py-0.5 rounded">
                   ST-{story.id.slice(-4).toUpperCase()}
                 </span>
               </div>
               <DialogTitle className="text-xl font-semibold leading-tight break-words text-foreground">
                 {story.title}
               </DialogTitle>
            </div>
            <div className="flex gap-2 shrink-0">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onEdit(story)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onDelete(story.id)}
                className={`${iconColors.danger} hover:bg-red-950/50`}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-2">
          {/* Status and Priority */}
          <div className="flex flex-wrap gap-2 items-center">
            <Badge className={`${taskStatusColors[story.status]} px-3 py-1`}>
              {taskStatusLabels[story.status]}
            </Badge>
            <Badge className={`${priorityColors[story.priority]?.bg} ${priorityColors[story.priority]?.text} ${priorityColors[story.priority]?.border} px-3 py-1`}>
              {priorityLabels[story.priority]}
            </Badge>
            {story.points !== undefined && story.points > 0 && (
               <Badge variant="secondary" className="px-3 py-1 bg-zinc-800 text-zinc-300 border-zinc-700">
                 {story.points} Story Points
               </Badge>
            )}
            {story.epic && (
                <Badge variant="secondary" className="px-3 py-1 bg-indigo-950 text-indigo-300 border-indigo-800">
                    Épico: {story.epic.title}
                </Badge>
            )}
          </div>

          {/* Description */}
          {story.description && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-foreground">Descrição / Critérios de Aceitação</h3>
              <div className="text-sm text-muted-foreground whitespace-pre-wrap bg-secondary p-4 rounded-lg border border-border leading-relaxed">
                {story.description}
              </div>
            </div>
          )}

          {/* Sub-tasks */}
          {story.tasks && story.tasks.length > 0 && (
             <Collapsible
               open={isTasksOpen}
               onOpenChange={setIsTasksOpen}
               className="border border-border rounded-lg overflow-hidden"
             >
               <div className="flex items-center justify-between p-4 bg-secondary/50 border-b border-border cursor-pointer" onClick={() => setIsTasksOpen(!isTasksOpen)}>
                 <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                   Tarefas
                   <Badge variant="secondary" className="h-5 px-1.5 text-xs bg-background border-border">
                     {story.tasks.length}
                   </Badge>
                 </h3>
                 <CollapsibleTrigger asChild>
                   <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                     {isTasksOpen ? (
                       <ChevronUp className="h-4 w-4 text-muted-foreground" />
                     ) : (
                       <ChevronDown className="h-4 w-4 text-muted-foreground" />
                     )}
                   </Button>
                 </CollapsibleTrigger>
               </div>

               <CollapsibleContent>
                 <div className="divide-y divide-border bg-card">
                    {story.tasks.map(task => (
                        <div key={task.id} className="flex items-center gap-3 p-3 hover:bg-secondary/50 transition-colors">
                            <div className="shrink-0 pt-0.5">
                               <TaskStatusIcon status={task.status} />
                            </div>
                            <div className="flex-1 min-w-0">
                               <p className="text-sm text-foreground font-medium truncate">{task.title}</p>
                            </div>
                            <Badge className={`text-[10px] font-medium min-w-[80px] justify-center ${taskStatusColors[task.status]}`}>
                                {taskStatusLabels[task.status] || task.status}
                            </Badge>
                        </div>
                    ))}
                 </div>
               </CollapsibleContent>
             </Collapsible>
          )}

          {/* Assigned Members */}
          {story.storyMembers && story.storyMembers.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">Membros Alocados</h3>
              <div className="flex flex-wrap gap-3">
                {story.storyMembers.map((tm) => (
                  <div key={tm.member.id} className="flex items-center gap-2 bg-secondary border border-border rounded-full pl-1 pr-3 py-1">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={tm.member.avatar} />
                      <AvatarFallback className={`text-[10px] ${getAvatarColor(tm.member.id)}`}>
                        {tm.member.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-xs font-medium text-foreground leading-none">{tm.member.name}</span>
                      <span className="text-[10px] text-muted-foreground leading-none mt-0.5 capitalize">{tm.member.role.replace('_', ' ').toLowerCase()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="border-t border-border pt-4 mt-6">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex gap-4">
                <span>Criada em {format(new Date(story.createdAt), "dd/MM/yyyy", { locale: ptBR })}</span>
                <span>•</span>
                <span>Atualizada em {format(new Date(story.updatedAt), "dd/MM/yyyy", { locale: ptBR })}</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
