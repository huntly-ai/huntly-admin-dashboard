"use client"

import { useEffect, useState, useCallback, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MeetingsList } from "./components/meetings-list"
import { MeetingFormDialog } from "./components/meeting-form-dialog"
import { MeetingsStats } from "./components/meetings-stats"
import { format } from "date-fns"

// Import FormData type from component
type FormData = {
  title: string
  description: string
  startDate: string
  startTime: string
  endDate: string
  endTime: string
  location: string
  leadId: string
  clientId: string
  memberIds: string[]
  teamIds: string[]
  tags: string
  notes: string
  status: string
}

interface Meeting {
  id: string
  title: string
  description?: string
  startDate: string
  endDate?: string
  location?: string
  tags?: string
  notes?: string
  status: string
  lead?: {
    id: string
    name: string
  }
  client?: {
    id: string
    name: string
  }
  meetingMembers?: Array<{
    member: {
      id: string
      name: string
    }
    rsvpStatus: string
  }>
  meetingTeams?: Array<{
    team: {
      id: string
      name: string
    }
  }>
  createdAt: string
}

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null)
  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
    location: "",
    leadId: "",
    clientId: "",
    memberIds: [] as string[],
    teamIds: [] as string[],
    tags: "",
    notes: "",
    status: "SCHEDULED",
  })

  const fetchMeetings = useCallback(async () => {
    try {
      const response = await fetch("/api/reunioes")
      const data = await response.json()
      setMeetings(data)
    } catch (error) {
      console.error("Error fetching meetings:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchMeetings()
  }, [fetchMeetings])

  const resetForm = useCallback(() => {
    setEditingMeeting(null)
    setFormData({
      title: "",
      description: "",
      startDate: "",
      startTime: "",
      endDate: "",
      endTime: "",
      location: "",
      leadId: "",
      clientId: "",
      memberIds: [],
      teamIds: [],
      tags: "",
      notes: "",
      status: "SCHEDULED",
    })
  }, [])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const url = editingMeeting
        ? `/api/reunioes/${editingMeeting.id}`
        : "/api/reunioes"
      const method = editingMeeting ? "PUT" : "POST"

      const dataToSend = {
        ...formData,
        startDate: `${formData.startDate}T${formData.startTime}`,
        endDate: formData.endDate ? `${formData.endDate}T${formData.endTime}` : null,
        leadId: formData.leadId || null,
        clientId: formData.clientId || null,
      }

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend),
      })

      if (response.ok) {
        setIsDialogOpen(false)
        resetForm()
        fetchMeetings()
      } else {
        const error = await response.json()
        alert(error.error || "Erro ao salvar reunião")
      }
    } catch (error) {
      console.error("Error saving meeting:", error)
      alert("Erro ao salvar reunião")
    }
  }, [editingMeeting, formData, fetchMeetings, resetForm])

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta reunião?")) return

    try {
      const response = await fetch(`/api/reunioes/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        fetchMeetings()
      } else {
        const error = await response.json()
        alert(error.error || "Erro ao excluir reunião")
      }
    } catch (error) {
      console.error("Error deleting meeting:", error)
      alert("Erro ao excluir reunião")
    }
  }, [fetchMeetings])

  const handleEdit = useCallback((meeting: Meeting) => {
    const startDateTime = new Date(meeting.startDate)
    const endDateTime = meeting.endDate ? new Date(meeting.endDate) : null

    setEditingMeeting(meeting)
    setFormData({
      title: meeting.title,
      description: meeting.description || "",
      startDate: format(startDateTime, "yyyy-MM-dd"),
      startTime: format(startDateTime, "HH:mm"),
      endDate: endDateTime ? format(endDateTime, "yyyy-MM-dd") : "",
      endTime: endDateTime ? format(endDateTime, "HH:mm") : "",
      location: meeting.location || "",
      leadId: meeting.lead?.id || "",
      clientId: meeting.client?.id || "",
      memberIds: meeting.meetingMembers?.map(m => m.member.id) || [],
      teamIds: meeting.meetingTeams?.map(t => t.team.id) || [],
      tags: meeting.tags ? JSON.parse(meeting.tags).join(", ") : "",
      notes: meeting.notes || "",
      status: meeting.status,
    })
    setIsDialogOpen(true)
  }, [])

  const handleFormChange = useCallback((field: keyof FormData, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }, [])

  const handleDialogChange = useCallback((open: boolean) => {
    setIsDialogOpen(open)
    if (!open) {
      resetForm()
    }
  }, [resetForm])

  // Memoized calculations
  const upcomingMeetings = useMemo(
    () => meetings.filter(m => m.status === "SCHEDULED").length,
    [meetings]
  )

  const completedMeetings = useMemo(
    () => meetings.filter(m => m.status === "COMPLETED").length,
    [meetings]
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando reuniões...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Reuniões</h1>
            <p className="text-gray-500 mt-1">
              Gerencie suas reuniões com leads e clientes
            </p>
          </div>
          <MeetingFormDialog
            isOpen={isDialogOpen}
            onOpenChange={handleDialogChange}
            editingMeeting={editingMeeting}
            formData={formData}
            onFormChange={handleFormChange}
            onSubmit={handleSubmit}
          />
        </div>

        <MeetingsStats
          totalMeetings={meetings.length}
          upcomingMeetings={upcomingMeetings}
          completedMeetings={completedMeetings}
        />

        <Card>
          <CardHeader>
            <CardTitle>Lista de Reuniões ({meetings.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <MeetingsList
              meetings={meetings}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </CardContent>
        </Card>
      </div>
    </>
  )
}
