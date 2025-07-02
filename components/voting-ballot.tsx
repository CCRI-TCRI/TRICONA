"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle, User, Trophy, Users, Briefcase, Clock, AlertTriangle, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"

interface Candidate {
  id: string
  student_id: string
  full_name: string
  class: string
  manifesto: string
  photo_url?: string
}

interface Position {
  id: string
  name: string
  description: string
  category: string
  candidates: Candidate[]
}

interface VotingBallotProps {
  studentId: string
  onVoteComplete: () => void
}

export function VotingBallot({ studentId, onVoteComplete }: VotingBallotProps) {
  const [positions, setPositions] = useState<Position[]>([])
  const [currentPositionIndex, setCurrentPositionIndex] = useState(0)
  const [votes, setVotes] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [timeLeft, setTimeLeft] = useState(300) // 5 minutes
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchElectionData()
  }, [])

  // Timer effect
  useEffect(() => {
    if (timeLeft > 0 && !showConfirmation && !isLoading) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0) {
      handleTimeExpired()
    }
  }, [timeLeft, showConfirmation, isLoading])

  const handleTimeExpired = useCallback(() => {
    toast.error("Voting time has expired. You will be logged out.")
    setTimeout(() => {
      window.location.reload()
    }, 2000)
  }, [])

  const fetchElectionData = async () => {
    setIsLoading(true)
    try {
      // Fetch positions with their candidates
      const { data: positionsData, error: positionsError } = await supabase
        .from("positions")
        .select(`
          id,
          name,
          description,
          category,
          candidates (
            id,
            student_id,
            full_name,
            class,
            manifesto,
            photo_url
          )
        `)
        .eq("candidates.is_approved", true)
        .order("display_order")

      if (positionsError) {
        console.error("Error fetching positions:", positionsError)
        toast.error("Failed to load election data. Please refresh the page.")
        return
      }

      if (positionsData && positionsData.length > 0) {
        // Filter out positions with no candidates
        const validPositions = positionsData.filter((position) => position.candidates && position.candidates.length > 0)

        if (validPositions.length === 0) {
          toast.error("No candidates available for voting at this time.")
          return
        }

        setPositions(validPositions)
        toast.success(`Loaded ${validPositions.length} positions with candidates`)
      } else {
        toast.error("No positions available for voting at this time.")
      }
    } catch (error) {
      console.error("Error fetching election data:", error)
      toast.error("Failed to load election data. Please check your connection and try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const currentPosition = positions[currentPositionIndex]

  const handleVote = async (candidateId: string) => {
    if (currentPosition && !isTransitioning) {
      setIsTransitioning(true)

      setVotes((prev) => ({
        ...prev,
        [currentPosition.id]: candidateId,
      }))

      await new Promise((resolve) => setTimeout(resolve, 1000))

      if (currentPositionIndex < positions.length - 1) {
        setCurrentPositionIndex((prev) => prev + 1)
      } else {
        setShowConfirmation(true)
      }

      setIsTransitioning(false)
    }
  }

  const submitVotes = async () => {
    setIsSubmitting(true)

    try {
      // Get user data
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("id, has_voted")
        .eq("student_id", studentId)
        .single()

      if (userError) {
        console.error("Error fetching user data:", userError)
        toast.error("Failed to verify user. Please try again.")
        return
      }

      if (!userData) {
        toast.error("User not found. Please contact the election committee.")
        return
      }

      // Double-check if user has already voted
      if (userData.has_voted) {
        toast.error("You have already voted. Each voting code can only be used once.")
        onVoteComplete()
        return
      }

      // Prepare vote records
      const voteRecords = Object.entries(votes).map(([positionId, candidateId]) => ({
        user_id: userData.id,
        candidate_id: candidateId,
        position_id: positionId,
      }))

      // Insert votes
      const { error: voteError } = await supabase.from("votes").insert(voteRecords)

      if (voteError) {
        console.error("Error inserting votes:", voteError)
        toast.error("Failed to submit votes. Please try again.")
        return
      }

      // Mark user as voted - this is critical to prevent reuse
      const { error: updateError } = await supabase
        .from("users")
        .update({
          has_voted: true,
          voted_at: new Date().toISOString(),
        })
        .eq("id", userData.id)

      if (updateError) {
        console.error("Error marking user as voted:", updateError)
        toast.error("Vote submitted but failed to update status. Please contact support.")
      }

      toast.success("Votes submitted successfully!")
      onVoteComplete()
    } catch (error) {
      console.error("Error submitting votes:", error)
      toast.error("Failed to submit votes. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const getCategoryIcon = (categoryName: string) => {
    const category = categoryName.toLowerCase()
    if (category.includes("senior") || category.includes("head")) {
      return <Trophy className="w-6 h-6" />
    } else if (category.includes("sport") || category.includes("game")) {
      return <Users className="w-6 h-6" />
    } else if (category.includes("house")) {
      return <Briefcase className="w-6 h-6" />
    } else {
      return <User className="w-6 h-6" />
    }
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center text-white"
        >
          <Loader2 className="w-16 h-16 mx-auto mb-4 animate-spin" />
          <h2 className="text-2xl font-bold mb-2">Loading Election Data</h2>
          <p className="text-blue-200">Please wait while we fetch the candidates...</p>
        </motion.div>
      </div>
    )
  }

  if (!currentPosition || positions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center text-white max-w-md"
        >
          <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-yellow-400" />
          <h2 className="text-2xl font-bold mb-2">No Candidates Available</h2>
          <p className="text-blue-200 mb-4">
            There are currently no candidates available for voting. Please contact the election committee.
          </p>
          <Button
            onClick={() => window.location.reload()}
            className="bg-white/20 hover:bg-white/30 text-white border border-white/30"
          >
            Refresh Page
          </Button>
        </motion.div>
      </div>
    )
  }

  if (showConfirmation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-2xl"
        >
          <Card className="backdrop-blur-lg bg-white/10 border-white/20 text-white">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold">Confirm Your Votes</CardTitle>
              <p className="text-blue-200">Please review your selections before submitting</p>
              <div className="flex items-center justify-center space-x-2 text-green-400">
                <Clock className="w-4 h-4" />
                <span>Time remaining: {formatTime(timeLeft)}</span>
              </div>
              <p className="text-sm text-yellow-300">⚠️ Once submitted, your voting code cannot be used again</p>
            </CardHeader>

            <CardContent className="space-y-6">
              {positions.map((position) => {
                const selectedCandidateId = votes[position.id]
                const selectedCandidate = position.candidates.find((c) => c.id === selectedCandidateId)

                return (
                  <div key={position.id} className="bg-white/5 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      {getCategoryIcon(position.category)}
                      <p className="font-medium">{position.name}</p>
                    </div>
                    {selectedCandidate ? (
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-400" />
                        <div>
                          <p className="text-green-400 font-medium">{selectedCandidate.full_name}</p>
                          <p className="text-sm text-gray-300">{selectedCandidate.class}</p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-yellow-400">⚠ No selection made</p>
                    )}
                  </div>
                )
              })}

              <Button
                onClick={submitVotes}
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting Votes...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Submit Votes
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Timer and Progress */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div
            className={`flex items-center justify-center mb-4 p-3 rounded-lg ${
              timeLeft <= 60 ? "bg-red-500/20 border border-red-500/30" : "bg-white/10"
            }`}
          >
            <Clock className={`w-5 h-5 mr-2 ${timeLeft <= 60 ? "text-red-400" : "text-white"}`} />
            <span className={`font-bold text-lg ${timeLeft <= 60 ? "text-red-400" : "text-white"}`}>
              Time Remaining: {formatTime(timeLeft)}
            </span>
            {timeLeft <= 60 && (
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}
                className="ml-2"
              >
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </motion.div>
            )}
          </div>

          <div className="bg-white/10 rounded-full h-2 mb-4">
            <motion.div
              className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{
                width: `${((currentPositionIndex + 1) / positions.length) * 100}%`,
              }}
              transition={{ duration: 0.5 }}
            />
          </div>

          <div className="flex items-center justify-between text-white">
            <div className="flex items-center space-x-2">
              {getCategoryIcon(currentPosition.category)}
              <span className="font-semibold">{currentPosition.category}</span>
            </div>
            <Badge variant="secondary" className="bg-white/20 text-white">
              Position {currentPositionIndex + 1} of {positions.length}
            </Badge>
          </div>
        </motion.div>

        {/* Voting Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPositionIndex}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="backdrop-blur-lg bg-white/10 border-white/20 text-white">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold">{currentPosition.name}</CardTitle>
                <p className="text-blue-200">{currentPosition.description}</p>
                <p className="text-sm text-yellow-300">Click on a candidate to select and continue</p>
              </CardHeader>

              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {currentPosition.candidates.map((candidate, index) => (
                    <motion.div
                      key={candidate.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`relative p-6 rounded-lg border-2 cursor-pointer transition-all duration-300 ${
                        votes[currentPosition.id] === candidate.id
                          ? "border-green-400 bg-green-500/20 scale-105"
                          : "border-white/20 bg-white/5 hover:border-blue-400 hover:bg-blue-500/10 hover:scale-102"
                      } ${isTransitioning ? "pointer-events-none" : ""}`}
                      onClick={() => handleVote(candidate.id)}
                      whileHover={{ scale: isTransitioning ? 1 : 1.02 }}
                      whileTap={{ scale: isTransitioning ? 1 : 0.98 }}
                    >
                      {votes[currentPosition.id] === candidate.id && (
                        <motion.div
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          className="absolute top-2 right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center"
                        >
                          <CheckCircle className="w-5 h-5 text-white" />
                        </motion.div>
                      )}

                      <div className="flex items-center space-x-4 mb-4">
                        <Avatar className="w-16 h-16">
                          <AvatarImage src={candidate.photo_url || "/placeholder.svg"} />
                          <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                            {candidate.full_name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>

                        <div>
                          <h3 className="font-bold text-lg">{candidate.full_name}</h3>
                          <p className="text-blue-200">{candidate.class}</p>
                          <p className="text-sm text-gray-300">ID: {candidate.student_id}</p>
                        </div>
                      </div>

                      <p className="text-sm text-gray-200 line-clamp-3">
                        {candidate.manifesto || "No manifesto provided."}
                      </p>

                      {votes[currentPosition.id] === candidate.id && isTransitioning && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="absolute inset-0 bg-green-500/30 rounded-lg flex items-center justify-center"
                        >
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2 }}
                            className="text-white text-center"
                          >
                            <CheckCircle className="w-12 h-12 mx-auto mb-2" />
                            <p className="font-bold">Selected!</p>
                          </motion.div>
                        </motion.div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
