-- Insert sample election categories
INSERT INTO election_categories (name, description) VALUES
('Senior Leadership', 'Top leadership positions in the school'),
('Games and Sports', 'Sports and physical activities leadership'),
('Entertainment', 'Cultural and entertainment activities'),
('Academic Affairs', 'Academic leadership and support'),
('Information', 'Communication and information management'),
('Uniform', 'Dress code and appearance standards'),
('Mess', 'Dining and food services management');

-- Insert sample positions
INSERT INTO positions (title, description, category_id) VALUES
('Head Prefect', 'Overall student leader', (SELECT id FROM election_categories WHERE name = 'Senior Leadership')),
('Deputy Head Prefect', 'Assistant to Head Prefect', (SELECT id FROM election_categories WHERE name = 'Senior Leadership')),
('Sports Prefect', 'Leader of sports activities', (SELECT id FROM election_categories WHERE name = 'Games and Sports')),
('Entertainment Prefect', 'Leader of entertainment activities', (SELECT id FROM election_categories WHERE name = 'Entertainment')),
('Academic Prefect', 'Leader of academic affairs', (SELECT id FROM election_categories WHERE name = 'Academic Affairs')),
('Information Prefect', 'Leader of information management', (SELECT id FROM election_categories WHERE name = 'Information')),
('Uniform Prefect', 'Leader of uniform standards', (SELECT id FROM election_categories WHERE name = 'Uniform')),
('Mess Prefect', 'Leader of dining services', (SELECT id FROM election_categories WHERE name = 'Mess'));

-- Insert sample admin user
INSERT INTO admin_users (username, email, password_hash, full_name, role) VALUES
('admin', 'admin@lubiri.edu.ug', '$2b$10$example_hash', 'System Administrator', 'manager');

-- Insert sample students/voters
INSERT INTO users (student_id, full_name, class, email, voting_code) VALUES
('LUB2024001', 'Sarah Nakato', 'S6A', 'sarah.nakato@student.lubiri.edu.ug', '123456'),
('LUB2024002', 'John Mukasa', 'S6A', 'john.mukasa@student.lubiri.edu.ug', '234567'),
('LUB2024003', 'Grace Nambi', 'S6B', 'grace.nambi@student.lubiri.edu.ug', '345678'),
('LUB2024004', 'David Ssali', 'S5A', 'david.ssali@student.lubiri.edu.ug', '456789'),
('LUB2024005', 'Mary Nakirya', 'S5A', 'mary.nakirya@student.lubiri.edu.ug', '567890'),
('LUB2024006', 'Peter Kato', 'S5B', 'peter.kato@student.lubiri.edu.ug', '678901'),
('LUB2024007', 'Jane Nalubega', 'S4A', 'jane.nalubega@student.lubiri.edu.ug', '789012'),
('LUB2024008', 'Moses Kiiza', 'S4A', 'moses.kiiza@student.lubiri.edu.ug', '890123');

-- Insert sample candidates
INSERT INTO candidates (student_id, full_name, class, position_id, manifesto) VALUES
('LUB2024001', 'Sarah Nakato', 'S6A', (SELECT id FROM positions WHERE title = 'Head Prefect'), 'I will lead with integrity and ensure student voices are heard in all school decisions.'),
('LUB2024002', 'John Mukasa', 'S6A', (SELECT id FROM positions WHERE title = 'Head Prefect'), 'Together we can build a stronger school community with better facilities and opportunities.'),
('LUB2024003', 'Grace Nambi', 'S6B', (SELECT id FROM positions WHERE title = 'Head Prefect'), 'My vision is to create an inclusive environment where every student can thrive academically and socially.'),
('LUB2024004', 'David Ssali', 'S5A', (SELECT id FROM positions WHERE title = 'Sports Prefect'), 'I will promote sports excellence and ensure all students have access to quality sporting facilities.'),
('LUB2024005', 'Mary Nakirya', 'S5A', (SELECT id FROM positions WHERE title = 'Sports Prefect'), 'Let us work together to make our school a champion in inter-school competitions.'),
('LUB2024006', 'Peter Kato', 'S5B', (SELECT id FROM positions WHERE title = 'Entertainment Prefect'), 'I will organize exciting events that showcase our talents and bring joy to school life.'),
('LUB2024007', 'Jane Nalubega', 'S4A', (SELECT id FROM positions WHERE title = 'Entertainment Prefect'), 'Entertainment should be fun, inclusive, and celebrate our diverse cultures and talents.'),
('LUB2024008', 'Moses Kiiza', 'S4A', (SELECT id FROM positions WHERE title = 'Entertainment Prefect'), 'My goal is to create memorable experiences through creative and engaging entertainment programs.');

-- Insert election settings
INSERT INTO election_settings (setting_key, setting_value, description) VALUES
('election_title', '2024 Prefectorial Elections', 'Title of the current election'),
('election_start_date', '2024-01-15T08:00:00Z', 'When voting begins'),
('election_end_date', '2024-01-15T17:00:00Z', 'When voting ends'),
('voting_duration_minutes', '120', 'Maximum time allowed for voting session'),
('face_recognition_enabled', 'true', 'Whether face recognition is required'),
('fingerprint_enabled', 'true', 'Whether fingerprint scanning is required');
