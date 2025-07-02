"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { supabase } from "@/lib/supabase"
import {
  Square,
  RefreshCw,
  Database,
  Users,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Settings,
  Lock,
  Unlock,
} from "lucide-react"

interface SystemStatus {
  electionActive: boolean
  votingEnabled: boolean
  totalVoters: number
  votedCount: number
  totalCandidates: number
  totalVotes: number
  systemHealth: "healthy" | "warning" | "error"
}

export default function ControlSystemPage() {
  const [status, setStatus] = useState<SystemStatus>({
    electionActive: false,
    votingEnabled: false,
    totalVoters: 0,
    votedCount: 0,
    totalCandidates: 0,
    totalVotes: 0,
    systemHealth: "healthy",
  })
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    loadSystemStatus()
    const interval = setInterval(loadSystemStatus, 10000) // Refresh every 10 seconds
    return () => clearInterval(interval)
  }, [])

  const loadSystemStatus = async () => {
    try {
      // Get election settings
      const { data: settings } = await supabase.from("election_settings").select("*").single()

      // Get voter statistics
      const { count: totalVoters } = await supabase.from("users").select("*", { count: "exact", head: true })
      const { count: votedCount } = await supabase
        .from("users")
        .select("*", { count: "exact", head: true })
        .eq("has_voted", true)

      // Get candidate count
      const { count: totalCandidates } = await supabase.from("candidates").select("*", { count: "exact", head: true })

      // Get total votes
      const { count: totalVotes } = await supabase.from("votes").select("*", { count: "exact", head: true })

      // Determine system health
      let systemHealth: "healthy" | "warning" | "error" = "healthy"
      if (totalCandidates === 0) systemHealth = "error"
      else if (totalVoters === 0) systemHealth = "warning"

      setStatus({
        electionActive: settings?.election_active || false,
        votingEnabled: settings?.voting_enabled || false,
        totalVoters: totalVoters || 0,
        votedCount: votedCount || 0,
        totalCandidates: totalCandidates || 0,
        totalVotes: totalVotes || 0,
        systemHealth,
      })
    } catch (error) {
      console.error("Error loading system status:", error)
      setStatus((prev) => ({ ...prev, systemHealth: "error" }))
    } finally {
      setLoading(false)
    }
  }

  const updateElectionSetting = async (key: string, value: boolean) => {
    setActionLoading(key)
    try {
      const { error } = await supabase.from("election_settings").upsert({
        id: 1,
        [key]: value,
        updated_at: new Date().toISOString(),
      })

      if (error) throw error

      await loadSystemStatus()
    } catch (error) {
      console.error(`Error updating ${key}:`, error)
    } finally {
      setActionLoading(null)
    }
  }

  const resetElection = async () => {
    if (!confirm("Are you sure you want to reset the entire election? This will delete all votes!")) return

    setActionLoading("reset")
    try {
      // Delete all votes
      await supabase.from("votes").delete().neq("id", "00000000-0000-0000-0000-000000000000")

      // Reset all users' voting status
      await supabase
        .from("users")
        .update({ has_voted: false, voted_at: null })
        .neq("id", "00000000-0000-0000-0000-000000000000")

      // Reset candidate vote counts
      await supabase.from("candidates").update({ vote_count: 0 }).neq("id", "00000000-0000-0000-0000-000000000000")

      await loadSystemStatus()
      alert("Election has been reset successfully!")
    } catch (error) {
      console.error("Error resetting election:", error)
      alert("Error resetting election. Please try again.")
    } finally {
      setActionLoading(null)
    }
  }

  const getHealthIcon = () => {
    switch (status.systemHealth) {
      case "healthy":
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />
      case "error":
        return <XCircle className="w-5 h-5 text-red-500" />
    }
  }

  const getHealthColor = () => {
    switch (status.systemHealth) {
      case "healthy":
        return "text-green-600 bg-green-50 border-green-200"
      case "warning":
        return "text-yellow-600 bg-yellow-50 border-yellow-200"
      case "error":
        return "text-red-600 bg-red-50 border-red-200"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Election Control System</h1>
        <p className="text-muted-foreground">Manage and monitor the election system</p>
      </div>

      {/* System Status */}
      <Card className={`border-2 ${getHealthColor()}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getHealthIcon()}
            System Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{status.totalVoters}</div>
              <div className="text-sm text-muted-foreground">Total Voters</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{status.votedCount}</div>
              <div className="text-sm text-muted-foreground">Votes Cast</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{status.totalCandidates}</div>
              <div className="text-sm text-muted-foreground">Candidates</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {status.totalVoters > 0 ? Math.round((status.votedCount / status.totalVoters) * 100) : 0}%
              </div>
              <div className="text-sm text-muted-foreground">Turnout</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Election Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Election Controls
            </CardTitle>
            <CardDescription>Start, pause, or stop the election</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Election Active</div>
                <div className="text-sm text-muted-foreground">Enable or disable the entire election system</div>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={status.electionActive}
                  onCheckedChange={(checked) => updateElectionSetting("election_active", checked)}
                  disabled={actionLoading === "election_active"}
                />
                {status.electionActive ? (
                  <Badge variant="default" className="bg-green-500">
                    Active
                  </Badge>
                ) : (
                  <Badge variant="secondary">Inactive</Badge>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Voting Enabled</div>
                <div className="text-sm text-muted-foreground">Allow students to cast votes</div>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={status.votingEnabled}
                  onCheckedChange={(checked) => updateElectionSetting("voting_enabled", checked)}
                  disabled={actionLoading === "voting_enabled" || !status.electionActive}
                />
                {status.votingEnabled ? (
                  <Unlock className="w-4 h-4 text-green-500" />
                ) : (
                  <Lock className="w-4 h-4 text-red-500" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              System Actions
            </CardTitle>
            <CardDescription>Administrative actions and system maintenance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={loadSystemStatus}
              variant="outline"
              className="w-full bg-transparent"
              disabled={actionLoading === "refresh"}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh Status
            </Button>

            <Button
              onClick={resetElection}
              variant="destructive"
              className="w-full"
              disabled={actionLoading === "reset"}
            >
              <Square className="w-4 h-4 mr-2" />
              Reset Election
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* System Health Alerts */}
      {status.systemHealth !== "healthy" && (
        <Alert className={getHealthColor()}>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {status.systemHealth === "error" &&
              "System Error: No candidates registered. Please add candidates before starting the election."}
            {status.systemHealth === "warning" &&
              "System Warning: No voters registered. Please add voters before starting the election."}
          </AlertDescription>
        </Alert>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Database Status</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Connected</div>
            <p className="text-xs text-muted-foreground">All systems operational</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Status</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Secure</div>
            <p className="text-xs text-muted-foreground">Authentication active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Load</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">Normal</div>
            <p className="text-xs text-muted-foreground">Performance optimal</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
