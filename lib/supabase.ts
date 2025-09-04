import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for our database
export interface User {
  id: string
  student_id: string
  full_name: string
  class: string
  email?: string
  voting_code: string
  face_encoding?: string
  fingerprint_data?: string
  has_voted: boolean
  voted_at?: string
  created_at: string
  updated_at: string
}

export interface AdminUser {
  id: string
  username: string
  email: string
  full_name: string
  role: "manager" | "chairperson" | "headteacher" | "admin"
  profile_picture?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ElectionCategory {
  id: string
  name: string
  description?: string
  is_active: boolean
  created_at: string
}

export interface Position {
  id: string
  title: string
  description?: string
  category_id: string
  max_candidates: number
  is_active: boolean
  created_at: string
  category?: ElectionCategory
}

export interface Candidate {
  id: string
  student_id: string
  full_name: string
  class: string
  position_id: string
  manifesto?: string
  photo_url?: string
  vote_count: number
  is_active: boolean
  created_at: string
  position?: Position
}

export interface Vote {
  id: string
  user_id: string
  candidate_id: string
  position_id: string
  category_id: string
  voted_at: string
}
