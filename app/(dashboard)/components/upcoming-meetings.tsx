"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, Users, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import Link from "next/link"

interface Meeting {
  id: string
  title: string
  startDate: string
  location?: string
  status: string
  lead?: {
    name: string
  }
  client?: {
    name: string
  }
  meetingMembers?: Array<{
    member: {
      name: string
    }
  }>
}

export function UpcomingMeetings() {
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        const response = await fetch("/api/reunioes")
        const data = await response.json()
        
        // Filter upcoming meetings (scheduled and in progress) and sort by date
        const upcoming = data
          .filter((m: Meeting) => 
            m.status === "SCHEDULED" || m.status === "IN_PROGRESS"
          )
          .sort((a: Meeting, b: Meeting) => 
            new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
          )
          .slice(0, 5) // Show only 5 next meetings
        
        setMeetings(upcoming)
      } catch (error) {
        console.error("Error fetching meetings:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchMeetings()
  }, [])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Próximas Reuniões</CardTitle>
          <CardDescription>Agenda dos próximos eventos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (meetings.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Próximas Reuniões</CardTitle>
          <CardDescription>Agenda dos próximos eventos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p>Nenhuma reunião agendada</p>
            <Link href="/reunioes">
              <Button variant="outline" size="sm" className="mt-4">
                Criar Reunião
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Próximas Reuniões
        </CardTitle>
        <CardDescription>Agenda dos próximos eventos</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {meetings.map((meeting) => {
            const startDate = new Date(meeting.startDate)
            const isToday = new Date().toDateString() === startDate.toDateString()
            const isSoon = 
              startDate.getTime() - new Date().getTime() < 24 * 60 * 60 * 1000

            return (
              <div
                key={meeting.id}
                className="border rounded-lg p-3 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-sm truncate">
                        {meeting.title}
                      </h3>
                      {isToday && (
                        <Badge className="bg-red-100 text-red-800 text-xs">
                          Hoje
                        </Badge>
                      )}
                      {isSoon && !isToday && (
                        <Badge className="bg-orange-100 text-orange-800 text-xs">
                          Em breve
                        </Badge>
                      )}
                    </div>

                    <div className="space-y-1 text-xs text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3" />
                        {format(startDate, "dd/MM/yyyy HH:mm", { locale: ptBR })}
                      </div>

                      {meeting.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3 w-3" />
                          {meeting.location}
                        </div>
                      )}

                      {meeting.meetingMembers && meeting.meetingMembers.length > 0 && (
                        <div className="flex items-center gap-2">
                          <Users className="h-3 w-3" />
                          <span>
                            {meeting.meetingMembers.map(m => m.member.name).join(", ")}
                          </span>
                        </div>
                      )}

                      {(meeting.lead || meeting.client) && (
                        <div className="text-xs">
                          {meeting.client && (
                            <span className="text-blue-600">Cliente: {meeting.client.name}</span>
                          )}
                          {meeting.lead && (
                            <span className="text-purple-600">Lead: {meeting.lead.name}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <Link href={`/reunioes`} className="flex-shrink-0">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            )
          })}

          <Link href="/reunioes" className="block">
            <Button variant="outline" className="w-full mt-4">
              Ver Todas as Reuniões
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
