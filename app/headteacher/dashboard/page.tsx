"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { GraduationCap, Users, Vote, TrendingUp, BookOpen, Award, Target, RefreshCw, Star } from "lucide-react"
import { motion } from "framer-motion"

export default function HeadteacherDashboard() {
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState(new Date())
  const [schoolData, setSchoolData] = useState({
    totalStudents: 1247,
    participatingStudents: 892,
    participationRate: 71.5,
    leadershipPositions: 8,
    totalCandidates: 24,
    electionStatus: "Active",
    classParticipation: [
      { class: "Form 6", students: 180, participated: 156, rate: 87 },
      { class: "Form 5", students: 195, participated: 162, rate: 83 },
      { class: "Form 4", students: 210, participated: 168, rate: 80 },
      { class: "Form 3", students: 225, participated: 171, rate: 76 },
      { class: "Form 2", students: 218, participated: 152, rate: 70 },
      { class: "Form 1", students: 219, participated: 143, rate: 65 },
    ],
    leadershipStats: [
      { position: "Head Boy", applicants: 3, votes: 156, engagement: 92 },
      { position: "Head Girl", applicants: 3, votes: 142, engagement: 84 },
      { position: "Sports Captain", applicants: 4, votes: 134, engagement: 79 },
      { position: "Academic Captain", applicants: 2, votes: 128, engagement: 76 },
      { position: "Entertainment Captain", applicants: 3, votes: 119, engagement: 70 },
      { position: "Discipline Captain", applicants: 2, votes: 113, engagement: 67 },
    ],
  })

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdated(new Date())
      // Simulate real-time updates
      setSchoolData((prev) => ({
        ...prev,
        participatingStudents: prev.participatingStudents + Math.floor(Math.random() * 2),
        participationRate: ((prev.participatingStudents + Math.floor(Math.random() * 2)) / prev.totalStudents) * 100,
      }))
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  const handleRefresh = () => {
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      setLastUpdated(new Date())
    }, 1000)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto"></div>
          <p className="text-green-600 font-medium">Loading School Administration Dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold text-green-900 flex items-center gap-3">
              <GraduationCap className="w-8 h-8 text-green-600" />
              School Administration Dashboard
            </h1>
            <p className="text-green-600 mt-1">Student leadership election oversight</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-green-600">Last updated: {lastUpdated.toLocaleTimeString()}</div>
            <Button onClick={handleRefresh} variant="outline" size="sm" className="border-green-200 bg-transparent">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </motion.div>

        {/* Status Banner */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Star className="w-6 h-6 text-blue-600" />
                <div>
                  <div className="font-semibold text-blue-800">Democratic Process: {schoolData.electionStatus}</div>
                  <div className="text-sm text-blue-700">Students actively participating in leadership selection</div>
                </div>
                <Badge variant="outline" className="ml-auto border-blue-300 text-blue-700">
                  Live
                </Badge>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Key Metrics */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[
            {
              title: "Total Students",
              value: schoolData.totalStudents.toLocaleString(),
              icon: Users,
              color: "green",
              delay: 0.2,
            },
            {
              title: "Student Participation",
              value: schoolData.participatingStudents.toLocaleString(),
              icon: Vote,
              color: "blue",
              delay: 0.3,
            },
            {
              title: "Participation Rate",
              value: `${schoolData.participationRate.toFixed(1)}%`,
              icon: TrendingUp,
              color: "purple",
              delay: 0.4,
            },
            {
              title: "Leadership Positions",
              value: schoolData.leadershipPositions.toString(),
              icon: Award,
              color: "orange",
              delay: 0.5,
            },
          ].map((metric, index) => (
            <motion.div
              key={metric.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: metric.delay }}
            >
              <Card className="border-green-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-600">{metric.title}</p>
                      <p className="text-2xl font-bold text-green-900">{metric.value}</p>
                    </div>
                    <div className={`w-12 h-12 rounded-full bg-${metric.color}-100 flex items-center justify-center`}>
                      <metric.icon className={`w-6 h-6 text-${metric.color}-600`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Class Participation */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <Card className="border-green-200">
            <CardHeader>
              <CardTitle className="text-green-900 flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Class Participation Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {schoolData.classParticipation.map((classData, index) => (
                  <div key={classData.class} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="font-medium text-green-900">{classData.class}</div>
                        <Badge variant="outline" className="text-xs">
                          {classData.students} students
                        </Badge>
                      </div>
                      <div className="text-sm text-green-600">
                        {classData.participated}/{classData.students} ({classData.rate}%)
                      </div>
                    </div>
                    <Progress value={classData.rate} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Leadership Statistics */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
          <Card className="border-green-200">
            <CardHeader>
              <CardTitle className="text-green-900 flex items-center gap-2">
                <Target className="w-5 h-5" />
                Student Leadership Engagement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {schoolData.leadershipStats.map((position, index) => (
                  <div key={position.position} className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium text-green-900">{position.position}</div>
                      <Badge variant="outline" className="text-xs border-green-300 text-green-700">
                        {position.applicants} candidates
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-green-700">Student Votes</span>
                        <span className="font-medium text-green-900">{position.votes}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-green-700">Engagement Rate</span>
                        <span className="font-medium text-green-900">{position.engagement}%</span>
                      </div>
                      <Progress value={position.engagement} className="h-1.5" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Educational Impact */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
          <Card className="border-green-200 bg-gradient-to-r from-green-50 to-blue-50">
            <CardHeader>
              <CardTitle className="text-green-900 flex items-center gap-2">
                <Award className="w-5 h-5" />
                Educational Impact
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-3">
                <div className="text-center space-y-2">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <Users className="w-8 h-8 text-green-600" />
                  </div>
                  <div className="font-semibold text-green-900">Democratic Participation</div>
                  <div className="text-sm text-green-700">
                    Students learning democratic processes through active participation in leadership selection
                  </div>
                </div>
                <div className="text-center space-y-2">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                    <Target className="w-8 h-8 text-blue-600" />
                  </div>
                  <div className="font-semibold text-blue-900">Leadership Development</div>
                  <div className="text-sm text-blue-700">
                    Encouraging student leadership qualities and civic responsibility through election process
                  </div>
                </div>
                <div className="text-center space-y-2">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                    <Star className="w-8 h-8 text-purple-600" />
                  </div>
                  <div className="font-semibold text-purple-900">School Excellence</div>
                  <div className="text-sm text-purple-700">
                    Building a culture of excellence through student-led governance and representation
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
