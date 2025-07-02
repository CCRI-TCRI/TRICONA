-- Create election_settings table
CREATE TABLE IF NOT EXISTS election_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    election_name VARCHAR(255) NOT NULL DEFAULT '2024 Prefectorial Elections',
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    end_date DATE NOT NULL DEFAULT (CURRENT_DATE + INTERVAL '7 days'),
    is_active BOOLEAN NOT NULL DEFAULT true,
    allow_face_recognition BOOLEAN NOT NULL DEFAULT true,
    require_biometric BOOLEAN NOT NULL DEFAULT false,
    max_votes_per_user INTEGER NOT NULL DEFAULT 1,
    show_results_live BOOLEAN NOT NULL DEFAULT false,
    enable_tutorial BOOLEAN NOT NULL DEFAULT true,
    seasonal_theme VARCHAR(50) NOT NULL DEFAULT 'default',
    custom_greeting TEXT DEFAULT '',
    holiday_popups_enabled BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default settings if none exist
INSERT INTO election_settings (
    election_name,
    start_date,
    end_date,
    is_active,
    allow_face_recognition,
    require_biometric,
    max_votes_per_user,
    show_results_live,
    enable_tutorial,
    seasonal_theme,
    custom_greeting,
    holiday_popups_enabled
) 
SELECT 
    '2024 Prefectorial Elections',
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '7 days',
    true,
    true,
    false,
    1,
    false,
    true,
    'default',
    'Welcome to the 2024 Prefectorial Elections! Your voice matters.',
    true
WHERE NOT EXISTS (SELECT 1 FROM election_settings);

-- Create positions table if it doesn't exist
CREATE TABLE IF NOT EXISTS positions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(255) NOT NULL,
    max_candidates INTEGER NOT NULL DEFAULT 5,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default positions if none exist
INSERT INTO positions (name, category, max_candidates, description) 
SELECT * FROM (VALUES
    ('Head Boy', 'Senior Leadership', 5, 'Lead the student body and represent student interests'),
    ('Head Girl', 'Senior Leadership', 5, 'Lead the student body and represent student interests'),
    ('Deputy Head Boy', 'Senior Leadership', 3, 'Assist the Head Boy in leadership duties'),
    ('Deputy Head Girl', 'Senior Leadership', 3, 'Assist the Head Girl in leadership duties'),
    ('Entertainment Prefect', 'Entertainment', 3, 'Organize school events and entertainment activities'),
    ('Sports Prefect', 'Games and Sports', 3, 'Coordinate sports activities and competitions'),
    ('Academic Prefect', 'Academics', 3, 'Support academic activities and student learning'),
    ('Discipline Prefect', 'Discipline', 3, 'Maintain school discipline and order')
) AS v(name, category, max_candidates, description)
WHERE NOT EXISTS (SELECT 1 FROM positions WHERE positions.name = v.name);

-- Update candidates table to ensure position_name is populated
UPDATE candidates 
SET position_name = positions.name 
FROM positions 
WHERE candidates.position_id = positions.id::text 
AND (candidates.position_name IS NULL OR candidates.position_name = '');

COMMIT;
