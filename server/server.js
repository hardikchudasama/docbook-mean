require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL }
});

app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json());

app.use("/api/auth", require("./routes/auth"));
app.use("/api/doctors", require("./routes/doctor"));
app.use("/api/appointments", require("./routes/appointment"));
app.use("/api/admin", require("./routes/admin"));

app.set("io", io);

app.get("/api/health", (req, res) => res.json({ status: "Server is running" }));

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);
  socket.on("disconnect", () => console.log("Client disconnected:", socket.id));
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Atlas connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));