"use client"

import { useEffect, useState, useCallback, use } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Plus } from "lucide-react"
import { KanbanBoard } from "./components/kanban-board"
import { TaskFormDialog } from "./components/task-form-dialog"
import { TaskDetailDialog } from "./components/task-detail-dialog"

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

interface Project {
  id: string
  name: string
  description?: string
  status: string
  priority: string
  client: {
    id: string
    name: string
    company?: string
  }
}

export default function ProjectKanbanPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [project, setProject] = useState<Project | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)

  const fetchProject = useCallback(async () => {
    try {
      const response = await fetch(`/api/projetos/${resolvedParams.id}`)
      if (response.ok) {
        const data = await response.json()
        setProject(data)
      } else {
        console.error("Error fetching project")
        router.push("/projetos")
      }
    } catch (error) {
      console.error("Error fetching project:", error)
      router.push("/projetos")
    }
  }, [resolvedParams.id, router])

  const fetchTasks = useCallback(async () => {
    try {
      const response = await fetch(`/api/projetos/${resolvedParams.id}/tasks`)
      const data = await response.json()
      setTasks(data)
    } catch (error) {
      console.error("Error fetching tasks:", error)
    } finally {
      setLoading(false)
    }
  }, [resolvedParams.id])

  const fetchMembers = useCallback(async () => {
    try {
      const response = await fetch("/api/membros")
      const data = await response.json()
      setMembers(data)
    } catch (error) {
      console.error("Error fetching members:", error)
    }
  }, [])

  const fetchTeams = useCallback(async () => {
    try {
      const response = await fetch("/api/times")
      const data = await response.json()
      setTeams(data)
    } catch (error) {
      console.error("Error fetching teams:", error)
    }
  }, [])

  useEffect(() => {
    fetchProject()
    fetchTasks()
    fetchMembers()
    fetchTeams()
  }, [fetchProject, fetchTasks, fetchMembers, fetchTeams])

  const handleTaskMove = useCallback(async (taskId: string, newStatus: string, newOrder: number) => {
    try {
      const response = await fetch(`/api/projetos/${resolvedParams.id}/tasks/reorder`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId, newStatus, newOrder }),
      })

      if (response.ok) {
        const updatedTasks = await response.json()
        setTasks(updatedTasks)
      }
    } catch (error) {
      console.error("Error moving task:", error)
    }
  }, [resolvedParams.id])

  const handleTaskClick = useCallback((task: Task) => {
    setSelectedTask(task)
    setIsDetailDialogOpen(true)
  }, [])

  const handleEditTask = useCallback((task: Task) => {
    setEditingTask(task)
    setIsDetailDialogOpen(false)
    setIsFormDialogOpen(true)
  }, [])

  const handleDeleteTask = useCallback(async (taskId: string) => {
    if (!confirm("Tem certeza que deseja excluir esta task?")) return

    try {
      const response = await fetch(`/api/projetos/${resolvedParams.id}/tasks/${taskId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setTasks(prev => prev.filter(t => t.id !== taskId))
        setIsDetailDialogOpen(false)
      }
    } catch (error) {
      console.error("Error deleting task:", error)
    }
  }, [resolvedParams.id])

  const handleFormClose = useCallback(() => {
    setIsFormDialogOpen(false)
    setEditingTask(null)
  }, [])

  const handleFormSuccess = useCallback(() => {
    fetchTasks()
    handleFormClose()
  }, [fetchTasks, handleFormClose])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando projeto...</p>
        </div>
      </div>
    )
  }

  if (!project) {
    return null
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/projetos")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-3xl font-bold">{project.name}</h1>
              <p className="text-gray-500 mt-1">
                {project.client.name}
                {project.client.company && ` - ${project.client.company}`}
              </p>
              {project.description && (
                <p className="text-gray-600 mt-2">{project.description}</p>
              )}
            </div>
          </div>
          <Button onClick={() => setIsFormDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Task
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Kanban Board</CardTitle>
          </CardHeader>
          <CardContent>
            <KanbanBoard
              tasks={tasks}
              onTaskMove={handleTaskMove}
              onTaskClick={handleTaskClick}
            />
          </CardContent>
        </Card>
      </div>

      <TaskFormDialog
        isOpen={isFormDialogOpen}
        onClose={handleFormClose}
        onSuccess={handleFormSuccess}
        projectId={resolvedParams.id}
        editingTask={editingTask}
        members={members}
        teams={teams}
      />

      <TaskDetailDialog
        isOpen={isDetailDialogOpen}
        onClose={() => setIsDetailDialogOpen(false)}
        task={selectedTask}
        onEdit={handleEditTask}
        onDelete={handleDeleteTask}
      />
    </>
  )
}

