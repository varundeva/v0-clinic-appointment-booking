"use client"

import { useState } from "react"
import { useAppointmentStore } from "@/lib/appointment-store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  CalendarDays,
  Clock,
  CheckCircle2,
  Phone,
  UserX,
  Stethoscope,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  X,
  ClipboardList,
} from "lucide-react"
import { format, addDays, subDays } from "date-fns"

export function AppointmentDoctorView() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [calendarOpen, setCalendarOpen] = useState(false)

  const {
    getTodaysScheduledAppointments,
    getAppointmentsByDate,
    completeAppointment,
    markNoShow,
    confirmAppointment,
    cancelAppointment,
  } = useAppointmentStore()

  const todaysAppointments = getTodaysScheduledAppointments()
  const confirmedAppointments = todaysAppointments.filter((a) => a.status === "confirmed")
  const completedAppointments = todaysAppointments.filter((a) => a.status === "completed")
  const pendingCount = todaysAppointments.filter((a) => a.status === "scheduled").length
  const nextAppointment = confirmedAppointments[0]

  const selectedDateAppointments = getAppointmentsByDate(format(selectedDate, "yyyy-MM-dd"))

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-success text-success-foreground"
      case "scheduled":
        return "bg-warning text-warning-foreground"
      case "completed":
        return "bg-muted text-muted-foreground"
      case "cancelled":
        return "bg-destructive/10 text-destructive"
      case "no-show":
        return "bg-destructive/10 text-destructive"
      default:
        return "bg-secondary text-secondary-foreground"
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-3 text-center">
            <CalendarDays className="h-4 w-4 mx-auto mb-1 text-[color:var(--appointment-color)]" />
            <p className="text-xl font-bold">{confirmedAppointments.length}</p>
            <p className="text-xs text-muted-foreground">Scheduled</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <Clock className="h-4 w-4 mx-auto mb-1 text-[color:var(--appointment-color)]" />
            <p className="text-xl font-bold">{nextAppointment?.timeSlot || "-"}</p>
            <p className="text-xs text-muted-foreground">Next</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <AlertCircle className="h-4 w-4 mx-auto mb-1 text-warning" />
            <p className="text-xl font-bold">{pendingCount}</p>
            <p className="text-xs text-muted-foreground">Pending</p>
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

      {/* Today's Header */}
      <div className="p-3 rounded-xl bg-muted/50 text-center">
        <p className="text-sm text-muted-foreground">Today</p>
        <p className="font-semibold">{format(new Date(), "EEEE, MMMM d, yyyy")}</p>
      </div>

      {/* Next Appointment - Always visible */}
      {nextAppointment && (
        <Card className="border-[color:var(--appointment-color)]/30 bg-[color:var(--appointment-color)]/5">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Stethoscope className="h-4 w-4" />
                Next Appointment
              </CardTitle>
              <Badge className={getStatusColor(nextAppointment.status)}>{nextAppointment.timeSlot}</Badge>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-[color:var(--appointment-color)] flex items-center justify-center">
                <Stethoscope className="h-7 w-7 text-white" />
              </div>
              <div>
                <p className="font-semibold text-lg">{nextAppointment.patientName}</p>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  {nextAppointment.patientPhone}
                </p>
              </div>
            </div>

            {nextAppointment.reason && (
              <div className="p-3 rounded-lg bg-card">
                <p className="text-xs text-muted-foreground mb-1">Reason for Visit</p>
                <p className="text-sm">{nextAppointment.reason}</p>
              </div>
            )}

            <div className="flex gap-2">
              <Button onClick={() => completeAppointment(nextAppointment.id)} className="flex-1 gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Mark Complete
              </Button>
              <Button variant="outline" onClick={() => markNoShow(nextAppointment.id)} className="gap-2">
                <UserX className="h-4 w-4" />
                No Show
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="schedule" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="schedule" className="gap-1">
            <CalendarDays className="h-3 w-3" />
            Today
          </TabsTrigger>
          <TabsTrigger value="manage" className="gap-1">
            <ClipboardList className="h-3 w-3" />
            Manage
          </TabsTrigger>
          <TabsTrigger value="completed" className="gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Done
          </TabsTrigger>
        </TabsList>

        {/* Today's Schedule Tab */}
        <TabsContent value="schedule" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Today's Schedule ({confirmedAppointments.length})</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[250px]">
                {confirmedAppointments.length === 0 ? (
                  <div className="p-6 text-center text-muted-foreground">
                    <CalendarDays className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No more appointments scheduled</p>
                  </div>
                ) : (
                  <div className="flex flex-col">
                    {confirmedAppointments.map((appointment, index) => (
                      <div
                        key={appointment.id}
                        className={`flex items-center justify-between p-3 border-b border-border last:border-0 ${
                          index === 0 ? "bg-[color:var(--appointment-color)]/5" : ""
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-[color:var(--appointment-color)]/10 flex items-center justify-center text-sm font-bold text-[color:var(--appointment-color)]">
                            {appointment.timeSlot}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{appointment.patientName}</p>
                            <p className="text-xs text-muted-foreground">{appointment.patientPhone}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {index === 0 && (
                            <Badge variant="outline" className="text-xs mr-1">
                              Next
                            </Badge>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => completeAppointment(appointment.id)}
                            title="Complete"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5 text-success" />
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

        <TabsContent value="manage" className="mt-4 space-y-4">
          {/* Date Navigation */}
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <Button variant="ghost" size="icon" onClick={() => setSelectedDate(subDays(selectedDate, 1))}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="gap-2 bg-transparent text-sm">
                      <CalendarDays className="h-4 w-4" />
                      {format(selectedDate, "EEE, MMM d")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="center">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => {
                        if (date) setSelectedDate(date)
                        setCalendarOpen(false)
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>

                <Button variant="ghost" size="icon" onClick={() => setSelectedDate(addDays(selectedDate, 1))}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Appointments List for Selected Date */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Appointments ({selectedDateAppointments.length})</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[200px]">
                {selectedDateAppointments.length === 0 ? (
                  <div className="p-6 text-center text-muted-foreground">
                    <CalendarDays className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No appointments for this date</p>
                  </div>
                ) : (
                  <div className="flex flex-col">
                    {selectedDateAppointments
                      .sort((a, b) => a.timeSlot.localeCompare(b.timeSlot))
                      .map((appointment) => (
                        <div
                          key={appointment.id}
                          className="p-3 border-b border-border last:border-0 hover:bg-muted/50"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-[color:var(--appointment-color)]/10 flex items-center justify-center">
                                <Clock className="h-4 w-4 text-[color:var(--appointment-color)]" />
                              </div>
                              <div>
                                <p className="font-medium text-sm">{appointment.timeSlot}</p>
                                <p className="text-xs">{appointment.patientName}</p>
                              </div>
                            </div>
                            <Badge className={`${getStatusColor(appointment.status)} text-xs`}>
                              {appointment.status}
                            </Badge>
                          </div>

                          {appointment.status === "scheduled" && (
                            <div className="flex gap-2 mt-2">
                              <Button
                                size="sm"
                                onClick={() => confirmAppointment(appointment.id)}
                                className="gap-1 bg-success hover:bg-success/90 h-7 text-xs"
                              >
                                <CheckCircle2 className="h-3 w-3" />
                                Confirm
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => cancelAppointment(appointment.id)}
                                className="gap-1 h-7 text-xs"
                              >
                                <X className="h-3 w-3" />
                                Cancel
                              </Button>
                            </div>
                          )}
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
                    <p className="text-sm">No completed appointments yet</p>
                  </div>
                ) : (
                  <div className="flex flex-col">
                    {completedAppointments.map((appointment) => (
                      <div
                        key={appointment.id}
                        className="flex items-center justify-between p-3 border-b border-border last:border-0"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center">
                            <CheckCircle2 className="h-4 w-4 text-success" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{appointment.patientName}</p>
                            <p className="text-xs text-muted-foreground">{appointment.timeSlot}</p>
                          </div>
                        </div>
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
