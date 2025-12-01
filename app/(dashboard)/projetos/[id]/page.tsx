"use client"

import { useEffect, useState, useCallback, use } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Plus } from "lucide-react"
import { KanbanBoard } from "./components/kanban-board"
import { BacklogView } from "./components/backlog-view"
import { StoryFormDialog } from "./components/story-form-dialog"
import { StoryDetailDialog } from "./components/story-detail-dialog"
import { TaskDetailDialog } from "./components/task-detail-dialog"
import { TaskFormDialog } from "./components/task-form-dialog"

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

interface Epic {
  id: string
  title: string
  description?: string
  status: string
  priority: string
  startDate?: string
  endDate?: string
  stories: Story[]
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
  taskMembers?: { member: Member }[]
  taskTeams?: { team: Team }[]
  createdAt: string
  updatedAt: string
}

interface Story {
  id: string
  title: string
  description?: string
  status: string
  priority: string
  points?: number
  epicId?: string | null
  epic?: { id: string, title: string } | null
  storyMembers?: { member: Member }[]
  tasks: Task[]
  order: number
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
  const [stories, setStories] = useState<Story[]>([])
  const [epics, setEpics] = useState<Epic[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  
  // Dialog States
  const [isStoryFormOpen, setIsStoryFormOpen] = useState(false)
  const [isStoryDetailOpen, setIsStoryDetailOpen] = useState(false)
  const [isTaskDetailOpen, setIsTaskDetailOpen] = useState(false)
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false)
  
  // Selection States
  const [selectedStory, setSelectedStory] = useState<Story | null>(null)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [editingStory, setEditingStory] = useState<Story | null>(null)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [targetStoryId, setTargetStoryId] = useState<string | undefined>(undefined)

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

  const fetchData = useCallback(async () => {
    try {
      const [storiesRes, epicsRes, membersRes, teamsRes] = await Promise.all([
        fetch(`/api/projetos/${resolvedParams.id}/stories`),
        fetch(`/api/projetos/${resolvedParams.id}/epics`),
        fetch("/api/membros"),
        fetch("/api/times")
      ])

      if (storiesRes.ok) setStories(await storiesRes.json())
      if (epicsRes.ok) setEpics(await epicsRes.json())
      if (membersRes.ok) setMembers(await membersRes.json())
      if (teamsRes.ok) setTeams(await teamsRes.json())
      
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }, [resolvedParams.id])

  useEffect(() => {
    fetchProject()
    fetchData()
  }, [fetchProject, fetchData])

  // --- Task Handlers (New for Swimlanes) ---

  const handleTaskMove = useCallback(async (taskId: string, newStatus: string, newOrder: number) => {
    // Optimistic update for Tasks within Stories
    const originalStories = [...stories]
    
    setStories(prev => {
      return prev.map(story => {
         // Find if task belongs to this story
         const taskIndex = story.tasks?.findIndex(t => t.id === taskId)
         if (taskIndex !== undefined && taskIndex > -1 && story.tasks) {
            const updatedTasks = [...story.tasks]
            updatedTasks[taskIndex] = { ...updatedTasks[taskIndex], status: newStatus }
            return { ...story, tasks: updatedTasks }
         }
         return story
      })
    })

    try {
      const response = await fetch(`/api/projetos/${resolvedParams.id}/tasks/reorder`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId, newStatus, newOrder }),
      })

      if (response.ok) {
        // Re-fetch to sync full state (orders, etc)
        const storiesRes = await fetch(`/api/projetos/${resolvedParams.id}/stories`)
        if (storiesRes.ok) setStories(await storiesRes.json())
      } else {
        setStories(originalStories)
      }
    } catch (error) {
      console.error("Error moving task:", error)
      setStories(originalStories)
    }
  }, [resolvedParams.id, stories])

  const handleTaskClick = useCallback((task: Task) => {
    // Need to map Task interface to what Detail expects if different, 
    // but assuming compatible structure for now.
    setSelectedTask(task) 
    setIsTaskDetailOpen(true)
  }, [])

  const handleAddSubtask = useCallback((storyId: string) => {
    setTargetStoryId(storyId)
    setEditingTask(null)
    setIsTaskFormOpen(true)
  }, [])

  // --- Story Handlers ---

  const handleStoryClick = useCallback((story: Story) => {
    setSelectedStory(story)
    setIsStoryDetailOpen(true)
  }, [])

  const handleEditStory = useCallback((story: Story) => {
    setEditingStory(story)
    setIsStoryDetailOpen(false)
    setIsStoryFormOpen(true)
  }, [])

  const handleDeleteStory = useCallback(async (storyId: string) => {
    if (!confirm("Tem certeza que deseja excluir esta história?")) return

    try {
      const response = await fetch(`/api/stories/${storyId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setStories(prev => prev.filter(s => s.id !== storyId))
        setIsStoryDetailOpen(false)
        fetchData()
      }
    } catch (error) {
      console.error("Error deleting story:", error)
    }
  }, [fetchData])

  const handleFormClose = useCallback(() => {
    setIsStoryFormOpen(false)
    setEditingStory(null)
  }, [])

  const handleFormSuccess = useCallback(() => {
    fetchData()
    handleFormClose()
  }, [fetchData, handleFormClose])

  // --- Task Edit/Delete Handlers ---
  const handleEditTask = useCallback((task: Task) => {
      setEditingTask(task)
      setIsTaskDetailOpen(false)
      setIsTaskFormOpen(true)
  }, [])

  const handleDeleteTask = useCallback(async (taskId: string) => {
      if (!confirm("Tem certeza que deseja excluir esta tarefa?")) return
      try {
        await fetch(`/api/projetos/${resolvedParams.id}/tasks/${taskId}`, { method: "DELETE" })
        setIsTaskDetailOpen(false)
        fetchData()
      } catch(e) { console.error(e) }
  }, [resolvedParams.id, fetchData])

  const handleTaskFormSuccess = useCallback(() => {
      setIsTaskFormOpen(false)
      setEditingTask(null)
      setTargetStoryId(undefined)
      fetchData()
  }, [fetchData])


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

  const unassignedStories = stories.filter(s => !s.epicId)

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
            </div>
          </div>
          <Button onClick={() => setIsStoryFormOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nova História
          </Button>
        </div>

        <Tabs defaultValue="kanban" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="kanban">Active Sprints</TabsTrigger>
            <TabsTrigger value="backlog">Backlog</TabsTrigger>
          </TabsList>
          
          <TabsContent value="kanban">
            <Card className="bg-transparent border-none shadow-none">
              <CardContent className="p-0">
                <KanbanBoard
                  stories={stories}
                  onTaskMove={handleTaskMove}
                  onStoryClick={handleStoryClick}
                  onTaskClick={handleTaskClick}
                  onAddSubtask={handleAddSubtask}
                />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="backlog">
            <BacklogView
                projectId={project.id}
                epics={epics}
                unassignedStories={unassignedStories}
                members={members}
                onRefresh={fetchData}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Story Dialogs */}
      <StoryFormDialog
        isOpen={isStoryFormOpen}
        onClose={handleFormClose}
        onSuccess={handleFormSuccess}
        projectId={resolvedParams.id}
        editingStory={editingStory}
        epics={epics}
        members={members}
      />

      <StoryDetailDialog
        isOpen={isStoryDetailOpen}
        onClose={() => setIsStoryDetailOpen(false)}
        story={selectedStory}
        onEdit={handleEditStory}
        onDelete={handleDeleteStory}
      />

      {/* Task Dialogs */}
      <TaskDetailDialog 
        isOpen={isTaskDetailOpen}
        onClose={() => setIsTaskDetailOpen(false)}
        task={selectedTask}
        onEdit={handleEditTask}
        onDelete={handleDeleteTask}
      />

      <TaskFormDialog 
         isOpen={isTaskFormOpen}
         onClose={() => {
           setIsTaskFormOpen(false)
           setTargetStoryId(undefined)
         }}
         onSuccess={handleTaskFormSuccess}
         projectId={resolvedParams.id}
         editingTask={editingTask}
         members={members}
         teams={teams}
         storyId={targetStoryId}
      />
    </>
  )
}
