"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { supabase } from "@/lib/supabase"
import { Trophy, Users, TrendingUp, Crown } from "lucide-react"

interface LiveResultData {
  position_name: string
  category: string
  candidates: {
    id: string
    full_name: string
    photo_url?: string
    vote_count: number
    percentage: number
  }[]
  total_votes: number
}

export default function LiveResultsPage() {
  const [results, setResults] = useState<LiveResultData[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [totalVotes, setTotalVotes] = useState(0)
  const [turnout, setTurnout] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchResults()
    const interval = setInterval(fetchResults, 3000) // Refresh every 3 seconds
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (results.length > 0) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % results.length)
      }, 8000) // Change position every 8 seconds
      return () => clearInterval(interval)
    }
  }, [results.length])

  const fetchResults = async () => {
    try {
      const { data: positions, error: positionsError } = await supabase
        .from("positions")
        .select("*")
        .order("category", { ascending: true })

      if (positionsError) throw positionsError

      const resultsData: LiveResultData[] = []

      for (const position of positions || []) {
        const { data: candidates, error: candidatesError } = await supabase
          .from("candidates")
          .select("*")
          .eq("position_id", position.id)

        if (candidatesError) throw candidatesError

        const candidatesWithVotes = await Promise.all(
          (candidates || []).map(async (candidate) => {
            const { count } = await supabase
              .from("votes")
              .select("*", { count: "exact", head: true })
              .eq("candidate_id", candidate.id)

            return {
              ...candidate,
              vote_count: count || 0,
            }
          }),
        )

        const positionTotalVotes = candidatesWithVotes.reduce((sum, c) => sum + c.vote_count, 0)

        const candidatesWithPercentage = candidatesWithVotes
          .map((candidate) => ({
            ...candidate,
            percentage: positionTotalVotes > 0 ? (candidate.vote_count / positionTotalVotes) * 100 : 0,
          }))
          .sort((a, b) => b.vote_count - a.vote_count)

        resultsData.push({
          position_name: position.name,
          category: position.category,
          candidates: candidatesWithPercentage,
          total_votes: positionTotalVotes,
        })
      }

      const { count: totalVotesCount } = await supabase.from("votes").select("*", { count: "exact", head: true })
      const { count: totalVotersCount } = await supabase.from("users").select("*", { count: "exact", head: true })
      const { count: votedCount } = await supabase
        .from("users")
        .select("*", { count: "exact", head: true })
        .eq("has_voted", true)

      setResults(resultsData)
      setTotalVotes(totalVotesCount || 0)
      setTurnout(totalVotersCount ? ((votedCount || 0) / totalVotersCount) * 100 : 0)
    } catch (error) {
      console.error("Error fetching results:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading || results.length === 0) {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-2xl font-bold text-gray-800">Loading Live Results...</p>
        </div>
      </div>
    )
  }

  const currentPosition = results[currentIndex]

  return (
    <div className="fixed inset-0 bg-white overflow-hidden">
      {/* Header */}
      <motion.div
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 shadow-lg"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold">LUBIRI SECONDARY SCHOOL</h1>
            <p className="text-xl opacity-90">Live Election Results</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{totalVotes}</div>
            <div className="text-lg opacity-90">Total Votes</div>
          </div>
        </div>
      </motion.div>

      {/* Stats Bar */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-gray-100 p-4 border-b">
        <div className="max-w-7xl mx-auto flex items-center justify-center space-x-12">
          <div className="flex items-center space-x-2">
            <Users className="w-6 h-6 text-blue-600" />
            <span className="text-lg font-semibold">Turnout: {turnout.toFixed(1)}%</span>
          </div>
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-6 h-6 text-green-600" />
            <span className="text-lg font-semibold">Live Updates</span>
          </div>
          <div className="flex items-center space-x-2">
            <Trophy className="w-6 h-6 text-yellow-600" />
            <span className="text-lg font-semibold">{results.length} Positions</span>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              {/* Position Header */}
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className="text-center bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-8 rounded-2xl shadow-xl"
              >
                <div className="flex items-center justify-center space-x-4 mb-4">
                  <Crown className="w-12 h-12" />
                  <h2 className="text-5xl font-bold">{currentPosition.position_name}</h2>
                </div>
                <p className="text-2xl opacity-90">{currentPosition.category}</p>
                <div className="mt-4 text-xl">
                  <span className="bg-white/20 px-4 py-2 rounded-full">{currentPosition.total_votes} votes cast</span>
                </div>
              </motion.div>

              {/* Candidates */}
              <div className="space-y-6">
                {currentPosition.candidates.map((candidate, index) => (
                  <motion.div
                    key={candidate.id}
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.2 }}
                    className={`relative overflow-hidden rounded-2xl shadow-xl ${
                      index === 0 && candidate.vote_count > 0
                        ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-white"
                        : "bg-white border-2 border-gray-200"
                    }`}
                  >
                    <div className="p-8">
                      <div className="flex items-center space-x-6">
                        {/* Rank */}
                        <div
                          className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold ${
                            index === 0 && candidate.vote_count > 0
                              ? "bg-white/20 text-white"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {index + 1}
                        </div>

                        {/* Candidate Info */}
                        <div className="flex-1">
                          <h3 className="text-3xl font-bold mb-2">{candidate.full_name}</h3>
                          <div className="flex items-center space-x-6">
                            <span className="text-2xl font-semibold">{candidate.vote_count} votes</span>
                            <span className="text-2xl font-semibold">{candidate.percentage.toFixed(1)}%</span>
                          </div>
                        </div>

                        {/* Leading Badge */}
                        {index === 0 && candidate.vote_count > 0 && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="flex items-center space-x-2 bg-white/20 px-4 py-2 rounded-full"
                          >
                            <Trophy className="w-6 h-6" />
                            <span className="text-xl font-bold">LEADING</span>
                          </motion.div>
                        )}
                      </div>

                      {/* Progress Bar */}
                      <div className="mt-6">
                        <div
                          className={`h-4 rounded-full overflow-hidden ${
                            index === 0 && candidate.vote_count > 0 ? "bg-white/20" : "bg-gray-200"
                          }`}
                        >
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${candidate.percentage}%` }}
                            transition={{ duration: 1.5, delay: index * 0.2 }}
                            className={`h-full ${
                              index === 0 && candidate.vote_count > 0
                                ? "bg-white"
                                : "bg-gradient-to-r from-blue-500 to-purple-500"
                            }`}
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Position Counter */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-gray-500">
                <p className="text-xl">
                  Position {currentIndex + 1} of {results.length}
                </p>
                <div className="flex justify-center space-x-2 mt-4">
                  {results.map((_, index) => (
                    <div
                      key={index}
                      className={`w-3 h-3 rounded-full ${index === currentIndex ? "bg-blue-600" : "bg-gray-300"}`}
                    />
                  ))}
                </div>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Footer */}
      <motion.div initial={{ y: 100 }} animate={{ y: 0 }} className="bg-gray-800 text-white p-4">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-lg">
            Live results update every 3 seconds • Next position in{" "}
            <span className="font-bold text-blue-400">{8 - Math.floor((Date.now() / 1000) % 8)} seconds</span>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
