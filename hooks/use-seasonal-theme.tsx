"use client"

import { useState, useEffect } from "react"

export function useSeasonalTheme() {
  const [theme, setTheme] = useState("default")
  const [showSeasonalIntro, setShowSeasonalIntro] = useState(false)

  useEffect(() => {
    const now = new Date()
    const month = now.getMonth() + 1
    const day = now.getDate()

    let currentTheme = "default"

    // Christmas (December 25th)
    if (month === 12 && day === 25) {
      currentTheme = "christmas"
    }
    // Halloween (October 31st)
    else if (month === 10 && day === 31) {
      currentTheme = "halloween"
    }
    // July 4th
    else if (month === 7 && day === 4) {
      currentTheme = "july4th"
    }
    // Pride Month (June)
    else if (month === 6) {
      currentTheme = "pride"
    }

    setTheme(currentTheme)

    // Show seasonal intro if it's a special day and user hasn't seen it
    const hasSeenIntro = localStorage.getItem(`seasonal-intro-${currentTheme}-${now.getFullYear()}`)
    if (currentTheme !== "default" && !hasSeenIntro) {
      setShowSeasonalIntro(true)
    }
  }, [])

  const handleSetShowSeasonalIntro = (show: boolean) => {
    setShowSeasonalIntro(show)
    if (!show && theme !== "default") {
      // Mark as seen for this year
      localStorage.setItem(`seasonal-intro-${theme}-${new Date().getFullYear()}`, "true")
    }
  }

  return {
    theme,
    showSeasonalIntro,
    setShowSeasonalIntro: handleSetShowSeasonalIntro,
  }
}
