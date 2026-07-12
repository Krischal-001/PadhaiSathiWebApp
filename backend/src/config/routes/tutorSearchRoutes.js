const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { searchTutors, getTutorById } = require("../controllers/tutorSearchController");

router.get("/", protect, searchTutors);
router.get("/:id", protect, getTutorById);
module.exports = router;