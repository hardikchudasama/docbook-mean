const express = require("express");
const router = express.Router();
const {
  completeProfile,
  getMyProfile,
  updateMyProfile,
  getAllDoctors,
  getDoctorById,
  adminGetAllDoctors,
  deleteDoctor
} = require("../controllers/doctorController");
const { protect, authorize } = require("../middleware/authMiddleware");

// Public routes (for patients browsing doctors)
router.get("/", getAllDoctors);
router.get("/:id", getDoctorById);

// Doctor-only routes (protected)
router.post("/profile", protect, authorize("doctor"), completeProfile);
router.get("/profile/me", protect, authorize("doctor"), getMyProfile);
router.patch("/profile/me", protect, authorize("doctor"), updateMyProfile);

// Admin-only routes
router.get("/admin/all", protect, authorize("admin"), adminGetAllDoctors);
router.delete("/admin/:id", protect, authorize("admin"), deleteDoctor);

module.exports = router;