"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { motion } from "framer-motion"
import { Users, Vote, TrendingUp, BarChart3, Clock, Target, Activity, RefreshCw } from "lucide-react"
import { userStorage, candidateStorage, positionStorage, voteStorage, getPositionsWithCandidates } from "@/lib/local-storage"
import { Button } from "@/components/ui/button"

interface AnalyticsData {
  totalVoters: number
  votedCount: number
  pendingVoters: number
  turnoutRate: number
  participationByClass: { class: string; voted: number; total: number; percentage: number }[]
  votingTimeline: { hour: string; votes: number }[]
  positionStats: { position: string; candidates: number; votes: number }[]
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalVoters: 0,
    votedCount: 0,
    pendingVoters: 0,
    turnoutRate: 0,
    participationByClass: [],
    votingTimeline: [],
    positionStats: [],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (typeof window === "undefined") return
    loadAnalytics()
    const interval = setInterval(loadAnalytics, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const loadAnalytics = async () => {
    try {
      if (typeof window === "undefined") return

      const users = userStorage.getAll()
      const votes = voteStorage.getAll()
      const positionsWithCandidates = getPositionsWithCandidates()

      const totalVoters = users.length
      const votedCount = users.filter((u) => u.has_voted).length
      const pendingVoters = totalVoters - votedCount
      const turnoutRate = totalVoters > 0 ? Math.round((votedCount / totalVoters) * 100) : 0

      // Get participation by class
      const classStats: Record<string, { total: number; voted: number }> = {}
      users.forEach((user) => {
        const className = user.class || "Unknown"
        if (!classStats[className]) {
          classStats[className] = { total: 0, voted: 0 }
        }
        classStats[className].total++
        if (user.has_voted) {
          classStats[className].voted++
        }
      })

      const participationByClass = Object.entries(classStats).map(([className, stats]) => ({
        class: className,
        voted: stats.voted,
        total: stats.total,
        percentage: Math.round((stats.voted / stats.total) * 100),
      }))

      // Get voting timeline (group votes by hour)
      const timelineMap: Record<string, number> = {}
      votes.forEach((vote) => {
        const hour = new Date(vote.created_at).getHours()
        const hourKey = `${hour}:00`
        timelineMap[hourKey] = (timelineMap[hourKey] || 0) + 1
      })

      const votingTimeline = Array.from({ length: 12 }, (_, i) => {
        const hour = 8 + i
        const hourKey = `${hour}:00`
        return {
          hour: hourKey,
          votes: timelineMap[hourKey] || 0,
        }
      })

      // Get position statistics
      const positionStats = positionsWithCandidates.map((position) => {
        const positionVotes = votes.filter((v) => v.position_id === position.id)
        return {
          position: position.name,
          candidates: position.candidates.length,
          votes: positionVotes.length,
        }
      })

      setAnalytics({
        totalVoters,
        votedCount,
        pendingVoters,
        turnoutRate,
        participationByClass,
        votingTimeline,
        positionStats,
      })
    } catch (error) {
      console.error("Error loading analytics:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg font-medium">Loading analytics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Election Analytics</h1>
          <p className="text-muted-foreground">Comprehensive analysis of voting patterns and participation</p>
        </div>
        <Button onClick={loadAnalytics} variant="outline" className="flex items-center space-x-2 bg-transparent">
          <RefreshCw className="w-4 h-4" />
          <span>Refresh Data</span>
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}>
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/80">Total Voters</CardTitle>
              <Users className="h-4 w-4 text-white/60" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalVoters}</div>
              <p className="text-xs text-white/80">Registered students</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/80">Votes Cast</CardTitle>
              <Vote className="h-4 w-4 text-white/60" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.votedCount}</div>
              <p className="text-xs text-white/80">Students participated</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/80">Pending</CardTitle>
              <Clock className="h-4 w-4 text-white/60" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.pendingVoters}</div>
              <p className="text-xs text-white/80">Yet to vote</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/80">Turnout Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-white/60" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.turnoutRate}%</div>
              <p className="text-xs text-white/80">Participation rate</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Participation by Class */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Participation by Class
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.participationByClass.map((classData) => (
                  <div key={classData.class} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{classData.class}</span>
                      <Badge variant={classData.percentage > 70 ? "default" : "secondary"}>
                        {classData.voted}/{classData.total} ({classData.percentage}%)
                      </Badge>
                    </div>
                    <Progress value={classData.percentage} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Voting Timeline */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Voting Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics.votingTimeline.map((timeData) => {
                  const maxVotes = Math.max(...analytics.votingTimeline.map((t) => t.votes), 1)
                  return (
                    <div key={timeData.hour} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{timeData.hour}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${(timeData.votes / maxVotes) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground w-8">{timeData.votes}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Position Statistics */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Position Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {analytics.positionStats.map((position) => (
                <div key={position.position} className="border rounded-lg p-4">
                  <h3 className="font-semibold text-lg mb-2">{position.position}</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Candidates</span>
                      <Badge variant="outline">{position.candidates}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Total Votes</span>
                      <Badge>{position.votes}</Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
