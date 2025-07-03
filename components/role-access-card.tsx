"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Shield, GraduationCap, ArrowRight, CheckCircle } from "lucide-react"
import Link from "next/link"

interface RoleAccessCardProps {
  role: "chairperson" | "headteacher"
  title: string
  description: string
  features: string[]
  loginPath: string
  delay?: number
}

export function RoleAccessCard({ role, title, description, features, loginPath, delay = 0 }: RoleAccessCardProps) {
  const isChairperson = role === "chairperson"
  const Icon = isChairperson ? Shield : GraduationCap
  const colorScheme = isChairperson
    ? {
        gradient: "from-blue-500 to-indigo-600",
        bg: "bg-blue-50",
        border: "border-blue-200",
        text: "text-blue-700",
        button: "bg-blue-600 hover:bg-blue-700",
      }
    : {
        gradient: "from-green-500 to-emerald-600",
        bg: "bg-green-50",
        border: "border-green-200",
        text: "text-green-700",
        button: "bg-green-600 hover:bg-green-700",
      }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ scale: 1.02 }}
      className="h-full"
    >
      <Card className="h-full shadow-lg border-0 overflow-hidden">
        <CardHeader className={`bg-gradient-to-r ${colorScheme.gradient} text-white`}>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <Icon className="w-8 h-8" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold">{title}</CardTitle>
              <p className="text-white/90 mt-1">{description}</p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          <div className="space-y-4">
            <h4 className={`font-semibold ${colorScheme.text} flex items-center gap-2`}>
              <CheckCircle className="w-4 h-4" />
              Dashboard Features
            </h4>
            <div className="space-y-2">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: delay + 0.1 + index * 0.05 }}
                  className="flex items-center gap-2 text-sm text-gray-600"
                >
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                  {feature}
                </motion.div>
              ))}
            </div>
          </div>

          <div className={`p-4 ${colorScheme.bg} ${colorScheme.border} border rounded-lg`}>
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-gray-600" />
              <span className="font-medium text-gray-700">Access Level</span>
            </div>
            <div className="text-sm text-gray-600 space-y-1">
              <p>• Read-only dashboard access</p>
              <p>• Real-time election monitoring</p>
              <p>• Secure authentication required</p>
            </div>
          </div>

          <Link href={loginPath} className="block">
            <Button className={`w-full ${colorScheme.button} text-white`}>
              Access Dashboard
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    </motion.div>
  )
}
