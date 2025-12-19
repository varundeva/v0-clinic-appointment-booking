"use client"

import { create } from "zustand"
import type { ScheduledAppointment, ScheduledAppointmentStatus, ClinicSettings, TimeSlot } from "./types"

interface AppointmentStore {
  // Scheduled appointments
  scheduledAppointments: ScheduledAppointment[]

  // Clinic settings
  clinicSettings: ClinicSettings

  // Actions
  bookScheduledAppointment: (
    name: string,
    phone: string,
    date: string,
    timeSlot: string,
    reason?: string,
  ) => ScheduledAppointment
  confirmAppointment: (appointmentId: string) => void
  completeAppointment: (appointmentId: string, notes?: string) => void
  cancelAppointment: (appointmentId: string) => void
  markNoShow: (appointmentId: string) => void
  getAppointmentsByDate: (date: string) => ScheduledAppointment[]
  getAvailableSlots: (date: string) => TimeSlot[]
  getAppointmentById: (id: string) => ScheduledAppointment | undefined
  getPatientAppointments: (phone: string) => ScheduledAppointment[]
  getTodaysScheduledAppointments: () => ScheduledAppointment[]
  updateClinicSettings: (settings: Partial<ClinicSettings>) => void
}

const generateId = () => Math.random().toString(36).substring(2, 9)

const DEFAULT_SETTINGS: ClinicSettings = {
  workingDays: [1, 2, 3, 4, 5, 6], // Monday to Saturday
  startTime: "09:00",
  endTime: "18:00",
  slotDuration: 20, // 20 minutes per slot
  maxAdvanceBookingDays: 30,
}

// Helper to generate time slots
const generateTimeSlots = (startTime: string, endTime: string, duration: number): string[] => {
  const slots: string[] = []
  const [startHour, startMin] = startTime.split(":").map(Number)
  const [endHour, endMin] = endTime.split(":").map(Number)

  let currentHour = startHour
  let currentMin = startMin

  while (currentHour < endHour || (currentHour === endHour && currentMin < endMin)) {
    slots.push(`${currentHour.toString().padStart(2, "0")}:${currentMin.toString().padStart(2, "0")}`)
    currentMin += duration
    if (currentMin >= 60) {
      currentHour += Math.floor(currentMin / 60)
      currentMin = currentMin % 60
    }
  }

  return slots
}

export const useAppointmentStore = create<AppointmentStore>((set, get) => ({
  scheduledAppointments: [],
  clinicSettings: DEFAULT_SETTINGS,

  bookScheduledAppointment: (name, phone, date, timeSlot, reason) => {
    const appointment: ScheduledAppointment = {
      id: generateId(),
      patientId: generateId(),
      patientName: name,
      patientPhone: phone,
      date,
      timeSlot,
      status: "scheduled",
      reason,
      bookedAt: new Date(),
    }

    set((state) => ({
      scheduledAppointments: [...state.scheduledAppointments, appointment],
    }))

    return appointment
  },

  confirmAppointment: (appointmentId) => {
    set((state) => ({
      scheduledAppointments: state.scheduledAppointments.map((a) =>
        a.id === appointmentId
          ? { ...a, status: "confirmed" as ScheduledAppointmentStatus, confirmedAt: new Date() }
          : a,
      ),
    }))
  },

  completeAppointment: (appointmentId, notes) => {
    set((state) => ({
      scheduledAppointments: state.scheduledAppointments.map((a) =>
        a.id === appointmentId
          ? { ...a, status: "completed" as ScheduledAppointmentStatus, completedAt: new Date(), notes }
          : a,
      ),
    }))
  },

  cancelAppointment: (appointmentId) => {
    set((state) => ({
      scheduledAppointments: state.scheduledAppointments.map((a) =>
        a.id === appointmentId ? { ...a, status: "cancelled" as ScheduledAppointmentStatus } : a,
      ),
    }))
  },

  markNoShow: (appointmentId) => {
    set((state) => ({
      scheduledAppointments: state.scheduledAppointments.map((a) =>
        a.id === appointmentId ? { ...a, status: "no-show" as ScheduledAppointmentStatus } : a,
      ),
    }))
  },

  getAppointmentsByDate: (date) => {
    return get().scheduledAppointments.filter((a) => a.date === date && a.status !== "cancelled")
  },

  getAvailableSlots: (date) => {
    const { clinicSettings, scheduledAppointments } = get()
    const allSlots = generateTimeSlots(clinicSettings.startTime, clinicSettings.endTime, clinicSettings.slotDuration)

    const bookedSlots = scheduledAppointments
      .filter((a) => a.date === date && a.status !== "cancelled")
      .map((a) => a.timeSlot)

    return allSlots.map((time) => ({
      time,
      available: !bookedSlots.includes(time),
      appointmentId: scheduledAppointments.find(
        (a) => a.date === date && a.timeSlot === time && a.status !== "cancelled",
      )?.id,
    }))
  },

  getAppointmentById: (id) => {
    return get().scheduledAppointments.find((a) => a.id === id)
  },

  getPatientAppointments: (phone) => {
    return get().scheduledAppointments.filter((a) => a.patientPhone === phone)
  },

  getTodaysScheduledAppointments: () => {
    const today = new Date().toISOString().split("T")[0]
    return get()
      .scheduledAppointments.filter((a) => a.date === today && a.status !== "cancelled")
      .sort((a, b) => a.timeSlot.localeCompare(b.timeSlot))
  },

  updateClinicSettings: (settings) => {
    set((state) => ({
      clinicSettings: { ...state.clinicSettings, ...settings },
    }))
  },
}))
