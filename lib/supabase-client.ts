import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

export interface Voter {
  id: string
  voter_code: string
  student_id: string
  full_name: string
  class_level: string
  face_data?: string
  has_voted: boolean
  vote_timestamp?: string
}

export interface Position {
  id: string
  position_name: string
  category: string
  description?: string
  is_active: boolean
}

export interface Candidate {
  id: string
  position_id: string
  candidate_name: string
  student_id: string
  class_level: string
  manifesto?: string
  photo_url?: string
  vote_count: number
  is_active: boolean
}
