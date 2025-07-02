"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import { FileText, Download, Calendar, Users, Vote, BarChart3 } from "lucide-react"

export default function ReportsPage() {
  const reports = [
    {
      id: "1",
      title: "Election Summary Report",
      description: "Complete overview of election results and statistics",
      type: "PDF",
      size: "2.4 MB",
      generated: "2024-01-15",
      icon: <FileText className="w-5 h-5 text-blue-500" />,
    },
    {
      id: "2",
      title: "Voter Participation Report",
      description: "Detailed analysis of voter turnout by class and demographics",
      type: "Excel",
      size: "1.8 MB",
      generated: "2024-01-15",
      icon: <Users className="w-5 h-5 text-green-500" />,
    },
    {
      id: "3",
      title: "Candidate Performance Report",
      description: "Individual candidate results and vote distribution",
      type: "PDF",
      size: "3.1 MB",
      generated: "2024-01-15",
      icon: <Vote className="w-5 h-5 text-purple-500" />,
    },
    {
      id: "4",
      title: "System Analytics Report",
      description: "Technical metrics and system performance during election",
      type: "PDF",
      size: "1.2 MB",
      generated: "2024-01-15",
      icon: <BarChart3 className="w-5 h-5 text-orange-500" />,
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">Reports</h2>
          <p className="text-gray-600">Generate and download election reports</p>
        </div>
        <Button>
          <FileText className="w-4 h-4 mr-2" />
          Generate New Report
        </Button>
      </div>

      <div className="grid gap-6">
        {reports.map((report, index) => (
          <motion.div
            key={report.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      {report.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{report.title}</h3>
                      <p className="text-gray-600 text-sm">{report.description}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <Badge variant="outline">{report.type}</Badge>
                        <span className="text-sm text-gray-500">{report.size}</span>
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Calendar className="w-3 h-3" />
                          {report.generated}
                        </div>
                      </div>
                    </div>
                  </div>
                  <Button variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
