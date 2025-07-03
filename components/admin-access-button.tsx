"use client"
import { Button } from "@/components/ui/button"
import { Shield } from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"

export function AdminAccessButton() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 2 }}
      className="fixed bottom-6 right-6 z-50"
    >
      <Link href="/admin/login">
        <Button
          size="lg"
          className="rounded-full w-14 h-14 bg-gradient-to-r from-red-600 to-blue-600 hover:from-red-700 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <Shield className="w-6 h-6 text-white" />
        </Button>
      </Link>
    </motion.div>
  )
}

export default AdminAccessButton
