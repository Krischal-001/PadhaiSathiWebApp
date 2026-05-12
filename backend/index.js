// Load environment variables from .env
require("dotenv").config();

// Import packages
const express = require("express");
const cors = require("cors");

// Create express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.send("Padhai Sathi Backend Running");
});

// Port
const PORT = process.env.PORT || 3000;

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});