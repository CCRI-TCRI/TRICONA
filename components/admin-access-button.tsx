"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Lock, Shield, GraduationCap } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export function AdminAccessButton() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="bg-white/10 text-white border-white/20 hover:bg-white/20">
          <Lock className="mr-2 h-4 w-4" />
          Admin Access
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto w-20 h-20 relative mb-2">
            <Image src="/logo.png" alt="Lubiri Secondary School" fill className="object-contain" priority />
          </div>
          <DialogTitle className="text-center">Restricted Access</DialogTitle>
          <DialogDescription className="text-center">
            Please select your role to access the appropriate dashboard
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-1 gap-4">
            <Link href="/admin/login" onClick={() => setIsOpen(false)}>
              <Button
                variant="outline"
                className="w-full justify-start border-gray-300 hover:border-gray-400 hover:bg-gray-100 bg-transparent"
              >
                <Lock className="mr-2 h-5 w-5 text-gray-600" />
                <div className="flex flex-col items-start">
                  <span className="font-medium">Admin Dashboard</span>
                  <span className="text-xs text-gray-500">Full system access and management</span>
                </div>
              </Button>
            </Link>

            <Link href="/chairperson/login" onClick={() => setIsOpen(false)}>
              <Button
                variant="outline"
                className="w-full justify-start border-blue-200 hover:border-blue-300 hover:bg-blue-50 bg-transparent"
              >
                <Shield className="mr-2 h-5 w-5 text-blue-600" />
                <div className="flex flex-col items-start">
                  <span className="font-medium">Electoral Commission</span>
                  <span className="text-xs text-gray-500">Results monitoring access only</span>
                </div>
              </Button>
            </Link>

            <Link href="/headteacher/login" onClick={() => setIsOpen(false)}>
              <Button
                variant="outline"
                className="w-full justify-start border-green-200 hover:border-green-300 hover:bg-green-50 bg-transparent"
              >
                <GraduationCap className="mr-2 h-5 w-5 text-green-600" />
                <div className="flex flex-col items-start">
                  <span className="font-medium">Headteacher</span>
                  <span className="text-xs text-gray-500">School results overview access</span>
                </div>
              </Button>
            </Link>
          </div>
        </div>
        <div className="text-xs text-center text-gray-500">
          Unauthorized access is strictly prohibited and may result in disciplinary action
        </div>
      </DialogContent>
    </Dialog>
  )
}
