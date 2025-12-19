"use client"

import { create } from "zustand"
import type { Appointment, ClinicStatus, Patient } from "./types"

interface QueueStore {
  // Clinic status
  clinicStatus: ClinicStatus

  // Appointments for today
  appointments: Appointment[]

  // Registered patients (for future use)
  patients: Patient[]

  // Actions
  openClinic: () => void
  closeClinic: () => void
  bookAppointment: (name: string, phone: string) => Appointment
  callNextPatient: () => void
  completeCurrentPatient: () => void
  markNoShow: (appointmentId: string) => void
  cancelAppointment: (appointmentId: string) => void
  getQueuePosition: (appointmentId: string) => number
  getWaitingCount: () => number
  getAppointmentById: (id: string) => Appointment | undefined
  resetDay: () => void
}

const generateId = () => Math.random().toString(36).substring(2, 9)

const AVERAGE_CONSULTATION_TIME = 10 // minutes

export const useQueueStore = create<QueueStore>((set, get) => ({
  clinicStatus: {
    isOpen: true,
    currentToken: null,
    totalTokensToday: 0,
    averageConsultationTime: AVERAGE_CONSULTATION_TIME,
  },

  appointments: [],
  patients: [],

  openClinic: () => {
    set((state) => ({
      clinicStatus: { ...state.clinicStatus, isOpen: true },
    }))
  },

  closeClinic: () => {
    set((state) => ({
      clinicStatus: { ...state.clinicStatus, isOpen: false },
    }))
  },

  bookAppointment: (name: string, phone: string) => {
    const state = get()
    const tokenNumber = state.clinicStatus.totalTokensToday + 1
    const waitingCount = state.appointments.filter((a) => a.status === "waiting").length

    const appointment: Appointment = {
      id: generateId(),
      tokenNumber,
      patientId: generateId(),
      patientName: name,
      patientPhone: phone,
      status: "waiting",
      bookedAt: new Date(),
      estimatedWaitMinutes: waitingCount * AVERAGE_CONSULTATION_TIME,
    }

    set((state) => ({
      appointments: [...state.appointments, appointment],
      clinicStatus: {
        ...state.clinicStatus,
        totalTokensToday: tokenNumber,
      },
    }))

    return appointment
  },

  callNextPatient: () => {
    const state = get()
    const nextWaiting = state.appointments.find((a) => a.status === "waiting")

    if (nextWaiting) {
      set((state) => ({
        appointments: state.appointments.map((a) =>
          a.id === nextWaiting.id ? { ...a, status: "in-progress" as const, calledAt: new Date() } : a,
        ),
        clinicStatus: {
          ...state.clinicStatus,
          currentToken: nextWaiting.tokenNumber,
        },
      }))
    }
  },

  completeCurrentPatient: () => {
    const state = get()
    const currentAppointment = state.appointments.find((a) => a.status === "in-progress")

    if (currentAppointment) {
      set((state) => ({
        appointments: state.appointments.map((a) =>
          a.id === currentAppointment.id ? { ...a, status: "completed" as const, completedAt: new Date() } : a,
        ),
        clinicStatus: {
          ...state.clinicStatus,
          currentToken: null,
        },
      }))
    }
  },

  markNoShow: (appointmentId: string) => {
    set((state) => ({
      appointments: state.appointments.map((a) => (a.id === appointmentId ? { ...a, status: "no-show" as const } : a)),
    }))
  },

  cancelAppointment: (appointmentId: string) => {
    set((state) => ({
      appointments: state.appointments.map((a) =>
        a.id === appointmentId ? { ...a, status: "cancelled" as const } : a,
      ),
    }))
  },

  getQueuePosition: (appointmentId: string) => {
    const state = get()
    const waitingAppointments = state.appointments.filter((a) => a.status === "waiting")
    const index = waitingAppointments.findIndex((a) => a.id === appointmentId)
    return index + 1
  },

  getWaitingCount: () => {
    const state = get()
    return state.appointments.filter((a) => a.status === "waiting").length
  },

  getAppointmentById: (id: string) => {
    return get().appointments.find((a) => a.id === id)
  },

  resetDay: () => {
    set({
      appointments: [],
      clinicStatus: {
        isOpen: true,
        currentToken: null,
        totalTokensToday: 0,
        averageConsultationTime: AVERAGE_CONSULTATION_TIME,
      },
    })
  },
}))
