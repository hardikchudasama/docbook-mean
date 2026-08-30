const User = require("../models/User");
const Doctor = require("../models/Doctor");
const Appointment = require("../models/Appointment");

// Get all users (patients + doctors), optionally filter by role
exports.getAllUsers = async (req, res) => {
  try {
    const { role } = req.query;
    const filter = role ? { role } : {};
    const users = await User.find(filter).select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all doctors with full details (already have adminGetAllDoctors in doctorController — reuse that)

// Deactivate/reactivate a user (soft delete approach — safer than hard delete)
exports.toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({ message: `User ${user.isActive ? "activated" : "deactivated"}`, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all appointments system-wide
exports.getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate("patientId", "name email")
      .populate({ path: "doctorId", populate: { path: "userId", select: "name" } })
      .sort({ createdAt: -1 });

    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Dashboard stats
exports.getStats = async (req, res) => {
  try {
    const totalDoctors = await Doctor.countDocuments();
    const totalPatients = await User.countDocuments({ role: "patient" });
    const totalAppointments = await Appointment.countDocuments();
    const completedAppointments = await Appointment.countDocuments({ status: "completed" });
    const cancelledAppointments = await Appointment.countDocuments({ status: "cancelled" });

    res.json({
      totalDoctors,
      totalPatients,
      totalAppointments,
      completedAppointments,
      cancelledAppointments
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};