import dns from "dns";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import User from "./models/User.js";

try {
  if (typeof dns.setServers === "function") dns.setServers(["8.8.8.8", "8.8.4.4"]);
} catch (e) {}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, ".env") });
dotenv.config();

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB.");

    const existingAdmin = await User.findOne({ username: "admin" });
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash("Admin@1234", salt);

    if (existingAdmin) {
      existingAdmin.passwordHash = passwordHash;
      await existingAdmin.save();
      console.log("Updated admin user password to: Admin@1234");
    } else {
      await User.create({
        username: "admin",
        email: "admin@subhancare.com",
        passwordHash,
        role: "Admin",
      });
      console.log("Created admin user with password: Admin@1234");
    }

    process.exit(0);
  } catch (err) {
    console.error("Error creating/resetting admin user:", err.message);
    process.exit(1);
  }
}

createAdmin();
