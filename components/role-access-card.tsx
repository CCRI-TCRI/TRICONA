"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { ArrowRight } from "lucide-react"

export interface RoleAccessCardProps {
  role: "chairperson" | "headteacher"
  title: string
  description: string
  features: string[]
  loginPath: string
  delay?: number
}

export function RoleAccessCard({ title, description, features, loginPath, delay = 0 }: RoleAccessCardProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}>
      <Card className="h-full flex flex-col">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-2 flex-1">
          {features.map((feature) => (
            <div key={feature} className="flex items-center gap-2 text-sm">
              <Badge variant="outline" className="px-1.5 py-0.5">
                ✓
              </Badge>
              <span className="text-gray-700">{feature}</span>
            </div>
          ))}
        </CardContent>

        <CardFooter>
          <Link
            href={loginPath}
            className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:underline"
          >
            Go to login
            <ArrowRight className="w-4 h-4" />
          </Link>
        </CardFooter>
      </Card>
    </motion.div>
  )
}
