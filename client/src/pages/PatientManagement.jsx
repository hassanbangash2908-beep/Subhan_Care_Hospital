import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import {
  Search,
  UserPlus,
  FileText,
  CheckCircle,
  ShieldAlert,
  Tag,
  Activity,
  Heart,
  Thermometer,
  Calendar,
  X,
  Eye,
  Filter,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function PatientManagement() {
  const { authFetch, user } = useAuth();
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Slide-out EHR Drawer State
  const [selectedEHR, setSelectedEHR] = useState(null);

  // Filter pills (All, Male, Female, Emergency)
  const [genderFilter, setGenderFilter] = useState("All");

  // Patient Form State
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("Male");
  const [cnic, setCnic] = useState("");
  const [contact, setContact] = useState("");
  const [address, setAddress] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");
  const [emergencyContactRelationship, setEmergencyContactRelationship] = useState("");
  const [bloodGroup, setBloodGroup] = useState("O+");
  const [allergies, setAllergies] = useState("");
  const [maritalStatus, setMaritalStatus] = useState("Single");
  const [occupation, setOccupation] = useState("");

  // CNIC Auto-Formatter Helper
  const formatCNIC = (value) => {
    const digits = value.replace(/\D/g, "").slice(0, 13);
    if (digits.length <= 5) return digits;
    if (digits.length <= 12) return `${digits.slice(0, 5)}-${digits.slice(5)}`;
    return `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12)}`;
  };

  const handleCnicChange = (e) => {
    setCnic(formatCNIC(e.target.value));
  };

  // Allergy Severity Badge Classifier
  const getAllergyBadge = (allergyStr) => {
    const lower = allergyStr.toLowerCase();
    if (lower.includes("severe") || lower.includes("high") || lower.includes("critical")) {
      return { class: "badge-red", label: "Severe" };
    }
    if (lower.includes("moderate") || lower.includes("medium")) {
      return { class: "badge-warning", label: "Moderate" };
    }
    if (lower.includes("mild") || lower.includes("low")) {
      return { class: "badge-blue", label: "Mild" };
    }
    return { class: "badge-purple", label: "" };
  };

  const fetchPatients = async (query = "") => {
    try {
      setLoading(true);
      const res = await authFetch(`/api/patients?search=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setPatients(data.patients);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchPatients(search);
  };

  const handleClear = () => {
    setSearch("");
    fetchPatients("");
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!name || !dob || !gender || !cnic || !contact || !address || !emergencyContact) {
      setError("Please fill in all mandatory fields (Name, DOB, Gender, CNIC, Contact, Address, Emergency Contact).");
      return;
    }

    if (!/^\d{5}-\d{7}-\d{1}$/.test(cnic)) {
      setError("Invalid CNIC Format. Must be 13 digits: XXXXX-XXXXXXX-X");
      return;
    }

    try {
      const allergyArray = allergies ? allergies.split(",").map((a) => a.trim()).filter(Boolean) : [];
      const res = await authFetch("/api/patients", {
        method: "POST",
        body: JSON.stringify({
          name,
          dob,
          gender,
          cnic,
          contact,
          address,
          emergencyContact,
          emergencyContactRelationship,
          bloodGroup,
          allergies: allergyArray,
          maritalStatus,
          occupation,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess(`Patient registered successfully! ID: ${data.patient.patientId}`);
        setName("");
        setDob("");
        setGender("Male");
        setCnic("");
        setContact("");
        setAddress("");
        setEmergencyContact("");
        setEmergencyContactRelationship("");
        setAllergies("");
        setOccupation("");
        
        fetchPatients();
        setTimeout(() => {
          setShowModal(false);
          setSuccess("");
        }, 2000);
      } else {
        setError(data.message || "Failed to register patient");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    }
  };

  const filteredPatients = patients.filter(
    (p) => genderFilter === "All" || p.gender === genderFilter
  );

  const canWrite = user && (user.role === "Admin" || user.role === "Receptionist");

  return (
    <div className="patients-page">
      <div className="page-header-row">
        <div>
          <h1>Patient Records Directory & EHR</h1>
          <p className="subtitle">Interactive electronic health records, vitals tracking, and patient registry</p>
        </div>

        {canWrite && (
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <UserPlus size={18} style={{ marginRight: "6px" }} /> Register New Patient
          </button>
        )}
      </div>

      {/* Search Header & Filter Bar */}
      <div className="card mb-4">
        <div className="card-body">
          <form onSubmit={handleSearchSubmit} className="search-bar-row">
            <div className="form-group flex-1 m-0">
              <div className="input-with-icon">
                <Search className="input-icon" size={18} />
                <input
                  type="text"
                  placeholder="Search by Patient ID, Name, CNIC (e.g. 42101-1234567-1), or Contact..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            <button type="submit" className="btn btn-secondary">Search</button>
            {search && <button type="button" className="btn btn-muted" onClick={handleClear}>Clear</button>}
          </form>

          {/* Quick Filter Pills */}
          <div style={{ display: "flex", gap: "8px", marginTop: "16px", alignItems: "center" }}>
            <span style={{ fontSize: "12px", color: "var(--color-text-muted)", display: "flex", alignItems: "center", gap: "4px" }}>
              <Filter size={12} /> Filter by Gender:
            </span>
            {["All", "Male", "Female", "Other"].map((g) => (
              <button
                key={g}
                className={`btn btn-sm ${genderFilter === g ? "btn-primary" : "btn-muted"}`}
                style={{ fontSize: "11px", padding: "3px 10px" }}
                onClick={() => setGenderFilter(g)}
              >
                {g}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Directory Table */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <FileText className="icon-purple" size={20} /> Directory Listing ({filteredPatients.length})
          </div>
        </div>

        <div className="card-body scroll-panel">
          {loading ? (
            <div className="page-loading">
              <span className="spinner" /> Loading directories...
            </div>
          ) : filteredPatients.length === 0 ? (
            <div className="idle-state">
              <p>No patient records found matching the criteria.</p>
            </div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Patient ID</th>
                  <th>Full Name</th>
                  <th>CNIC Number</th>
                  <th>DOB / Age</th>
                  <th>Gender & Blood</th>
                  <th>Contact</th>
                  <th>Allergies & Severity</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.map((p) => {
                  const age = new Date().getFullYear() - new Date(p.dob).getFullYear();
                  return (
                    <tr key={p._id}>
                      <td><strong className="text-purple">{p.patientId || "Generating..."}</strong></td>
                      <td><strong>{p.name}</strong></td>
                      <td><code>{p.cnic}</code></td>
                      <td>
                        {new Date(p.dob).toLocaleDateString()}{" "}
                        <span style={{ fontSize: "11px", opacity: 0.75 }}>({age} yrs)</span>
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: "4px" }}>
                          <span className={`badge ${p.gender === "Male" ? "badge-blue" : "badge-purple"}`}>
                            {p.gender}
                          </span>
                          <span className="badge badge-success">{p.bloodGroup || "O+"}</span>
                        </div>
                      </td>
                      <td>{p.contact}</td>
                      <td style={{ maxWidth: "180px" }}>
                        {p.allergies && p.allergies.length > 0 ? (
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                            {p.allergies.map((a, i) => {
                              const badgeInfo = getAllergyBadge(a);
                              return (
                                <span key={i} className={`badge ${badgeInfo.class}`} style={{ fontSize: "11px" }}>
                                  {a}
                                </span>
                              );
                            })}
                          </div>
                        ) : (
                          <span style={{ opacity: 0.5, fontSize: "12px" }}>No Known Allergies</span>
                        )}
                      </td>
                      <td>
                        <button
                          className="btn btn-secondary"
                          style={{ padding: "4px 10px", fontSize: "11px", display: "flex", alignItems: "center", gap: "4px" }}
                          onClick={() => setSelectedEHR(p)}
                        >
                          <Eye size={12} /> View EHR
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Slide-out EHR Drawer */}
      {selectedEHR && (
        <div className="ehr-overlay" onClick={() => setSelectedEHR(null)}>
          <div className="ehr-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="ehr-header">
              <div>
                <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#fff" }}>{selectedEHR.name}</h3>
                <span style={{ fontSize: "12px", color: "var(--color-primary-light)" }}>Patient File ID: {selectedEHR.patientId}</span>
              </div>
              <button className="btn btn-muted" style={{ padding: "6px" }} onClick={() => setSelectedEHR(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="ehr-body">
              {/* Real-time Vital Signs Monitor */}
              <div>
                <h4 style={{ fontSize: "13px", fontWeight: "700", marginBottom: "10px", display: "flex", alignItems: "center", gap: "6px" }}>
                  <Activity size={16} color="#06b6d4" /> Live Vitals Monitor
                </h4>
                <div className="vital-grid">
                  <div className="vital-card">
                    <Heart size={16} color="#ef4444" />
                    <div className="vital-value">78 <span style={{ fontSize: "10px", color: "#94a3b8" }}>bpm</span></div>
                    <div className="vital-label">Heart Rate</div>
                  </div>
                  <div className="vital-card">
                    <Activity size={16} color="#10b981" />
                    <div className="vital-value">120/80</div>
                    <div className="vital-label">Blood Pressure</div>
                  </div>
                  <div className="vital-card">
                    <Thermometer size={16} color="#f59e0b" />
                    <div className="vital-value">98.6 <span style={{ fontSize: "10px", color: "#94a3b8" }}>°F</span></div>
                    <div className="vital-label">Body Temp</div>
                  </div>
                  <div className="vital-card">
                    <Activity size={16} color="#8b5cf6" />
                    <div className="vital-value">99%</div>
                    <div className="vital-label">SpO2 Level</div>
                  </div>
                </div>
              </div>

              {/* Patient Personal Details */}
              <div className="card p-3" style={{ background: "rgba(255,255,255,0.02)" }}>
                <h4 style={{ fontSize: "13px", fontWeight: "700", marginBottom: "8px" }}>Patient Demographics</h4>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", fontSize: "12px" }}>
                  <div><strong>CNIC:</strong> {selectedEHR.cnic}</div>
                  <div><strong>DOB:</strong> {new Date(selectedEHR.dob).toLocaleDateString()}</div>
                  <div><strong>Contact:</strong> {selectedEHR.contact}</div>
                  <div><strong>Emergency:</strong> {selectedEHR.emergencyContact} ({selectedEHR.emergencyContactRelationship || "Family"})</div>
                  <div><strong>Blood Group:</strong> {selectedEHR.bloodGroup || "O+"}</div>
                  <div><strong>Status:</strong> {selectedEHR.maritalStatus || "Single"}</div>
                </div>
              </div>

              {/* Medical History Timeline */}
              <div>
                <h4 style={{ fontSize: "13px", fontWeight: "700", marginBottom: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
                  <Calendar size={16} color="#8b5cf6" /> Medical History Timeline
                </h4>
                <div className="medical-timeline">
                  <div className="timeline-item">
                    <div className="timeline-dot" />
                    <div style={{ fontSize: "13px", fontWeight: "600", color: "#fff" }}>Routine Consultation</div>
                    <div style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>Dr. Hassan (Cardiology) - Aug 10, 2026</div>
                    <p style={{ fontSize: "12px", color: "#cbd5e1", marginTop: "4px" }}>
                      Patient reported minor chest discomfort. ECG recorded normal rhythm. Prescribed Aspirin & follow-up.
                    </p>
                  </div>
                  <div className="timeline-item">
                    <div className="timeline-dot" style={{ background: "#06b6d4" }} />
                    <div style={{ fontSize: "13px", fontWeight: "600", color: "#fff" }}>Complete Blood Count (CBC) Lab</div>
                    <div style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>Pathology Diagnostics Unit - Aug 05, 2026</div>
                    <p style={{ fontSize: "12px", color: "#cbd5e1", marginTop: "4px" }}>
                      Hemoglobin: 14.2 g/dL. Platelets: 250,000 /mcL. All parameters within normal reference range.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: "flex", gap: "10px", marginTop: "auto", paddingTop: "16px", borderTop: "1px solid var(--color-border)" }}>
                <button
                  className="btn btn-primary flex-1"
                  onClick={() => {
                    setSelectedEHR(null);
                    navigate("/appointments");
                  }}
                >
                  Book Appointment Slot
                </button>
                <button
                  className="btn btn-secondary flex-1"
                  onClick={() => {
                    setSelectedEHR(null);
                    navigate("/billing");
                  }}
                >
                  Create Invoice
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Registration Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-card max-w-2xl">
            <div className="modal-header">
              <h2>Register New Patient File</h2>
              <button className="modal-close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>

            <div className="modal-body">
              {error && (
                <div className="alert alert-danger mb-4 flex items-center">
                  <ShieldAlert size={16} style={{ marginRight: "8px" }} /> {error}
                </div>
              )}
              {success && (
                <div className="alert alert-success mb-4 flex items-center">
                  <CheckCircle size={16} style={{ marginRight: "8px" }} /> {success}
                </div>
              )}

              <form onSubmit={handleRegister} className="grid-form">
                <div className="form-group span-2">
                  <label>Full Name *</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>

                <div className="form-group">
                  <label>Date of Birth *</label>
                  <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} required />
                </div>

                <div className="form-group">
                  <label>Gender *</label>
                  <select value={gender} onChange={(e) => setGender(e.target.value)} required>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>CNIC Number * (Auto-Formatted)</label>
                  <input
                    type="text"
                    placeholder="42101-1234567-1"
                    value={cnic}
                    onChange={handleCnicChange}
                    maxLength={15}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Contact Number *</label>
                  <input type="text" value={contact} onChange={(e) => setContact(e.target.value)} required />
                </div>

                <div className="form-group span-2">
                  <label>Address *</label>
                  <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} required />
                </div>

                <div className="form-group">
                  <label>Emergency Contact *</label>
                  <input type="text" value={emergencyContact} onChange={(e) => setEmergencyContact(e.target.value)} required />
                </div>

                <div className="form-group">
                  <label>Relationship to Emergency Contact</label>
                  <input
                    type="text"
                    placeholder="e.g. Brother, Mother"
                    value={emergencyContactRelationship}
                    onChange={(e) => setEmergencyContactRelationship(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Blood Group</label>
                  <select value={bloodGroup} onChange={(e) => setBloodGroup(e.target.value)}>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Marital Status</label>
                  <select value={maritalStatus} onChange={(e) => setMaritalStatus(e.target.value)}>
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                    <option value="Divorced">Divorced</option>
                    <option value="Widowed">Widowed</option>
                  </select>
                </div>

                <div className="form-group span-2">
                  <label>Allergies (comma-separated with severity tags)</label>
                  <input
                    type="text"
                    placeholder="e.g. Penicillin (Severe), Dust (Moderate), Pollen (Mild)"
                    value={allergies}
                    onChange={(e) => setAllergies(e.target.value)}
                  />
                </div>

                <div className="span-2 flex justify-end gap-2 mt-4">
                  <button type="button" className="btn btn-muted" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Register Patient</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


