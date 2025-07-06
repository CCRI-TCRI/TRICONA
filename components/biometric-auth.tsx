"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
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
      // Authenticate with Supabase database only
      const { data: user, error: dbError } = await supabase
        .from("users")
        .select("*")
        .eq("student_id", studentId.toUpperCase())
        .eq("voting_code", votingCode.toUpperCase())
        .single()

      if (dbError) {
        console.error("Database error:", dbError)
        setError("Invalid student ID or voting code. Please check your credentials.")
        toast.error("Invalid credentials")
        return
      }

      if (user) {
        if (user.has_voted) {
          setError("This voting code has already been used. Each code can only be used once.")
          toast.error("Voting code already used")
          return
        }

        toast.success(`Welcome, ${user.full_name}!`)
        onAuthSuccess(user.student_id)
        return
      }

      setError("Invalid student ID or voting code. Please check your credentials.")
      toast.error("Invalid credentials")
    } catch (error) {
      console.error("Authentication error:", error)
      setError("Authentication failed. Please check your connection and try again.")
      toast.error("Authentication failed")
    } finally {
      setIsLoading(false)
    }
  }

  const handleFaceAuth = async () => {
    setIsLoading(true)
    try {
      // Simulate face recognition processing
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // For now, face recognition is not fully implemented
      // You would integrate with a face recognition service here
      toast.error("Face recognition is not yet available. Please use manual login.")
      setAuthMethod("manual")
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
        <Card className="bg-white shadow-2xl border-0">
          <CardHeader className="text-center space-y-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
              className="mx-auto w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center shadow-lg border"
            >
              <img src="/logo.png" alt="Lubiri Secondary School" className="w-20 h-20 object-contain" />
            </motion.div>
            <div>
              <CardTitle className="text-2xl font-bold text-gray-800">Lubiri Secondary School</CardTitle>
              <p className="text-gray-600 mt-2">2025 Student OP Polls Elections</p>
              <Badge variant="secondary" className="mt-2 bg-blue-100 text-blue-800">
               Lubiri Royal Ballot by Sinclaire
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Authentication Method Toggle */}
            <div className="flex space-x-2 bg-gray-100 rounded-lg p-1">
              <Button
                variant={authMethod === "manual" ? "default" : "ghost"}
                size="sm"
                onClick={() => {
                  setAuthMethod("manual")
                  stopCamera()
                }}
                className="flex-1"
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
                className="flex-1"
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
                    <Label htmlFor="studentId" className="text-gray-700">
                      Student ID
                    </Label>
                    <Input
                      id="studentId"
                      type="text"
                      placeholder="Enter your student ID"
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                      className="border-gray-300 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="votingCode" className="text-gray-700">
                      Voting Code
                    </Label>
                    <div className="relative">
                      <Input
                        id="votingCode"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your voting code"
                        value={votingCode}
                        onChange={(e) => setVotingCode(e.target.value)}
                        className="border-gray-300 focus:border-blue-500 pr-10"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>

                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
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

                  {/* Information about getting credentials */}
                  <div className="text-center text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
                    <p className="font-semibold mb-1 text-gray-700">Need your credentials?</p>
                    <p>Contact your class teacher or the election committee</p>
                    <p>for your Student ID and Voting Code</p>
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
                    <video ref={videoRef} autoPlay muted className="w-full h-64 object-cover rounded-lg bg-gray-100" />
                    <canvas ref={canvasRef} className="hidden" />

                    {!stream && (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
                        <div className="text-center">
                          <Camera className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                          <p className="text-gray-600">Camera access required</p>
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

                  <div className="text-center text-xs text-gray-500 bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                    <p className="font-semibold mb-1 text-yellow-700">Face Recognition</p>
                    <p className="text-yellow-600">This feature is currently under development by the production team preview will be available Early September.</p>
                    <p className="text-yellow-600">Please use manual login for now.</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="text-center text-xs text-gray-500 space-y-1">
              <p>Secure authentication powered by Lubiri Secondary School</p>
              <p>Your vote is private and anonymous</p>
              <p className="font-semibold text-orange-600">⚠️ Each voting code can only be used once</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
