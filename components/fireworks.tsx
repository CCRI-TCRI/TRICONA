"use client"

import React from "react"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"

export function Fireworks() {
  const [fireworks, setFireworks] = useState<
    Array<{
      id: number
      x: number
      y: number
      color: string
      size: number
      delay: number
    }>
  >([])

  useEffect(() => {
    // Check if today is July 4th, 2025
    const today = new Date()
    const isFourthOfJuly = today.getMonth() === 6 && today.getDate() === 4 && today.getFullYear() === 2025
    const isFifthOfJuly = today.getMonth() === 6 && today.getDate() === 5 && today.getFullYear() === 2025

    // Only show fireworks on July 4th and 5th, 2025
    if (!(isFourthOfJuly || isFifthOfJuly)) {
      return
    }

    // Create fireworks
    const colors = ["#ff0000", "#ffffff", "#0000ff", "#ffcc00", "#ff00ff"]
    const newFireworks = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 60 + 20, // Keep fireworks in upper part of screen
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 3 + 1,
      delay: Math.random() * 15,
    }))

    setFireworks(newFireworks)

    // Create new fireworks every 10 seconds
    const interval = setInterval(() => {
      const newFireworks = Array.from({ length: 10 }, (_, i) => ({
        id: Date.now() + i,
        x: Math.random() * 100,
        y: Math.random() * 60 + 20,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 3 + 1,
        delay: Math.random() * 3,
      }))

      setFireworks((prev) => [...prev.slice(-20), ...newFireworks])
    }, 10000)

    return () => clearInterval(interval)
  }, [])

  if (fireworks.length === 0) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-10">
      {fireworks.map((firework) => (
        <motion.div
          key={firework.id}
          className="absolute rounded-full"
          style={{
            left: `${firework.x}%`,
            top: `${firework.y}%`,
            backgroundColor: firework.color,
            width: `${firework.size}px`,
            height: `${firework.size}px`,
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{
            scale: [0, 5, 0],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 2,
            delay: firework.delay,
            repeat: Number.POSITIVE_INFINITY,
            repeatDelay: 15 + Math.random() * 10,
          }}
        />
      ))}

      {/* Particles from explosions */}
      {fireworks.map((firework) => (
        <React.Fragment key={`particles-${firework.id}`}>
          {[...Array(8)].map((_, i) => {
            const angle = (i / 8) * Math.PI * 2
            return (
              <motion.div
                key={`particle-${firework.id}-${i}`}
                className="absolute rounded-full"
                style={{
                  left: `${firework.x}%`,
                  top: `${firework.y}%`,
                  backgroundColor: firework.color,
                  width: `${firework.size * 0.5}px`,
                  height: `${firework.size * 0.5}px`,
                }}
                initial={{ scale: 0, opacity: 0, x: 0, y: 0 }}
                animate={{
                  scale: [0, 1, 0],
                  opacity: [0, 1, 0],
                  x: [0, Math.cos(angle) * 50],
                  y: [0, Math.sin(angle) * 50],
                }}
                transition={{
                  duration: 1.5,
                  delay: firework.delay + 0.5,
                  repeat: Number.POSITIVE_INFINITY,
                  repeatDelay: 15 + Math.random() * 10,
                }}
              />
            )
          })}
        </React.Fragment>
      ))}
    </div>
  )
}
