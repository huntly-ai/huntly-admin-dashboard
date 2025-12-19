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
import { formatCurrencyInput } from "@/lib/utils/formatters"
import { projectStatusLabels, priorityLabels, billingTypeLabels } from "@/lib/design-tokens"

interface Client {
  id: string
  name: string
  company?: string
}

interface Member {
  id: string
  name: string
  role: string
}

interface Team {
  id: string
  name: string
}

interface FormData {
  name: string
  description: string
  status: string
  priority: string
  billingType: string
  projectValue: string
  hourlyRate: string
  startDate: string
  endDate: string
  deadline: string
  clientId: string
  teamMembers: string
  notes: string
}

interface ProjectFormDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  editingProject: { id: string; name: string } | null
  formData: FormData
  clients: Client[]
  members: Member[]
  teams: Team[]
  selectedMemberIds: string[]
  selectedTeamIds: string[]
  onFormChange: (field: keyof FormData, value: string) => void
  onMemberToggle: (memberId: string) => void
  onTeamToggle: (teamId: string) => void
  onSubmit: (e: React.FormEvent) => void
}

function ProjectFormDialogComponent({
  isOpen,
  onOpenChange,
  editingProject,
  formData,
  clients,
  members,
  teams,
  selectedMemberIds,
  selectedTeamIds,
  onFormChange,
  onMemberToggle,
  onTeamToggle,
  onSubmit,
}: ProjectFormDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Novo Projeto
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-card border-border">
        <DialogHeader>
          <DialogTitle>
            {editingProject ? "Editar Projeto" : "Novo Projeto"}
          </DialogTitle>
          <DialogDescription>
            Preencha os dados do projeto abaixo
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Projeto *</Label>
            <Input
              id="name"
              placeholder="Nome do projeto"
              required
              value={formData.name}
              onChange={(e) => onFormChange("name", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              placeholder="Descrição do projeto"
              rows={3}
              value={formData.description}
              onChange={(e) => onFormChange("description", e.target.value)}
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
                    {client.name} {client.company && `(${client.company})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
                  {Object.entries(projectStatusLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">Prioridade</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => onFormChange("priority", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(priorityLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="billingType">Tipo de Cobrança *</Label>
            <Select
              value={formData.billingType}
              onValueChange={(value) => onFormChange("billingType", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(billingTypeLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {formData.billingType === "FIXED_PRICE" ? (
            <div className="space-y-2">
              <Label htmlFor="projectValue">Valor do Projeto (R$) *</Label>
              <Input
                id="projectValue"
                placeholder="R$ 0,00"
                required
                value={formatCurrencyInput(formData.projectValue)}
                onChange={(e) => {
                  const onlyNumbers = e.target.value.replace(/\D/g, "")
                  onFormChange("projectValue", onlyNumbers)
                }}
              />
              <p className="text-sm text-muted-foreground">
                Valor total cobrado do cliente por este projeto
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="hourlyRate">Valor por Hora (R$) *</Label>
              <Input
                id="hourlyRate"
                placeholder="R$ 0,00"
                required
                value={formatCurrencyInput(formData.hourlyRate)}
                onChange={(e) => {
                  const onlyNumbers = e.target.value.replace(/\D/g, "")
                  onFormChange("hourlyRate", onlyNumbers)
                }}
              />
              <p className="text-sm text-muted-foreground">
                O valor total será calculado com base nas horas trabalhadas nas tasks
              </p>
            </div>
          )}

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Data de Início</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => onFormChange("startDate", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="deadline">Prazo</Label>
              <Input
                id="deadline"
                type="date"
                value={formData.deadline}
                onChange={(e) => onFormChange("deadline", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">Data de Conclusão</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => onFormChange("endDate", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-base font-semibold">Membros da Equipe</Label>
              <div className="border border-border rounded-lg p-4 max-h-48 overflow-y-auto bg-secondary">
                {members.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhum membro cadastrado</p>
                ) : (
                  <div className="space-y-3">
                    {members.map((member) => (
                      <div key={member.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`member-${member.id}`}
                          checked={selectedMemberIds.includes(member.id)}
                          onCheckedChange={() => onMemberToggle(member.id)}
                        />
                        <Label
                          htmlFor={`member-${member.id}`}
                          className="text-sm font-normal cursor-pointer"
                        >
                          {member.name} <span className="text-muted-foreground">({member.role})</span>
                        </Label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-base font-semibold">Times Alocados</Label>
              <div className="border border-border rounded-lg p-4 max-h-48 overflow-y-auto bg-secondary">
                {teams.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhum time cadastrado</p>
                ) : (
                  <div className="space-y-3">
                    {teams.map((team) => (
                      <div key={team.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`team-${team.id}`}
                          checked={selectedTeamIds.includes(team.id)}
                          onCheckedChange={() => onTeamToggle(team.id)}
                        />
                        <Label
                          htmlFor={`team-${team.id}`}
                          className="text-sm font-normal cursor-pointer"
                        >
                          {team.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              placeholder="Observações e anotações sobre o projeto"
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
              {editingProject ? "Atualizar" : "Criar"} Projeto
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export const ProjectFormDialog = memo(ProjectFormDialogComponent)

