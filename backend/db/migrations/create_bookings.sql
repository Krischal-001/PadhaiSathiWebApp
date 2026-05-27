 
CREATE TABLE IF NOT EXISTS bookings (
  id              SERIAL PRIMARY KEY,
  student_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tutor_id        INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subject_id      INTEGER REFERENCES subjects(id) ON DELETE SET NULL,
  booking_date    DATE NOT NULL,
  start_time      TIME NOT NULL,
  end_time        TIME NOT NULL,
  message         TEXT,
  status          VARCHAR(20) DEFAULT 'pending'
                  CHECK (status IN ('pending','confirmed','cancelled','completed')),
  hourly_rate     NUMERIC(10,2),
  created_at      TIMESTAMP DEFAULT NOW(),
  updated_at      TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bookings_student ON bookings(student_id);
CREATE INDEX IF NOT EXISTS idx_bookings_tutor   ON bookings(tutor_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status  ON bookings(status);psql -U postgres -d padhai_sathi -f db/migrations/create_bookings.sql