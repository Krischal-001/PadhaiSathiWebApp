const pool = require("../db");

// POST /api/bookings — student creates a booking
const createBooking = async (req, res) => {
  const student_id = req.user.id;
  const { tutor_id, subject_id, booking_date, start_time, end_time, message } = req.body;
  if (!tutor_id || !booking_date || !start_time || !end_time) {
    return res.status(400).json({ message: "tutor_id, booking_date, start_time, end_time are required" });
  }
  try {
    const tutorProfile = await pool.query(
      "SELECT hourly_rate FROM tutor_profiles WHERE user_id = $1",
      [tutor_id]
    );
    const hourly_rate = tutorProfile.rows[0]?.hourly_rate || null;

    const result = await pool.query(
      `INSERT INTO bookings (student_id, tutor_id, subject_id, booking_date, start_time, end_time, message, hourly_rate)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [student_id, tutor_id, subject_id, booking_date, start_time, end_time, message, hourly_rate]
    );
    res.status(201).json({ message: "Booking created", booking: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/bookings/my — get all bookings for logged in user (student or tutor)
const getMyBookings = async (req, res) => {
  const user_id = req.user.id;
  try {
    const result = await pool.query(
      `SELECT b.*,
        s.username AS student_name, s.email AS student_email,
        t.username AS tutor_name,  t.email AS tutor_email,
        sub.name AS subject_name
       FROM bookings b
       JOIN users s   ON s.id = b.student_id
       JOIN users t   ON t.id = b.tutor_id
       LEFT JOIN subjects sub ON sub.id = b.subject_id
       WHERE b.student_id = $1 OR b.tutor_id = $1
       ORDER BY b.booking_date DESC, b.start_time DESC`,
      [user_id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/bookings/:id — get single booking
const getBookingById = async (req, res) => {
  const { id } = req.params;
  const user_id = req.user.id;
  try {
    const result = await pool.query(
      `SELECT b.*,
        s.username AS student_name, s.email AS student_email,
        t.username AS tutor_name,  t.email AS tutor_email,
        sub.name AS subject_name
       FROM bookings b
       JOIN users s   ON s.id = b.student_id
       JOIN users t   ON t.id = b.tutor_id
       LEFT JOIN subjects sub ON sub.id = b.subject_id
       WHERE b.id = $1 AND (b.student_id = $2 OR b.tutor_id = $2)`,
      [id, user_id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Booking not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// PATCH /api/bookings/:id/status — tutor confirms/cancels, student cancels
const updateBookingStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const user_id = req.user.id;
  const allowed = ["confirmed", "cancelled", "completed"];
  if (!allowed.includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }
  try {
    const booking = await pool.query("SELECT * FROM bookings WHERE id = $1", [id]);
    if (booking.rows.length === 0) {
      return res.status(404).json({ message: "Booking not found" });
    }
    const b = booking.rows[0];
    if (b.student_id !== user_id && b.tutor_id !== user_id) {
      return res.status(403).json({ message: "Not authorized" });
    }
    // only tutor can confirm/complete, both can cancel
    if ((status === "confirmed" || status === "completed") && b.tutor_id !== user_id) {
      return res.status(403).json({ message: "Only tutor can confirm or complete bookings" });
    }
    const result = await pool.query(
      "UPDATE bookings SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *",
      [status, id]
    );
    res.json({ message: `Booking ${status}`, booking: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/bookings/tutor/:tutor_id — get all bookings for a specific tutor (public)
const getTutorBookings = async (req, res) => {
  const { tutor_id } = req.params;
  try {
    const result = await pool.query(
      `SELECT booking_date, start_time, end_time, status
       FROM bookings
       WHERE tutor_id = $1 AND status IN ('pending','confirmed')
       ORDER BY booking_date, start_time`,
      [tutor_id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { createBooking, getMyBookings, getBookingById, updateBookingStatus, getTutorBookings };