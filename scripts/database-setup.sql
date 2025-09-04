-- Create fresh database schema for Lubiri Election System
CREATE TABLE IF NOT EXISTS voters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  voter_code VARCHAR(8) UNIQUE NOT NULL,
  student_id VARCHAR(15) UNIQUE NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  class_level VARCHAR(10) NOT NULL,
  face_data TEXT,
  has_voted BOOLEAN DEFAULT FALSE,
  vote_timestamp TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS election_positions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  position_name VARCHAR(100) NOT NULL,
  category VARCHAR(50) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS election_candidates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  position_id UUID REFERENCES election_positions(id),
  candidate_name VARCHAR(100) NOT NULL,
  student_id VARCHAR(15) NOT NULL,
  class_level VARCHAR(10) NOT NULL,
  manifesto TEXT,
  photo_url TEXT,
  vote_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cast_votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  voter_id UUID REFERENCES voters(id),
  candidate_id UUID REFERENCES election_candidates(id),
  position_id UUID REFERENCES election_positions(id),
  vote_time TIMESTAMP DEFAULT NOW()
);

-- Insert sample data
INSERT INTO voters (voter_code, student_id, full_name, class_level) VALUES
('VT001234', 'LUB2024001', 'Alice Namukasa', 'S6A'),
('VT001235', 'LUB2024002', 'Brian Ssemakula', 'S6B'),
('VT001236', 'LUB2024003', 'Catherine Nakato', 'S5A'),
('VT001237', 'LUB2024004', 'David Mukasa', 'S5B');

INSERT INTO election_positions (position_name, category, description) VALUES
('Head Prefect', 'Leadership', 'Overall student leader'),
('Deputy Head Prefect', 'Leadership', 'Assistant student leader'),
('Sports Captain', 'Sports', 'Leader of sports activities'),
('Entertainment Prefect', 'Culture', 'Leader of cultural activities');

INSERT INTO election_candidates (position_id, candidate_name, student_id, class_level, manifesto) VALUES
((SELECT id FROM election_positions WHERE position_name = 'Head Prefect'), 'John Kato', 'LUB2024010', 'S6A', 'I will represent all students fairly'),
((SELECT id FROM election_positions WHERE position_name = 'Head Prefect'), 'Mary Nalubega', 'LUB2024011', 'S6B', 'Together we can achieve more'),
((SELECT id FROM election_positions WHERE position_name = 'Sports Captain'), 'Peter Ssali', 'LUB2024012', 'S5A', 'Sports excellence for all'),
((SELECT id FROM election_positions WHERE position_name = 'Entertainment Prefect'), 'Grace Nakirya', 'LUB2024013', 'S5B', 'Fun and inclusive entertainment');
