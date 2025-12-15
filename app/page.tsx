"use client"

import { useAuth } from "@/lib/auth-context-new"
import { LoginForm } from "@/components/auth/login-form"
import { KiaDashboard } from "@/components/kia-dashboard-improved"

export default function Dashboard() {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <LoginForm />
  }

  return <KiaDashboard />
}



