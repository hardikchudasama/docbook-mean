const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
  date: { type: String, required: true }, // "2026-09-01" format for simple string matching
  timeSlot: { type: String, required: true }, // "10:00"
  status: { type: String, enum: ["confirmed", "cancelled", "completed", "no-show"], default: "confirmed" },
  reason: { type: String },
  cancelReason: { type: String },
}, { timestamps: true });

// Prevent double-booking at the database level too (extra safety net)
appointmentSchema.index({ doctorId: 1, date: 1, timeSlot: 1 }, { unique: true, partialFilterExpression: { status: { $ne: "cancelled" } } });

module.exports = mongoose.model("Appointment", appointmentSchema);