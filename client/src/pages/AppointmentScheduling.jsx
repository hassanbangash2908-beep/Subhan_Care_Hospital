import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import {
  Calendar,
  Search,
  CheckCircle,
  ShieldAlert,
  Clock,
  UserCheck,
  RefreshCw,
  Kanban,
  List,
  Star,
  User,
  Check,
  ChevronRight,
  Filter,
} from "lucide-react";

export default function AppointmentScheduling() {
  const { authFetch } = useAuth();
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  
  // View Toggle Mode: 'kanban' or 'list'
  const [viewMode, setViewMode] = useState("kanban");

  // Step state for booking wizard (1: Patient, 2: Doctor & Slot, 3: Review & Confirm)
  const [bookingStep, setBookingStep] = useState(1);

  // Doctor Specialty Filter
  const [specialtyFilter, setSpecialtyFilter] = useState("All");

  // Search patient filter
  const [patientSearch, setPatientSearch] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);

  // Booking states
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [bookingDate, setBookingDate] = useState(new Date().toISOString().split("T")[0]);
  const [allSlots, setAllSlots] = useState([]);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [availabilityMessage, setAvailabilityMessage] = useState("");

  const [loadingSlots, setLoadingSlots] = useState(false);
  const [loadingList, setLoadingList] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Drag and Drop state
  const [draggedAppId, setDraggedAppId] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);

  // Reschedule Modal State
  const [rescheduleApp, setRescheduleApp] = useState(null);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleSlots, setRescheduleSlots] = useState([]);
  const [rescheduleBookedSlots, setRescheduleBookedSlots] = useState([]);
  const [rescheduleAllSlots, setRescheduleAllSlots] = useState([]);
  const [rescheduleSelectedSlot, setRescheduleSelectedSlot] = useState("");
  const [rescheduleReason, setRescheduleReason] = useState("");
  const [loadingRescheduleSlots, setLoadingRescheduleSlots] = useState(false);
  const [rescheduleError, setRescheduleError] = useState("");

  const loadInitialData = async () => {
    try {
      setLoadingList(true);
      const [docRes, appRes] = await Promise.all([
        authFetch("/api/doctors"),
        authFetch("/api/appointments"),
      ]);

      if (docRes && docRes.ok) {
        const docData = await docRes.json();
        if (docData.success) setDoctors(docData.doctors);
      }

      if (appRes && appRes.ok) {
        const appData = await appRes.json();
        if (appData.success) setAppointments(appData.appointments);
      }
    } catch (err) {
      console.error("Appointment load error:", err);
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  // Search Patient
  const handlePatientSearch = async (e) => {
    if (e) e.preventDefault();
    if (!patientSearch) return;
    try {
      const res = await authFetch(`/api/patients?search=${encodeURIComponent(patientSearch)}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setPatients(data.patients);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Check Slots availability
  const checkAvailability = async (doctorId, date) => {
    if (!doctorId || !date) return;
    try {
      setLoadingSlots(true);
      setError("");
      setSelectedSlot("");
      setAvailabilityMessage("");
      
      const res = await authFetch(`/api/appointments/availability?doctorId=${doctorId}&date=${date}`);
      const data = await res.json();
      
      if (res.ok && data.success) {
        setAvailableSlots(data.availableSlots || []);
        setAllSlots(data.allSlots || []);
        setBookedSlots(data.bookedSlots || []);
        if (data.availableSlots && data.availableSlots.length === 0) {
          setAvailabilityMessage(data.message || "No free slots available on this date.");
        }
      } else {
        setError(data.message || "Failed to load slots");
      }
    } catch (err) {
      setError("Error checking availability slots");
    } finally {
      setLoadingSlots(false);
    }
  };

  useEffect(() => {
    if (selectedDoctor && bookingDate) {
      checkAvailability(selectedDoctor._id, bookingDate);
    }
  }, [selectedDoctor, bookingDate]);

  // Handle Drag & Drop Status Update
  const handleDragStart = (e, appId) => {
    setDraggedAppId(appId);
    e.dataTransfer.setData("text/plain", appId);
  };

  const handleDragOver = (e, colStatus) => {
    e.preventDefault();
    setDragOverColumn(colStatus);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = async (e, newStatus) => {
    e.preventDefault();
    setDragOverColumn(null);
    if (!draggedAppId) return;

    // Optimistic UI Update
    setAppointments((prev) =>
      prev.map((app) => (app._id === draggedAppId ? { ...app, status: newStatus } : app))
    );

    try {
      const res = await authFetch(`/api/appointments/${draggedAppId}/status`, {
        method: "PUT",
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        // Revert on error
        loadInitialData();
        setError(data.message || "Failed to update appointment status");
      } else {
        setSuccess(`Appointment status moved to "${newStatus}"`);
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (err) {
      loadInitialData();
      setError("Network error while moving appointment");
    } finally {
      setDraggedAppId(null);
    }
  };

  const handleBook = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!selectedPatient) {
      setError("Please select a registered patient first.");
      return;
    }
    if (!selectedDoctor || !bookingDate || !selectedSlot) {
      setError("Please select a doctor, date, and time slot.");
      return;
    }

    if (bookedSlots.includes(selectedSlot)) {
      setError("Conflict error: This time slot is already booked for this doctor.");
      return;
    }

    try {
      const res = await authFetch("/api/appointments", {
        method: "POST",
        body: JSON.stringify({
          patientId: selectedPatient._id,
          doctorId: selectedDoctor._id,
          date: bookingDate,
          timeSlot: selectedSlot,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess("Appointment booked successfully!");
        setSelectedPatient(null);
        setSelectedDoctor(null);
        setBookingDate(new Date().toISOString().split("T")[0]);
        setAvailableSlots([]);
        setBookedSlots([]);
        setAllSlots([]);
        setSelectedSlot("");
        setPatientSearch("");
        setPatients([]);
        setBookingStep(1);
        loadInitialData();

        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(data.message || "Failed to book appointment");
      }
    } catch (err) {
      setError("Network error during booking");
    }
  };

  const handleCancelAppointment = async (id, patientName) => {
    const reason = window.prompt(`Enter reason for cancelling ${patientName}'s appointment:`);
    if (reason === null) return;

    try {
      const res = await authFetch(`/api/appointments/${id}/status`, {
        method: "PUT",
        body: JSON.stringify({
          status: "Cancelled",
          cancellationReason: reason || "Receptionist cancel request",
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess("Appointment cancelled successfully.");
        loadInitialData();
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(data.message || "Failed to cancel appointment");
      }
    } catch (err) {
      setError("Network error");
    }
  };

  const filteredDoctors = doctors.filter(
    (d) => specialtyFilter === "All" || d.specialization === specialtyFilter
  );

  const specialties = ["All", ...new Set(doctors.map((d) => d.specialization).filter(Boolean))];

  const kanbanColumns = [
    { status: "Scheduled", label: "Scheduled Slots", color: "#38bdf8" },
    { status: "Checked In", label: "Checked In (Triage)", color: "#f59e0b" },
    { status: "In Consultation", label: "In Consultation", color: "#a78bfa" },
    { status: "Completed", label: "Completed", color: "#10b981" },
    { status: "Cancelled", label: "Cancelled", color: "#ef4444" },
  ];

  return (
    <div className="scheduling-page">
      {/* Header Row & Controls */}
      <div className="page-header-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1>Appointment Scheduling Suite</h1>
          <p className="subtitle">Real-time drag-and-drop status board, doctor selection, & conflict-free booking</p>
        </div>

        {/* View Mode Toggle Switch */}
        <div style={{ display: "flex", gap: "8px", background: "var(--color-surface)", padding: "4px", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-border)" }}>
          <button
            className={`btn ${viewMode === "kanban" ? "btn-primary" : "btn-muted"}`}
            style={{ padding: "6px 12px", fontSize: "12px" }}
            onClick={() => setViewMode("kanban")}
          >
            <Kanban size={14} style={{ marginRight: "6px" }} /> Kanban Board
          </button>
          <button
            className={`btn ${viewMode === "list" ? "btn-primary" : "btn-muted"}`}
            style={{ padding: "6px 12px", fontSize: "12px" }}
            onClick={() => setViewMode("list")}
          >
            <List size={14} style={{ marginRight: "6px" }} /> Queue Table
          </button>
        </div>
      </div>

      {success && <div className="alert alert-success mb-4 flex items-center"><CheckCircle size={16} className="mr-2" />{success}</div>}
      {error && <div className="alert alert-danger mb-4 flex items-center"><ShieldAlert size={16} className="mr-2" />{error}</div>}

      {/* Main Grid: Booking Stepper Form & Live Queue */}
      <div className="scheduling-split" style={{ display: "grid", gridTemplateColumns: "360px 1fr", gap: "24px" }}>
        
        {/* Left Column: Interactive Multi-Step Booking Wizard */}
        <div className="card booking-card">
          <div className="card-header">
            <div className="card-title">
              <Calendar className="icon-purple" size={18} /> Booking Wizard
            </div>
            <span className="badge badge-blue">Step {bookingStep} of 3</span>
          </div>

          <div className="card-body">
            {/* Stepper Progress Bar */}
            <div className="stepper-container">
              <div className={`stepper-step ${bookingStep >= 1 ? "active" : ""} ${bookingStep > 1 ? "completed" : ""}`}>
                <div className="step-icon">{bookingStep > 1 ? <Check size={14} /> : "1"}</div>
                <div className="step-label">Patient</div>
              </div>
              <div className={`stepper-step ${bookingStep >= 2 ? "active" : ""} ${bookingStep > 2 ? "completed" : ""}`}>
                <div className="step-icon">{bookingStep > 2 ? <Check size={14} /> : "2"}</div>
                <div className="step-label">Doctor</div>
              </div>
              <div className={`stepper-step ${bookingStep >= 3 ? "active" : ""}`}>
                <div className="step-icon">3</div>
                <div className="step-label">Slot</div>
              </div>
              <div className="stepper-line">
                <div className="stepper-line-progress" style={{ width: bookingStep === 1 ? "0%" : bookingStep === 2 ? "50%" : "100%" }} />
              </div>
            </div>

            {/* STEP 1: Select Patient */}
            {bookingStep === 1 && (
              <div>
                <h4 style={{ fontSize: "14px", fontWeight: "700", marginBottom: "12px" }}>1. Find or Select Patient</h4>
                {selectedPatient ? (
                  <div className="card" style={{ padding: "14px", background: "rgba(124, 58, 237, 0.08)", borderColor: "var(--color-primary)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <strong style={{ fontSize: "15px", color: "#fff" }}>{selectedPatient.name}</strong>
                        <div style={{ fontSize: "12px", color: "var(--color-primary-light)" }}>ID: {selectedPatient.patientId}</div>
                      </div>
                      <button className="btn btn-muted btn-sm" onClick={() => setSelectedPatient(null)}>Change</button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <form onSubmit={handlePatientSearch} style={{ display: "flex", gap: "8px" }}>
                      <div className="input-with-icon flex-1">
                        <Search className="input-icon" size={16} />
                        <input
                          type="text"
                          placeholder="Search patient name or ID..."
                          value={patientSearch}
                          onChange={(e) => setPatientSearch(e.target.value)}
                        />
                      </div>
                      <button type="submit" className="btn btn-secondary">Search</button>
                    </form>

                    {patients.length > 0 && (
                      <div style={{ marginTop: "12px", maxHeight: "200px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "6px" }}>
                        {patients.map((p) => (
                          <div
                            key={p._id}
                            style={{
                              padding: "10px",
                              background: "var(--color-surface-2)",
                              borderRadius: "var(--radius-sm)",
                              cursor: "pointer",
                              border: "1px solid var(--color-border)",
                            }}
                            onClick={() => setSelectedPatient(p)}
                          >
                            <div style={{ fontSize: "13px", fontWeight: "600", color: "#fff" }}>{p.name}</div>
                            <div style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>ID: {p.patientId} | CNIC: {p.cnic}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <button
                  className="btn btn-primary w-full mt-6"
                  disabled={!selectedPatient}
                  onClick={() => setBookingStep(2)}
                >
                  Next: Select Doctor <ChevronRight size={16} style={{ marginLeft: "4px" }} />
                </button>
              </div>
            )}

            {/* STEP 2: Doctor Selection Cards */}
            {bookingStep === 2 && (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                  <h4 style={{ fontSize: "14px", fontWeight: "700" }}>2. Choose Specialist</h4>
                  <button className="btn btn-muted btn-sm" onClick={() => setBookingStep(1)}>Back</button>
                </div>

                {/* Specialty Pill Filter */}
                <div style={{ display: "flex", gap: "6px", overflowX: "auto", paddingBottom: "8px", marginBottom: "12px" }}>
                  {specialties.map((spec) => (
                    <button
                      key={spec}
                      className={`btn btn-sm ${specialtyFilter === spec ? "btn-primary" : "btn-muted"}`}
                      style={{ fontSize: "11px", padding: "3px 8px", whiteSpace: "nowrap" }}
                      onClick={() => setSpecialtyFilter(spec)}
                    >
                      {spec}
                    </button>
                  ))}
                </div>

                <div style={{ maxHeight: "280px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "10px" }}>
                  {filteredDoctors.map((doc) => {
                    const isSelected = selectedDoctor?._id === doc._id;
                    return (
                      <div
                        key={doc._id}
                        className={`doctor-card ${isSelected ? "selected" : ""}`}
                        style={{ padding: "12px" }}
                        onClick={() => setSelectedDoctor(doc)}
                      >
                        <div className="doctor-card-header">
                          <div className="doctor-avatar-circle" style={{ width: "40px", height: "40px", fontSize: "16px" }}>
                            {doc.name.replace("Dr. ", "")[0]}
                          </div>
                          <div className="doctor-card-info">
                            <h4 style={{ fontSize: "14px" }}>{doc.name}</h4>
                            <span className="specialty-pill">{doc.specialization}</span>
                          </div>
                        </div>
                        <div className="doctor-card-stats" style={{ fontSize: "11px", marginTop: "4px" }}>
                          <span>Fee: <strong>Rs. {doc.consultationFee}</strong></span>
                          <span style={{ display: "flex", alignItems: "center", gap: "2px", color: "#f59e0b" }}>
                            <Star size={12} fill="#f59e0b" /> 4.9
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <button
                  className="btn btn-primary w-full mt-6"
                  disabled={!selectedDoctor}
                  onClick={() => setBookingStep(3)}
                >
                  Next: Time Slot <ChevronRight size={16} style={{ marginLeft: "4px" }} />
                </button>
              </div>
            )}

            {/* STEP 3: Slot Picker & Confirm */}
            {bookingStep === 3 && (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                  <h4 style={{ fontSize: "14px", fontWeight: "700" }}>3. Choose Slot & Confirm</h4>
                  <button className="btn btn-muted btn-sm" onClick={() => setBookingStep(2)}>Back</button>
                </div>

                <div className="form-group mb-3">
                  <label>Date</label>
                  <input
                    type="date"
                    min={new Date().toISOString().split("T")[0]}
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                  />
                </div>

                {loadingSlots ? (
                  <div className="text-center py-4" style={{ fontSize: "13px" }}>
                    <span className="spinner" /> Querying schedule timetable...
                  </div>
                ) : allSlots.length > 0 ? (
                  <div className="slot-grid">
                    {allSlots.map((slot) => {
                      const isBooked = bookedSlots.includes(slot);
                      const isSelected = selectedSlot === slot;
                      return (
                        <button
                          key={slot}
                          type="button"
                          disabled={isBooked}
                          className={`slot-btn ${isBooked ? "booked" : isSelected ? "selected" : ""}`}
                          onClick={() => !isBooked && setSelectedSlot(slot)}
                        >
                          {slot}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="idle-state py-2" style={{ fontSize: "12px", opacity: 0.7 }}>
                    {availabilityMessage || "No slots loaded."}
                  </div>
                )}

                <button
                  onClick={handleBook}
                  className="btn btn-success w-full mt-6"
                  disabled={!selectedPatient || !selectedDoctor || !bookingDate || !selectedSlot}
                >
                  <UserCheck size={18} style={{ marginRight: "6px" }} /> Confirm Booking
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Interactive Kanban Board or Queue Table */}
        <div>
          {viewMode === "kanban" ? (
            /* Kanban Swimlane Board */
            <div className="kanban-board">
              {kanbanColumns.map((col) => {
                const colApps = appointments.filter((a) => (a.status || "Scheduled") === col.status);
                const isOver = dragOverColumn === col.status;

                return (
                  <div
                    key={col.status}
                    className={`kanban-column ${isOver ? "drag-over" : ""}`}
                    onDragOver={(e) => handleDragOver(e, col.status)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, col.status)}
                  >
                    <div className="kanban-header">
                      <div className="kanban-title">
                        <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: col.color }} />
                        <span>{col.label}</span>
                      </div>
                      <span className="kanban-count">{colApps.length}</span>
                    </div>

                    <div className="kanban-cards-wrapper">
                      {colApps.length === 0 ? (
                        <div style={{ textAlign: "center", padding: "20px", fontSize: "12px", color: "var(--color-text-muted)", border: "1px dashed var(--color-border)", borderRadius: "var(--radius-sm)" }}>
                          Drag appointments here
                        </div>
                      ) : (
                        colApps.map((app) => (
                          <div
                            key={app._id}
                            className="kanban-card"
                            draggable
                            onDragStart={(e) => handleDragStart(e, app._id)}
                          >
                            <div className="kanban-card-patient">
                              {app.patientId?.name || "Patient Record"}
                            </div>
                            <div className="kanban-card-meta">
                              <div><strong>Doctor:</strong> {app.doctorId?.name || "Unassigned"}</div>
                              <div><strong>Slot:</strong> {app.timeSlot}</div>
                              <div style={{ fontSize: "10px", color: "var(--color-text-muted)" }}>
                                {new Date(app.date).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Structured Queue Table View */
            <div className="card schedule-card">
              <div className="card-header">
                <div className="card-title">
                  <Clock className="icon-purple" size={18} /> Active Appointment Log
                </div>
              </div>
              <div className="card-body scroll-panel">
                {appointments.length === 0 ? (
                  <div className="idle-state">No appointments booked for this cycle.</div>
                ) : (
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Date / Slot</th>
                        <th>Patient Name</th>
                        <th>Assigned Doctor</th>
                        <th>Booking Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {appointments.map((app) => (
                        <tr key={app._id}>
                          <td style={{ whiteSpace: "nowrap" }}>
                            <strong>{new Date(app.date).toLocaleDateString()}</strong>
                            <div style={{ fontSize: "11px", opacity: 0.7 }}>{app.timeSlot}</div>
                          </td>
                          <td>
                            <strong>{app.patientId?.name || "Deactivated"}</strong>
                            <div style={{ fontSize: "10px", opacity: 0.6 }}>ID: {app.patientId?.patientId || "N/A"}</div>
                          </td>
                          <td>
                            <strong>{app.doctorId?.name || "Deactivated"}</strong>
                            <div style={{ fontSize: "10px", opacity: 0.6 }}>{app.doctorId?.specialization || "N/A"}</div>
                          </td>
                          <td>
                            <span className={`badge ${app.status === "Scheduled" ? "badge-blue" : app.status === "Completed" ? "badge-success" : "badge-red"}`}>
                              {app.status}
                            </span>
                          </td>
                          <td>
                            {app.status === "Scheduled" && (
                              <button
                                className="btn btn-danger btn-sm"
                                onClick={() => handleCancelAppointment(app._id, app.patientId?.name)}
                              >
                                Cancel
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


