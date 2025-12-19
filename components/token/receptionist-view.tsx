"use client"

import type React from "react"

import { useState } from "react"
import { useQueueStore } from "@/lib/queue-store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Users, Clock, Plus, RefreshCw, X, UserX, Phone } from "lucide-react"

export function TokenReceptionistView() {
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const {
    clinicStatus,
    appointments,
    openClinic,
    closeClinic,
    bookAppointment,
    cancelAppointment,
    markNoShow,
    resetDay,
    getWaitingCount,
  } = useQueueStore()

  const handleAddPatient = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !phone.trim()) return
    bookAppointment(name, phone)
    setName("")
    setPhone("")
  }

  const waitingAppointments = appointments.filter((a) => a.status === "waiting")
  const inProgressAppointment = appointments.find((a) => a.status === "in-progress")

  return (
    <div className="flex flex-col gap-6">
      {/* Control Bar */}
      <div className="flex items-center justify-between gap-3">
        <Button variant="outline" size="sm" onClick={resetDay} className="gap-2 bg-transparent">
          <RefreshCw className="h-3 w-3" />
          Reset Day
        </Button>
        <Button
          variant={clinicStatus.isOpen ? "destructive" : "default"}
          size="sm"
          onClick={clinicStatus.isOpen ? closeClinic : openClinic}
        >
          {clinicStatus.isOpen ? "Close Clinic" : "Open Clinic"}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-3 text-center">
            <Users className="h-4 w-4 mx-auto mb-1 text-primary" />
            <p className="text-xl font-bold">{getWaitingCount()}</p>
            <p className="text-xs text-muted-foreground">Waiting</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <Clock className="h-4 w-4 mx-auto mb-1 text-primary" />
            <p className="text-xl font-bold">{clinicStatus.currentToken || "-"}</p>
            <p className="text-xs text-muted-foreground">Current</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <Plus className="h-4 w-4 mx-auto mb-1 text-primary" />
            <p className="text-xl font-bold">{clinicStatus.totalTokensToday}</p>
            <p className="text-xs text-muted-foreground">Total Today</p>
          </CardContent>
        </Card>
      </div>

      {/* Add Walk-in Patient */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Add Walk-in Patient</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddPatient} className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="r-name" className="text-xs">
                  Name
                </Label>
                <Input
                  id="r-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Patient name"
                  className="h-9"
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="r-phone" className="text-xs">
                  Phone
                </Label>
                <Input
                  id="r-phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Phone number"
                  type="tel"
                  className="h-9"
                  required
                />
              </div>
            </div>
            <Button type="submit" size="sm" className="gap-2" disabled={!clinicStatus.isOpen}>
              <Plus className="h-4 w-4" />
              Add to Queue
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Currently Serving */}
      {inProgressAppointment && (
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Now Serving</CardTitle>
              <Badge>Token #{inProgressAppointment.tokenNumber}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{inProgressAppointment.patientName}</p>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  {inProgressAppointment.patientPhone}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Queue List */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Queue ({waitingAppointments.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[300px]">
            {waitingAppointments.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground">
                <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No patients in queue</p>
              </div>
            ) : (
              <div className="flex flex-col">
                {waitingAppointments.map((appointment, index) => (
                  <div
                    key={appointment.id}
                    className="flex items-center justify-between p-3 border-b border-border last:border-0 hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                        {appointment.tokenNumber}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{appointment.patientName}</p>
                        <p className="text-xs text-muted-foreground">{appointment.patientPhone}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => markNoShow(appointment.id)}
                        title="Mark as No Show"
                      >
                        <UserX className="h-3.5 w-3.5 text-muted-foreground" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => cancelAppointment(appointment.id)}
                        title="Cancel"
                      >
                        <X className="h-3.5 w-3.5 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
