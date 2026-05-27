const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./src/config/routes/authRoutes");
const tutorProfileRoutes = require("./src/config/routes/tutorProfileRoutes");
const bookingRoutes = require("./src/config/routes/bookingRoutes");

const app = express();

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Padhai Sathi backend running");
});

app.use("/api/auth", authRoutes);
app.use("/api/tutor-profile", tutorProfileRoutes);
app.use("/api/bookings", bookingRoutes);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});