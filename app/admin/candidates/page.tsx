"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { motion } from "framer-motion"
import { Trophy, UserPlus, Search, Download, Upload, RefreshCw, Edit, Trash2, Crown, Star, Users } from "lucide-react"
import { supabase } from "@/lib/supabase"

interface Candidate {
  id: string
  student_id: string
  full_name: string
  class: string
  position_id: string
  position_title?: string
  category_name?: string
  manifesto: string
  photo_url?: string
  vote_count: number
  created_at: string
}

interface Position {
  id: string
  title: string
  description: string
  category_id: string
  category_name?: string
  max_candidates: number
  is_active: boolean
}

interface Category {
  id: string
  name: string
  description: string
  is_active: boolean
}

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [positions, setPositions] = useState<Position[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [positionFilter, setPositionFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null)

  const [newCandidate, setNewCandidate] = useState({
    student_id: "",
    full_name: "",
    class: "",
    position_id: "",
    manifesto: "",
    photo_url: "",
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      await Promise.all([loadCandidates(), loadPositions(), loadCategories()])
    } catch (error) {
      console.error("Error loading data:", error)
      // Load mock data for demo
      loadMockData()
    } finally {
      setLoading(false)
    }
  }

  const loadMockData = () => {
    const mockCategories: Category[] = [
      { id: "1", name: "Senior Leadership", description: "Top leadership positions", is_active: true },
      { id: "2", name: "Entertainment", description: "Entertainment and cultural positions", is_active: true },
      { id: "3", name: "Games and Sports", description: "Sports and games leadership", is_active: true },
    ]

    const mockPositions: Position[] = [
      {
        id: "1",
        title: "Head Prefect",
        description: "Overall school leader",
        category_id: "1",
        category_name: "Senior Leadership",
        max_candidates: 5,
        is_active: true,
      },
      {
        id: "2",
        title: "Deputy Head Prefect",
        description: "Assistant to head prefect",
        category_id: "1",
        category_name: "Senior Leadership",
        max_candidates: 3,
        is_active: true,
      },
      {
        id: "3",
        title: "Entertainment Prefect",
        description: "Leads entertainment activities",
        category_id: "2",
        category_name: "Entertainment",
        max_candidates: 3,
        is_active: true,
      },
      {
        id: "4",
        title: "Sports Prefect",
        description: "Leads sports activities",
        category_id: "3",
        category_name: "Games and Sports",
        max_candidates: 3,
        is_active: true,
      },
    ]

    const mockCandidates: Candidate[] = [
      {
        id: "1",
        student_id: "LSS001",
        full_name: "John Doe",
        class: "S6A",
        position_id: "1",
        position_title: "Head Prefect",
        category_name: "Senior Leadership",
        manifesto: "I will work to improve student welfare and create a better learning environment for all students.",
        vote_count: 45,
        created_at: "2024-01-10T08:00:00Z",
      },
      {
        id: "2",
        student_id: "LSS002",
        full_name: "Jane Smith",
        class: "S5B",
        position_id: "1",
        position_title: "Head Prefect",
        category_name: "Senior Leadership",
        manifesto: "Together we can build a stronger school community with better facilities and opportunities.",
        vote_count: 38,
        created_at: "2024-01-10T08:00:00Z",
      },
      {
        id: "3",
        student_id: "LSS003",
        full_name: "Mike Johnson",
        class: "S6A",
        position_id: "3",
        position_title: "Entertainment Prefect",
        category_name: "Entertainment",
        manifesto: "Let's bring more fun and engaging activities to make school life more enjoyable for everyone.",
        vote_count: 22,
        created_at: "2024-01-10T08:00:00Z",
      },
    ]

    setCategories(mockCategories)
    setPositions(mockPositions)
    setCandidates(mockCandidates)
  }

  const loadCandidates = async () => {
    const { data, error } = await supabase
      .from("candidates")
      .select(`
        *,
        positions (
          title,
          election_categories (name)
        )
      `)
      .order("created_at", { ascending: false })

    if (error) throw error

    const formattedCandidates =
      data?.map((candidate) => ({
        ...candidate,
        position_title: candidate.positions?.title,
        category_name: candidate.positions?.election_categories?.name,
      })) || []

    setCandidates(formattedCandidates)
  }

  const loadPositions = async () => {
    const { data, error } = await supabase
      .from("positions")
      .select(`
        *,
        election_categories (name)
      `)
      .eq("is_active", true)

    if (error) throw error

    const formattedPositions =
      data?.map((position) => ({
        ...position,
        category_name: position.election_categories?.name,
      })) || []

    setPositions(formattedPositions)
  }

  const loadCategories = async () => {
    const { data, error } = await supabase.from("election_categories").select("*").eq("is_active", true)

    if (error) throw error
    setCategories(data || [])
  }

  const handleAddCandidate = async (e: React.FormEvent) => {
    e.preventDefault()

    const candidateData = {
      ...newCandidate,
      vote_count: 0,
      created_at: new Date().toISOString(),
    }

    try {
      const { data, error } = await supabase
        .from("candidates")
        .insert([candidateData])
        .select(`
          *,
          positions (
            title,
            election_categories (name)
          )
        `)

      if (error) throw error

      const formattedCandidate = {
        ...data[0],
        position_title: data[0].positions?.title,
        category_name: data[0].positions?.election_categories?.name,
      }

      setCandidates((prev) => [formattedCandidate, ...prev])
      setNewCandidate({
        student_id: "",
        full_name: "",
        class: "",
        position_id: "",
        manifesto: "",
        photo_url: "",
      })
      setShowAddDialog(false)
    } catch (error) {
      console.error("Error adding candidate:", error)
      // Mock add for demo
      const selectedPosition = positions.find((p) => p.id === newCandidate.position_id)
      const mockCandidate: Candidate = {
        id: Date.now().toString(),
        ...candidateData,
        position_title: selectedPosition?.title,
        category_name: selectedPosition?.category_name,
      }
      setCandidates((prev) => [mockCandidate, ...prev])
      setNewCandidate({
        student_id: "",
        full_name: "",
        class: "",
        position_id: "",
        manifesto: "",
        photo_url: "",
      })
      setShowAddDialog(false)
    }
  }

  const handleDeleteCandidate = async (candidateId: string) => {
    if (!confirm("Are you sure you want to delete this candidate?")) return

    try {
      const { error } = await supabase.from("candidates").delete().eq("id", candidateId)

      if (error) throw error

      setCandidates((prev) => prev.filter((c) => c.id !== candidateId))
    } catch (error) {
      console.error("Error deleting candidate:", error)
      // Mock delete for demo
      setCandidates((prev) => prev.filter((c) => c.id !== candidateId))
    }
  }

  const filteredCandidates = candidates.filter((candidate) => {
    const matchesSearch =
      candidate.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.student_id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesPosition = positionFilter === "all" || candidate.position_id === positionFilter
    const matchesCategory = categoryFilter === "all" || candidate.category_name === categoryFilter

    return matchesSearch && matchesPosition && matchesCategory
  })

  const stats = {
    total: candidates.length,
    byCategory: categories.map((cat) => ({
      name: cat.name,
      count: candidates.filter((c) => c.category_name === cat.name).length,
    })),
    totalVotes: candidates.reduce((sum, c) => sum + c.vote_count, 0),
  }

  const getCategoryIcon = (categoryName: string) => {
    switch (categoryName) {
      case "Senior Leadership":
        return <Crown className="w-5 h-5 text-purple-500" />
      case "Entertainment":
        return <Star className="w-5 h-5 text-pink-500" />
      case "Games and Sports":
        return <Trophy className="w-5 h-5 text-green-500" />
      default:
        return <Users className="w-5 h-5 text-blue-500" />
    }
  }

  const classes = ["S1A", "S1B", "S2A", "S2B", "S3A", "S3B", "S4A", "S4B", "S5A", "S5B", "S6A", "S6B"]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg font-medium">Loading candidates...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">Candidate Management</h2>
          <p className="text-gray-600">Manage election candidates and their information</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadData} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button className="bg-purple-600 hover:bg-purple-700">
                <UserPlus className="w-4 h-4 mr-2" />
                Add Candidate
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Candidate</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddCandidate} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="student_id">Student ID</Label>
                    <Input
                      id="student_id"
                      value={newCandidate.student_id}
                      onChange={(e) => setNewCandidate((prev) => ({ ...prev, student_id: e.target.value }))}
                      placeholder="e.g., LSS001"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="class">Class</Label>
                    <Select
                      value={newCandidate.class}
                      onValueChange={(value) => setNewCandidate((prev) => ({ ...prev, class: value }))}
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
                </div>
                <div>
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    value={newCandidate.full_name}
                    onChange={(e) => setNewCandidate((prev) => ({ ...prev, full_name: e.target.value }))}
                    placeholder="Enter full name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="position_id">Position</Label>
                  <Select
                    value={newCandidate.position_id}
                    onValueChange={(value) => setNewCandidate((prev) => ({ ...prev, position_id: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select position" />
                    </SelectTrigger>
                    <SelectContent>
                      {positions.map((position) => (
                        <SelectItem key={position.id} value={position.id}>
                          {position.title} ({position.category_name})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="photo_url">Photo URL (Optional)</Label>
                  <Input
                    id="photo_url"
                    value={newCandidate.photo_url}
                    onChange={(e) => setNewCandidate((prev) => ({ ...prev, photo_url: e.target.value }))}
                    placeholder="https://example.com/photo.jpg"
                  />
                </div>
                <div>
                  <Label htmlFor="manifesto">Manifesto</Label>
                  <Textarea
                    id="manifesto"
                    value={newCandidate.manifesto}
                    onChange={(e) => setNewCandidate((prev) => ({ ...prev, manifesto: e.target.value }))}
                    placeholder="Enter candidate's manifesto and campaign promises..."
                    rows={4}
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)} className="flex-1">
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1">
                    Add Candidate
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
                  <p className="text-sm font-medium text-gray-600">Total Candidates</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <Trophy className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {stats.byCategory.slice(0, 3).map((category, index) => (
          <motion.div
            key={category.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + index * 0.1 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{category.name}</p>
                    <p className="text-3xl font-bold text-gray-900">{category.count}</p>
                  </div>
                  {getCategoryIcon(category.name)}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
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
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.name}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={positionFilter} onValueChange={setPositionFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by position" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Positions</SelectItem>
                {positions.map((position) => (
                  <SelectItem key={position.id} value={position.id}>
                    {position.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Candidates Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Candidates ({filteredCandidates.length})</span>
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
                  <TableHead>Candidate</TableHead>
                  <TableHead>Student ID</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Votes</TableHead>
                  <TableHead>Manifesto</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCandidates.map((candidate) => (
                  <TableRow key={candidate.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={candidate.photo_url || "/placeholder.svg"} />
                          <AvatarFallback>
                            {candidate.full_name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{candidate.full_name}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono">{candidate.student_id}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{candidate.class}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">{candidate.position_title}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getCategoryIcon(candidate.category_name || "")}
                        <span className="text-sm">{candidate.category_name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{candidate.vote_count}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs">
                        <p className="text-sm text-gray-600 line-clamp-2">{candidate.manifesto}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedCandidate(candidate)}
                          title="Edit candidate"
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteCandidate(candidate.id)}
                          title="Delete candidate"
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
