"use client"

import type React from "react"
import { useState } from "react"
import { useQueueStore } from "@/lib/queue-store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Users,
  Clock,
  CheckCircle2,
  Phone,
  PlayCircle,
  UserX,
  ArrowRight,
  Plus,
  RefreshCw,
  X,
  Stethoscope,
  ClipboardList,
} from "lucide-react"

export function TokenDoctorView() {
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")

  const {
    clinicStatus,
    appointments,
    openClinic,
    closeClinic,
    callNextPatient,
    completeCurrentPatient,
    markNoShow,
    getWaitingCount,
    bookAppointment,
    cancelAppointment,
    resetDay,
  } = useQueueStore()

  const currentPatient = appointments.find((a) => a.status === "in-progress")
  const waitingAppointments = appointments.filter((a) => a.status === "waiting")
  const completedAppointments = appointments.filter((a) => a.status === "completed")
  const nextPatient = waitingAppointments[0]

  const handleAddPatient = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !phone.trim()) return
    bookAppointment(name, phone)
    setName("")
    setPhone("")
  }

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
      <div className="grid grid-cols-4 gap-3">
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
            <p className="text-xs text-muted-foreground">Total</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <CheckCircle2 className="h-4 w-4 mx-auto mb-1 text-success" />
            <p className="text-xl font-bold">{completedAppointments.length}</p>
            <p className="text-xs text-muted-foreground">Done</p>
          </CardContent>
        </Card>
      </div>

      {/* Current Patient - Always visible at top */}
      <Card className={currentPatient ? "border-primary/30 bg-primary/5" : ""}>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Stethoscope className="h-4 w-4" />
            Current Patient
          </CardTitle>
        </CardHeader>
        <CardContent>
          {currentPatient ? (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-xl font-bold text-primary-foreground">
                    {currentPatient.tokenNumber}
                  </div>
                  <div>
                    <p className="font-semibold">{currentPatient.patientName}</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {currentPatient.patientPhone}
                    </p>
                  </div>
                </div>
                <Badge variant="default">In Progress</Badge>
              </div>
              <div className="flex gap-2">
                <Button onClick={completeCurrentPatient} className="flex-1 gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Complete
                </Button>
                <Button variant="outline" onClick={() => markNoShow(currentPatient.id)} className="gap-2">
                  <UserX className="h-4 w-4" />
                  No Show
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-muted-foreground mb-4">No patient currently</p>
              {nextPatient && (
                <Button onClick={callNextPatient} className="gap-2">
                  <PlayCircle className="h-4 w-4" />
                  Call Next: Token #{nextPatient.tokenNumber}
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Next Up */}
      {currentPatient && nextPatient && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Next Up</CardTitle>
              <Badge variant="outline">Token #{nextPatient.tokenNumber}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{nextPatient.patientName}</p>
                <p className="text-sm text-muted-foreground">{nextPatient.patientPhone}</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="queue" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="add" className="gap-1">
            <Plus className="h-3 w-3" />
            Add
          </TabsTrigger>
          <TabsTrigger value="queue" className="gap-1">
            <ClipboardList className="h-3 w-3" />
            Queue
          </TabsTrigger>
          <TabsTrigger value="completed" className="gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Done
          </TabsTrigger>
        </TabsList>

        <TabsContent value="add" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Add Walk-in Patient</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddPatient} className="flex flex-col gap-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="d-name" className="text-xs">
                      Name
                    </Label>
                    <Input
                      id="d-name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Patient name"
                      className="h-9"
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="d-phone" className="text-xs">
                      Phone
                    </Label>
                    <Input
                      id="d-phone"
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
        </TabsContent>

        <TabsContent value="queue" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Queue ({waitingAppointments.length})</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[250px]">
                {waitingAppointments.length === 0 ? (
                  <div className="p-6 text-center text-muted-foreground">
                    <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No patients in queue</p>
                  </div>
                ) : (
                  <div className="flex flex-col">
                    {waitingAppointments.map((appointment) => (
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
        </TabsContent>

        {/* Completed Today Tab */}
        <TabsContent value="completed" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Completed ({completedAppointments.length})</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[250px]">
                {completedAppointments.length === 0 ? (
                  <div className="p-6 text-center text-muted-foreground">
                    <CheckCircle2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No completed consultations yet</p>
                  </div>
                ) : (
                  <div className="flex flex-col">
                    {completedAppointments.map((appointment) => (
                      <div
                        key={appointment.id}
                        className="flex items-center justify-between p-3 border-b border-border last:border-0"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center text-sm font-bold text-success">
                            {appointment.tokenNumber}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{appointment.patientName}</p>
                            <p className="text-xs text-muted-foreground">
                              Completed at {appointment.completedAt?.toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                        <CheckCircle2 className="h-4 w-4 text-success" />
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
