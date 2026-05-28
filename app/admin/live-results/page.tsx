"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { getPositionsWithCandidates, voteStorage, userStorage } from "@/lib/local-storage"
import { Trophy, Users, TrendingUp, Crown, Activity, Zap, BarChart3, Target } from "lucide-react"

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

interface Analytics {
  totalVotes: number
  turnout: number
  totalVoters: number
  votedCount: number
  averageVotesPerPosition: number
  mostCoveredPosition: string
}

export default function LiveResultsPage() {
  const [results, setResults] = useState<LiveResultData[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [analytics, setAnalytics] = useState<Analytics>({
    totalVotes: 0,
    turnout: 0,
    totalVoters: 0,
    votedCount: 0,
    averageVotesPerPosition: 0,
    mostCoveredPosition: "",
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (typeof window === "undefined") return
    fetchResults()
    const interval = setInterval(fetchResults, 3000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (results.length > 0) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % results.length)
      }, 10000)
      return () => clearInterval(interval)
    }
  }, [results.length])

  const fetchResults = async () => {
    try {
      if (typeof window === "undefined") return

      const positionsWithCandidates = getPositionsWithCandidates()
      const votes = voteStorage.getAll()
      const users = userStorage.getAll()

      const resultsData: LiveResultData[] = positionsWithCandidates.map((position) => {
        const positionVotes = votes.filter((v) => v.position_id === position.id)
        const totalVotesForPosition = positionVotes.length

        const candidatesWithVotes = position.candidates.map((candidate) => {
          const candidateVotes = votes.filter((v) => v.candidate_id === candidate.id).length
          return {
            ...candidate,
            vote_count: candidateVotes,
            percentage: totalVotesForPosition > 0 ? (candidateVotes / totalVotesForPosition) * 100 : 0,
          }
        })

        return {
          position_name: position.name,
          category: position.category,
          candidates: candidatesWithVotes.sort((a, b) => b.vote_count - a.vote_count),
          total_votes: totalVotesForPosition,
        }
      })

      const totalVotesCount = votes.length
      const totalVotersCount = users.length
      const votedCount = users.filter((u) => u.has_voted).length

      const mostCovered = resultsData.reduce((max, pos) => 
        pos.total_votes > max.total_votes ? pos : max
      , resultsData[0] || { total_votes: 0, position_name: "" })

      setResults(resultsData)
      setAnalytics({
        totalVotes: totalVotesCount,
        turnout: totalVotersCount > 0 ? (votedCount / totalVotersCount) * 100 : 0,
        totalVoters: totalVotersCount,
        votedCount,
        averageVotesPerPosition: resultsData.length > 0 ? totalVotesCount / resultsData.length : 0,
        mostCoveredPosition: mostCovered.position_name,
      })
    } catch (error) {
      console.error("Error fetching results:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading || results.length === 0) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center overflow-hidden">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
            className="w-20 h-20 border-4 border-blue-500/30 border-t-blue-500 rounded-full mx-auto mb-6"
          />
          <h2 className="text-3xl font-bold text-white mb-2">Loading Live Results</h2>
          <p className="text-blue-200">Gathering election data...</p>
        </motion.div>
      </div>
    )
  }

  const currentPosition = results[currentIndex]
  const timeUntilNextPos = 10 - (Math.floor((Date.now() / 1000) % 10))

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{ 
            backgroundPosition: ["0% 0%", "100% 100%"],
          }}
          transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY }}
          className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-purple-600/5 to-transparent"
          style={{ backgroundSize: "200% 200%" }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col h-full">
        {/* Header Bar */}
        <motion.div
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          className="bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 border-b-4 border-red-600 p-6 shadow-2xl"
        >
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-between mb-4"
            >
              <div>
                <motion.h1
                  className="text-5xl font-black text-white tracking-tight"
                  initial={{ x: -50 }}
                  animate={{ x: 0 }}
                >
                  ELECTION LIVE
                </motion.h1>
                <motion.p
                  className="text-lg text-blue-300 font-semibold"
                  initial={{ x: -50 }}
                  animate={{ x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  LUBIRI SECONDARY SCHOOL • Real-Time Results
                </motion.p>
              </div>
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                className="flex items-center gap-3"
              >
                <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse" />
                <span className="text-xl font-bold text-white">LIVE</span>
              </motion.div>
            </motion.div>

            {/* Analytics Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-5 gap-4"
            >
              <div className="bg-white/5 rounded-lg p-3 border border-white/10 backdrop-blur">
                <p className="text-blue-300 text-xs font-semibold">TOTAL VOTES</p>
                <motion.p
                  className="text-3xl font-bold text-white"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                >
                  {analytics.totalVotes.toLocaleString()}
                </motion.p>
              </div>
              <div className="bg-white/5 rounded-lg p-3 border border-white/10 backdrop-blur">
                <p className="text-green-300 text-xs font-semibold">TURNOUT</p>
                <motion.p
                  className="text-3xl font-bold text-white"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  {analytics.turnout.toFixed(1)}%
                </motion.p>
              </div>
              <div className="bg-white/5 rounded-lg p-3 border border-white/10 backdrop-blur">
                <p className="text-purple-300 text-xs font-semibold">VOTERS</p>
                <motion.p
                  className="text-3xl font-bold text-white"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  {analytics.votedCount}/{analytics.totalVoters}
                </motion.p>
              </div>
              <div className="bg-white/5 rounded-lg p-3 border border-white/10 backdrop-blur">
                <p className="text-yellow-300 text-xs font-semibold">AVG VOTES/POS</p>
                <motion.p
                  className="text-3xl font-bold text-white"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  {analytics.averageVotesPerPosition.toFixed(0)}
                </motion.p>
              </div>
              <div className="bg-white/5 rounded-lg p-3 border border-white/10 backdrop-blur">
                <p className="text-pink-300 text-xs font-semibold">TOP POSITION</p>
                <motion.p
                  className="text-lg font-bold text-white truncate"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.4 }}
                  title={analytics.mostCoveredPosition}
                >
                  {analytics.mostCoveredPosition.split(" ")[0]}
                </motion.p>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="flex-1 p-8 overflow-hidden flex flex-col justify-center">
          <div className="max-w-7xl mx-auto w-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.8 }}
                className="space-y-8"
              >
                {/* Position Title */}
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-center space-y-4"
                >
                  <motion.div
                    className="inline-flex items-center gap-3 bg-gradient-to-r from-red-500/20 to-purple-500/20 px-6 py-3 rounded-full border border-red-500/30 backdrop-blur"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                  >
                    <Zap className="w-5 h-5 text-yellow-400" />
                    <span className="text-lg font-bold text-red-300">{currentPosition.category}</span>
                  </motion.div>

                  <motion.h2
                    className="text-7xl font-black text-white drop-shadow-lg"
                    initial={{ y: -50 }}
                    animate={{ y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    {currentPosition.position_name}
                  </motion.h2>

                  <motion.p
                    className="text-2xl text-blue-300"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    {currentPosition.total_votes} votes cast • Position {currentIndex + 1} of {results.length}
                  </motion.p>
                </motion.div>

                {/* Candidates Grid */}
                <div className="grid gap-6 md:grid-cols-2">
                  {currentPosition.candidates.map((candidate, index) => (
                    <motion.div
                      key={candidate.id}
                      initial={{ opacity: 0, y: 50 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + index * 0.15 }}
                      className={`relative overflow-hidden rounded-2xl shadow-2xl border-2 ${
                        index === 0 && candidate.vote_count > 0
                          ? "bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-yellow-400"
                          : "bg-gradient-to-br from-white/10 to-white/5 border-white/20"
                      } backdrop-blur-xl`}
                    >
                      {/* Rank Badge */}
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: 0.4 + index * 0.15 }}
                        className={`absolute top-4 right-4 w-16 h-16 rounded-full flex items-center justify-center text-2xl font-black shadow-lg ${
                          index === 0 && candidate.vote_count > 0
                            ? "bg-gradient-to-br from-yellow-400 to-orange-500 text-white"
                            : index === 1
                            ? "bg-gradient-to-br from-gray-400 to-gray-500 text-white"
                            : index === 2
                            ? "bg-gradient-to-br from-orange-400 to-orange-600 text-white"
                            : "bg-white/20 text-white"
                        }`}
                      >
                        #{index + 1}
                      </motion.div>

                      <div className="p-8">
                        <motion.h3
                          className="text-3xl font-black text-white mb-6"
                          initial={{ x: -50 }}
                          animate={{ x: 0 }}
                          transition={{ delay: 0.5 + index * 0.15 }}
                        >
                          {candidate.full_name}
                        </motion.h3>

                        {/* Vote Stats */}
                        <div className="flex items-end justify-between mb-8">
                          <div>
                            <motion.div
                              className="text-5xl font-black text-white"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: 0.6 + index * 0.15 }}
                            >
                              {candidate.vote_count}
                            </motion.div>
                            <p className="text-white/70 text-lg font-semibold">
                              {candidate.vote_count === 1 ? "vote" : "votes"}
                            </p>
                          </div>

                          <motion.div
                            className="text-right"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.7 + index * 0.15 }}
                          >
                            <div
                              className={`text-5xl font-black ${
                                index === 0 && candidate.vote_count > 0
                                  ? "text-yellow-300"
                                  : "text-blue-300"
                              }`}
                            >
                              {candidate.percentage.toFixed(1)}%
                            </div>
                            {index === 0 && candidate.vote_count > 0 && (
                              <motion.div
                                animate={{ scale: [1, 1.1, 1] }}
                                transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
                                className="flex items-center gap-2 mt-2 justify-end"
                              >
                                <Trophy className="w-5 h-5 text-yellow-400" />
                                <span className="font-bold text-yellow-400">LEADING</span>
                              </motion.div>
                            )}
                          </motion.div>
                        </div>

                        {/* Animated Progress Bar */}
                        <div className="space-y-2">
                          <div
                            className={`h-3 rounded-full overflow-hidden backdrop-blur ${
                              index === 0 && candidate.vote_count > 0
                                ? "bg-yellow-900/40"
                                : "bg-white/10"
                            }`}
                          >
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${candidate.percentage}%` }}
                              transition={{ duration: 1.5, delay: 0.6 + index * 0.15, ease: "easeOut" }}
                              className={`h-full rounded-full ${
                                index === 0 && candidate.vote_count > 0
                                  ? "bg-gradient-to-r from-yellow-400 to-orange-500"
                                  : "bg-gradient-to-r from-blue-400 to-purple-500"
                              }`}
                            />
                          </div>
                          <p className="text-xs text-white/60 text-right">
                            {candidate.percentage.toFixed(1)}% of {currentPosition.total_votes} votes
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Position Indicator */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                  className="flex items-center justify-center gap-4"
                >
                  <div className="flex gap-2">
                    {results.map((_, index) => (
                      <motion.div
                        key={index}
                        className={`h-1 rounded-full transition-all ${
                          index === currentIndex
                            ? "w-12 bg-gradient-to-r from-red-500 to-purple-500"
                            : "w-2 bg-white/30"
                        }`}
                        animate={{ width: index === currentIndex ? 48 : 8 }}
                      />
                    ))}
                  </div>
                  <motion.p
                    className="text-white/70 text-sm font-semibold"
                    key={`timer-${currentIndex}`}
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                  >
                    Next in {timeUntilNextPos}s
                  </motion.p>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Footer */}
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 border-t-4 border-blue-600 p-4"
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
              >
                <Activity className="w-5 h-5 text-green-400" />
              </motion.div>
              <p className="text-white font-semibold">Live updates every 3 seconds</p>
            </div>
            <motion.p
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
              className="text-white/70 text-sm"
            >
              Results updated in real-time
            </motion.p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
