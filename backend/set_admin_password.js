require("dotenv").config();
const bcrypt = require("bcrypt");
const pool = require("./src/config/db");

const EMAIL = "admin@padhaisathi.com";
const PLAIN_PASSWORD = "YourAdminPassword123";

async function run() {
  try {
    const hashed = await bcrypt.hash(PLAIN_PASSWORD, 10);
    const result = await pool.query(
      "UPDATE users SET password = $1 WHERE email = $2 RETURNING id, email",
      [hashed, EMAIL]
    );

    if (result.rows.length === 0) {
      console.log("No user found. Inserting new admin user...");
      const insertResult = await pool.query(
        `INSERT INTO users (username, full_name, email, password, role, is_verified)
         VALUES ('admin', 'Admin User', $1, $2, 'admin', true)
         RETURNING id, email`,
        [EMAIL, hashed]
      );
      console.log("Admin user created:", insertResult.rows[0]);
    } else {
      console.log("Admin password updated successfully:", result.rows[0]);
    }

    console.log("Login with:");
    console.log("Email:", EMAIL);
    console.log("Password:", PLAIN_PASSWORD);
  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    await pool.end();
  }
}

run();
