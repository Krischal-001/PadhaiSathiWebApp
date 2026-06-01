CREATE TABLE IF NOT EXISTS reviews (
  id          SERIAL PRIMARY KEY,
  reviewer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tutor_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  booking_id  INTEGER REFERENCES bookings(id) ON DELETE SET NULL,
  rating      INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment     TEXT,
  created_at  TIMESTAMP DEFAULT NOW(),
  updated_at  TIMESTAMP DEFAULT NOW(),
  UNIQUE (reviewer_id, booking_id)
);

CREATE INDEX IF NOT EXISTS idx_reviews_tutor ON reviews(tutor_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewer ON reviews(reviewer_id);
