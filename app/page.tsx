"use client"

import { useState } from "react"
import { VoterAuth } from "@/components/voter-auth"
import { VotingTutorial } from "@/components/voting-tutorial"
import { EnhancedVotingBallot } from "@/components/enhanced-voting-ballot"

type AppState = "auth" | "tutorial" | "voting" | "complete"

export default function Home() {
  const [currentState, setCurrentState] = useState<AppState>("auth")
  const [studentId, setStudentId] = useState("")
  const [studentName, setStudentName] = useState("")

  const handleAuthSuccess = (id: string) => {
    setStudentId(id)
    // In a real app, you'd fetch the student name from the database
    setStudentName("Student") // Placeholder
    setCurrentState("tutorial")
  }

  const handleTutorialComplete = () => {
    setCurrentState("voting")
  }

  const handleVoteComplete = () => {
    setCurrentState("complete")
  }

  switch (currentState) {
    case "auth":
      return <VoterAuth onAuthSuccess={handleAuthSuccess} />
    case "tutorial":
      return <VotingTutorial studentName={studentName} onComplete={handleTutorialComplete} />
    case "voting":
      return <EnhancedVotingBallot studentId={studentId} onVoteComplete={handleVoteComplete} />
    case "complete":
      return (
        <div className="min-h-screen bg-gradient-to-br from-green-600 to-blue-700 flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-4xl font-bold mb-4">Thank You for Voting!</h1>
            <p className="text-xl">Your vote has been successfully recorded.</p>
          </div>
        </div>
      )
    default:
      return <VoterAuth onAuthSuccess={handleAuthSuccess} />
  }
}
