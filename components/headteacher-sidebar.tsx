"use client"

import { useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from "@/components/ui/sidebar"
import { GraduationCap, BarChart3, FileText, LogOut, Users } from "lucide-react"
import Image from "next/image"

export function HeadteacherSidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    await new Promise((resolve) => setTimeout(resolve, 500))
    sessionStorage.removeItem("headteacher-auth")
    router.push("/headteacher/login")
  }

  const menuItems = [
    {
      title: "Dashboard",
      icon: BarChart3,
      href: "/headteacher/dashboard",
    },
    {
      title: "Student Leadership",
      icon: Users,
      href: "/headteacher/results",
    },
    {
      title: "Election Reports",
      icon: FileText,
      href: "/headteacher/reports",
    },
  ]

  return (
    <Sidebar className="border-r border-green-200 bg-gradient-to-b from-green-50 to-white">
      <SidebarHeader className="border-b border-green-200 p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-green-900">School Administration</h2>
            <p className="text-sm text-green-600">Headteacher Portal</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-4">
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href}
                className="w-full justify-start gap-3 h-11 text-green-700 hover:bg-green-100 data-[active=true]:bg-green-200 data-[active=true]:text-green-900"
              >
                <Button variant="ghost" onClick={() => router.push(item.href)}>
                  <item.icon className="w-4 h-4" />
                  {item.title}
                </Button>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-green-200">
        <div className="flex items-center gap-3 mb-4">
          <Image src="/school-logo.png" alt="School Logo" width={32} height={32} className="rounded" />
          <div className="text-sm">
            <div className="font-medium text-green-900">Lubiri Secondary</div>
            <div className="text-green-600">Election System</div>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="w-full justify-start gap-2 border-green-200 text-green-700 hover:bg-green-50 bg-transparent"
        >
          <LogOut className="w-4 h-4" />
          {isLoggingOut ? "Logging out..." : "Logout"}
        </Button>
      </SidebarFooter>
    </Sidebar>
  )
}
