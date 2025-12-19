"use client"

import { memo, useMemo, useCallback } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus, X } from "lucide-react"
import { formatCurrencyInput } from "@/lib/utils/formatters"

const typeLabels: Record<string, string> = {
  INCOME: "Receita",
  EXPENSE: "Despesa",
}

const categoryLabels: Record<string, string> = {
  PROJECT_PAYMENT: "Pagamento de Projeto",
  CONSULTING: "Consultoria",
  LICENSE: "Licença",
  SUBSCRIPTION: "Assinatura",
  OTHER_INCOME: "Outra Receita",
  SALARIES: "Salários",
  INFRASTRUCTURE: "Infraestrutura",
  SOFTWARE: "Software",
  MARKETING: "Marketing",
  OFFICE: "Escritório",
  TAXES: "Impostos",
  OTHER_EXPENSE: "Outra Despesa",
}

const incomeCategories = [
  "PROJECT_PAYMENT",
  "CONSULTING",
  "LICENSE",
  "SUBSCRIPTION",
  "OTHER_INCOME",
]

const expenseCategories = [
  "SALARIES",
  "INFRASTRUCTURE",
  "SOFTWARE",
  "MARKETING",
  "OFFICE",
  "TAXES",
  "OTHER_EXPENSE",
]

const paymentMethods = [
  { value: "PIX", label: "PIX" },
  { value: "BOLETO", label: "Boleto" },
  { value: "CARTAO_CREDITO", label: "Cartão de Crédito" },
  { value: "CARTAO_DEBITO", label: "Cartão de Débito" },
  { value: "TRANSFERENCIA", label: "Transferência Bancária" },
  { value: "CRIPTO", label: "Cripto" },
  { value: "DINHEIRO", label: "Dinheiro" },
  { value: "OUTRO", label: "Outro" },
]

interface Client {
  id: string
  name: string
}

interface Project {
  id: string
  name: string
  client?: {
    id: string
    name: string
  } | null
}

interface FormData {
  type: string
  category: string
  amount: string
  description: string
  date: string
  clientId: string | null
  projectId: string | null
  invoiceNumber: string
  paymentMethod: string
  notes: string
}

interface TransactionFormDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  editingTransaction: { id: string; description: string } | null
  formData: FormData
  clients: Client[]
  projects: Project[]
  onFormChange: (field: keyof FormData, value: string | null) => void
  onSubmit: (e: React.FormEvent) => void
}

function TransactionFormDialogComponent({
  isOpen,
  onOpenChange,
  editingTransaction,
  formData,
  clients,
  projects,
  onFormChange,
  onSubmit,
}: TransactionFormDialogProps) {
  const availableCategories =
    formData.type === "INCOME" ? incomeCategories : expenseCategories

  // Filter projects based on selected client
  const filteredProjects = useMemo(() => {
    if (!formData.clientId) {
      return projects
    }
    return projects.filter((p) => p.client?.id === formData.clientId)
  }, [projects, formData.clientId])

  // Handle client change - reset project if not from same client
  const handleClientChange = useCallback(
    (value: string | null) => {
      onFormChange("clientId", value)
      // If a project is selected and doesn't belong to the new client, clear it
      if (formData.projectId && value) {
        const currentProject = projects.find((p) => p.id === formData.projectId)
        if (currentProject?.client?.id !== value) {
          onFormChange("projectId", null)
        }
      }
    },
    [onFormChange, formData.projectId, projects]
  )

  // Handle project change - auto-select client
  const handleProjectChange = useCallback(
    (value: string | null) => {
      onFormChange("projectId", value)
      if (value) {
        const selectedProject = projects.find((p) => p.id === value)
        if (selectedProject?.client?.id) {
          onFormChange("clientId", selectedProject.client.id)
        }
      }
    },
    [onFormChange, projects]
  )

  // Get selected names for display
  const selectedClientName = useMemo(() => {
    if (!formData.clientId) return null
    return clients.find((c) => c.id === formData.clientId)?.name
  }, [clients, formData.clientId])

  const selectedProjectName = useMemo(() => {
    if (!formData.projectId) return null
    return projects.find((p) => p.id === formData.projectId)?.name
  }, [projects, formData.projectId])

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nova Transação
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingTransaction ? "Editar Transação" : "Nova Transação"}
          </DialogTitle>
          <DialogDescription>
            Registre uma nova transação financeira
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Tipo *</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => {
                  onFormChange("type", value)
                  // Reset category when changing type
                  onFormChange("category", "")
                }}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(typeLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Categoria *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => onFormChange("category", value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  {availableCategories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {categoryLabels[cat]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Valor *</Label>
              <Input
                id="amount"
                placeholder="R$ 0,00"
                required
                value={formatCurrencyInput(formData.amount)}
                onChange={(e) => {
                  const onlyNumbers = e.target.value.replace(/\D/g, "")
                  onFormChange("amount", onlyNumbers)
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Data *</Label>
              <Input
                id="date"
                type="date"
                required
                value={formData.date}
                onChange={(e) => onFormChange("date", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição *</Label>
            <Input
              id="description"
              placeholder="Descrição da transação"
              required
              value={formData.description}
              onChange={(e) => onFormChange("description", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="clientId">Cliente</Label>
              <div className="flex gap-2">
                <Select
                  value={formData.clientId || "none"}
                  onValueChange={(value) =>
                    handleClientChange(value === "none" ? null : value)
                  }
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue>
                      {selectedClientName || "Selecione um cliente"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhum cliente</SelectItem>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formData.clientId && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="shrink-0"
                    onClick={() => handleClientChange(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="projectId">Projeto</Label>
              <div className="flex gap-2">
                <Select
                  value={formData.projectId || "none"}
                  onValueChange={(value) =>
                    handleProjectChange(value === "none" ? null : value)
                  }
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue>
                      {selectedProjectName || "Selecione um projeto"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhum projeto</SelectItem>
                    {filteredProjects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                        {project.client && !formData.clientId && (
                          <span className="text-muted-foreground ml-2">
                            ({project.client.name})
                          </span>
                        )}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formData.projectId && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="shrink-0"
                    onClick={() => handleProjectChange(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="invoiceNumber">Número da NF</Label>
              <Input
                id="invoiceNumber"
                placeholder="000123"
                value={formData.invoiceNumber}
                onChange={(e) => onFormChange("invoiceNumber", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="paymentMethod">Método de Pagamento</Label>
              <Select
                value={formData.paymentMethod || "none"}
                onValueChange={(value) =>
                  onFormChange("paymentMethod", value === "none" ? "" : value)
                }
              >
                <SelectTrigger>
                  <SelectValue>
                    {formData.paymentMethod
                      ? paymentMethods.find((m) => m.value === formData.paymentMethod)?.label || formData.paymentMethod
                      : "Selecione o método"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum</SelectItem>
                  {paymentMethods.map((method) => (
                    <SelectItem key={method.value} value={method.value}>
                      {method.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              placeholder="Observações adicionais"
              rows={3}
              value={formData.notes}
              onChange={(e) => onFormChange("notes", e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit">
              {editingTransaction ? "Atualizar" : "Criar"} Transação
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export const TransactionFormDialog = memo(TransactionFormDialogComponent)

