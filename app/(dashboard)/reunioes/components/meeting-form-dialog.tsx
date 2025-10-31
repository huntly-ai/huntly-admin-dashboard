"use client"

import { useEffect, useState, memo } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
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

interface Meeting {
  id?: string
  title: string
}

interface Lead {
  id: string
  name: string
}

interface Client {
  id: string
  name: string
}

interface TeamMember {
  id: string
  name: string
}

interface Team {
  id: string
  name: string
}

interface FormData {
  title: string
  description: string
  startDate: string
  startTime: string
  endDate: string
  endTime: string
  location: string
  leadId: string
  clientId: string
  memberIds: string[]
  teamIds: string[]
  tags: string
  notes: string
  status: string
}

interface MeetingFormDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  editingMeeting: Meeting | null
  formData: FormData
  onFormChange: (field: keyof FormData, value: string | string[]) => void
  onSubmit: (e: React.FormEvent) => void
}

function MeetingFormDialogComponent({
  isOpen,
  onOpenChange,
  editingMeeting,
  formData,
  onFormChange,
  onSubmit,
}: MeetingFormDialogProps) {
  const [leads, setLeads] = useState<Lead[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [members, setMembers] = useState<TeamMember[]>([])
  const [teams, setTeams] = useState<Team[]>([])

  useEffect(() => {
    if (isOpen) {
      Promise.all([
        fetch("/api/leads").then(r => r.json()),
        fetch("/api/clientes").then(r => r.json()),
        fetch("/api/membros").then(r => r.json()),
        fetch("/api/times").then(r => r.json()),
      ]).then(([leadsData, clientsData, membersData, teamsData]) => {
        setLeads(leadsData)
        setClients(clientsData)
        setMembers(membersData)
        setTeams(teamsData)
      })
    }
  }, [isOpen])

  const handleMemberToggle = (memberId: string) => {
    const newMemberIds = formData.memberIds.includes(memberId)
      ? formData.memberIds.filter(id => id !== memberId)
      : [...formData.memberIds, memberId]
    onFormChange("memberIds", newMemberIds)
  }

  const handleTeamToggle = (teamId: string) => {
    const newTeamIds = formData.teamIds.includes(teamId)
      ? formData.teamIds.filter(id => id !== teamId)
      : [...formData.teamIds, teamId]
    onFormChange("teamIds", newTeamIds)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <Button onClick={() => onOpenChange(true)} className="gap-2">
        <Plus className="h-4 w-4" />
        {editingMeeting ? "Editar Reunião" : "Nova Reunião"}
      </Button>

      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingMeeting ? "Editar Reunião" : "Criar Nova Reunião"}
          </DialogTitle>
          <DialogDescription>
            {editingMeeting
              ? "Atualize os detalhes da reunião"
              : "Preencha os dados da nova reunião"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          {/* Título */}
          <div className="space-y-2">
            <Label htmlFor="title">Título da Reunião *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => onFormChange("title", e.target.value)}
              placeholder="Ex: Reunião com cliente X"
              required
            />
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => onFormChange("description", e.target.value)}
              placeholder="Descreva o propósito da reunião"
              rows={3}
            />
          </div>

          {/* Data e Hora Início */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Data de Início *</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => onFormChange("startDate", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="startTime">Hora de Início *</Label>
              <Input
                id="startTime"
                type="time"
                value={formData.startTime}
                onChange={(e) => onFormChange("startTime", e.target.value)}
                required
              />
            </div>
          </div>

          {/* Data e Hora Fim */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="endDate">Data de Fim</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => onFormChange("endDate", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime">Hora de Fim</Label>
              <Input
                id="endTime"
                type="time"
                value={formData.endTime}
                onChange={(e) => onFormChange("endTime", e.target.value)}
              />
            </div>
          </div>

          {/* Local */}
          <div className="space-y-2">
            <Label htmlFor="location">Local / Link da Videoconferência</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => onFormChange("location", e.target.value)}
              placeholder="Ex: Sala 301 ou https://meet.google.com/..."
            />
          </div>

          {/* Lead ou Cliente */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="leadId">Lead</Label>
              <Select value={formData.leadId} onValueChange={(value) => onFormChange("leadId", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um lead" />
                </SelectTrigger>
                <SelectContent>
                  {leads.map((lead) => (
                    <SelectItem key={lead.id} value={lead.id}>
                      {lead.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="clientId">Cliente</Label>
              <Select value={formData.clientId} onValueChange={(value) => onFormChange("clientId", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um cliente" />
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
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(value) => onFormChange("status", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SCHEDULED">Agendada</SelectItem>
                <SelectItem value="IN_PROGRESS">Em Progresso</SelectItem>
                <SelectItem value="COMPLETED">Concluída</SelectItem>
                <SelectItem value="CANCELLED">Cancelada</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags">Tags (separadas por vírgula)</Label>
            <Input
              id="tags"
              value={formData.tags}
              onChange={(e) => onFormChange("tags", e.target.value)}
              placeholder="Ex: comercial, importante, urgente"
            />
          </div>

          {/* Membros */}
          <div className="space-y-3">
            <Label>Membros da Equipe</Label>
            <div className="border rounded-lg p-3 space-y-2 max-h-40 overflow-y-auto">
              {members.length > 0 ? (
                members.map((member) => (
                  <div key={member.id} className="flex items-center gap-2">
                    <Checkbox
                      id={`member-${member.id}`}
                      checked={formData.memberIds.includes(member.id)}
                      onCheckedChange={() => handleMemberToggle(member.id)}
                    />
                    <Label htmlFor={`member-${member.id}`} className="cursor-pointer">
                      {member.name}
                    </Label>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">Nenhum membro disponível</p>
              )}
            </div>
          </div>

          {/* Times */}
          <div className="space-y-3">
            <Label>Times</Label>
            <div className="border rounded-lg p-3 space-y-2 max-h-40 overflow-y-auto">
              {teams.length > 0 ? (
                teams.map((team) => (
                  <div key={team.id} className="flex items-center gap-2">
                    <Checkbox
                      id={`team-${team.id}`}
                      checked={formData.teamIds.includes(team.id)}
                      onCheckedChange={() => handleTeamToggle(team.id)}
                    />
                    <Label htmlFor={`team-${team.id}`} className="cursor-pointer">
                      {team.name}
                    </Label>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">Nenhum time disponível</p>
              )}
            </div>
          </div>

          {/* Notas */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notas Adicionais</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => onFormChange("notes", e.target.value)}
              placeholder="Adicione observações ou notas importantes"
              rows={3}
            />
          </div>

          {/* Botões */}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              {editingMeeting ? "Atualizar" : "Criar"} Reunião
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export const MeetingFormDialog = memo(MeetingFormDialogComponent)
