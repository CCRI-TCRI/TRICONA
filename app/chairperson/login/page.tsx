"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Shield, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Image from "next/image"

export default function ChairpersonLogin() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      // Simple credential check - in a real app, this would be a server-side check
      if (username === "chairperson" && password === "chair2024") {
        // Set session in localStorage
        localStorage.setItem(
          "chairpersonAuth",
          JSON.stringify({
            isAuthenticated: true,
            role: "chairperson",
            expiresAt: Date.now() + 3600000, // 1 hour expiry
          }),
        )

        // Redirect to dashboard
        router.push("/chairperson/dashboard")
      } else {
        setError("Invalid credentials. Please try again.")
      }
    } catch (err) {
      setError("An error occurred. Please try again.")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-6">
          <div className="w-24 h-24 relative mb-4">
            <Image src="/logo.png" alt="Lubiri Secondary School" fill className="object-contain" priority />
          </div>
          <h1 className="text-2xl font-bold text-white text-center">Electoral Commission</h1>
          <p className="text-white/80 text-center mt-1">Results Monitoring Access</p>
        </div>

        <Card className="border-0 shadow-2xl">
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-center mb-2">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <CardTitle className="text-xl text-center">Chairperson Login</CardTitle>
            <CardDescription className="text-center">
              Access the electoral commission dashboard to monitor election results
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <form onSubmit={handleLogin}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    placeholder="chairperson"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
                  {isLoading ? "Authenticating..." : "Login to Dashboard"}
                </Button>
              </div>
            </form>
          </CardContent>
          <CardFooter className="border-t pt-4">
            <p className="text-xs text-center text-gray-500 w-full">
              This dashboard provides read-only access to election results for the Electoral Commission Chairperson.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
