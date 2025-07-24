"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Shield, Lock } from "lucide-react"
import { motion } from "framer-motion"

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

    if (credentials.username === "sebastiansinc" && credentials.password === "nosiatasydney") {
      window.location.href = "/admin/dashboard"
    } else {
      setError("Invalid credentials. Nice Try")
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
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-center justify-center">
              <Lock className="w-5 h-5 text-primary" />
              Hey, This is not for you. Get Back
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                value={credentials.username}
                onChange={(e) => setCredentials((prev) => ({ ...prev, username: e.target.value }))}
                placeholder="For thy who is Loved Endlessly shall know access"
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
                placeholder="She was loved till the end of time"
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
