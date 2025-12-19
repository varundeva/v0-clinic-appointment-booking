"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useQueueStore } from "@/lib/queue-store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Users, Clock, AlertCircle, CheckCircle2, Timer, X, MapPin } from "lucide-react"
import type { Appointment } from "@/lib/types"

export function TokenPatientView() {
  const [currentAppointment, setCurrentAppointment] = useState<Appointment | null>(null)
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const { clinicStatus, bookAppointment, getQueuePosition, getWaitingCount, getAppointmentById, cancelAppointment } =
    useQueueStore()

  // Check localStorage for existing appointment on mount
  useEffect(() => {
    const saved = localStorage.getItem("currentToken")
    if (saved) {
      setCurrentAppointment(JSON.parse(saved))
    }
  }, [])

  // Update appointment status from store
  useEffect(() => {
    if (currentAppointment) {
      const interval = setInterval(() => {
        const updated = getAppointmentById(currentAppointment.id)
        if (updated) {
          setCurrentAppointment(updated)
          localStorage.setItem("currentToken", JSON.stringify(updated))
        }
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [currentAppointment, getAppointmentById])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !phone.trim()) return

    const appointment = bookAppointment(name, phone)
    setCurrentAppointment(appointment)
    localStorage.setItem("currentToken", JSON.stringify(appointment))
    setName("")
    setPhone("")
  }

  const handleCancel = () => {
    if (currentAppointment) {
      cancelAppointment(currentAppointment.id)
      setCurrentAppointment(null)
      localStorage.removeItem("currentToken")
    }
  }

  const queuePosition = currentAppointment ? getQueuePosition(currentAppointment.id) : 0
  const waitingCount = getWaitingCount()
  const estimatedWait = queuePosition * clinicStatus.averageConsultationTime

  // Determine if patient should leave for clinic
  const shouldLeaveNow = queuePosition <= 3 && queuePosition > 0

  return (
    <div className="flex flex-col gap-6">
      {/* Queue Status Overview */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="bg-card">
          <CardContent className="p-4 text-center">
            <Users className="h-5 w-5 mx-auto mb-1 text-primary" />
            <p className="text-2xl font-bold text-foreground">{waitingCount}</p>
            <p className="text-xs text-muted-foreground">In Queue</p>
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardContent className="p-4 text-center">
            <Clock className="h-5 w-5 mx-auto mb-1 text-primary" />
            <p className="text-2xl font-bold text-foreground">{clinicStatus.currentToken || "-"}</p>
            <p className="text-xs text-muted-foreground">Now Serving</p>
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardContent className="p-4 text-center">
            <div
              className={`h-5 w-5 mx-auto mb-1 rounded-full ${clinicStatus.isOpen ? "bg-success" : "bg-destructive"}`}
            />
            <p className="text-sm font-medium text-foreground">{clinicStatus.isOpen ? "Open" : "Closed"}</p>
            <p className="text-xs text-muted-foreground">Status</p>
          </CardContent>
        </Card>
      </div>

      {currentAppointment ? (
        /* Token Status View */
        <Card className="border-2 border-primary/20 bg-primary/5">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Your Token</CardTitle>
              <Badge variant={currentAppointment.status === "in-progress" ? "default" : "secondary"}>
                {currentAppointment.status === "in-progress" ? "Your Turn!" : "Waiting"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {/* Large Token Number */}
            <div className="text-center py-4">
              <div className="w-24 h-24 mx-auto rounded-2xl bg-primary flex items-center justify-center mb-2">
                <span className="text-4xl font-bold text-primary-foreground">{currentAppointment.tokenNumber}</span>
              </div>
              <p className="text-sm text-muted-foreground">{currentAppointment.patientName}</p>
            </div>

            {currentAppointment.status === "in-progress" ? (
              <div className="p-4 rounded-xl bg-success/10 border border-success/20 text-center">
                <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-success" />
                <p className="font-semibold text-foreground">It&apos;s Your Turn!</p>
                <p className="text-sm text-muted-foreground">Please proceed to the consultation room</p>
              </div>
            ) : (
              <>
                {/* Position & Wait Time */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-card text-center">
                    <p className="text-3xl font-bold text-foreground">{queuePosition}</p>
                    <p className="text-xs text-muted-foreground">Position in Queue</p>
                  </div>
                  <div className="p-3 rounded-xl bg-card text-center">
                    <p className="text-3xl font-bold text-foreground">~{estimatedWait}</p>
                    <p className="text-xs text-muted-foreground">Minutes Wait</p>
                  </div>
                </div>

                {/* Travel Alert */}
                {shouldLeaveNow ? (
                  <div className="p-4 rounded-xl bg-warning/10 border border-warning/20">
                    <div className="flex items-center gap-3">
                      <MapPin className="h-5 w-5 text-warning-foreground shrink-0" />
                      <div>
                        <p className="font-medium text-foreground">Time to Leave!</p>
                        <p className="text-sm text-muted-foreground">
                          Only {queuePosition} patient(s) ahead. Head to the clinic now.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-muted/50">
                    <div className="flex items-center gap-3">
                      <Timer className="h-5 w-5 text-muted-foreground shrink-0" />
                      <div>
                        <p className="font-medium text-foreground">You can wait</p>
                        <p className="text-sm text-muted-foreground">
                          We&apos;ll alert you when 3 patients are left. No need to wait at the clinic.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            <Button variant="outline" onClick={handleCancel} className="w-full gap-2 bg-transparent">
              <X className="h-4 w-4" />
              Cancel Token
            </Button>
          </CardContent>
        </Card>
      ) : (
        /* Booking Form */
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Get Your Token</CardTitle>
          </CardHeader>
          <CardContent>
            {!clinicStatus.isOpen ? (
              <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-center">
                <AlertCircle className="h-8 w-8 mx-auto mb-2 text-destructive" />
                <p className="font-medium text-foreground">Clinic is Closed</p>
                <p className="text-sm text-muted-foreground">Please come back during working hours</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    required
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Enter phone number"
                    type="tel"
                    required
                  />
                </div>
                <Button type="submit" className="w-full">
                  Get Token
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
