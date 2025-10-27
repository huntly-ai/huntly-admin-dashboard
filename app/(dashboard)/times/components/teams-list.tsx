"use client"

import { memo } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, Users as UsersIcon, Crown } from "lucide-react"

const roleLabels: Record<string, string> = {
  DEVELOPER: "Desenvolvedor",
  DESIGNER: "Designer",
  PROJECT_MANAGER: "Gerente de Projeto",
  PRODUCT_MANAGER: "Gerente de Produto",
  QA_ENGINEER: "Engenheiro de QA",
  DEVOPS: "DevOps",
  DATA_SCIENTIST: "Cientista de Dados",
  BUSINESS_ANALYST: "Analista de Negócios",
  FOUNDER: "Fundador",
  CEO: "CEO",
  CTO: "CTO",
  CFO: "CFO",
  OTHER: "Outro",
}

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
      <p className="text-center text-gray-500 py-8">
        Nenhum time cadastrado ainda. Clique em &quot;Novo Time&quot; para começar.
      </p>
    )
  }

  return (
    <div className="space-y-4">
      {teams.map((team) => {
        const leader = team.leadId
          ? team.teamMemberships.find(tm => tm.member.id === team.leadId)?.member
          : null

        return (
          <div
            key={team.id}
            className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <UsersIcon className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-semibold">{team.name}</h3>
                  <Badge variant="outline">
                    {team._count?.teamMemberships || 0} membros
                  </Badge>
                </div>

                {team.description && (
                  <p className="text-sm text-gray-600 mb-3">
                    {team.description}
                  </p>
                )}

                {leader && (
                  <div className="flex items-center gap-2 mb-3 text-sm">
                    <Crown className="h-4 w-4 text-yellow-600" />
                    <span className="font-medium">Líder:</span>
                    <span className="text-gray-600">{leader.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {roleLabels[leader.role]}
                    </Badge>
                  </div>
                )}

                {/* Members */}
                {team.teamMemberships.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">
                      Membros
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {team.teamMemberships.map((tm) => (
                        <div
                          key={tm.id}
                          className="flex items-center gap-2 bg-white border rounded-md px-3 py-1.5"
                        >
                          <div className="h-6 w-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs">
                            {tm.member.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{tm.member.name}</p>
                            <p className="text-xs text-gray-500">
                              {roleLabels[tm.member.role]}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {team._count && team._count.projectTeams > 0 && (
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">{team._count.projectTeams}</span>{" "}
                      {team._count.projectTeams === 1 ? "projeto" : "projetos"} alocado(s)
                    </p>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onEdit(team)}
                  title="Editar Time"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onDelete(team.id)}
                  className="text-red-600 hover:text-red-700"
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

