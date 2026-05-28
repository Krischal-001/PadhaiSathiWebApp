const pool = require("../db");

const searchTutors = async (req, res) => {
  const { subject, city, min_rate, max_rate, search } = req.query;
  try {
    let query = `
      SELECT tp.*, u.username, u.full_name, u.email, u.is_verified,
        COALESCE(json_agg(json_build_object('id', s.id, 'name', s.name))
          FILTER (WHERE s.id IS NOT NULL), '[]') AS subjects
      FROM tutor_profiles tp
      JOIN users u ON u.id = tp.user_id
      LEFT JOIN tutor_subjects ts ON ts.tutor_profile_id = tp.id
      LEFT JOIN subjects s ON s.id = ts.subject_id
      WHERE 1=1
    `;
    const params = [];
    let i = 1;

    if (city) { query += ` AND LOWER(tp.city) LIKE LOWER($${i++})`; params.push(`%${city}%`); }
    if (min_rate) { query += ` AND tp.hourly_rate >= $${i++}`; params.push(Number(min_rate)); }
    if (max_rate) { query += ` AND tp.hourly_rate <= $${i++}`; params.push(Number(max_rate)); }
    if (search) {
      query += ` AND (LOWER(u.username) LIKE LOWER($${i}) OR LOWER(COALESCE(u.full_name,'')) LIKE LOWER($${i}) OR LOWER(tp.bio) LIKE LOWER($${i++}))`;
      params.push(`%${search}%`);
    }

    query += ` GROUP BY tp.id, u.id ORDER BY tp.hourly_rate ASC`;
    const result = await pool.query(query, params);

    let rows = result.rows;
    if (subject) {
      rows = rows.filter(t =>
        t.subjects.some(s => s.name.toLowerCase().includes(subject.toLowerCase()))
      );
    }
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const getTutorById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `SELECT tp.*, u.username, u.full_name, u.email, u.is_verified,
        COALESCE(json_agg(json_build_object('id', s.id, 'name', s.name))
          FILTER (WHERE s.id IS NOT NULL), '[]') AS subjects
       FROM tutor_profiles tp
       JOIN users u ON u.id = tp.user_id
       LEFT JOIN tutor_subjects ts ON ts.tutor_profile_id = tp.id
       LEFT JOIN subjects s ON s.id = ts.subject_id
       WHERE tp.id = $1
       GROUP BY tp.id, u.id`,
      [id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: "Not found" });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { searchTutors, getTutorById };