CREATE TABLE IF NOT EXISTS tutor_profiles (
  id                  SERIAL PRIMARY KEY,
  user_id             INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  bio                 TEXT,
  hourly_rate         NUMERIC(10, 2),
  city                VARCHAR(100),
  experience_years    INTEGER DEFAULT 0,
  is_available        BOOLEAN DEFAULT true,
  profile_picture_url TEXT,
  created_at          TIMESTAMP DEFAULT NOW(),
  updated_at          TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS subjects (
  id   SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS tutor_subjects (
  tutor_profile_id INTEGER REFERENCES tutor_profiles(id) ON DELETE CASCADE,
  subject_id       INTEGER REFERENCES subjects(id) ON DELETE CASCADE,
  PRIMARY KEY (tutor_profile_id, subject_id)
);

INSERT INTO subjects (name) VALUES
  ('Mathematics'),
  ('Physics'),
  ('Chemistry'),
  ('Biology'),
  ('English'),
  ('Nepali'),
  ('Computer Science'),
  ('History'),
  ('Economics'),
  ('Accounting')
ON CONFLICT (name) DO NOTHING;