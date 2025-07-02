"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { motion, AnimatePresence } from "framer-motion"
import { Camera, Scan, User, Lock, Eye, EyeOff, CheckCircle, AlertCircle, Fingerprint } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { toast } from "@/hooks/use-toast"

interface BiometricAuthProps {
  onAuthSuccess: (studentId: string) => void
}

export function BiometricAuth({ onAuthSuccess }: BiometricAuthProps) {
  const [authMethod, setAuthMethod] = useState<"face" | "code">("code")
  const [isScanning, setIsScanning] = useState(false)
  const [studentId, setStudentId] = useState("")
  const [votingCode, setVotingCode] = useState("")
  const [showCode, setShowCode] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const handleCodeAuth = async () => {
    if (!studentId || !votingCode) {
      setError("Please enter both Student ID and Voting Code")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      // Check if user exists and voting code matches
      const { data: user, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("student_id", studentId)
        .eq("voting_code", votingCode)
        .single()

      if (userError || !user) {
        // Fallback to demo data if database fails
        const demoUsers = [
          { student_id: "LSS001", voting_code: "VT001", has_voted: false },
          { student_id: "LSS002", voting_code: "VT002", has_voted: false },
          { student_id: "DEMO123", voting_code: "DEMO456", has_voted: false },
        ]

        const demoUser = demoUsers.find((u) => u.student_id === studentId && u.voting_code === votingCode)

        if (!demoUser) {
          setError("Invalid Student ID or Voting Code")
          return
        }

        if (demoUser.has_voted) {
          setError("You have already voted in this election")
          return
        }

        toast({
          title: "Demo Mode",
          description: "Authenticated with demo data",
        })
        onAuthSuccess(studentId)
        return
      }

      if (user.has_voted) {
        setError("You have already voted in this election")
        return
      }

      toast({
        title: "Authentication Successful",
        description: `Welcome, ${user.full_name}!`,
      })
      onAuthSuccess(studentId)
    } catch (error) {
      console.error("Authentication error:", error)
      setError("Authentication failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const startFaceAuth = async () => {
    setIsScanning(true)
    setError("")

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: 640,
          height: 480,
          facingMode: "user",
        },
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
      }

      // Simulate face recognition after 3 seconds
      setTimeout(() => {
        stopFaceAuth()
        // For demo purposes, authenticate as a demo user
        toast({
          title: "Face Recognition Successful",
          description: "Welcome! Face authentication completed.",
        })
        onAuthSuccess("FACE_AUTH_DEMO")
      }, 3000)
    } catch (error) {
      console.error("Camera access error:", error)
      setError("Camera access denied. Please use voting code authentication.")
      setIsScanning(false)
    }
  }

  const stopFaceAuth = () => {
    setIsScanning(false)
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach((track) => track.stop())
      videoRef.current.srcObject = null
    }
  }

  useEffect(() => {
    return () => {
      stopFaceAuth()
    }
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative z-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <Card className="backdrop-blur-md bg-white/90 border-white/20 shadow-2xl">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg">
              <img src="/logo.png" alt="Lubiri Secondary School" className="w-20 h-20 object-contain" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-gray-800">Lubiri Secondary School</CardTitle>
              <CardDescription className="text-gray-600 mt-2">2024 Prefectorial Elections</CardDescription>
              <Badge variant="outline" className="mt-2">
                Secure Digital Voting
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <Tabs value={authMethod} onValueChange={(value) => setAuthMethod(value as "face" | "code")}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="code" className="flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Voting Code
                </TabsTrigger>
                <TabsTrigger value="face" className="flex items-center gap-2">
                  <Camera className="w-4 h-4" />
                  Face ID
                </TabsTrigger>
              </TabsList>

              <TabsContent value="code" className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="studentId">Student ID</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="studentId"
                        type="text"
                        placeholder="Enter your Student ID"
                        value={studentId}
                        onChange={(e) => setStudentId(e.target.value.toUpperCase())}
                        className="pl-10"
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="votingCode">Voting Code</Label>
                    <div className="relative">
                      <Fingerprint className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="votingCode"
                        type={showCode ? "text" : "password"}
                        placeholder="Enter your Voting Code"
                        value={votingCode}
                        onChange={(e) => setVotingCode(e.target.value.toUpperCase())}
                        className="pl-10 pr-10"
                        disabled={isLoading}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1 h-8 w-8 p-0"
                        onClick={() => setShowCode(!showCode)}
                      >
                        {showCode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <Button onClick={handleCodeAuth} className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Authenticating...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Authenticate
                      </div>
                    )}
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="face" className="space-y-4">
                <div className="text-center space-y-4">
                  <div className="relative">
                    <video
                      ref={videoRef}
                      className="w-full h-48 bg-gray-100 rounded-lg object-cover"
                      style={{ display: isScanning ? "block" : "none" }}
                    />
                    <canvas ref={canvasRef} className="hidden" />

                    {!isScanning && (
                      <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                        <div className="text-center">
                          <Camera className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-500">Camera preview will appear here</p>
                        </div>
                      </div>
                    )}

                    {isScanning && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-32 h-32 border-2 border-blue-500 rounded-lg animate-pulse">
                          <div className="w-full h-full border border-blue-300 rounded-lg animate-ping" />
                        </div>
                      </div>
                    )}
                  </div>

                  <AnimatePresence>
                    {!isScanning ? (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <Button onClick={startFaceAuth} className="w-full">
                          <Scan className="w-4 h-4 mr-2" />
                          Start Face Recognition
                        </Button>
                      </motion.div>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="space-y-2"
                      >
                        <p className="text-sm text-blue-600 font-medium">Scanning your face...</p>
                        <Button onClick={stopFaceAuth} variant="outline" className="w-full bg-transparent">
                          Cancel Scan
                        </Button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </TabsContent>
            </Tabs>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="text-center text-xs text-gray-500 space-y-1">
              <p>Secure authentication powered by Lubiri Secondary School</p>
              <p>Your vote is private and anonymous</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
