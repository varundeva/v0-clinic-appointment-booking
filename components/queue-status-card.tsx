"use client"

import { useQueueStore } from "@/lib/queue-store"
import { Card, CardContent } from "@/components/ui/card"
import { Users, Clock, UserCheck } from "lucide-react"

export function QueueStatusCard() {
  const { clinicStatus, appointments, getWaitingCount } = useQueueStore()

  const waitingCount = getWaitingCount()
  const inProgress = appointments.find((a) => a.status === "in-progress")
  const estimatedWait = waitingCount * clinicStatus.averageConsultationTime

  return (
    <div className="grid grid-cols-3 gap-3">
      <Card className="bg-card border-border">
        <CardContent className="p-4 text-center">
          <Users className="h-6 w-6 mx-auto mb-2 text-primary" />
          <p className="text-2xl font-bold text-foreground">{waitingCount}</p>
          <p className="text-xs text-muted-foreground">Waiting</p>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardContent className="p-4 text-center">
          <UserCheck className="h-6 w-6 mx-auto mb-2 text-primary" />
          <p className="text-2xl font-bold text-foreground">{inProgress ? `#${inProgress.tokenNumber}` : "--"}</p>
          <p className="text-xs text-muted-foreground">Now Serving</p>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardContent className="p-4 text-center">
          <Clock className="h-6 w-6 mx-auto mb-2 text-primary" />
          <p className="text-2xl font-bold text-foreground">{estimatedWait}</p>
          <p className="text-xs text-muted-foreground">Min Wait</p>
        </CardContent>
      </Card>
    </div>
  )
}
