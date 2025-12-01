"use client"

import { useDroppable } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { StoryCard } from "./story-card"

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
}

interface Task {
  id: string
  status: string
}

interface Story {
  id: string
  title: string
  description?: string
  status: string
  priority: string
  points?: number
  epic?: Epic | null
  storyMembers?: { member: Member }[]
  tasks?: Task[]
  order: number
}

interface KanbanColumnProps {
  id: string
  title: string
  color: string
  stories: Story[]
  onStoryClick: (story: Story) => void
}

export function KanbanColumn({ id, title, color, stories, onStoryClick }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id })

  return (
    <div
      ref={setNodeRef}
      className={`rounded-lg p-3 min-h-[500px] transition-colors ${color} ${
        isOver ? "bg-gray-200" : ""
      } flex flex-col gap-2`}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-gray-700 text-sm uppercase tracking-wide px-1">{title}</h3>
        <span className="text-xs font-medium text-gray-500 bg-black/5 px-2 py-0.5 rounded-full">
          {stories.length}
        </span>
      </div>

      <SortableContext items={stories.map(s => s.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-3 flex-1">
          {stories.map(story => (
            <StoryCard key={story.id} story={story} onClick={onStoryClick} />
          ))}
        </div>
      </SortableContext>
    </div>
  )
}
