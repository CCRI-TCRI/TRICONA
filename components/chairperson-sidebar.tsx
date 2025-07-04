"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
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
import { LayoutDashboard, Trophy, BarChart3, FileText, LogOut, Crown, Eye } from "lucide-react"

const menuItems = [
  {
    title: "Overview",
    items: [
      {
        title: "Dashboard",
        url: "/chairperson/dashboard",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    title: "Election Results",
    items: [
      {
        title: "Live Results",
        url: "/chairperson/results",
        icon: Trophy,
      },
      {
        title: "Analytics",
        url: "/chairperson/analytics",
        icon: BarChart3,
      },
      {
        title: "Reports",
        url: "/chairperson/reports",
        icon: FileText,
      },
    ],
  },
  {
    title: "Monitoring",
    items: [
      {
        title: "Live Broadcast",
        url: "/chairperson/live-results",
        icon: Eye,
      },
    ],
  },
]

export function ChairpersonSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-4 py-2">
          <Crown className="w-8 h-8 text-purple-600" />
          <div>
            <h2 className="text-lg font-semibold">Electoral Commission</h2>
            <p className="text-sm text-muted-foreground">Chairperson Dashboard</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {menuItems.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={pathname === item.url}>
                      <Link href={item.url}>
                        <item.icon className="w-4 h-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/">
                <LogOut className="w-4 h-4" />
                <span>Back to Voting</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
