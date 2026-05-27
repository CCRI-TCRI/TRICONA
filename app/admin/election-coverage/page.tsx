"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { getPositionsWithCandidates, userStorage, voteStorage } from "@/lib/supabase-db"
import { Radio, Users, TrendingUp, Activity, ChevronLeft } from "lucide-react"
import Link from "next/link"

interface CandidateResult {
  id: string
  full_name: string
  photo_url?: string
  class: string
  vote_count: number
  percentage: number
}

interface PositionResult {
  id: string
  position_name: string
  category: string
  candidates: CandidateResult[]
  total_votes: number
}

interface GlobalStats {
  totalVotes: number
  totalVoters: number
  turnout: number
  positionCount: number
}

const TICKER_MESSAGES = [
  "LIVE: Lubiri Secondary School 2025 Prefectorial Election Coverage",
  "Voting is currently in progress — all results are live and updating in real time",
  "Lubiri Secondary School Election Commission — ensuring fair and transparent elections",
  "Students are encouraged to exercise their democratic right and vote",
  "Results shown are real-time percentages — final results will be announced after polls close",
  "LUBIRI SECONDARY SCHOOL — Shaping Tomorrow's Leaders Today",
]

const CATEGORY_COLORS: Record<string, { bar: string; glow: string; badge: string }> = {
  "Senior Leadership": {
    bar: "from-amber-400 to-yellow-300",
    glow: "shadow-amber-500/30",
    badge: "bg-amber-500/20 text-amber-300 border-amber-500/40",
  },
  "Games and Sports": {
    bar: "from-emerald-400 to-green-300",
    glow: "shadow-emerald-500/30",
    badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
  },
  Entertainment: {
    bar: "from-pink-400 to-rose-300",
    glow: "shadow-pink-500/30",
    badge: "bg-pink-500/20 text-pink-300 border-pink-500/40",
  },
  Academics: {
    bar: "from-blue-400 to-cyan-300",
    glow: "shadow-blue-500/30",
    badge: "bg-blue-500/20 text-blue-300 border-blue-500/40",
  },
}

const DEFAULT_COLOR = {
  bar: "from-indigo-400 to-blue-300",
  glow: "shadow-indigo-500/30",
  badge: "bg-indigo-500/20 text-indigo-300 border-indigo-500/40",
}

function getCategoryColors(category: string) {
  return CATEGORY_COLORS[category] ?? DEFAULT_COLOR
}

// ─── Live Clock ───────────────────────────────────────────────────────────────
function LiveClock() {
  const [time, setTime] = useState("")
  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString("en-UG", { hour: "2-digit", minute: "2-digit", second: "2-digit" }))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])
  return <span className="font-mono text-white/80 text-sm tracking-widest">{time}</span>
}

// ─── Scrolling Ticker ─────────────────────────────────────────────────────────
function NewsTicker({ messages }: { messages: string[] }) {
  const text = messages.join("   •   ")
  return (
    <div className="overflow-hidden whitespace-nowrap w-full">
      <motion.div
        animate={{ x: ["100%", "-100%"] }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        className="inline-block text-white text-sm font-medium tracking-wide"
      >
        {text}&nbsp;&nbsp;&nbsp;•&nbsp;&nbsp;&nbsp;{text}
      </motion.div>
    </div>
  )
}

// ─── Animated Progress Bar ────────────────────────────────────────────────────
function AnimatedBar({ percentage, colorClass, delay = 0 }: { percentage: number; colorClass: string; delay?: number }) {
  return (
    <div className="w-full bg-white/10 rounded-full h-4 overflow-hidden">
      <motion.div
        className={`h-full rounded-full bg-gradient-to-r ${colorClass}`}
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{ duration: 1.4, delay, ease: "easeOut" }}
      />
    </div>
  )
}

// ─── Candidate Row ────────────────────────────────────────────────────────────
function CandidateRow({
  candidate,
  index,
  colorClass,
  delay,
}: {
  candidate: CandidateResult
  index: number
  colorClass: string
  delay: number
}) {
  const initials = candidate.full_name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
  const rankColors = ["text-amber-300", "text-slate-300", "text-orange-400"]
  const rankColor = rankColors[index] ?? "text-white/50"

  return (
    <motion.div
      initial={{ opacity: 0, x: -40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.6 }}
      className="flex items-center gap-4"
    >
      {/* Rank number */}
      <span className={`text-2xl font-black w-8 text-center shrink-0 ${rankColor}`}>{index + 1}</span>

      {/* Avatar */}
      <div className="w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center shrink-0 overflow-hidden">
        {candidate.photo_url && !candidate.photo_url.includes("placeholder") ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={candidate.photo_url} alt={candidate.full_name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-white font-bold text-sm">{initials}</span>
        )}
      </div>

      {/* Name + bar */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-white font-semibold text-base truncate">{candidate.full_name}</span>
          <span className="text-white/60 text-sm ml-2 shrink-0">{candidate.class}</span>
        </div>
        <AnimatedBar percentage={candidate.percentage} colorClass={colorClass} delay={delay + 0.3} />
      </div>

      {/* Percentage */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: delay + 1.0 }}
        className="shrink-0 text-right w-16"
      >
        <span className="text-2xl font-black text-white">{candidate.percentage.toFixed(1)}</span>
        <span className="text-white/50 text-sm">%</span>
      </motion.div>
    </motion.div>
  )
}

// ─── Position Slide ───────────────────────────────────────────────────────────
function PositionSlide({ position, slideIndex, totalSlides }: { position: PositionResult; slideIndex: number; totalSlides: number }) {
  const colors = getCategoryColors(position.category)

  return (
    <motion.div
      key={position.id}
      initial={{ opacity: 0, scale: 0.97, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97, y: -20 }}
      transition={{ duration: 0.7, ease: "easeInOut" }}
      className="w-full"
    >
      {/* Position header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <span className={`text-xs font-bold tracking-widest uppercase px-3 py-1 rounded-full border ${colors.badge}`}>
            {position.category}
          </span>
          <span className="text-white/40 text-xs">
            {slideIndex + 1} / {totalSlides}
          </span>
        </div>
        <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight text-balance">
          {position.position_name}
        </h2>
        <div className="flex items-center gap-6 mt-3">
          <span className="text-white/50 text-sm">
            {position.total_votes} vote{position.total_votes !== 1 ? "s" : ""} cast
          </span>
          <span className="text-white/50 text-sm">{position.candidates.length} candidates</span>
        </div>
      </div>

      {/* Separator */}
      <div className={`h-px bg-gradient-to-r ${colors.bar} mb-8 opacity-60`} />

      {/* Candidates */}
      <div className="space-y-6">
        {position.candidates.map((candidate, i) => (
          <CandidateRow
            key={candidate.id}
            candidate={candidate}
            index={i}
            colorClass={colors.bar}
            delay={i * 0.15}
          />
        ))}
      </div>

      {position.total_votes === 0 && (
        <p className="text-white/30 text-center text-lg mt-8">No votes recorded yet</p>
      )}
    </motion.div>
  )
}

// ─── Slide Dots ───────────────────────────────────────────────────────────────
function SlideDots({ total, current, onSelect }: { total: number; current: number; onSelect: (i: number) => void }) {
  return (
    <div className="flex items-center justify-center gap-2 flex-wrap">
      {Array.from({ length: total }).map((_, i) => (
        <button
          key={i}
          onClick={() => onSelect(i)}
          aria-label={`Go to position ${i + 1}`}
          className={`transition-all duration-300 rounded-full ${
            i === current ? "w-6 h-2 bg-white" : "w-2 h-2 bg-white/30 hover:bg-white/60"
          }`}
        />
      ))}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ElectionCoveragePage() {
  const [results, setResults] = useState<PositionResult[]>([])
  const [globalStats, setGlobalStats] = useState<GlobalStats>({ totalVotes: 0, totalVoters: 0, turnout: 0, positionCount: 0 })
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const SLIDE_DURATION = 10000 // 10 seconds per position

  const fetchData = async () => {
    try {
      const [positionsWithCandidates, votes, users] = await Promise.all([
        getPositionsWithCandidates(),
        voteStorage.getAll(),
        userStorage.getAll(),
      ])

      const resultsData: PositionResult[] = positionsWithCandidates
        .filter((p) => p.candidates.length > 0)
        .map((position) => {
          const posVotes = votes.filter((v) => v.position_id === position.id)
          const totalVotesForPosition = posVotes.length

          const candidates: CandidateResult[] = position.candidates
            .map((c) => {
              const cv = votes.filter((v) => v.candidate_id === c.id).length
              return {
                id: c.id,
                full_name: c.full_name,
                photo_url: c.photo_url,
                class: c.class,
                vote_count: cv,
                percentage: totalVotesForPosition > 0 ? (cv / totalVotesForPosition) * 100 : 0,
              }
            })
            .sort((a, b) => b.vote_count - a.vote_count)

          return {
            id: position.id,
            position_name: position.name,
            category: position.category,
            candidates,
            total_votes: totalVotesForPosition,
          }
        })

      const votedCount = users.filter((u) => u.has_voted).length
      setResults(resultsData)
      setGlobalStats({
        totalVotes: votes.length,
        totalVoters: users.length,
        turnout: users.length > 0 ? (votedCount / users.length) * 100 : 0,
        positionCount: resultsData.length,
      })
    } catch (error) {
      console.error("[v0] Election coverage fetch error:", error)
    } finally {
      setLoading(false)
    }
  }

  // Auto-advance slideshow
  const startSlideshow = (count: number) => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    if (count < 2) return
    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % count)
    }, SLIDE_DURATION)
  }

  useEffect(() => {
    fetchData()
    const refreshId = setInterval(fetchData, 8000)
    return () => {
      clearInterval(refreshId)
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  useEffect(() => {
    if (results.length > 0) {
      startSlideshow(results.length)
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [results.length])

  const handleDotSelect = (i: number) => {
    setCurrentIndex(i)
    startSlideshow(results.length) // Reset the timer
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-16 h-16 rounded-full border-2 border-red-500 mx-auto mb-6"
          />
          <p className="text-white text-xl font-bold tracking-widest uppercase">Loading Live Data</p>
          <p className="text-white/40 text-sm mt-2">Connecting to election database...</p>
        </div>
      </div>
    )
  }

  const currentPosition = results[currentIndex]

  return (
    <div className="fixed inset-0 bg-[#0a0a0f] flex flex-col overflow-hidden font-sans">

      {/* ── TOP BROADCAST BAR ── */}
      <header className="shrink-0 bg-[#0f0f18] border-b border-white/10">
        <div className="flex items-center h-14 px-4 gap-4">
          {/* Back button */}
          <Link href="/admin/dashboard" className="text-white/50 hover:text-white transition-colors shrink-0">
            <ChevronLeft className="w-5 h-5" />
          </Link>

          {/* Live badge */}
          <div className="flex items-center gap-2 bg-red-600 px-3 py-1 rounded shrink-0">
            <motion.div
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.2, repeat: Infinity }}
              className="w-2 h-2 rounded-full bg-white"
            />
            <span className="text-white text-xs font-black tracking-widest">LIVE</span>
          </div>

          {/* School name */}
          <div className="flex-1 min-w-0">
            <p className="text-white font-bold text-sm truncate">LUBIRI SECONDARY SCHOOL</p>
            <p className="text-white/50 text-xs truncate">2025 Prefectorial Election Coverage</p>
          </div>

          {/* Stats row */}
          <div className="hidden md:flex items-center gap-6 shrink-0">
            <div className="flex items-center gap-1.5 text-white/70">
              <Users className="w-3.5 h-3.5" />
              <span className="text-xs">{globalStats.totalVoters} voters</span>
            </div>
            <div className="flex items-center gap-1.5 text-white/70">
              <TrendingUp className="w-3.5 h-3.5" />
              <span className="text-xs">{globalStats.turnout.toFixed(1)}% turnout</span>
            </div>
            <div className="flex items-center gap-1.5 text-white/70">
              <Activity className="w-3.5 h-3.5" />
              <span className="text-xs">{globalStats.totalVotes} votes</span>
            </div>
          </div>

          <LiveClock />
        </div>
      </header>

      {/* ── MAIN CONTENT ── */}
      <main className="flex-1 overflow-hidden flex flex-col">
        {results.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Radio className="w-16 h-16 text-white/20 mx-auto mb-4" />
              <p className="text-white/50 text-xl">No positions with candidates yet</p>
              <p className="text-white/30 text-sm mt-2">Add candidates in the admin panel to see live coverage</p>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Slide area */}
            <div className="flex-1 overflow-y-auto px-6 md:px-12 lg:px-20 py-8">
              <div className="max-w-3xl mx-auto">
                <AnimatePresence mode="wait">
                  {currentPosition && (
                    <PositionSlide
                      key={currentPosition.id}
                      position={currentPosition}
                      slideIndex={currentIndex}
                      totalSlides={results.length}
                    />
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Slide navigation dots */}
            <div className="shrink-0 pb-3">
              <SlideDots total={results.length} current={currentIndex} onSelect={handleDotSelect} />
            </div>

            {/* Auto-advance progress bar */}
            <div className="shrink-0 h-0.5 bg-white/10">
              <motion.div
                key={currentIndex}
                className="h-full bg-red-500"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: SLIDE_DURATION / 1000, ease: "linear" }}
              />
            </div>
          </div>
        )}
      </main>

      {/* ── BOTTOM TICKER BAR ── */}
      <footer className="shrink-0 bg-red-700 border-t border-red-600 h-9 flex items-center overflow-hidden gap-3 px-0">
        <div className="bg-red-900 px-3 h-full flex items-center shrink-0">
          <span className="text-white text-xs font-black tracking-widest uppercase">BREAKING</span>
        </div>
        <NewsTicker messages={TICKER_MESSAGES} />
      </footer>
    </div>
  )
}
