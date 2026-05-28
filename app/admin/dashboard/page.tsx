"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { motion, AnimatePresence } from "framer-motion"
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
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
}

const StatCard = ({ title, value, icon: Icon, color, trend, delay = 0 }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    whileHover={{ y: -5 }}
    className="group"
  >
    <Card className={`relative overflow-hidden border-0 shadow-lg bg-gradient-to-br ${color} text-white h-full`}>
      <motion.div
        className="absolute inset-0 opacity-0 group-hover:opacity-10 bg-white transition-opacity"
        animate={{ opacity: [0, 0.1, 0] }}
        transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
      />
      <CardContent className="p-6 relative z-10">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/80 text-sm font-medium mb-2">{title}</p>
            <motion.p
              className="text-4xl font-black"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: delay + 0.2, type: "spring", stiffness: 100 }}
            >
              {value}
            </motion.p>
            {trend && (
              <motion.div
                className="flex items-center mt-3 text-sm font-semibold gap-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: delay + 0.4 }}
              >
                <TrendingUp className="w-4 h-4" />
                <span>{trend}</span>
              </motion.div>
            )}
          </div>
          <motion.div
            animate={{ rotate: 360, scale: [1, 1.1, 1] }}
            transition={{ duration: 15, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
            className="opacity-20"
          >
            <Icon className="w-16 h-16" />
          </motion.div>
        </div>
      </CardContent>
    </Card>
  </motion.div>
)

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
    if (typeof window === "undefined") return
    const initializeAndLoad = async () => {
      try {
        await loadData()
      } catch (error) {
        console.error("Error initializing dashboard:", error)
        setLoading(false)
      }
    }
    initializeAndLoad()
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
    const timeout = setTimeout(() => {
      if (loading) {
        setLoading(false)
      }
    }, 5000)

    try {
      if (typeof window === "undefined" || !window.localStorage) {
        throw new Error("LocalStorage not available")
      }
      await Promise.all([loadStats(), loadPostResults(), loadRecentActivity()])
    } catch (error) {
      console.error("Error loading data:", error)
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
            className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full mx-auto mb-4"
          />
          <p className="text-lg font-semibold text-gray-800">Loading dashboard...</p>
          <p className="text-sm text-gray-500 mt-2">Fetching election data</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10 rounded-2xl blur-2xl" />
        <div className="relative">
          <div className="flex items-center justify-between">
            <div>
              <motion.h1
                className="text-4xl font-black text-gray-900 mb-2"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                Election Dashboard
              </motion.h1>
              <motion.p
                className="text-gray-600 flex items-center gap-2"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Sparkles className="w-5 h-5 text-amber-500" />
                Real-time monitoring and analytics
              </motion.p>
            </div>
            <motion.div
              className="flex gap-3"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Button
                onClick={loadData}
                variant="outline"
                className="gap-2 font-semibold hover:bg-blue-50"
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
              >
                <Badge className="px-4 py-2 bg-green-500/10 text-green-700 border border-green-200 font-semibold">
                  <Eye className="w-4 h-4 mr-2" />
                  Live Updates
                </Badge>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Live Results Button */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        className="flex justify-center"
      >
        <Link href="/admin/live-results" target="_blank">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="relative overflow-hidden">
            <Button
              size="lg"
              className="bg-gradient-to-r from-red-600 to-purple-600 hover:from-red-700 hover:to-purple-700 text-white px-6 py-3 font-semibold shadow-xl"
            >
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                className="mr-2"
              >
                <Tv className="w-5 h-5" />
              </motion.div>
              View Live Results
            </Button>
          </motion.div>
        </Link>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <StatCard
          title="Total Voters"
          value={stats.totalVoters.toLocaleString()}
          icon={Users}
          color="from-blue-500 to-cyan-600"
          trend="Registered students"
          delay={0}
        />
        <StatCard
          title="Voter Turnout"
          value={`${turnoutPercentage}%`}
          icon={TrendingUp}
          color="from-green-500 to-emerald-600"
          trend={`${stats.votedCount}/${stats.totalVoters} voted`}
          delay={0.1}
        />
        <StatCard
          title="Total Candidates"
          value={stats.totalCandidates}
          icon={Trophy}
          color="from-purple-500 to-pink-600"
          trend="Running for office"
          delay={0.2}
        />
        <StatCard
          title="Total Votes"
          value={stats.totalVotes.toLocaleString()}
          icon={Vote}
          color="from-orange-500 to-red-600"
          trend="Votes cast"
          delay={0.3}
        />
      </motion.div>

      {/* Turnout Progress Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="border-0 shadow-lg overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b">
            <CardTitle className="flex items-center gap-3 text-xl">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}>
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </motion.div>
              Voter Participation
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-700">Turnout Progress</span>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700 font-bold text-base">
                    {stats.votedCount} / {stats.totalVoters}
                  </Badge>
                </motion.div>
              </div>
              <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.6, duration: 0.8 }}>
                <Progress value={turnoutPercentage} className="h-4" />
              </motion.div>
              <motion.p
                className="text-sm text-gray-600 text-center font-medium"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                {turnoutPercentage}% of registered students have participated
              </motion.p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Live Election Results */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-2"
        >
          <Card className="border-0 shadow-lg overflow-hidden h-full">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-3">
                  <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}>
                    <CheckCircle2 className="w-6 h-6 text-purple-600" />
                  </motion.div>
                  Live Election Results
                </CardTitle>
                <Badge className="bg-purple-100 text-purple-700 border-purple-200 font-semibold">
                  <Eye className="w-3 h-3 mr-1" />
                  Real-time
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                {postResults.length > 0 ? (
                  postResults.map((post, index) => (
                    <motion.div
                      key={post.postId}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                      className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
                    >
                      <div className={`flex items-center gap-3 p-4 bg-gradient-to-r ${getCategoryColor(post.category)} text-white`}>
                        {getCategoryIcon(post.category)}
                        <div className="flex-1">
                          <h3 className="font-bold text-lg">{post.postTitle}</h3>
                          <Badge className="mt-1 bg-white/20 text-white border-white/30">
                            {post.category}
                          </Badge>
                        </div>
                        <motion.div
                          className="text-right"
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                        >
                          <div className="text-3xl font-black">{post.totalVotes}</div>
                          <div className="text-sm opacity-90">votes</div>
                        </motion.div>
                      </div>

                      <div className="p-4 space-y-3">
                        {post.candidates.map((candidate, candidateIndex) => (
                          <motion.div
                            key={candidate.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.65 + index * 0.1 + candidateIndex * 0.05 }}
                            className={`flex items-center justify-between p-4 rounded-lg transition-all ${
                              candidate.isLeading ? "bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300" : "bg-gray-50 border border-gray-200"
                            }`}
                          >
                            <div className="flex items-center gap-3 flex-1">
                              <motion.div
                                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white ${
                                  candidate.isLeading ? "bg-gradient-to-r from-yellow-400 to-orange-500" : candidateIndex === 0 ? "bg-blue-500" : candidateIndex === 1 ? "bg-gray-400" : "bg-gray-300"
                                }`}
                                animate={candidate.isLeading ? { scale: [1, 1.15, 1] } : {}}
                                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                              >
                                #{candidateIndex + 1}
                              </motion.div>
                              <div className="flex-1">
                                <div className="font-semibold text-gray-900">{candidate.name}</div>
                                <div className="text-sm text-gray-600">{candidate.votes} votes</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <motion.div
                                className="text-2xl font-black text-gray-900"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.7 + index * 0.1 + candidateIndex * 0.05, type: "spring" }}
                              >
                                {candidate.percentage}%
                              </motion.div>
                              {candidate.isLeading && (
                                <motion.div
                                  animate={{ rotate: 360 }}
                                  transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
                                  className="flex items-center justify-end gap-1 mt-1"
                                >
                                  <Trophy className="w-4 h-4 text-yellow-600" />
                                  <span className="text-xs font-bold text-yellow-600">Leading</span>
                                </motion.div>
                              )}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-8">
                    <AlertCircle className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-500 font-medium">No results yet. Waiting for votes...</p>
                  </motion.div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="space-y-6"
        >
          {/* Quick Actions */}
          <Card className="border-0 shadow-lg overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
              <CardTitle className="flex items-center gap-3">
                <Activity className="w-5 h-5 text-blue-600" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {[
                { href: "/admin/voters", label: "Manage Voters", icon: Users, color: "blue" },
                { href: "/admin/candidates", label: "Add Candidates", icon: UserPlus, color: "green" },
                { href: "/admin/results", label: "View Results", icon: BarChart3, color: "purple" },
                { href: "/admin/settings", label: "Settings", icon: Settings, color: "orange" },
              ].map((action, idx) => (
                <motion.div
                  key={action.href}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + idx * 0.05 }}
                  whileHover={{ x: 5 }}
                >
                  <Button asChild className={`w-full justify-start gap-3 bg-${action.color}-50 hover:bg-${action.color}-100 text-${action.color}-700 border border-${action.color}-200`}>
                    <a href={action.href}>
                      <action.icon className="w-4 h-4" />
                      {action.label}
                    </a>
                  </Button>
                </motion.div>
              ))}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="border-0 shadow-lg overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
              <CardTitle className="flex items-center gap-3">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}>
                  <Clock className="w-5 h-5 text-green-600" />
                </motion.div>
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {recentActivity.length > 0 ? (
                  recentActivity.map((activity, index) => (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.8 + index * 0.05 }}
                      className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-100 hover:border-green-300 transition-colors"
                    >
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                        className="w-2 h-2 bg-green-500 rounded-full mt-1.5 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{activity.voter}</p>
                        <p className="text-xs text-gray-600 truncate">{activity.action}</p>
                        <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-gray-500 text-center py-6">
                    No recent activity
                  </motion.p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
