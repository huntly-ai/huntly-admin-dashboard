"use client"

import { useEffect, useState, useCallback } from "react"
import { SuggestionsList } from "./components/suggestions-list"
import { SuggestionFormDialog } from "./components/suggestion-form-dialog"
import { SuggestionDetailDialog } from "./components/suggestion-detail-dialog"
import {
  SectionHeader,
  HuntlyCard,
  HuntlyCardHeader,
  HuntlyCardContent,
  HuntlyLoading,
} from "@/components/huntly-ui"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

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

const categoryLabels: Record<string, string> = {
  FINANCEIRO: "Financeiro",
  GESTAO: "Gestão",
  PROJETOS: "Projetos",
  EQUIPE: "Equipe",
  PROCESSOS: "Processos",
  TECNOLOGIA: "Tecnologia",
  OUTRO: "Outro",
}

const statusLabels: Record<string, string> = {
  ABERTA: "Aberta",
  EM_ANALISE: "Em Análise",
  APROVADA: "Aprovada",
  IMPLEMENTADA: "Implementada",
  REJEITADA: "Rejeitada",
}

export default function SugestoesPage() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [loading, setLoading] = useState(true)
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false)
  const [selectedSuggestion, setSelectedSuggestion] = useState<Suggestion | null>(null)
  const [filterCategory, setFilterCategory] = useState<string>("all")
  const [filterStatus, setFilterStatus] = useState<string>("all")

  const fetchSuggestions = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (filterCategory !== "all") params.set("category", filterCategory)
      if (filterStatus !== "all") params.set("status", filterStatus)

      const response = await fetch(`/api/sugestoes?${params.toString()}`)
      const data = await response.json()
      setSuggestions(data)
    } catch (error) {
      console.error("Error fetching suggestions:", error)
    } finally {
      setLoading(false)
    }
  }, [filterCategory, filterStatus])

  useEffect(() => {
    fetchSuggestions()
  }, [fetchSuggestions])

  const handleVote = useCallback(async (suggestionId: string) => {
    try {
      const response = await fetch(`/api/sugestoes/${suggestionId}/votos`, {
        method: "POST",
      })

      if (response.ok) {
        fetchSuggestions()
      }
    } catch (error) {
      console.error("Error voting:", error)
    }
  }, [fetchSuggestions])

  const handleViewDetails = useCallback((suggestion: Suggestion) => {
    setSelectedSuggestion(suggestion)
  }, [])

  const handleCloseDetails = useCallback(() => {
    setSelectedSuggestion(null)
    fetchSuggestions()
  }, [fetchSuggestions])

  if (loading) {
    return <HuntlyLoading text="Carregando sugestões..." />
  }

  return (
    <div className="space-y-8">
      <SectionHeader
        label="Colaboração"
        title="Caixa de"
        titleBold="Sugestões"
        action={
          <SuggestionFormDialog
            isOpen={isFormDialogOpen}
            onOpenChange={setIsFormDialogOpen}
            onSuccess={fetchSuggestions}
          />
        }
      />

      {/* Filters */}
      <div className="flex gap-4">
        <div className="w-48">
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as categorias</SelectItem>
              {Object.entries(categoryLabels).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="w-48">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              {Object.entries(statusLabels).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <HuntlyCard>
        <HuntlyCardHeader
          title="Sugestões da Equipe"
          description={`${suggestions.length} sugestões compartilhadas`}
        />
        <HuntlyCardContent className="p-0">
          <SuggestionsList
            suggestions={suggestions}
            onVote={handleVote}
            onViewDetails={handleViewDetails}
          />
        </HuntlyCardContent>
      </HuntlyCard>

      {selectedSuggestion && (
        <SuggestionDetailDialog
          suggestion={selectedSuggestion}
          isOpen={!!selectedSuggestion}
          onClose={handleCloseDetails}
          onVote={handleVote}
        />
      )}
    </div>
  )
}
