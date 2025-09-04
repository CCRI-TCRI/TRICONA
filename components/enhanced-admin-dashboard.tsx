"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { AdminSidebar } from "@/components/admin-sidebar"
import { LiveResultsModal } from "@/components/live-results-modal"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Users,
  Vote,
  Trophy,
  BarChart3,
  Plus,
  Eye,
  Settings,
  UserPlus,
  LogOut,
  Trash2,
  Edit,
  CheckCircle,
  Clock,
  TrendingUp,
  Key,
  Copy,
  RefreshCw,
} from "lucide-react"

interface AdminUser {
  id: string
  full_name: string
  email: string
  role: string
}

interface EnhancedAdminDashboardProps {
  adminUser: AdminUser
}

export function EnhancedAdminDashboard({ adminUser }: EnhancedAdminDashboardProps) {
  const router = useRouter()
  const [currentPage, setCurrentPage] = useState("dashboard")
  const [showLiveResults, setShowLiveResults] = useState(false)
  const [stats, setStats] = useState({
    totalVoters: 0,
    votedCount: 0,
    totalCandidates: 0,
    totalPositions: 0,
    activeElections: 0,
  })
  const [candidates, setCandidates] = useState<any[]>([])
  const [positions, setPositions] = useState<any[]>([])
  const [voters, setVoters] = useState<any[]>([])
  const [votingCodes, setVotingCodes] = useState<any[]>([])
  const [electionSettings, setElectionSettings] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Form states
  const [newCandidate, setNewCandidate] = useState({
    candidate_name: "",
    student_id: "",
    class_level: "",
    position_id: "",
    manifesto: "",
  })
  const [newPosition, setNewPosition] = useState({
    position_name: "",
    category: "",
    description: "",
  })
  const [newVoter, setNewVoter] = useState({
    full_name: "",
    student_id: "",
    class_level: "",
    email: "",
  })

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    const supabase = createClient()
    setIsLoading(true)

    try {
      const [votersResult, candidatesResult, positionsResult, settingsResult, codesResult] = await Promise.all([
        supabase.from("voters").select("*"),
        supabase.from("election_candidates").select("*"),
        supabase.from("election_positions").select("*"),
        supabase.from("election_settings").select("*").limit(1).single(),
        supabase.from("voting_codes").select("*"),
      ])

      const votersList = votersResult.data || []
      const candidatesList = candidatesResult.data || []
      const positionsList = positionsResult.data || []
      const codesList = codesResult.data || []

      setVoters(votersList)
      setCandidates(candidatesList)
      setPositions(positionsList)
      setVotingCodes(codesList)
      setElectionSettings(settingsResult.data)

      setStats({
        totalVoters: votersList.length,
        votedCount: votersList.filter((v) => v.has_voted).length,
        totalCandidates: candidatesList.length,
        totalPositions: positionsList.length,
        activeElections: settingsResult.data?.is_active ? 1 : 0,
      })
    } catch (error: any) {
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePageChange = (page: string) => {
    if (page === "live-results") {
      setShowLiveResults(true)
    } else {
      setCurrentPage(page)
    }
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/admin/login")
  }

  const addCandidate = async () => {
    const supabase = createClient()

    try {
      const { error } = await supabase.from("election_candidates").insert([
        {
          ...newCandidate,
          vote_count: 0,
          is_active: true,
        },
      ])

      if (error) throw error

      setNewCandidate({
        candidate_name: "",
        student_id: "",
        class_level: "",
        position_id: "",
        manifesto: "",
      })
      loadDashboardData()
    } catch (error: any) {
      setError(error.message)
    }
  }

  const addPosition = async () => {
    const supabase = createClient()

    try {
      const { error } = await supabase.from("election_positions").insert([
        {
          ...newPosition,
          is_active: true,
        },
      ])

      if (error) throw error

      setNewPosition({
        position_name: "",
        category: "",
        description: "",
      })
      loadDashboardData()
    } catch (error: any) {
      setError(error.message)
    }
  }

  const toggleElectionStatus = async () => {
    const supabase = createClient()

    try {
      const { error } = await supabase
        .from("election_settings")
        .update({ is_active: !electionSettings?.is_active })
        .eq("id", electionSettings?.id)

      if (error) throw error
      loadDashboardData()
    } catch (error: any) {
      setError(error.message)
    }
  }

  const generateVotingCodes = async (count: number) => {
    const supabase = createClient()
    const codes = []

    for (let i = 0; i < count; i++) {
      const code = Math.random().toString(36).substring(2, 8).toUpperCase()
      codes.push({
        code,
        is_used: false,
        created_at: new Date().toISOString(),
      })
    }

    try {
      const { error } = await supabase.from("voting_codes").insert(codes)
      if (error) throw error
      loadDashboardData()
    } catch (error: any) {
      setError(error.message)
    }
  }

  const addVoter = async () => {
    const supabase = createClient()

    try {
      const { error } = await supabase.from("voters").insert([
        {
          ...newVoter,
          has_voted: false,
          is_verified: false,
        },
      ])

      if (error) throw error

      setNewVoter({
        full_name: "",
        student_id: "",
        class_level: "",
        email: "",
      })
      loadDashboardData()
    } catch (error: any) {
      setError(error.message)
    }
  }

  const StatCard = ({ title, value, icon: Icon, color, trend }: any) => (
    <Card className="relative overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold text-foreground">{value}</p>
            {trend && (
              <div className="flex items-center mt-1">
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">{trend}</span>
              </div>
            )}
          </div>
          <div className={`p-3 rounded-full ${color}`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const renderPageContent = () => {
    switch (currentPage) {
      case "dashboard":
        return (
          <div className="space-y-6">
            {/* Election Status */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-3 h-3 rounded-full ${electionSettings?.is_active ? "bg-green-500" : "bg-red-500"}`}
                    ></div>
                    <div>
                      <h3 className="font-semibold text-foreground">Election Status</h3>
                      <p className="text-sm text-muted-foreground">
                        {electionSettings?.is_active ? "Active - Voting in progress" : "Inactive - Voting closed"}
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={toggleElectionStatus}
                    variant={electionSettings?.is_active ? "destructive" : "default"}
                  >
                    {electionSettings?.is_active ? "Stop Election" : "Start Election"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Statistics */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
              <StatCard
                title="Total Voters"
                value={stats.totalVoters}
                icon={Users}
                color="bg-primary"
                trend="+12% from last election"
              />
              <StatCard
                title="Votes Cast"
                value={stats.votedCount}
                icon={Vote}
                color="bg-green-500"
                trend={`${Math.round((stats.votedCount / stats.totalVoters) * 100)}% turnout`}
              />
              <StatCard title="Candidates" value={stats.totalCandidates} icon={Trophy} color="bg-secondary" />
              <StatCard title="Positions" value={stats.totalPositions} icon={BarChart3} color="bg-chart-3" />
              <StatCard title="Active Elections" value={stats.activeElections} icon={Settings} color="bg-chart-4" />
            </div>
          </div>
        )

      case "voting-codes":
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-foreground">Voting Codes Management</h2>
              <Button onClick={() => generateVotingCodes(50)}>
                <Plus className="w-4 h-4 mr-2" />
                Generate 50 Codes
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardContent className="p-6 text-center">
                  <Key className="w-8 h-8 mx-auto mb-2 text-primary" />
                  <div className="text-2xl font-bold text-foreground">{votingCodes.length}</div>
                  <div className="text-sm text-muted-foreground">Total Codes</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
                  <div className="text-2xl font-bold text-foreground">
                    {votingCodes.filter((c) => c.is_used).length}
                  </div>
                  <div className="text-sm text-muted-foreground">Used Codes</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <Clock className="w-8 h-8 mx-auto mb-2 text-orange-500" />
                  <div className="text-2xl font-bold text-foreground">
                    {votingCodes.filter((c) => !c.is_used).length}
                  </div>
                  <div className="text-sm text-muted-foreground">Available Codes</div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Recent Voting Codes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                  {votingCodes.slice(0, 12).map((code) => (
                    <div key={code.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <span className="font-mono font-bold text-foreground">{code.code}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant={code.is_used ? "secondary" : "default"}>
                          {code.is_used ? "Used" : "Available"}
                        </Badge>
                        <Button variant="ghost" size="sm">
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case "candidates":
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Manage Candidates</h2>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Candidate
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Candidate</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="candidate_name">Full Name</Label>
                      <Input
                        id="candidate_name"
                        value={newCandidate.candidate_name}
                        onChange={(e) => setNewCandidate({ ...newCandidate, candidate_name: e.target.value })}
                        placeholder="Enter candidate's full name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="student_id">Student ID</Label>
                      <Input
                        id="student_id"
                        value={newCandidate.student_id}
                        onChange={(e) => setNewCandidate({ ...newCandidate, student_id: e.target.value })}
                        placeholder="Enter student ID"
                      />
                    </div>
                    <div>
                      <Label htmlFor="class_level">Class</Label>
                      <Input
                        id="class_level"
                        value={newCandidate.class_level}
                        onChange={(e) => setNewCandidate({ ...newCandidate, class_level: e.target.value })}
                        placeholder="e.g., S6A"
                      />
                    </div>
                    <div>
                      <Label htmlFor="position_id">Position</Label>
                      <Select
                        value={newCandidate.position_id}
                        onValueChange={(value) => setNewCandidate({ ...newCandidate, position_id: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select position" />
                        </SelectTrigger>
                        <SelectContent>
                          {positions.map((position) => (
                            <SelectItem key={position.id} value={position.id}>
                              {position.position_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="manifesto">Manifesto</Label>
                      <Textarea
                        id="manifesto"
                        value={newCandidate.manifesto}
                        onChange={(e) => setNewCandidate({ ...newCandidate, manifesto: e.target.value })}
                        placeholder="Enter candidate's manifesto"
                        rows={3}
                      />
                    </div>
                    <Button onClick={addCandidate} className="w-full">
                      Add Candidate
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-card">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Candidate
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Position
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Class
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Votes
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-background divide-y divide-border">
                      {candidates.map((candidate) => (
                        <tr key={candidate.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-foreground">{candidate.candidate_name}</div>
                              <div className="text-sm text-muted-foreground">{candidate.student_id}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                            {positions.find((p) => p.id === candidate.position_id)?.position_name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                            {candidate.class_level}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge variant="secondary">{candidate.vote_count}</Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge variant={candidate.is_active ? "default" : "secondary"}>
                              {candidate.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm">
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button variant="outline" size="sm">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case "positions":
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Manage Positions</h2>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Position
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Position</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="position_name">Position Name</Label>
                      <Input
                        id="position_name"
                        value={newPosition.position_name}
                        onChange={(e) => setNewPosition({ ...newPosition, position_name: e.target.value })}
                        placeholder="e.g., Head Prefect"
                      />
                    </div>
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Input
                        id="category"
                        value={newPosition.category}
                        onChange={(e) => setNewPosition({ ...newPosition, category: e.target.value })}
                        placeholder="e.g., Leadership"
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={newPosition.description}
                        onChange={(e) => setNewPosition({ ...newPosition, description: e.target.value })}
                        placeholder="Enter position description"
                        rows={3}
                      />
                    </div>
                    <Button onClick={addPosition} className="w-full">
                      Add Position
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {positions.map((position) => (
                <Card key={position.id}>
                  <CardHeader>
                    <CardTitle className="text-lg text-foreground">{position.position_name}</CardTitle>
                    <Badge variant="outline">{position.category}</Badge>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">{position.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-foreground">
                        {candidates.filter((c) => c.position_id === position.id).length} candidates
                      </span>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )

      case "voters":
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Registered Voters</h2>
              <Button onClick={addVoter}>
                <UserPlus className="w-4 h-4 mr-2" />
                Add Voter
              </Button>
            </div>

            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-card">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Student
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Class
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Voting Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Vote Time
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-background divide-y divide-border">
                      {voters.slice(0, 20).map((voter) => (
                        <tr key={voter.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-foreground">{voter.full_name}</div>
                              <div className="text-sm text-muted-foreground">{voter.student_id}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">{voter.class_level}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge variant={voter.has_voted ? "default" : "secondary"}>
                              {voter.has_voted ? (
                                <>
                                  <CheckCircle className="w-3 h-3 mr-1" /> Voted
                                </>
                              ) : (
                                <>
                                  <Clock className="w-3 h-3 mr-1" /> Pending
                                </>
                              )}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                            {voter.vote_timestamp ? new Date(voter.vote_timestamp).toLocaleString() : "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case "election-settings":
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-foreground">Election Settings</h2>

            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="election_name">Election Name</Label>
                  <Input
                    id="election_name"
                    value={electionSettings?.election_name || ""}
                    placeholder="Enter election name"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="start_date">Start Date</Label>
                    <Input id="start_date" type="date" value={electionSettings?.start_date || ""} />
                  </div>
                  <div>
                    <Label htmlFor="end_date">End Date</Label>
                    <Input id="end_date" type="date" value={electionSettings?.end_date || ""} />
                  </div>
                </div>
                <div>
                  <Label htmlFor="custom_greeting">Custom Greeting</Label>
                  <Textarea
                    id="custom_greeting"
                    value={electionSettings?.custom_greeting || ""}
                    placeholder="Enter custom greeting message"
                    rows={3}
                  />
                </div>
                <Button>Save Settings</Button>
              </CardContent>
            </Card>
          </div>
        )

      default:
        return <div>Page content for {currentPage}</div>
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex">
      <AdminSidebar currentPage={currentPage} onPageChange={handlePageChange} stats={stats} />

      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-card shadow-sm border-b border-border">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  {currentPage.charAt(0).toUpperCase() + currentPage.slice(1).replace("-", " ")}
                </h1>
                <p className="text-muted-foreground">Lubiri Secondary School E-Voting System</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm font-medium text-foreground">{adminUser.full_name}</p>
                  <p className="text-xs text-muted-foreground">{adminUser.role}</p>
                </div>
                <Button variant="outline" onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {renderPageContent()}
        </div>
      </div>

      <LiveResultsModal isOpen={showLiveResults} onClose={() => setShowLiveResults(false)} />
    </div>
  )
}
