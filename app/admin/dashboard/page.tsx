"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { motion } from "framer-motion"
import Link from "next/link"
import {
  Users,
  Vote,
  Trophy,
  BarChart3,
  TrendingUp,
  RefreshCw,
  Eye,
  Crown,
  Star,
  Activity,
  Calendar,
  Settings,
  UserPlus,
  Tv,
  Zap,
} from "lucide-react"
import { userStorage, candidateStorage, positionStorage, voteStorage, getPositionsWithCandidates } from "@/lib/local-storage"

interface DashboardStats {
  totalVoters: number
  votedCount: number
  totalCandidates: number
  totalVotes: number
}

interface PostResult {
  postId: string
  postTitle: string
  category: string
  candidates: {
    id: string
    name: string
    votes: number
    percentage: number
    isLeading: boolean
  }[]
  totalVotes: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalVoters: 0,
    votedCount: 0,
    totalCandidates: 0,
    totalVotes: 0,
  })
  const [postResults, setPostResults] = useState<PostResult[]>([])
  const [loading, setLoading] = useState(true)
  const [recentActivity, setRecentActivity] = useState<any[]>([])

  useEffect(() => {
    // Ensure we're in the browser
    if (typeof window === "undefined") return

    // Initialize and load data
    const initializeAndLoad = async () => {
      try {
        await loadData()
      } catch (error) {
        console.error("Error initializing dashboard:", error)
        // Always set loading to false even on error
        setLoading(false)
      }
    }

    initializeAndLoad()

    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      if (typeof window !== "undefined") {
        loadData().catch((error) => {
          console.error("Error refreshing data:", error)
        })
      }
    }, 30000)

    return () => {
      clearInterval(interval)
    }
  }, [])

  const loadData = async () => {
    // Safety timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      if (loading) {
        console.warn("Loading timeout - forcing loading state to false")
        setLoading(false)
      }
    }, 5000)

    try {
      // Check if localStorage is available
      if (typeof window === "undefined" || !window.localStorage) {
        throw new Error("LocalStorage not available")
      }

      await Promise.all([loadStats(), loadPostResults(), loadRecentActivity()])
    } catch (error) {
      console.error("Error loading data:", error)
      // Set default values on error
      setStats({
        totalVoters: 0,
        votedCount: 0,
        totalCandidates: 0,
        totalVotes: 0,
      })
      setPostResults([])
      setRecentActivity([])
    } finally {
      clearTimeout(timeout)
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      if (typeof window === "undefined") return

      const users = userStorage.getAll()
      const candidates = candidateStorage.getAll()
      const votes = voteStorage.getAll()

      const totalVoters = users.length
      const votedCount = users.filter((u) => u.has_voted).length
      const totalCandidates = candidates.length
      const totalVotes = votes.length

      setStats({
        totalVoters,
        votedCount,
        totalCandidates,
        totalVotes,
      })
    } catch (error) {
      console.error("Error loading stats:", error)
      // Set default stats on error
      setStats({
        totalVoters: 0,
        votedCount: 0,
        totalCandidates: 0,
        totalVotes: 0,
      })
    }
  }

  const loadPostResults = async () => {
    try {
      if (typeof window === "undefined") {
        setPostResults([])
        return
      }

      const positionsWithCandidates = getPositionsWithCandidates()

      const results = positionsWithCandidates.map((position) => {
        const totalVotesForPosition = position.candidates.reduce((sum, c) => sum + c.vote_count, 0)

        const candidates = position.candidates.map((candidate) => ({
          id: candidate.id,
          name: candidate.full_name,
          votes: candidate.vote_count,
          percentage: totalVotesForPosition > 0 ? Math.round((candidate.vote_count / totalVotesForPosition) * 100) : 0,
          isLeading:
            candidate.vote_count === Math.max(...position.candidates.map((c) => c.vote_count), 0) &&
            candidate.vote_count > 0,
        }))

        return {
          postId: position.id,
          postTitle: position.name,
          category: position.category,
          candidates: candidates.sort((a, b) => b.votes - a.votes),
          totalVotes: totalVotesForPosition,
        }
      })

      setPostResults(results)
    } catch (error) {
      console.error("Error loading post results:", error)
      setPostResults([])
    }
  }

  const loadRecentActivity = async () => {
    try {
      if (typeof window === "undefined") {
        setRecentActivity([])
        return
      }

      const votes = voteStorage.getAll()
      const users = userStorage.getAll()
      const candidates = candidateStorage.getAll()
      const positions = positionStorage.getAll()

      const recentVotes = votes
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 10)

      const activity = recentVotes.map((vote) => {
        const user = users.find((u) => u.id === vote.user_id)
        const candidate = candidates.find((c) => c.id === vote.candidate_id)
        const position = positions.find((p) => p.id === vote.position_id)

        return {
          id: vote.id,
          voter: user ? `Token ${user.token}` : "Unknown",
          action: `voted for ${candidate?.full_name || "Unknown"} (${position?.name || "Unknown"})`,
          time: new Date(vote.created_at).toLocaleString(),
        }
      })

      setRecentActivity(activity)
    } catch (error) {
      console.error("Error loading recent activity:", error)
      setRecentActivity([])
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Senior Leadership":
        return <Crown className="w-6 h-6" />
      case "Entertainment":
        return <Star className="w-6 h-6" />
      case "Games and Sports":
        return <Trophy className="w-6 h-6" />
      default:
        return <Vote className="w-6 h-6" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Senior Leadership":
        return "from-purple-500 via-indigo-500 to-blue-500"
      case "Entertainment":
        return "from-pink-500 via-rose-500 to-red-500"
      case "Games and Sports":
        return "from-green-500 via-emerald-500 to-teal-500"
      default:
        return "from-blue-500 via-purple-500 to-pink-500"
    }
  }

  const turnoutPercentage = stats.totalVoters > 0 ? Math.round((stats.votedCount / stats.totalVoters) * 100) : 0

  const StatCard = ({ title, value, icon: Icon, color, trend, delay = 0 }: any) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ scale: 1.02 }}
    >
      <Card className={`bg-gradient-to-br ${color} text-white border-0 shadow-lg`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm font-medium">{title}</p>
              <motion.p
                className="text-3xl font-bold"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: delay + 0.2 }}
              >
                {value}
              </motion.p>
              {trend && (
                <div className="flex items-center mt-2 text-sm">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  <span>{trend}</span>
                </div>
              )}
            </div>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
              className="opacity-20"
            >
              <Icon className="w-12 h-12" />
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg font-medium">Loading dashboard...</p>
          <p className="text-sm text-muted-foreground mt-2">If this takes too long, please refresh the page</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard</h2>
          <p className="text-gray-600">Election management overview and real-time monitoring</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadData} variant="outline" className="flex items-center space-x-2 bg-transparent">
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </Button>
          <Badge variant="outline" className="px-3 py-1">
            <Eye className="w-4 h-4 mr-1" />
            Live Updates
          </Badge>
        </div>
      </motion.div>

      {/* Animated Live Results Button - Compact */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="flex justify-center"
      >
        <Link href="/admin/live-results" target="_blank">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="relative overflow-hidden">
            <Button
              size="sm"
              className="bg-gradient-to-r from-red-600 to-purple-600 hover:from-red-700 hover:to-purple-700 text-white px-4 py-2 text-sm font-semibold shadow-lg border-0"
            >
              <motion.div
                animate={{
                  rotate: [0, 360],
                }}
                transition={{
                  duration: 2,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "linear",
                }}
                className="mr-2"
              >
                <Tv className="w-4 h-4" />
              </motion.div>
              <span className="relative">
                Live Results
              </span>
            </Button>
          </motion.div>
        </Link>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Voters"
          value={stats.totalVoters.toLocaleString()}
          icon={Users}
          color="from-blue-500 to-blue-600"
          trend="Registered students"
          delay={0}
        />
        <StatCard
          title="Voter Turnout"
          value={`${turnoutPercentage}%`}
          icon={TrendingUp}
          color="from-green-500 to-green-600"
          trend={`${stats.votedCount} students voted`}
          delay={0.1}
        />
        <StatCard
          title="Candidates"
          value={stats.totalCandidates}
          icon={Trophy}
          color="from-purple-500 to-purple-600"
          trend="Running for office"
          delay={0.2}
        />
        <StatCard
          title="Total Votes"
          value={stats.totalVotes.toLocaleString()}
          icon={Vote}
          color="from-orange-500 to-orange-600"
          trend="Individual votes cast"
          delay={0.3}
        />
      </div>

      {/* Turnout Progress */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Election Participation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Voter Turnout Progress</span>
                <Badge variant={turnoutPercentage > 50 ? "default" : "secondary"}>
                  {stats.votedCount} / {stats.totalVoters} voters
                </Badge>
              </div>
              <Progress value={turnoutPercentage} className="h-3" />
              <p className="text-sm text-muted-foreground">
                {turnoutPercentage}% of registered students have participated in the election
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Election Results */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-2"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Live Election Results</span>
                <Badge variant="outline" className="px-3 py-1">
                  <Eye className="w-4 h-4 mr-1" />
                  Real-time
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {postResults.map((post, index) => (
                  <motion.div
                    key={post.postId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div
                      className={`flex items-center gap-3 mb-4 p-3 rounded-lg bg-gradient-to-r ${getCategoryColor(post.category)} text-white`}
                    >
                      {getCategoryIcon(post.category)}
                      <div>
                        <h3 className="font-bold text-lg">{post.postTitle}</h3>
                        <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                          {post.category}
                        </Badge>
                      </div>
                      <div className="ml-auto text-right">
                        <div className="text-2xl font-bold">{post.totalVotes}</div>
                        <div className="text-sm opacity-90">votes</div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {post.candidates.map((candidate, candidateIndex) => (
                        <div
                          key={candidate.id}
                          className={`flex items-center justify-between p-3 rounded-lg transition-all ${
                            candidate.isLeading
                              ? "bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300"
                              : "bg-gray-50 border border-gray-200"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                candidate.isLeading
                                  ? "bg-yellow-500 text-white"
                                  : candidateIndex === 0
                                    ? "bg-blue-500 text-white"
                                    : candidateIndex === 1
                                      ? "bg-gray-400 text-white"
                                      : "bg-gray-300 text-gray-700"
                              }`}
                            >
                              {candidateIndex + 1}
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900">{candidate.name}</div>
                              <div className="text-sm text-gray-600">{candidate.votes} votes</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-gray-900">{candidate.percentage}%</div>
                            {candidate.isLeading && (
                              <div className="text-xs text-yellow-600 font-medium flex items-center gap-1">
                                <Trophy className="w-3 h-3" />
                                Leading
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7 }}
          className="space-y-6"
        >
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                asChild
                className="w-full justify-start bg-blue-500/10 hover:bg-blue-500/20 text-blue-700 border border-blue-200"
              >
                <a href="/admin/candidates">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add New Candidate
                </a>
              </Button>
              <Button
                asChild
                className="w-full justify-start bg-green-500/10 hover:bg-green-500/20 text-green-700 border border-green-200"
              >
                <a href="/admin/positions">
                  <Vote className="w-4 h-4 mr-2" />
                  Manage Positions
                </a>
              </Button>
              <Button
                asChild
                className="w-full justify-start bg-purple-500/10 hover:bg-purple-500/20 text-purple-700 border border-purple-200"
              >
                <a href="/admin/voters">
                  <Users className="w-4 h-4 mr-2" />
                  Voter Management
                </a>
              </Button>
              <Button
                asChild
                className="w-full justify-start bg-orange-500/10 hover:bg-orange-500/20 text-orange-700 border border-orange-200"
              >
                <a href="/admin/settings">
                  <Calendar className="w-4 h-4 mr-2" />
                  Election Schedule
                </a>
              </Button>
              <Button
                asChild
                className="w-full justify-start bg-red-500/10 hover:bg-red-500/20 text-red-700 border border-red-200"
              >
                <a href="/admin/settings">
                  <Settings className="w-4 h-4 mr-2" />
                  System Settings
                </a>
              </Button>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {recentActivity.map((activity, index) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 + index * 0.1 }}
                    className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg"
                  >
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.voter}</p>
                      <p className="text-xs text-gray-600">{activity.action}</p>
                    </div>
                    <span className="text-xs text-gray-500">{activity.time}</span>
                  </motion.div>
                ))}
                {recentActivity.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">No recent activity</p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
