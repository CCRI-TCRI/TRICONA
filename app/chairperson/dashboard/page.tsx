"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Shield, Users, Vote, TrendingUp, Clock, CheckCircle, AlertCircle, BarChart3, RefreshCw } from "lucide-react"
import { motion } from "framer-motion"

export default function ChairpersonDashboard() {
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState(new Date())
  const [electionData, setElectionData] = useState({
    totalVoters: 1247,
    votescast: 892,
    turnoutRate: 71.5,
    activePositions: 8,
    totalCandidates: 24,
    electionStatus: "Active",
    recentActivity: [
      { time: "2 min ago", action: "Vote cast for Head Boy position", voter: "Student #1234" },
      { time: "3 min ago", action: "Vote cast for Head Girl position", voter: "Student #5678" },
      { time: "5 min ago", action: "Vote cast for Sports Captain position", voter: "Student #9012" },
      { time: "7 min ago", action: "Vote cast for Head Boy position", voter: "Student #3456" },
    ],
    positionStats: [
      { position: "Head Boy", votes: 156, candidates: 3, completion: 87 },
      { position: "Head Girl", votes: 142, candidates: 3, completion: 79 },
      { position: "Sports Captain", votes: 134, candidates: 4, completion: 75 },
      { position: "Academic Captain", votes: 128, candidates: 2, completion: 71 },
      { position: "Entertainment Captain", votes: 119, candidates: 3, completion: 66 },
      { position: "Discipline Captain", votes: 113, candidates: 2, completion: 63 },
    ],
  })

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdated(new Date())
      // Simulate real-time updates
      setElectionData((prev) => ({
        ...prev,
        votescast: prev.votescast + Math.floor(Math.random() * 3),
        turnoutRate: ((prev.votescast + Math.floor(Math.random() * 3)) / prev.totalVoters) * 100,
      }))
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  const handleRefresh = () => {
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      setLastUpdated(new Date())
    }, 1000)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
          <p className="text-blue-600 font-medium">Loading Electoral Commission Dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold text-blue-900 flex items-center gap-3">
              <Shield className="w-8 h-8 text-blue-600" />
              Electoral Commission Dashboard
            </h1>
            <p className="text-blue-600 mt-1">Real-time election monitoring and oversight</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-blue-600">Last updated: {lastUpdated.toLocaleTimeString()}</div>
            <Button onClick={handleRefresh} variant="outline" size="sm" className="border-blue-200 bg-transparent">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </motion.div>

        {/* Status Banner */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <div>
                  <div className="font-semibold text-green-800">Election Status: {electionData.electionStatus}</div>
                  <div className="text-sm text-green-700">All systems operational - Voting in progress</div>
                </div>
                <Badge variant="outline" className="ml-auto border-green-300 text-green-700">
                  Live
                </Badge>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Key Metrics */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[
            {
              title: "Total Registered Voters",
              value: electionData.totalVoters.toLocaleString(),
              icon: Users,
              color: "blue",
              delay: 0.2,
            },
            {
              title: "Votes Cast",
              value: electionData.votescast.toLocaleString(),
              icon: Vote,
              color: "green",
              delay: 0.3,
            },
            {
              title: "Voter Turnout",
              value: `${electionData.turnoutRate.toFixed(1)}%`,
              icon: TrendingUp,
              color: "purple",
              delay: 0.4,
            },
            {
              title: "Active Positions",
              value: electionData.activePositions.toString(),
              icon: BarChart3,
              color: "orange",
              delay: 0.5,
            },
          ].map((metric, index) => (
            <motion.div
              key={metric.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: metric.delay }}
            >
              <Card className="border-blue-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-600">{metric.title}</p>
                      <p className="text-2xl font-bold text-blue-900">{metric.value}</p>
                    </div>
                    <div className={`w-12 h-12 rounded-full bg-${metric.color}-100 flex items-center justify-center`}>
                      <metric.icon className={`w-6 h-6 text-${metric.color}-600`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Position Statistics */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <Card className="border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-900 flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Position Voting Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {electionData.positionStats.map((position, index) => (
                  <div key={position.position} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="font-medium text-blue-900">{position.position}</div>
                        <Badge variant="outline" className="text-xs">
                          {position.candidates} candidates
                        </Badge>
                      </div>
                      <div className="text-sm text-blue-600">
                        {position.votes} votes ({position.completion}%)
                      </div>
                    </div>
                    <Progress value={position.completion} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Activity */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
          <Card className="border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-900 flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Recent Voting Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {electionData.recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-blue-900">{activity.action}</div>
                      <div className="text-xs text-blue-600">
                        {activity.voter} • {activity.time}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* System Status */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
          <Card className="border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-900 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                System Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                {[
                  { component: "Voting System", status: "Operational", color: "green" },
                  { component: "Database", status: "Operational", color: "green" },
                  { component: "Authentication", status: "Operational", color: "green" },
                ].map((system) => (
                  <div key={system.component} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium text-gray-900">{system.component}</span>
                    <Badge variant="outline" className={`border-${system.color}-300 text-${system.color}-700`}>
                      {system.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
