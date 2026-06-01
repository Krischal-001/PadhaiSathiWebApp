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
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());

app.get("/", (req, res) => res.send("PadhaiSathi API running"));
app.use("/api/auth", authRoutes);
app.use("/api/tutor-profile", tutorProfileRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/tutors", tutorSearchRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/notifications", notificationRoutes);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

const availabilityRoutes = require("./src/config/routes/availabilityRoutes");
app.use("/api/availability", availabilityRoutes);