"use client"

import { memo } from "react"
import { ThumbsUp, MessageCircle, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { HuntlyBadge, HuntlyEmpty } from "@/components/huntly-ui"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"

interface Author {
  id: string
  name: string
  avatar?: string
  role: string
}

interface Vote {
  id: string
  memberId: string
}

interface Suggestion {
  id: string
  title: string
  description: string
  category: string
  status: string
  author: Author
  votes: Vote[]
  _count: {
    votes: number
    comments: number
  }
  createdAt: string
}

interface SuggestionsListProps {
  suggestions: Suggestion[]
  onVote: (suggestionId: string) => void
  onViewDetails: (suggestion: Suggestion) => void
}

const categoryLabels: Record<string, string> = {
  FINANCEIRO: "Financeiro",
  GESTAO: "Gestão",
  PROJETOS: "Projetos",
  EQUIPE: "Equipe",
  PROCESSOS: "Processos",
  TECNOLOGIA: "Tecnologia",
  OUTRO: "Outro",
}

const categoryColors: Record<string, "default" | "success" | "warning" | "danger" | "info"> = {
  FINANCEIRO: "success",
  GESTAO: "info",
  PROJETOS: "warning",
  EQUIPE: "default",
  PROCESSOS: "danger",
  TECNOLOGIA: "info",
  OUTRO: "default",
}

const statusLabels: Record<string, string> = {
  ABERTA: "Aberta",
  EM_ANALISE: "Em Análise",
  APROVADA: "Aprovada",
  IMPLEMENTADA: "Implementada",
  REJEITADA: "Rejeitada",
}

const statusColors: Record<string, "default" | "success" | "warning" | "danger" | "info"> = {
  ABERTA: "info",
  EM_ANALISE: "warning",
  APROVADA: "success",
  IMPLEMENTADA: "success",
  REJEITADA: "danger",
}

const roleLabels: Record<string, string> = {
  DEVELOPER: "Desenvolvedor",
  DESIGNER: "Designer",
  PROJECT_MANAGER: "Gerente de Projetos",
  PRODUCT_MANAGER: "Gerente de Produto",
  QA_ENGINEER: "QA",
  DEVOPS: "DevOps",
  DATA_SCIENTIST: "Data Scientist",
  BUSINESS_ANALYST: "Analista de Negócios",
  FOUNDER: "Fundador",
  CEO: "CEO",
  CTO: "CTO",
  CFO: "CFO",
  OTHER: "Outro",
}

function SuggestionsListComponent({
  suggestions,
  onVote,
  onViewDetails,
}: SuggestionsListProps) {
  if (suggestions.length === 0) {
    return (
      <HuntlyEmpty
        title="Nenhuma sugestão"
        description="Seja o primeiro a compartilhar uma sugestão com a equipe!"
      />
    )
  }

  return (
    <div className="divide-y divide-border">
      {suggestions.map((suggestion) => (
        <div
          key={suggestion.id}
          className="p-6 hover:bg-muted/30 transition-colors cursor-pointer"
          onClick={() => onViewDetails(suggestion)}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              {/* Header with category and status */}
              <div className="flex items-center gap-2 mb-2">
                <HuntlyBadge variant={categoryColors[suggestion.category] || "default"}>
                  {categoryLabels[suggestion.category] || suggestion.category}
                </HuntlyBadge>
                <HuntlyBadge variant={statusColors[suggestion.status] || "default"}>
                  {statusLabels[suggestion.status] || suggestion.status}
                </HuntlyBadge>
              </div>

              {/* Title */}
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {suggestion.title}
              </h3>

              {/* Description preview */}
              <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                {suggestion.description}
              </p>

              {/* Author and meta */}
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                    <User className="h-3 w-3" />
                  </div>
                  <span>{suggestion.author.name}</span>
                  <span className="text-xs">
                    ({roleLabels[suggestion.author.role] || suggestion.author.role})
                  </span>
                </div>
                <span>·</span>
                <span>
                  {formatDistanceToNow(new Date(suggestion.createdAt), {
                    addSuffix: true,
                    locale: ptBR,
                  })}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                className="gap-2"
                onClick={(e) => {
                  e.stopPropagation()
                  onVote(suggestion.id)
                }}
              >
                <ThumbsUp className="h-4 w-4" />
                <span>{suggestion._count.votes}</span>
              </Button>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MessageCircle className="h-4 w-4" />
                <span>{suggestion._count.comments}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export const SuggestionsList = memo(SuggestionsListComponent)
