"use client"

import { useState, useCallback } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface EpicFormDialogProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  projectId: string
}

export function EpicFormDialog({
  isOpen,
  onClose,
  onSuccess,
  projectId,
}: EpicFormDialogProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "TODO",
    priority: "MEDIUM",
    startDate: "",
    endDate: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInputChange = useCallback((field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }, [])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/projetos/${projectId}/epics`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setFormData({
            title: "",
            description: "",
            status: "TODO",
            priority: "MEDIUM",
            startDate: "",
            endDate: "",
        })
        onSuccess()
      } else {
        const error = await response.json()
        alert(error.error || "Erro ao criar épico")
      }
    } catch (error) {
      console.error("Error creating epic:", error)
      alert("Erro ao criar épico")
    } finally {
      setIsSubmitting(false)
    }
  }, [formData, projectId, onSuccess])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Novo Épico</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              required
              placeholder="Ex: Módulo Financeiro"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Objetivo do épico..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleInputChange("status", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TODO">A Fazer</SelectItem>
                  <SelectItem value="IN_PROGRESS">Em Progresso</SelectItem>
                  <SelectItem value="DONE">Concluído</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Prioridade</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => handleInputChange("priority", value)}
              >
                <SelectTrigger>
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

          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
                <Label htmlFor="startDate">Início</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleInputChange("startDate", e.target.value)}
                />
             </div>
             <div className="space-y-2">
                <Label htmlFor="endDate">Fim</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => handleInputChange("endDate", e.target.value)}
                />
             </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Criando..." : "Criar Épico"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

