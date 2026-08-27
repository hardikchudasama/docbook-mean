const Doctor = require("../models/Doctor");
const User = require("../models/User");

// Doctor completes their profile (after registering as role: doctor)
exports.completeProfile = async (req, res) => {
  try {
    const { specialty, qualification, experience, consultationFee, bio, workingDays, workingHours, slotDuration } = req.body;

    // req.user comes from auth middleware (decoded JWT)
    const existingProfile = await Doctor.findOne({ userId: req.user.id });
    if (existingProfile) {
      return res.status(400).json({ message: "Profile already exists" });
    }

    const doctor = await Doctor.create({
      userId: req.user.id,
      specialty,
      qualification,
      experience,
      consultationFee,
      bio,
      workingDays,
      workingHours,
      slotDuration
    });

    res.status(201).json(doctor);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Check if logged-in doctor has completed their profile
exports.getMyProfile = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user.id }).populate("userId", "name email phone");
    if (!doctor) {
      return res.status(404).json({ message: "Profile not found" });
    }
    res.json(doctor);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update doctor's own profile
exports.updateMyProfile = async (req, res) => {
  try {
    const doctor = await Doctor.findOneAndUpdate(
      { userId: req.user.id },
      req.body,
      { new: true }
    );
    res.json(doctor);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Public: Get all doctors (for patient search page)
exports.getAllDoctors = async (req, res) => {
  try {
    const { specialty, search } = req.query;
    let filter = {};

    if (specialty) filter.specialty = specialty;

    let doctors = await Doctor.find(filter).populate("userId", "name email phone");

    // Optional name search (since name lives in User, filter after populate)
    if (search) {
      doctors = doctors.filter(doc =>
        doc.userId.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    res.json(doctors);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Public: Get single doctor by ID (for doctor profile page)
exports.getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id).populate("userId", "name email phone");
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }
    res.json(doctor);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin: Get all doctors with full details (for admin management table)
exports.adminGetAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find().populate("userId", "name email phone");
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin: Delete/deactivate a doctor
exports.deleteDoctor = async (req, res) => {
  try {
    await Doctor.findByIdAndDelete(req.params.id);
    res.json({ message: "Doctor removed" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};