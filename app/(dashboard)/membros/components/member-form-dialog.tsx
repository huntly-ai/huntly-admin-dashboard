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
import { Checkbox } from "@/components/ui/checkbox"
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

const statusLabels: Record<string, string> = {
  ACTIVE: "Ativo",
  INACTIVE: "Inativo",
  ON_LEAVE: "De Férias",
}

interface FormData {
  name: string
  email: string
  phone: string
  role: string
  status: string
  department: string
  hireDate: string
  bio: string
  skills: string
  notes: string
}

interface MemberFormDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  editingMember: { id: string; name: string } | null
  formData: FormData
  selectedRoles: string[]
  onFormChange: (field: keyof FormData, value: string) => void
  onRoleToggle: (role: string) => void
  onSubmit: (e: React.FormEvent) => void
}

function MemberFormDialogComponent({
  isOpen,
  onOpenChange,
  editingMember,
  formData,
  selectedRoles,
  onFormChange,
  onRoleToggle,
  onSubmit,
}: MemberFormDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Novo Membro
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingMember ? "Editar Membro" : "Novo Membro"}
          </DialogTitle>
          <DialogDescription>
            {editingMember
              ? `Atualize as informações de ${editingMember.name}`
              : "Adicione um novo membro à equipe"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2">
              <Label htmlFor="name">Nome Completo *</Label>
              <Input
                id="name"
                placeholder="João da Silva"
                value={formData.name}
                onChange={(e) => onFormChange("name", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="joao@huntly.com"
                value={formData.email}
                onChange={(e) => onFormChange("email", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                placeholder="+55 (11) 98765-4321"
                value={formData.phone}
                onChange={(e) => onFormChange("phone", e.target.value)}
                maxLength={19}
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label>Cargos *</Label>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(roleLabels).map(([key, label]) => (
                <div key={key} className="flex items-center space-x-2">
                  <Checkbox
                    id={`role-${key}`}
                    checked={selectedRoles.includes(key)}
                    onCheckedChange={() => onRoleToggle(key)}
                  />
                  <label
                    htmlFor={`role-${key}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {label}
                  </label>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500">
              Selecione pelo menos um cargo. O primeiro será o cargo principal.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="department">Departamento</Label>
              <Input
                id="department"
                placeholder="Tecnologia"
                value={formData.department}
                onChange={(e) => onFormChange("department", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hireDate">Data de Contratação</Label>
              <Input
                id="hireDate"
                type="date"
                value={formData.hireDate}
                onChange={(e) => onFormChange("hireDate", e.target.value)}
              />
            </div>

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
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio / Sobre</Label>
            <Textarea
              id="bio"
              placeholder="Breve descrição sobre o membro"
              rows={2}
              value={formData.bio}
              onChange={(e) => onFormChange("bio", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="skills">Habilidades</Label>
            <Input
              id="skills"
              placeholder="React, Node.js, TypeScript, PostgreSQL"
              value={formData.skills}
              onChange={(e) => onFormChange("skills", e.target.value)}
            />
            <p className="text-xs text-gray-500">
              Separe as habilidades por vírgula
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Observações Internas</Label>
            <Textarea
              id="notes"
              placeholder="Observações sobre o membro"
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
              {editingMember ? "Atualizar" : "Criar"} Membro
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export const MemberFormDialog = memo(MemberFormDialogComponent)

