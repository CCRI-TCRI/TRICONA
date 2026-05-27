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
import { candidateStorage, positionStorage, voteStorage } from "@/lib/supabase-db"
import { UserPlus, Search, Trash2, Edit, Trophy, Users, Vote, Crown } from "lucide-react"

interface Position {
  id: string
  name: string
  category: string
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
  const [saving, setSaving] = useState(false)
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

  const classes = ["S1A", "S1B", "S2A", "S2B", "S3A", "S3B", "S4A", "S4B", "S5A", "S5B", "S6A", "S6B"]

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [positionsData, candidatesData, votes] = await Promise.all([
        positionStorage.getAll(),
        candidateStorage.getAll(),
        voteStorage.getAll(),
      ])

      setPositions(
        positionsData.map((p) => ({
          id: p.id,
          name: p.name,
          category: p.category,
        })),
      )

      const candidatesWithVotes = candidatesData.map((candidate) => {
        const position = positionsData.find((p) => p.id === candidate.position_id)
        const voteCount = votes.filter((v) => v.candidate_id === candidate.id).length
        return {
          ...candidate,
          position_name: position?.name || "Unknown Position",
          vote_count: voteCount,
        }
      })

      setCandidates(
        candidatesWithVotes.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
      )
    } catch (error) {
      console.error("[v0] Error fetching candidates data:", error)
      toast({ title: "Error", description: "Failed to fetch data", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const addCandidate = async () => {
    if (!newCandidate.full_name || !newCandidate.student_id || !newCandidate.class || !newCandidate.position_id) {
      toast({ title: "Error", description: "Please fill in all required fields", variant: "destructive" })
      return
    }

    setSaving(true)
    try {
      const saved = await candidateStorage.create({
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
      })

      const position = positions.find((p) => p.id === newCandidate.position_id)
      setCandidates((prev) => [{ ...saved, position_name: position?.name || "Unknown Position", vote_count: 0 }, ...prev])
      toast({ title: "Success", description: "Candidate added successfully" })
      setNewCandidate({ full_name: "", student_id: "", class: "", position_id: "", manifesto: "", photo_url: "" })
      setShowAddDialog(false)
    } catch (error) {
      console.error("[v0] Error adding candidate:", error)
      toast({ title: "Error", description: "Failed to add candidate", variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  const updateCandidate = async () => {
    if (!editingCandidate) return
    setSaving(true)
    try {
      const updated = await candidateStorage.update(editingCandidate.id, {
        full_name: editingCandidate.full_name,
        student_id: editingCandidate.student_id,
        class: editingCandidate.class,
        position_id: editingCandidate.position_id,
        manifesto: editingCandidate.manifesto,
        photo_url: editingCandidate.photo_url,
      })

      if (updated) {
        const position = positions.find((p) => p.id === editingCandidate.position_id)
        setCandidates((prev) =>
          prev.map((c) =>
            c.id === editingCandidate.id
              ? { ...editingCandidate, position_name: position?.name || "Unknown Position" }
              : c,
          ),
        )
        toast({ title: "Success", description: "Candidate updated successfully" })
      }
      setEditingCandidate(null)
    } catch (error) {
      console.error("[v0] Error updating candidate:", error)
      toast({ title: "Error", description: "Failed to update candidate", variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  const deleteCandidate = async (id: string) => {
    setSaving(true)
    try {
      const deleted = await candidateStorage.delete(id)
      if (deleted) {
        setCandidates((prev) => prev.filter((c) => c.id !== id))
        toast({ title: "Success", description: "Candidate deleted successfully" })
      }
    } catch (error) {
      console.error("[v0] Error deleting candidate:", error)
      toast({ title: "Error", description: "Failed to delete candidate", variant: "destructive" })
    } finally {
      setSaving(false)
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
            <Button disabled={saving}>
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
              <Button onClick={addCandidate} className="w-full" disabled={saving}>
                {saving ? "Adding..." : "Add Candidate"}
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
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingCandidate(candidate)}
                            disabled={saving}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Edit Candidate</DialogTitle>
                          </DialogHeader>
                          {editingCandidate && editingCandidate.id === candidate.id && (
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label>Full Name</Label>
                                  <Input
                                    value={editingCandidate.full_name}
                                    onChange={(e) =>
                                      setEditingCandidate((prev) =>
                                        prev ? { ...prev, full_name: e.target.value } : null,
                                      )
                                    }
                                  />
                                </div>
                                <div>
                                  <Label>Student ID</Label>
                                  <Input
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
                                  <Label>Class</Label>
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
                                  <Label>Position</Label>
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
                                      {positions.map((p) => (
                                        <SelectItem key={p.id} value={p.id}>
                                          {p.name}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                              <div>
                                <Label>Photo URL</Label>
                                <Input
                                  value={editingCandidate.photo_url || ""}
                                  onChange={(e) =>
                                    setEditingCandidate((prev) =>
                                      prev ? { ...prev, photo_url: e.target.value } : null,
                                    )
                                  }
                                />
                              </div>
                              <div>
                                <Label>Manifesto</Label>
                                <Textarea
                                  value={editingCandidate.manifesto}
                                  onChange={(e) =>
                                    setEditingCandidate((prev) =>
                                      prev ? { ...prev, manifesto: e.target.value } : null,
                                    )
                                  }
                                  rows={4}
                                />
                              </div>
                              <Button onClick={updateCandidate} className="w-full" disabled={saving}>
                                {saving ? "Saving..." : "Save Changes"}
                              </Button>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm" disabled={saving}>
                            <Trash2 className="w-4 h-4 text-red-500" />
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
                            <AlertDialogAction
                              onClick={() => deleteCandidate(candidate.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredCandidates.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Trophy className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium">No candidates found</p>
              <p className="text-sm">Add candidates using the button above</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
