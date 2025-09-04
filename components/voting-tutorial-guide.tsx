"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, ArrowLeft, Play, CheckCircle, Clock, Shield, Users } from "lucide-react"

interface TutorialProps {
  voterName: string
  onComplete: () => void
}

const tutorialSteps = [
  {
    title: "Welcome to E-Voting",
    icon: Play,
    content:
      "You're about to participate in the Lubiri Secondary School elections. This tutorial will guide you through the process.",
    tips: ["Take your time to read candidate information", "You can only vote once", "Your vote is confidential"],
  },
  {
    title: "How to Vote",
    icon: Users,
    content: "You'll see each position with its candidates. Click on your preferred candidate to cast your vote.",
    tips: ["Read each candidate's manifesto", "Click once to select", "You'll move automatically to the next position"],
  },
  {
    title: "Time Management",
    icon: Clock,
    content: "You have sufficient time to make your choices. A timer will show your remaining time.",
    tips: [
      "Don't rush your decisions",
      "Review candidates carefully",
      "The system will warn you if time is running low",
    ],
  },
  {
    title: "Security & Privacy",
    icon: Shield,
    content: "Your vote is completely anonymous and secure. No one can see who you voted for.",
    tips: ["Your identity is protected", "Votes are encrypted", "Results are calculated automatically"],
  },
]

export function VotingTutorialGuide({ voterName, onComplete }: TutorialProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [showWelcome, setShowWelcome] = useState(true)

  if (showWelcome) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-400 via-pink-500 to-purple-600 flex items-center justify-center p-4">
        <Card className="w-full max-w-4xl">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white rounded-t-lg">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4">
                <Play className="w-8 h-8" />
              </div>
              <h1 className="text-3xl font-bold mb-2">Voting Tutorial</h1>
              <p className="text-xl opacity-90">Learn how to cast your vote</p>
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30 mt-4">
                Welcome, {voterName}
              </Badge>
            </div>
          </div>

          <CardContent className="p-8">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-2xl font-bold mb-4">How to Use the E-Voting System</h2>
                <p className="text-gray-600 mb-6">
                  This tutorial will guide you through the voting process step by step. Learn about the interface,
                  security features, and best practices.
                </p>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                      1
                    </div>
                    <span>Understanding the voting interface</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">
                      2
                    </div>
                    <span>Making your selections</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                      3
                    </div>
                    <span>Security and privacy features</span>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <img
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/original-ebfd74464b645c2abac2bd3a71612b65-he0YN9LtPlaHs1cCS3bk0Ke4edinQu.webp"
                  alt="Tutorial Preview"
                  className="rounded-lg shadow-lg mx-auto mb-6"
                />

                <div className="flex gap-4 justify-center">
                  <Button
                    onClick={() => setShowWelcome(false)}
                    className="bg-gradient-to-r from-blue-500 to-purple-500"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Start Tutorial
                  </Button>
                  <Button onClick={onComplete} variant="outline">
                    Skip Tutorial
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const step = tutorialSteps[currentStep]
  const IconComponent = step.icon

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-400 via-pink-500 to-purple-600 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl">
        {/* Progress */}
        <div className="p-6 border-b">
          <div className="flex justify-between items-center mb-2">
            <span className="font-medium">
              Step {currentStep + 1} of {tutorialSteps.length}
            </span>
            <Badge variant="secondary">{Math.round(((currentStep + 1) / tutorialSteps.length) * 100)}% Complete</Badge>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / tutorialSteps.length) * 100}%` }}
            />
          </div>
        </div>

        <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <IconComponent className="w-6 h-6" />
            </div>
            <CardTitle className="text-2xl">{step.title}</CardTitle>
          </div>
        </CardHeader>

        <CardContent className="p-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <p className="text-lg mb-6">{step.content}</p>

              <div className="space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Key Points:
                </h4>
                {step.tips.map((tip, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                    <span>{tip}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-center">
              <div className="w-64 h-48 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <IconComponent className="w-16 h-16 text-gray-400" />
              </div>
              <p className="text-sm text-gray-500">Interactive demonstration</p>
            </div>
          </div>

          <div className="flex justify-between mt-8 pt-6 border-t">
            <Button onClick={() => setCurrentStep(currentStep - 1)} disabled={currentStep === 0} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>

            <Button onClick={onComplete} variant="ghost">
              Skip Tutorial
            </Button>

            <Button
              onClick={() => {
                if (currentStep === tutorialSteps.length - 1) {
                  onComplete()
                } else {
                  setCurrentStep(currentStep + 1)
                }
              }}
              className="bg-gradient-to-r from-blue-500 to-purple-500"
            >
              {currentStep === tutorialSteps.length - 1 ? "Start Voting" : "Next"}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
