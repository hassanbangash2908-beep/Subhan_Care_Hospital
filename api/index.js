import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import helloRouter from "../server/routes/hello.js";
import authRouter from "../server/routes/auth.js";
import patientRouter from "../server/routes/patients.js";
import doctorRouter from "../server/routes/doctors.js";
import staffRouter from "../server/routes/staff.js";
import appointmentsRouter from "../server/routes/appointments.js";
import clinicalRouter from "../server/routes/clinical.js";
import billingRouter from "../server/routes/billing.js";
import inventoryRouter from "../server/routes/inventory.js";
import reportsRouter from "../server/routes/reports.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Cached MongoDB Connection for Vercel Serverless Functions
let cachedDb = null;
const connectDB = async () => {
  if (cachedDb && mongoose.connection.readyState === 1) {
    return cachedDb;
  }
  
  const mongoUri = process.env.MONGO_URI || "mongodb+srv://hassannaryab_db_user:HASSANKHAN12345@cluster0.ke75mvu.mongodb.net/hmsdb?retryWrites=true&w=majority&appName=Cluster0";

  cachedDb = await mongoose.connect(mongoUri, {
    serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of hanging
    socketTimeoutMS: 45000,
  });
  return cachedDb;
};

app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error("MongoDB Atlas connection error:", err);
    return res.status(500).json({
      success: false,
      message: "Database connection failed. Please check MongoDB Atlas access."
    });
  }
});

// Serverless API Routes
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

// Fallback JSON error handler for Vercel to avoid raw HTML errors
app.use((err, req, res, next) => {
  console.error("Vercel Serverless Error:", err);
  res.status(500).json({
    success: false,
    message: err.message || "An unexpected server error occurred."
  });
});

export default app;
