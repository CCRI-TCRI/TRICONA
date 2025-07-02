"use client"

import { useState, useEffect } from "react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  LayoutDashboard,
  Users,
  Vote,
  Trophy,
  BarChart3,
  Settings,
  FileText,
  Eye,
  UserPlus,
  Calendar,
  Shield,
  LogOut,
  ChevronUp,
  Crown,
  GraduationCap,
  User,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

interface AdminUser {
  id: string
  username: string
  role: string
  full_name: string
  email: string
  profile_picture?: string
}

export function AdminSidebar() {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null)
  const pathname = usePathname()

  useEffect(() => {
    // Mock admin user - in production, get from authentication
    setAdminUser({
      id: "1",
      username: "admin",
      role: "manager",
      full_name: "System Administrator",
      email: "admin@lubiri.edu.ug",
    })
  }, [])

  const handleLogout = () => {
    // Handle logout logic
    window.location.href = "/admin/login"
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "manager":
        return <User className="w-4 h-4" />
      case "chairperson":
        return <Crown className="w-4 h-4" />
      case "headteacher":
        return <GraduationCap className="w-4 h-4" />
      default:
        return <Shield className="w-4 h-4" />
    }
  }

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case "manager":
        return "System Manager"
      case "chairperson":
        return "Electoral Commission Chairperson"
      case "headteacher":
        return "Head Teacher"
      default:
        return "Administrator"
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "manager":
        return "bg-red-100 text-red-800"
      case "chairperson":
        return "bg-blue-100 text-blue-800"
      case "headteacher":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const navigationItems = [
    {
      title: "Dashboard",
      url: "/admin/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Live Results",
      url: "/admin/results",
      icon: Eye,
    },
    {
      title: "Voter Management",
      url: "/admin/voters",
      icon: Users,
    },
    {
      title: "Candidate Management",
      url: "/admin/candidates",
      icon: Trophy,
    },
    {
      title: "Vote Management",
      url: "/admin/votes",
      icon: Vote,
    },
    {
      title: "Analytics",
      url: "/admin/analytics",
      icon: BarChart3,
    },
    {
      title: "Reports",
      url: "/admin/reports",
      icon: FileText,
    },
    {
      title: "Settings",
      url: "/admin/settings",
      icon: Settings,
    },
  ]

  return (
    <Sidebar variant="inset">
      <SidebarHeader>
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Lubiri E-Voting</h2>
            <p className="text-sm text-muted-foreground">Admin Portal</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url}>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Quick Actions</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/admin/candidates/new">
                    <UserPlus />
                    <span>Add Candidate</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/admin/elections/schedule">
                    <Calendar />
                    <span>Schedule Election</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src={adminUser?.profile_picture || "/placeholder.svg"} alt={adminUser?.full_name} />
                    <AvatarFallback className="rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                      {adminUser?.full_name
                        ?.split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{adminUser?.full_name}</span>
                    <span className="truncate text-xs">{adminUser?.email}</span>
                  </div>
                  <ChevronUp className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side="bottom"
                align="end"
                sideOffset={4}
              >
                <div className="p-2">
                  <div className="flex items-center gap-2 mb-2">
                    {getRoleIcon(adminUser?.role || "")}
                    <Badge className={getRoleBadgeColor(adminUser?.role || "")} variant="secondary">
                      {getRoleDisplayName(adminUser?.role || "")}
                    </Badge>
                  </div>
                </div>
                <DropdownMenuItem>
                  <User className="w-4 h-4 mr-2" />
                  Profile Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
