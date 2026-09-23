# DocBook — Real-Time Doctor Appointment Booking System

A full-stack MEAN application for booking doctor appointments, built with a focus on **conflict-free scheduling** and **real-time availability updates** across multiple concurrent users.

🔗 **Live Demo:** [docbook-mean.vercel.app](https://docbook-mean-hy6k7ayuv-hardiks-projects-741747a9.vercel.app)
🔗 **Backend API:** [docbook-backend-gmer.onrender.com](https://docbook-backend-gmer.onrender.com)

> **Note:** the backend is hosted on Render's free tier, which spins down after inactivity. The first request after idle time may take 30–50 seconds to respond while the server wakes up.

---

## Demo Credentials

Feel free to explore using these accounts, or register your own:

| Role | Email | Password |
|------|-------|----------|
| Patient | patient.demo@docbook.com | Demo@1234 |
| Doctor | doctor.demo@docbook.com | Demo@1234 |
| Admin | admin.demo@docbook.com | Demo@1234 |

> This is a shared public demo — please be considerate, as others may be exploring the same accounts.

## Screenshots

### Login
![Login Page](screenshots/login.png)

### Patient Dashboard — Doctor Search
![Patient Dashboard - Doctor Search](screenshots/patient-dashboard.png)

### Patient — My Appointments
![Patient My Appointments](screenshots/patient-appointments.png)

### Patient — Slot-wise Appointment Booking
![Patient Appointment Booking - Slot Wise](screenshots/patient-appointment-booking-slot-wise.png)

### Patient — Appointment Booked Successfully
![Appointment Booked Successfully](screenshots/appointment-booked-success.png)

### Patient — Booking Confirmation Email
![Booking Confirmation Email](screenshots/booking-confirmation-email.png)

### Doctor Dashboard
![Doctor Dashboard](screenshots/doctor-dashboard.png)

### Admin Dashboard — Overview
![Admin Dashboard Overview](screenshots/admin-dashboard.png)

### Admin Dashboard — Users
![Admin Dashboard Users](screenshots/admin-dashboard-users.png)

### Admin Dashboard — All Appointments
![Admin Dashboard All Appointments](screenshots/admin-dashboard-all-appointments.png)

---

## Key Features

### For Patients
- Search and browse doctors by specialty
- View doctor profiles, qualifications, and consultation fees
- Real-time slot availability — booked slots disappear instantly for all viewers, no refresh needed
- Book, view, and cancel appointments
- Email confirmation on booking and cancellation

### For Doctors
- Complete a professional profile after registration (specialty, experience, fee, bio, availability)
- View and manage appointments (mark completed, no-show, or cancel with reason)
- Dashboard showing all upcoming and past appointments

### For Admins
- Dashboard with system-wide stats (total doctors, patients, appointments, completion/cancellation rates)
- Manage doctors (view, remove — soft-delete preserves appointment history)
- Manage users (activate/deactivate accounts)
- View all appointments system-wide with sorting, search, and status filtering

### Engineering Highlights
- **Conflict-free booking** — MongoDB transactions plus a database-level compound unique index prevent two patients from ever double-booking the same slot, even under concurrent requests
- **HTTP-based email delivery** — switched from SMTP (Nodemailer) to Resend's HTTP API after discovering the hosting provider blocks outbound SMTP ports on its free tier; this is also a more reliable pattern for serverless/PaaS deployments generally
- **Real-time sync** — Socket.io broadcasts slot changes to every connected client instantly; the booking client filters out its own echoed event to avoid a false "someone else booked this" message
- **Data integrity** — doctors are soft-deleted (not hard-deleted) so historical appointment records remain valid; the UI gracefully handles orphaned references
- **Role-based access control** — JWT authentication with route guards enforced on both frontend and backend for Patient, Doctor, and Admin roles
- **Non-blocking email** — booking/cancellation emails are sent asynchronously so a slow or failed email service never blocks the booking response

---

## Tech Stack

**Frontend:** Angular 20, PrimeNG, PrimeFlex, Socket.io-client
**Backend:** Node.js, Express, Socket.io, JWT, bcrypt, Resend
**Database:** MongoDB Atlas (Mongoose ODM)
**Deployment:** Vercel (frontend), Render (backend)

---

## Architecture Notes

### Preventing Double-Booking
Booking a slot runs inside a MongoDB session transaction: the server checks for an existing non-cancelled appointment matching the same doctor, date, and time slot *before* creating the new one. If a conflict is found mid-transaction, it aborts and returns a 409. A compound unique index on `(doctorId, date, timeSlot)` — scoped to exclude cancelled appointments — acts as a second line of defense at the database level.

### Real-Time Updates
When a booking succeeds, the server emits a `slotBooked` event over Socket.io to all connected clients, including the one that made the booking. Each client tags its own socket ID on outgoing booking requests and checks incoming events against it, so the booking client shows a success message while every other client viewing that doctor's calendar sees the slot disappear instantly.

### Soft-Delete for Referential Integrity
Removing a doctor from the Admin dashboard sets `isActive: false` rather than deleting the document. This keeps every past appointment's doctor reference valid, and the patient's appointment history renders correctly instead of breaking on a missing reference.

---

## Local Setup

### Prerequisites
- Node.js and npm
- MongoDB Atlas account (or local MongoDB instance)
- Resend account and API key (for email notifications)

### Backend
\`\`\`bash
cd server
npm install
\`\`\`

Create a `.env` file in `server/`:
\`\`\`env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
CLIENT_URL=http://localhost:4200
RESEND_API_KEY=your_resend_api_key
\`\`\`

\`\`\`bash
npm run dev
\`\`\`

### Frontend
\`\`\`bash
cd client
npm install
ng serve
\`\`\`

Visit `http://localhost:4200`.

---

## Project Structure

\`\`\`
docbook-mean/
├── server/
│   ├── models/          # Mongoose schemas (User, Doctor, Appointment)
│   ├── controllers/      # Route handlers
│   ├── routes/           # Express routes
│   ├── middleware/        # Auth middleware (JWT verification, role guards)
│   ├── services/          # Email service (Resend)
│   └── server.js
├── client/
│   └── src/app/
│       ├── core/          # Services, guards, interceptors
│       ├── features/       # Auth, patient, doctor, admin feature modules
│       └── shared/         # Shared layout (navbar)
└── screenshots/           # README images
\`\`\`

---

## Future Enhancements
- Payment integration (Razorpay/Stripe)
- Doctor ratings and reviews
- Appointment reminder emails via scheduled cron job
- Video consultation links

## 👨‍💻 Author

**Hardik M. Chudasama**

Full-Stack Developer | MEAN Stack

### Skills Demonstrated
Angular | TypeScript | JavaScript | RxJS
Node.js | Express.js | MongoDB | Mongoose
Socket.io | JWT Authentication | REST APIs
PrimeNG | Nodemailer | Git | GitHub