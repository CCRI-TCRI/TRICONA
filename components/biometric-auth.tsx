"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { motion, AnimatePresence } from "framer-motion"
import { Camera, User, Lock, Eye, EyeOff, CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"

interface BiometricAuthProps {
  onAuthSuccess: (studentId: string) => void
}

export function BiometricAuth({ onAuthSuccess }: BiometricAuthProps) {
  const [authMethod, setAuthMethod] = useState<"face" | "manual">("manual")
  const [studentId, setStudentId] = useState("")
  const [votingCode, setVotingCode] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)

  // Demo users for testing
  const demoUsers = [
    { student_id: "LSS001", voting_code: "VT001A", full_name: "John Doe", class: "S6A" },
    { student_id: "LSS002", voting_code: "VT002B", full_name: "Jane Smith", class: "S6B" },
    { student_id: "DEMO123", voting_code: "DEMO456", full_name: "Demo Student", class: "S6C" },
  ]

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [stream])

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
      })
      setStream(mediaStream)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
    } catch (error) {
      console.error("Error accessing camera:", error)
      toast.error("Camera access denied. Please use manual login.")
      setAuthMethod("manual")
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
    }
  }

  const handleManualAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      // First try to authenticate with Supabase
      const { data: user, error: dbError } = await supabase
        .from("users")
        .select("*")
        .eq("student_id", studentId.toUpperCase())
        .eq("voting_code", votingCode.toUpperCase())
        .single()

      if (user && !user.has_voted) {
        toast.success(`Welcome, ${user.full_name}!`)
        onAuthSuccess(user.student_id)
        return
      } else if (user && user.has_voted) {
        setError("You have already voted in this election.")
        toast.error("You have already voted in this election.")
        return
      }

      // If database fails or user not found, try demo users
      const demoUser = demoUsers.find(
        (u) =>
          u.student_id.toUpperCase() === studentId.toUpperCase() &&
          u.voting_code.toUpperCase() === votingCode.toUpperCase(),
      )

      if (demoUser) {
        toast.success(`Welcome, ${demoUser.full_name}! (Demo Mode)`)
        onAuthSuccess(demoUser.student_id)
        return
      }

      setError("Invalid student ID or voting code. Please check your credentials.")
      toast.error("Invalid credentials")
    } catch (error) {
      console.error("Authentication error:", error)

      // Fallback to demo users if database is unavailable
      const demoUser = demoUsers.find(
        (u) =>
          u.student_id.toUpperCase() === studentId.toUpperCase() &&
          u.voting_code.toUpperCase() === votingCode.toUpperCase(),
      )

      if (demoUser) {
        toast.success(`Welcome, ${demoUser.full_name}! (Demo Mode)`)
        onAuthSuccess(demoUser.student_id)
      } else {
        setError("Authentication failed. Please try again.")
        toast.error("Authentication failed")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleFaceAuth = async () => {
    setIsLoading(true)
    try {
      // Simulate face recognition processing
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // For demo purposes, use the first demo user
      const demoUser = demoUsers[0]
      toast.success(`Face recognized: ${demoUser.full_name}! (Demo Mode)`)
      onAuthSuccess(demoUser.student_id)
    } catch (error) {
      toast.error("Face recognition failed. Please try manual login.")
      setAuthMethod("manual")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative z-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <Card className="backdrop-blur-lg bg-white/10 border-white/20 text-white shadow-2xl">
          <CardHeader className="text-center space-y-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
              className="mx-auto w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg"
            >
              <img src="/logo.png" alt="Lubiri Secondary School" className="w-20 h-20 object-contain" />
            </motion.div>
            <div>
              <CardTitle className="text-2xl font-bold">Lubiri Secondary School</CardTitle>
              <p className="text-blue-200 mt-2">2024 Prefectorial Elections</p>
              <Badge variant="secondary" className="mt-2 bg-white/20 text-white">
                Secure Voting System
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Authentication Method Toggle */}
            <div className="flex space-x-2 bg-white/10 rounded-lg p-1">
              <Button
                variant={authMethod === "manual" ? "default" : "ghost"}
                size="sm"
                onClick={() => {
                  setAuthMethod("manual")
                  stopCamera()
                }}
                className="flex-1 text-white"
              >
                <User className="w-4 h-4 mr-2" />
                Manual Login
              </Button>
              <Button
                variant={authMethod === "face" ? "default" : "ghost"}
                size="sm"
                onClick={() => {
                  setAuthMethod("face")
                  startCamera()
                }}
                className="flex-1 text-white"
              >
                <Camera className="w-4 h-4 mr-2" />
                Face Recognition
              </Button>
            </div>

            <AnimatePresence mode="wait">
              {authMethod === "manual" ? (
                <motion.form
                  key="manual"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  onSubmit={handleManualAuth}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="studentId" className="text-white">
                      Student ID
                    </Label>
                    <Input
                      id="studentId"
                      type="text"
                      placeholder="Enter your student ID"
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="votingCode" className="text-white">
                      Voting Code
                    </Label>
                    <div className="relative">
                      <Input
                        id="votingCode"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your voting code"
                        value={votingCode}
                        onChange={(e) => setVotingCode(e.target.value)}
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/60 pr-10"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-0 top-0 h-full px-3 text-white/60 hover:text-white"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center space-x-2 text-red-400 bg-red-500/10 p-3 rounded-lg border border-red-500/20"
                    >
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-sm">{error}</span>
                    </motion.div>
                  )}

                  <Button
                    type="submit"
                    disabled={isLoading || !studentId || !votingCode}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Authenticating...
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4 mr-2" />
                        Login to Vote
                      </>
                    )}
                  </Button>

                  {/* Demo credentials hint */}
                  <div className="text-center text-xs text-white/60 bg-white/5 p-3 rounded-lg">
                    <p className="font-semibold mb-1">Demo Credentials:</p>
                    <p>ID: DEMO123 | Code: DEMO456</p>
                    <p>ID: LSS001 | Code: VT001A</p>
                  </div>
                </motion.form>
              ) : (
                <motion.div
                  key="face"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div className="relative">
                    <video ref={videoRef} autoPlay muted className="w-full h-64 object-cover rounded-lg bg-black/20" />
                    <canvas ref={canvasRef} className="hidden" />

                    {!stream && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
                        <div className="text-center">
                          <Camera className="w-12 h-12 mx-auto mb-2 text-white/60" />
                          <p className="text-white/80">Camera access required</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <Button
                    onClick={handleFaceAuth}
                    disabled={isLoading || !stream}
                    className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Scanning Face...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Authenticate with Face
                      </>
                    )}
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
