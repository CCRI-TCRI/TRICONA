"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ChairpersonSidebar } from "@/components/chairperson-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"

export default function ChairpersonLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = () => {
      const authStatus = sessionStorage.getItem("chairperson-auth")
      if (authStatus === "authenticated") {
        setIsAuthenticated(true)
      } else {
        router.push("/chairperson/login")
      }
      setIsLoading(false)
    }

    checkAuth()

    // Listen for auth changes across tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "chairperson-auth" && e.newValue !== "authenticated") {
        router.push("/chairperson/login")
      }
    }

    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <ChairpersonSidebar />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </SidebarProvider>
  )
}
