"use client"

import { memo } from "react"
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
import { Plus } from "lucide-react"
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

interface Client {
  id: string
  name: string
}

interface Project {
  id: string
  name: string
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
              <Select
                value={formData.clientId || ""}
                onValueChange={(value) => onFormChange("clientId", value || null)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um cliente (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="projectId">Projeto</Label>
              <Select
                value={formData.projectId || ""}
                onValueChange={(value) => onFormChange("projectId", value || null)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um projeto (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              <Input
                id="paymentMethod"
                placeholder="PIX, Boleto, etc."
                value={formData.paymentMethod}
                onChange={(e) => onFormChange("paymentMethod", e.target.value)}
              />
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

