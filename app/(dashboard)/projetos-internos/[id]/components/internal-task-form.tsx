"use client"

import { memo, useState, useCallback, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { HuntlyLabel } from "@/components/huntly-ui"

interface InternalTask {
  id: string
  title: string
  description?: string | null
  status: string
  priority: string
  dueDate?: string | null
  estimatedHours?: number | null
  actualHours?: number | null
}

interface InternalTaskFormProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  projectId: string
  editingTask?: InternalTask | null
}

export const InternalTaskForm = memo(function InternalTaskForm({
  isOpen,
  onClose,
  onSuccess,
  projectId,
  editingTask,
}: InternalTaskFormProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "TODO",
    priority: "MEDIUM",
    dueDate: "",
    estimatedHours: "",
    actualHours: "",
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (editingTask) {
      setFormData({
        title: editingTask.title,
        description: editingTask.description || "",
        status: editingTask.status,
        priority: editingTask.priority,
        dueDate: editingTask.dueDate
          ? editingTask.dueDate.split("T")[0]
          : "",
        estimatedHours: editingTask.estimatedHours?.toString() || "",
        actualHours: editingTask.actualHours?.toString() || "",
      })
    } else {
      setFormData({
        title: "",
        description: "",
        status: "TODO",
        priority: "MEDIUM",
        dueDate: "",
        estimatedHours: "",
        actualHours: "",
      })
    }
  }, [editingTask, isOpen])

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      setLoading(true)

      try {
        const url = editingTask
          ? `/api/projetos-internos/${projectId}/tasks/${editingTask.id}`
          : `/api/projetos-internos/${projectId}/tasks`
        const method = editingTask ? "PUT" : "POST"

        const response = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...formData,
            estimatedHours: formData.estimatedHours || null,
            actualHours: formData.actualHours || null,
            dueDate: formData.dueDate || null,
          }),
        })

        if (response.ok) {
          onSuccess()
          onClose()
        } else {
          const error = await response.json()
          alert(error.error || "Erro ao salvar tarefa")
        }
      } catch (error) {
        console.error("Error saving task:", error)
        alert("Erro ao salvar tarefa")
      } finally {
        setLoading(false)
      }
    },
    [formData, editingTask, projectId, onSuccess, onClose]
  )

  const handleChange = useCallback(
    (field: string, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }))
    },
    []
  )

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="font-display">
            {editingTask ? "Editar Tarefa" : "Nova Tarefa"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <HuntlyLabel>Título *</HuntlyLabel>
            <Input
              value={formData.title}
              onChange={(e) => handleChange("title", e.target.value)}
              placeholder="Título da tarefa"
              className="bg-card border-border"
              required
            />
          </div>

          <div className="space-y-2">
            <HuntlyLabel>Descrição</HuntlyLabel>
            <Textarea
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Descrição da tarefa"
              className="bg-card border-border min-h-[80px]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <HuntlyLabel>Status</HuntlyLabel>
              <Select
                value={formData.status}
                onValueChange={(value) => handleChange("status", value)}
              >
                <SelectTrigger className="bg-card border-border">
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
              <HuntlyLabel>Prioridade</HuntlyLabel>
              <Select
                value={formData.priority}
                onValueChange={(value) => handleChange("priority", value)}
              >
                <SelectTrigger className="bg-card border-border">
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

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <HuntlyLabel>Data Limite</HuntlyLabel>
              <Input
                type="date"
                value={formData.dueDate}
                onChange={(e) => handleChange("dueDate", e.target.value)}
                className="bg-card border-border"
              />
            </div>

            <div className="space-y-2">
              <HuntlyLabel>Horas Estimadas</HuntlyLabel>
              <Input
                type="number"
                step="0.5"
                value={formData.estimatedHours}
                onChange={(e) => handleChange("estimatedHours", e.target.value)}
                placeholder="0"
                className="bg-card border-border"
              />
            </div>

            <div className="space-y-2">
              <HuntlyLabel>Horas Reais</HuntlyLabel>
              <Input
                type="number"
                step="0.5"
                value={formData.actualHours}
                onChange={(e) => handleChange("actualHours", e.target.value)}
                placeholder="0"
                className="bg-card border-border"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-white text-black hover:bg-zinc-200"
            >
              {loading ? "Salvando..." : editingTask ? "Salvar" : "Criar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
})
