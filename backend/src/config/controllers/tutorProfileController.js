const pool = require("../db");

const createProfile = async (req, res) => {
  const user_id = req.user.id;
  const { bio, hourly_rate, city, experience_years, subject_ids } = req.body;
  try {
    const existing = await pool.query(
      "SELECT id FROM tutor_profiles WHERE user_id = $1",
      [user_id]
    );
    if (existing.rows.length > 0) {
      return res.status(400).json({ message: "Profile already exists. Use PUT to update." });
    }
    const result = await pool.query(
      `INSERT INTO tutor_profiles (user_id, bio, hourly_rate, city, experience_years)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [user_id, bio, hourly_rate, city, experience_years]
    );
    const profile = result.rows[0];
    if (subject_ids && subject_ids.length > 0) {
      await Promise.all(
        subject_ids.map((sid) =>
          pool.query(
            "INSERT INTO tutor_subjects (tutor_profile_id, subject_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
            [profile.id, sid]
          )
        )
      );
    }
    res.status(201).json({ message: "Profile created", profile });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const getMyProfile = async (req, res) => {
  const user_id = req.user.id;
  try {
    const result = await pool.query(
      `SELECT tp.*,
        COALESCE(json_agg(json_build_object('id', s.id, 'name', s.name))
          FILTER (WHERE s.id IS NOT NULL), '[]') AS subjects
       FROM tutor_profiles tp
       LEFT JOIN tutor_subjects ts ON ts.tutor_profile_id = tp.id
       LEFT JOIN subjects s ON s.id = ts.subject_id
       WHERE tp.user_id = $1
       GROUP BY tp.id`,
      [user_id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Profile not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const getProfileById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `SELECT tp.*,
        COALESCE(json_agg(json_build_object('id', s.id, 'name', s.name))
          FILTER (WHERE s.id IS NOT NULL), '[]') AS subjects
       FROM tutor_profiles tp
       LEFT JOIN tutor_subjects ts ON ts.tutor_profile_id = tp.id
       LEFT JOIN subjects s ON s.id = ts.subject_id
       WHERE tp.user_id = $1
       GROUP BY tp.id`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Profile not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const updateProfile = async (req, res) => {
  const user_id = req.user.id;
  const { bio, hourly_rate, city, experience_years, is_available, subject_ids } = req.body;
  try {
    const result = await pool.query(
      `UPDATE tutor_profiles
       SET bio = $1, hourly_rate = $2, city = $3,
           experience_years = $4, is_available = $5, updated_at = NOW()
       WHERE user_id = $6
       RETURNING *`,
      [bio, hourly_rate, city, experience_years, is_available, user_id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Profile not found. Create one first." });
    }
    const profile = result.rows[0];
    if (subject_ids && subject_ids.length > 0) {
      await pool.query(
        "DELETE FROM tutor_subjects WHERE tutor_profile_id = $1",
        [profile.id]
      );
      await Promise.all(
        subject_ids.map((sid) =>
          pool.query(
            "INSERT INTO tutor_subjects (tutor_profile_id, subject_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
            [profile.id, sid]
          )
        )
      );
    }
    res.json({ message: "Profile updated", profile });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const getAllSubjects = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM subjects ORDER BY name");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { createProfile, getMyProfile, getProfileById, updateProfile, getAllSubjects };