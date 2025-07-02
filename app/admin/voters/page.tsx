"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { motion } from "framer-motion"
import {
  Users,
  UserPlus,
  Search,
  Download,
  Upload,
  RefreshCw,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  Key,
  FileText,
} from "lucide-react"
import { supabase } from "@/lib/supabase"

interface Voter {
  id: string
  student_id: string
  full_name: string
  class: string
  voting_code: string
  has_voted: boolean
  voted_at?: string
  created_at: string
}

export default function VotersPage() {
  const [voters, setVoters] = useState<Voter[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [classFilter, setClassFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showBulkDialog, setShowBulkDialog] = useState(false)
  const [selectedVoter, setSelectedVoter] = useState<Voter | null>(null)
  const [showCodes, setShowCodes] = useState(false)

  const [newVoter, setNewVoter] = useState({
    student_id: "",
    full_name: "",
    class: "",
  })

  useEffect(() => {
    loadVoters()
  }, [])

  const loadVoters = async () => {
    try {
      const { data, error } = await supabase.from("users").select("*").order("created_at", { ascending: false })

      if (error) throw error
      setVoters(data || [])
    } catch (error) {
      console.error("Error loading voters:", error)
      // Mock data for demo
      setVoters([
        {
          id: "1",
          student_id: "LSS001",
          full_name: "John Doe",
          class: "S6A",
          voting_code: "VT001",
          has_voted: true,
          voted_at: "2024-01-15T10:30:00Z",
          created_at: "2024-01-10T08:00:00Z",
        },
        {
          id: "2",
          student_id: "LSS002",
          full_name: "Jane Smith",
          class: "S5B",
          voting_code: "VT002",
          has_voted: false,
          created_at: "2024-01-10T08:00:00Z",
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const generateVotingCode = () => {
    return "VT" + Math.random().toString(36).substr(2, 6).toUpperCase()
  }

  const handleAddVoter = async (e: React.FormEvent) => {
    e.preventDefault()

    const voterData = {
      ...newVoter,
      voting_code: generateVotingCode(),
      has_voted: false,
      created_at: new Date().toISOString(),
    }

    try {
      const { data, error } = await supabase.from("users").insert([voterData]).select()

      if (error) throw error

      setVoters((prev) => [data[0], ...prev])
      setNewVoter({ student_id: "", full_name: "", class: "" })
      setShowAddDialog(false)
    } catch (error) {
      console.error("Error adding voter:", error)
      // Mock add for demo
      const mockVoter: Voter = {
        id: Date.now().toString(),
        ...voterData,
      }
      setVoters((prev) => [mockVoter, ...prev])
      setNewVoter({ student_id: "", full_name: "", class: "" })
      setShowAddDialog(false)
    }
  }

  const handleDeleteVoter = async (voterId: string) => {
    if (!confirm("Are you sure you want to delete this voter?")) return

    try {
      const { error } = await supabase.from("users").delete().eq("id", voterId)

      if (error) throw error

      setVoters((prev) => prev.filter((v) => v.id !== voterId))
    } catch (error) {
      console.error("Error deleting voter:", error)
      // Mock delete for demo
      setVoters((prev) => prev.filter((v) => v.id !== voterId))
    }
  }

  const handleResetVotingCode = async (voterId: string) => {
    const newCode = generateVotingCode()

    try {
      const { error } = await supabase.from("users").update({ voting_code: newCode }).eq("id", voterId)

      if (error) throw error

      setVoters((prev) => prev.map((v) => (v.id === voterId ? { ...v, voting_code: newCode } : v)))
    } catch (error) {
      console.error("Error resetting code:", error)
      // Mock update for demo
      setVoters((prev) => prev.map((v) => (v.id === voterId ? { ...v, voting_code: newCode } : v)))
    }
  }

  const filteredVoters = voters.filter((voter) => {
    const matchesSearch =
      voter.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      voter.student_id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesClass = classFilter === "all" || voter.class === classFilter
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "voted" && voter.has_voted) ||
      (statusFilter === "not-voted" && !voter.has_voted)

    return matchesSearch && matchesClass && matchesStatus
  })

  const stats = {
    total: voters.length,
    voted: voters.filter((v) => v.has_voted).length,
    notVoted: voters.filter((v) => !v.has_voted).length,
    turnout: voters.length > 0 ? Math.round((voters.filter((v) => v.has_voted).length / voters.length) * 100) : 0,
  }

  const classes = ["S1A", "S1B", "S2A", "S2B", "S3A", "S3B", "S4A", "S4B", "S5A", "S5B", "S6A", "S6B"]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg font-medium">Loading voters...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">Voter Management</h2>
          <p className="text-gray-600">Manage registered voters and their voting codes</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadVoters} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <UserPlus className="w-4 h-4 mr-2" />
                Add Voter
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Voter</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddVoter} className="space-y-4">
                <div>
                  <Label htmlFor="student_id">Student ID</Label>
                  <Input
                    id="student_id"
                    value={newVoter.student_id}
                    onChange={(e) => setNewVoter((prev) => ({ ...prev, student_id: e.target.value }))}
                    placeholder="e.g., LSS001"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    value={newVoter.full_name}
                    onChange={(e) => setNewVoter((prev) => ({ ...prev, full_name: e.target.value }))}
                    placeholder="Enter full name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="class">Class</Label>
                  <Select
                    value={newVoter.class}
                    onValueChange={(value) => setNewVoter((prev) => ({ ...prev, class: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent>
                      {classes.map((cls) => (
                        <SelectItem key={cls} value={cls}>
                          {cls}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)} className="flex-1">
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1">
                    Add Voter
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Voters</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <Users className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Voted</p>
                  <p className="text-3xl font-bold text-green-600">{stats.voted}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Not Voted</p>
                  <p className="text-3xl font-bold text-orange-600">{stats.notVoted}</p>
                </div>
                <XCircle className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Turnout</p>
                  <p className="text-3xl font-bold text-purple-600">{stats.turnout}%</p>
                </div>
                <FileText className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by name or student ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={classFilter} onValueChange={setClassFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Filter by class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                {classes.map((cls) => (
                  <SelectItem key={cls} value={cls}>
                    {cls}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="voted">Voted</SelectItem>
                <SelectItem value="not-voted">Not Voted</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => setShowCodes(!showCodes)} className="flex items-center gap-2">
              {showCodes ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {showCodes ? "Hide" : "Show"} Codes
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Voters Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Registered Voters ({filteredVoters.length})</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm">
                <Upload className="w-4 h-4 mr-2" />
                Import
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student ID</TableHead>
                  <TableHead>Full Name</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Voting Code</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Voted At</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVoters.map((voter) => (
                  <TableRow key={voter.id}>
                    <TableCell className="font-medium">{voter.student_id}</TableCell>
                    <TableCell>{voter.full_name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{voter.class}</Badge>
                    </TableCell>
                    <TableCell>
                      <code
                        className={`px-2 py-1 rounded text-sm ${showCodes ? "bg-gray-100" : "bg-gray-800 text-gray-800 select-none"}`}
                      >
                        {showCodes ? voter.voting_code : "••••••"}
                      </code>
                    </TableCell>
                    <TableCell>
                      <Badge variant={voter.has_voted ? "default" : "secondary"}>
                        {voter.has_voted ? "Voted" : "Not Voted"}
                      </Badge>
                    </TableCell>
                    <TableCell>{voter.voted_at ? new Date(voter.voted_at).toLocaleString() : "-"}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleResetVotingCode(voter.id)}
                          title="Reset voting code"
                        >
                          <Key className="w-3 h-3" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setSelectedVoter(voter)} title="Edit voter">
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteVoter(voter.id)}
                          title="Delete voter"
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
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
