"use client"

import { useState } from "react"
import { BiometricAuth } from "@/components/biometric-auth"
import { WelcomeTutorial } from "@/components/welcome-tutorial"
import { VotingBallot } from "@/components/voting-ballot"
import { motion } from "framer-motion"
import { CheckCircle, Trophy, Sparkles } from "lucide-react"
import { supabase } from "@/lib/supabase"

type AppState = "auth" | "tutorial" | "voting" | "complete"

export default function VotingApp() {
  const [appState, setAppState] = useState<AppState>("auth")
  const [studentId, setStudentId] = useState("")
  const [studentName, setStudentName] = useState("")

  const handleAuthSuccess = async (id: string) => {
    setStudentId(id)

    // Get student name
    try {
      const { data: user } = await supabase.from("users").select("full_name").eq("student_id", id).single()

      if (user) {
        setStudentName(user.full_name)
      }
    } catch (error) {
      console.error("Error fetching user data:", error)
    }

    setAppState("tutorial")
  }

  const handleTutorialComplete = () => {
    setAppState("voting")
  }

  const handleVoteComplete = () => {
    setAppState("complete")
  }

  if (appState === "auth") {
    return <BiometricAuth onAuthSuccess={handleAuthSuccess} />
  }

  if (appState === "tutorial") {
    return <WelcomeTutorial onComplete={handleTutorialComplete} studentName={studentName || studentId} />
  }

  if (appState === "voting") {
    return <VotingBallot studentId={studentId} onVoteComplete={handleVoteComplete} />
  }

  if (appState === "complete") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center text-white max-w-2xl"
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            className="mx-auto w-32 h-32 bg-white rounded-full flex items-center justify-center mb-8 shadow-2xl"
          >
            <CheckCircle className="w-20 h-20 text-green-500" />
          </motion.div>

          <motion.h1
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-4xl md:text-6xl font-bold mb-6"
          >
            Vote Submitted Successfully!
          </motion.h1>

          <motion.p
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-xl md:text-2xl mb-8 opacity-90"
          >
            Thank you for participating in the 2024 Prefectorial Elections
          </motion.p>

          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-center space-x-4 text-lg">
              <Trophy className="w-6 h-6" />
              <span>Your voice matters</span>
              <Sparkles className="w-6 h-6" />
            </div>

            <p className="text-lg opacity-80">Results will be announced after the voting period ends.</p>

            <motion.div
              animate={{
                scale: [1, 1.05, 1],
                opacity: [0.7, 1, 0.7],
              }}
              transition={{
                duration: 2,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
              className="mt-8 text-sm opacity-60"
            >
              You may now close this window
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    )
  }

  return null
}
