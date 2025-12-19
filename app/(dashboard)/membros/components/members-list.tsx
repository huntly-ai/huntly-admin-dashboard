"use client"

import { useState, memo } from "react"
import { Button } from "@/components/ui/button"
import {
  Edit,
  Trash2,
  Mail,
  Phone,
  Briefcase,
  Calendar,
  UserCheck,
  ChevronDown,
  FolderKanban,
  Users,
} from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { formatPhone } from "@/lib/utils/formatters"
import { HuntlyEmpty } from "@/components/huntly-ui"
import { memberStatusColors, memberStatusLabels, memberRoleLabels } from "@/lib/design-tokens"

interface TeamMembership {
  id: string
  team: {
    id: string
    name: string
  }
}

interface Member {
  id: string
  name: string
  email: string
  phone?: string
  role: string
  roles?: string
  status: string
  department?: string
  hireDate?: string
  avatar?: string
  bio?: string
  skills?: string
  notes?: string
  teamMemberships: TeamMembership[]
  createdAt: string
  user?: {
    id: string
    email: string
  }
  _count?: {
    projects: number
    teamMemberships: number
  }
}

interface MembersListProps {
  members: Member[]
  onEdit: (member: Member) => void
  onDelete: (id: string) => void
  onCreateUser: (member: Member) => void
}

function MembersListComponent({
  members,
  onEdit,
  onDelete,
  onCreateUser,
}: MembersListProps) {
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set())

  if (members.length === 0) {
    return (
      <div className="p-8">
        <HuntlyEmpty
          title="Nenhum membro encontrado"
          description="Clique em 'Novo Membro' para adicionar."
        />
      </div>
    )
  }

  const toggleCardExpansion = (memberId: string) => {
    setExpandedCards(prev => {
      const newSet = new Set(prev)
      if (newSet.has(memberId)) {
        newSet.delete(memberId)
      } else {
        newSet.add(memberId)
      }
      return newSet
    })
  }

  const isExpanded = (memberId: string) => expandedCards.has(memberId)

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 p-5">
      {members.map((member, index) => (
        <div
          key={member.id}
          className="group/item relative bg-black/50 backdrop-blur-sm border border-zinc-800 hover:border-zinc-700 transition-all duration-300"
        >
          {/* Corner accents */}
          <div className="absolute top-0 left-0 w-3 h-3 border-l border-t border-white/0 group-hover/item:border-white/30 transition-colors duration-300" />
          <div className="absolute top-0 right-0 w-3 h-3 border-r border-t border-white/0 group-hover/item:border-white/30 transition-colors duration-300" />
          <div className="absolute bottom-0 left-0 w-3 h-3 border-l border-b border-white/0 group-hover/item:border-white/30 transition-colors duration-300" />
          <div className="absolute bottom-0 right-0 w-3 h-3 border-r border-b border-white/0 group-hover/item:border-white/30 transition-colors duration-300" />

          {/* Hover line */}
          <div className="absolute bottom-0 left-0 w-0 h-px bg-white/30 group-hover/item:w-full transition-all duration-500" />

          {/* Header */}
          <div className="p-4">
            <div className="flex items-start gap-3 mb-3">
              <div className="h-10 w-10 bg-zinc-800 border border-zinc-700 flex items-center justify-center text-white font-display text-sm flex-shrink-0">
                {member.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] tracking-wider text-zinc-600 font-mono">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <h3 className="font-display text-sm font-medium text-zinc-200 group-hover/item:text-white transition-colors truncate">
                    {member.name}
                  </h3>
                </div>
                <p className="text-xs text-zinc-500">
                  {memberRoleLabels[member.role] || member.role}
                </p>
              </div>
              <span className={`inline-flex items-center px-2 py-0.5 text-[10px] tracking-wide uppercase border ${memberStatusColors[member.status]}`}>
                {memberStatusLabels[member.status]}
              </span>
            </div>

            {/* Quick Stats */}
            <div className="flex gap-4 text-xs text-zinc-500">
              <div className="flex items-center gap-1">
                <FolderKanban className="h-3 w-3 text-zinc-600" />
                <span>{member._count?.projects || 0} projetos</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3 text-zinc-600" />
                <span>{member._count?.teamMemberships || 0} times</span>
              </div>
            </div>
          </div>

          {/* Expanded Content */}
          {isExpanded(member.id) && (
            <div className="px-4 pb-4 space-y-3 border-t border-zinc-800/50 pt-3">
              {/* Contact Info */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2 text-zinc-500">
                  <Mail className="h-3.5 w-3.5 text-zinc-600" />
                  <span className="truncate">{member.email}</span>
                  {member.user ? (
                    <span className="text-[10px] px-1.5 py-0.5 bg-emerald-950/30 text-emerald-400 border border-emerald-900/50">
                      Acesso
                    </span>
                  ) : (
                    <span className="text-[10px] px-1.5 py-0.5 bg-zinc-900/50 text-zinc-500 border border-zinc-800/50">
                      Sem acesso
                    </span>
                  )}
                </div>
                {member.phone && (
                  <div className="flex items-center gap-2 text-zinc-500">
                    <Phone className="h-3.5 w-3.5 text-zinc-600" />
                    <span>{formatPhone(member.phone)}</span>
                  </div>
                )}
                {member.department && (
                  <div className="flex items-center gap-2 text-zinc-500">
                    <Briefcase className="h-3.5 w-3.5 text-zinc-600" />
                    <span>{member.department}</span>
                  </div>
                )}
                {member.hireDate && (
                  <div className="flex items-center gap-2 text-zinc-500">
                    <Calendar className="h-3.5 w-3.5 text-zinc-600" />
                    <span>
                      Desde {format(new Date(member.hireDate), "MMM yyyy", { locale: ptBR })}
                    </span>
                  </div>
                )}
              </div>

              {/* All Roles */}
              {member.roles && JSON.parse(member.roles).length > 1 && (
                <div className="pt-2 border-t border-zinc-800/50">
                  <p className="text-[10px] text-zinc-600 uppercase tracking-wide mb-2">Cargos:</p>
                  <div className="flex flex-wrap gap-1">
                    {JSON.parse(member.roles).map((role: string, idx: number) => (
                      <span key={idx} className="text-[10px] px-2 py-0.5 border border-zinc-700 text-zinc-400">
                        {memberRoleLabels[role] || role}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Skills */}
              {member.skills && (
                <div className="pt-2 border-t border-zinc-800/50">
                  <p className="text-[10px] text-zinc-600 uppercase tracking-wide mb-2">Habilidades:</p>
                  <div className="flex flex-wrap gap-1">
                    {member.skills.split(",").map((skill, idx) => (
                      <span key={idx} className="text-[10px] px-2 py-0.5 bg-zinc-900/50 border border-zinc-800/50 text-zinc-400">
                        {skill.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Bio */}
              {member.bio && (
                <div className="pt-2 border-t border-zinc-800/50">
                  <p className="text-[10px] text-zinc-600 uppercase tracking-wide mb-1">Bio:</p>
                  <p className="text-xs text-zinc-500">{member.bio}</p>
                </div>
              )}

              {/* Notes */}
              {member.notes && (
                <p className="text-xs text-zinc-500 bg-zinc-900/50 border border-zinc-800/50 p-2 leading-relaxed">
                  {member.notes}
                </p>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-1 p-3 border-t border-zinc-800/50">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => toggleCardExpansion(member.id)}
              className="flex-1 h-8 text-xs text-zinc-500 hover:text-white hover:bg-zinc-800/50"
            >
              <ChevronDown
                className={`h-3.5 w-3.5 mr-1 transition-transform ${
                  isExpanded(member.id) ? 'rotate-180' : ''
                }`}
              />
              {isExpanded(member.id) ? 'Menos' : 'Mais'}
            </Button>
            {!member.user && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onCreateUser(member)}
                className="h-8 w-8 p-0 text-zinc-500 hover:text-blue-400 hover:bg-blue-950/30"
                title="Criar Acesso"
              >
                <UserCheck className="h-3.5 w-3.5" />
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onEdit(member)}
              className="h-8 w-8 p-0 text-zinc-500 hover:text-white hover:bg-zinc-800/50"
              title="Editar"
            >
              <Edit className="h-3.5 w-3.5" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onDelete(member.id)}
              className="h-8 w-8 p-0 text-zinc-500 hover:text-red-400 hover:bg-red-950/30"
              title="Excluir"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}

export const MembersList = memo(MembersListComponent)
