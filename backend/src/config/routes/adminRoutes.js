const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  getStats, getAllUsers, getAllBookings,
  verifyUser, deleteUser, updateBooking
} = require("../controllers/adminController");

const adminOnly = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};

router.use(protect, adminOnly);
router.get("/stats", getStats);
router.get("/users", getAllUsers);
router.get("/bookings", getAllBookings);
router.patch("/users/:id/verify", verifyUser);
router.delete("/users/:id", deleteUser);
router.patch("/bookings/:id/status", updateBooking);

module.exports = router;