"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { X, Trophy, Users, TrendingUp, Clock, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"

interface LiveResultsModalProps {
  isOpen: boolean
  onClose: () => void
}

interface Candidate {
  id: string
  candidate_name: string
  student_id: string
  class_level: string
  position_id: string
  vote_count: number
  manifesto: string
}

interface Position {
  id: string
  position_name: string
  category: string
  description: string
}

interface ResultData {
  position: Position
  candidates: Candidate[]
  totalVotes: number
  leader: Candidate | null
}

export function LiveResultsModal({ isOpen, onClose }: LiveResultsModalProps) {
  const [results, setResults] = useState<ResultData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  const [totalVoters, setTotalVoters] = useState(0)
  const [totalVotesCast, setTotalVotesCast] = useState(0)

  useEffect(() => {
    if (isOpen) {
      loadResults()
      const interval = setInterval(loadResults, 5000) // Update every 5 seconds
      return () => clearInterval(interval)
    }
  }, [isOpen])

  const loadResults = async () => {
    const supabase = createClient()
    setIsLoading(true)

    try {
      // Get all positions and candidates
      const [positionsResult, candidatesResult, votersResult] = await Promise.all([
        supabase.from("election_positions").select("*").eq("is_active", true),
        supabase.from("election_candidates").select("*").eq("is_active", true),
        supabase.from("voters").select("*"),
      ])

      const positions = positionsResult.data || []
      const candidates = candidatesResult.data || []
      const voters = votersResult.data || []

      setTotalVoters(voters.length)
      setTotalVotesCast(voters.filter((v) => v.has_voted).length)

      // Group candidates by position and calculate results
      const resultsByPosition: ResultData[] = positions.map((position) => {
        const positionCandidates = candidates.filter((c) => c.position_id === position.id)
        const totalVotes = positionCandidates.reduce((sum, c) => sum + c.vote_count, 0)
        const leader = positionCandidates.reduce((prev, current) =>
          prev.vote_count > current.vote_count ? prev : current,
        )

        return {
          position,
          candidates: positionCandidates.sort((a, b) => b.vote_count - a.vote_count),
          totalVotes,
          leader: totalVotes > 0 ? leader : null,
        }
      })

      setResults(resultsByPosition)
      setLastUpdated(new Date())
    } catch (error) {
      console.error("Error loading results:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getVotePercentage = (votes: number, total: number) => {
    return total > 0 ? Math.round((votes / total) * 100) : 0
  }

  const getPositionColor = (index: number) => {
    const colors = ["bg-chart-1", "bg-chart-2", "bg-chart-3", "bg-chart-4", "bg-chart-5"]
    return colors[index % colors.length]
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-hidden p-0">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-secondary p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Live Election Results</h1>
              <p className="text-white/90">Lubiri Secondary School E-Voting System</p>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={loadResults}
                className="text-white hover:bg-white/20"
                disabled={isLoading}
              >
                <RefreshCw className={cn("w-4 h-4 mr-2", isLoading && "animate-spin")} />
                Refresh
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose} className="text-white hover:bg-white/20">
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Overall Stats */}
          <div className="grid grid-cols-4 gap-4 mt-6">
            <div className="bg-white/20 rounded-lg p-4 text-center">
              <Users className="w-8 h-8 mx-auto mb-2" />
              <div className="text-2xl font-bold">{totalVoters}</div>
              <div className="text-sm text-white/80">Registered Voters</div>
            </div>
            <div className="bg-white/20 rounded-lg p-4 text-center">
              <TrendingUp className="w-8 h-8 mx-auto mb-2" />
              <div className="text-2xl font-bold">{totalVotesCast}</div>
              <div className="text-sm text-white/80">Votes Cast</div>
            </div>
            <div className="bg-white/20 rounded-lg p-4 text-center">
              <Trophy className="w-8 h-8 mx-auto mb-2" />
              <div className="text-2xl font-bold">{Math.round((totalVotesCast / totalVoters) * 100) || 0}%</div>
              <div className="text-sm text-white/80">Turnout</div>
            </div>
            <div className="bg-white/20 rounded-lg p-4 text-center">
              <Clock className="w-8 h-8 mx-auto mb-2" />
              <div className="text-lg font-bold">{lastUpdated.toLocaleTimeString()}</div>
              <div className="text-sm text-white/80">Last Updated</div>
            </div>
          </div>
        </div>

        {/* Results Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
                <p className="text-muted-foreground">Loading results...</p>
              </div>
            </div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-2">
              {results.map((result, positionIndex) => (
                <Card key={result.position.id} className="overflow-hidden">
                  <CardHeader className={cn("text-white", getPositionColor(positionIndex))}>
                    <CardTitle className="flex items-center justify-between">
                      <span>{result.position.position_name}</span>
                      <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                        {result.totalVotes} votes
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    {result.candidates.length === 0 ? (
                      <div className="p-6 text-center text-muted-foreground">No candidates registered</div>
                    ) : (
                      <div className="space-y-0">
                        {result.candidates.map((candidate, index) => {
                          const percentage = getVotePercentage(candidate.vote_count, result.totalVotes)
                          const isLeader = index === 0 && candidate.vote_count > 0

                          return (
                            <div
                              key={candidate.id}
                              className={cn("p-4 border-b border-border last:border-b-0", isLeader && "bg-accent/10")}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-3">
                                  <div
                                    className={cn(
                                      "w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm",
                                      index === 0 && candidate.vote_count > 0
                                        ? "bg-yellow-500"
                                        : index === 1
                                          ? "bg-gray-400"
                                          : index === 2
                                            ? "bg-orange-600"
                                            : "bg-gray-300",
                                    )}
                                  >
                                    {index + 1}
                                  </div>
                                  <div>
                                    <h4 className="font-semibold">{candidate.candidate_name}</h4>
                                    <p className="text-sm text-muted-foreground">
                                      {candidate.class_level} • {candidate.student_id}
                                    </p>
                                  </div>
                                  {isLeader && <Trophy className="w-5 h-5 text-yellow-500 ml-2" />}
                                </div>
                                <div className="text-right">
                                  <div className="text-lg font-bold">{candidate.vote_count}</div>
                                  <div className="text-sm text-muted-foreground">{percentage}%</div>
                                </div>
                              </div>
                              <Progress value={percentage} className="h-2" />
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
