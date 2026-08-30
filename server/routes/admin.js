const express = require("express");
const router = express.Router();
const {
  getAllUsers,
  toggleUserStatus,
  getAllAppointments,
  getStats
} = require("../controllers/adminController");
const { adminGetAllDoctors, deleteDoctor } = require("../controllers/doctorController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.use(protect, authorize("admin")); // applies to all routes below

router.get("/stats", getStats);
router.get("/users", getAllUsers);
router.patch("/users/:id/toggle-status", toggleUserStatus);
router.get("/doctors", adminGetAllDoctors);
router.delete("/doctors/:id", deleteDoctor);
router.get("/appointments", getAllAppointments);

module.exports = router;