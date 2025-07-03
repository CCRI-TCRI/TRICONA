"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { supabase, type Position, type Candidate } from "@/lib/supabase-client"
import { CheckCircle, Clock, Trophy, Users, Star, Crown } from "lucide-react"

interface BallotProps {
  voterData: any
  onVotingComplete: () => void
}

interface PositionWithCandidates extends Position {
  candidates: Candidate[]
}

export function ElectionBallot({ voterData, onVotingComplete }: BallotProps) {
  const [positions, setPositions] = useState<PositionWithCandidates[]>([])
  const [currentPositionIndex, setCurrentPositionIndex] = useState(0)
  const [votes, setVotes] = useState<Record<string, string>>({})
  const [timeLeft, setTimeLeft] = useState(300) // 5 minutes
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadElectionData()
  }, [])

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [timeLeft])

  const loadElectionData = async () => {
    try {
      const { data: positionsData } = await supabase
        .from("election_positions")
        .select(`
          *,
          election_candidates (*)
        `)
        .eq("is_active", true)

      if (positionsData) {
        const formattedPositions = positionsData.map((pos) => ({
          ...pos,
          candidates: pos.election_candidates || [],
        }))
        setPositions(formattedPositions)
      }
    } catch (error) {
      console.error("Error loading election data:", error)
    }
  }

  const handleVote = (candidateId: string) => {
    const currentPosition = positions[currentPositionIndex]
    setVotes((prev) => ({
      ...prev,
      [currentPosition.id]: candidateId,
    }))

    // Auto-advance to next position
    if (currentPositionIndex < positions.length - 1) {
      setTimeout(() => {
        setCurrentPositionIndex(currentPositionIndex + 1)
      }, 1000)
    } else {
      setTimeout(() => {
        setShowConfirmation(true)
      }, 1000)
    }
  }

  const submitVotes = async () => {
    setSubmitting(true)

    try {
      const voteRecords = Object.entries(votes).map(([positionId, candidateId]) => ({
        voter_id: voterData.id,
        candidate_id: candidateId,
        position_id: positionId,
      }))

      await supabase.from("cast_votes").insert(voteRecords)

      // Update voter as having voted
      await supabase
        .from("voters")
        .update({
          has_voted: true,
          vote_timestamp: new Date().toISOString(),
        })
        .eq("id", voterData.id)

      // Update candidate vote counts
      for (const candidateId of Object.values(votes)) {
        await supabase
          .from("election_candidates")
          .update({ vote_count: supabase.sql`vote_count + 1` })
          .eq("id", candidateId)
      }

      onVotingComplete()
    } catch (error) {
      console.error("Error submitting votes:", error)
    } finally {
      setSubmitting(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case "leadership":
        return <Crown className="w-5 h-5" />
      case "sports":
        return <Trophy className="w-5 h-5" />
      case "culture":
        return <Star className="w-5 h-5" />
      default:
        return <Users className="w-5 h-5" />
    }
  }

  if (showConfirmation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-600 to-blue-700 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Confirm Your Votes</CardTitle>
            <p className="text-gray-600">Review your selections before submitting</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Voter Information</h3>
              <p>Name: {voterData.full_name}</p>
              <p>Student ID: {voterData.student_id}</p>
              <p>Class: {voterData.class_level}</p>
            </div>

            {positions.map((position) => {
              const selectedCandidateId = votes[position.id]
              const selectedCandidate = position.candidates.find((c) => c.id === selectedCandidateId)

              return (
                <div key={position.id} className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    {getCategoryIcon(position.category)}
                    <h4 className="font-semibold">{position.position_name}</h4>
                  </div>
                  {selectedCandidate ? (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      <span>{selectedCandidate.candidate_name}</span>
                    </div>
                  ) : (
                    <span className="text-gray-500">No selection made</span>
                  )}
                </div>
              )
            })}

            <Button onClick={submitVotes} disabled={submitting} className="w-full bg-green-600 hover:bg-green-700">
              {submitting ? "Submitting..." : "Submit My Votes"}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const currentPosition = positions[currentPositionIndex]
  if (!currentPosition) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-4 mb-4">
            <div className="flex items-center justify-center gap-4 text-white">
              <Clock className="w-5 h-5" />
              <span className="text-lg font-bold">Time Remaining: {formatTime(timeLeft)}</span>
            </div>
          </div>

          <Progress value={(currentPositionIndex / positions.length) * 100} className="mb-4" />

          <Badge variant="secondary" className="text-lg px-4 py-2">
            Position {currentPositionIndex + 1} of {positions.length}
          </Badge>
        </div>

        {/* Voting Card */}
        <Card className="bg-white/95 backdrop-blur-lg">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-3 mb-2">
              {getCategoryIcon(currentPosition.category)}
              <CardTitle className="text-2xl">{currentPosition.position_name}</CardTitle>
            </div>
            <p className="text-gray-600">{currentPosition.description}</p>
            <Badge className="bg-blue-100 text-blue-800">{currentPosition.category}</Badge>
          </CardHeader>

          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {currentPosition.candidates.map((candidate, index) => (
                <div
                  key={candidate.id}
                  onClick={() => handleVote(candidate.id)}
                  className={`p-6 border-2 rounded-lg cursor-pointer transition-all hover:shadow-lg ${
                    votes[currentPosition.id] === candidate.id
                      ? "border-green-500 bg-green-50"
                      : "border-gray-200 hover:border-blue-300"
                  }`}
                >
                  {votes[currentPosition.id] === candidate.id && (
                    <div className="flex justify-end mb-2">
                      <CheckCircle className="w-6 h-6 text-green-500" />
                    </div>
                  )}

                  <div className="text-center">
                    <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-3 flex items-center justify-center">
                      <Users className="w-8 h-8 text-gray-500" />
                    </div>
                    <h3 className="font-bold text-lg mb-1">{candidate.candidate_name}</h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {candidate.student_id} • {candidate.class_level}
                    </p>
                    <p className="text-sm text-gray-700">{candidate.manifesto || "No manifesto provided"}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
