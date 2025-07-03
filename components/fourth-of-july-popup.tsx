"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Flag } from "lucide-react"
import { Button } from "@/components/ui/button"

export function FourthOfJulyPopup() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Check if today is July 4th, 2025
    const today = new Date()
    const isFourthOfJuly = today.getMonth() === 6 && today.getDate() === 4 && today.getFullYear() === 2025

    // Show popup only on July 4th, 2025 and if not dismissed
    if (isFourthOfJuly && !localStorage.getItem("fourthOfJulyPopupDismissed2025")) {
      setIsVisible(true)
    }
  }, [])

  const handleClose = () => {
    setIsVisible(false)
    localStorage.setItem("fourthOfJulyPopupDismissed2025", "true")
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 50 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="relative max-w-2xl w-full rounded-2xl shadow-2xl overflow-hidden"
            style={{
              backgroundImage: "url('/fourth-of-july-bg.jpg')",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Overlay for better text readability */}
            <div className="absolute inset-0 bg-black/20"></div>

            {/* Close Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="absolute top-4 right-4 z-10 text-white hover:bg-white/20 rounded-full"
            >
              <X className="w-5 h-5" />
            </Button>

            <div className="relative p-8 text-white">
              {/* Header */}
              <div className="text-center mb-6">
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                  }}
                  className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4 backdrop-blur-sm"
                >
                  <Flag className="w-8 h-8" />
                </motion.div>
                <h2 className="text-3xl md:text-4xl font-bold mb-2 text-shadow-lg">Happy Independence Day! 🇺🇸</h2>
                <p className="text-lg opacity-90 text-shadow">Celebrating American Independence - July 4th, 1776</p>
              </div>

              {/* Holiday Details */}
              <div className="space-y-3 mb-6 bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <h3 className="text-xl font-semibold mb-3">About Independence Day:</h3>
                {[
                  "🗽 Commemorates the Declaration of Independence signed on July 4, 1776",
                  "🎆 Celebrates America's freedom from British colonial rule",
                  "🇺🇸 A federal holiday honoring the birth of the United States",
                  "🎇 Traditionally celebrated with fireworks, parades, and barbecues",
                  "⭐ Represents the founding principles of liberty, equality, and justice",
                  "🗳️ A perfect reminder of the importance of democratic participation!",
                ].map((detail, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="flex items-start space-x-3 text-sm md:text-base"
                  >
                    <span className="text-lg flex-shrink-0">{detail.split(" ")[0]}</span>
                    <span className="opacity-90">{detail.substring(detail.indexOf(" ") + 1)}</span>
                  </motion.div>
                ))}
              </div>

              {/* Action Button */}
              <div className="text-center">
                <Button
                  onClick={handleClose}
                  className="bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-sm px-8 py-2 rounded-full font-semibold transition-all duration-200"
                >
                  Continue to Vote 🇺🇸
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
