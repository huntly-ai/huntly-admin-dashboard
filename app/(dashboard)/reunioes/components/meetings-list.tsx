"use client"

import { memo } from "react"
import { Button } from "@/components/ui/button"
import { Edit, Trash2, MapPin, Users, Tag, Calendar, Clock, User, Building2, ExternalLink } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { HuntlyEmpty } from "@/components/huntly-ui"
import { meetingStatusColors, meetingStatusLabels } from "@/lib/design-tokens"

const isUrl = (str: string) => /^https?:\/\//.test(str)

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
      <div className="p-8">
        <HuntlyEmpty
          title="Nenhuma reunião cadastrada"
          description="Clique em 'Nova Reunião' para começar."
        />
      </div>
    )
  }

  return (
    <div className="divide-y divide-zinc-800/50">
      {meetings.map((meeting, index) => {
        const startDate = new Date(meeting.startDate)
        const endDate = meeting.endDate ? new Date(meeting.endDate) : null
        const tags = meeting.tags ? JSON.parse(meeting.tags) : []

        return (
          <div
            key={meeting.id}
            className="group/item p-5 hover:bg-zinc-900/30 transition-colors"
          >
            <div className="flex items-start justify-between gap-4">
              {/* Meeting Info */}
              <div className="flex-1 min-w-0">
                {/* Header */}
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-[10px] tracking-wider text-zinc-600 font-mono">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <h3 className="font-display text-base font-medium text-zinc-200 group-hover/item:text-white transition-colors truncate">
                    {meeting.title}
                  </h3>
                  <span className={`inline-flex items-center px-2 py-0.5 text-[10px] tracking-wide uppercase border ${meetingStatusColors[meeting.status]}`}>
                    {meetingStatusLabels[meeting.status]}
                  </span>
                </div>

                {/* Description */}
                {meeting.description && (
                  <p className="text-xs text-zinc-500 mb-3 leading-relaxed">
                    {meeting.description}
                  </p>
                )}

                {/* Details Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 text-sm mb-3">
                  {/* Date/Time */}
                  <div className="flex items-center gap-2 text-zinc-500">
                    <Calendar className="h-3.5 w-3.5 text-zinc-600" />
                    <span>{format(startDate, "dd/MM/yyyy", { locale: ptBR })}</span>
                  </div>
                  <div className="flex items-center gap-2 text-zinc-500">
                    <Clock className="h-3.5 w-3.5 text-zinc-600" />
                    <span>
                      {format(startDate, "HH:mm", { locale: ptBR })}
                      {endDate && ` - ${format(endDate, "HH:mm", { locale: ptBR })}`}
                    </span>
                  </div>

                  {/* Location */}
                  {meeting.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-zinc-600" />
                      {isUrl(meeting.location) ? (
                        <a
                          href={meeting.location}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 truncate flex items-center gap-1"
                        >
                          <span className="truncate">{meeting.location.replace(/^https?:\/\//, '').split('/')[0]}</span>
                          <ExternalLink className="h-3 w-3 flex-shrink-0" />
                        </a>
                      ) : (
                        <span className="text-zinc-500 truncate">{meeting.location}</span>
                      )}
                    </div>
                  )}

                  {/* Client */}
                  {meeting.client && (
                    <div className="flex items-center gap-2 text-zinc-500">
                      <Building2 className="h-3.5 w-3.5 text-zinc-600" />
                      <span className="truncate">{meeting.client.name}</span>
                    </div>
                  )}

                  {/* Lead */}
                  {meeting.lead && (
                    <div className="flex items-center gap-2 text-zinc-500">
                      <User className="h-3.5 w-3.5 text-zinc-600" />
                      <span className="truncate">{meeting.lead.name}</span>
                    </div>
                  )}
                </div>

                {/* Tags */}
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {tags.map((tag: string) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] border border-zinc-700 text-zinc-400"
                      >
                        <Tag className="h-2.5 w-2.5" />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Members */}
                {(meeting.meetingMembers || []).length > 0 && (
                  <div className="flex items-center gap-2 text-xs text-zinc-500 mb-3">
                    <Users className="h-3.5 w-3.5 text-zinc-600" />
                    <span>
                      {meeting.meetingMembers?.map(m => m.member.name).join(", ")}
                    </span>
                  </div>
                )}

                {/* Notes */}
                {meeting.notes && (
                  <p className="text-xs text-zinc-500 bg-zinc-900/50 border border-zinc-800/50 p-3 leading-relaxed">
                    {meeting.notes}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 opacity-0 group-hover/item:opacity-100 transition-opacity">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onEdit(meeting)}
                  className="h-8 w-8 p-0 text-zinc-500 hover:text-white hover:bg-zinc-800/50"
                  title="Editar Reunião"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onDelete(meeting.id)}
                  className="h-8 w-8 p-0 text-zinc-500 hover:text-red-400 hover:bg-red-950/30"
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
