"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/lib/supabase"
import { BarChart3, Users, Vote, TrendingUp, Clock, PieChart, Activity } from "lucide-react"

interface AnalyticsData {
  totalVoters: number
  votedCount: number
  pendingCount: number
  turnoutRate: number
  votesByClass: { class: string; count: number; percentage: number }[]
  votesByHour: { hour: string; count: number }[]
  positionStats: { position: string; votes: number; candidates: number }[]
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalVoters: 0,
    votedCount: 0,
    pendingCount: 0,
    turnoutRate: 0,
    votesByClass: [],
    votesByHour: [],
    positionStats: [],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
    const interval = setInterval(fetchAnalytics, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const fetchAnalytics = async () => {
    try {
      // Get voter statistics
      const { data: voters, error: votersError } = await supabase.from("users").select("class, has_voted, voted_at")

      if (votersError) throw votersError

      const totalVoters = voters?.length || 0
      const votedCount = voters?.filter((v) => v.has_voted).length || 0
      const pendingCount = totalVoters - votedCount
      const turnoutRate = totalVoters > 0 ? (votedCount / totalVoters) * 100 : 0

      // Votes by class
      const classCounts: { [key: string]: number } = {}
      voters?.forEach((voter) => {
        if (voter.has_voted) {
          classCounts[voter.class] = (classCounts[voter.class] || 0) + 1
        }
      })

      const votesByClass = Object.entries(classCounts)
        .map(([className, count]) => ({
          class: className,
          count,
          percentage: votedCount > 0 ? (count / votedCount) * 100 : 0,
        }))
        .sort((a, b) => b.count - a.count)

      // Votes by hour
      const hourCounts: { [key: string]: number } = {}
      voters?.forEach((voter) => {
        if (voter.voted_at) {
          const hour = new Date(voter.voted_at).getHours()
          const hourKey = `${hour}:00`
          hourCounts[hourKey] = (hourCounts[hourKey] || 0) + 1
        }
      })

      const votesByHour = Object.entries(hourCounts)
        .map(([hour, count]) => ({
          hour,
          count,
        }))
        .sort((a, b) => Number.parseInt(a.hour) - Number.parseInt(b.hour))

      // Position statistics
      const { data: positions, error: positionsError } = await supabase.from("positions").select("id, name")

      if (positionsError) throw positionsError

      const positionStats = await Promise.all(
        (positions || []).map(async (position) => {
          const { count: candidateCount } = await supabase
            .from("candidates")
            .select("*", { count: "exact", head: true })
            .eq("position_id", position.id)

          const { count: voteCount } = await supabase
            .from("votes")
            .select("candidates!inner(*)", { count: "exact", head: true })
            .eq("candidates.position_id", position.id)

          return {
            position: position.name,
            votes: voteCount || 0,
            candidates: candidateCount || 0,
          }
        }),
      )

      setAnalytics({
        totalVoters,
        votedCount,
        pendingCount,
        turnoutRate,
        votesByClass,
        votesByHour,
        positionStats,
      })
    } catch (error) {
      console.error("Error fetching analytics:", error)
    } finally {
      setLoading(false)
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
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        <p className="text-muted-foreground">Detailed insights and voting patterns</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Voters</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalVoters}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Votes Cast</CardTitle>
            <Vote className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{analytics.votedCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{analytics.pendingCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Turnout Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{analytics.turnoutRate.toFixed(1)}%</div>
            <Progress value={analytics.turnoutRate} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Votes by Class */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="w-5 h-5" />
              Participation by Class
            </CardTitle>
            <CardDescription>Voting participation across different classes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.votesByClass.map((classData, index) => (
                <div key={classData.class} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Class {classData.class}</Badge>
                      <span className="text-sm text-muted-foreground">{classData.count} votes</span>
                    </div>
                    <span className="text-sm font-medium">{classData.percentage.toFixed(1)}%</span>
                  </div>
                  <Progress value={classData.percentage} />
                </div>
              ))}
              {analytics.votesByClass.length === 0 && (
                <p className="text-center text-muted-foreground py-4">No voting data available yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Voting Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Voting Timeline
            </CardTitle>
            <CardDescription>Votes cast throughout the day</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.votesByHour.map((hourData, index) => (
                <div key={hourData.hour} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{hourData.hour}</span>
                    <span className="text-sm text-muted-foreground">{hourData.count} votes</span>
                  </div>
                  <Progress value={analytics.votedCount > 0 ? (hourData.count / analytics.votedCount) * 100 : 0} />
                </div>
              ))}
              {analytics.votesByHour.length === 0 && (
                <p className="text-center text-muted-foreground py-4">No hourly data available yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Position Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Position Statistics
          </CardTitle>
          <CardDescription>Voting activity by position</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.positionStats.map((position, index) => (
              <div key={position.position} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">{position.position}</h4>
                  <p className="text-sm text-muted-foreground">{position.candidates} candidates</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">{position.votes}</p>
                  <p className="text-sm text-muted-foreground">votes</p>
                </div>
              </div>
            ))}
            {analytics.positionStats.length === 0 && (
              <p className="text-center text-muted-foreground py-4">No position data available</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
