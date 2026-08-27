const express = require("express");
const router = express.Router();
const { bookAppointment, cancelAppointment, getMyAppointments } = require("../controllers/appointmentController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.post("/", protect, authorize("patient"), bookAppointment);
router.patch("/:id/cancel", protect, cancelAppointment);
router.get("/my", protect, authorize("patient"), getMyAppointments);

module.exports = router;