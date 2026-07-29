import dns from "dns";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";

import User from "./models/User.js";
import Patient from "./models/Patient.js";
import Doctor from "./models/Doctor.js";
import Staff from "./models/Staff.js";
import Appointment from "./models/Appointment.js";
import Consultation from "./models/Consultation.js";
import Prescription from "./models/Prescription.js";
import Invoice from "./models/Invoice.js";
import InventoryItem from "./models/InventoryItem.js";
import LabTest from "./models/LabTest.js";

try {
  if (typeof dns.setServers === "function") dns.setServers(["8.8.8.8", "8.8.4.4"]);
} catch (e) {}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, ".env") });
dotenv.config();

async function seedData() {
  try {
    console.log("🌱 Connecting to MongoDB Atlas for Full Data Seeding...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB Atlas.");

    // Clear existing collections for a fresh seed
    await Patient.deleteMany({});
    await Doctor.deleteMany({});
    await Staff.deleteMany({});
    await Appointment.deleteMany({});
    await Consultation.deleteMany({});
    await Prescription.deleteMany({});
    await Invoice.deleteMany({});
    await InventoryItem.deleteMany({});
    await LabTest.deleteMany({});
    console.log("🧹 Existing sample records cleared.");

    // 1. Seed Doctors
    const doctorData = [
      {
        name: "Dr. Ali Raza",
        specialization: "Cardiology",
        licenseNumber: "PMC-99881",
        contactInfo: "+92 300 1234567",
        consultationFee: 2500,
        schedule: {
          workingDays: ["Monday", "Wednesday", "Friday"],
          timeSlots: ["09:00 - 10:00", "11:00 - 12:00", "14:00 - 15:00"],
        },
        status: "Active",
      },
      {
        name: "Dr. Sara Ahmed",
        specialization: "Pediatrics",
        licenseNumber: "PMC-77662",
        contactInfo: "+92 321 9876543",
        consultationFee: 2000,
        schedule: {
          workingDays: ["Tuesday", "Thursday", "Saturday"],
          timeSlots: ["10:00 - 11:00", "13:00 - 14:00", "16:00 - 17:00"],
        },
        status: "Active",
      },
      {
        name: "Dr. Usman Khan",
        specialization: "Orthopedics",
        licenseNumber: "PMC-55443",
        contactInfo: "+92 333 4567890",
        consultationFee: 3000,
        schedule: {
          workingDays: ["Monday", "Tuesday", "Thursday"],
          timeSlots: ["11:00 - 12:00", "15:00 - 16:00"],
        },
        status: "Active",
      },
      {
        name: "Dr. Fatima Noor",
        specialization: "Gynecology",
        licenseNumber: "PMC-33224",
        contactInfo: "+92 301 6543210",
        consultationFee: 2200,
        schedule: {
          workingDays: ["Wednesday", "Friday", "Saturday"],
          timeSlots: ["09:30 - 10:30", "14:30 - 15:30"],
        },
        status: "Active",
      },
    ];

    const insertedDoctors = await Doctor.insertMany(doctorData);
    console.log(`✅ Seeded ${insertedDoctors.length} Doctors.`);

    // 2. Seed Patients
    const patientData = [
      {
        name: "Zubair Hashmi",
        dob: new Date("1979-05-14"),
        gender: "Male",
        cnic: "35202-1234567-1",
        contact: "+92 312 1112233",
        address: "Gulberg III, Lahore",
        emergencyContact: "+92 300 0001111",
        emergencyContactRelationship: "Brother",
        bloodGroup: "B+",
        allergies: ["Penicillin"],
        maritalStatus: "Married",
        occupation: "Business",
        status: "Active",
      },
      {
        name: "Ayesha Malik",
        dob: new Date("1995-11-20"),
        gender: "Female",
        cnic: "42101-7654321-2",
        contact: "+92 305 4445566",
        address: "DHA Phase 5, Karachi",
        emergencyContact: "+92 321 2223333",
        emergencyContactRelationship: "Spouse",
        bloodGroup: "O+",
        allergies: ["Dust", "Pollen"],
        maritalStatus: "Married",
        occupation: "Software Engineer",
        status: "Active",
      },
      {
        name: "Tariq Mahmood",
        dob: new Date("1966-03-08"),
        gender: "Male",
        cnic: "61101-9876543-3",
        contact: "+92 334 7778899",
        address: "F-8/2, Islamabad",
        emergencyContact: "+92 333 4445555",
        emergencyContactRelationship: "Son",
        bloodGroup: "A+",
        allergies: [],
        maritalStatus: "Married",
        occupation: "Retired Officer",
        status: "Active",
      },
      {
        name: "Saima Bilal",
        dob: new Date("1990-08-12"),
        gender: "Female",
        cnic: "37405-5432167-4",
        contact: "+92 345 8889900",
        address: "Saddar, Rawalpindi",
        emergencyContact: "+92 345 1112222",
        emergencyContactRelationship: "Mother",
        bloodGroup: "AB+",
        allergies: ["Sulfa Drugs"],
        maritalStatus: "Single",
        occupation: "Teacher",
        status: "Active",
      },
    ];

    const insertedPatients = await Patient.insertMany(patientData);
    console.log(`✅ Seeded ${insertedPatients.length} Patients.`);

    // 3. Seed Staff
    const staffData = [
      {
        staffId: "STF-201",
        name: "Bilal Chaudhry",
        role: "Receptionist",
        department: "Front Desk",
        contactInfo: "+92 322 1010101",
        email: "bilal.reception@subhancare.com",
        status: "Active",
      },
      {
        staffId: "STF-202",
        name: "Nida Yasir",
        role: "Billing Staff",
        department: "Accounts & Billing",
        contactInfo: "+92 331 2020202",
        email: "nida.billing@subhancare.com",
        status: "Active",
      },
      {
        staffId: "STF-203",
        name: "Kamran Siddiqui",
        role: "Pharmacist",
        department: "Pharmacy",
        contactInfo: "+92 308 3030303",
        email: "kamran.pharmacy@subhancare.com",
        status: "Active",
      },
    ];
    await Staff.insertMany(staffData);
    console.log(`✅ Seeded ${staffData.length} Staff members.`);

    // 4. Seed Appointments
    const today = new Date();
    const appointmentData = [
      {
        patientId: insertedPatients[0]._id,
        patientName: insertedPatients[0].name,
        doctorId: insertedDoctors[0]._id,
        doctorName: insertedDoctors[0].name,
        date: today,
        timeSlot: "09:00 - 10:00",
        reason: "Routine Cardiac Checkup",
        status: "Scheduled",
      },
      {
        patientId: insertedPatients[1]._id,
        patientName: insertedPatients[1].name,
        doctorId: insertedDoctors[1]._id,
        doctorName: insertedDoctors[1].name,
        date: today,
        timeSlot: "10:00 - 11:00",
        reason: "Persistent Cough & Fever",
        status: "Completed",
      },
      {
        patientId: insertedPatients[2]._id,
        patientName: insertedPatients[2].name,
        doctorId: insertedDoctors[2]._id,
        doctorName: insertedDoctors[2].name,
        date: new Date(today.getTime() + 86400000),
        timeSlot: "11:00 - 12:00",
        reason: "Knee Joint Pain",
        status: "Scheduled",
      },
      {
        patientId: insertedPatients[3]._id,
        patientName: insertedPatients[3].name,
        doctorId: insertedDoctors[3]._id,
        doctorName: insertedDoctors[3].name,
        date: new Date(today.getTime() - 86400000),
        timeSlot: "14:30 - 15:30",
        reason: "Antenatal Consultation",
        status: "Completed",
      },
    ];

    const insertedAppointments = await Appointment.insertMany(appointmentData);
    console.log(`✅ Seeded ${insertedAppointments.length} Appointments.`);

    // 5. Seed Consultations & Prescriptions
    const consultationData = [
      {
        appointmentId: insertedAppointments[1]._id,
        patientId: insertedPatients[1]._id,
        doctorId: insertedDoctors[1]._id,
        doctorName: insertedDoctors[1].name,
        symptoms: "High fever (102 F), dry cough, chest tightness",
        diagnosis: "Acute Bronchitis",
        notes: "Advised bed rest for 3 days and humidified air intake.",
      },
    ];
    const insertedConsultations = await Consultation.insertMany(consultationData);

    const prescriptionData = [
      {
        consultationId: insertedConsultations[0]._id,
        patientId: insertedPatients[1]._id,
        patientName: insertedPatients[1].name,
        doctorId: insertedDoctors[1]._id,
        doctorName: insertedDoctors[1].name,
        medications: [
          { name: "Augmentin 625mg", dosage: "1 tablet", frequency: "Twice daily", duration: "5 days" },
          { name: "Panadol Extra", dosage: "2 tablets", frequency: "Three times daily", duration: "3 days" },
          { name: "Acefyl Cough Syrup", dosage: "2 teaspoons", frequency: "At bedtime", duration: "5 days" },
        ],
        instructions: "Take medications after meals. Drink plenty of warm water.",
        status: "Dispensed",
      },
    ];
    await Prescription.insertMany(prescriptionData);
    console.log("✅ Seeded Consultations & Prescriptions.");

    // Fetch or create Admin user for reference
    let adminUser = await User.findOne({ username: "admin" });
    if (!adminUser) {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash("Admin@1234", salt);
      adminUser = await User.create({
        username: "admin",
        email: "admin@subhancare.com",
        passwordHash,
        role: "Admin",
      });
    }

    // 6. Seed Invoices
    const invoiceData = [
      {
        patientId: insertedPatients[1]._id,
        itemizedCharges: [
          { item: "Pediatric Consultation Fee", amount: 2000 },
          { item: "CBC Blood Test", amount: 1200 },
          { item: "Prescription Medicines", amount: 1850 },
        ],
        totalAmount: 5050,
        status: "Paid",
        paymentMethod: "Cash",
        issuedBy: adminUser._id,
      },
      {
        patientId: insertedPatients[0]._id,
        itemizedCharges: [
          { item: "Cardiology Specialist Fee", amount: 2500 },
          { item: "ECG Test", amount: 1500 },
          { item: "Echocardiogram", amount: 4500 },
        ],
        totalAmount: 8500,
        status: "Partially Paid",
        paymentMethod: "Card",
        issuedBy: adminUser._id,
      },
      {
        patientId: insertedPatients[2]._id,
        itemizedCharges: [
          { item: "Orthopedic Surgeon Fee", amount: 3000 },
          { item: "X-Ray Knee Joint (B/L)", amount: 2200 },
        ],
        totalAmount: 5200,
        status: "Unpaid",
        paymentMethod: "Cash",
        issuedBy: adminUser._id,
      },
    ];
    await Invoice.insertMany(invoiceData);
    console.log(`✅ Seeded ${invoiceData.length} Invoices.`);

    // 7. Seed Inventory Items
    const inventoryData = [
      {
        name: "Augmentin 625mg Tablets",
        batchNumber: "BAT-2024-001",
        expiryDate: new Date("2027-12-31"),
        quantityInStock: 120,
        reorderThreshold: 25,
      },
      {
        name: "Panadol Extra 500mg",
        batchNumber: "BAT-2024-002",
        expiryDate: new Date("2028-06-30"),
        quantityInStock: 450,
        reorderThreshold: 50,
      },
      {
        name: "Disposable Syringes 5ml",
        batchNumber: "BAT-2024-003",
        expiryDate: new Date("2029-01-01"),
        quantityInStock: 8, // Low stock trigger
        reorderThreshold: 30,
      },
      {
        name: "Surgical Face Masks (50s)",
        batchNumber: "BAT-2024-004",
        expiryDate: new Date("2030-01-01"),
        quantityInStock: 85,
        reorderThreshold: 20,
      },
    ];
    await InventoryItem.insertMany(inventoryData);
    console.log(`✅ Seeded ${inventoryData.length} Inventory Items.`);

    // 8. Seed Lab Tests
    const labTestData = [
      {
        patientId: insertedPatients[0]._id,
        patientName: insertedPatients[0].name,
        doctorId: insertedDoctors[0]._id,
        doctorName: insertedDoctors[0].name,
        testName: "Echocardiogram (Echo)",
        category: "Cardiology",
        status: "Completed",
        testResult: "Normal LVEF (62%), No regional wall motion abnormality.",
        normalRange: "LVEF 55-70%",
        unit: "%",
        technicianNotes: "Patient was cooperative during scan.",
        fee: 4500,
        paymentStatus: "Paid",
      },
      {
        patientId: insertedPatients[1]._id,
        patientName: insertedPatients[1].name,
        doctorId: insertedDoctors[1]._id,
        doctorName: insertedDoctors[1].name,
        testName: "Complete Blood Count (CBC)",
        category: "Hematology",
        status: "Completed",
        testResult: "WBC: 12.5 (Mild Leukocytosis), Hb: 13.2 g/dL, Platelets: 280,000",
        normalRange: "WBC: 4.0-11.0",
        unit: "x10^3 / uL",
        technicianNotes: "Mild elevation in total leukocyte count indicating infection.",
        fee: 1200,
        paymentStatus: "Paid",
      },
      {
        patientId: insertedPatients[2]._id,
        patientName: insertedPatients[2].name,
        doctorId: insertedDoctors[2]._id,
        doctorName: insertedDoctors[2].name,
        testName: "X-Ray Both Knees AP/Lat",
        category: "Radiology",
        status: "In Processing",
        testResult: "",
        normalRange: "N/A",
        unit: "Images",
        technicianNotes: "Sample scan captured, pending radiologist signoff.",
        fee: 2200,
        paymentStatus: "Unpaid",
      },
      {
        patientId: insertedPatients[3]._id,
        patientName: insertedPatients[3].name,
        doctorId: insertedDoctors[3]._id,
        doctorName: insertedDoctors[3].name,
        testName: "Fasting Blood Sugar (FBS)",
        category: "Pathology",
        status: "Requested",
        testResult: "",
        normalRange: "70 - 99 mg/dL",
        unit: "mg/dL",
        technicianNotes: "",
        fee: 600,
        paymentStatus: "Unpaid",
      },
    ];
    await LabTest.insertMany(labTestData);
    console.log(`✅ Seeded ${labTestData.length} Lab Tests.`);

    console.log("\n🚀 Full Sample Data Seeding Completed Successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

seedData();
