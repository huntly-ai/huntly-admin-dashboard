"use client"

import { memo } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { HuntlyLabel } from "@/components/huntly-ui"
import { Plus } from "lucide-react"

interface InternalProject {
  id: string
  name: string
  description?: string | null
  status: string
  icon?: string | null
  color?: string | null
}

interface InternalProjectFormDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  editingProject: InternalProject | null
  formData: {
    name: string
    description: string
    status: string
    color: string
  }
  onFormChange: (field: string, value: string) => void
  onSubmit: (e: React.FormEvent) => void
}

const PROJECT_COLORS = [
  { value: "", label: "Sem cor" },
  { value: "#ef4444", label: "Vermelho" },
  { value: "#f97316", label: "Laranja" },
  { value: "#eab308", label: "Amarelo" },
  { value: "#22c55e", label: "Verde" },
  { value: "#06b6d4", label: "Ciano" },
  { value: "#3b82f6", label: "Azul" },
  { value: "#8b5cf6", label: "Roxo" },
  { value: "#ec4899", label: "Rosa" },
]

export const InternalProjectFormDialog = memo(function InternalProjectFormDialog({
  isOpen,
  onOpenChange,
  editingProject,
  formData,
  onFormChange,
  onSubmit,
}: InternalProjectFormDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-white text-black hover:bg-zinc-200">
          <Plus className="h-4 w-4" />
          Novo Projeto
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="font-display">
            {editingProject ? "Editar Projeto Interno" : "Novo Projeto Interno"}
          </DialogTitle>
          <DialogDescription>
            {editingProject
              ? "Atualize as informações do projeto"
              : "Adicione um novo projeto interno para acompanhar receitas e despesas"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <HuntlyLabel htmlFor="name">Nome *</HuntlyLabel>
            <Input
              id="name"
              placeholder="Nome do projeto"
              value={formData.name}
              onChange={(e) => onFormChange("name", e.target.value)}
              className="bg-card border-border"
              required
            />
          </div>

          <div className="space-y-2">
            <HuntlyLabel htmlFor="description">Descrição</HuntlyLabel>
            <Textarea
              id="description"
              placeholder="Descrição do projeto"
              value={formData.description}
              onChange={(e) => onFormChange("description", e.target.value)}
              className="bg-card border-border min-h-[80px]"
            />
          </div>

          <div className="space-y-2">
            <HuntlyLabel htmlFor="status">Status</HuntlyLabel>
            <Select
              value={formData.status}
              onValueChange={(value) => onFormChange("status", value)}
            >
              <SelectTrigger className="bg-card border-border">
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIVE">Ativo</SelectItem>
                <SelectItem value="ARCHIVED">Arquivado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <HuntlyLabel>Cor</HuntlyLabel>
            <div className="flex flex-wrap gap-2">
              {PROJECT_COLORS.map((color) => (
                <button
                  key={color.value || "none"}
                  type="button"
                  onClick={() => onFormChange("color", color.value)}
                  className={`w-8 h-8 border-2 transition-all ${
                    formData.color === color.value
                      ? "border-white scale-110"
                      : "border-border hover:border-muted-foreground"
                  }`}
                  style={{
                    backgroundColor: color.value || "transparent",
                  }}
                  title={color.label}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-white text-black hover:bg-zinc-200"
            >
              {editingProject ? "Salvar" : "Criar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
})
