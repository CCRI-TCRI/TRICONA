"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { getPositionsWithCandidates, voteStorage, userStorage } from "@/lib/local-storage"
import { Activity, TrendingUp, Users, Clock, Zap } from "lucide-react"

interface LiveResultData {
  position_name: string
  category: string
  candidate_count: number
  total_votes: number
}

export default function LiveResultsPage() {
  const [results, setResults] = useState<LiveResultData[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [analytics, setAnalytics] = useState({
    totalVotes: 0,
    turnout: 0,
    totalVoters: 0,
    votedCount: 0,
    totalPositions: 0,
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
      }, 8000)
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

        return {
          position_name: position.name,
          category: position.category,
          candidate_count: position.candidates.length,
          total_votes: totalVotesForPosition,
        }
      })

      const totalVotesCount = votes.length
      const totalVotersCount = users.length
      const votedCount = users.filter((u) => u.has_voted).length

      setResults(resultsData)
      setAnalytics({
        totalVotes: totalVotesCount,
        turnout: totalVotersCount > 0 ? (votedCount / totalVotersCount) * 100 : 0,
        totalVoters: totalVotersCount,
        votedCount,
        totalPositions: resultsData.length,
      })
    } catch (error) {
      console.error("Error fetching results:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading || results.length === 0) {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
            className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full mx-auto mb-4"
          />
          <p className="text-2xl font-bold text-gray-800">Loading Election Coverage</p>
          <p className="text-gray-500 mt-2">Gathering live data...</p>
        </motion.div>
      </div>
    )
  }

  const currentPosition = results[currentIndex]
  const timeUntilNext = 8 - (Math.floor((Date.now() / 1000) % 8))

  return (
    <div className="fixed inset-0 bg-white overflow-hidden flex flex-col">
      {/* Header */}
      <motion.div
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="bg-gradient-to-r from-white via-blue-50 to-white border-b-2 border-blue-200 px-8 py-6"
      >
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-between"
          >
            <div>
              <h1 className="text-5xl font-black text-blue-900 tracking-tight">ELECTION COVERAGE</h1>
              <p className="text-lg text-blue-600 font-semibold mt-1">Lubiri Secondary School • Live Participation Update</p>
            </div>
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
              className="flex items-center gap-3"
            >
              <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse" />
              <span className="text-lg font-bold text-gray-800">LIVE</span>
            </motion.div>
          </motion.div>

          {/* Analytics Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-5 gap-4 mt-6"
          >
            <div className="bg-white rounded-lg border-2 border-blue-100 p-4">
              <p className="text-blue-600 text-xs font-bold uppercase">Votes Recorded</p>
              <motion.p className="text-4xl font-black text-gray-900 mt-2" initial={{ scale: 0 }} animate={{ scale: 1 }}>
                {analytics.totalVotes.toLocaleString()}
              </motion.p>
            </div>
            <div className="bg-white rounded-lg border-2 border-green-100 p-4">
              <p className="text-green-600 text-xs font-bold uppercase">Participation</p>
              <motion.p className="text-4xl font-black text-gray-900 mt-2" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.1 }}>
                {analytics.turnout.toFixed(1)}%
              </motion.p>
            </div>
            <div className="bg-white rounded-lg border-2 border-purple-100 p-4">
              <p className="text-purple-600 text-xs font-bold uppercase">Students Voted</p>
              <motion.p className="text-4xl font-black text-gray-900 mt-2" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2 }}>
                {analytics.votedCount}/{analytics.totalVoters}
              </motion.p>
            </div>
            <div className="bg-white rounded-lg border-2 border-orange-100 p-4">
              <p className="text-orange-600 text-xs font-bold uppercase">Positions</p>
              <motion.p className="text-4xl font-black text-gray-900 mt-2" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3 }}>
                {analytics.totalPositions}
              </motion.p>
            </div>
            <div className="bg-white rounded-lg border-2 border-pink-100 p-4">
              <p className="text-pink-600 text-xs font-bold uppercase">Status</p>
              <motion.p className="text-2xl font-black text-gray-900 mt-2" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.4 }}>
                In Progress
              </motion.p>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-hidden flex items-center justify-center">
        <div className="max-w-6xl w-full">
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
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-center space-y-4"
              >
                <motion.div
                  className="inline-flex items-center gap-3 bg-blue-50 px-6 py-3 rounded-full border-2 border-blue-200"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                >
                  <Zap className="w-5 h-5 text-blue-600" />
                  <span className="text-lg font-bold text-blue-900">{currentPosition.category}</span>
                </motion.div>

                <motion.h2
                  className="text-6xl font-black text-gray-900"
                  initial={{ y: -50 }}
                  animate={{ y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  {currentPosition.position_name}
                </motion.h2>

                <motion.p
                  className="text-xl text-gray-600"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  {currentPosition.candidate_count} Candidates • {currentPosition.total_votes} Votes Cast
                </motion.p>
              </motion.div>

              {/* Participation Display */}
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="space-y-6"
              >
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-8 border-2 border-blue-200">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-gray-900">Participation Level</span>
                      <motion.span
                        className="text-3xl font-black text-blue-600"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.6, type: "spring" }}
                      >
                        {((currentPosition.total_votes / analytics.totalVotes) * 100 || 0).toFixed(1)}%
                      </motion.span>
                    </div>
                    <motion.div
                      className="h-8 bg-white rounded-full overflow-hidden border-2 border-blue-300"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ delay: 0.7, duration: 1 }}
                    >
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${((currentPosition.total_votes / analytics.totalVotes) * 100) || 0}%` }}
                        transition={{ delay: 0.8, duration: 1.5, ease: "easeOut" }}
                        className="h-full bg-gradient-to-r from-blue-500 to-blue-600"
                      />
                    </motion.div>
                    <p className="text-sm text-gray-600">
                      {currentPosition.total_votes} of {analytics.totalVotes} total votes
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-white rounded-xl p-6 border-2 border-gray-200 shadow-lg"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <Users className="w-6 h-6 text-blue-600" />
                      <span className="text-sm font-bold text-gray-600">Candidates</span>
                    </div>
                    <motion.p className="text-4xl font-black text-gray-900" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.7 }}>
                      {currentPosition.candidate_count}
                    </motion.p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="bg-white rounded-xl p-6 border-2 border-gray-200 shadow-lg"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <TrendingUp className="w-6 h-6 text-green-600" />
                      <span className="text-sm font-bold text-gray-600">Votes This Position</span>
                    </div>
                    <motion.p className="text-4xl font-black text-gray-900" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.8 }}>
                      {currentPosition.total_votes}
                    </motion.p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="bg-white rounded-xl p-6 border-2 border-gray-200 shadow-lg"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <Activity className="w-6 h-6 text-purple-600" />
                      <span className="text-sm font-bold text-gray-600">Status</span>
                    </div>
                    <motion.p className="text-2xl font-black text-purple-600" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.9 }}>
                      In Progress
                    </motion.p>
                  </motion.div>
                </div>
              </motion.div>

              {/* Position Indicator */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="flex items-center justify-center gap-4"
              >
                <div className="flex gap-2">
                  {results.map((_, index) => (
                    <motion.div
                      key={index}
                      className={`h-2 rounded-full transition-all ${
                        index === currentIndex ? "w-12 bg-blue-600" : "w-2 bg-gray-300"
                      }`}
                      animate={{ width: index === currentIndex ? 48 : 8 }}
                    />
                  ))}
                </div>
                <motion.p
                  className="text-gray-600 text-sm font-semibold"
                  key={`timer-${currentIndex}`}
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                >
                  Next update in {timeUntilNext}s
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
        className="bg-gradient-to-r from-white via-blue-50 to-white border-t-2 border-blue-200 p-4"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
            >
              <Activity className="w-5 h-5 text-green-600" />
            </motion.div>
            <p className="text-gray-800 font-semibold">Live election participation data • Updated every 3 seconds</p>
          </div>
          <motion.p
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
            className="text-gray-600 text-sm"
          >
            No results shown • Participation tracking only
          </motion.p>
        </div>
      </motion.div>
    </div>
  )
}
