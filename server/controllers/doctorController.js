const Doctor = require("../models/Doctor");
const User = require("../models/User");
const { generateSlots } = require("../utils/slotGenerator");
const Appointment = require("../models/Appointment"); // we'll create this in Step 3 below


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

exports.getAvailableSlots = async (req, res) => {
  try {
    const { id } = req.params; // doctor id
    const { date } = req.query; // e.g. "2026-09-01"

    if (!date) {
      return res.status(400).json({ message: "Date is required" });
    }

    const doctor = await Doctor.findById(id);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    // Check if doctor works on this day of week
    const dayOfWeek = new Date(date).toLocaleDateString("en-US", { weekday: "short" }); // "Mon", "Tue", etc.
    if (!doctor.workingDays.includes(dayOfWeek)) {
      return res.json({ slots: [], message: "Doctor not available on this day" });
    }

    // Generate all possible slots for that day
    const allSlots = generateSlots(doctor.workingHours, doctor.slotDuration);

    // Find already-booked slots for this doctor on this date
    const bookedAppointments = await Appointment.find({
      doctorId: id,
      date,
      status: { $ne: "cancelled" }
    });
    const bookedSlots = bookedAppointments.map(appt => appt.timeSlot);

    // Filter out booked slots
    const availableSlots = allSlots.filter(slot => !bookedSlots.includes(slot));

    res.json({ slots: availableSlots });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};