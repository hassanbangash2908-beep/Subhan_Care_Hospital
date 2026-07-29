import mongoose from "mongoose";

const labTestSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },
    patientName: {
      type: String,
      required: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
    },
    doctorName: {
      type: String,
      default: "Self / Walk-in",
    },
    testName: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ["Pathology", "Radiology", "Hematology", "Cardiology", "Microbiology", "General"],
      default: "General",
    },
    testDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["Requested", "Sample Collected", "In Processing", "Completed", "Cancelled"],
      default: "Requested",
    },
    testResult: {
      type: String,
      default: "",
    },
    normalRange: {
      type: String,
      default: "",
    },
    unit: {
      type: String,
      default: "",
    },
    technicianNotes: {
      type: String,
      default: "",
    },
    fee: {
      type: Number,
      default: 0,
    },
    paymentStatus: {
      type: String,
      enum: ["Unpaid", "Paid", "Waived"],
      default: "Unpaid",
    },
  },
  { timestamps: true }
);

export default mongoose.model("LabTest", labTestSchema);
