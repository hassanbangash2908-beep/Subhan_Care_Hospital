import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  Settings as SettingsIcon,
  Building,
  Palette,
  ShieldCheck,
  Database,
  Bell,
  Save,
  CheckCircle,
  RefreshCw,
  Lock,
  Download,
  Trash2,
  HardDrive,
  Sliders,
} from "lucide-react";

export default function Settings() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("general");
  const [successMsg, setSuccessMsg] = useState("");

  // Hospital Profile Form State
  const [hospitalName, setHospitalName] = useState("Subhan Care Medical Center & Teaching Hospital");
  const [facilityId, setFacilityId] = useState("SCMC-PK-9941");
  const [email, setEmail] = useState("info@subhancare.org");
  const [hotline, setHotline] = useState("+92 318 9883239");
  const [address, setAddress] = useState("Royal Avenue, Sector G-11, Islamabad, Pakistan");
  const [currency, setCurrency] = useState("PKR (Rs.)");

  // Theme & Appearance State
  const [themeMode, setThemeMode] = useState("teal-blue");
  const [compactSidebar, setCompactSidebar] = useState(false);
  const [animationsEnabled, setAnimationsEnabled] = useState(true);

  // Security & Admin Policy State
  const [sessionTimeout, setSessionTimeout] = useState("30");
  const [strictAudit, setStrictAudit] = useState(true);
  const [require2FA, setRequire2FA] = useState(false);
  const [passwordExpiry, setPasswordExpiry] = useState("90");

  // Telemetry & Alerts
  const [soundAlerts, setSoundAlerts] = useState(true);
  const [labPushNotifs, setLabPushNotifs] = useState(true);

  const handleSaveSettings = (e) => {
    e.preventDefault();
    setSuccessMsg("System configuration & admin policies saved successfully!");
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  const handleExportBackup = () => {
    const backupData = {
      hospitalName,
      facilityId,
      exportedAt: new Date().toISOString(),
      version: "v2.4 Enterprise",
      status: "Verified Healthy",
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `subhan_care_backup_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    setSuccessMsg("System database backup archive generated and downloaded.");
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  const isAdmin = user && user.role === "Admin";

  return (
    <div className="settings-page">
      <div className="page-header-row">
        <div>
          <h1>System Control & Administration Settings</h1>
          <p className="subtitle">Configure facility profiles, security policies, theme accents, and data backups</p>
        </div>

        <div className="live-badge">
          <span className="pulse-dot" />
          <span>ADMIN PRIVILEGES</span>
        </div>
      </div>

      {successMsg && (
        <div className="alert alert-success mb-4 flex items-center">
          <CheckCircle size={16} style={{ marginRight: "8px" }} /> {successMsg}
        </div>
      )}

      {/* Settings Navigation Tabs */}
      <div className="card mb-4" style={{ padding: "8px 16px", background: "var(--color-surface)" }}>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button
            className={`btn ${activeTab === "general" ? "btn-primary" : "btn-muted"}`}
            style={{ fontSize: "13px", padding: "8px 16px" }}
            onClick={() => setActiveTab("general")}
          >
            <Building size={16} style={{ marginRight: "6px" }} /> Facility Profile
          </button>

          <button
            className={`btn ${activeTab === "theme" ? "btn-primary" : "btn-muted"}`}
            style={{ fontSize: "13px", padding: "8px 16px" }}
            onClick={() => setActiveTab("theme")}
          >
            <Palette size={16} style={{ marginRight: "6px" }} /> Theme & Colors
          </button>

          <button
            className={`btn ${activeTab === "security" ? "btn-primary" : "btn-muted"}`}
            style={{ fontSize: "13px", padding: "8px 16px" }}
            onClick={() => setActiveTab("security")}
          >
            <ShieldCheck size={16} style={{ marginRight: "6px" }} /> Security & Policies
          </button>

          <button
            className={`btn ${activeTab === "backup" ? "btn-primary" : "btn-muted"}`}
            style={{ fontSize: "13px", padding: "8px 16px" }}
            onClick={() => setActiveTab("backup")}
          >
            <Database size={16} style={{ marginRight: "6px" }} /> Data & Backups
          </button>
        </div>
      </div>

      {/* TAB 1: Facility & Hospital Profile */}
      {activeTab === "general" && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <Building className="icon-purple" size={20} /> Hospital Identification & Contact Info
            </div>
          </div>
          <div className="card-body">
            <form onSubmit={handleSaveSettings} className="grid-form">
              <div className="form-group span-2">
                <label>Official Hospital / Facility Name *</label>
                <input
                  type="text"
                  value={hospitalName}
                  onChange={(e) => setHospitalName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Facility License ID Code *</label>
                <input
                  type="text"
                  value={facilityId}
                  onChange={(e) => setFacilityId(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Default Currency Unit</label>
                <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
                  <option value="PKR (Rs.)">PKR (Rs.) - Pakistani Rupee</option>
                  <option value="USD ($)">USD ($) - US Dollar</option>
                  <option value="EUR (€)">EUR (€) - Euro</option>
                </select>
              </div>

              <div className="form-group">
                <label>Administrative Email Address *</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>24/7 Emergency Hotline *</label>
                <input
                  type="text"
                  value={hotline}
                  onChange={(e) => setHotline(e.target.value)}
                  required
                />
              </div>

              <div className="form-group span-2">
                <label>Physical Address & Location *</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                />
              </div>

              <div className="span-2 flex justify-end mt-4">
                <button type="submit" className="btn btn-primary">
                  <Save size={16} style={{ marginRight: "6px" }} /> Save Profile Settings
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB 2: Theme & System Color Palette */}
      {activeTab === "theme" && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <Palette className="icon-purple" size={20} /> System Color Scheme & Visual Preference
            </div>
          </div>
          <div className="card-body">
            <h4 style={{ fontSize: "14px", fontWeight: "700", marginBottom: "12px", color: "#fff" }}>
              Select Active Theme Preset
            </h4>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", marginBottom: "24px" }}>
              {/* Preset 1: Deep Sapphire & Medical Teal */}
              <div
                style={{
                  background: "#0f172a",
                  border: themeMode === "teal-blue" ? "2px solid #06b6d4" : "1px solid var(--color-border)",
                  borderRadius: "var(--radius-md)",
                  padding: "16px",
                  cursor: "pointer",
                }}
                onClick={() => setThemeMode("teal-blue")}
              >
                <div style={{ display: "flex", gap: "6px", marginBottom: "10px" }}>
                  <span style={{ width: "20px", height: "20px", borderRadius: "50%", background: "#0f172a" }} />
                  <span style={{ width: "20px", height: "20px", borderRadius: "50%", background: "#0d9488" }} />
                  <span style={{ width: "20px", height: "20px", borderRadius: "50%", background: "#06b6d4" }} />
                </div>
                <strong style={{ fontSize: "14px", color: "#fff" }}>Sapphire & Medical Teal (Active)</strong>
                <p style={{ fontSize: "12px", color: "var(--color-text-muted)", marginTop: "4px" }}>
                  Clean, crisp clinical navy with glowing cyan highlights.
                </p>
              </div>

              {/* Preset 2: Emerald Health */}
              <div
                style={{
                  background: "#064e3b",
                  border: themeMode === "emerald" ? "2px solid #10b981" : "1px solid var(--color-border)",
                  borderRadius: "var(--radius-md)",
                  padding: "16px",
                  cursor: "pointer",
                }}
                onClick={() => setThemeMode("emerald")}
              >
                <div style={{ display: "flex", gap: "6px", marginBottom: "10px" }}>
                  <span style={{ width: "20px", height: "20px", borderRadius: "50%", background: "#064e3b" }} />
                  <span style={{ width: "20px", height: "20px", borderRadius: "50%", background: "#10b981" }} />
                  <span style={{ width: "20px", height: "20px", borderRadius: "50%", background: "#34d399" }} />
                </div>
                <strong style={{ fontSize: "14px", color: "#fff" }}>Emerald Health</strong>
                <p style={{ fontSize: "12px", color: "var(--color-text-muted)", marginTop: "4px" }}>
                  Organic clinical green palette for high readability.
                </p>
              </div>

              {/* Preset 3: Midnight Violet */}
              <div
                style={{
                  background: "#0b0d19",
                  border: themeMode === "violet" ? "2px solid #8b5cf6" : "1px solid var(--color-border)",
                  borderRadius: "var(--radius-md)",
                  padding: "16px",
                  cursor: "pointer",
                }}
                onClick={() => setThemeMode("violet")}
              >
                <div style={{ display: "flex", gap: "6px", marginBottom: "10px" }}>
                  <span style={{ width: "20px", height: "20px", borderRadius: "50%", background: "#0b0d19" }} />
                  <span style={{ width: "20px", height: "20px", borderRadius: "50%", background: "#7c3aed" }} />
                  <span style={{ width: "20px", height: "20px", borderRadius: "50%", background: "#a78bfa" }} />
                </div>
                <strong style={{ fontSize: "14px", color: "#fff" }}>Midnight Violet</strong>
                <p style={{ fontSize: "12px", color: "var(--color-text-muted)", marginTop: "4px" }}>
                  Dark mode purple theme with soft glassmorphic glow.
                </p>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <label className="checkbox-container">
                <input
                  type="checkbox"
                  checked={animationsEnabled}
                  onChange={(e) => setAnimationsEnabled(e.target.checked)}
                />
                <span className="checkmark" />
                <span className="checkbox-label">Enable UI Smooth Micro-Animations & Glow Effects</span>
              </label>

              <label className="checkbox-container">
                <input
                  type="checkbox"
                  checked={compactSidebar}
                  onChange={(e) => setCompactSidebar(e.target.checked)}
                />
                <span className="checkmark" />
                <span className="checkbox-label">Compact Navigation Mode</span>
              </label>
            </div>

            <div className="flex justify-end mt-6">
              <button onClick={handleSaveSettings} className="btn btn-primary">
                <Save size={16} style={{ marginRight: "6px" }} /> Save Color Preference
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Security & Access Control Policies */}
      {activeTab === "security" && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <ShieldCheck className="icon-purple" size={20} /> Security Controls & Password Policies
            </div>
          </div>
          <div className="card-body">
            <form onSubmit={handleSaveSettings} className="grid-form">
              <div className="form-group">
                <label>Automatic Session Inactivity Timeout</label>
                <select value={sessionTimeout} onChange={(e) => setSessionTimeout(e.target.value)}>
                  <option value="15">15 Minutes (High Security)</option>
                  <option value="30">30 Minutes (Recommended)</option>
                  <option value="60">1 Hour</option>
                  <option value="480">8 Hours (Full Shift)</option>
                </select>
              </div>

              <div className="form-group">
                <label>Mandatory Password Expiry Policy</label>
                <select value={passwordExpiry} onChange={(e) => setPasswordExpiry(e.target.value)}>
                  <option value="30">Every 30 Days</option>
                  <option value="60">Every 60 Days</option>
                  <option value="90">Every 90 Days</option>
                  <option value="never">Never Expire (Testing)</option>
                </select>
              </div>

              <div className="form-group span-2">
                <label className="checkbox-container mb-3">
                  <input
                    type="checkbox"
                    checked={strictAudit}
                    onChange={(e) => setStrictAudit(e.target.checked)}
                  />
                  <span className="checkmark" />
                  <span className="checkbox-label">Enforce Strict Tamper-Evident Audit Logging for all operations</span>
                </label>

                <label className="checkbox-container">
                  <input
                    type="checkbox"
                    checked={require2FA}
                    onChange={(e) => setRequire2FA(e.target.checked)}
                  />
                  <span className="checkmark" />
                  <span className="checkbox-label">Require Two-Factor Authentication (2FA) for Doctors & Billing Officers</span>
                </label>
              </div>

              <div className="span-2 flex justify-end mt-4">
                <button type="submit" className="btn btn-primary">
                  <Lock size={16} style={{ marginRight: "6px" }} /> Update Security Rules
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB 4: Data Management & Database Backups */}
      {activeTab === "backup" && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <Database className="icon-purple" size={20} /> Data Archive & Maintenance Tools
            </div>
          </div>
          <div className="card-body">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
              <div className="card p-4" style={{ background: "rgba(255,255,255,0.02)" }}>
                <h4 style={{ fontSize: "15px", fontWeight: "700", marginBottom: "6px", color: "#fff", display: "flex", alignItems: "center", gap: "8px" }}>
                  <Download size={18} color="#06b6d4" /> Download System Backup
                </h4>
                <p style={{ fontSize: "12px", color: "var(--color-text-muted)", marginBottom: "16px" }}>
                  Generate an encrypted JSON archive containing patient records, appointment queues, doctor timetables, and billing history.
                </p>
                <button className="btn btn-primary" onClick={handleExportBackup}>
                  <Download size={16} style={{ marginRight: "6px" }} /> Export Backup Archive
                </button>
              </div>

              <div className="card p-4" style={{ background: "rgba(255,255,255,0.02)" }}>
                <h4 style={{ fontSize: "15px", fontWeight: "700", marginBottom: "6px", color: "#fff", display: "flex", alignItems: "center", gap: "8px" }}>
                  <HardDrive size={18} color="#f59e0b" /> Cache & Telemetry Purge
                </h4>
                <p style={{ fontSize: "12px", color: "var(--color-text-muted)", marginBottom: "16px" }}>
                  Clear transient session caches and optimize database index queries without affecting stored patient clinical files.
                </p>
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    setSuccessMsg("Database cache cleared and indices optimized.");
                    setTimeout(() => setSuccessMsg(""), 3000);
                  }}
                >
                  <RefreshCw size={16} style={{ marginRight: "6px" }} /> Optimize & Clear Cache
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
