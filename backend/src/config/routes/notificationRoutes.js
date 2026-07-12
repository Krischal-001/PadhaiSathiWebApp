const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { getMyNotifications, markAllRead } = require("../controllers/notificationController");

router.get("/", protect, getMyNotifications);
router.patch("/read-all", protect, markAllRead);
module.exports = router;