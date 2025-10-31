import { Card } from "@/components/ui/card"
import { Calendar, CheckCircle, Clock } from "lucide-react"

interface MeetingsStatsProps {
  totalMeetings: number
  upcomingMeetings: number
  completedMeetings: number
}

export function MeetingsStats({
  totalMeetings,
  upcomingMeetings,
  completedMeetings,
}: MeetingsStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm font-medium">Total de Reuniões</p>
            <p className="text-3xl font-bold mt-2">{totalMeetings}</p>
          </div>
          <Calendar className="h-12 w-12 text-blue-500 opacity-20" />
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm font-medium">Próximas Reuniões</p>
            <p className="text-3xl font-bold mt-2">{upcomingMeetings}</p>
          </div>
          <Clock className="h-12 w-12 text-orange-500 opacity-20" />
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm font-medium">Reuniões Concluídas</p>
            <p className="text-3xl font-bold mt-2">{completedMeetings}</p>
          </div>
          <CheckCircle className="h-12 w-12 text-green-500 opacity-20" />
        </div>
      </Card>
    </div>
  )
}
