/* ================= LOAD ENV ================= */

import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

/* ================= FORCE GOOGLE DNS ================= */

import dns from "dns";
dns.setServers(["8.8.8.8", "8.8.4.4"]);

/* ================= IMPORTS ================= */

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";

/* ================= ROUTES ================= */

import authRoutes from "./routes/authRoutes.js";
import donorRoutes from "./routes/donorRoutes.js";
import requestRoutes from "./routes/requestRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import bloodRoutes from "./routes/bloodRoutes.js";
import alertRoutes from "./routes/alertRoutes.js";
import certificateRoutes from "./routes/certificateRoutes.js";
import analyticsRoutes from "./routes/analytics.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import campRoutes from "./routes/campRoutes.js";
import donationRoutes from "./routes/donationRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import cooldownRoutes from "./routes/cooldownRoutes.js";
import publicStatsRoutes from "./routes/publicStatsRoutes.js";
import nearbyRoutes from "./routes/nearbyRoutes.js";
import { startEligibilityScheduler } from "./jobs/eligibilityScheduler.js";
/* ================= APP INIT ================= */

const app = express();
const server = http.createServer(app);

/* ================= SOCKET.IO ================= */

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", /^http:\/\/192\.168\./, /^http:\/\/10\./],
    methods: ["GET", "POST"],
    credentials: true
  }
});

/* Make io available everywhere */

app.set("io", io);

io.on("connection", (socket) => {

  // Join personal room for targeted notifications
  socket.on("joinRoom", (userId) => {
    if (userId) socket.join(userId);
  });

});

/* ================= MIDDLEWARE ================= */

app.use(cors({
  origin: ["http://localhost:3000", "http://10.152.195.252:3000", /^http:\/\/192\.168\./, /^http:\/\/10\./]
}));
app.use(express.json());

/* ================= DATABASE ================= */

mongoose.connect(process.env.MONGO_URI, {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000
})
.then(() => {
  console.log("✅ MongoDB Connected Successfully");
  startEligibilityScheduler(io);
})
.catch((error) => {
  console.log("❌ MongoDB Connection Error:", error.message);
  process.exit(1);
});

/* ================= ROUTES ================= */

app.get("/", (req, res) => {
  res.send("🩸 Blood Connect Portal API Running...");
});

app.use("/api/auth", authRoutes);
app.use("/api/donor", donorRoutes);
app.use("/api/request", requestRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/user", userRoutes);
app.use("/api/blood", bloodRoutes);
app.use("/api", alertRoutes);
app.use("/api/certificates", certificateRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/camps", campRoutes);
app.use("/api/donations", donationRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/cooldown", cooldownRoutes);
app.use("/api/public/stats", publicStatsRoutes);
app.use("/api/nearby", nearbyRoutes);
/* ================= START SERVER ================= */

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});