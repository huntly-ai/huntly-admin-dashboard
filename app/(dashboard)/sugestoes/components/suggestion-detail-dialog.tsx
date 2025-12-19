"use client"

import { memo, useState, useCallback, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ThumbsUp, MessageCircle, User, Send } from "lucide-react"
import { HuntlyBadge } from "@/components/huntly-ui"
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

interface Comment {
  id: string
  content: string
  author: Author
  createdAt: string
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

interface SuggestionDetailDialogProps {
  suggestion: Suggestion
  isOpen: boolean
  onClose: () => void
  onVote: (suggestionId: string) => void
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

function SuggestionDetailDialogComponent({
  suggestion,
  isOpen,
  onClose,
  onVote,
}: SuggestionDetailDialogProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [voteCount, setVoteCount] = useState(suggestion._count.votes)

  const fetchComments = useCallback(async () => {
    try {
      const response = await fetch(`/api/sugestoes/${suggestion.id}/comentarios`)
      if (response.ok) {
        const data = await response.json()
        setComments(data)
      }
    } catch (error) {
      console.error("Error fetching comments:", error)
    }
  }, [suggestion.id])

  useEffect(() => {
    if (isOpen) {
      fetchComments()
      setVoteCount(suggestion._count.votes)
    }
  }, [isOpen, fetchComments, suggestion._count.votes])

  const handleSubmitComment = useCallback(async () => {
    if (!newComment.trim()) return

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/sugestoes/${suggestion.id}/comentarios`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newComment }),
      })

      if (response.ok) {
        setNewComment("")
        fetchComments()
      } else {
        const error = await response.json()
        alert(error.error || "Erro ao enviar comentário")
      }
    } catch (error) {
      console.error("Error submitting comment:", error)
      alert("Erro ao enviar comentário")
    } finally {
      setIsSubmitting(false)
    }
  }, [newComment, suggestion.id, fetchComments])

  const handleVote = useCallback(async () => {
    try {
      const response = await fetch(`/api/sugestoes/${suggestion.id}/votos`, {
        method: "POST",
      })

      if (response.ok) {
        const data = await response.json()
        setVoteCount(data.voteCount)
        onVote(suggestion.id)
      }
    } catch (error) {
      console.error("Error voting:", error)
    }
  }, [suggestion.id, onVote])

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <HuntlyBadge variant={categoryColors[suggestion.category] || "default"}>
              {categoryLabels[suggestion.category] || suggestion.category}
            </HuntlyBadge>
            <HuntlyBadge variant={statusColors[suggestion.status] || "default"}>
              {statusLabels[suggestion.status] || suggestion.status}
            </HuntlyBadge>
          </div>
          <DialogTitle className="text-xl">{suggestion.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Author info */}
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
              <User className="h-4 w-4" />
            </div>
            <div>
              <p className="font-medium text-foreground">{suggestion.author.name}</p>
              <p className="text-xs">
                {roleLabels[suggestion.author.role] || suggestion.author.role} ·{" "}
                {formatDistanceToNow(new Date(suggestion.createdAt), {
                  addSuffix: true,
                  locale: ptBR,
                })}
              </p>
            </div>
          </div>

          {/* Description */}
          <div className="prose prose-sm prose-invert max-w-none">
            <p className="text-foreground whitespace-pre-wrap">{suggestion.description}</p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4 pt-4 border-t border-border">
            <Button variant="outline" size="sm" className="gap-2" onClick={handleVote}>
              <ThumbsUp className="h-4 w-4" />
              <span>Apoiar ({voteCount})</span>
            </Button>
            <div className="flex items-center gap-2 text-muted-foreground">
              <MessageCircle className="h-4 w-4" />
              <span>{comments.length} comentários</span>
            </div>
          </div>

          {/* Comments section */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-foreground">Comentários</h4>

            {/* Comment input */}
            <div className="flex gap-2">
              <Textarea
                placeholder="Escreva um comentário..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={2}
                className="flex-1"
              />
              <Button
                size="icon"
                onClick={handleSubmitComment}
                disabled={isSubmitting || !newComment.trim()}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>

            {/* Comments list */}
            <div className="space-y-4">
              {comments.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhum comentário ainda. Seja o primeiro a comentar!
                </p>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                      <User className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-foreground">
                          {comment.author.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(comment.createdAt), {
                            addSuffix: true,
                            locale: ptBR,
                          })}
                        </span>
                      </div>
                      <p className="text-sm text-foreground">{comment.content}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export const SuggestionDetailDialog = memo(SuggestionDetailDialogComponent)
