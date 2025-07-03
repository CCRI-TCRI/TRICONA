"use client"

import type React from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Shield, GraduationCap, Users } from "lucide-react"
import Link from "next/link"

interface RoleAccessCardProps {
  title: string
  description: string
  icon: React.ReactNode
  href: string
  color: string
}

export function RoleAccessCard({ title, description, icon, href, color }: RoleAccessCardProps) {
  return (
    <Card className={`hover:shadow-lg transition-shadow border-l-4 ${color}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Link href={href}>
          <Button className="w-full">Access Dashboard</Button>
        </Link>
      </CardContent>
    </Card>
  )
}

export function AdminRoleCards() {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      <RoleAccessCard
        title="Admin Dashboard"
        description="Full system access and management capabilities"
        icon={<Shield className="w-5 h-5" />}
        href="/admin/login"
        color="border-l-red-500"
      />
      <RoleAccessCard
        title="Electoral Commission"
        description="Results monitoring and oversight access"
        icon={<Users className="w-5 h-5" />}
        href="/chairperson/login"
        color="border-l-blue-500"
      />
      <RoleAccessCard
        title="Headteacher"
        description="School results overview and reporting"
        icon={<GraduationCap className="w-5 h-5" />}
        href="/headteacher/login"
        color="border-l-green-500"
      />
    </div>
  )
}
