const pool = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const register = async (req, res) => {
  try {
    const { username, full_name, email, password, role, phone } = req.body;
    
    const validRoles = ["student", "parent", "tutor", "institute"];
    if (!username || !email || !password || !role) {
      return res.status(400).json({ message: "username, email, password and role are required" });
    }
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: "Role must be student, parent, tutor, or institute" });
    }

    const exists = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
    if (exists.rows.length > 0) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO users (username, full_name, email, password, role, phone)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, username, full_name, email, role, phone`,
      [username, full_name || username, email, hashed, role, phone || null]
    );
    const user = result.rows[0];

    // Create role-specific profile automatically
    if (role === "student") {
      await pool.query(
        "INSERT INTO student_profiles (user_id) VALUES ($1) ON CONFLICT DO NOTHING",
        [user.id]
      );
    } else if (role === "parent") {
      await pool.query(
        "INSERT INTO parent_profiles (user_id) VALUES ($1) ON CONFLICT DO NOTHING",
        [user.id]
      );
    } else if (role === "institute") {
      const name = req.body.institute_name || username;
      await pool.query(
        "INSERT INTO institute_profiles (user_id, institute_name) VALUES ($1, $2) ON CONFLICT DO NOTHING",
        [user.id, name]
      );
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    res.status(201).json({ message: "Registered successfully", token, user });
  } catch (err) {
    console.error("Register error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (result.rows.length === 0) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        username: user.username,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar_url: user.avatar_url,
      },
    });
  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

const getMe = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, username, full_name, email, role, phone, avatar_url, is_verified, created_at FROM users WHERE id = $1",
      [req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: "User not found" });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { register, login, getMe };