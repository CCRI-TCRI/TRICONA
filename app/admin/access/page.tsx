"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Shield, Users, Eye, Lock, CheckCircle } from "lucide-react"
import Link from "next/link"

export default function AdminAccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900">Election System Access</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Secure administrative access to the election management system
          </p>
          <div className="flex items-center justify-center gap-2">
            <Badge variant="outline" className="px-3 py-1">
              <Lock className="w-3 h-3 mr-1" />
              Secure Authentication
            </Badge>
            <Badge variant="outline" className="px-3 py-1">
              <Eye className="w-3 h-3 mr-1" />
              Full Access
            </Badge>
            <Badge variant="outline" className="px-3 py-1">
              <CheckCircle className="w-3 h-3 mr-1" />
              Real-Time Control
            </Badge>
          </div>
        </motion.div>

        {/* Admin Access Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="max-w-md mx-auto">
            <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-red-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Admin Dashboard
                </CardTitle>
                <p className="text-gray-600">Full system access and management capabilities</p>
              </CardHeader>
              <CardContent>
                <Link href="/admin/login">
                  <Button className="w-full">Access Dashboard</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* System Information */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Administrator Access Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-3">
                  <h4 className="font-semibold text-red-700 flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Admin Dashboard Access
                  </h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>
                      <strong>Role:</strong> System administrator
                    </p>
                    <p>
                      <strong>Access Level:</strong> Full system management and control
                    </p>
                    <p>
                      <strong>Features:</strong> Complete election administration, voter management, candidate
                      management, results control
                    </p>
                    <p>
                      <strong>Authentication:</strong> Secure admin credentials required
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <Lock className="w-4 h-4 text-yellow-600 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-semibold text-yellow-800">Security Notice</p>
                    <p className="text-yellow-700">
                      This portal provides full administrative access to the election system. Only authorized
                      administrators should access this area. All access attempts are logged and monitored.
                    </p>
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
