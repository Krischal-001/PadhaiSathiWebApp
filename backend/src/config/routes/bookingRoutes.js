const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  createBooking,
  getMyBookings,
  getBookingById,
  updateBookingStatus,
  getTutorBookings,
} = require("../controllers/bookingController");

router.post("/", protect, createBooking);
router.get("/my", protect, getMyBookings);
router.get("/tutor/:tutor_id", protect, getTutorBookings);
router.get("/:id", protect, getBookingById);
router.patch("/:id/status", protect, updateBookingStatus);
module.exports = router;