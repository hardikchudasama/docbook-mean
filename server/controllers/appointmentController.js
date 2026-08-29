const mongoose = require("mongoose");
const Appointment = require("../models/Appointment");
const { sendBookingConfirmation, sendCancellationEmail } = require("../services/emailService");
const Doctor = require("../models/Doctor");
const User = require("../models/User");

exports.bookAppointment = async (req, res) => {
  const { doctorId, date, timeSlot, reason, socketId } = req.body;
  const patientId = req.user.id; // from JWT via protect middleware

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Check if this exact slot is already booked (inside the transaction)
    const existing = await Appointment.findOne({
      doctorId, date, timeSlot, status: { $ne: "cancelled" }
    }).session(session);

    if (existing) {
      await session.abortTransaction();
      session.endSession();
      return res.status(409).json({ message: "This slot is already booked. Please choose another." });
    }

    const appointment = await Appointment.create(
      [{ patientId, doctorId, date, timeSlot, reason }],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    // Real-time: notify anyone viewing this doctor's slots for this date
    const io = req.app.get("io");
    io.emit("slotBooked", { doctorId, date, timeSlot, emittedBy: socketId });

    // Send confirmation email — non-blocking, don't await
    (async () => {
      try {
        const patient = await User.findById(patientId);
        const doctor = await Doctor.findById(doctorId).populate("userId", "name");
        await sendBookingConfirmation(patient.email, {
          patientName: patient.name,
          doctorName: doctor.userId.name,
          specialty: doctor.specialty,
          date,
          timeSlot,
          fee: doctor.consultationFee
        });
      } catch (emailErr) {
        console.error("Failed to send booking email:", emailErr.message);
      }
    })();

    res.status(201).json(appointment[0]);
  } catch (err) {
    await session.abortTransaction();
    session.endSession();

    // Handle the DB-level unique index rejection (extra safety net catching it too)
    if (err.code === 11000) {
      return res.status(409).json({ message: "This slot is already booked. Please choose another." });
    }

    res.status(500).json({ message: err.message });
  }
};

exports.cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // Only the patient who booked it (or admin) can cancel
    if (appointment.patientId.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to cancel this appointment" });
    }

    appointment.status = "cancelled";
    await appointment.save();

    const io = req.app.get("io");
    io.emit("slotCancelled", { doctorId: appointment.doctorId, date: appointment.date, timeSlot: appointment.timeSlot });

    res.json({ message: "Appointment cancelled", appointment });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMyAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ patientId: req.user.id })
      .populate({ path: "doctorId", populate: { path: "userId", select: "name" } })
      .sort({ date: -1 });

    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all appointments for the logged-in doctor
exports.getDoctorAppointments = async (req, res) => {
  try {
    const doctorProfile = await Doctor.findOne({ userId: req.user.id });
    if (!doctorProfile) {
      return res.status(404).json({ message: "Doctor profile not found" });
    }

    const appointments = await Appointment.find({ doctorId: doctorProfile._id })
      .populate("patientId", "name email phone")
      .sort({ date: 1, timeSlot: 1 });

    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Doctor updates appointment status (completed / no-show)
exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.body; // "completed" or "no-show"

    if (!["completed", "no-show"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    const doctorProfile = await Doctor.findOne({ userId: req.user.id });
    if (!doctorProfile || appointment.doctorId.toString() !== doctorProfile._id.toString()) {
      return res.status(403).json({ message: "Not authorized to update this appointment" });
    }

    appointment.status = status;
    await appointment.save();

    res.json({ message: "Status updated", appointment });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.cancelAppointment = async (req, res) => {
  try {
    const { reason } = req.body;
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    const isPatientOwner = appointment.patientId.toString() === req.user.id;
    const isAdmin = req.user.role === "admin";

    let isDoctorOwner = false;
    if (req.user.role === "doctor") {
      const doctorProfile = await Doctor.findOne({ userId: req.user.id });
      isDoctorOwner = doctorProfile && appointment.doctorId.toString() === doctorProfile._id.toString();
    }

    if (!isPatientOwner && !isAdmin && !isDoctorOwner) {
      return res.status(403).json({ message: "Not authorized to cancel this appointment" });
    }

    appointment.status = "cancelled";
    if (reason) appointment.cancelReason = reason;
    await appointment.save();

    const io = req.app.get("io");
    io.emit("slotCancelled", { doctorId: appointment.doctorId, date: appointment.date, timeSlot: appointment.timeSlot });

    // Send cancellation email — non-blocking
    (async () => {
      try {
        const patient = await User.findById(appointment.patientId);
        const doctor = await Doctor.findById(appointment.doctorId).populate("userId", "name");
        await sendCancellationEmail(patient.email, {
          patientName: patient.name,
          doctorName: doctor.userId.name,
          date: appointment.date,
          timeSlot: appointment.timeSlot,
          reason: appointment.cancelReason
        });
      } catch (emailErr) {
        console.error("Failed to send cancellation email:", emailErr.message);
      }
    })();

    res.json({ message: "Appointment cancelled", appointment });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};