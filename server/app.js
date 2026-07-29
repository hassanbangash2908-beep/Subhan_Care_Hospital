import dns from "dns";
if (!process.env.VERCEL && !process.env.AWS_LAMBDA_FUNCTION_NAME) {
  try {
    if (typeof dns.setServers === "function") {
      dns.setServers(["8.8.8.8", "8.8.4.4"]);
    }
    if (typeof dns.setDefaultResultOrder === "function") {
      dns.setDefaultResultOrder("ipv4first");
    }
  } catch (dnsErr) {
    console.warn("DNS override skipped in serverless environment:", dnsErr.message);
  }
}
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import helloRouter from "./routes/hello.js";
import authRouter from "./routes/auth.js";
import patientRouter from "./routes/patients.js";
import doctorRouter from "./routes/doctors.js";
import staffRouter from "./routes/staff.js";
import appointmentsRouter from "./routes/appointments.js";
import clinicalRouter from "./routes/clinical.js";
import billingRouter from "./routes/billing.js";
import inventoryRouter from "./routes/inventory.js";
import reportsRouter from "./routes/reports.js";
import labtestsRouter from "./routes/labtests.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, ".env") });
dotenv.config();

const app = express();

// ─── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// ─── Health Check Routes ──────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({ success: true, message: "Subhan Care HMS Backend API is operational 🚀" });
});

app.get("/api", (req, res) => {
  res.json({ success: true, message: "Subhan Care HMS API endpoints operational" });
});

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use("/api", helloRouter);
app.use("/api/auth", authRouter);
app.use("/api/patients", patientRouter);
app.use("/api/doctors", doctorRouter);
app.use("/api/staff", staffRouter);
app.use("/api/appointments", appointmentsRouter);
app.use("/api/clinical", clinicalRouter);
app.use("/api/billing", billingRouter);
app.use("/api/inventory", inventoryRouter);
app.use("/api/reports", reportsRouter);
app.use("/api/labtests", labtestsRouter);

// ─── 404 Fallback Handler ─────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// Global Error Handler Middleware
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// Helper for DB Connection (Cached for Serverless)
let isConnected = false;
export const connectDB = async () => {
  if (isConnected && mongoose.connection.readyState === 1) {
    return;
  }
  const mongoUri =
    process.env.MONGO_URI ||
    "mongodb+srv://hassannaryab_db_user:HASSANKHAN12345@cluster0.ke75mvu.mongodb.net/hmsdb?retryWrites=true&w=majority&appName=Cluster0";
  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    console.log("✅ Connected to MongoDB Atlas");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    throw new Error(`Database Connection Error: ${err.message}`);
  }
};

export default app;
