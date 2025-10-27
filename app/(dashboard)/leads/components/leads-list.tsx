"use client"

import { memo } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, UserCheck } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { formatPhone } from "@/lib/utils/formatters"

const statusLabels: Record<string, string> = {
  NEW: "Novo",
  CONTACTED: "Contactado",
  QUALIFIED: "Qualificado",
  PROPOSAL_SENT: "Proposta Enviada",
  NEGOTIATION: "Negociação",
  WON: "Ganho",
  LOST: "Perdido",
}

const sourceLabels: Record<string, string> = {
  WEBSITE: "Website",
  REFERRAL: "Indicação",
  SOCIAL_MEDIA: "Redes Sociais",
  ZEROS_A_DIREITA: "Zeros à Direita",
  EVENT: "Evento",
  OTHER: "Outro",
}

const statusColors: Record<string, string> = {
  NEW: "bg-blue-100 text-blue-800",
  CONTACTED: "bg-purple-100 text-purple-800",
  QUALIFIED: "bg-green-100 text-green-800",
  PROPOSAL_SENT: "bg-yellow-100 text-yellow-800",
  NEGOTIATION: "bg-orange-100 text-orange-800",
  WON: "bg-emerald-100 text-emerald-800",
  LOST: "bg-red-100 text-red-800",
}

interface Lead {
  id: string
  name: string
  email?: string
  phone: string
  company?: string
  position?: string
  status: string
  source: string
  notes?: string
  estimatedValue?: number
  convertedToClientId?: string
  createdAt: string
}

interface LeadsListProps {
  leads: Lead[]
  onEdit: (lead: Lead) => void
  onDelete: (id: string) => void
  onConvert: (lead: Lead) => void
}

function LeadsListComponent({
  leads,
  onEdit,
  onDelete,
  onConvert,
}: LeadsListProps) {
  if (leads.length === 0) {
    return (
      <p className="text-center text-gray-500 py-8">
        Nenhum lead cadastrado ainda. Clique em &quot;Novo Lead&quot; para começar.
      </p>
    )
  }

  return (
    <div className="space-y-3">
      {leads.map((lead) => (
        <div
          key={lead.id}
          className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="font-semibold text-lg">{lead.name}</h3>
                <Badge className={statusColors[lead.status]}>
                  {statusLabels[lead.status]}
                </Badge>
                <Badge variant="outline">{sourceLabels[lead.source]}</Badge>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-2 text-sm text-gray-600">
                {lead.email && (
                  <div>
                    <span className="font-medium">Email:</span> {lead.email}
                  </div>
                )}
                <div>
                  <span className="font-medium">Telefone:</span> {formatPhone(lead.phone)}
                </div>
                {lead.company && (
                  <div>
                    <span className="font-medium">Empresa:</span> {lead.company}
                  </div>
                )}
                {lead.position && (
                  <div>
                    <span className="font-medium">Cargo:</span> {lead.position}
                  </div>
                )}
                {lead.estimatedValue && (
                  <div>
                    <span className="font-medium">Valor Estimado:</span>{" "}
                    <span className="text-green-600 font-semibold">
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(lead.estimatedValue)}
                    </span>
                  </div>
                )}
                <div>
                  <span className="font-medium">Criado em:</span>{" "}
                  {format(new Date(lead.createdAt), "dd/MM/yyyy", { locale: ptBR })}
                </div>
              </div>

              {lead.notes && (
                <p className="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                  {lead.notes}
                </p>
              )}

              {lead.convertedToClientId && (
                <div className="mt-2">
                  <Badge className="bg-green-100 text-green-800">
                    ✓ Convertido em Cliente
                  </Badge>
                </div>
              )}
            </div>

            <div className="flex gap-2 ml-4">
              {!lead.convertedToClientId && lead.status !== "WON" && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onConvert(lead)}
                  className="text-green-600 hover:text-green-700"
                  title="Converter em Cliente"
                >
                  <UserCheck className="h-4 w-4" />
                </Button>
              )}
              <Button
                size="sm"
                variant="outline"
                onClick={() => onEdit(lead)}
                title="Editar Lead"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onDelete(lead.id)}
                className="text-red-600 hover:text-red-700"
                title="Excluir Lead"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export const LeadsList = memo(LeadsListComponent)

