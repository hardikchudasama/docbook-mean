const mongoose = require("mongoose");
const Appointment = require("../models/Appointment");
const Doctor = require("../models/Doctor");

exports.bookAppointment = async (req, res) => {
  const { doctorId, date, timeSlot, reason } = req.body;
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
    io.emit("slotBooked", { doctorId, date, timeSlot });

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