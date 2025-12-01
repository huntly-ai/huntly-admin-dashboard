"use client"

import { useState, useEffect, useCallback } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { X } from "lucide-react"

interface Member {
  id: string
  name: string
  email: string
  role: string
  avatar?: string
}

interface Team {
  id: string
  name: string
}

interface TaskMember {
  member: Member
}

interface TaskTeam {
  team: Team
}

interface Task {
  id: string
  title: string
  description?: string
  status: string
  priority: string
  dueDate?: string
  completedAt?: string
  estimatedHours?: number
  actualHours?: number
  tags?: string
  order: number
  taskMembers?: TaskMember[]
  taskTeams?: TaskTeam[]
  createdAt: string
  updatedAt: string
}

interface TaskFormDialogProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  projectId: string
  editingTask: Task | null
  members: Member[]
  teams: Team[]
  storyId?: string
}

export function TaskFormDialog({
  isOpen,
  onClose,
  onSuccess,
  projectId,
  editingTask,
  members,
  teams,
  storyId,
}: TaskFormDialogProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "TODO",
    priority: "MEDIUM",
    dueDate: "",
    estimatedHours: "",
    actualHours: "",
  })
  const [tagInput, setTagInput] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([])
  const [selectedTeamIds, setSelectedTeamIds] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Reset form when dialog opens/closes or editing task changes
  useEffect(() => {
    if (isOpen && editingTask) {
      // Editing mode
      setFormData({
        title: editingTask.title,
        description: editingTask.description || "",
        status: editingTask.status,
        priority: editingTask.priority,
        dueDate: editingTask.dueDate ? editingTask.dueDate.slice(0, 16) : "",
        estimatedHours: editingTask.estimatedHours?.toString() || "",
        actualHours: editingTask.actualHours?.toString() || "",
      })
      setTags(editingTask.tags ? JSON.parse(editingTask.tags) : [])
      setSelectedMemberIds(editingTask.taskMembers?.map(tm => tm.member.id) || [])
      setSelectedTeamIds(editingTask.taskTeams?.map(tt => tt.team.id) || [])
    } else if (isOpen) {
      // Create mode
      setFormData({
        title: "",
        description: "",
        status: "TODO",
        priority: "MEDIUM",
        dueDate: "",
        estimatedHours: "",
        actualHours: "",
      })
      setTags([])
      setSelectedMemberIds([])
      setSelectedTeamIds([])
    }
  }, [isOpen, editingTask])

  const handleInputChange = useCallback((field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }, [])

  const handleAddTag = useCallback(() => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags(prev => [...prev, tagInput.trim()])
      setTagInput("")
    }
  }, [tagInput, tags])

  const handleRemoveTag = useCallback((tagToRemove: string) => {
    setTags(prev => prev.filter(tag => tag !== tagToRemove))
  }, [])

  const handleMemberToggle = useCallback((memberId: string) => {
    setSelectedMemberIds(prev =>
      prev.includes(memberId)
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    )
  }, [])

  const handleTeamToggle = useCallback((teamId: string) => {
    setSelectedTeamIds(prev =>
      prev.includes(teamId)
        ? prev.filter(id => id !== teamId)
        : [...prev, teamId]
    )
  }, [])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const url = editingTask
        ? `/api/projetos/${projectId}/tasks/${editingTask.id}`
        : `/api/projetos/${projectId}/tasks`
      const method = editingTask ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          tags: tags.length > 0 ? tags : null,
          memberIds: selectedMemberIds,
          teamIds: selectedTeamIds,
          storyId: storyId || null,
        }),
      })

      if (response.ok) {
        onSuccess()
      } else {
        const error = await response.json()
        alert(error.error || "Erro ao salvar task")
      }
    } catch (error) {
      console.error("Error saving task:", error)
      alert("Erro ao salvar task")
    } finally {
      setIsSubmitting(false)
    }
  }, [formData, tags, selectedMemberIds, selectedTeamIds, editingTask, projectId, onSuccess])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingTask ? "Editar Task" : "Nova Task"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium">
              Título *
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              required
              placeholder="Digite o título da task"
              className="w-full"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Descrição
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Digite a descrição da task"
              rows={4}
              className="w-full"
            />
          </div>

          {/* Status and Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status" className="text-sm font-medium">
                Status
              </Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleInputChange("status", value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TODO">A Fazer</SelectItem>
                  <SelectItem value="IN_PROGRESS">Em Progresso</SelectItem>
                  <SelectItem value="IN_REVIEW">Em Revisão</SelectItem>
                  <SelectItem value="DONE">Concluído</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority" className="text-sm font-medium">
                Prioridade
              </Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => handleInputChange("priority", value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Baixa</SelectItem>
                  <SelectItem value="MEDIUM">Média</SelectItem>
                  <SelectItem value="HIGH">Alta</SelectItem>
                  <SelectItem value="URGENT">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Due Date */}
          <div className="space-y-2">
            <Label htmlFor="dueDate" className="text-sm font-medium">
              Data de Entrega
            </Label>
            <Input
              id="dueDate"
              type="datetime-local"
              value={formData.dueDate}
              onChange={(e) => handleInputChange("dueDate", e.target.value)}
              className="w-full"
            />
          </div>

          {/* Hours */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="estimatedHours" className="text-sm font-medium">
                Horas Estimadas
              </Label>
              <Input
                id="estimatedHours"
                type="number"
                step="0.5"
                min="0"
                value={formData.estimatedHours}
                onChange={(e) => handleInputChange("estimatedHours", e.target.value)}
                placeholder="0"
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="actualHours" className="text-sm font-medium">
                Horas Trabalhadas
              </Label>
              <Input
                id="actualHours"
                type="number"
                step="0.5"
                min="0"
                value={formData.actualHours}
                onChange={(e) => handleInputChange("actualHours", e.target.value)}
                placeholder="0"
                className="w-full"
              />
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Tags</Label>
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    handleAddTag()
                  }
                }}
                placeholder="Digite uma tag e pressione Enter"
                className="flex-1"
              />
              <Button type="button" onClick={handleAddTag} variant="outline">
                Adicionar
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 px-3 py-1 rounded text-sm"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Members */}
          {members.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Membros Alocados</Label>
              <div className="border rounded-md p-3 max-h-40 overflow-y-auto space-y-2 bg-gray-50">
                {members.map((member) => (
                  <div key={member.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`member-${member.id}`}
                      checked={selectedMemberIds.includes(member.id)}
                      onCheckedChange={() => handleMemberToggle(member.id)}
                    />
                    <Label
                      htmlFor={`member-${member.id}`}
                      className="cursor-pointer flex-1 text-sm"
                    >
                      {member.name} - {member.role}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Teams */}
          {teams.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Times Alocados</Label>
              <div className="border rounded-md p-3 max-h-40 overflow-y-auto space-y-2 bg-gray-50">
                {teams.map((team) => (
                  <div key={team.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`team-${team.id}`}
                      checked={selectedTeamIds.includes(team.id)}
                      onCheckedChange={() => handleTeamToggle(team.id)}
                    />
                    <Label
                      htmlFor={`team-${team.id}`}
                      className="cursor-pointer flex-1 text-sm"
                    >
                      {team.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Salvando..." : editingTask ? "Atualizar" : "Criar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

