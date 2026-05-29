import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

// Validate credentials - check they're not placeholders and valid URLs
const isValidConfig =
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.includes("supabase.co") &&
  supabaseAnonKey !== "PLACEHOLDER_SUPABASE_ANON_KEY" &&
  supabaseAnonKey.length > 20

// Create client safely - will be null in demo mode
export const supabase = isValidConfig
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

// Helper function for better error messages
export const getErrorMessage = (error: any): string => {
  if (!error) return "Unknown error"
  if (typeof error === "string") return error
  if (error.message) return error.message
  if (error.error_description) return error.error_description
  return JSON.stringify(error)
}

// Check if Supabase is configured
export const isSupabaseConfigured = (): boolean => {
  return isValidConfig
}

// Database types
export interface User {
  id: string
  student_id: string
  full_name: string
  class: string
  voting_code: string
  face_encoding?: string
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
  title: string
  description: string
  category_id: string
  max_candidates: number
  is_active: boolean
}

export interface Category {
  id: string
  name: string
  description: string
  is_active: boolean
}

export interface Vote {
  id: string
  user_id: string
  candidate_id: string
  position_id: string
  category_id: string
  created_at: string
}
