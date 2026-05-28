const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { createReview, getTutorReviews } = require("../controllers/reviewController");

router.post("/", protect, createReview);
router.get("/tutor/:tutor_id", protect, getTutorReviews);

module.exports = router;