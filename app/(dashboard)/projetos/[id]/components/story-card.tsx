"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { AlertCircle, ArrowDown, ArrowUp, Clock, CheckCircle2 } from "lucide-react"

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
}

interface StoryCardProps {
  story: Story
  onClick: (story: Story) => void
}

const PriorityIcon = ({ priority }: { priority: string }) => {
  switch (priority) {
    case "URGENT":
      return <AlertCircle className="h-4 w-4 text-red-600" />
    case "HIGH":
      return <ArrowUp className="h-4 w-4 text-orange-500" />
    case "LOW":
      return <ArrowDown className="h-4 w-4 text-blue-500" />
    default:
      return <Clock className="h-4 w-4 text-gray-400" />
  }
}

export function StoryCard({ story, onClick }: StoryCardProps) {
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: story.id,
    data: {
      type: "Story",
      story,
    },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  // Calculate progress
  const totalTasks = story.tasks?.length || 0
  const completedTasks = story.tasks?.filter(t => t.status === "DONE").length || 0
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg h-[150px] opacity-50"
      />
    )
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onClick(story)}
      className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing group relative"
    >
      <div className="space-y-3">
        {/* Header: Epic & Priority */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
             {story.epic && (
               <Badge variant="secondary" className="text-[10px] px-1 py-0 h-5 bg-blue-50 text-blue-700 hover:bg-blue-100 truncate max-w-[120px]">
                 {story.epic.title}
               </Badge>
             )}
          </div>
          <div title={`Prioridade: ${story.priority}`}>
             <PriorityIcon priority={story.priority} />
          </div>
        </div>

        {/* Title */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 leading-tight group-hover:text-blue-600">
            {story.title}
          </h4>
        </div>

        {/* Tags/Points & Key */}
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span className="font-mono bg-gray-100 px-1 rounded">
             {/* Simulating Issue Key */}
             ST-{story.id.slice(-4).toUpperCase()}
          </span>
          {story.points !== undefined && story.points > 0 && (
            <Badge variant="outline" className="text-[10px] px-1.5 h-5">
              {story.points} pts
            </Badge>
          )}
        </div>

        {/* Footer: Assignees & Progress */}
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-50">
          <div className="flex -space-x-2">
            {story.storyMembers?.slice(0, 3).map((sm, i) => (
              <Avatar key={i} className="h-6 w-6 border-2 border-white ring-1 ring-gray-100">
                <AvatarImage src={sm.member.avatar} />
                <AvatarFallback className="text-[9px] bg-gray-100 text-gray-600">
                  {sm.member.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            ))}
            {(story.storyMembers?.length || 0) > 3 && (
              <div className="h-6 w-6 rounded-full bg-gray-100 border-2 border-white ring-1 ring-gray-100 flex items-center justify-center text-[9px] text-gray-500 font-medium">
                +{(story.storyMembers?.length || 0) - 3}
              </div>
            )}
          </div>

          {totalTasks > 0 && (
             <div className="flex items-center gap-1.5 flex-1 max-w-[80px] ml-auto">
               <CheckCircle2 className={`h-3 w-3 ${progress === 100 ? 'text-green-500' : 'text-gray-400'}`} />
               <Progress value={progress} className="h-1.5" />
             </div>
          )}
        </div>
      </div>
    </div>
  )
}

