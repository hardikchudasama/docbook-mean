const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendBookingConfirmation = async (toEmail, details) => {
  const { patientName, doctorName, date, timeSlot, specialty, fee } = details;

  const mailOptions = {
    from: `"DocBook" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: "Appointment Confirmed - DocBook",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
        <h2 style="color: #16a34a;">Appointment Confirmed</h2>
        <p>Hi ${patientName},</p>
        <p>Your appointment has been successfully booked. Here are the details:</p>
        <table style="width: 100%; border-collapse: collapse; margin: 1rem 0;">
          <tr><td style="padding: 8px 0; color: #64748b;">Doctor</td><td style="padding: 8px 0; font-weight: bold;">Dr. ${doctorName}</td></tr>
          <tr><td style="padding: 8px 0; color: #64748b;">Specialty</td><td style="padding: 8px 0;">${specialty}</td></tr>
          <tr><td style="padding: 8px 0; color: #64748b;">Date</td><td style="padding: 8px 0;">${date}</td></tr>
          <tr><td style="padding: 8px 0; color: #64748b;">Time</td><td style="padding: 8px 0;">${timeSlot}</td></tr>
          <tr><td style="padding: 8px 0; color: #64748b;">Fee</td><td style="padding: 8px 0;">₹${fee}</td></tr>
        </table>
        <p>Please arrive 10 minutes early. If you need to cancel, please do so at least a few hours in advance.</p>
        <p style="color: #94a3b8; font-size: 0.85rem; margin-top: 2rem;">— The DocBook Team</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

const sendCancellationEmail = async (toEmail, details) => {
  const { patientName, doctorName, date, timeSlot, reason } = details;

  const mailOptions = {
    from: `"DocBook" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: "Appointment Cancelled - DocBook",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
        <h2 style="color: #ef4444;">Appointment Cancelled</h2>
        <p>Hi ${patientName},</p>
        <p>Your appointment with <strong>Dr. ${doctorName}</strong> on <strong>${date} at ${timeSlot}</strong> has been cancelled.</p>
        ${reason ? `<p style="color: #64748b;">Reason: ${reason}</p>` : ''}
        <p>You can book a new appointment anytime through DocBook.</p>
        <p style="color: #94a3b8; font-size: 0.85rem; margin-top: 2rem;">— The DocBook Team</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendBookingConfirmation, sendCancellationEmail };