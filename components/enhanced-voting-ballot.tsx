"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { motion, AnimatePresence } from "framer-motion"
import {
  CheckCircle,
  Trophy,
  Clock,
  AlertTriangle,
  Crown,
  Star,
  Users,
  BookOpen,
  Info,
  Shirt,
  UtensilsCrossed,
} from "lucide-react"
import { supabase, type Candidate, type Position, type ElectionCategory } from "@/lib/supabase"

interface VotingBallotProps {
  studentId: string
  onVoteComplete: () => void
}

interface CategoryWithPositions extends ElectionCategory {
  positions: (Position & { candidates: Candidate[] })[]
}

export function EnhancedVotingBallot({ studentId, onVoteComplete }: VotingBallotProps) {
  const [categories, setCategories] = useState<CategoryWithPositions[]>([])
  const [currentCategoryIndex, setCategoryIndex] = useState(0)
  const [currentPositionIndex, setPositionIndex] = useState(0)
  const [votes, setVotes] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [timeLeft, setTimeLeft] = useState(120) // 2 minutes
  const [showTimeWarning, setShowTimeWarning] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [userData, setUserData] = useState<any>(null)

  useEffect(() => {
    fetchElectionData()
    fetchUserData()
  }, [])

  // Timer effect
  useEffect(() => {
    if (timeLeft > 0 && !showConfirmation) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1)
        if (timeLeft === 30) {
          setShowTimeWarning(true)
        }
      }, 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0) {
      handleTimeExpired()
    }
  }, [timeLeft, showConfirmation])

  const handleTimeExpired = useCallback(() => {
    alert("Voting time has expired. You will be logged out.")
    window.location.reload()
  }, [])

  const fetchUserData = async () => {
    try {
      const { data: user } = await supabase.from("users").select("*").eq("student_id", studentId).single()

      setUserData(user)
    } catch (error) {
      console.error("Error fetching user data:", error)
    }
  }

  const fetchElectionData = async () => {
    try {
      const { data: categoriesData } = await supabase
        .from("election_categories")
        .select(`
          *,
          positions (
            *,
            candidates (*)
          )
        `)
        .eq("is_active", true)
        .order("created_at")

      if (categoriesData) {
        // Filter out positions with no candidates
        const filteredCategories = categoriesData
          .map((category) => ({
            ...category,
            positions: category.positions
              .filter((position: any) => position.candidates.length > 0)
              .map((position: any) => ({
                ...position,
                candidates: position.candidates.filter((candidate: any) => candidate.is_active),
              })),
          }))
          .filter((category) => category.positions.length > 0)

        setCategories(filteredCategories)
      }
    } catch (error) {
      console.error("Error fetching election data:", error)
    }
  }

  const currentCategory = categories[currentCategoryIndex]
  const currentPosition = currentCategory?.positions[currentPositionIndex]

  const handleVote = async (candidateId: string) => {
    if (currentPosition && !isTransitioning) {
      setIsTransitioning(true)

      // Update votes
      setVotes((prev) => ({
        ...prev,
        [currentPosition.id]: candidateId,
      }))

      // Wait for animation
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Auto-advance to next position
      if (currentCategory && currentPositionIndex < currentCategory.positions.length - 1) {
        setPositionIndex((prev) => prev + 1)
      } else if (currentCategoryIndex < categories.length - 1) {
        setCategoryIndex((prev) => prev + 1)
        setPositionIndex(0)
      } else {
        setShowConfirmation(true)
      }

      setIsTransitioning(false)
    }
  }

  const submitVotes = async () => {
    setIsSubmitting(true)

    try {
      const { data: userData } = await supabase.from("users").select("id").eq("student_id", studentId).single()

      if (!userData) throw new Error("User not found")

      // Submit all votes
      const voteRecords = Object.entries(votes).map(([positionId, candidateId]) => {
        const position = categories.flatMap((cat) => cat.positions).find((pos) => pos.id === positionId)

        return {
          user_id: userData.id,
          candidate_id: candidateId,
          position_id: positionId,
          category_id: position?.category_id,
        }
      })

      const { error: voteError } = await supabase.from("votes").insert(voteRecords)

      if (voteError) throw voteError

      // Update user as voted
      await supabase
        .from("users")
        .update({
          has_voted: true,
          voted_at: new Date().toISOString(),
        })
        .eq("id", userData.id)

      // Update candidate vote counts
      for (const candidateId of Object.values(votes)) {
        await supabase.rpc("increment_vote_count", { candidate_id: candidateId })
      }

      onVoteComplete()
    } catch (error) {
      console.error("Error submitting votes:", error)
      alert("Error submitting votes. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const getCategoryIcon = (categoryName: string) => {
    switch (categoryName.toLowerCase()) {
      case "senior leadership":
        return <Crown className="w-6 h-6" />
      case "games and sports":
        return <Trophy className="w-6 h-6" />
      case "entertainment":
        return <Star className="w-6 h-6" />
      case "academic affairs":
        return <BookOpen className="w-6 h-6" />
      case "information":
        return <Info className="w-6 h-6" />
      case "uniform":
        return <Shirt className="w-6 h-6" />
      case "mess":
        return <UtensilsCrossed className="w-6 h-6" />
      default:
        return <Users className="w-6 h-6" />
    }
  }

  const getCategoryColor = (categoryName: string) => {
    switch (categoryName.toLowerCase()) {
      case "senior leadership":
        return "from-purple-500 to-indigo-600"
      case "games and sports":
        return "from-green-500 to-emerald-600"
      case "entertainment":
        return "from-pink-500 to-rose-600"
      case "academic affairs":
        return "from-blue-500 to-cyan-600"
      case "information":
        return "from-teal-500 to-blue-600"
      case "uniform":
        return "from-gray-500 to-slate-600"
      case "mess":
        return "from-orange-500 to-amber-600"
      default:
        return "from-blue-500 to-purple-600"
    }
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  const getTotalPositions = () => {
    return categories.reduce((total, category) => total + category.positions.length, 0)
  }

  const getCurrentPositionNumber = () => {
    let positionNumber = 0
    for (let i = 0; i < currentCategoryIndex; i++) {
      positionNumber += categories[i].positions.length
    }
    return positionNumber + currentPositionIndex + 1
  }

  const getProgressPercentage = () => {
    const totalPositions = getTotalPositions()
    const currentPositionNumber = getCurrentPositionNumber()
    return (currentPositionNumber / totalPositions) * 100
  }

  if (!currentCategory || !currentPosition) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          className="w-16 h-16 border-4 border-white border-t-transparent rounded-full"
        />
      </div>
    )
  }

  if (showConfirmation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-3xl"
        >
          <Card className="backdrop-blur-lg bg-white/10 border-white/20 text-white">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold">Confirm Your Votes</CardTitle>
              <p className="text-blue-200">Please review your selections before submitting</p>
              <div className="flex items-center justify-center space-x-2 text-green-400">
                <Clock className="w-4 h-4" />
                <span>Time remaining: {formatTime(timeLeft)}</span>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="bg-blue-500/20 rounded-lg p-4 border border-blue-500/30">
                <h3 className="font-semibold mb-2">Voter Information</h3>
                <p>Name: {userData?.full_name}</p>
                <p>Student ID: {studentId}</p>
                <p>Class: {userData?.class}</p>
              </div>

              {categories.map((category) => (
                <div key={category.id} className="space-y-4">
                  <div className="flex items-center space-x-2">
                    {getCategoryIcon(category.name)}
                    <h3 className="text-lg font-semibold">{category.name}</h3>
                  </div>

                  {category.positions.map((position) => {
                    const selectedCandidateId = votes[position.id]
                    const selectedCandidate = position.candidates.find((c) => c.id === selectedCandidateId)

                    return (
                      <div key={position.id} className="bg-white/5 rounded-lg p-4">
                        <p className="font-medium">{position.title}</p>
                        {selectedCandidate ? (
                          <div className="flex items-center gap-2 text-green-400">
                            <CheckCircle className="w-4 h-4" />
                            <span>{selectedCandidate.full_name}</span>
                          </div>
                        ) : (
                          <p className="text-yellow-400">⚠ No selection made</p>
                        )}
                      </div>
                    )
                  })}
                </div>
              ))}

              <Button
                onClick={submitVotes}
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-lg py-3"
              >
                {isSubmitting ? "Submitting..." : "Submit My Votes"}
                <CheckCircle className="w-5 h-5 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 p-4">
      <div className="max-w-5xl mx-auto">
        {/* Header with Timer and Progress */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          {/* Timer */}
          <div
            className={`flex items-center justify-center mb-4 p-4 rounded-lg ${
              timeLeft <= 30 ? "bg-red-500/20 border border-red-500/30" : "bg-white/10"
            }`}
          >
            <Clock className={`w-6 h-6 mr-3 ${timeLeft <= 30 ? "text-red-400" : "text-white"}`} />
            <span className={`font-bold text-xl ${timeLeft <= 30 ? "text-red-400" : "text-white"}`}>
              Time Remaining: {formatTime(timeLeft)}
            </span>
            {timeLeft <= 30 && (
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}
                className="ml-3"
              >
                <AlertTriangle className="w-6 h-6 text-red-400" />
              </motion.div>
            )}
          </div>

          {/* Progress Bar */}
          <div className="bg-white/10 rounded-full h-3 mb-4">
            <motion.div
              className="bg-gradient-to-r from-green-400 to-blue-500 h-3 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${getProgressPercentage()}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>

          {/* Category and Position Info */}
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center space-x-3">
              <div className={`p-3 rounded-lg bg-gradient-to-r ${getCategoryColor(currentCategory.name)}`}>
                {getCategoryIcon(currentCategory.name)}
              </div>
              <div>
                <h2 className="text-xl font-bold">{currentCategory.name}</h2>
                <p className="text-blue-200">{currentCategory.description}</p>
              </div>
            </div>
            <Badge variant="secondary" className="bg-white/20 text-white text-lg px-4 py-2">
              Position {getCurrentPositionNumber()} of {getTotalPositions()}
            </Badge>
          </div>
        </motion.div>

        {/* Voting Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${currentCategoryIndex}-${currentPositionIndex}`}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="backdrop-blur-lg bg-white/10 border-white/20 text-white">
              <CardHeader className="text-center">
                <CardTitle className="text-3xl font-bold">{currentPosition.title}</CardTitle>
                <p className="text-blue-200 text-lg">{currentPosition.description}</p>
                <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
                  Click on a candidate to select and continue
                </Badge>
              </CardHeader>

              <CardContent>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {currentPosition.candidates.map((candidate, index) => (
                    <motion.div
                      key={candidate.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`relative cursor-pointer p-6 rounded-xl border-2 transition-all duration-300 hover:scale-105 ${
                        votes[currentPosition.id] === candidate.id
                          ? "border-green-400 bg-green-500/20 shadow-lg shadow-green-500/25"
                          : "border-white/20 bg-white/5 hover:border-blue-400 hover:bg-white/10"
                      }`}
                      onClick={() => handleVote(candidate.id)}
                    >
                      {votes[currentPosition.id] === candidate.id && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute top-4 right-4 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center"
                        >
                          <CheckCircle className="w-5 h-5 text-white" />
                        </motion.div>
                      )}

                      <div className="text-center">
                        <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                          <Users className="w-10 h-10 text-white" />
                        </div>

                        <h3 className="text-xl font-bold mb-2">{candidate.full_name}</h3>
                        <div className="flex items-center justify-center gap-2 mb-3">
                          <Badge variant="outline" className="border-white/30 text-white">
                            {candidate.student_id}
                          </Badge>
                          <Badge variant="outline" className="border-white/30 text-white">
                            {candidate.class}
                          </Badge>
                        </div>

                        <p className="text-sm text-blue-200 leading-relaxed">
                          {candidate.manifesto || "No manifesto provided"}
                        </p>
                      </div>

                      {isTransitioning && votes[currentPosition.id] === candidate.id && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="absolute inset-0 bg-green-500/30 rounded-xl flex items-center justify-center"
                        >
                          <div className="text-center">
                            <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-2" />
                            <p className="text-white font-semibold">Vote Recorded!</p>
                          </div>
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
