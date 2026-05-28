const pool = require("../db");

const createReview = async (req, res) => {
  const { booking_id, rating, comment } = req.body;
  const reviewer_id = req.user.id;
  try {
    const booking = await pool.query(
      "SELECT * FROM bookings WHERE id = $1 AND student_id = $2 AND status = 'completed'",
      [booking_id, reviewer_id]
    );
    if (booking.rows.length === 0) {
      return res.status(403).json({ message: "Can only review completed bookings you attended" });
    }
    const tutor_id = booking.rows[0].tutor_id;
    const existing = await pool.query("SELECT id FROM reviews WHERE booking_id = $1", [booking_id]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ message: "Already reviewed this booking" });
    }
    const result = await pool.query(
      "INSERT INTO reviews (booking_id, reviewer_id, tutor_id, rating, comment) VALUES ($1,$2,$3,$4,$5) RETURNING *",
      [booking_id, reviewer_id, tutor_id, rating, comment]
    );
    await pool.query(
      "INSERT INTO notifications (user_id, title, message, type) VALUES ($1, $2, $3, 'review')",
      [tutor_id, "New Review Received", `You received a ${rating}-star review!`]
    );
    res.status(201).json({ review: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const getTutorReviews = async (req, res) => {
  const { tutor_id } = req.params;
  try {
    const result = await pool.query(
      `SELECT r.*, u.username, u.full_name
       FROM reviews r
       JOIN users u ON u.id = r.reviewer_id
       WHERE r.tutor_id = $1
       ORDER BY r.created_at DESC`,
      [tutor_id]
    );
    const avg = await pool.query(
      "SELECT ROUND(AVG(rating)::numeric, 1) AS avg_rating, COUNT(*) AS total FROM reviews WHERE tutor_id = $1",
      [tutor_id]
    );
    res.json({ reviews: result.rows, avg_rating: avg.rows[0].avg_rating, total: avg.rows[0].total });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { createReview, getTutorReviews };