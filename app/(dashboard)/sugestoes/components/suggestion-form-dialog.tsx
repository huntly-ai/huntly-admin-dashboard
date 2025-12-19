"use client"

import { memo, useState, useCallback } from "react"
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

const categoryLabels: Record<string, string> = {
  FINANCEIRO: "Financeiro",
  GESTAO: "Gestão",
  PROJETOS: "Projetos",
  EQUIPE: "Equipe",
  PROCESSOS: "Processos",
  TECNOLOGIA: "Tecnologia",
  OUTRO: "Outro",
}

interface SuggestionFormDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

function SuggestionFormDialogComponent({
  isOpen,
  onOpenChange,
  onSuccess,
}: SuggestionFormDialogProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const resetForm = useCallback(() => {
    setFormData({
      title: "",
      description: "",
      category: "",
    })
  }, [])

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      setIsSubmitting(true)

      try {
        const response = await fetch("/api/sugestoes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        })

        if (response.ok) {
          onOpenChange(false)
          resetForm()
          onSuccess()
        } else {
          const error = await response.json()
          alert(error.error || "Erro ao criar sugestão")
        }
      } catch (error) {
        console.error("Error creating suggestion:", error)
        alert("Erro ao criar sugestão")
      } finally {
        setIsSubmitting(false)
      }
    },
    [formData, onOpenChange, onSuccess, resetForm]
  )

  const handleDialogChange = useCallback(
    (open: boolean) => {
      onOpenChange(open)
      if (!open) {
        resetForm()
      }
    },
    [onOpenChange, resetForm]
  )

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nova Sugestão
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Nova Sugestão</DialogTitle>
          <DialogDescription>
            Compartilhe sua ideia com a equipe
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="category">Área *</Label>
            <Select
              value={formData.category}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, category: value }))
              }
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a área" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(categoryLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              placeholder="Resumo da sua sugestão"
              required
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição *</Label>
            <Textarea
              id="description"
              placeholder="Descreva sua sugestão em detalhes..."
              required
              rows={5}
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, description: e.target.value }))
              }
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleDialogChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Enviando..." : "Publicar Sugestão"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export const SuggestionFormDialog = memo(SuggestionFormDialogComponent)
