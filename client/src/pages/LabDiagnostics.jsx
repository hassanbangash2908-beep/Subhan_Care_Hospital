import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import {
  FlaskConical,
  Plus,
  Search,
  CheckCircle,
  Clock,
  AlertCircle,
  FileText,
  Printer,
  Trash2,
  Edit,
  X,
} from "lucide-react";

export default function LabDiagnostics() {
  const { token, user } = useAuth();
  const [tests, setTests] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Modals
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);

  // Form states
  const [newTest, setNewTest] = useState({
    patientId: "",
    doctorId: "",
    testName: "",
    category: "Pathology",
    fee: 1500,
  });

  const [resultForm, setResultForm] = useState({
    status: "Completed",
    testResult: "",
    normalRange: "",
    unit: "",
    technicianNotes: "",
    paymentStatus: "Paid",
  });

  useEffect(() => {
    fetchTests();
    fetchDropdowns();
  }, [search, categoryFilter, statusFilter]);

  const fetchTests = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams();
      if (search) query.append("search", search);
      if (categoryFilter) query.append("category", categoryFilter);
      if (statusFilter) query.append("status", statusFilter);

      const res = await fetch(`http://localhost:5000/api/labtests?${query.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setTests(data.data);
      }
    } catch (err) {
      console.error("Error fetching lab tests:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDropdowns = async () => {
    try {
      const [resP, resD] = await Promise.all([
        fetch("http://localhost:5000/api/patients", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("http://localhost:5000/api/doctors", { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      const dataP = await resP.json();
      const dataD = await resD.json();

      if (dataP.success) setPatients(dataP.data || []);
      if (dataD.success) setDoctors(dataD.data || []);
    } catch (err) {
      console.error("Error fetching dropdowns:", err);
    }
  };

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    try {
      const patientObj = patients.find((p) => p._id === newTest.patientId);
      const doctorObj = doctors.find((d) => d._id === newTest.doctorId);

      const payload = {
        ...newTest,
        patientName: patientObj ? patientObj.name : "",
        doctorName: doctorObj ? doctorObj.name : "Walk-in",
      };

      const res = await fetch("http://localhost:5000/api/labtests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setShowRequestModal(false);
        setNewTest({ patientId: "", doctorId: "", testName: "", category: "Pathology", fee: 1500 });
        fetchTests();
      } else {
        alert(data.message || "Failed to request test");
      }
    } catch (err) {
      console.error("Request test error:", err);
    }
  };

  const handleResultUpdate = async (e) => {
    e.preventDefault();
    if (!selectedTest) return;

    try {
      const res = await fetch(`http://localhost:5000/api/labtests/${selectedTest._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(resultForm),
      });

      const data = await res.json();
      if (data.success) {
        setShowResultModal(false);
        setSelectedTest(null);
        fetchTests();
      } else {
        alert(data.message || "Failed to update test result");
      }
    } catch (err) {
      console.error("Update test result error:", err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this lab test record?")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/labtests/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        fetchTests();
      }
    } catch (err) {
      console.error("Delete test error:", err);
    }
  };

  const openResultModal = (test) => {
    setSelectedTest(test);
    setResultForm({
      status: test.status || "Completed",
      testResult: test.testResult || "",
      normalRange: test.normalRange || "",
      unit: test.unit || "",
      technicianNotes: test.technicianNotes || "",
      paymentStatus: test.paymentStatus || "Paid",
    });
    setShowResultModal(true);
  };

  const handlePrint = (test) => {
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>Lab Report - ${test.testName}</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 40px; color: #1e293b; }
            .header { text-align: center; border-bottom: 2px solid #0284c7; padding-bottom: 15px; margin-bottom: 20px; }
            .hospital-name { font-size: 24px; font-weight: bold; color: #0284c7; }
            .subtitle { font-size: 14px; color: #64748b; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 25px; font-size: 14px; background: #f8fafc; padding: 15px; border-radius: 8px; }
            .report-box { border: 1px solid #cbd5e1; border-radius: 8px; padding: 20px; margin-bottom: 20px; }
            .result-title { font-size: 16px; font-weight: bold; color: #0f172a; margin-bottom: 10px; }
            .result-text { font-size: 15px; color: #0369a1; font-weight: 600; white-space: pre-wrap; }
            .footer { margin-top: 50px; display: flex; justify-content: space-between; font-size: 13px; color: #64748b; }
            .signature { border-top: 1px solid #94a3b8; width: 180px; text-align: center; padding-top: 5px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="hospital-name">🏥 SUBHAN CARE HOSPITAL</div>
            <div class="subtitle">Pathology & Diagnostics Department | Official Test Report</div>
          </div>

          <div class="info-grid">
            <div><strong>Patient Name:</strong> ${test.patientName}</div>
            <div><strong>Report Date:</strong> ${new Date(test.testDate || test.createdAt).toLocaleDateString()}</div>
            <div><strong>Ref. Doctor:</strong> ${test.doctorName}</div>
            <div><strong>Test Category:</strong> ${test.category}</div>
          </div>

          <div class="report-box">
            <div class="result-title">Test Name: ${test.testName}</div>
            <p><strong>Result:</strong></p>
            <div class="result-text">${test.testResult || "Result Pending"}</div>
            ${test.normalRange ? `<p style="margin-top: 15px;"><strong>Normal Range:</strong> ${test.normalRange} ${test.unit}</p>` : ""}
            ${test.technicianNotes ? `<p><strong>Remarks:</strong> ${test.technicianNotes}</p>` : ""}
          </div>

          <div class="footer">
            <div>Report Status: <strong>${test.status}</strong></div>
            <div class="signature">Authorized Pathologist</div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <FlaskConical className="title-icon" /> Laboratory & Diagnostics
          </h1>
          <p className="page-subtitle">Pathology, Radiology & Clinical Test Management</p>
        </div>

        <button className="btn btn-primary" onClick={() => setShowRequestModal(true)}>
          <Plus size={18} /> Request New Test
        </button>
      </div>

      {/* Filters Bar */}
      <div className="filter-bar" style={{ display: "flex", gap: "15px", marginBottom: "20px", flexWrap: "wrap" }}>
        <div className="search-input-wrapper" style={{ flex: 1, minWidth: "250px" }}>
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="input-field"
            placeholder="Search patient, test or doctor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="input-field"
          style={{ width: "180px" }}
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="">All Categories</option>
          <option value="Pathology">Pathology</option>
          <option value="Radiology">Radiology</option>
          <option value="Hematology">Hematology</option>
          <option value="Cardiology">Cardiology</option>
          <option value="General">General</option>
        </select>

        <select
          className="input-field"
          style={{ width: "180px" }}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="Requested">Requested</option>
          <option value="Sample Collected">Sample Collected</option>
          <option value="In Processing">In Processing</option>
          <option value="Completed">Completed</option>
        </select>
      </div>

      {/* Tests Table */}
      <div className="card">
        {loading ? (
          <div style={{ padding: "40px", textAlign: "center" }}>
            <span className="spinner" /> Loading Diagnostic Records...
          </div>
        ) : tests.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>
            No diagnostic tests found matching your criteria.
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Test Name</th>
                  <th>Patient</th>
                  <th>Ref. Doctor</th>
                  <th>Category</th>
                  <th>Fee</th>
                  <th>Status</th>
                  <th>Result Summary</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tests.map((t) => (
                  <tr key={t._id}>
                    <td>
                      <strong>{t.testName}</strong>
                      <div style={{ fontSize: "12px", color: "#64748b" }}>
                        {new Date(t.testDate || t.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td>{t.patientName}</td>
                    <td>{t.doctorName}</td>
                    <td>
                      <span className="badge badge-info">{t.category}</span>
                    </td>
                    <td>Rs. {t.fee?.toLocaleString()}</td>
                    <td>
                      <span
                        className={`badge ${
                          t.status === "Completed"
                            ? "badge-success"
                            : t.status === "In Processing"
                            ? "badge-warning"
                            : "badge-secondary"
                        }`}
                      >
                        {t.status}
                      </span>
                    </td>
                    <td style={{ maxWidth: "220px" }}>
                      {t.testResult ? (
                        <span style={{ fontSize: "13px", color: "#0369a1" }}>{t.testResult.substring(0, 45)}...</span>
                      ) : (
                        <span style={{ color: "#94a3b8", fontStyle: "italic", fontSize: "13px" }}>Result Pending</span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button
                          className="btn btn-sm btn-outline-primary"
                          title="Enter/Update Result"
                          onClick={() => openResultModal(t)}
                        >
                          <Edit size={14} /> Enter Result
                        </button>
                        {t.status === "Completed" && (
                          <button
                            className="btn btn-sm btn-outline-success"
                            title="Print Report"
                            onClick={() => handlePrint(t)}
                          >
                            <Printer size={14} /> Report
                          </button>
                        )}
                        {user?.role === "Admin" && (
                          <button
                            className="btn btn-sm btn-outline-danger"
                            title="Delete"
                            onClick={() => handleDelete(t._id)}
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Request Modal */}
      {showRequestModal && (
        <div className="modal-backdrop">
          <div className="modal-box" style={{ maxWidth: "500px" }}>
            <div className="modal-header">
              <h3>Request New Diagnostic Test</h3>
              <button className="close-btn" onClick={() => setShowRequestModal(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleRequestSubmit}>
              <div className="form-group" style={{ marginBottom: "15px" }}>
                <label>Select Patient *</label>
                <select
                  className="input-field"
                  required
                  value={newTest.patientId}
                  onChange={(e) => setNewTest({ ...newTest, patientId: e.target.value })}
                >
                  <option value="">-- Choose Patient --</option>
                  {patients.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name} ({p.patientId || p.cnic || "ID"})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: "15px" }}>
                <label>Referring Doctor</label>
                <select
                  className="input-field"
                  value={newTest.doctorId}
                  onChange={(e) => setNewTest({ ...newTest, doctorId: e.target.value })}
                >
                  <option value="">-- Self / Walk-In --</option>
                  {doctors.map((d) => (
                    <option key={d._id} value={d._id}>
                      {d.name} ({d.specialization})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: "15px" }}>
                <label>Test Name *</label>
                <input
                  type="text"
                  className="input-field"
                  required
                  placeholder="e.g. Fasting Blood Sugar, X-Ray Chest"
                  value={newTest.testName}
                  onChange={(e) => setNewTest({ ...newTest, testName: e.target.value })}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "15px" }}>
                <div className="form-group">
                  <label>Category</label>
                  <select
                    className="input-field"
                    value={newTest.category}
                    onChange={(e) => setNewTest({ ...newTest, category: e.target.value })}
                  >
                    <option value="Pathology">Pathology</option>
                    <option value="Radiology">Radiology</option>
                    <option value="Hematology">Hematology</option>
                    <option value="Cardiology">Cardiology</option>
                    <option value="General">General</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Test Fee (Rs.)</label>
                  <input
                    type="number"
                    className="input-field"
                    value={newTest.fee}
                    onChange={(e) => setNewTest({ ...newTest, fee: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "20px" }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowRequestModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Submit Test Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Result Entry Modal */}
      {showResultModal && selectedTest && (
        <div className="modal-backdrop">
          <div className="modal-box" style={{ maxWidth: "550px" }}>
            <div className="modal-header">
              <h3>Enter Lab Test Result</h3>
              <button className="close-btn" onClick={() => setShowResultModal(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleResultUpdate}>
              <div style={{ background: "#f8fafc", padding: "12px", borderRadius: "6px", marginBottom: "15px" }}>
                <div><strong>Patient:</strong> {selectedTest.patientName}</div>
                <div><strong>Test:</strong> {selectedTest.testName} ({selectedTest.category})</div>
              </div>

              <div className="form-group" style={{ marginBottom: "15px" }}>
                <label>Test Status</label>
                <select
                  className="input-field"
                  value={resultForm.status}
                  onChange={(e) => setResultForm({ ...resultForm, status: e.target.value })}
                >
                  <option value="Requested">Requested</option>
                  <option value="Sample Collected">Sample Collected</option>
                  <option value="In Processing">In Processing</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: "15px" }}>
                <label>Test Result Details / Interpretation *</label>
                <textarea
                  className="input-field"
                  rows={4}
                  required
                  placeholder="Enter detailed findings, values, or scan impression..."
                  value={resultForm.testResult}
                  onChange={(e) => setResultForm({ ...resultForm, testResult: e.target.value })}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "15px" }}>
                <div className="form-group">
                  <label>Normal Reference Range</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. 70 - 99"
                    value={resultForm.normalRange}
                    onChange={(e) => setResultForm({ ...resultForm, normalRange: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Unit of Measure</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. mg/dL, %"
                    value={resultForm.unit}
                    onChange={(e) => setResultForm({ ...resultForm, unit: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: "15px" }}>
                <label>Technician Remarks / Notes</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Fasting sample verified"
                  value={resultForm.technicianNotes}
                  onChange={(e) => setResultForm({ ...resultForm, technicianNotes: e.target.value })}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "20px" }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowResultModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-success">
                  Save Result & Finalize
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
