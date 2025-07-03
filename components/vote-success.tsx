"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Trophy, Users } from "lucide-react"

interface VoteSuccessProps {
  voterName: string
  onComplete: () => void
}

export function VoteSuccess({ voterName, onComplete }: VoteSuccessProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-600 to-blue-700 flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
          <CardTitle className="text-2xl text-green-600">Vote Submitted Successfully!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600">
            Thank you, <strong>{voterName}</strong>, for participating in the Lubiri Secondary School elections.
          </p>

          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center justify-center gap-2 text-green-700 mb-2">
              <Trophy className="w-5 h-5" />
              <span className="font-semibold">Your vote has been recorded</span>
            </div>
            <p className="text-sm text-green-600">
              Your vote is anonymous and secure. Results will be announced after the election period ends.
            </p>
          </div>

          <div className="flex items-center justify-center gap-2 text-gray-600">
            <Users className="w-4 h-4" />
            <span className="text-sm">Thank you for making your voice heard!</span>
          </div>

          <Button onClick={onComplete} className="w-full bg-blue-600 hover:bg-blue-700">
            Return to Home
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
