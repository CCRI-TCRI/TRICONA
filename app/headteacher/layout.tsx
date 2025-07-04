"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { HeadteacherSidebar } from "@/components/headteacher-sidebar"

interface HeadteacherLayoutProps {
  children: React.ReactNode
}

export default function HeadteacherLayout({ children }: HeadteacherLayoutProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Check authentication on component mount
    checkAuth()

    // Set up interval to periodically check auth status
    const interval = setInterval(checkAuth, 60000) // Check every minute

    return () => clearInterval(interval)
  }, [])

  const checkAuth = () => {
    // Skip auth check for login page
    if (pathname === "/headteacher/login") {
      setIsLoading(false)
      return
    }

    try {
      const authData = localStorage.getItem("headteacherAuth")

      if (!authData) {
        redirectToLogin()
        return
      }

      const auth = JSON.parse(authData)

      // Check if session is expired
      if (!auth.isAuthenticated || auth.expiresAt < Date.now()) {
        redirectToLogin()
        return
      }

      setIsAuthenticated(true)
      setIsLoading(false)
    } catch (error) {
      console.error("Auth check error:", error)
      redirectToLogin()
    }
  }

  const redirectToLogin = () => {
    setIsAuthenticated(false)
    setIsLoading(false)

    // Clear auth data
    localStorage.removeItem("headteacherAuth")

    // Redirect to login page if not already there
    if (pathname !== "/headteacher/login") {
      router.push("/headteacher/login")
    }
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-green-600">Loading...</p>
        </div>
      </div>
    )
  }

  // For login page, don't show sidebar
  if (pathname === "/headteacher/login") {
    return <>{children}</>
  }

  // For authenticated pages, show sidebar layout
  if (isAuthenticated) {
    return (
      <SidebarProvider>
        <HeadteacherSidebar />
        <SidebarInset>
          <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  // Fallback - should not reach here
  return null
}
