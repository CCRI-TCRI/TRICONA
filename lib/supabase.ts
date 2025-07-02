import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

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
