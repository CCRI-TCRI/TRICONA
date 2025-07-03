"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowRight, ArrowLeft, CheckCircle, Vote, Clock, Shield, Users, Trophy, Star, Play } from "lucide-react"

interface VotingTutorialProps {
  studentName: string
  onComplete: () => void
}

const tutorialSteps = [
  {
    id: 1,
    title: "Welcome to E-Voting",
    icon: Vote,
    content:
      "You're about to participate in the 2024 Prefectorial Elections. This tutorial will guide you through the voting process.",
    image: "/placeholder.svg?height=300&width=400&text=Welcome+Screen",
    tips: [
      "Take your time to read each candidate's manifesto",
      "You can only vote once per position",
      "Your vote is completely confidential",
    ],
  },
  {
    id: 2,
    title: "Time Management",
    icon: Clock,
    content: "You have 2 minutes to complete your voting. A timer will be displayed at the top of your screen.",
    image: "/placeholder.svg?height=300&width=400&text=Timer+Display",
    tips: [
      "Plan your votes before starting",
      "Don't rush - you have enough time",
      "The system will warn you when 30 seconds remain",
    ],
  },
  {
    id: 3,
    title: "Voting Process",
    icon: Users,
    content:
      "You'll vote for different positions across various categories. Each position will be presented one at a time.",
    image: "/placeholder.svg?height=300&width=400&text=Voting+Interface",
    tips: [
      "Click on a candidate to select them",
      "You'll automatically move to the next position",
      "Review your choices at the end",
    ],
  },
  {
    id: 4,
    title: "Security & Privacy",
    icon: Shield,
    content: "Your vote is encrypted and anonymous. No one can see who you voted for, ensuring complete privacy.",
    image: "/placeholder.svg?height=300&width=400&text=Security+Features",
    tips: ["Your identity is protected", "Votes are encrypted in real-time", "Results are calculated automatically"],
  },
  {
    id: 5,
    title: "Ready to Vote!",
    icon: Trophy,
    content: "You're all set! Click 'Start Voting' to begin casting your ballot. Remember, you can only vote once.",
    image: "/placeholder.svg?height=300&width=400&text=Ready+to+Vote",
    tips: [
      "Make sure you're ready to start",
      "Have your choices in mind",
      "Vote responsibly for the future of our school",
    ],
  },
]

export function VotingTutorial({ studentName, onComplete }: VotingTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [showOverview, setShowOverview] = useState(true)

  const nextStep = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      onComplete()
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const skipTutorial = () => {
    onComplete()
  }

  if (showOverview) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-400 via-pink-500 to-purple-600 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-4xl"
        >
          {/* Tutorial Overview Card */}
          <Card className="backdrop-blur-lg bg-white/95 border-white/20 shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white">
              <motion.div initial={{ y: -20 }} animate={{ y: 0 }} className="text-center">
                <div className="mx-auto w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-4">
                  <Play className="w-10 h-10" />
                </div>
                <h1 className="text-3xl font-bold mb-2">Voting Tutorial</h1>
                <p className="text-xl opacity-90">Learn how to cast your vote</p>
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30 mt-4">
                  Welcome, {studentName}
                </Badge>
              </motion.div>
            </div>

            <CardContent className="p-8">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <h2 className="text-2xl font-bold mb-4 text-gray-800">How to Use the E-Voting System</h2>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    This interactive tutorial will guide you through the voting process step by step. You'll learn about
                    time management, the voting interface, security features, and best practices.
                  </p>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                        1
                      </div>
                      <span className="text-gray-700">Understanding the interface</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                        2
                      </div>
                      <span className="text-gray-700">Time management tips</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                      <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                        3
                      </div>
                      <span className="text-gray-700">Security and privacy</span>
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  <motion.div
                    animate={{
                      scale: [1, 1.05, 1],
                      rotate: [0, 2, -2, 0],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "easeInOut",
                    }}
                    className="mb-6"
                  >
                    <img
                      src="/placeholder.svg?height=300&width=400&text=Tutorial+Preview"
                      alt="Tutorial Preview"
                      className="rounded-lg shadow-lg mx-auto"
                    />
                  </motion.div>

                  <div className="flex gap-4 justify-center">
                    <Button
                      onClick={() => setShowOverview(false)}
                      className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 px-8"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Start Tutorial
                    </Button>
                    <Button onClick={skipTutorial} variant="outline" className="px-8 bg-transparent">
                      Skip Tutorial
                    </Button>
                  </div>

                  <p className="text-sm text-gray-500 mt-4">Tutorial takes about 2 minutes to complete</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  const currentTutorialStep = tutorialSteps[currentStep]
  const IconComponent = currentTutorialStep.icon

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-400 via-pink-500 to-purple-600 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-4xl">
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white font-medium">
              Step {currentStep + 1} of {tutorialSteps.length}
            </span>
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
              {Math.round(((currentStep + 1) / tutorialSteps.length) * 100)}% Complete
            </Badge>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2">
            <motion.div
              className="bg-white rounded-full h-2"
              initial={{ width: 0 }}
              animate={{ width: `${((currentStep + 1) / tutorialSteps.length) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Tutorial Step Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="backdrop-blur-lg bg-white/95 border-white/20 shadow-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">{currentTutorialStep.title}</CardTitle>
                    <p className="opacity-90">Interactive Tutorial</p>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-8">
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  <div>
                    <p className="text-lg text-gray-700 mb-6 leading-relaxed">{currentTutorialStep.content}</p>

                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                        <Star className="w-4 h-4 text-yellow-500" />
                        Key Tips:
                      </h4>
                      {currentTutorialStep.tips.map((tip, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                        >
                          <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{tip}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  <div className="text-center">
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="mb-6"
                    >
                      <img
                        src={currentTutorialStep.image || "/placeholder.svg"}
                        alt={currentTutorialStep.title}
                        className="rounded-lg shadow-lg mx-auto border-4 border-white/50"
                      />
                    </motion.div>

                    {/* Interactive Element */}
                    <motion.div
                      animate={{
                        boxShadow: ["0 0 0 0 rgba(59, 130, 246, 0.4)", "0 0 0 20px rgba(59, 130, 246, 0)"],
                      }}
                      transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                      className="inline-block p-4 bg-blue-50 rounded-full"
                    >
                      <IconComponent className="w-8 h-8 text-blue-600" />
                    </motion.div>
                  </div>
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
                  <Button
                    onClick={prevStep}
                    disabled={currentStep === 0}
                    variant="outline"
                    className="px-6 bg-transparent"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>

                  <div className="flex gap-2">
                    <Button onClick={skipTutorial} variant="ghost" className="text-gray-500 hover:text-gray-700">
                      Skip Tutorial
                    </Button>
                    <Button
                      onClick={nextStep}
                      className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 px-6"
                    >
                      {currentStep === tutorialSteps.length - 1 ? (
                        <>
                          Start Voting
                          <Vote className="w-4 h-4 ml-2" />
                        </>
                      ) : (
                        <>
                          Next
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
