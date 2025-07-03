"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Shield, Lock, GraduationCap, Users } from "lucide-react"
import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"

export function AdminAccessButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [credentials, setCredentials] = useState({ username: "", password: "" })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Simple demo authentication - in production, use proper auth
    await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate API call

    if (credentials.username === "admin" && credentials.password === "admin123") {
      window.location.href = "/admin/dashboard"
    } else {
      setError("Invalid credentials. Use admin/admin123 for demo.")
    }

    setIsLoading(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 2 }}
      className="fixed bottom-6 right-6 z-50"
    >
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button
            size="lg"
            className="rounded-full w-14 h-14 bg-gradient-to-r from-red-600 to-blue-600 hover:from-red-700 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Shield className="w-6 h-6 text-white" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md bg-white">
          <DialogHeader>
            <div className="flex flex-col items-center space-y-4">
              <Image
                src="/school-logo.png"
                alt="Lubiri Secondary School"
                width={80}
                height={80}
                className="rounded-lg"
              />
              <DialogTitle className="flex items-center gap-2 text-center justify-center">
                <Lock className="w-5 h-5 text-primary" />
                System Access
              </DialogTitle>
            </div>
          </DialogHeader>

          {/* Role Access Buttons */}
          <div className="space-y-3 mb-4">
            <div className="text-sm font-medium text-center text-gray-700 mb-3">Select Your Role</div>

            <Link href="/chairperson/login">
              <Button
                variant="outline"
                className="w-full justify-start gap-3 h-12 border-blue-200 hover:bg-blue-50 bg-transparent"
                onClick={() => setIsOpen(false)}
              >
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Shield className="w-4 h-4 text-blue-600" />
                </div>
                <div className="text-left">
                  <div className="font-medium text-blue-700">Electoral Commission</div>
                  <div className="text-xs text-blue-600">Chairperson Access</div>
                </div>
              </Button>
            </Link>

            <Link href="/headteacher/login">
              <Button
                variant="outline"
                className="w-full justify-start gap-3 h-12 border-green-200 hover:bg-green-50 bg-transparent"
                onClick={() => setIsOpen(false)}
              >
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <GraduationCap className="w-4 h-4 text-green-600" />
                </div>
                <div className="text-left">
                  <div className="font-medium text-green-700">School Administration</div>
                  <div className="text-xs text-green-600">Headteacher Access</div>
                </div>
              </Button>
            </Link>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">Or</span>
              </div>
            </div>
          </div>

          {/* Admin Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="text-sm font-medium text-center text-gray-700 mb-3">
              <Users className="w-4 h-4 inline mr-1" />
              Admin Panel Access
            </div>
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                value={credentials.username}
                onChange={(e) => setCredentials((prev) => ({ ...prev, username: e.target.value }))}
                placeholder="Enter admin username"
                required
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={credentials.password}
                onChange={(e) => setCredentials((prev) => ({ ...prev, password: e.target.value }))}
                placeholder="Enter admin password"
                required
              />
            </div>
            {error && <div className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</div>}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Logging in..." : "Access Admin Panel"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}

export default AdminAccessButton
