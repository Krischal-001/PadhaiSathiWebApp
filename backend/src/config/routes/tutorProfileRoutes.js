const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  createProfile,
  getMyProfile,
  getProfileById,
  updateProfile,
  getAllSubjects,
} = require("../controllers/tutorProfileController");

router.get("/subjects", protect, getAllSubjects);
router.post("/", protect, createProfile);
router.get("/me", protect, getMyProfile);
router.get("/:id", protect, getProfileById);
router.put("/", protect, updateProfile);
module.exports = router;