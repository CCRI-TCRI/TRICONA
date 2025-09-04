-- Create database schema for the election system

-- Users table for voters
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id VARCHAR(20) UNIQUE NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  class VARCHAR(10) NOT NULL,
  email VARCHAR(100),
  voting_code VARCHAR(6) UNIQUE NOT NULL,
  face_encoding TEXT, -- Store face recognition data
  fingerprint_data TEXT, -- Store fingerprint data
  has_voted BOOLEAN DEFAULT FALSE,
  voted_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Admin users table
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  role VARCHAR(20) DEFAULT 'admin' CHECK (role IN ('manager', 'chairperson', 'headteacher', 'admin')),
  profile_picture TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Election categories
CREATE TABLE IF NOT EXISTS election_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Election positions
CREATE TABLE IF NOT EXISTS positions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(100) NOT NULL,
  description TEXT,
  category_id UUID REFERENCES election_categories(id) ON DELETE CASCADE,
  max_candidates INTEGER DEFAULT 10,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Candidates table
CREATE TABLE IF NOT EXISTS candidates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id VARCHAR(20) NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  class VARCHAR(10) NOT NULL,
  position_id UUID REFERENCES positions(id) ON DELETE CASCADE,
  manifesto TEXT,
  photo_url TEXT,
  vote_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Votes table
CREATE TABLE IF NOT EXISTS votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
  position_id UUID REFERENCES positions(id) ON DELETE CASCADE,
  category_id UUID REFERENCES election_categories(id) ON DELETE CASCADE,
  voted_at TIMESTAMP DEFAULT NOW()
);

-- Election settings
CREATE TABLE IF NOT EXISTS election_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value TEXT,
  description TEXT,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Audit trail
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  admin_id UUID,
  action VARCHAR(100) NOT NULL,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_student_id ON users(student_id);
CREATE INDEX IF NOT EXISTS idx_users_voting_code ON users(voting_code);
CREATE INDEX IF NOT EXISTS idx_votes_user_id ON votes(user_id);
CREATE INDEX IF NOT EXISTS idx_votes_candidate_id ON votes(candidate_id);
CREATE INDEX IF NOT EXISTS idx_candidates_position_id ON candidates(position_id);

-- Function to increment vote count
CREATE OR REPLACE FUNCTION increment_vote_count(candidate_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE candidates 
  SET vote_count = vote_count + 1 
  WHERE id = candidate_id;
END;
$$ LANGUAGE plpgsql;

-- RLS Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE election_categories ENABLE ROW LEVEL SECURITY;

-- Allow public read access to candidates, positions, and categories
CREATE POLICY "Public read access for candidates" ON candidates FOR SELECT USING (true);
CREATE POLICY "Public read access for positions" ON positions FOR SELECT USING (true);
CREATE POLICY "Public read access for categories" ON election_categories FOR SELECT USING (true);

-- Users can only access their own data
CREATE POLICY "Users can view own data" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (auth.uid() = id);

-- Users can only insert their own votes
CREATE POLICY "Users can insert own votes" ON votes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own votes" ON votes FOR SELECT USING (auth.uid() = user_id);
