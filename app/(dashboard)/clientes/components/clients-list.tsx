"use client"

import { memo } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, FolderKanban, DollarSign } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { formatPhone, formatCNPJ } from "@/lib/utils/formatters"

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

const statusLabels: Record<string, string> = {
  ACTIVE: "Ativo",
  INACTIVE: "Inativo",
  CHURNED: "Perdido",
}

const statusColors: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-800",
  INACTIVE: "bg-yellow-100 text-yellow-800",
  CHURNED: "bg-red-100 text-red-800",
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
      <p className="text-center text-gray-500 py-8">
        Nenhum cliente cadastrado ainda. Clique em &quot;Novo Cliente&quot; para começar.
      </p>
    )
  }

  return (
    <div className="space-y-4">
      {clients.map((client) => (
        <div
          key={client.id}
          className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="font-semibold text-lg">{client.name}</h3>
                <Badge className={statusColors[client.status]}>
                  {statusLabels[client.status]}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm text-gray-600">
                <div>
                  <span className="font-medium">Email:</span> {client.email}
                </div>
                {client.phone && (
                  <div>
                    <span className="font-medium">Telefone:</span> {formatPhone(client.phone)}
                  </div>
                )}
                {client.company && (
                  <div>
                    <span className="font-medium">Empresa:</span> {client.company}
                  </div>
                )}
                {client.cnpj && (
                  <div>
                    <span className="font-medium">CNPJ:</span> {formatCNPJ(client.cnpj)}
                  </div>
                )}
                {client.website && (
                  <div>
                    <span className="font-medium">Website:</span>{" "}
                    <a
                      href={client.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {client.website}
                    </a>
                  </div>
                )}
                <div>
                  <span className="font-medium">Cadastrado em:</span>{" "}
                  {format(new Date(client.createdAt), "dd/MM/yyyy", {
                    locale: ptBR,
                  })}
                </div>
              </div>
              {client.address && (
                <p className="mt-2 text-sm text-gray-600">
                  <span className="font-medium">Endereço:</span> {client.address}
                </p>
              )}
              {client.notes && (
                <p className="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                  {client.notes}
                </p>
              )}
              {client._count && (
                <div className="flex gap-4 mt-3">
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <FolderKanban className="h-4 w-4" />
                    <span>{client._count.projects} projetos</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <DollarSign className="h-4 w-4" />
                    <span>{client._count.transactions} transações</span>
                  </div>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onCreateProject(client.id, client.name)}
                className="text-blue-600 hover:text-blue-700"
                title="Criar Projeto"
              >
                <Plus className="h-4 w-4 mr-1" />
                Projeto
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onEdit(client)}
                title="Editar Cliente"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onDelete(client.id)}
                className="text-red-600 hover:text-red-700"
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

