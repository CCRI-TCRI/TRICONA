"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Shield, GraduationCap, Crown } from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"

export function AdminRoleLogin() {
  const [isOpen, setIsOpen] = useState(false)

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
            <DialogTitle className="text-center">System Access</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Link href="/admin/dashboard" onClick={() => setIsOpen(false)}>
              <Button variant="outline" className="w-full justify-start gap-3 h-12 bg-transparent">
                <Shield className="w-5 h-5 text-blue-600" />
                <div className="text-left">
                  <div className="font-medium">Admin Panel</div>
                  <div className="text-xs text-gray-500">Full system management</div>
                </div>
              </Button>
            </Link>

            <Link href="/chairperson/dashboard" onClick={() => setIsOpen(false)}>
              <Button variant="outline" className="w-full justify-start gap-3 h-12 bg-transparent">
                <Crown className="w-5 h-5 text-purple-600" />
                <div className="text-left">
                  <div className="font-medium">Electoral Commission</div>
                  <div className="text-xs text-gray-500">Results monitoring</div>
                </div>
              </Button>
            </Link>

            <Link href="/headteacher/dashboard" onClick={() => setIsOpen(false)}>
              <Button variant="outline" className="w-full justify-start gap-3 h-12 bg-transparent">
                <GraduationCap className="w-5 h-5 text-green-600" />
                <div className="text-left">
                  <div className="font-medium">Headteacher</div>
                  <div className="text-xs text-gray-500">School oversight</div>
                </div>
              </Button>
            </Link>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
