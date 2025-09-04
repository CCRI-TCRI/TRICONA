"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/lib/supabase-client"
import { Users, Vote, Trophy, BarChart3, Plus, Eye } from "lucide-react"

export function AdminDashboard() {
  const [stats, setStats] = useState({
    totalVoters: 0,
    votedCount: 0,
    totalCandidates: 0,
    totalPositions: 0,
  })
  const [candidates, setCandidates] = useState<any[]>([])
  const [positions, setPositions] = useState<any[]>([])

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      // Load statistics
      const [votersResult, candidatesResult, positionsResult] = await Promise.all([
        supabase.from("voters").select("*"),
        supabase.from("election_candidates").select("*"),
        supabase.from("election_positions").select("*"),
      ])

      const voters = votersResult.data || []
      const candidatesList = candidatesResult.data || []
      const positionsList = positionsResult.data || []

      setStats({
        totalVoters: voters.length,
        votedCount: voters.filter((v) => v.has_voted).length,
        totalCandidates: candidatesList.length,
        totalPositions: positionsList.length,
      })

      setCandidates(candidatesList)
      setPositions(positionsList)
    } catch (error) {
      console.error("Error loading dashboard data:", error)
    }
  }

  const StatCard = ({ title, value, icon: Icon, color }: any) => (
    <Card className={`${color} text-white`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/80 text-sm">{title}</p>
            <p className="text-3xl font-bold">{value}</p>
          </div>
          <Icon className="w-8 h-8 opacity-80" />
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Election Dashboard</h1>
          <p className="text-gray-600">Lubiri Secondary School E-Voting System</p>
        </div>
        <div className="flex gap-2">
          <Button className="bg-blue-600">
            <Plus className="w-4 h-4 mr-2" />
            Add Candidate
          </Button>
          <Button variant="outline">
            <Eye className="w-4 h-4 mr-2" />
            Live Results
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Voters" value={stats.totalVoters} icon={Users} color="bg-blue-600" />
        <StatCard title="Votes Cast" value={stats.votedCount} icon={Vote} color="bg-green-600" />
        <StatCard title="Candidates" value={stats.totalCandidates} icon={Trophy} color="bg-purple-600" />
        <StatCard title="Positions" value={stats.totalPositions} icon={BarChart3} color="bg-orange-600" />
      </div>

      {/* Turnout Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Voter Turnout</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Progress</span>
              <span>
                {stats.votedCount} / {stats.totalVoters} voters
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-blue-600 h-3 rounded-full transition-all"
                style={{
                  width: `${stats.totalVoters > 0 ? (stats.votedCount / stats.totalVoters) * 100 : 0}%`,
                }}
              />
            </div>
            <p className="text-sm text-gray-600">
              {stats.totalVoters > 0 ? Math.round((stats.votedCount / stats.totalVoters) * 100) : 0}% turnout
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Recent Results */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Election Positions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {positions.map((position) => (
                <div key={position.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-semibold">{position.position_name}</h4>
                    <p className="text-sm text-gray-600">{position.category}</p>
                  </div>
                  <Badge variant="outline">
                    {candidates.filter((c) => c.position_id === position.id).length} candidates
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Candidates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {candidates
                .sort((a, b) => b.vote_count - a.vote_count)
                .slice(0, 5)
                .map((candidate) => (
                  <div key={candidate.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-semibold">{candidate.candidate_name}</h4>
                      <p className="text-sm text-gray-600">{candidate.class_level}</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800">{candidate.vote_count} votes</Badge>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
