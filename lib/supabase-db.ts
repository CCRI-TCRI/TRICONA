// Supabase-backed data layer
// Drop-in replacement for lib/local-storage.ts — same public API, real Postgres underneath.

import { createClient } from "@/lib/supabase/client"

// ─── Types ───────────────────────────────────────────────────────────────────

export interface User {
  id: string
  student_id: string
  full_name: string
  class: string
  voting_code: string
  has_voted: boolean
  voted_at?: string
  created_at: string
}

export interface Candidate {
  id: string
  student_id: string
  full_name: string
  class: string
  position_id: string
  manifesto: string
  photo_url?: string
  vote_count: number
  created_at: string
}

export interface Position {
  id: string
  name: string
  description: string
  category: string
  display_order: number
  is_active: boolean
  created_at: string
}

export interface Vote {
  id: string
  user_id: string
  candidate_id: string
  position_id: string
  created_at: string
}

// ─── User / Voter operations ─────────────────────────────────────────────────

export const userStorage = {
  getAll: async (): Promise<User[]> => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .order("created_at", { ascending: false })
    if (error) { console.error("[v0] userStorage.getAll error:", error.message); return [] }
    return data ?? []
  },

  getByToken: async (token: string): Promise<User | null> => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("voting_code", token.toUpperCase())
      .single()
    if (error) return null
    return data
  },

  getByStudentId: async (studentId: string): Promise<User | null> => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("student_id", studentId.toUpperCase())
      .single()
    if (error) return null
    return data
  },

  create: async (user: Omit<User, "id" | "created_at" | "has_voted">): Promise<User> => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("users")
      .insert([{ ...user, has_voted: false }])
      .select()
      .single()
    if (error) throw new Error(error.message)
    return data
  },

  update: async (id: string, updates: Partial<User>): Promise<User | null> => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("users")
      .update(updates)
      .eq("id", id)
      .select()
      .single()
    if (error) { console.error("[v0] userStorage.update error:", error.message); return null }
    return data
  },

  markAsVoted: async (id: string): Promise<User | null> => {
    return userStorage.update(id, { has_voted: true, voted_at: new Date().toISOString() })
  },

  delete: async (id: string): Promise<boolean> => {
    const supabase = createClient()
    const { error } = await supabase.from("users").delete().eq("id", id)
    if (error) { console.error("[v0] userStorage.delete error:", error.message); return false }
    return true
  },

  resetVotingCode: async (id: string, newCode: string): Promise<User | null> => {
    return userStorage.update(id, { voting_code: newCode })
  },
}

// ─── Candidate operations ─────────────────────────────────────────────────────

export const candidateStorage = {
  getAll: async (): Promise<Candidate[]> => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("candidates")
      .select("*")
      .order("created_at", { ascending: false })
    if (error) { console.error("[v0] candidateStorage.getAll error:", error.message); return [] }
    return data ?? []
  },

  getById: async (id: string): Promise<Candidate | null> => {
    const supabase = createClient()
    const { data, error } = await supabase.from("candidates").select("*").eq("id", id).single()
    if (error) return null
    return data
  },

  getByPosition: async (positionId: string): Promise<Candidate[]> => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("candidates")
      .select("*")
      .eq("position_id", positionId)
    if (error) return []
    return data ?? []
  },

  create: async (candidate: Omit<Candidate, "id" | "created_at" | "vote_count">): Promise<Candidate> => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("candidates")
      .insert([{ ...candidate, vote_count: 0 }])
      .select()
      .single()
    if (error) throw new Error(error.message)
    return data
  },

  update: async (id: string, updates: Partial<Candidate>): Promise<Candidate | null> => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("candidates")
      .update(updates)
      .eq("id", id)
      .select()
      .single()
    if (error) { console.error("[v0] candidateStorage.update error:", error.message); return null }
    return data
  },

  delete: async (id: string): Promise<boolean> => {
    const supabase = createClient()
    const { error } = await supabase.from("candidates").delete().eq("id", id)
    if (error) { console.error("[v0] candidateStorage.delete error:", error.message); return false }
    return true
  },
}

// ─── Position operations ──────────────────────────────────────────────────────

export const positionStorage = {
  getAll: async (): Promise<Position[]> => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("positions")
      .select("*")
      .order("display_order", { ascending: true })
    if (error) { console.error("[v0] positionStorage.getAll error:", error.message); return [] }
    return data ?? []
  },

  getById: async (id: string): Promise<Position | null> => {
    const supabase = createClient()
    const { data, error } = await supabase.from("positions").select("*").eq("id", id).single()
    if (error) return null
    return data
  },

  getActive: async (): Promise<Position[]> => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("positions")
      .select("*")
      .eq("is_active", true)
      .order("display_order", { ascending: true })
    if (error) return []
    return data ?? []
  },

  create: async (position: Omit<Position, "id" | "created_at">): Promise<Position> => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("positions")
      .insert([position])
      .select()
      .single()
    if (error) throw new Error(error.message)
    return data
  },

  update: async (id: string, updates: Partial<Position>): Promise<Position | null> => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("positions")
      .update(updates)
      .eq("id", id)
      .select()
      .single()
    if (error) { console.error("[v0] positionStorage.update error:", error.message); return null }
    return data
  },
}

// ─── Vote operations ──────────────────────────────────────────────────────────

export const voteStorage = {
  getAll: async (): Promise<Vote[]> => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("votes")
      .select("*")
      .order("created_at", { ascending: false })
    if (error) { console.error("[v0] voteStorage.getAll error:", error.message); return [] }
    return data ?? []
  },

  getByUser: async (userId: string): Promise<Vote[]> => {
    const supabase = createClient()
    const { data, error } = await supabase.from("votes").select("*").eq("user_id", userId)
    if (error) return []
    return data ?? []
  },

  getByPosition: async (positionId: string): Promise<Vote[]> => {
    const supabase = createClient()
    const { data, error } = await supabase.from("votes").select("*").eq("position_id", positionId)
    if (error) return []
    return data ?? []
  },

  create: async (vote: Omit<Vote, "id" | "created_at">): Promise<Vote> => {
    const supabase = createClient()
    const { data, error } = await supabase.from("votes").insert([vote]).select().single()
    if (error) throw new Error(error.message)
    // Increment candidate vote count atomically
    await supabase.rpc("increment_vote_count", { p_candidate_id: vote.candidate_id })
    return data
  },

  createBatch: async (votes: Omit<Vote, "id" | "created_at">[]): Promise<Vote[]> => {
    const supabase = createClient()
    const { data, error } = await supabase.from("votes").insert(votes).select()
    if (error) throw new Error(error.message)
    // Increment vote counts for each candidate
    for (const vote of votes) {
      await supabase.rpc("increment_vote_count", { p_candidate_id: vote.candidate_id })
    }
    return data ?? []
  },
}

// ─── Composite helpers ────────────────────────────────────────────────────────

export interface PositionWithCandidates extends Position {
  candidates: Candidate[]
}

export async function getPositionsWithCandidates(): Promise<PositionWithCandidates[]> {
  const [positions, candidates] = await Promise.all([
    positionStorage.getActive(),
    candidateStorage.getAll(),
  ])

  return positions.map((position) => ({
    ...position,
    candidates: candidates.filter((c) => c.position_id === position.id),
  }))
}

// ─── Election Settings ────────────────────────────────────────────────────────

export const electionSettings = {
  getAll: async (): Promise<Record<string, string>> => {
    const supabase = createClient()
    const { data, error } = await supabase.from("election_settings").select("setting_key, setting_value")
    if (error) return {}
    return Object.fromEntries((data ?? []).map((s) => [s.setting_key, s.setting_value ?? ""]))
  },

  get: async (key: string): Promise<string | null> => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("election_settings")
      .select("setting_value")
      .eq("setting_key", key)
      .single()
    if (error) return null
    return data?.setting_value ?? null
  },

  set: async (key: string, value: string): Promise<void> => {
    const supabase = createClient()
    await supabase
      .from("election_settings")
      .upsert({ setting_key: key, setting_value: value, updated_at: new Date().toISOString() })
  },
}
