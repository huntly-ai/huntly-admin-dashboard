"use client"

import { useEffect, useState, useCallback, useMemo } from "react"
import { formatPhone, prepareValueForCurrencyInput } from "@/lib/utils/formatters"
import { LeadsList } from "./components/leads-list"
import { LeadFormDialog } from "./components/lead-form-dialog"
import { ConvertLeadDialog } from "./components/convert-lead-dialog"
import { LeadsStats } from "./components/leads-stats"
import {
  SectionHeader,
  HuntlyCard,
  HuntlyCardHeader,
  HuntlyCardContent,
  HuntlyLoading,
} from "@/components/huntly-ui"

interface Lead {
  id: string
  name: string
  email?: string
  phone: string
  company?: string
  position?: string
  status: string
  source: string
  notes?: string
  estimatedValue?: number
  convertedToClientId?: string
  createdAt: string
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isConvertDialogOpen, setIsConvertDialogOpen] = useState(false)
  const [editingLead, setEditingLead] = useState<Lead | null>(null)
  const [convertingLead, setConvertingLead] = useState<Lead | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    position: "",
    status: "NEW",
    source: "OTHER",
    notes: "",
    estimatedValue: "",
  })

  const fetchLeads = useCallback(async () => {
    try {
      const response = await fetch("/api/leads")
      const data = await response.json()
      setLeads(data)
    } catch (error) {
      console.error("Error fetching leads:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchLeads()
  }, [fetchLeads])

  const resetForm = useCallback(() => {
    setEditingLead(null)
    setFormData({
      name: "",
      email: "",
      phone: "",
      company: "",
      position: "",
      status: "NEW",
      source: "OTHER",
      notes: "",
      estimatedValue: "",
    })
  }, [])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const url = editingLead
        ? `/api/leads/${editingLead.id}`
        : "/api/leads"
      const method = editingLead ? "PUT" : "POST"

      const dataToSend = {
        ...formData,
        phone: formData.phone.replace(/\D/g, ""),
        estimatedValue: formData.estimatedValue
          ? (parseFloat(formData.estimatedValue) / 100).toFixed(2)
          : "",
      }

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend),
      })

      if (response.ok) {
        setIsDialogOpen(false)
        resetForm()
        fetchLeads()
      } else {
        const error = await response.json()
        alert(error.error || "Erro ao salvar lead")
      }
    } catch (error) {
      console.error("Error saving lead:", error)
      alert("Erro ao salvar lead")
    }
  }, [editingLead, formData, fetchLeads, resetForm])

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este lead?")) return

    try {
      const response = await fetch(`/api/leads/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        fetchLeads()
      } else {
        const error = await response.json()
        alert(error.error || "Erro ao excluir lead")
      }
    } catch (error) {
      console.error("Error deleting lead:", error)
      alert("Erro ao excluir lead")
    }
  }, [fetchLeads])

  const handleEdit = useCallback((lead: Lead) => {
    setEditingLead(lead)
    setFormData({
      name: lead.name,
      email: lead.email || "",
      phone: formatPhone(lead.phone),
      company: lead.company || "",
      position: lead.position || "",
      status: lead.status,
      source: lead.source,
      notes: lead.notes || "",
      estimatedValue: lead.estimatedValue
        ? prepareValueForCurrencyInput(lead.estimatedValue)
        : "",
    })
    setIsDialogOpen(true)
  }, [])

  const handleConvert = useCallback((lead: Lead) => {
    setConvertingLead(lead)
    setIsConvertDialogOpen(true)
  }, [])

  const confirmConvert = useCallback(async () => {
    if (!convertingLead) return

    try {
      const response = await fetch(`/api/leads/${convertingLead.id}/convert`, {
        method: "POST",
      })

      if (response.ok) {
        fetchLeads()
        alert("Lead convertido em cliente com sucesso!")
      } else {
        const error = await response.json()
        alert(error.error || "Erro ao converter lead")
      }
    } catch (error) {
      console.error("Error converting lead:", error)
      alert("Erro ao converter lead")
    }
  }, [convertingLead, fetchLeads])

  const handleFormChange = useCallback((field: keyof typeof formData, value: string) => {
    if (field === "phone") {
      setFormData(prev => ({ ...prev, [field]: formatPhone(value) }))
    } else {
      setFormData(prev => ({ ...prev, [field]: value }))
    }
  }, [])

  const handleDialogChange = useCallback((open: boolean) => {
    setIsDialogOpen(open)
    if (!open) {
      resetForm()
    }
  }, [resetForm])

  const qualifiedLeads = useMemo(
    () => leads.filter(l => l.status === "QUALIFIED" || l.status === "PROPOSAL_SENT" || l.status === "NEGOTIATION").length,
    [leads]
  )

  const convertedLeads = useMemo(
    () => leads.filter(l => l.status === "WON" || l.convertedToClientId).length,
    [leads]
  )

  if (loading) {
    return <HuntlyLoading text="Carregando leads..." />
  }

  return (
    <div className="space-y-8">
      <SectionHeader
        label="CRM"
        title="Leads"
        titleBold="& Oportunidades"
        action={
          <LeadFormDialog
            isOpen={isDialogOpen}
            onOpenChange={handleDialogChange}
            editingLead={editingLead}
            formData={formData}
            onFormChange={handleFormChange}
            onSubmit={handleSubmit}
          />
        }
      />

      <LeadsStats
        totalLeads={leads.length}
        qualifiedLeads={qualifiedLeads}
        convertedLeads={convertedLeads}
      />

      <HuntlyCard>
        <HuntlyCardHeader
          title="Lista de Leads"
          description={`${leads.length} leads cadastrados`}
        />
        <HuntlyCardContent className="p-0">
          <LeadsList
            leads={leads}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onConvert={handleConvert}
          />
        </HuntlyCardContent>
      </HuntlyCard>

      <ConvertLeadDialog
        isOpen={isConvertDialogOpen}
        onOpenChange={setIsConvertDialogOpen}
        lead={convertingLead}
        onConfirm={confirmConvert}
      />
    </div>
  )
}
