"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Users, Trophy, BarChart3, Settings, Key, Monitor, ChevronLeft, ChevronRight, Home } from "lucide-react"

interface AdminSidebarProps {
  currentPage: string
  onPageChange: (page: string) => void
  stats?: {
    totalVoters: number
    votedCount: number
    totalCandidates: number
    totalPositions: number
    activeElections: number
  }
}

export function AdminSidebar({ currentPage, onPageChange, stats }: AdminSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const pathname = usePathname()

  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: Home,
      badge: null,
    },
    {
      id: "candidates",
      label: "Candidates",
      icon: Trophy,
      badge: stats?.totalCandidates || 0,
    },
    {
      id: "positions",
      label: "Positions",
      icon: BarChart3,
      badge: stats?.totalPositions || 0,
    },
    {
      id: "voters",
      label: "Voters",
      icon: Users,
      badge: stats?.totalVoters || 0,
    },
    {
      id: "voting-codes",
      label: "Voting Codes",
      icon: Key,
      badge: null,
    },
    {
      id: "election-settings",
      label: "Election Settings",
      icon: Settings,
      badge: null,
    },
  ]

  return (
    <div
      className={cn(
        "flex flex-col h-screen bg-sidebar-background border-r border-sidebar-border transition-all duration-300",
        isCollapsed ? "w-16" : "w-64",
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
        {!isCollapsed && (
          <div>
            <h2 className="text-lg font-bold text-sidebar-foreground">Admin Panel</h2>
            <p className="text-sm text-sidebar-foreground/70">Election Management</p>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-sidebar-foreground hover:bg-sidebar-accent"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = currentPage === item.id

          return (
            <Button
              key={item.id}
              variant={isActive ? "default" : "ghost"}
              className={cn(
                "w-full justify-start gap-3 h-11",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                isCollapsed && "justify-center px-2",
              )}
              onClick={() => onPageChange(item.id)}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && (
                <>
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.badge !== null && (
                    <Badge
                      variant={isActive ? "secondary" : "outline"}
                      className={cn(
                        "ml-auto",
                        isActive
                          ? "bg-sidebar-primary-foreground/20 text-sidebar-primary-foreground border-sidebar-primary-foreground/30"
                          : "bg-sidebar-accent text-sidebar-accent-foreground",
                      )}
                    >
                      {item.badge}
                    </Badge>
                  )}
                </>
              )}
            </Button>
          )
        })}
      </nav>

      {/* Live Results Button */}
      <div className="p-4 border-t border-sidebar-border">
        <Button
          className={cn(
            "w-full bg-gradient-to-r from-chart-1 to-chart-2 text-white hover:from-chart-1/90 hover:to-chart-2/90 shadow-lg",
            isCollapsed && "px-2",
          )}
          onClick={() => onPageChange("live-results")}
        >
          <Monitor className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && <span className="ml-2">Live Results</span>}
        </Button>
      </div>

      {/* Election Status */}
      {!isCollapsed && (
        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-2 text-sm">
            <div className={cn("w-2 h-2 rounded-full", stats?.activeElections ? "bg-green-500" : "bg-red-500")} />
            <span className="text-sidebar-foreground/70">
              {stats?.activeElections ? "Election Active" : "Election Inactive"}
            </span>
          </div>
          {stats && (
            <div className="mt-2 text-xs text-sidebar-foreground/60">
              {stats.votedCount}/{stats.totalVoters} voted (
              {Math.round((stats.votedCount / stats.totalVoters) * 100) || 0}%)
            </div>
          )}
        </div>
      )}
    </div>
  )
}
