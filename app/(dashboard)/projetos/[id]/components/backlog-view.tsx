"use client"

import { useState } from "react"
import { Plus, ChevronRight, ChevronDown, MoreHorizontal, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { EpicFormDialog } from "./epic-form-dialog"
import { StoryFormDialog } from "./story-form-dialog"

interface Member {
  id: string
  name: string
  email: string
  role: string
  avatar?: string
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

interface Story {
  id: string
  title: string
  description?: string
  status: string
  priority: string
  points?: number
  epicId?: string | null
  storyMembers?: { member: Member }[]
  tasks?: Task[]
}

interface Task {
  id: string
  title: string
}

interface BacklogViewProps {
  projectId: string
  epics: Epic[]
  unassignedStories: Story[]
  members: Member[]
  onRefresh: () => void
}

export function BacklogView({
  projectId,
  epics,
  unassignedStories,
  members,
  onRefresh,
}: BacklogViewProps) {
  const [isEpicDialogOpen, setIsEpicDialogOpen] = useState(false)
  const [isStoryDialogOpen, setIsStoryDialogOpen] = useState(false)
  const [editingStory, setEditingStory] = useState<Story | null>(null)
  
  // Expanded states for epics
  const [expandedEpics, setExpandedEpics] = useState<Record<string, boolean>>({})

  const toggleEpic = (epicId: string) => {
    setExpandedEpics(prev => ({
      ...prev,
      [epicId]: !prev[epicId]
    }))
  }

  const handleEditStory = (story: Story) => {
    setEditingStory(story)
    setIsStoryDialogOpen(true)
  }

  const handleCreateStory = () => {
    setEditingStory(null)
    setIsStoryDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Backlog</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsEpicDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Épico
          </Button>
          <Button onClick={handleCreateStory}>
            <Plus className="h-4 w-4 mr-2" />
            Nova História
          </Button>
        </div>
      </div>

      {/* Epics List */}
      <div className="space-y-4">
        {epics.map(epic => (
          <div key={epic.id} className="border rounded-lg bg-white shadow-sm overflow-hidden">
            <div 
              className="flex items-center p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => toggleEpic(epic.id)}
            >
              <button className="mr-2">
                {expandedEpics[epic.id] ? (
                  <ChevronDown className="h-5 w-5 text-gray-500" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-gray-500" />
                )}
              </button>
              
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="font-medium text-lg">{epic.title}</h3>
                  <Badge variant={epic.status === "DONE" ? "default" : "secondary"}>
                    {epic.status}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {epic.priority}
                  </Badge>
                </div>
                {epic.description && (
                  <p className="text-sm text-gray-500 mt-1 line-clamp-1">{epic.description}</p>
                )}
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-500 mr-4">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {epic.startDate ? new Date(epic.startDate).toLocaleDateString() : 'N/A'} - 
                    {epic.endDate ? new Date(epic.endDate).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                <div>
                   {epic.stories.length} Histórias
                </div>
              </div>
            </div>

            {expandedEpics[epic.id] && (
              <div className="border-t divide-y">
                {epic.stories.length === 0 ? (
                  <div className="p-8 text-center text-gray-500 text-sm">
                    Nenhuma história neste épico.
                  </div>
                ) : (
                  epic.stories.map(story => (
                    <StoryItem 
                      key={story.id} 
                      story={story} 
                      onEdit={() => handleEditStory(story)}
                    />
                  ))
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Unassigned Stories */}
      <div className="mt-8">
        <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
          Histórias sem Épico 
          <Badge variant="secondary" className="rounded-full">
            {unassignedStories.length}
          </Badge>
        </h3>
        <div className="border rounded-lg bg-white shadow-sm divide-y">
          {unassignedStories.length === 0 ? (
            <div className="p-8 text-center text-gray-500 text-sm">
              O backlog está vazio.
            </div>
          ) : (
            unassignedStories.map(story => (
              <StoryItem 
                key={story.id} 
                story={story} 
                onEdit={() => handleEditStory(story)}
              />
            ))
          )}
        </div>
      </div>

      <EpicFormDialog
        isOpen={isEpicDialogOpen}
        onClose={() => setIsEpicDialogOpen(false)}
        onSuccess={() => {
          setIsEpicDialogOpen(false)
          onRefresh()
        }}
        projectId={projectId}
      />

      <StoryFormDialog
        isOpen={isStoryDialogOpen}
        onClose={() => {
          setIsStoryDialogOpen(false)
          setEditingStory(null)
        }}
        onSuccess={() => {
          setIsStoryDialogOpen(false)
          setEditingStory(null)
          onRefresh()
        }}
        projectId={projectId}
        editingStory={editingStory}
        epics={epics} // simple map {id, title} is enough but full object works
        members={members}
      />
    </div>
  )
}

function StoryItem({ story, onEdit }: { story: Story, onEdit: () => void }) {
  return (
    <div className="flex items-center p-3 hover:bg-gray-50 group">
      <div className="flex-1 min-w-0 ml-2">
        <div className="flex items-center gap-2">
          <span className="font-medium truncate cursor-pointer hover:text-blue-600" onClick={onEdit}>
            {story.title}
          </span>
          {story.points !== undefined && story.points > 0 && (
            <Badge variant="secondary" className="text-xs h-5 w-5 rounded-full flex items-center justify-center p-0">
              {story.points}
            </Badge>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4 ml-4">
        {/* Members */}
        {story.storyMembers && story.storyMembers.length > 0 && (
          <div className="flex -space-x-2">
            {story.storyMembers.slice(0, 3).map((sm, i) => (
              <Avatar key={i} className="h-6 w-6 border-2 border-white">
                <AvatarImage src={sm.member.avatar} />
                <AvatarFallback className="text-[10px]">
                  {sm.member.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            ))}
            {story.storyMembers.length > 3 && (
              <div className="h-6 w-6 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-[10px] text-gray-500">
                +{story.storyMembers.length - 3}
              </div>
            )}
          </div>
        )}

        <Badge 
          variant="outline" 
          className={`
            ${story.status === 'DONE' ? 'bg-green-50 text-green-700 border-green-200' : ''}
            ${story.status === 'IN_PROGRESS' ? 'bg-blue-50 text-blue-700 border-blue-200' : ''}
            ${story.status === 'IN_REVIEW' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : ''}
          `}
        >
          {story.status === 'TODO' ? 'A Fazer' : 
           story.status === 'IN_PROGRESS' ? 'Em Progresso' :
           story.status === 'IN_REVIEW' ? 'Revisão' : 'Concluído'}
        </Badge>
        
        <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100" onClick={onEdit}>
           <MoreHorizontal className="h-4 w-4 text-gray-500" />
        </Button>
      </div>
    </div>
  )
}

