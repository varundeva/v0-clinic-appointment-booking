"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAppointmentStore } from "@/lib/appointment-store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { CalendarDays, Clock, CheckCircle2, X, ChevronLeft, ChevronRight } from "lucide-react"
import type { ScheduledAppointment } from "@/lib/types"
import { format, addDays, isBefore, startOfDay } from "date-fns"

export function AppointmentPatientView() {
  const [bookedAppointment, setBookedAppointment] = useState<ScheduledAppointment | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(addDays(new Date(), 1))
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [reason, setReason] = useState("")
  const [step, setStep] = useState<"date" | "slot" | "details" | "confirm">("date")

  const { bookScheduledAppointment, getAvailableSlots, getAppointmentById, cancelAppointment, clinicSettings } =
    useAppointmentStore()

  // Check localStorage for existing appointment
  useEffect(() => {
    const saved = localStorage.getItem("bookedAppointment")
    if (saved) {
      setBookedAppointment(JSON.parse(saved))
    }
  }, [])

  // Update appointment status
  useEffect(() => {
    if (bookedAppointment) {
      const interval = setInterval(() => {
        const updated = getAppointmentById(bookedAppointment.id)
        if (updated) {
          setBookedAppointment(updated)
          localStorage.setItem("bookedAppointment", JSON.stringify(updated))
        }
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [bookedAppointment, getAppointmentById])

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date)
    setSelectedSlot(null)
    if (date) setStep("slot")
  }

  const handleSlotSelect = (slot: string) => {
    setSelectedSlot(slot)
    setStep("details")
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedDate || !selectedSlot || !name.trim() || !phone.trim()) return

    const dateStr = format(selectedDate, "yyyy-MM-dd")
    const appointment = bookScheduledAppointment(name, phone, dateStr, selectedSlot, reason)
    setBookedAppointment(appointment)
    localStorage.setItem("bookedAppointment", JSON.stringify(appointment))

    // Reset form
    setName("")
    setPhone("")
    setReason("")
    setSelectedDate(addDays(new Date(), 1))
    setSelectedSlot(null)
    setStep("date")
  }

  const handleCancel = () => {
    if (bookedAppointment) {
      cancelAppointment(bookedAppointment.id)
      setBookedAppointment(null)
      localStorage.removeItem("bookedAppointment")
    }
  }

  const availableSlots = selectedDate ? getAvailableSlots(format(selectedDate, "yyyy-MM-dd")) : []

  const isDateDisabled = (date: Date) => {
    const today = startOfDay(new Date())
    const dayOfWeek = date.getDay()
    return isBefore(date, today) || !clinicSettings.workingDays.includes(dayOfWeek)
  }

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
      default:
        return "bg-secondary text-secondary-foreground"
    }
  }

  if (bookedAppointment && bookedAppointment.status !== "cancelled" && bookedAppointment.status !== "completed") {
    return (
      <div className="flex flex-col gap-6">
        <Card className="border-2 border-[color:var(--appointment-color)]/20 bg-[color:var(--appointment-color)]/5">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Your Appointment</CardTitle>
              <Badge className={getStatusColor(bookedAppointment.status)}>
                {bookedAppointment.status === "confirmed" ? "Confirmed" : "Pending"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {/* Appointment Details */}
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="text-center p-4 rounded-xl bg-card">
                <CalendarDays className="h-6 w-6 mx-auto mb-2 text-[color:var(--appointment-color)]" />
                <p className="text-lg font-bold text-foreground">
                  {format(new Date(bookedAppointment.date), "MMM d, yyyy")}
                </p>
                <p className="text-xs text-muted-foreground">Date</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-card">
                <Clock className="h-6 w-6 mx-auto mb-2 text-[color:var(--appointment-color)]" />
                <p className="text-lg font-bold text-foreground">{bookedAppointment.timeSlot}</p>
                <p className="text-xs text-muted-foreground">Time</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-card">
              <p className="text-sm text-muted-foreground">Patient Name</p>
              <p className="font-medium">{bookedAppointment.patientName}</p>
              {bookedAppointment.reason && (
                <>
                  <p className="text-sm text-muted-foreground mt-2">Reason</p>
                  <p className="text-sm">{bookedAppointment.reason}</p>
                </>
              )}
            </div>

            {bookedAppointment.status === "confirmed" && (
              <div className="p-4 rounded-xl bg-success/10 border border-success/20 text-center">
                <CheckCircle2 className="h-6 w-6 mx-auto mb-2 text-success" />
                <p className="font-medium text-foreground">Appointment Confirmed!</p>
                <p className="text-sm text-muted-foreground">Please arrive 10 minutes before your scheduled time</p>
              </div>
            )}

            <Button variant="outline" onClick={handleCancel} className="w-full gap-2 bg-transparent">
              <X className="h-4 w-4" />
              Cancel Appointment
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-2">
        {["date", "slot", "details"].map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step === s
                  ? "bg-[color:var(--appointment-color)] text-white"
                  : ["date", "slot", "details"].indexOf(step) > i
                    ? "bg-success text-success-foreground"
                    : "bg-muted text-muted-foreground"
              }`}
            >
              {i + 1}
            </div>
            {i < 2 && <div className="w-8 h-0.5 bg-muted" />}
          </div>
        ))}
      </div>

      {/* Date Selection */}
      {step === "date" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Select Date</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              disabled={isDateDisabled}
              className="rounded-md border"
            />
          </CardContent>
        </Card>
      )}

      {/* Time Slot Selection */}
      {step === "slot" && selectedDate && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="sm" onClick={() => setStep("date")} className="gap-1">
                <ChevronLeft className="h-4 w-4" />
                Back
              </Button>
              <CardTitle className="text-lg">{format(selectedDate, "EEEE, MMM d")}</CardTitle>
              <div className="w-16" />
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              <div className="grid grid-cols-3 gap-2">
                {availableSlots.map((slot) => (
                  <Button
                    key={slot.time}
                    variant={slot.available ? "outline" : "ghost"}
                    disabled={!slot.available}
                    onClick={() => handleSlotSelect(slot.time)}
                    className={`${
                      selectedSlot === slot.time
                        ? "border-[color:var(--appointment-color)] bg-[color:var(--appointment-color)]/10"
                        : ""
                    } ${!slot.available ? "opacity-40 line-through" : ""}`}
                  >
                    {slot.time}
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Patient Details */}
      {step === "details" && selectedDate && selectedSlot && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="sm" onClick={() => setStep("slot")} className="gap-1">
                <ChevronLeft className="h-4 w-4" />
                Back
              </Button>
              <CardTitle className="text-lg">Your Details</CardTitle>
              <div className="w-16" />
            </div>
          </CardHeader>
          <CardContent>
            {/* Selected Summary */}
            <div className="p-3 mb-4 rounded-xl bg-muted/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{format(selectedDate, "MMM d, yyyy")}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{selectedSlot}</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="a-name">Full Name</Label>
                <Input
                  id="a-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="a-phone">Phone Number</Label>
                <Input
                  id="a-phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter phone number"
                  type="tel"
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="a-reason">Reason for Visit (Optional)</Label>
                <Textarea
                  id="a-reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Brief description of your concern"
                  rows={3}
                />
              </div>
              <Button
                type="submit"
                className="w-full gap-2 bg-[color:var(--appointment-color)] hover:bg-[color:var(--appointment-color)]/90"
              >
                <ChevronRight className="h-4 w-4" />
                Book Appointment
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
