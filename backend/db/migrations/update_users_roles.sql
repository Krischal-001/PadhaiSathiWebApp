-- Add role constraint and new columns to users
ALTER TABLE users 
  DROP CONSTRAINT IF EXISTS users_role_check;

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS full_name VARCHAR(150),
  ADD COLUMN IF NOT EXISTS phone VARCHAR(20),
  ADD COLUMN IF NOT EXISTS avatar_url TEXT,
  ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

ALTER TABLE users
  ADD CONSTRAINT users_role_check 
  CHECK (role IN ('student', 'parent', 'tutor', 'institute'));

-- Student profiles
CREATE TABLE IF NOT EXISTS student_profiles (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  grade VARCHAR(50),
  school VARCHAR(150),
  subjects_needed TEXT[],
  learning_goals TEXT,
  parent_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Parent profiles  
CREATE TABLE IF NOT EXISTS parent_profiles (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  number_of_children INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Institute profiles
CREATE TABLE IF NOT EXISTS institute_profiles (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  institute_name VARCHAR(200) NOT NULL,
  institute_type VARCHAR(50) CHECK (institute_type IN ('school','college','coaching','online','other')),
  address TEXT,
  website VARCHAR(200),
  description TEXT,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
