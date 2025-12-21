"use client"

import { useEffect, useState, useCallback, useMemo } from "react"
import {
  SectionHeader,
  HuntlyCard,
  HuntlyCardHeader,
  HuntlyCardContent,
  HuntlyLoading,
} from "@/components/huntly-ui"
import { InternalProjectsStats } from "./components/internal-projects-stats"
import { InternalProjectsList } from "./components/internal-projects-list"
import { InternalProjectFormDialog } from "./components/internal-project-form-dialog"

interface InternalProject {
  id: string
  name: string
  description?: string | null
  status: string
  icon?: string | null
  color?: string | null
  createdAt: string
  _count?: {
    transactions: number
    tasks: number
  }
  financials?: {
    totalIncome: number
    totalExpense: number
    profit: number
  }
}

export default function ProjetosInternosPage() {
  const [projects, setProjects] = useState<InternalProject[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<InternalProject | null>(null)

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: "ACTIVE",
    color: "",
  })

  const fetchProjects = useCallback(async () => {
    try {
      const response = await fetch("/api/projetos-internos")
      const data = await response.json()
      if (Array.isArray(data)) {
        setProjects(data)
      }
    } catch (error) {
      console.error("Error fetching internal projects:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  const resetForm = useCallback(() => {
    setEditingProject(null)
    setFormData({
      name: "",
      description: "",
      status: "ACTIVE",
      color: "",
    })
  }, [])

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()

      try {
        const url = editingProject
          ? `/api/projetos-internos/${editingProject.id}`
          : "/api/projetos-internos"
        const method = editingProject ? "PUT" : "POST"

        const response = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        })

        if (response.ok) {
          setIsDialogOpen(false)
          resetForm()
          fetchProjects()
        } else {
          const error = await response.json()
          alert(error.error || "Erro ao salvar projeto")
        }
      } catch (error) {
        console.error("Error saving internal project:", error)
        alert("Erro ao salvar projeto")
      }
    },
    [editingProject, formData, fetchProjects, resetForm]
  )

  const handleDelete = useCallback(
    async (id: string) => {
      if (!confirm("Tem certeza que deseja excluir este projeto?")) return

      try {
        const response = await fetch(`/api/projetos-internos/${id}`, {
          method: "DELETE",
        })

        if (response.ok) {
          fetchProjects()
        } else {
          const error = await response.json()
          alert(error.error || "Erro ao excluir projeto")
        }
      } catch (error) {
        console.error("Error deleting internal project:", error)
        alert("Erro ao excluir projeto")
      }
    },
    [fetchProjects]
  )

  const handleArchive = useCallback(
    async (id: string) => {
      const project = projects.find((p) => p.id === id)
      if (!project) return

      const newStatus = project.status === "ACTIVE" ? "ARCHIVED" : "ACTIVE"

      try {
        const response = await fetch(`/api/projetos-internos/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        })

        if (response.ok) {
          fetchProjects()
        } else {
          const error = await response.json()
          alert(error.error || "Erro ao atualizar projeto")
        }
      } catch (error) {
        console.error("Error updating internal project:", error)
        alert("Erro ao atualizar projeto")
      }
    },
    [projects, fetchProjects]
  )

  const handleEdit = useCallback((project: InternalProject) => {
    setEditingProject(project)
    setFormData({
      name: project.name,
      description: project.description || "",
      status: project.status,
      color: project.color || "",
    })
    setIsDialogOpen(true)
  }, [])

  const handleFormChange = useCallback((field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }, [])

  const handleDialogChange = useCallback(
    (open: boolean) => {
      setIsDialogOpen(open)
      if (!open) {
        resetForm()
      }
    },
    [resetForm]
  )

  // Stats calculations
  const totalProjects = projects.length
  const activeProjects = useMemo(
    () => projects.filter((p) => p.status === "ACTIVE").length,
    [projects]
  )
  const totalIncome = useMemo(
    () => projects.reduce((sum, p) => sum + (p.financials?.totalIncome || 0), 0),
    [projects]
  )
  const totalExpense = useMemo(
    () => projects.reduce((sum, p) => sum + (p.financials?.totalExpense || 0), 0),
    [projects]
  )
  const totalProfit = useMemo(
    () => projects.reduce((sum, p) => sum + (p.financials?.profit || 0), 0),
    [projects]
  )

  if (loading) {
    return <HuntlyLoading text="Carregando projetos internos..." />
  }

  return (
    <div className="space-y-8">
      <SectionHeader
        label="Interno"
        title="Projetos"
        titleBold="Internos"
        action={
          <InternalProjectFormDialog
            isOpen={isDialogOpen}
            onOpenChange={handleDialogChange}
            editingProject={editingProject}
            formData={formData}
            onFormChange={handleFormChange}
            onSubmit={handleSubmit}
          />
        }
      />

      <InternalProjectsStats
        totalProjects={totalProjects}
        activeProjects={activeProjects}
        totalIncome={totalIncome}
        totalExpense={totalExpense}
        totalProfit={totalProfit}
      />

      <HuntlyCard>
        <HuntlyCardHeader
          title="Lista de Projetos Internos"
          description={`${projects.length} projetos`}
        />
        <HuntlyCardContent className="p-0">
          <InternalProjectsList
            projects={projects}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onArchive={handleArchive}
          />
        </HuntlyCardContent>
      </HuntlyCard>
    </div>
  )
}
