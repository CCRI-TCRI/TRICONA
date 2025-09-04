"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { motion, AnimatePresence } from "framer-motion"
import { KeyRound, CheckCircle, AlertCircle, ArrowRight } from "lucide-react"
import { FaceRecognition } from "./face-recognition"
import { supabase } from "@/lib/supabase"

interface VoterAuthProps {
  onAuthSuccess: (studentId: string) => void
}

export function VoterAuth({ onAuthSuccess }: VoterAuthProps) {
  const [step, setStep] = useState<"credentials" | "face" | "success">("credentials")
  const [studentId, setStudentId] = useState("")
  const [votingCode, setVotingCode] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)
  const [error, setError] = useState("")
  const [userData, setUserData] = useState<any>(null)

  const verifyCredentials = async () => {
    if (!studentId || !votingCode) {
      setError("Please enter both Student ID and Voting Code")
      return
    }

    setIsVerifying(true)
    setError("")

    try {
      // Verify student credentials
      const { data: user, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("student_id", studentId.toUpperCase())
        .eq("voting_code", votingCode)
        .single()

      if (userError || !user) {
        setError("Invalid Student ID or Voting Code")
        return
      }

      if (user.has_voted) {
        setError("You have already voted in this election")
        return
      }

      setUserData(user)
      setStep("face")
    } catch (err) {
      setError("Verification failed. Please try again.")
    } finally {
      setIsVerifying(false)
    }
  }

  const handleFaceSuccess = async (faceData: string) => {
    try {
      // In a real implementation, you would verify the face data
      // against stored biometric data for the student

      // For demo purposes, we'll proceed to success
      setStep("success")

      // Simulate a brief delay then proceed to voting
      setTimeout(() => {
        onAuthSuccess(studentId.toUpperCase())
      }, 2000)
    } catch (err) {
      setError("Face verification failed")
    }
  }

  const handleFaceError = (error: string) => {
    setError(error)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <motion.div
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mb-4"
          >
            <KeyRound className="w-8 h-8 text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold text-white mb-2">Lubiri E-Voting</h1>
          <p className="text-blue-200">Secure Student Authentication</p>
        </div>

        <AnimatePresence mode="wait">
          {step === "credentials" && (
            <motion.div
              key="credentials"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
            >
              <Card className="backdrop-blur-lg bg-white/10 border-white/20 text-white">
                <CardHeader className="text-center">
                  <CardTitle className="text-xl">Student Login</CardTitle>
                  <p className="text-blue-200">Enter your credentials to access the ballot</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="student-id">Student ID</Label>
                    <Input
                      id="student-id"
                      type="text"
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value.toUpperCase())}
                      className="bg-white/10 border-white/20 text-white placeholder-white/50"
                      placeholder="e.g., LUB2024001"
                      maxLength={15}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="voting-code">Voting Code</Label>
                    <Input
                      id="voting-code"
                      type="password"
                      value={votingCode}
                      onChange={(e) => setVotingCode(e.target.value)}
                      className="bg-white/10 border-white/20 text-white placeholder-white/50"
                      placeholder="Enter your 6-digit code"
                      maxLength={6}
                    />
                  </div>

                  <Button
                    onClick={verifyCredentials}
                    disabled={isVerifying || !studentId || !votingCode}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                  >
                    {isVerifying ? (
                      "Verifying..."
                    ) : (
                      <>
                        Continue to Face Verification
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center space-x-2 text-red-400 bg-red-500/10 p-3 rounded-lg"
                    >
                      <AlertCircle className="w-5 h-5" />
                      <span>{error}</span>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {step === "face" && (
            <motion.div
              key="face"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
            >
              <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-lg p-6">
                <div className="text-center mb-4">
                  <h3 className="text-xl font-semibold text-white mb-2">Face Verification</h3>
                  <p className="text-blue-200">Welcome, {userData?.full_name}</p>
                  <p className="text-sm text-blue-300">Class: {userData?.class}</p>
                </div>

                <FaceRecognition onSuccess={handleFaceSuccess} onError={handleFaceError} studentId={studentId} />

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center space-x-2 text-red-400 bg-red-500/10 p-3 rounded-lg mt-4"
                  >
                    <AlertCircle className="w-5 h-5" />
                    <span>{error}</span>
                  </motion.div>
                )}

                <Button
                  onClick={() => setStep("credentials")}
                  variant="outline"
                  className="w-full mt-4 border-white/20 text-white hover:bg-white/10"
                >
                  Back to Login
                </Button>
              </div>
            </motion.div>
          )}

          {step === "success" && (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
              <Card className="backdrop-blur-lg bg-white/10 border-white/20 text-white text-center">
                <CardContent className="pt-6">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    className="mx-auto w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-4"
                  >
                    <CheckCircle className="w-12 h-12 text-white" />
                  </motion.div>

                  <h3 className="text-xl font-semibold text-green-400 mb-2">Authentication Successful!</h3>
                  <p className="text-blue-200 mb-2">Welcome, {userData?.full_name}</p>
                  <p className="text-sm text-blue-300">Student ID: {studentId}</p>

                  <motion.p
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
                    className="text-yellow-300 mt-4"
                  >
                    Redirecting to voting tutorial...
                  </motion.p>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
