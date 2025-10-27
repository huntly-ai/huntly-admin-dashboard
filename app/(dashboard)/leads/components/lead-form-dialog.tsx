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

interface FormData {
  name: string
  email: string
  phone: string
  company: string
  position: string
  status: string
  source: string
  notes: string
  estimatedValue: string
}

interface LeadFormDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  editingLead: { id: string; name: string } | null
  formData: FormData
  onFormChange: (field: keyof FormData, value: string) => void
  onSubmit: (e: React.FormEvent) => void
}

function LeadFormDialogComponent({
  isOpen,
  onOpenChange,
  editingLead,
  formData,
  onFormChange,
  onSubmit,
}: LeadFormDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Novo Lead
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingLead ? "Editar Lead" : "Novo Lead"}
          </DialogTitle>
          <DialogDescription>
            Preencha os dados do lead abaixo
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                placeholder="Nome do lead"
                required
                value={formData.name}
                onChange={(e) => onFormChange("name", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone *</Label>
              <Input
                id="phone"
                placeholder="+55 (11) 98765-4321"
                required
                value={formData.phone}
                onChange={(e) => onFormChange("phone", e.target.value)}
                maxLength={19}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@exemplo.com"
                value={formData.email}
                onChange={(e) => onFormChange("email", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Empresa</Label>
              <Input
                id="company"
                placeholder="Nome da empresa"
                value={formData.company}
                onChange={(e) => onFormChange("company", e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="position">Cargo</Label>
              <Input
                id="position"
                placeholder="Cargo do lead"
                value={formData.position}
                onChange={(e) => onFormChange("position", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="estimatedValue">Valor Estimado</Label>
              <Input
                id="estimatedValue"
                placeholder="R$ 0,00"
                value={formatCurrencyInput(formData.estimatedValue)}
                onChange={(e) => {
                  const onlyNumbers = e.target.value.replace(/\D/g, "")
                  onFormChange("estimatedValue", onlyNumbers)
                }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => onFormChange("status", value)}
              >
                <SelectTrigger>
                  <SelectValue />
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
            <div className="space-y-2">
              <Label htmlFor="source">Origem</Label>
              <Select
                value={formData.source}
                onValueChange={(value) => onFormChange("source", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(sourceLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
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
              placeholder="Observações sobre o lead"
              rows={4}
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
              {editingLead ? "Atualizar" : "Criar"} Lead
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export const LeadFormDialog = memo(LeadFormDialogComponent)

