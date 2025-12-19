import Link from "next/link"
import { Stethoscope, Clock, CalendarDays, ArrowRight, Users, Timer, CalendarCheck } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Stethoscope className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="font-semibold text-foreground text-lg">City Clinic</h1>
              <p className="text-xs text-muted-foreground">Healthcare Made Simple</p>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground text-balance mb-4">
            Skip the Wait,
            <br />
            <span className="text-primary">Not the Care</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-balance">
            Book your spot in the queue or schedule an appointment for later. Track your position in real-time from
            anywhere.
          </p>
        </div>
      </section>

      {/* Main Selection Cards */}
      <main className="flex-1 max-w-4xl mx-auto px-4 pb-12 w-full">
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {/* Token System Card */}
          <Link href="/token" className="group">
            <div className="relative h-full rounded-2xl border-2 border-border bg-card p-6 hover:border-primary/50 hover:shadow-lg transition-all duration-300 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                  <Clock className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Token System</h3>
                <p className="text-muted-foreground text-sm mb-6">
                  Get a token for today and track your position in the queue in real-time. Perfect for walk-ins.
                </p>
                <div className="flex flex-col gap-2 mb-6">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Timer className="h-4 w-4 text-primary" />
                    <span>Real-time queue tracking</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4 text-primary" />
                    <span>See patients ahead of you</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-primary font-medium group-hover:gap-3 transition-all">
                  <span>Get Token</span>
                  <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            </div>
          </Link>

          {/* Appointment System Card */}
          <Link href="/appointment" className="group">
            <div className="relative h-full rounded-2xl border-2 border-border bg-card p-6 hover:border-[color:var(--appointment-color)]/50 hover:shadow-lg transition-all duration-300 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[color:var(--appointment-color)]/5 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-[color:var(--appointment-color)]/10 flex items-center justify-center mb-4">
                  <CalendarDays className="h-7 w-7 text-[color:var(--appointment-color)]" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Book Appointment</h3>
                <p className="text-muted-foreground text-sm mb-6">
                  Schedule your visit for a future date. Choose your preferred time slot and plan ahead.
                </p>
                <div className="flex flex-col gap-2 mb-6">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CalendarCheck className="h-4 w-4 text-[color:var(--appointment-color)]" />
                    <span>Choose date & time</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4 text-[color:var(--appointment-color)]" />
                    <span>No waiting in queue</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-[color:var(--appointment-color)] font-medium group-hover:gap-3 transition-all">
                  <span>Book Now</span>
                  <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Role Selection */}
        <div className="border-t border-border pt-8">
          <h3 className="text-center text-sm font-medium text-muted-foreground mb-6">Staff Access</h3>
          <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
            <Link
              href="/staff/receptionist"
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-border bg-card hover:bg-secondary/50 transition-colors"
            >
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Receptionist</span>
            </Link>
            <Link
              href="/staff/doctor"
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-border bg-card hover:bg-secondary/50 transition-colors"
            >
              <Stethoscope className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Doctor</span>
            </Link>
          </div>
        </div>

        {/* Demo Notice */}
        <div className="mt-8 p-4 bg-muted/50 rounded-xl text-center">
          <p className="text-sm text-muted-foreground">
            <strong>Demo Mode:</strong> Open multiple tabs to simulate different users and see real-time updates.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-4 bg-card/50">
        <p className="text-center text-xs text-muted-foreground">City Clinic Queue System v2.0</p>
      </footer>
    </div>
  )
}
