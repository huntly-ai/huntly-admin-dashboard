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

const statusLabels: Record<string, string> = {
  TODO: "A Fazer",
  IN_PROGRESS: "Em Progresso",
  IN_REVIEW: "Em Revisão",
  DONE: "Concluído",
}

const statusColors: Record<string, string> = {
  TODO: "bg-gray-100 text-gray-800 border-gray-200",
  IN_PROGRESS: "bg-blue-50 text-blue-700 border-blue-200",
  IN_REVIEW: "bg-yellow-50 text-yellow-700 border-yellow-200",
  DONE: "bg-green-50 text-green-700 border-green-200",
}

const priorityColors: Record<string, string> = {
  LOW: "bg-slate-100 text-slate-700 border-slate-200",
  MEDIUM: "bg-blue-50 text-blue-700 border-blue-200",
  HIGH: "bg-orange-50 text-orange-700 border-orange-200",
  URGENT: "bg-red-50 text-red-700 border-red-200",
}

const priorityLabels: Record<string, string> = {
  LOW: "Baixa",
  MEDIUM: "Média",
  HIGH: "Alta",
  URGENT: "Urgente",
}

const TaskStatusIcon = ({ status }: { status: string }) => {
  switch (status) {
    case "DONE":
      return <CheckCircle2 className="h-4 w-4 text-green-600" />
    case "IN_PROGRESS":
      return <Clock className="h-4 w-4 text-blue-600" />
    case "IN_REVIEW":
      return <AlertCircle className="h-4 w-4 text-yellow-600" />
    default:
      return <Circle className="h-4 w-4 text-gray-400" />
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
               <div className="flex items-center gap-2 mb-1">
                 <span className="font-mono text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                   ST-{story.id.slice(-4).toUpperCase()}
                 </span>
               </div>
               <DialogTitle className="text-xl font-semibold leading-tight break-words">
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
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-2">
          {/* Status and Priority */}
          <div className="flex flex-wrap gap-2 items-center">
            <Badge variant="outline" className={`${statusColors[story.status]} px-3 py-1`}>
              {statusLabels[story.status]}
            </Badge>
            <Badge variant="outline" className={`${priorityColors[story.priority]} px-3 py-1`}>
              {priorityLabels[story.priority]}
            </Badge>
            {story.points !== undefined && story.points > 0 && (
               <Badge variant="secondary" className="px-3 py-1 bg-gray-100 text-gray-700 border-gray-200">
                 {story.points} Story Points
               </Badge>
            )}
            {story.epic && (
                <Badge variant="secondary" className="px-3 py-1 bg-indigo-50 text-indigo-700 border-indigo-200">
                    Épico: {story.epic.title}
                </Badge>
            )}
          </div>

          {/* Description */}
          {story.description && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-900">Descrição / Critérios de Aceitação</h3>
              <div className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg border border-gray-100 leading-relaxed">
                {story.description}
              </div>
            </div>
          )}

          {/* Sub-tasks */}
          {story.tasks && story.tasks.length > 0 && (
             <Collapsible
               open={isTasksOpen}
               onOpenChange={setIsTasksOpen}
               className="border rounded-lg overflow-hidden"
             >
               <div className="flex items-center justify-between p-4 bg-gray-50 border-b cursor-pointer" onClick={() => setIsTasksOpen(!isTasksOpen)}>
                 <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                   Tarefas
                   <Badge variant="secondary" className="h-5 px-1.5 text-xs bg-white border-gray-200">
                     {story.tasks.length}
                   </Badge>
                 </h3>
                 <CollapsibleTrigger asChild>
                   <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                     {isTasksOpen ? (
                       <ChevronUp className="h-4 w-4 text-gray-500" />
                     ) : (
                       <ChevronDown className="h-4 w-4 text-gray-500" />
                     )}
                   </Button>
                 </CollapsibleTrigger>
               </div>
               
               <CollapsibleContent>
                 <div className="divide-y divide-gray-100 bg-white">
                    {story.tasks.map(task => (
                        <div key={task.id} className="flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors">
                            <div className="shrink-0 pt-0.5">
                               <TaskStatusIcon status={task.status} />
                            </div>
                            <div className="flex-1 min-w-0">
                               <p className="text-sm text-gray-900 font-medium truncate">{task.title}</p>
                            </div>
                            <Badge variant="outline" className={`text-[10px] font-medium min-w-[80px] justify-center ${statusColors[task.status]}`}>
                                {statusLabels[task.status] || task.status}
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
              <h3 className="text-sm font-semibold text-gray-900">Membros Alocados</h3>
              <div className="flex flex-wrap gap-3">
                {story.storyMembers.map((tm) => (
                  <div key={tm.member.id} className="flex items-center gap-2 bg-white border rounded-full pl-1 pr-3 py-1 shadow-sm">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={tm.member.avatar} />
                      <AvatarFallback className="text-[10px] bg-blue-100 text-blue-700">
                        {tm.member.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-xs font-medium text-gray-900 leading-none">{tm.member.name}</span>
                      <span className="text-[10px] text-gray-500 leading-none mt-0.5 capitalize">{tm.member.role.replace('_', ' ').toLowerCase()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="border-t pt-4 mt-6">
            <div className="flex items-center justify-between text-xs text-gray-400">
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
