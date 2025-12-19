"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { AlertCircle, ArrowDown, ArrowUp, Clock, CheckCircle2 } from "lucide-react"
import { priorityColors, getAvatarColor, iconColors } from "@/lib/design-tokens"

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

interface StoryCardProps {
  story: Story
  onClick: (story: Story) => void
}

const PriorityIcon = ({ priority }: { priority: string }) => {
  const colorClass = priorityColors[priority]?.text || iconColors.default
  switch (priority) {
    case "URGENT":
      return <AlertCircle className={`h-4 w-4 ${colorClass}`} />
    case "HIGH":
      return <ArrowUp className={`h-4 w-4 ${colorClass}`} />
    case "LOW":
      return <ArrowDown className={`h-4 w-4 ${colorClass}`} />
    default:
      return <Clock className={`h-4 w-4 ${iconColors.default}`} />
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
        className="bg-secondary border-2 border-dashed border-zinc-700 rounded-lg h-[150px] opacity-50"
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
      className="bg-card p-3 rounded-lg shadow-sm border border-border hover:shadow-md hover:border-zinc-600 transition-all cursor-grab active:cursor-grabbing group relative"
    >
      <div className="space-y-3">
        {/* Header: Epic & Priority */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
             {story.epic && (
               <Badge variant="secondary" className="text-[10px] px-1 py-0 h-5 bg-blue-950 text-blue-300 hover:bg-blue-900 truncate max-w-[120px]">
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
          <h4 className="text-sm font-medium text-foreground leading-tight group-hover:text-blue-400">
            {story.title}
          </h4>
        </div>

        {/* Tags/Points & Key */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="font-mono bg-secondary px-1 rounded">
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
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-border">
          <div className="flex -space-x-2">
            {story.storyMembers?.slice(0, 3).map((sm, i) => (
              <Avatar key={i} className="h-6 w-6 border-2 border-card ring-1 ring-border">
                <AvatarImage src={sm.member.avatar} />
                <AvatarFallback className={`text-[9px] ${getAvatarColor(sm.member.id)}`}>
                  {sm.member.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            ))}
            {(story.storyMembers?.length || 0) > 3 && (
              <div className="h-6 w-6 rounded-full bg-secondary border-2 border-card ring-1 ring-border flex items-center justify-center text-[9px] text-muted-foreground font-medium">
                +{(story.storyMembers?.length || 0) - 3}
              </div>
            )}
          </div>

          {totalTasks > 0 && (
             <div className="flex items-center gap-1.5 flex-1 max-w-[80px] ml-auto">
               <CheckCircle2 className={`h-3 w-3 ${progress === 100 ? 'text-emerald-400' : 'text-zinc-500'}`} />
               <Progress value={progress} className="h-1.5" />
             </div>
          )}
        </div>
      </div>
    </div>
  )
}

