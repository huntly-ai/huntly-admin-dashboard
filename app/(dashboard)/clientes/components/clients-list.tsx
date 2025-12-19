"use client"

import { memo } from "react"
import { Button } from "@/components/ui/button"
import { Plus, Edit, Trash2, FolderKanban, DollarSign, Mail, Phone, Building2, Globe, MapPin, Calendar } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { formatPhone, formatCNPJ } from "@/lib/utils/formatters"
import { clientStatusColors, clientStatusLabels } from "@/lib/design-tokens"
import { HuntlyEmpty } from "@/components/huntly-ui"

interface Client {
  id: string
  name: string
  email: string
  phone?: string
  company?: string
  position?: string
  status: string
  cnpj?: string
  address?: string
  website?: string
  notes?: string
  createdAt: string
  _count?: {
    projects: number
    transactions: number
  }
}

interface ClientsListProps {
  clients: Client[]
  onEdit: (client: Client) => void
  onDelete: (id: string) => void
  onCreateProject: (clientId: string, clientName: string) => void
}

function ClientsListComponent({
  clients,
  onEdit,
  onDelete,
  onCreateProject,
}: ClientsListProps) {
  if (clients.length === 0) {
    return (
      <div className="p-8">
        <HuntlyEmpty
          title="Nenhum cliente cadastrado"
          description="Clique em 'Novo Cliente' para começar."
        />
      </div>
    )
  }

  return (
    <div className="divide-y divide-border">
      {clients.map((client, index) => (
        <div
          key={client.id}
          className="group/item p-5 hover:bg-muted/30 transition-colors"
        >
          <div className="flex items-start justify-between gap-4">
            {/* Client Info */}
            <div className="flex-1 min-w-0">
              {/* Header */}
              <div className="flex items-center gap-3 mb-3">
                <span className="text-[10px] tracking-wider text-muted-foreground/70 font-mono">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <h3 className="font-display text-base font-medium text-foreground/80 group-hover/item:text-foreground transition-colors truncate">
                  {client.name}
                </h3>
                <span className={`inline-flex items-center px-2 py-0.5 text-[10px] tracking-wide uppercase border ${clientStatusColors[client.status]}`}>
                  {clientStatusLabels[client.status]}
                </span>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-3.5 w-3.5 text-muted-foreground/70" />
                  <span className="truncate">{client.email}</span>
                </div>
                {client.phone && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-3.5 w-3.5 text-muted-foreground/70" />
                    <span>{formatPhone(client.phone)}</span>
                  </div>
                )}
                {client.company && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Building2 className="h-3.5 w-3.5 text-muted-foreground/70" />
                    <span className="truncate">{client.company}</span>
                  </div>
                )}
                {client.cnpj && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <span className="text-[10px] text-muted-foreground/70 font-mono">CNPJ</span>
                    <span className="font-mono text-xs">{formatCNPJ(client.cnpj)}</span>
                  </div>
                )}
                {client.website && (
                  <div className="flex items-center gap-2">
                    <Globe className="h-3.5 w-3.5 text-muted-foreground/70" />
                    <a
                      href={client.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 truncate transition-colors"
                    >
                      {client.website.replace(/^https?:\/\//, '')}
                    </a>
                  </div>
                )}
                <div className="flex items-center gap-2 text-muted-foreground/70">
                  <Calendar className="h-3.5 w-3.5" />
                  <span className="text-[11px]">
                    {format(new Date(client.createdAt), "dd/MM/yyyy", { locale: ptBR })}
                  </span>
                </div>
              </div>

              {/* Address */}
              {client.address && (
                <div className="flex items-start gap-2 mt-3 text-muted-foreground text-sm">
                  <MapPin className="h-3.5 w-3.5 text-muted-foreground/70 mt-0.5" />
                  <span>{client.address}</span>
                </div>
              )}

              {/* Notes */}
              {client.notes && (
                <p className="mt-3 text-xs text-muted-foreground bg-muted/50 border border-border/50 p-3 leading-relaxed">
                  {client.notes}
                </p>
              )}

              {/* Counts */}
              {client._count && (
                <div className="flex gap-4 mt-4">
                  <div className="flex items-center gap-2 text-xs">
                    <FolderKanban className="h-3.5 w-3.5 text-muted-foreground/70" />
                    <span className="text-muted-foreground dark:text-zinc-400">{client._count.projects} projetos</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <DollarSign className="h-3.5 w-3.5 text-muted-foreground/70" />
                    <span className="text-muted-foreground dark:text-zinc-400">{client._count.transactions} transações</span>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 opacity-0 group-hover/item:opacity-100 transition-opacity">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onCreateProject(client.id, client.name)}
                className="h-8 px-3 text-muted-foreground hover:text-blue-400 hover:bg-blue-950/30 text-xs"
                title="Criar Projeto"
              >
                <Plus className="h-3.5 w-3.5 mr-1" />
                Projeto
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onEdit(client)}
                className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-muted"
                title="Editar Cliente"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onDelete(client.id)}
                className="h-8 w-8 p-0 text-muted-foreground hover:text-red-400 hover:bg-red-950/30"
                title="Excluir Cliente"
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

export const ClientsList = memo(ClientsListComponent)
