const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  specialty: { type: String, required: true },
  qualification: { type: String, required: true },
  experience: { type: Number, required: true }, // years
  consultationFee: { type: Number, required: true },
  bio: { type: String },
  workingDays: { type: [String], default: ["Mon", "Tue", "Wed", "Thu", "Fri"] },
  workingHours: {
    start: { type: String, default: "10:00" },
    end: { type: String, default: "17:00" }
  },
  slotDuration: { type: Number, default: 30 }, // minutes
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model("Doctor", doctorSchema);