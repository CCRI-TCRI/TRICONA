"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Vote, Search, RefreshCw, Clock, User, CheckCircle } from "lucide-react"

interface VoteRecord {
  id: string
  voter_id: string
  candidate_name: string
  position: string
  category: string
  timestamp: string
  verified: boolean
}

export default function VotesPage() {
  const [votes, setVotes] = useState<VoteRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")

  useEffect(() => {
    loadVotes()
  }, [])

  const loadVotes = async () => {
    // Mock data for demo
    const mockVotes: VoteRecord[] = [
      {
        id: "1",
        voter_id: "LSS001",
        candidate_name: "John Doe",
        position: "Head Prefect",
        category: "Senior Leadership",
        timestamp: "2024-01-15T10:30:00Z",
        verified: true,
      },
      {
        id: "2",
        voter_id: "LSS002",
        candidate_name: "Jane Smith",
        position: "Head Prefect",
        category: "Senior Leadership",
        timestamp: "2024-01-15T10:32:00Z",
        verified: true,
      },
      {
        id: "3",
        voter_id: "LSS003",
        candidate_name: "Mike Johnson",
        position: "Entertainment Prefect",
        category: "Entertainment",
        timestamp: "2024-01-15T10:35:00Z",
        verified: true,
      },
    ]

    setVotes(mockVotes)
    setLoading(false)
  }

  const filteredVotes = votes.filter((vote) => {
    const matchesSearch =
      vote.candidate_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vote.voter_id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === "all" || vote.category === categoryFilter

    return matchesSearch && matchesCategory
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg font-medium">Loading votes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">Vote Management</h2>
          <p className="text-gray-600">Monitor and verify cast votes</p>
        </div>
        <Button onClick={loadVotes} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Votes</p>
                <p className="text-3xl font-bold text-gray-900">{votes.length}</p>
              </div>
              <Vote className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Verified</p>
                <p className="text-3xl font-bold text-green-600">{votes.filter((v) => v.verified).length}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Last Vote</p>
                <p className="text-lg font-bold text-gray-900">2 min ago</p>
              </div>
              <Clock className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by candidate or voter ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Senior Leadership">Senior Leadership</SelectItem>
                <SelectItem value="Entertainment">Entertainment</SelectItem>
                <SelectItem value="Games and Sports">Games and Sports</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vote ID</TableHead>
                  <TableHead>Voter</TableHead>
                  <TableHead>Candidate</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVotes.map((vote) => (
                  <TableRow key={vote.id}>
                    <TableCell className="font-mono text-sm">{vote.id}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        {vote.voter_id}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{vote.candidate_name}</TableCell>
                    <TableCell>{vote.position}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{vote.category}</Badge>
                    </TableCell>
                    <TableCell>{new Date(vote.timestamp).toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant={vote.verified ? "default" : "secondary"}>
                        {vote.verified ? "Verified" : "Pending"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
