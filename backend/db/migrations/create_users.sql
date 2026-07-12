-- Users table (core table referenced by authController.js and bookings)
CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  username      VARCHAR(50) UNIQUE NOT NULL,
  full_name     VARCHAR(100),
  email         VARCHAR(100) UNIQUE NOT NULL,
  password      TEXT NOT NULL,
  role          VARCHAR(20) NOT NULL CHECK (role IN ('student','parent','tutor','institute','admin')),
  phone         VARCHAR(20),
  avatar_url    TEXT,
  is_verified   BOOLEAN DEFAULT FALSE,
  created_at    TIMESTAMP DEFAULT NOW(),
  updated_at    TIMESTAMP DEFAULT NOW()
);

-- Role-specific profile tables (referenced in authController.js register())
CREATE TABLE IF NOT EXISTS student_profiles (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  grade_level VARCHAR(50),
  school_name VARCHAR(150),
  created_at  TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS parent_profiles (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at  TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS institute_profiles (
  id              SERIAL PRIMARY KEY,
  user_id         INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  institute_name  VARCHAR(150) NOT NULL,
  created_at      TIMESTAMP DEFAULT NOW()
);

-- Indexes for common lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);