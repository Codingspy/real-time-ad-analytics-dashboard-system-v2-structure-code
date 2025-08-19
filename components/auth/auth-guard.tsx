"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

interface AuthGuardProps {
  children: React.ReactNode
  requireAuth?: boolean
}

export function AuthGuard({ children, requireAuth = true }: AuthGuardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const router = useRouter()

  useEffect(() => {
    // Check authentication status
    const checkAuth = () => {
      // In a real app, this would check JWT token, session, etc.
      const isLoggedIn = localStorage.getItem("isAuthenticated") === "true"
      setIsAuthenticated(isLoggedIn)

      if (requireAuth && !isLoggedIn) {
        router.push("/auth/login")
      } else if (!requireAuth && isLoggedIn) {
        router.push("/dashboard")
      }
    }

    checkAuth()
  }, [requireAuth, router])

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (requireAuth && !isAuthenticated) {
    return null
  }

  if (!requireAuth && isAuthenticated) {
    return null
  }

  return <>{children}</>
}
