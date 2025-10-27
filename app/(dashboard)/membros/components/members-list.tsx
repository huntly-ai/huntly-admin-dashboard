"use client"

import { useState, memo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Edit, 
  Trash2, 
  Mail,
  Phone,
  Briefcase,
  Calendar,
  UserCheck,
  ChevronDown,
} from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { formatPhone } from "@/lib/utils/formatters"

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

const statusColors: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-800",
  INACTIVE: "bg-gray-100 text-gray-800",
  ON_LEAVE: "bg-yellow-100 text-yellow-800",
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
      <Card>
        <CardContent className="p-8">
          <p className="text-center text-gray-500">
            Nenhum membro encontrado.
          </p>
        </CardContent>
      </Card>
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
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {members.map((member) => (
        <Card key={member.id} className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            {/* Header - Always Visible */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                  {member.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {member.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {roleLabels[member.role]}
                  </p>
                </div>
              </div>
              <Badge className={statusColors[member.status]}>
                {member.status === "ACTIVE" ? "Ativo" : member.status === "INACTIVE" ? "Inativo" : "Férias"}
              </Badge>
            </div>

            {/* Quick Stats - Always Visible */}
            <div className="flex gap-4 mb-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Briefcase className="h-4 w-4" />
                <span>{member._count?.projects || 0}</span>
              </div>
              <div className="flex items-center gap-1">
                <UserCheck className="h-4 w-4" />
                <span>{member._count?.teamMemberships || 0}</span>
              </div>
            </div>

            {/* Expanded Content */}
            {isExpanded(member.id) && (
              <div className="space-y-4 mb-4">
                {/* Contact Info */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="h-4 w-4" />
                    <span className="truncate">{member.email}</span>
                    {member.user ? (
                      <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                        Com acesso
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs bg-gray-50 text-gray-600 border-gray-200">
                        Sem acesso
                      </Badge>
                    )}
                  </div>
                  {member.phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="h-4 w-4" />
                      <span>{formatPhone(member.phone)}</span>
                    </div>
                  )}
                  {member.department && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Briefcase className="h-4 w-4" />
                      <span>{member.department}</span>
                    </div>
                  )}
                  {member.hireDate && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>
                        Desde {format(new Date(member.hireDate), "MMM yyyy", { locale: ptBR })}
                      </span>
                    </div>
                  )}
                </div>

                {/* All Roles */}
                {member.roles && JSON.parse(member.roles).length > 1 && (
                  <div className="pb-4 border-b">
                    <p className="text-xs text-gray-500 mb-2 font-medium">Todos os Cargos:</p>
                    <div className="flex flex-wrap gap-1">
                      {JSON.parse(member.roles).map((role: string, index: number) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {roleLabels[role]}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Skills */}
                {member.skills && (
                  <div>
                    <p className="text-xs text-gray-500 mb-2 font-medium">Habilidades:</p>
                    <div className="flex flex-wrap gap-1">
                      {member.skills.split(",").map((skill, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {skill.trim()}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Bio */}
                {member.bio && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1 font-medium">Bio:</p>
                    <p className="text-sm text-gray-600">{member.bio}</p>
                  </div>
                )}

                {/* Notes */}
                {member.notes && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1 font-medium">Observações:</p>
                    <p className="text-sm text-gray-600">{member.notes}</p>
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => toggleCardExpansion(member.id)}
                className="flex-1"
              >
                <ChevronDown 
                  className={`h-4 w-4 mr-1 transition-transform ${
                    isExpanded(member.id) ? 'rotate-180' : ''
                  }`} 
                />
                {isExpanded(member.id) ? 'Menos' : 'Mais'}
              </Button>
              {!member.user && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onCreateUser(member)}
                  className="text-blue-600 hover:text-blue-700"
                  title="Criar Usuário de Acesso"
                >
                  <UserCheck className="h-4 w-4" />
                </Button>
              )}
              <Button
                size="sm"
                variant="outline"
                onClick={() => onEdit(member)}
                title="Editar Membro"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onDelete(member.id)}
                className="text-red-600 hover:text-red-700"
                title="Excluir Membro"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export const MembersList = memo(MembersListComponent)

