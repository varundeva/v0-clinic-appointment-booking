"use client"

import { useState } from "react"
import { useAppointmentStore } from "@/lib/appointment-store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarDays, Clock, CheckCircle2, X, Phone, ChevronLeft, ChevronRight, AlertCircle } from "lucide-react"
import { format, addDays, subDays } from "date-fns"

export function AppointmentReceptionistView() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [calendarOpen, setCalendarOpen] = useState(false)

  const { getAppointmentsByDate, confirmAppointment, cancelAppointment, getTodaysScheduledAppointments } =
    useAppointmentStore()

  const appointments = getAppointmentsByDate(format(selectedDate, "yyyy-MM-dd"))
  const todaysAppointments = getTodaysScheduledAppointments()
  const pendingCount = todaysAppointments.filter((a) => a.status === "scheduled").length
  const confirmedCount = todaysAppointments.filter((a) => a.status === "confirmed").length

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
      {/* Today's Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-3 text-center">
            <CalendarDays className="h-4 w-4 mx-auto mb-1 text-[color:var(--appointment-color)]" />
            <p className="text-xl font-bold">{todaysAppointments.length}</p>
            <p className="text-xs text-muted-foreground">Today</p>
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
            <p className="text-xl font-bold">{confirmedCount}</p>
            <p className="text-xs text-muted-foreground">Confirmed</p>
          </CardContent>
        </Card>
      </div>

      {/* Date Navigation */}
      <Card>
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="icon" onClick={() => setSelectedDate(subDays(selectedDate, 1))}>
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="gap-2 bg-transparent">
                  <CalendarDays className="h-4 w-4" />
                  {format(selectedDate, "EEEE, MMMM d, yyyy")}
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

      {/* Appointments List */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Appointments ({appointments.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[400px]">
            {appointments.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground">
                <CalendarDays className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No appointments for this date</p>
              </div>
            ) : (
              <div className="flex flex-col">
                {appointments
                  .sort((a, b) => a.timeSlot.localeCompare(b.timeSlot))
                  .map((appointment) => (
                    <div key={appointment.id} className="p-4 border-b border-border last:border-0 hover:bg-muted/50">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-[color:var(--appointment-color)]/10 flex items-center justify-center">
                            <Clock className="h-5 w-5 text-[color:var(--appointment-color)]" />
                          </div>
                          <div>
                            <p className="font-semibold text-lg">{appointment.timeSlot}</p>
                            <p className="font-medium">{appointment.patientName}</p>
                          </div>
                        </div>
                        <Badge className={getStatusColor(appointment.status)}>{appointment.status}</Badge>
                      </div>

                      <div className="ml-15 pl-15 flex flex-col gap-1 text-sm text-muted-foreground mb-3">
                        <p className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {appointment.patientPhone}
                        </p>
                        {appointment.reason && <p className="text-foreground/70">{appointment.reason}</p>}
                      </div>

                      {appointment.status === "scheduled" && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => confirmAppointment(appointment.id)}
                            className="gap-1 bg-success hover:bg-success/90"
                          >
                            <CheckCircle2 className="h-3 w-3" />
                            Confirm
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => cancelAppointment(appointment.id)}
                            className="gap-1"
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
    </div>
  )
}
