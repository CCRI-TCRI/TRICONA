"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Camera, KeyRound, CheckCircle, AlertCircle, User } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { supabase } from "@/lib/supabase"
import { faceRecognition } from "@/lib/face-recognition"

interface BiometricAuthProps {
  onAuthSuccess: (studentId: string) => void
}

export function BiometricAuth({ onAuthSuccess }: BiometricAuthProps) {
  const [step, setStep] = useState<"student-id" | "face" | "code" | "success">("student-id")
  const [studentId, setStudentId] = useState("")
  const [votingCode, setVotingCode] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState("")
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  const handleStudentIdSubmit = async () => {
    if (!studentId.trim()) {
      setError("Please enter your Student ID")
      return
    }

    setIsProcessing(true)
    setError("")

    try {
      // Check if student exists and hasn't voted
      const { data: user, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("student_id", studentId.toUpperCase())
        .single()

      if (userError || !user) {
        setError("Student ID not found. Please check and try again.")
        return
      }

      if (user.has_voted) {
        setError("You have already voted in this election.")
        return
      }

      setStep("face")
    } catch (err) {
      setError("Verification failed. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  const startFaceRecognition = async () => {
    if (videoRef.current) {
      const success = await faceRecognition.initializeCamera(videoRef.current)
      if (!success) {
        setError("Camera access denied. Please enable camera permissions.")
      }
    }
  }

  const captureFace = async () => {
    setIsProcessing(true)
    setError("")

    try {
      const imageData = await faceRecognition.captureFrame()
      if (!imageData) {
        setError("Failed to capture image. Please try again.")
        return
      }

      setCapturedImage(imageData)

      // Detect face in captured image
      const faceDetected = await faceRecognition.detectFace(imageData)
      if (!faceDetected) {
        setError("No face detected. Please ensure your face is clearly visible.")
        return
      }

      // In production, compare with stored face encoding
      // For demo, we'll proceed to voting code step
      setStep("code")
    } catch (err) {
      setError("Face recognition failed. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  const verifyVotingCode = async () => {
    setIsProcessing(true)
    setError("")

    try {
      // Verify voting code
      const { data: user, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("student_id", studentId.toUpperCase())
        .eq("voting_code", votingCode)
        .single()

      if (userError || !user) {
        setError("Invalid voting code. Please check and try again.")
        return
      }

      setStep("success")
      setTimeout(() => onAuthSuccess(studentId), 1500)
    } catch (err) {
      setError("Verification failed. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  useEffect(() => {
    if (step === "face") {
      startFaceRecognition()
    }

    return () => {
      faceRecognition.stopCamera()
    }
  }, [step])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md">
        <Card className="backdrop-blur-lg bg-white/10 border-white/20 text-white">
          <CardHeader className="text-center">
            <motion.div
              initial={{ y: -20 }}
              animate={{ y: 0 }}
              className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mb-4"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
              >
                {step === "student-id" && <User className="w-8 h-8" />}
                {step === "face" && <Camera className="w-8 h-8" />}
                {step === "code" && <KeyRound className="w-8 h-8" />}
                {step === "success" && <CheckCircle className="w-8 h-8" />}
              </motion.div>
            </motion.div>
            <CardTitle className="text-2xl font-bold">Lubiri Secondary School</CardTitle>
            <p className="text-blue-200">Student E-Voting System</p>
          </CardHeader>

          <CardContent className="space-y-6">
            <AnimatePresence mode="wait">
              {step === "student-id" && (
                <motion.div
                  key="student-id"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  className="space-y-4"
                >
                  <h3 className="text-xl font-semibold text-center">Step 1: Student Verification</h3>
                  <p className="text-blue-200 text-center">Enter your Student ID to begin</p>

                  <div className="space-y-2">
                    <Label htmlFor="student-id">Student ID</Label>
                    <Input
                      id="student-id"
                      type="text"
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value.toUpperCase())}
                      className="text-center text-lg bg-white/10 border-white/20 text-white placeholder-white/50"
                      placeholder="Enter your Student ID (e.g., LUB2024001)"
                      maxLength={15}
                    />
                  </div>

                  <Button
                    onClick={handleStudentIdSubmit}
                    disabled={isProcessing || studentId.length < 6}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                  >
                    {isProcessing ? "Verifying..." : "Continue"}
                  </Button>
                </motion.div>
              )}

              {step === "face" && (
                <motion.div
                  key="face"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  className="text-center space-y-4"
                >
                  <h3 className="text-xl font-semibold">Step 2: Face Recognition</h3>
                  <p className="text-blue-200">Look directly at the camera</p>

                  <div className="relative mx-auto w-64 h-48 bg-black rounded-lg overflow-hidden">
                    <video ref={videoRef} autoPlay muted className="w-full h-full object-cover" />
                    <motion.div
                      className="absolute inset-0 border-4 border-green-400 rounded-lg"
                      animate={{
                        opacity: [0, 1, 0],
                        scale: [1, 1.02, 1],
                      }}
                      transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                    />
                  </div>

                  <Button
                    onClick={captureFace}
                    disabled={isProcessing}
                    className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
                  >
                    {isProcessing ? "Processing..." : "Capture Face"}
                  </Button>

                  <div className="mt-6 pt-4 border-t border-white/20">
                    <p className="text-sm text-blue-200 mb-3">Camera not working?</p>
                    <Button
                      onClick={() => setStep("code")}
                      variant="outline"
                      className="border-white/20 text-white hover:bg-white/10"
                    >
                      Skip Face Recognition
                    </Button>
                  </div>
                </motion.div>
              )}

              {step === "code" && (
                <motion.div
                  key="code"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  className="space-y-4"
                >
                  <h3 className="text-xl font-semibold text-center">Step 3: Voting Code</h3>
                  <p className="text-blue-200 text-center">Enter your 6-digit voting code</p>

                  {studentId && (
                    <div className="text-center p-3 bg-blue-500/20 rounded-lg border border-blue-500/30">
                      <p className="text-sm text-blue-200">Student ID</p>
                      <p className="text-lg font-bold text-white">{studentId}</p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="voting-code">Voting Code</Label>
                    <Input
                      id="voting-code"
                      type="text"
                      maxLength={6}
                      value={votingCode}
                      onChange={(e) => setVotingCode(e.target.value.replace(/\D/g, ""))}
                      className="text-center text-2xl tracking-widest bg-white/10 border-white/20 text-white placeholder-white/50"
                      placeholder="000000"
                    />
                  </div>

                  <Button
                    onClick={verifyVotingCode}
                    disabled={isProcessing || votingCode.length !== 6}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  >
                    {isProcessing ? "Verifying..." : "Verify Code"}
                  </Button>

                  <Button
                    onClick={() => {
                      setStep("student-id")
                      setStudentId("")
                      setVotingCode("")
                    }}
                    variant="outline"
                    className="w-full border-white/20 text-white hover:bg-white/10"
                  >
                    Change Student ID
                  </Button>
                </motion.div>
              )}

              {step === "success" && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center space-y-4"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    className="mx-auto w-20 h-20 bg-green-500 rounded-full flex items-center justify-center"
                  >
                    <CheckCircle className="w-12 h-12 text-white" />
                  </motion.div>

                  <h3 className="text-xl font-semibold text-green-400">Authentication Successful!</h3>
                  <p className="text-blue-200">Welcome, Student ID: {studentId}</p>
                  <motion.p
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
                    className="text-yellow-300"
                  >
                    Redirecting to voting ballot...
                  </motion.p>
                </motion.div>
              )}
            </AnimatePresence>

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
    </div>
  )
}
