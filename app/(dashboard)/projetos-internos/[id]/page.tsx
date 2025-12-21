"use client"

import { useEffect, useState, useCallback, use } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Plus } from "lucide-react"
import { HuntlyLoading, HuntlyBadge } from "@/components/huntly-ui"
import { InternalKanban } from "./components/internal-kanban"
import { InternalTaskForm } from "./components/internal-task-form"
import { InternalTransactions } from "./components/internal-transactions"

interface InternalTask {
  id: string
  title: string
  description?: string | null
  status: string
  priority: string
  dueDate?: string | null
  completedAt?: string | null
  estimatedHours?: number | null
  actualHours?: number | null
  order: number
  storyId?: string | null
}

interface Transaction {
  id: string
  type: string
  category: string
  amount: number
  description: string
  date: string
  paymentMethod?: string | null
  notes?: string | null
}

interface InternalProject {
  id: string
  name: string
  description?: string | null
  status: string
  tasks: InternalTask[]
  transactions: Transaction[]
  _count: {
    tasks: number
    transactions: number
  }
}

export default function InternalProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [project, setProject] = useState<InternalProject | null>(null)
  const [loading, setLoading] = useState(true)

  // Dialog states
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<InternalTask | null>(null)

  const fetchProject = useCallback(async () => {
    try {
      const response = await fetch(`/api/projetos-internos/${resolvedParams.id}`)
      if (response.ok) {
        const data = await response.json()
        setProject(data)
      } else {
        const errorData = await response.json().catch(() => ({}))
        console.error("Error fetching project:", response.status, errorData)
        router.push("/projetos-internos")
      }
    } catch (error) {
      console.error("Error fetching project:", error)
      router.push("/projetos-internos")
    } finally {
      setLoading(false)
    }
  }, [resolvedParams.id, router])

  useEffect(() => {
    fetchProject()
  }, [fetchProject])

  const handleTaskMove = useCallback(
    async (taskId: string, newStatus: string, newOrder: number) => {
      if (!project) return

      // Optimistic update
      const originalTasks = [...project.tasks]
      setProject((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          tasks: prev.tasks.map((t) =>
            t.id === taskId ? { ...t, status: newStatus } : t
          ),
        }
      })

      try {
        const response = await fetch(
          `/api/projetos-internos/${resolvedParams.id}/tasks/reorder`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ taskId, newStatus, newOrder }),
          }
        )

        if (response.ok) {
          fetchProject()
        } else {
          // Revert on failure
          setProject((prev) =>
            prev ? { ...prev, tasks: originalTasks } : prev
          )
        }
      } catch (error) {
        console.error("Error moving task:", error)
        setProject((prev) =>
          prev ? { ...prev, tasks: originalTasks } : prev
        )
      }
    },
    [project, resolvedParams.id, fetchProject]
  )

  const handleTaskClick = useCallback((task: InternalTask) => {
    setEditingTask(task)
    setIsTaskFormOpen(true)
  }, [])

  const handleAddTask = useCallback(() => {
    setEditingTask(null)
    setIsTaskFormOpen(true)
  }, [])

  const handleTaskFormSuccess = useCallback(() => {
    setIsTaskFormOpen(false)
    setEditingTask(null)
    fetchProject()
  }, [fetchProject])

  if (loading) {
    return <HuntlyLoading text="Carregando projeto..." />
  }

  if (!project) {
    return null
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/projetos-internos")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-foreground">
                  {project.name}
                </h1>
                <HuntlyBadge
                  variant={project.status === "ACTIVE" ? "success" : "default"}
                >
                  {project.status === "ACTIVE" ? "Ativo" : "Arquivado"}
                </HuntlyBadge>
              </div>
              {project.description && (
                <p className="text-muted-foreground mt-1">
                  {project.description}
                </p>
              )}
            </div>
          </div>
          <Button
            onClick={handleAddTask}
            className="gap-2 bg-white text-black hover:bg-zinc-200"
          >
            <Plus className="h-4 w-4" />
            Nova Tarefa
          </Button>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="kanban" className="w-full">
          <TabsList className="mb-4 bg-muted/50">
            <TabsTrigger value="kanban">Kanban</TabsTrigger>
            <TabsTrigger value="financeiro">Financeiro</TabsTrigger>
          </TabsList>

          <TabsContent value="kanban">
            <InternalKanban
              tasks={project.tasks}
              onTaskMove={handleTaskMove}
              onTaskClick={handleTaskClick}
              onAddTask={handleAddTask}
            />
          </TabsContent>

          <TabsContent value="financeiro">
            <InternalTransactions
              projectId={project.id}
              transactions={project.transactions}
              onRefresh={fetchProject}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Task Form Dialog */}
      <InternalTaskForm
        isOpen={isTaskFormOpen}
        onClose={() => {
          setIsTaskFormOpen(false)
          setEditingTask(null)
        }}
        onSuccess={handleTaskFormSuccess}
        projectId={resolvedParams.id}
        editingTask={editingTask}
      />
    </>
  )
}
