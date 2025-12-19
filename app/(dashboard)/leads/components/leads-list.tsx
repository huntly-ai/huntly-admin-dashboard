"use client"

import { memo } from "react"
import { Button } from "@/components/ui/button"
import { Edit, Trash2, UserCheck, Mail, Phone, Building2, Briefcase, Calendar, DollarSign } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { formatPhone } from "@/lib/utils/formatters"
import {
  leadStatusColors,
  leadStatusLabels,
  leadSourceColors,
  leadSourceLabels,
} from "@/lib/design-tokens"
import { HuntlyEmpty } from "@/components/huntly-ui"

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
      <div className="p-8">
        <HuntlyEmpty
          title="Nenhum lead cadastrado"
          description="Clique em 'Novo Lead' para começar a capturar oportunidades."
        />
      </div>
    )
  }

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)

  return (
    <div className="divide-y divide-border">
      {leads.map((lead, index) => (
        <div
          key={lead.id}
          className="group/item p-5 hover:bg-muted/30 transition-colors"
        >
          <div className="flex items-start justify-between gap-4">
            {/* Lead Info */}
            <div className="flex-1 min-w-0">
              {/* Header */}
              <div className="flex items-center gap-3 mb-3">
                <span className="text-[10px] tracking-wider text-muted-foreground/70 font-mono">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <h3 className="font-display text-base font-medium text-foreground/80 group-hover/item:text-foreground transition-colors truncate">
                  {lead.name}
                </h3>
                <span className={`inline-flex items-center px-2 py-0.5 text-[10px] tracking-wide uppercase border ${leadStatusColors[lead.status]}`}>
                  {leadStatusLabels[lead.status]}
                </span>
                <span className={`inline-flex items-center px-2 py-0.5 text-[10px] tracking-wide uppercase border ${leadSourceColors[lead.source]}`}>
                  {leadSourceLabels[lead.source]}
                </span>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 text-sm">
                {lead.email && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-3.5 w-3.5 text-muted-foreground/70" />
                    <span className="truncate">{lead.email}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-3.5 w-3.5 text-muted-foreground/70" />
                  <span>{formatPhone(lead.phone)}</span>
                </div>
                {lead.company && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Building2 className="h-3.5 w-3.5 text-muted-foreground/70" />
                    <span className="truncate">{lead.company}</span>
                  </div>
                )}
                {lead.position && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Briefcase className="h-3.5 w-3.5 text-muted-foreground/70" />
                    <span className="truncate">{lead.position}</span>
                  </div>
                )}
                {lead.estimatedValue && (
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-3.5 w-3.5 text-emerald-600" />
                    <span className="text-emerald-400 font-medium">
                      {formatCurrency(lead.estimatedValue)}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-muted-foreground/70">
                  <Calendar className="h-3.5 w-3.5" />
                  <span className="text-[11px]">
                    {format(new Date(lead.createdAt), "dd/MM/yyyy", { locale: ptBR })}
                  </span>
                </div>
              </div>

              {/* Notes */}
              {lead.notes && (
                <p className="mt-3 text-xs text-muted-foreground bg-muted/50 border border-border/50 p-3 leading-relaxed">
                  {lead.notes}
                </p>
              )}

              {/* Converted Badge */}
              {lead.convertedToClientId && (
                <div className="mt-3">
                  <span className="inline-flex items-center px-2 py-1 text-[10px] tracking-wide uppercase bg-emerald-950/50 text-emerald-400 border border-emerald-900/50">
                    Convertido em Cliente
                  </span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 opacity-0 group-hover/item:opacity-100 transition-opacity">
              {!lead.convertedToClientId && lead.status !== "WON" && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onConvert(lead)}
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-emerald-400 hover:bg-emerald-950/30"
                  title="Converter em Cliente"
                >
                  <UserCheck className="h-4 w-4" />
                </Button>
              )}
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onEdit(lead)}
                className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-muted"
                title="Editar Lead"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onDelete(lead.id)}
                className="h-8 w-8 p-0 text-muted-foreground hover:text-red-400 hover:bg-red-950/30"
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
