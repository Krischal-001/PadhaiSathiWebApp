const pool = require("../db");

const DAYS = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

// GET /api/availability/my — tutor gets their own availability
const getMyAvailability = async (req, res) => {
  const tutor_id = req.user.id;
  try {
    const slots = await pool.query(
      "SELECT * FROM tutor_availability WHERE tutor_id = $1 AND is_active = true ORDER BY day_of_week, start_time",
      [tutor_id]
    );
    const blocked = await pool.query(
      "SELECT * FROM tutor_blocked_dates WHERE tutor_id = $1 AND blocked_date >= CURRENT_DATE ORDER BY blocked_date",
      [tutor_id]
    );
    res.json({ slots: slots.rows, blocked_dates: blocked.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/availability/tutor/:tutor_id — public: get a tutor's availability
const getTutorAvailability = async (req, res) => {
  const { tutor_id } = req.params;
  try {
    const slots = await pool.query(
      "SELECT * FROM tutor_availability WHERE tutor_id = $1 AND is_active = true ORDER BY day_of_week, start_time",
      [tutor_id]
    );
    const blocked = await pool.query(
      "SELECT blocked_date FROM tutor_blocked_dates WHERE tutor_id = $1 AND blocked_date >= CURRENT_DATE",
      [tutor_id]
    );
    res.json({ slots: slots.rows, blocked_dates: blocked.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// POST /api/availability — tutor adds a slot
const addSlot = async (req, res) => {
  const tutor_id = req.user.id;
  const { day_of_week, start_time, end_time } = req.body;
  if (day_of_week === undefined || !start_time || !end_time) {
    return res.status(400).json({ message: "day_of_week, start_time, end_time required" });
  }
  if (start_time >= end_time) {
    return res.status(400).json({ message: "End time must be after start time" });
  }
  try {
    const result = await pool.query(
      `INSERT INTO tutor_availability (tutor_id, day_of_week, start_time, end_time)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (tutor_id, day_of_week, start_time) DO UPDATE SET end_time = $4, is_active = true
       RETURNING *`,
      [tutor_id, day_of_week, start_time, end_time]
    );
    res.status(201).json({ message: "Slot added", slot: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE /api/availability/:id — tutor removes a slot
const removeSlot = async (req, res) => {
  const { id } = req.params;
  const tutor_id = req.user.id;
  try {
    const result = await pool.query(
      "DELETE FROM tutor_availability WHERE id = $1 AND tutor_id = $2 RETURNING id",
      [id, tutor_id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Slot not found" });
    }
    res.json({ message: "Slot removed" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// POST /api/availability/block — tutor blocks a date
const blockDate = async (req, res) => {
  const tutor_id = req.user.id;
  const { blocked_date, reason } = req.body;
  if (!blocked_date) {
    return res.status(400).json({ message: "blocked_date required" });
  }
  try {
    const result = await pool.query(
      `INSERT INTO tutor_blocked_dates (tutor_id, blocked_date, reason)
       VALUES ($1, $2, $3)
       ON CONFLICT (tutor_id, blocked_date) DO UPDATE SET reason = $3
       RETURNING *`,
      [tutor_id, blocked_date, reason || null]
    );
    res.status(201).json({ message: "Date blocked", blocked: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE /api/availability/block/:id — tutor unblocks a date
const unblockDate = async (req, res) => {
  const { id } = req.params;
  const tutor_id = req.user.id;
  try {
    const result = await pool.query(
      "DELETE FROM tutor_blocked_dates WHERE id = $1 AND tutor_id = $2 RETURNING id",
      [id, tutor_id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Blocked date not found" });
    }
    res.json({ message: "Date unblocked" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getMyAvailability, getTutorAvailability, addSlot, removeSlot, blockDate, unblockDate };