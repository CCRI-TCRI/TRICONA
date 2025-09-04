"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle, AlertCircle, ArrowRight, Settings, Vote, Shield, Users } from "lucide-react"
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
    <div className="min-h-screen bg-gradient-to-br from-background via-green-50 to-green-100 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-secondary/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent/5 rounded-full blur-3xl"></div>
      </div>

      <div className="absolute top-6 right-6 z-10">
        <Button
          variant="outline"
          size="sm"
          className="border-primary/20 text-primary hover:bg-primary/10 backdrop-blur-sm bg-card/80 shadow-lg"
          onClick={() => (window.location.href = "/admin/login")}
        >
          <Settings className="w-4 h-4 mr-2" />
          Admin Panel
        </Button>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ y: -20, rotate: -10 }}
            animate={{ y: 0, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="mx-auto w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center mb-6 shadow-2xl"
          >
            <Vote className="w-10 h-10 text-white" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl font-bold text-primary mb-3 text-balance"
          >
            Lubiri E-Voting
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-muted-foreground text-lg"
          >
            Secure Student Democracy Platform
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex items-center justify-center gap-6 mt-4 text-sm text-muted-foreground"
          >
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              <span>Secure</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              <span>Anonymous</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-primary" />
              <span>Verified</span>
            </div>
          </motion.div>
        </div>

        <AnimatePresence mode="wait">
          {step === "credentials" && (
            <motion.div
              key="credentials"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <Card className="backdrop-blur-xl bg-card/95 border-border shadow-2xl">
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-2xl text-card-foreground">Student Login</CardTitle>
                  <p className="text-muted-foreground">Enter your credentials to access the ballot</p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <Label htmlFor="student-id" className="text-card-foreground font-medium">
                      Student ID
                    </Label>
                    <Input
                      id="student-id"
                      type="text"
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value.toUpperCase())}
                      className="bg-input border-border text-foreground placeholder:text-muted-foreground h-12 text-lg focus:ring-2 focus:ring-ring transition-all"
                      placeholder="e.g., LUB2024001"
                      maxLength={15}
                    />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="voting-code" className="text-card-foreground font-medium">
                      Voting Code
                    </Label>
                    <Input
                      id="voting-code"
                      type="password"
                      value={votingCode}
                      onChange={(e) => setVotingCode(e.target.value)}
                      className="bg-input border-border text-foreground placeholder:text-muted-foreground h-12 text-lg focus:ring-2 focus:ring-ring transition-all"
                      placeholder="Enter your 6-digit code"
                      maxLength={6}
                    />
                  </div>

                  <Button
                    onClick={verifyCredentials}
                    disabled={isVerifying || !studentId || !votingCode}
                    className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground h-12 text-lg font-semibold shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-[1.02]"
                  >
                    {isVerifying ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                      />
                    ) : (
                      <>
                        Continue to Face Verification
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </>
                    )}
                  </Button>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: 20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      className="flex items-center space-x-3 text-destructive-foreground bg-destructive/10 border border-destructive/20 p-4 rounded-lg"
                    >
                      <AlertCircle className="w-5 h-5 flex-shrink-0" />
                      <span className="font-medium">{error}</span>
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
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <div className="backdrop-blur-xl bg-card/95 border border-border rounded-lg p-6 shadow-2xl">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-semibold text-card-foreground mb-3">Face Verification</h3>
                  <p className="text-primary font-medium text-lg">Welcome, {userData?.full_name}</p>
                  <p className="text-muted-foreground">Class: {userData?.class}</p>
                </div>

                <FaceRecognition onSuccess={handleFaceSuccess} onError={handleFaceError} studentId={studentId} />

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center space-x-3 text-destructive-foreground bg-destructive/10 border border-destructive/20 p-4 rounded-lg mt-4"
                  >
                    <AlertCircle className="w-5 h-5" />
                    <span className="font-medium">{error}</span>
                  </motion.div>
                )}

                <Button
                  onClick={() => setStep("credentials")}
                  variant="outline"
                  className="w-full mt-6 border-border text-card-foreground hover:bg-muted h-12"
                >
                  Back to Login
                </Button>
              </div>
            </motion.div>
          )}

          {step === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              <Card className="backdrop-blur-xl bg-card/95 border-border text-center shadow-2xl">
                <CardContent className="pt-8 pb-8">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    className="mx-auto w-24 h-24 bg-primary rounded-full flex items-center justify-center mb-6 shadow-lg"
                  >
                    <CheckCircle className="w-14 h-14 text-white" />
                  </motion.div>

                  <h3 className="text-2xl font-semibold text-primary mb-3">Authentication Successful!</h3>
                  <p className="text-card-foreground mb-2 text-lg font-medium">Welcome, {userData?.full_name}</p>
                  <p className="text-muted-foreground">Student ID: {studentId}</p>

                  <motion.p
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
                    className="text-secondary font-medium mt-6 flex items-center justify-center gap-2"
                  >
                    <div className="w-2 h-2 bg-secondary rounded-full animate-pulse" />
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
