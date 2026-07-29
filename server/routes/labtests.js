import express from "express";
import LabTest from "../models/LabTest.js";
import Patient from "../models/Patient.js";
import { protect, restrictTo } from "../middleware/auth.js";
import { logActivity } from "../middleware/audit.js";

const router = express.Router();

// GET /api/labtests - Get all lab tests
router.get("/", protect, async (req, res) => {
  try {
    const { status, category, search } = req.query;
    const query = {};

    if (status) query.status = status;
    if (category) query.category = category;
    if (search) {
      query.$or = [
        { patientName: { $regex: search, $options: "i" } },
        { testName: { $regex: search, $options: "i" } },
        { doctorName: { $regex: search, $options: "i" } },
      ];
    }

    const tests = await LabTest.find(query)
      .populate("patientId", "fullName mrn phone age gender")
      .populate("doctorId", "fullName department specialization")
      .sort({ createdAt: -1 });

    return res.json({ success: true, count: tests.length, data: tests });
  } catch (error) {
    console.error("Fetch lab tests error:", error);
    return res.status(500).json({ success: false, message: "Server error fetching lab tests" });
  }
});

// POST /api/labtests - Request a new lab test
router.post("/", protect, async (req, res) => {
  try {
    const { patientId, patientName, doctorId, doctorName, testName, category, fee, paymentStatus } = req.body;

    if (!patientId || !testName) {
      return res.status(400).json({ success: false, message: "Patient ID and Test Name are required" });
    }

    // Verify patient exists
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ success: false, message: "Patient not found" });
    }

    const labTest = new LabTest({
      patientId,
      patientName: patientName || patient.fullName,
      doctorId: doctorId || null,
      doctorName: doctorName || "Self / Walk-in",
      testName,
      category: category || "General",
      fee: fee || 0,
      paymentStatus: paymentStatus || "Unpaid",
      status: "Requested",
    });

    await labTest.save();

    await logActivity({
      userId: req.user._id,
      username: req.user.username,
      action: "CREATE_LAB_TEST",
      affectedEntity: "LabTest",
      affectedRecordId: labTest._id.toString(),
      details: `Requested test '${testName}' for patient ${patient.fullName}`,
    });

    return res.status(201).json({ success: true, message: "Lab test requested successfully", data: labTest });
  } catch (error) {
    console.error("Create lab test error:", error);
    return res.status(500).json({ success: false, message: "Server error requesting lab test" });
  }
});

// PUT /api/labtests/:id - Update test status / result
router.put("/:id", protect, async (req, res) => {
  try {
    const { status, testResult, normalRange, unit, technicianNotes, fee, paymentStatus } = req.body;
    const labTest = await LabTest.findById(req.params.id);

    if (!labTest) {
      return res.status(404).json({ success: false, message: "Lab test not found" });
    }

    if (status) labTest.status = status;
    if (testResult !== undefined) labTest.testResult = testResult;
    if (normalRange !== undefined) labTest.normalRange = normalRange;
    if (unit !== undefined) labTest.unit = unit;
    if (technicianNotes !== undefined) labTest.technicianNotes = technicianNotes;
    if (fee !== undefined) labTest.fee = fee;
    if (paymentStatus) labTest.paymentStatus = paymentStatus;

    await labTest.save();

    await logActivity({
      userId: req.user._id,
      username: req.user.username,
      action: "UPDATE_LAB_TEST",
      affectedEntity: "LabTest",
      affectedRecordId: labTest._id.toString(),
      details: `Updated lab test '${labTest.testName}' status to '${labTest.status}'`,
    });

    return res.json({ success: true, message: "Lab test updated successfully", data: labTest });
  } catch (error) {
    console.error("Update lab test error:", error);
    return res.status(500).json({ success: false, message: "Server error updating lab test" });
  }
});

// DELETE /api/labtests/:id - Delete test
router.delete("/:id", protect, restrictTo("Admin"), async (req, res) => {
  try {
    const labTest = await LabTest.findByIdAndDelete(req.params.id);
    if (!labTest) {
      return res.status(404).json({ success: false, message: "Lab test not found" });
    }

    return res.json({ success: true, message: "Lab test deleted successfully" });
  } catch (error) {
    console.error("Delete lab test error:", error);
    return res.status(500).json({ success: false, message: "Server error deleting lab test" });
  }
});

export default router;
