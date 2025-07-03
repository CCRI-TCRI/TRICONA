"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { OpenCVFaceCapture } from "./opencv-face-capture"
import { supabase } from "@/lib/supabase-client"
import { Vote, AlertCircle } from "lucide-react"

interface VoterLoginProps {
  onLoginSuccess: (voterData: any) => void
}

export function VoterLogin({ onLoginSuccess }: VoterLoginProps) {
  const [voterCode, setVoterCode] = useState("")
  const [showFaceCapture, setShowFaceCapture] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [voterData, setVoterData] = useState<any>(null)

  const verifyVoterCode = async () => {
    if (!voterCode) {
      setError("Please enter your voter code")
      return
    }

    setLoading(true)
    setError("")

    try {
      const { data: voter, error: dbError } = await supabase
        .from("voters")
        .select("*")
        .eq("voter_code", voterCode)
        .single()

      if (dbError || !voter) {
        setError("Invalid voter code")
        return
      }

      if (voter.has_voted) {
        setError("You have already voted")
        return
      }

      setVoterData(voter)
      setShowFaceCapture(true)
    } catch (err) {
      setError("Verification failed")
    } finally {
      setLoading(false)
    }
  }

  const handleFaceCapture = async (faceData: string) => {
    try {
      // Store face data and proceed to voting
      await supabase.from("voters").update({ face_data: faceData }).eq("id", voterData.id)

      onLoginSuccess(voterData)
    } catch (err) {
      setError("Face capture failed")
    }
  }

  if (showFaceCapture) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">Welcome, {voterData?.full_name}</h2>
            <p className="text-blue-200">Please look at the camera for face verification</p>
          </div>
          <OpenCVFaceCapture onFaceCapture={handleFaceCapture} onCancel={() => setShowFaceCapture(false)} />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            <Vote className="w-6 h-6 text-white" />
          </div>
          <CardTitle className="text-2xl">Lubiri E-Voting System</CardTitle>
          <p className="text-gray-600">Enter your voter code to access the ballot</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="voter-code">Voter Code</Label>
            <Input
              id="voter-code"
              type="text"
              value={voterCode}
              onChange={(e) => setVoterCode(e.target.value.toUpperCase())}
              placeholder="Enter your 8-digit voter code"
              maxLength={8}
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button onClick={verifyVoterCode} disabled={loading || !voterCode} className="w-full">
            {loading ? "Verifying..." : "Continue to Face Verification"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
