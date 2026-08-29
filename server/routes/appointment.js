const express = require("express");
const router = express.Router();
const { bookAppointment, cancelAppointment, getMyAppointments, getDoctorAppointments, updateAppointmentStatus } = require("../controllers/appointmentController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.post("/", protect, authorize("patient"), bookAppointment);
router.patch("/:id/cancel", protect, cancelAppointment);
router.get("/my", protect, authorize("patient"), getMyAppointments);
router.get("/doctor/my", protect, authorize("doctor"), getDoctorAppointments);
router.patch("/:id/status", protect, authorize("doctor"), updateAppointmentStatus);
module.exports = router;