CREATE TABLE IF NOT EXISTS tutor_availability (
  id          SERIAL PRIMARY KEY,
  tutor_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time  TIME NOT NULL,
  end_time    TIME NOT NULL,
  is_active   BOOLEAN DEFAULT true,
  created_at  TIMESTAMP DEFAULT NOW(),
  UNIQUE (tutor_id, day_of_week, start_time)
);

CREATE TABLE IF NOT EXISTS tutor_blocked_dates (
  id         SERIAL PRIMARY KEY,
  tutor_id   INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  blocked_date DATE NOT NULL,
  reason     TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE (tutor_id, blocked_date)
);

CREATE INDEX IF NOT EXISTS idx_availability_tutor ON tutor_availability(tutor_id);
CREATE INDEX IF NOT EXISTS idx_blocked_dates_tutor ON tutor_blocked_dates(tutor_id);