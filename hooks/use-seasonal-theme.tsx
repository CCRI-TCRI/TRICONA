"use client"

import { useState, useEffect } from "react"

type SeasonalTheme = "default" | "christmas" | "halloween" | "july4th" | "pride"

interface UseSeasonalThemeReturn {
  theme: SeasonalTheme
  showSeasonalIntro: boolean
  setShowSeasonalIntro: (show: boolean) => void
}

export function useSeasonalTheme(): UseSeasonalThemeReturn {
  const [theme, setTheme] = useState<SeasonalTheme>("default")
  const [showSeasonalIntro, setShowSeasonalIntro] = useState(false)

  useEffect(() => {
    const currentDate = new Date()
    const month = currentDate.getMonth() + 1 // 1-12
    const day = currentDate.getDate()

    let currentTheme: SeasonalTheme = "default"

    // Christmas season (December 1-31)
    if (month === 12) {
      currentTheme = "christmas"
    }
    // Halloween (October 25-31)
    else if (month === 10 && day >= 25) {
      currentTheme = "halloween"
    }
    // July 4th (July 1-7)
    else if (month === 7 && day <= 7) {
      currentTheme = "july4th"
    }
    // Pride Month (June)
    else if (month === 6) {
      currentTheme = "pride"
    }

    setTheme(currentTheme)

    // Check if user has seen seasonal intro for this theme
    const hasSeenIntro = localStorage.getItem(`seasonal-intro-${currentTheme}`)
    if (!hasSeenIntro && currentTheme !== "default") {
      setShowSeasonalIntro(true)
    }
  }, [])

  const handleSetShowSeasonalIntro = (show: boolean) => {
    setShowSeasonalIntro(show)
    if (!show && theme !== "default") {
      localStorage.setItem(`seasonal-intro-${theme}`, "true")
    }
  }

  return {
    theme,
    showSeasonalIntro,
    setShowSeasonalIntro: handleSetShowSeasonalIntro,
  }
}
