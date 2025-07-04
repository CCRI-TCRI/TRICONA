"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "@/lib/supabase"
import { Download, FileText, Calendar, Users, Vote } from "lucide-react"

export default function ReportsPage() {
  const [loading, setLoading] = useState(false)
  const [reportType, setReportType] = useState("summary")

  const generateReport = async (type: string) => {
    setLoading(true)
    try {
      let csvContent = ""
      let filename = ""

      switch (type) {
        case "summary":
          csvContent = await generateSummaryReport()
          filename = `election-summary-${new Date().toISOString().split("T")[0]}.csv`
          break
        case "detailed":
          csvContent = await generateDetailedReport()
          filename = `election-detailed-${new Date().toISOString().split("T")[0]}.csv`
          break
        case "voters":
          csvContent = await generateVotersReport()
          filename = `voters-report-${new Date().toISOString().split("T")[0]}.csv`
          break
        case "candidates":
          csvContent = await generateCandidatesReport()
          filename = `candidates-report-${new Date().toISOString().split("T")[0]}.csv`
          break
      }

      const blob = new Blob([csvContent], { type: "text/csv" })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = filename
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Error generating report:", error)
    } finally {
      setLoading(false)
    }
  }

  const generateSummaryReport = async () => {
    const { data: positions } = await supabase.from("positions").select("*")
    const { data: candidates } = await supabase.from("candidates").select("*")
    const { data: votes } = await supabase.from("votes").select("*")
    const { data: users } = await supabase.from("users").select("*")

    const header = ["Position", "Total Candidates", "Total Votes", "Winner", "Winner Votes"].join(",")
    const rows = []

    for (const position of positions || []) {
      const positionCandidates = candidates?.filter((c) => c.position_id === position.id) || []
      const positionVotes = votes?.filter((v) => positionCandidates.some((c) => c.id === v.candidate_id)) || []

      const candidateVotes = positionCandidates.map((candidate) => ({
        ...candidate,
        voteCount: votes?.filter((v) => v.candidate_id === candidate.id).length || 0,
      }))

      const winner = candidateVotes.sort((a, b) => b.voteCount - a.voteCount)[0]

      rows.push(
        [
          position.name,
          positionCandidates.length,
          positionVotes.length,
          winner?.full_name || "No candidates",
          winner?.voteCount || 0,
        ].join(","),
      )
    }

    return [header, ...rows].join("\n")
  }

  const generateDetailedReport = async () => {
    const { data: votes } = await supabase.from("votes").select(`
        *,
        candidates(*),
        users(*)
      `)

    const header = ["Vote ID", "Voter Name", "Candidate Name", "Position", "Vote Time"].join(",")
    const rows = (votes || []).map((vote) =>
      [
        vote.id,
        vote.users?.full_name || "Unknown",
        vote.candidates?.full_name || "Unknown",
        "Position", // You'd need to join with positions table
        new Date(vote.created_at).toLocaleString(),
      ].join(","),
    )

    return [header, ...rows].join("\n")
  }

  const generateVotersReport = async () => {
    const { data: users } = await supabase.from("users").select("*")

    const header = ["Student ID", "Full Name", "Class", "Voting Code", "Has Voted", "Voted At"].join(",")
    const rows = (users || []).map((user) =>
      [
        user.student_id,
        user.full_name,
        user.class,
        user.voting_code,
        user.has_voted ? "Yes" : "No",
        user.voted_at || "N/A",
      ].join(","),
    )

    return [header, ...rows].join("\n")
  }

  const generateCandidatesReport = async () => {
    const { data: candidates } = await supabase.from("candidates").select(`
        *,
        positions(name)
      `)

    const header = ["Student ID", "Full Name", "Class", "Position", "Manifesto"].join(",")
    const rows = (candidates || []).map((candidate) =>
      [
        candidate.student_id,
        candidate.full_name,
        candidate.class,
        candidate.positions?.name || "Unknown",
        `"${candidate.manifesto.replace(/"/g, '""')}"`,
      ].join(","),
    )

    return [header, ...rows].join("\n")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Reports</h1>
        <p className="text-muted-foreground">Generate and download election reports</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => generateReport("summary")}>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Summary Report
            </CardTitle>
            <CardDescription>Overview of all positions and results</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" disabled={loading}>
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => generateReport("detailed")}>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Vote className="w-5 h-5" />
              Detailed Report
            </CardTitle>
            <CardDescription>Individual vote records and details</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" disabled={loading}>
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => generateReport("voters")}>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="w-5 h-5" />
              Voters Report
            </CardTitle>
            <CardDescription>Complete voter list and status</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" disabled={loading}>
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => generateReport("candidates")}>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Candidates Report
            </CardTitle>
            <CardDescription>All candidates and their information</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" disabled={loading}>
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
