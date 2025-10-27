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
import { PaymentForm } from "./payment-form"

const statusLabels: Record<string, string> = {
  DRAFT: "Rascunho",
  ACTIVE: "Ativo",
  COMPLETED: "Concluído",
  CANCELLED: "Cancelado",
  SUSPENDED: "Suspenso",
}

interface Client {
  id: string
  name: string
  company?: string
}

interface Project {
  id: string
  name: string
}

interface FormData {
  title: string
  contractNumber: string
  description: string
  totalValue: string
  startDate: string
  endDate: string
  signedDate: string
  status: string
  clientId: string
  projectIds: string[]
  terms: string
  notes: string
}

interface PaymentFormData {
  installmentNumber: number
  amount: string
  dueDate: string
}

interface ContractFormDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  editingContract: { id: string; title: string } | null
  formData: FormData
  payments: PaymentFormData[]
  clients: Client[]
  projects: Project[]
  onFormChange: (field: keyof FormData, value: string | string[]) => void
  onToggleProject: (projectId: string) => void
  onAddPayment: () => void
  onRemovePayment: (index: number) => void
  onUpdatePayment: (index: number, field: string, value: string | number) => void
  onSubmit: (e: React.FormEvent) => void
  onResetForm: () => void
}

function ContractFormDialogComponent({
  isOpen,
  onOpenChange,
  editingContract,
  formData,
  payments,
  clients,
  projects,
  onFormChange,
  onToggleProject,
  onAddPayment,
  onRemovePayment,
  onUpdatePayment,
  onSubmit,
  onResetForm,
}: ContractFormDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button onClick={onResetForm}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Contrato
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingContract ? "Editar Contrato" : "Novo Contrato"}
          </DialogTitle>
          <DialogDescription>
            Preencha os dados do contrato abaixo
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                placeholder="Nome do contrato"
                required
                value={formData.title}
                onChange={(e) => onFormChange("title", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="clientId">Cliente *</Label>
              <Select
                value={formData.clientId}
                onValueChange={(value) => onFormChange("clientId", value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name} {client.company ? `(${client.company})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              placeholder="Descrição detalhada do contrato"
              rows={3}
              value={formData.description}
              onChange={(e) => onFormChange("description", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="totalValue">Valor Total *</Label>
              <Input
                id="totalValue"
                placeholder="R$ 0,00"
                required
                value={formatCurrencyInput(formData.totalValue)}
                onChange={(e) => {
                  const onlyNumbers = e.target.value.replace(/\D/g, "")
                  onFormChange("totalValue", onlyNumbers)
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="startDate">Data Início *</Label>
              <Input
                id="startDate"
                type="date"
                required
                value={formData.startDate}
                onChange={(e) => onFormChange("startDate", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">Data Fim *</Label>
              <Input
                id="endDate"
                type="date"
                required
                value={formData.endDate}
                onChange={(e) => onFormChange("endDate", e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contractNumber">Número do Contrato *</Label>
              <Input
                id="contractNumber"
                placeholder="CONT-2024-001"
                required
                value={formData.contractNumber}
                onChange={(e) => onFormChange("contractNumber", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="signedDate">Data de Assinatura</Label>
              <Input
                id="signedDate"
                type="date"
                value={formData.signedDate}
                onChange={(e) => onFormChange("signedDate", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => onFormChange("status", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(statusLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Projects Selection */}
          <div className="space-y-2">
            <Label>Projetos Vinculados</Label>
            <div className="border rounded-md p-3 max-h-40 overflow-y-auto">
              {projects.filter(p => p).length === 0 && formData.clientId !== "" ? (
                <div className="grid grid-cols-2 gap-2">
                  {projects
                    .filter(p => p)
                    .map((project) => (
                      <label
                        key={project.id}
                        className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                      >
                        <input
                          type="checkbox"
                          checked={formData.projectIds.includes(project.id)}
                          onChange={() => onToggleProject(project.id)}
                          className="rounded"
                        />
                        <span className="text-sm">{project.name}</span>
                      </label>
                    ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  Selecione um cliente para ver os projetos disponíveis
                </p>
              )}
            </div>
          </div>

          {/* Payments */}
          <PaymentForm
            payments={payments}
            onAdd={onAddPayment}
            onRemove={onRemovePayment}
            onUpdate={onUpdatePayment}
          />

          <div className="space-y-2">
            <Label htmlFor="terms">Termos e Condições</Label>
            <Textarea
              id="terms"
              placeholder="Termos e condições do contrato"
              rows={3}
              value={formData.terms}
              onChange={(e) => onFormChange("terms", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              placeholder="Observações internas sobre o contrato"
              rows={2}
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
              {editingContract ? "Atualizar" : "Criar"} Contrato
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export const ContractFormDialog = memo(ContractFormDialogComponent)

