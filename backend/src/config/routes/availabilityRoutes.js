const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  getMyAvailability,
  getTutorAvailability,
  addSlot,
  removeSlot,
  blockDate,
  unblockDate,
} = require("../controllers/availabilityController");

router.get("/my", protect, getMyAvailability);
router.get("/tutor/:tutor_id", protect, getTutorAvailability);
router.post("/", protect, addSlot);
router.delete("/:id", protect, removeSlot);
router.post("/block", protect, blockDate);
router.delete("/block/:id", protect, unblockDate);

module.exports = router;