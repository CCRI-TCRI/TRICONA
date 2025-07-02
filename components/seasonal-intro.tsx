"use client"

import { useSeasonalTheme } from "@/hooks/use-seasonal-theme"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { X } from "lucide-react"

export function SeasonalIntro() {
  const { theme, showSeasonalIntro, setShowSeasonalIntro } = useSeasonalTheme()

  if (!showSeasonalIntro || theme === "default") return null

  const getSeasonalContent = () => {
    switch (theme) {
      case "christmas":
        return {
          title: "🎄 Merry Christmas! 🎄",
          message: "Wishing you and your family a wonderful Christmas season filled with joy and learning!",
          bgClass: "bg-gradient-to-br from-red-500 to-green-600",
        }
      case "halloween":
        return {
          title: "🎃 Happy Halloween! 👻",
          message: "Hope you have a spook-tacular Halloween! Don't let the ghosts distract you from your studies!",
          bgClass: "bg-gradient-to-br from-orange-600 to-purple-900",
        }
      case "july4th":
        return {
          title: "🎆 Happy Independence Day! 🇺🇸",
          message: "Celebrating freedom and independence! Let's make this a memorable July 4th!",
          bgClass: "bg-gradient-to-br from-red-600 via-white to-blue-600",
        }
      case "pride":
        return {
          title: "🏳️‍🌈 Happy Pride Month! 🏳️‍🌈",
          message: "Celebrating diversity, inclusion, and love in all its forms. Everyone belongs here!",
          bgClass: "bg-gradient-to-br from-pink-500 via-purple-500 to-blue-500",
        }
      default:
        return null
    }
  }

  const content = getSeasonalContent()
  if (!content) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className={`max-w-md w-full ${content.bgClass} text-white border-0`}>
        <CardContent className="p-6 text-center relative">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 text-white hover:bg-white/20"
            onClick={() => setShowSeasonalIntro(false)}
          >
            <X className="h-4 w-4" />
          </Button>
          <h2 className="text-2xl font-bold mb-4">{content.title}</h2>
          <p className="text-lg mb-6">{content.message}</p>
          <Button onClick={() => setShowSeasonalIntro(false)} className="bg-white text-gray-900 hover:bg-gray-100">
            Continue to Platform
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
