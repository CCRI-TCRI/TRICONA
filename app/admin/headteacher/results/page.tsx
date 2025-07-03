"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import {
  Trophy,
  Crown,
  Star,
  RefreshCw,
  Download,
  Printer,
  Calendar,
  Users,
  TrendingUp,
  GraduationCap,
  LogOut,
  School,
  Award,
} from "lucide-react"
import { supabase } from "@/lib/supabase"

interface StudentLeadershipResult {
  postId: string
  postTitle: string
  category: string
  candidates: {
    id: string
    name: string
    votes: number
    percentage: number
    isElected: boolean
    position: number
  }[]
  totalVotes: number
  participationRate: number
}

export default function HeadteacherResults() {
  const [results, setResults] = useState<StudentLeadershipResult[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  const [schoolStats, setSchoolStats] = useState({
    totalStudents: 0,
    participatingStudents: 0,
    participationRate: 0,
    leadershipPositions: 0,
  })
  const router = useRouter()

  useEffect(() => {
    // Check authentication
    const isAuthenticated = sessionStorage.getItem("headteacher_auth")
    if (!isAuthenticated) {
      router.push("/admin/headteacher/login")
      return
    }

    loadResults()

    // Set up real-time subscription
    const subscription = supabase
      .channel("student_leadership_results")
      .on("postgres_changes", { event: "*", schema: "public", table: "votes" }, () => {
        loadResults()
      })
      .subscribe()

    const interval = setInterval(loadResults, 60000) // Refresh every minute

    return () => {
      subscription.unsubscribe()
      clearInterval(interval)
    }
  }, [router])

  const loadResults = async () => {
    try {
      // Load student leadership results
      const { data: positions } = await supabase
        .from("positions")
        .select(`
          *,
          candidates (*),
          election_categories (name)
        `)
        .eq("is_active", true)
        .order("order_index")

      // Load school participation stats
      const { count: totalStudents } = await supabase.from("users").select("*", { count: "exact", head: true })
      const { count: participatingStudents } = await supabase
        .from("users")
        .select("*", { count: "exact", head: true })
        .eq("has_voted", true)

      const leadershipResults: StudentLeadershipResult[] =
        positions?.map((position) => {
          const sortedCandidates = position.candidates
            .map((candidate: any) => ({
              id: candidate.id,
              name: candidate.full_name,
              votes: candidate.vote_count,
              percentage:
                position.candidates.reduce((sum: number, c: any) => sum + c.vote_count, 0) > 0
                  ? Math.round(
                      (candidate.vote_count /
                        position.candidates.reduce((sum: number, c: any) => sum + c.vote_count, 0)) *
                        100,
                    )
                  : 0,
              isElected: false,
              position: 0,
            }))
            .sort((a: any, b: any) => b.votes - a.votes)
            .map((candidate: any, index: number) => ({
              ...candidate,
              position: index + 1,
              isElected: index === 0 && candidate.votes > 0,
            }))

          const totalVotes = position.candidates.reduce((sum: number, c: any) => sum + c.vote_count, 0)

          return {
            postId: position.id,
            postTitle: position.title,
            category: position.election_categories?.name || "Student Leadership",
            candidates: sortedCandidates,
            totalVotes,
            participationRate: totalStudents ? Math.round((totalVotes / totalStudents) * 100) : 0,
          }
        }) || []

      setResults(leadershipResults)
      setSchoolStats({
        totalStudents: totalStudents || 0,
        participatingStudents: participatingStudents || 0,
        participationRate: totalStudents ? Math.round(((participatingStudents || 0) / totalStudents) * 100) : 0,
        leadershipPositions: leadershipResults.length,
      })
      setLastUpdated(new Date())
    } catch (error) {
      console.error("Error loading results:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    sessionStorage.removeItem("headteacher_auth")
    sessionStorage.removeItem("user_role")
    router.push("/admin/headteacher/login")
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Senior Leadership":
        return <Crown className="w-5 h-5" />
      case "Entertainment":
        return <Star className="w-5 h-5" />
      case "Games and Sports":
        return <Trophy className="w-5 h-5" />
      default:
        return <Award className="w-5 h-5" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Senior Leadership":
        return "from-purple-500 to-indigo-600"
      case "Entertainment":
        return "from-pink-500 to-rose-600"
      case "Games and Sports":
        return "from-green-500 to-emerald-600"
      default:
        return "from-blue-500 to-cyan-600"
    }
  }

  const getPositionBadge = (position: number) => {
    switch (position) {
      case 1:
        return "bg-yellow-500 text-white"
      case 2:
        return "bg-gray-400 text-white"
      case 3:
        return "bg-amber-600 text-white"
      default:
        return "bg-gray-300 text-gray-700"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-lg font-medium">Loading student leadership results...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between bg-white p-6 rounded-lg shadow-sm"
        >
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
              <img src="/logo.png" alt="Lubiri Secondary School" className="w-12 h-12 object-contain" />
            </div>
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-gray-900">Student Leadership Results</h2>
              <p className="text-gray-600">Lubiri Secondary School - Democratic Leadership Selection</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button onClick={loadResults} variant="outline" className="flex items-center space-x-2 bg-transparent">
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </Button>
            <Button variant="outline" className="flex items-center space-x-2 bg-transparent">
              <Download className="w-4 h-4" />
              <span>Export</span>
            </Button>
            <Button variant="outline" className="flex items-center space-x-2 bg-transparent">
              <Printer className="w-4 h-4" />
              <span>Print</span>
            </Button>
            <Button onClick={handleLogout} variant="outline" className="text-red-600 hover:text-red-700 bg-transparent">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </motion.div>

        {/* School Stats */}
        <div className="grid gap-6 md:grid-cols-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-medium">Total Students</p>
                    <p className="text-3xl font-bold">{schoolStats.totalStudents.toLocaleString()}</p>
                  </div>
                  <School className="w-8 h-8 text-blue-200" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm font-medium">Student Participation</p>
                    <p className="text-3xl font-bold">{schoolStats.participationRate}%</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-200" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm font-medium">Participating Students</p>
                    <p className="text-3xl font-bold">{schoolStats.participatingStudents.toLocaleString()}</p>
                  </div>
                  <Users className="w-8 h-8 text-purple-200" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-sm font-medium">Leadership Positions</p>
                    <p className="text-3xl font-bold">{schoolStats.leadershipPositions}</p>
                  </div>
                  <Award className="w-8 h-8 text-orange-200" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* School Leadership Message */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-green-800 text-lg">Democratic Leadership Development</h3>
                  <p className="text-green-700">
                    Our students are actively participating in the democratic process, developing leadership skills and
                    civic responsibility through this election.
                  </p>
                </div>
                <div className="ml-auto">
                  <Badge variant="outline" className="border-green-300 text-green-700">
                    <Calendar className="w-3 h-3 mr-1" />
                    Updated: {lastUpdated.toLocaleTimeString()}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Student Leadership Results */}
        <div className="space-y-6">
          {results.map((result, index) => (
            <motion.div
              key={result.postId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + index * 0.1 }}
            >
              <Card className="overflow-hidden shadow-lg">
                <CardHeader className={`bg-gradient-to-r ${getCategoryColor(result.category)} text-white`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getCategoryIcon(result.category)}
                      <div>
                        <CardTitle className="text-2xl font-bold">{result.postTitle}</CardTitle>
                        <p className="text-white/90">{result.category}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold">{result.totalVotes}</div>
                      <div className="text-sm text-white/90">Student Votes</div>
                      <div className="text-sm text-white/80">{result.participationRate}% participation</div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-6">
                  <div className="space-y-4">
                    {result.candidates.map((candidate, candidateIndex) => (
                      <div
                        key={candidate.id}
                        className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                          candidate.isElected
                            ? "bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-400 shadow-md"
                            : "bg-gray-50 border-gray-200"
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${getPositionBadge(candidate.position)}`}
                          >
                            {candidate.position}
                          </div>
                          <div>
                            <div className="font-bold text-lg text-gray-900">{candidate.name}</div>
                            <div className="text-sm text-gray-600">
                              {candidate.votes} student votes • {candidate.percentage}% support
                            </div>
                          </div>
                          {candidate.isElected && (
                            <Badge className="bg-yellow-500 text-white ml-2">
                              <Trophy className="w-3 h-3 mr-1" />
                              ELECTED
                            </Badge>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-gray-900">{candidate.percentage}%</div>
                          <div className="w-32">
                            <Progress value={candidate.percentage} className="h-2" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* School Footer */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}>
          <Card className="bg-gradient-to-r from-green-800 to-emerald-800 text-white">
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <img src="/logo.png" alt="Lubiri Secondary School" className="w-6 h-6" />
                <span className="font-bold">Lubiri Secondary School</span>
              </div>
              <p className="text-green-100 text-sm">
                Fostering democratic values and leadership development through transparent student elections. Building
                tomorrow's leaders today.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
