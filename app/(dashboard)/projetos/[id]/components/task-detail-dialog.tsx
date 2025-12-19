"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Calendar, Clock, Edit, Trash2, AlertCircle } from "lucide-react"
import { format, isPast, isToday } from "date-fns"
import { ptBR } from "date-fns/locale"
import { taskStatusColors, taskStatusLabels, priorityColors, priorityLabels, getAvatarColor, iconColors } from "@/lib/design-tokens"

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

interface TaskDetailDialogProps {
  isOpen: boolean
  onClose: () => void
  task: Task | null
  onEdit: (task: Task) => void
  onDelete: (taskId: string) => void
}


export function TaskDetailDialog({
  isOpen,
  onClose,
  task,
  onEdit,
  onDelete,
}: TaskDetailDialogProps) {
  if (!task) return null

  const tags = task.tags ? JSON.parse(task.tags) : []
  const isOverdue = task.dueDate && isPast(new Date(task.dueDate)) && task.status !== 'DONE'
  const isDueToday = task.dueDate && isToday(new Date(task.dueDate))

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-border">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <DialogTitle className="text-2xl pr-8 text-foreground">{task.title}</DialogTitle>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onEdit(task)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onDelete(task.id)}
                className={`${iconColors.danger} hover:bg-red-950/50`}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Status and Priority */}
          <div className="flex flex-wrap gap-2">
            <Badge className={taskStatusColors[task.status]}>
              {taskStatusLabels[task.status]}
            </Badge>
            <Badge className={`${priorityColors[task.priority]?.bg} ${priorityColors[task.priority]?.text} ${priorityColors[task.priority]?.border}`}>
              {priorityLabels[task.priority]}
            </Badge>
          </div>

          {/* Description */}
          {task.description && (
            <div>
              <h3 className="text-sm font-semibold mb-2 text-foreground">Descrição</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {task.description}
              </p>
            </div>
          )}

          {/* Tags */}
          {tags.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold mb-2 text-foreground">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag: string, index: number) => (
                  <span
                    key={index}
                    className="text-sm bg-secondary text-muted-foreground px-3 py-1 rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Dates and Time */}
          <div className="grid grid-cols-2 gap-4">
            {task.dueDate && (
              <div>
                <h3 className="text-sm font-semibold mb-1 flex items-center gap-1 text-foreground">
                  <Calendar className="h-4 w-4" />
                  Data de Entrega
                </h3>
                <p className={`text-sm ${
                  isOverdue ? 'text-red-400 font-semibold flex items-center gap-1' :
                  isDueToday ? 'text-amber-400 font-semibold' : 'text-muted-foreground'
                }`}>
                  {isOverdue && <AlertCircle className="h-4 w-4" />}
                  {format(new Date(task.dueDate), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  {isOverdue && ' (Atrasada)'}
                  {isDueToday && !isOverdue && ' (Hoje)'}
                </p>
              </div>
            )}

            {task.completedAt && (
              <div>
                <h3 className="text-sm font-semibold mb-1 text-foreground">Data de Conclusão</h3>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(task.completedAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                </p>
              </div>
            )}
          </div>

          {/* Hours */}
          {(task.estimatedHours || task.actualHours) && (
            <div>
              <h3 className="text-sm font-semibold mb-2 flex items-center gap-1 text-foreground">
                <Clock className="h-4 w-4" />
                Horas
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {task.estimatedHours && (
                  <div>
                    <p className="text-xs text-muted-foreground">Estimadas</p>
                    <p className="text-sm font-semibold text-foreground">{task.estimatedHours}h</p>
                  </div>
                )}
                {task.actualHours && (
                  <div>
                    <p className="text-xs text-muted-foreground">Trabalhadas</p>
                    <p className="text-sm font-semibold text-foreground">{task.actualHours}h</p>
                  </div>
                )}
              </div>
              {task.estimatedHours && task.actualHours && (
                <div className="mt-2">
                  <div className="w-full bg-zinc-800 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        task.actualHours > task.estimatedHours
                          ? 'bg-red-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{
                        width: `${Math.min((task.actualHours / task.estimatedHours) * 100, 100)}%`,
                      }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {task.actualHours > task.estimatedHours
                      ? `${(task.actualHours - task.estimatedHours).toFixed(1)}h acima do estimado`
                      : `${(task.estimatedHours - task.actualHours).toFixed(1)}h restantes`}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Assigned Members */}
          {task.taskMembers && task.taskMembers.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold mb-2 text-foreground">Membros Alocados</h3>
              <div className="space-y-2">
                {task.taskMembers.map((tm) => (
                  <div key={tm.member.id} className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className={`text-sm ${getAvatarColor(tm.member.id)}`}>
                        {tm.member.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium text-foreground">{tm.member.name}</p>
                      <p className="text-xs text-muted-foreground">{tm.member.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Assigned Teams */}
          {task.taskTeams && task.taskTeams.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold mb-2 text-foreground">Times Alocados</h3>
              <div className="flex flex-wrap gap-2">
                {task.taskTeams.map((tt) => (
                  <Badge key={tt.team.id} variant="outline" className="text-sm">
                    {tt.team.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="border-t border-border pt-4">
            <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
              <div>
                <span className="font-semibold">Criada em:</span>{" "}
                {format(new Date(task.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
              </div>
              <div>
                <span className="font-semibold">Atualizada em:</span>{" "}
                {format(new Date(task.updatedAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

