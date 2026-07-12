const pool = require("../db");
const getStats = async (req, res) => {
  try {
    const [users, bookings, tutors, revenue] = await Promise.all([
      pool.query("SELECT COUNT(*) FROM users"),
      pool.query("SELECT COUNT(*) FROM bookings"),
      pool.query("SELECT COUNT(*) FROM tutor_profiles"),
      pool.query("SELECT COALESCE(SUM(hourly_rate), 0) FROM bookings WHERE status = 'completed'"),
    ]);
    res.json({
      total_users: parseInt(users.rows[0].count),
      total_bookings: parseInt(bookings.rows[0].count),
      total_tutors: parseInt(tutors.rows[0].count),
      total_revenue: parseFloat(revenue.rows[0].coalesce),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
const getAllUsers = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, username, full_name, email, role, phone, is_verified, created_at
       FROM users ORDER BY created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

const getAllBookings = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT b.*,
        s.username AS student_name, s.email AS student_email,
        t.username AS tutor_name, t.email AS tutor_email,
        sub.name AS subject_name
       FROM bookings b
       JOIN users s ON s.id = b.student_id
       JOIN users t ON t.id = b.tutor_id
       LEFT JOIN subjects sub ON sub.id = b.subject_id
       ORDER BY b.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

const verifyUser = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("UPDATE users SET is_verified = true WHERE id = $1", [id]);
    res.json({ message: "User verified" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM users WHERE id = $1", [id]);
    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
const updateBooking = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const result = await pool.query(
      "UPDATE bookings SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *",
      [status, id]
    );
    res.json({ message: "Booking updated", booking: result.rows[0] });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
module.exports = { getStats, getAllUsers, getAllBookings, verifyUser, deleteUser, updateBooking };