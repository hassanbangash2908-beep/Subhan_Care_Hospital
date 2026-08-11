import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { UserCheck, CheckCircle, ShieldAlert, Plus, Trash, Star, Search, Filter, Calendar, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function DoctorManagement() {
  const { authFetch, user } = useAuth();
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("All");

  // Doctor Form State
  const [name, setName] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [contactInfo, setContactInfo] = useState("");
  const [consultationFee, setConsultationFee] = useState(1000);
  
  // Schedule state
  const [selectedDays, setSelectedDays] = useState([]);
  const [timeSlots, setTimeSlots] = useState(["09:00 - 09:30", "09:30 - 10:00", "10:00 - 10:30", "10:30 - 11:00", "11:00 - 11:30", "11:30 - 12:00"]);
  const [newSlot, setNewSlot] = useState("");

  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const res = await authFetch("/api/doctors");
      const data = await res.json();
      if (res.ok && data.success) {
        setDoctors(data.doctors);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const handleDayToggle = (day) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter((d) => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const handleAddSlot = (e) => {
    e.preventDefault();
    if (newSlot && !timeSlots.includes(newSlot)) {
      setTimeSlots([...timeSlots, newSlot].sort());
      setNewSlot("");
    }
  };

  const handleRemoveSlot = (slot) => {
    setTimeSlots(timeSlots.filter((s) => s !== slot));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!name || !specialization || !licenseNumber || !contactInfo || consultationFee === undefined) {
      setError("Please fill in all mandatory fields.");
      return;
    }

    if (selectedDays.length === 0) {
      setError("Please select at least one working day.");
      return;
    }

    try {
      const res = await authFetch("/api/doctors", {
        method: "POST",
        body: JSON.stringify({
          name,
          specialization,
          licenseNumber,
          contactInfo,
          consultationFee,
          schedule: {
            workingDays: selectedDays,
            timeSlots,
          },
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess(`Doctor profile created successfully! ID: ${data.doctor.doctorId}`);
        setName("");
        setSpecialization("");
        setLicenseNumber("");
        setContactInfo("");
        setConsultationFee(1000);
        setSelectedDays([]);
        fetchDoctors();

        setTimeout(() => {
          setShowModal(false);
          setSuccess("");
        }, 2000);
      } else {
        setError(data.message || "Failed to create doctor profile");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    }
  };

  const specialties = ["All", ...new Set(doctors.map((d) => d.specialization).filter(Boolean))];

  const filteredDoctors = doctors.filter((doc) => {
    const matchesSearch =
      doc.name.toLowerCase().includes(search.toLowerCase()) ||
      doc.specialization.toLowerCase().includes(search.toLowerCase()) ||
      (doc.licenseNumber && doc.licenseNumber.toLowerCase().includes(search.toLowerCase()));
    const matchesSpec = selectedSpecialty === "All" || doc.specialization === selectedSpecialty;
    return matchesSearch && matchesSpec;
  });

  const isAdmin = user && user.role === "Admin";

  return (
    <div className="doctors-page">
      <div className="page-header-row">
        <div>
          <h1>Doctor Directory & Practitioner Profiles</h1>
          <p className="subtitle">Clinical staff specialities, fee structures, and timetable availability</p>
        </div>

        {isAdmin && (
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={18} style={{ marginRight: "6px" }} /> Add New Doctor Profile
          </button>
        )}
      </div>

      {/* Filter & Search Header Bar */}
      <div className="card mb-4">
        <div className="card-body">
          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "center" }}>
            <div className="input-with-icon flex-1" style={{ minWidth: "260px" }}>
              <Search className="input-icon" size={18} />
              <input
                type="text"
                placeholder="Search by Doctor Name, License #, or Department..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div style={{ display: "flex", gap: "6px", overflowX: "auto" }}>
              {specialties.map((spec) => (
                <button
                  key={spec}
                  className={`btn btn-sm ${selectedSpecialty === spec ? "btn-primary" : "btn-muted"}`}
                  style={{ fontSize: "11px", padding: "6px 12px", whiteSpace: "nowrap" }}
                  onClick={() => setSelectedSpecialty(spec)}
                >
                  {spec}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Doctor Cards Grid */}
      {loading ? (
        <div className="page-loading">
          <span className="spinner" /> Loading doctor profiles...
        </div>
      ) : filteredDoctors.length === 0 ? (
        <div className="idle-state">
          <p>No doctor profiles found matching the query.</p>
        </div>
      ) : (
        <div className="doctor-card-grid">
          {filteredDoctors.map((doc) => (
            <div key={doc._id} className="doctor-card">
              <div className="doctor-card-header">
                <div className="doctor-avatar-circle">
                  {doc.name.replace("Dr. ", "")[0]}
                </div>
                <div className="doctor-card-info">
                  <h4>{doc.name}</h4>
                  <span className="specialty-pill">{doc.specialization}</span>
                  <div style={{ fontSize: "11px", color: "var(--color-text-muted)", marginTop: "2px" }}>
                    License: {doc.licenseNumber}
                  </div>
                </div>
              </div>

              <div className="doctor-card-stats">
                <div>
                  <span style={{ color: "var(--color-text-muted)" }}>Fee:</span>{" "}
                  <strong style={{ color: "#10b981" }}>Rs. {doc.consultationFee}</strong>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "#f59e0b" }}>
                  <Star size={14} fill="#f59e0b" />
                  <strong>4.9</strong>
                  <span style={{ fontSize: "10px", color: "#94a3b8" }}>(120+ reviews)</span>
                </div>
              </div>

              {/* Working Days Badges */}
              <div>
                <div style={{ fontSize: "11px", fontWeight: "600", color: "var(--color-text-muted)", marginBottom: "4px", display: "flex", alignItems: "center", gap: "4px" }}>
                  <Calendar size={12} /> Schedule Days:
                </div>
                <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                  {doc.schedule?.workingDays && doc.schedule.workingDays.length > 0 ? (
                    doc.schedule.workingDays.map((d) => (
                      <span key={d} className="badge badge-purple" style={{ fontSize: "10px" }}>
                        {d.slice(0, 3)}
                      </span>
                    ))
                  ) : (
                    <span style={{ fontSize: "11px", opacity: 0.5 }}>Daily Availability</span>
                  )}
                </div>
              </div>

              <div style={{ display: "flex", gap: "8px", marginTop: "auto", paddingTop: "10px" }}>
                <button
                  className="btn btn-primary flex-1"
                  style={{ fontSize: "12px", padding: "8px" }}
                  onClick={() => navigate("/appointments")}
                >
                  <Clock size={14} style={{ marginRight: "4px" }} /> Book Slot
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Registration Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-card max-w-2xl">
            <div className="modal-header">
              <h2>Add New Doctor Profile</h2>
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

              <form onSubmit={handleSubmit} className="grid-form">
                <div className="form-group span-2">
                  <label>Doctor Full Name * (e.g. Dr. Salman Khan)</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>

                <div className="form-group">
                  <label>Specialization / Department *</label>
                  <input
                    type="text"
                    placeholder="e.g. Cardiology, Pediatrics, Orthopedics"
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Medical License Number *</label>
                  <input type="text" value={licenseNumber} onChange={(e) => setLicenseNumber(e.target.value)} required />
                </div>

                <div className="form-group">
                  <label>Contact Info / Email *</label>
                  <input type="text" value={contactInfo} onChange={(e) => setContactInfo(e.target.value)} required />
                </div>

                <div className="form-group">
                  <label>Consultation Fee (Rs.) *</label>
                  <input
                    type="number"
                    value={consultationFee}
                    onChange={(e) => setConsultationFee(Number(e.target.value))}
                    required
                  />
                </div>

                {/* Working Days */}
                <div className="form-group span-2">
                  <label>Working Days *</label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "4px" }}>
                    {daysOfWeek.map((day) => {
                      const isSelected = selectedDays.includes(day);
                      return (
                        <button
                          key={day}
                          type="button"
                          className={`btn btn-sm ${isSelected ? "btn-primary" : "btn-secondary"}`}
                          onClick={() => handleDayToggle(day)}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="span-2 flex justify-end gap-2 mt-4">
                  <button type="button" className="btn btn-muted" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Create Profile</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
