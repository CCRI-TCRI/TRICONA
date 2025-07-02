"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { motion } from "framer-motion"
import { Download, RefreshCw, Trophy, Crown } from "lucide-react"

export default function ResultsPage() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setLoading(false), 1000)
  }, [])

  const mockResults = [
    {
      id: "1",
      position: "Head Prefect",
      category: "Senior Leadership",
      candidates: [
        { name: "John Doe", votes: 45, percentage: 52 },
        { name: "Jane Smith", votes: 38, percentage: 44 },
        { name: "Mike Johnson", votes: 3, percentage: 4 },
      ],
      totalVotes: 86,
    },
    {
      id: "2",
      position: "Entertainment Prefect",
      category: "Entertainment",
      candidates: [
        { name: "Sarah Wilson", votes: 32, percentage: 58 },
        { name: "Tom Brown", votes: 23, percentage: 42 },
      ],
      totalVotes: 55,
    },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg font-medium">Loading results...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">Live Results</h2>
          <p className="text-gray-600">Real-time election results and analytics</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button>
            <Download className="w-4 h-4 mr-2" />
            Export Results
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        {mockResults.map((result, index) => (
          <motion.div
            key={result.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Crown className="w-6 h-6 text-purple-500" />
                    <div>
                      <h3 className="text-xl font-bold">{result.position}</h3>
                      <Badge variant="outline">{result.category}</Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">{result.totalVotes}</div>
                    <div className="text-sm text-gray-500">total votes</div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {result.candidates.map((candidate, candidateIndex) => (
                    <div key={candidateIndex} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                              candidateIndex === 0
                                ? "bg-yellow-500 text-white"
                                : candidateIndex === 1
                                  ? "bg-gray-400 text-white"
                                  : "bg-orange-400 text-white"
                            }`}
                          >
                            {candidateIndex + 1}
                          </div>
                          <span className="font-medium">{candidate.name}</span>
                          {candidateIndex === 0 && (
                            <Badge className="bg-yellow-500">
                              <Trophy className="w-3 h-3 mr-1" />
                              Leading
                            </Badge>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="font-bold">{candidate.votes} votes</div>
                          <div className="text-sm text-gray-500">{candidate.percentage}%</div>
                        </div>
                      </div>
                      <Progress value={candidate.percentage} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
