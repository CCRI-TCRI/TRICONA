"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"
import { UserPlus, Search, Trash2, Edit, Trophy, Users, Vote, Crown } from "lucide-react"

interface Position {
  id: string
  name: string
  category: string
  max_candidates: number
}

interface Candidate {
  id: string
  full_name: string
  student_id: string
  class: string
  position_id: string
  position_name: string
  manifesto: string
  photo_url?: string
  vote_count: number
  created_at: string
}

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [positions, setPositions] = useState<Position[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [positionFilter, setPositionFilter] = useState("all")
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingCandidate, setEditingCandidate] = useState<Candidate | null>(null)
  const [newCandidate, setNewCandidate] = useState({
    full_name: "",
    student_id: "",
    class: "",
    position_id: "",
    manifesto: "",
    photo_url: "",
  })

  const classes = ["S1", "S2", "S3", "S4", "S5", "S6"]

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // Fetch positions
      const { data: positionsData, error: positionsError } = await supabase
        .from("positions")
        .select("*")
        .order("category", { ascending: true })

      if (positionsError) throw positionsError

      // Fetch candidates with vote counts
      const { data: candidatesData, error: candidatesError } = await supabase
        .from("candidates")
        .select(`
          *,
          positions!inner(name)
        `)
        .order("created_at", { ascending: false })

      if (candidatesError) throw candidatesError

      // Get vote counts for each candidate
      const candidatesWithVotes = await Promise.all(
        (candidatesData || []).map(async (candidate) => {
          const { count } = await supabase
            .from("votes")
            .select("*", { count: "exact", head: true })
            .eq("candidate_id", candidate.id)

          return {
            ...candidate,
            position_name: candidate.positions.name,
            vote_count: count || 0,
          }
        }),
      )

      setPositions(positionsData || [])
      setCandidates(candidatesWithVotes)
    } catch (error) {
      console.error("Error fetching data:", error)
      toast({
        title: "Error",
        description: "Failed to fetch data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const addCandidate = async () => {
    if (!newCandidate.full_name || !newCandidate.student_id || !newCandidate.class || !newCandidate.position_id) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    try {
      const { data, error } = await supabase
        .from("candidates")
        .insert([
          {
            full_name: newCandidate.full_name,
            student_id: newCandidate.student_id,
            class: newCandidate.class,
            position_id: newCandidate.position_id,
            manifesto: newCandidate.manifesto,
            photo_url:
              newCandidate.photo_url ||
              `/placeholder.svg?height=100&width=100&text=${newCandidate.full_name
                .split(" ")
                .map((n) => n[0])
                .join("")}`,
          },
        ])
        .select()

      if (error) throw error

      await fetchData() // Refresh data
      setNewCandidate({
        full_name: "",
        student_id: "",
        class: "",
        position_id: "",
        manifesto: "",
        photo_url: "",
      })
      setShowAddDialog(false)

      toast({
        title: "Success",
        description: "Candidate added successfully",
      })
    } catch (error) {
      console.error("Error adding candidate:", error)
      toast({
        title: "Error",
        description: "Failed to add candidate",
        variant: "destructive",
      })
    }
  }

  const updateCandidate = async () => {
    if (!editingCandidate) return

    try {
      const { error } = await supabase
        .from("candidates")
        .update({
          full_name: editingCandidate.full_name,
          student_id: editingCandidate.student_id,
          class: editingCandidate.class,
          position_id: editingCandidate.position_id,
          manifesto: editingCandidate.manifesto,
          photo_url: editingCandidate.photo_url,
        })
        .eq("id", editingCandidate.id)

      if (error) throw error

      await fetchData()
      setEditingCandidate(null)

      toast({
        title: "Success",
        description: "Candidate updated successfully",
      })
    } catch (error) {
      console.error("Error updating candidate:", error)
      toast({
        title: "Error",
        description: "Failed to update candidate",
        variant: "destructive",
      })
    }
  }

  const deleteCandidate = async (id: string) => {
    try {
      const { error } = await supabase.from("candidates").delete().eq("id", id)

      if (error) throw error

      setCandidates((prev) => prev.filter((c) => c.id !== id))
      toast({
        title: "Success",
        description: "Candidate deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting candidate:", error)
      toast({
        title: "Error",
        description: "Failed to delete candidate",
        variant: "destructive",
      })
    }
  }

  const filteredCandidates = candidates.filter((candidate) => {
    const matchesSearch =
      candidate.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.student_id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesPosition = positionFilter === "all" || candidate.position_id === positionFilter

    return matchesSearch && matchesPosition
  })

  const stats = {
    total: candidates.length,
    positions: positions.length,
    totalVotes: candidates.reduce((sum, c) => sum + c.vote_count, 0),
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Candidate Management</h1>
          <p className="text-muted-foreground">Manage election candidates and their information</p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="w-4 h-4 mr-2" />
              Add Candidate
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Candidate</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    value={newCandidate.full_name}
                    onChange={(e) => setNewCandidate((prev) => ({ ...prev, full_name: e.target.value }))}
                    placeholder="Enter full name"
                  />
                </div>
                <div>
                  <Label htmlFor="student_id">Student ID</Label>
                  <Input
                    id="student_id"
                    value={newCandidate.student_id}
                    onChange={(e) => setNewCandidate((prev) => ({ ...prev, student_id: e.target.value }))}
                    placeholder="Enter student ID"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
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
                <div>
                  <Label htmlFor="position">Position</Label>
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
                          {position.name} ({position.category})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="photo_url">Photo URL (Optional)</Label>
                <Input
                  id="photo_url"
                  value={newCandidate.photo_url}
                  onChange={(e) => setNewCandidate((prev) => ({ ...prev, photo_url: e.target.value }))}
                  placeholder="Enter photo URL"
                />
              </div>
              <div>
                <Label htmlFor="manifesto">Manifesto</Label>
                <Textarea
                  id="manifesto"
                  value={newCandidate.manifesto}
                  onChange={(e) => setNewCandidate((prev) => ({ ...prev, manifesto: e.target.value }))}
                  placeholder="Enter candidate's manifesto..."
                  rows={4}
                />
              </div>
              <Button onClick={addCandidate} className="w-full">
                Add Candidate
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Candidates</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Positions</CardTitle>
            <Crown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.positions}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Votes</CardTitle>
            <Vote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalVotes}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by name or student ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="position-filter">Position</Label>
              <Select value={positionFilter} onValueChange={setPositionFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Positions</SelectItem>
                  {positions.map((position) => (
                    <SelectItem key={position.id} value={position.id}>
                      {position.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Candidates Table */}
      <Card>
        <CardHeader>
          <CardTitle>Candidates</CardTitle>
          <CardDescription>
            {filteredCandidates.length} of {candidates.length} candidates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Photo</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Student ID</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Votes</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCandidates.map((candidate) => (
                <TableRow key={candidate.id}>
                  <TableCell>
                    <Avatar>
                      <AvatarImage src={candidate.photo_url || "/placeholder.svg"} alt={candidate.full_name} />
                      <AvatarFallback>
                        {candidate.full_name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell className="font-medium">{candidate.full_name}</TableCell>
                  <TableCell>{candidate.student_id}</TableCell>
                  <TableCell>{candidate.class}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{candidate.position_name}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-yellow-600" />
                      <span className="font-bold">{candidate.vote_count}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm" onClick={() => setEditingCandidate(candidate)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Edit Candidate</DialogTitle>
                          </DialogHeader>
                          {editingCandidate && (
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label htmlFor="edit_full_name">Full Name</Label>
                                  <Input
                                    id="edit_full_name"
                                    value={editingCandidate.full_name}
                                    onChange={(e) =>
                                      setEditingCandidate((prev) =>
                                        prev ? { ...prev, full_name: e.target.value } : null,
                                      )
                                    }
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="edit_student_id">Student ID</Label>
                                  <Input
                                    id="edit_student_id"
                                    value={editingCandidate.student_id}
                                    onChange={(e) =>
                                      setEditingCandidate((prev) =>
                                        prev ? { ...prev, student_id: e.target.value } : null,
                                      )
                                    }
                                  />
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label htmlFor="edit_class">Class</Label>
                                  <Select
                                    value={editingCandidate.class}
                                    onValueChange={(value) =>
                                      setEditingCandidate((prev) => (prev ? { ...prev, class: value } : null))
                                    }
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
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
                                <div>
                                  <Label htmlFor="edit_position">Position</Label>
                                  <Select
                                    value={editingCandidate.position_id}
                                    onValueChange={(value) =>
                                      setEditingCandidate((prev) => (prev ? { ...prev, position_id: value } : null))
                                    }
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {positions.map((position) => (
                                        <SelectItem key={position.id} value={position.id}>
                                          {position.name} ({position.category})
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                              <div>
                                <Label htmlFor="edit_photo_url">Photo URL</Label>
                                <Input
                                  id="edit_photo_url"
                                  value={editingCandidate.photo_url || ""}
                                  onChange={(e) =>
                                    setEditingCandidate((prev) =>
                                      prev ? { ...prev, photo_url: e.target.value } : null,
                                    )
                                  }
                                />
                              </div>
                              <div>
                                <Label htmlFor="edit_manifesto">Manifesto</Label>
                                <Textarea
                                  id="edit_manifesto"
                                  value={editingCandidate.manifesto}
                                  onChange={(e) =>
                                    setEditingCandidate((prev) =>
                                      prev ? { ...prev, manifesto: e.target.value } : null,
                                    )
                                  }
                                  rows={4}
                                />
                              </div>
                              <Button onClick={updateCandidate} className="w-full">
                                Update Candidate
                              </Button>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Candidate</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete {candidate.full_name}? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteCandidate(candidate.id)}>Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
