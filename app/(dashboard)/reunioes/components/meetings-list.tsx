"use client"

import { memo } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, MapPin, Users, Tag } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

const statusLabels: Record<string, string> = {
  SCHEDULED: "Agendada",
  IN_PROGRESS: "Em Progresso",
  COMPLETED: "Concluída",
  CANCELLED: "Cancelada",
}

const statusColors: Record<string, string> = {
  SCHEDULED: "bg-blue-100 text-blue-800",
  IN_PROGRESS: "bg-orange-100 text-orange-800",
  COMPLETED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
}

interface Meeting {
  id: string
  title: string
  description?: string
  startDate: string
  endDate?: string
  location?: string
  tags?: string
  notes?: string
  status: string
  lead?: {
    id: string
    name: string
  }
  client?: {
    id: string
    name: string
  }
  meetingMembers?: Array<{
    member: {
      id: string
      name: string
    }
    rsvpStatus: string
  }>
  meetingTeams?: Array<{
    team: {
      id: string
      name: string
    }
  }>
  createdAt: string
}

interface MeetingsListProps {
  meetings: Meeting[]
  onEdit: (meeting: Meeting) => void
  onDelete: (id: string) => void
}

function MeetingsListComponent({
  meetings,
  onEdit,
  onDelete,
}: MeetingsListProps) {
  if (meetings.length === 0) {
    return (
      <p className="text-center text-gray-500 py-8">
        Nenhuma reunião cadastrada ainda. Clique em &quot;Nova Reunião&quot; para começar.
      </p>
    )
  }

  return (
    <div className="space-y-3">
      {meetings.map((meeting) => {
        const startDate = new Date(meeting.startDate)
        const endDate = meeting.endDate ? new Date(meeting.endDate) : null
        const tags = meeting.tags ? JSON.parse(meeting.tags) : []

        return (
          <div
            key={meeting.id}
            className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold text-lg">{meeting.title}</h3>
                  <Badge className={statusColors[meeting.status]}>
                    {statusLabels[meeting.status]}
                  </Badge>
                </div>

                {meeting.description && (
                  <p className="text-sm text-gray-600 mb-3">{meeting.description}</p>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-sm text-gray-600 mb-3">
                  <div>
                    <span className="font-medium">Data/Hora:</span>{" "}
                    {format(startDate, "dd/MM/yyyy HH:mm", { locale: ptBR })}
                    {endDate && (
                      <>
                        {" - "}
                        {format(endDate, "HH:mm", { locale: ptBR })}
                      </>
                    )}
                  </div>

                  {meeting.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span>{meeting.location}</span>
                    </div>
                  )}

                  {meeting.client && (
                    <div>
                      <span className="font-medium">Cliente:</span> {meeting.client.name}
                    </div>
                  )}

                  {meeting.lead && (
                    <div>
                      <span className="font-medium">Lead:</span> {meeting.lead.name}
                    </div>
                  )}
                </div>

                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {tags.map((tag: string) => (
                      <Badge key={tag} variant="outline" className="flex items-center gap-1">
                        <Tag className="h-3 w-3" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                {(meeting.meetingMembers || []).length > 0 && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <Users className="h-4 w-4 text-gray-400" />
                    <span>
                      {meeting.meetingMembers?.map(m => m.member.name).join(", ")}
                    </span>
                  </div>
                )}

                {meeting.notes && (
                  <p className="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded italic">
                    Notas: {meeting.notes}
                  </p>
                )}
              </div>

              <div className="flex gap-2 ml-4">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onEdit(meeting)}
                  title="Editar Reunião"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onDelete(meeting.id)}
                  className="text-red-600 hover:text-red-700"
                  title="Excluir Reunião"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export const MeetingsList = memo(MeetingsListComponent)
