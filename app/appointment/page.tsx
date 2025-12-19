"use client"

import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { ArrowLeft, User, UserCog, Stethoscope } from "lucide-react"
import { AppointmentPatientView } from "@/components/appointment/patient-view"
import { AppointmentReceptionistView } from "@/components/appointment/receptionist-view"
import { AppointmentDoctorView } from "@/components/appointment/doctor-view"

export default function AppointmentPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="font-semibold text-foreground">Appointments</h1>
            <p className="text-xs text-muted-foreground">Schedule for future dates</p>
          </div>
          <div className="w-8 h-8 rounded-lg bg-[color:var(--appointment-color)]/10 flex items-center justify-center">
            <span className="text-xs font-bold text-[color:var(--appointment-color)]">A</span>
          </div>
        </div>
      </header>

      {/* Main Content with Tabs */}
      <main className="flex-1 max-w-4xl mx-auto px-4 py-6 w-full">
        <Tabs defaultValue="patient" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="patient" className="gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Patient</span>
            </TabsTrigger>
            <TabsTrigger value="receptionist" className="gap-2">
              <UserCog className="h-4 w-4" />
              <span className="hidden sm:inline">Reception</span>
            </TabsTrigger>
            <TabsTrigger value="doctor" className="gap-2">
              <Stethoscope className="h-4 w-4" />
              <span className="hidden sm:inline">Doctor</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="patient">
            <AppointmentPatientView />
          </TabsContent>

          <TabsContent value="receptionist">
            <AppointmentReceptionistView />
          </TabsContent>

          <TabsContent value="doctor">
            <AppointmentDoctorView />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
