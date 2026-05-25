const pool = require("../config/db");
const bcrypt = require("bcrypt");

const registerUser = async (req, res) => {
  try {

    // Get data from frontend
    const { username, email, password } = req.body;

    // Check if email already exists
    const existingUser = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    // Hash password
    const saltRounds = 10;

    const hashedPassword = await bcrypt.hash(
      password,
      saltRounds
    );

    // Insert user into database
    const newUser = await pool.query(
      `INSERT INTO users 
      (username, email, password)
      VALUES ($1, $2, $3)
      RETURNING id, username, email`,
      [username, email, hashedPassword]
    );

    // Send success response
    res.status(201).json({
      message: "User registered successfully",
      user: newUser.rows[0],
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

module.exports = {
  registerUser,
};