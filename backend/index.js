const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./src/config/routes/authRoutes");
const tutorProfileRoutes = require("./src/config/routes/tutorProfileRoutes");
const bookingRoutes = require("./src/config/routes/bookingRoutes");
const adminRoutes = require("./src/config/routes/adminRoutes");
const tutorSearchRoutes = require("./src/config/routes/tutorSearchRoutes");
const reviewRoutes = require("./src/config/routes/reviewRoutes");
const notificationRoutes = require("./src/config/routes/notificationRoutes");

const app = express();

// Middleware
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());

// Health check route
app.get("/", (req, res) => res.send("PadhaiSathi API running"));

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/tutor-profile", tutorProfileRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/tutors", tutorSearchRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/notifications", notificationRoutes);

// 404 handler for unmatched routes
app.use((req, res) => {
  res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal server error" });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));