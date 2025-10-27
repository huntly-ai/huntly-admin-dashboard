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

interface FormData {
  name: string
  description: string
  leadId: string
  memberIds: string[]
}

interface TeamFormDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  editingTeam: { id: string; name: string } | null
  formData: FormData
  members: Member[]
  onFormChange: (field: keyof FormData, value: string) => void
  onMemberToggle: (memberId: string) => void
  onSubmit: (e: React.FormEvent) => void
}

function TeamFormDialogComponent({
  isOpen,
  onOpenChange,
  editingTeam,
  formData,
  members,
  onFormChange,
  onMemberToggle,
  onSubmit,
}: TeamFormDialogProps) {
  const activeMembers = members.filter(m => m)

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Novo Time
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingTeam ? "Editar Time" : "Novo Time"}
          </DialogTitle>
          <DialogDescription>
            Preencha os dados do time abaixo
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Time *</Label>
            <Input
              id="name"
              placeholder="Time de Desenvolvimento Backend"
              required
              value={formData.name}
              onChange={(e) => onFormChange("name", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              placeholder="Descrição do time e suas responsabilidades"
              rows={3}
              value={formData.description}
              onChange={(e) => onFormChange("description", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="leadId">Líder do Time</Label>
            <Select
              value={formData.leadId}
              onValueChange={(value) => onFormChange("leadId", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um líder (opcional)" />
              </SelectTrigger>
              <SelectContent>
                {activeMembers.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.name} - {roleLabels[member.role]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Membros do Time</Label>
            <div className="border rounded-md p-3 max-h-60 overflow-y-auto">
              {activeMembers.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">
                  Nenhum membro disponível. Cadastre membros primeiro.
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {activeMembers.map((member) => (
                    <label
                      key={member.id}
                      className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                    >
                      <input
                        type="checkbox"
                        checked={formData.memberIds.includes(member.id)}
                        onChange={() => onMemberToggle(member.id)}
                        className="rounded"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{member.name}</p>
                        <p className="text-xs text-gray-500">
                          {roleLabels[member.role]}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500">
              Selecione os membros que farão parte deste time
            </p>
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
              {editingTeam ? "Atualizar" : "Criar"} Time
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export const TeamFormDialog = memo(TeamFormDialogComponent)

