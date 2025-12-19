export type UserRole = "patient" | "receptionist" | "doctor"

export type AppointmentStatus = "waiting" | "in-progress" | "completed" | "cancelled" | "no-show"

export type ScheduledAppointmentStatus = "scheduled" | "confirmed" | "completed" | "cancelled" | "no-show"

export interface Patient {
  id: string
  name: string
  phone: string
  createdAt: Date
}

// Existing Token/Queue Appointment
export interface Appointment {
  id: string
  tokenNumber: number
  patientId: string
  patientName: string
  patientPhone: string
  status: AppointmentStatus
  bookedAt: Date
  calledAt?: Date
  completedAt?: Date
  estimatedWaitMinutes?: number
}

export interface ScheduledAppointment {
  id: string
  patientId: string
  patientName: string
  patientPhone: string
  date: string // YYYY-MM-DD format
  timeSlot: string // HH:MM format
  status: ScheduledAppointmentStatus
  reason?: string
  notes?: string
  bookedAt: Date
  confirmedAt?: Date
  completedAt?: Date
}

export interface TimeSlot {
  time: string
  available: boolean
  appointmentId?: string
}

export interface ClinicStatus {
  isOpen: boolean
  currentToken: number | null
  totalTokensToday: number
  averageConsultationTime: number // in minutes
}

export interface ClinicSettings {
  workingDays: number[] // 0-6, Sunday = 0
  startTime: string // HH:MM
  endTime: string // HH:MM
  slotDuration: number // in minutes
  maxAdvanceBookingDays: number
}
