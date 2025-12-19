"use client"

import { memo } from "react"
import { Button } from "@/components/ui/button"
import { Edit, Trash2, Users as UsersIcon, Crown, FolderKanban } from "lucide-react"
import { HuntlyEmpty } from "@/components/huntly-ui"
import { memberRoleLabels } from "@/lib/design-tokens"

interface Member {
  id: string
  name: string
  email: string
  role: string
}

interface TeamMembership {
  id: string
  member: Member
}

interface Team {
  id: string
  name: string
  description?: string
  leadId?: string
  teamMemberships: TeamMembership[]
  createdAt: string
  _count?: {
    projectTeams: number
    teamMemberships: number
  }
}

interface TeamsListProps {
  teams: Team[]
  onEdit: (team: Team) => void
  onDelete: (id: string) => void
}

function TeamsListComponent({
  teams,
  onEdit,
  onDelete,
}: TeamsListProps) {
  if (teams.length === 0) {
    return (
      <div className="p-8">
        <HuntlyEmpty
          title="Nenhum time cadastrado"
          description="Clique em 'Novo Time' para começar."
        />
      </div>
    )
  }

  return (
    <div className="divide-y divide-zinc-800/50">
      {teams.map((team, index) => {
        const leader = team.leadId
          ? team.teamMemberships.find(tm => tm.member.id === team.leadId)?.member
          : null

        return (
          <div
            key={team.id}
            className="group/item p-5 hover:bg-zinc-900/30 transition-colors"
          >
            <div className="flex items-start justify-between gap-4">
              {/* Team Info */}
              <div className="flex-1 min-w-0">
                {/* Header */}
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-[10px] tracking-wider text-zinc-600 font-mono">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <UsersIcon className="h-4 w-4 text-blue-500" />
                  <h3 className="font-display text-base font-medium text-zinc-200 group-hover/item:text-white transition-colors truncate">
                    {team.name}
                  </h3>
                  <span className="inline-flex items-center px-2 py-0.5 text-[10px] border border-zinc-700 text-zinc-400">
                    {team._count?.teamMemberships || 0} membros
                  </span>
                </div>

                {/* Description */}
                {team.description && (
                  <p className="text-xs text-zinc-500 mb-3 leading-relaxed">
                    {team.description}
                  </p>
                )}

                {/* Leader */}
                {leader && (
                  <div className="flex items-center gap-2 mb-3 text-xs">
                    <Crown className="h-3.5 w-3.5 text-amber-500" />
                    <span className="text-zinc-500">Líder:</span>
                    <span className="text-zinc-300">{leader.name}</span>
                    <span className="text-[10px] px-2 py-0.5 border border-zinc-700 text-zinc-500">
                      {memberRoleLabels[leader.role] || leader.role}
                    </span>
                  </div>
                )}

                {/* Members */}
                {team.teamMemberships.length > 0 && (
                  <div className="mb-3">
                    <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 mb-2">
                      <UsersIcon className="h-3 w-3" />
                      <span className="tracking-wide uppercase">Membros</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {team.teamMemberships.map((tm) => (
                        <div
                          key={tm.id}
                          className="flex items-center gap-2 bg-zinc-900/50 border border-zinc-800/50 px-2.5 py-1.5"
                        >
                          <div className="h-5 w-5 bg-zinc-800 border border-zinc-700 flex items-center justify-center text-white text-[10px] font-medium">
                            {tm.member.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-xs text-zinc-300">{tm.member.name}</p>
                            <p className="text-[10px] text-zinc-600">
                              {memberRoleLabels[tm.member.role] || tm.member.role}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Projects Count */}
                {team._count && team._count.projectTeams > 0 && (
                  <div className="flex items-center gap-2 text-xs text-zinc-500 pt-3 border-t border-zinc-800/50">
                    <FolderKanban className="h-3.5 w-3.5 text-zinc-600" />
                    <span>
                      <span className="text-zinc-300 font-medium">{team._count.projectTeams}</span>
                      {" "}
                      {team._count.projectTeams === 1 ? "projeto" : "projetos"} alocado(s)
                    </span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 opacity-0 group-hover/item:opacity-100 transition-opacity">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onEdit(team)}
                  className="h-8 w-8 p-0 text-zinc-500 hover:text-white hover:bg-zinc-800/50"
                  title="Editar Time"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onDelete(team.id)}
                  className="h-8 w-8 p-0 text-zinc-500 hover:text-red-400 hover:bg-red-950/30"
                  title="Excluir Time"
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

export const TeamsList = memo(TeamsListComponent)
