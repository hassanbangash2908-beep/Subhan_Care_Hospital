import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { 
  KeyRound, 
  User, 
  Loader2, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  Activity, 
  Hospital, 
  Sparkles, 
  CheckCircle2,
  Lock,
  ArrowRight,
  Stethoscope,
  Pill,
  BadgePercent
} from "lucide-react";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!username || !password) {
      setError("Please enter both username and password");
      setLoading(false);
      return;
    }

    const res = await login(username, password);
    setLoading(false);

    if (res.success) {
      navigate("/");
    } else {
      setError(res.error || "Invalid credentials. Please verify your login details.");
    }
  };

  const handleQuickFill = (demoUser, demoPass) => {
    setUsername(demoUser);
    setPassword(demoPass);
    setError("");
  };

  return (
    <div className="auth-page-wrapper">
      {/* Ambient medical glow lights */}
      <div className="auth-bg-glow glow-top-left" />
      <div className="auth-bg-glow glow-bottom-right" />
      <div className="auth-grid-pattern" />

      <div className="auth-split-container">
        {/* Left Side: Hospital Branding Hero Banner */}
        <div className="auth-hero-section">
          <div className="auth-hero-badge">
            <span className="status-dot"></span>
            <span>Subhan Care Medical Center</span>
          </div>

          <div className="auth-hero-content">
            <div className="auth-brand-logo">
              <div className="brand-logo-icon">
                <Hospital size={34} />
              </div>
              <div className="brand-logo-sparkle">
                <Activity size={20} />
              </div>
            </div>

            <h1 className="auth-hero-title">
              Subhan Care Clinical <br />
              <span className="text-gradient">Operational Suite</span>
            </h1>

            <p className="auth-hero-description">
              Enterprise digital health platform streamlining OPD triage, Electronic Health Records (EHR), conflict-free scheduling, & automated billing.
            </p>

            <div className="auth-features-list">
              <div className="feature-item">
                <div className="feature-icon">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <h4>Role-Based Access & Audit Compliance</h4>
                  <p>Encrypted clinical records with tamper-evident audit logging</p>
                </div>
              </div>

              <div className="feature-item">
                <div className="feature-icon">
                  <Activity size={18} />
                </div>
                <div>
                  <h4>Real-time OPD & Emergency Telemetry</h4>
                  <p>Instant bed management, triage queues & patient vitals monitor</p>
                </div>
              </div>
            </div>

            {/* Quick Demo Accounts Selection */}
            <div className="demo-credentials-box">
              <div className="demo-box-header">
                <Sparkles size={14} style={{ color: "#38bdf8" }} />
                <span>Select Demo Account to Test:</span>
              </div>
              <div className="demo-pills">
                <button 
                  type="button" 
                  className="demo-pill-btn"
                  onClick={() => handleQuickFill("admin", "Admin@1234")}
                >
                  <ShieldCheck size={13} />
                  <span>Admin</span>
                </button>
                <button 
                  type="button" 
                  className="demo-pill-btn"
                  onClick={() => handleQuickFill("doctor1", "Doctor@123")}
                >
                  <Stethoscope size={13} />
                  <span>Doctor</span>
                </button>
                <button 
                  type="button" 
                  className="demo-pill-btn"
                  onClick={() => handleQuickFill("pharmacist1", "Pharma@123")}
                >
                  <Pill size={13} />
                  <span>Pharmacy</span>
                </button>
              </div>
            </div>
          </div>

          <div className="auth-hero-footer">
            <div className="system-status">
              <CheckCircle2 size={15} style={{ color: "#10b981" }} />
              <span>System operational — Enterprise Edition</span>
            </div>
          </div>
        </div>

        {/* Right Side: Sign In Form Card */}
        <div className="auth-form-section">
          <div className="auth-card-modern">
            <div className="auth-card-header">
              <div className="mobile-brand">
                <Hospital size={26} style={{ color: "#38bdf8" }} />
                <span>Subhan Care HMS</span>
              </div>
              <h2>Portal Sign In</h2>
              <p>Enter your personnel credentials to access your portal</p>
            </div>

            {error && (
              <div className="auth-alert alert-error">
                <Lock size={16} className="alert-icon" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form-modern">
              <div className="form-field-group">
                <label htmlFor="username">Username or Staff ID</label>
                <div className="modern-input-wrapper">
                  <User className="input-icon-left" size={18} />
                  <input
                    type="text"
                    id="username"
                    placeholder="e.g. admin or doc_john"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    autoComplete="username"
                  />
                </div>
              </div>

              <div className="form-field-group">
                <div className="field-label-row">
                  <label htmlFor="password">Security Password</label>
                  <Link to="/forgot-password" className="forgot-password-link">
                    Forgot Password?
                  </Link>
                </div>
                <div className="modern-input-wrapper">
                  <KeyRound className="input-icon-left" size={18} />
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="form-options-row">
                <label className="checkbox-container">
                  <input 
                    type="checkbox" 
                    checked={rememberMe} 
                    onChange={(e) => setRememberMe(e.target.checked)} 
                  />
                  <span className="checkmark"></span>
                  <span className="checkbox-label">Keep me signed in</span>
                </label>
              </div>

              <button 
                type="submit" 
                className="submit-btn-gradient" 
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="spinner-icon animate-spin" size={19} />
                    <span>Authenticating System...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Dashboard</span>
                    <ArrowRight size={18} className="btn-arrow-icon" />
                  </>
                )}
              </button>
            </form>

            <div className="auth-card-footer">
              <div className="security-notice">
                <ShieldCheck size={14} style={{ color: "#38bdf8" }} />
                <span>Restricted Access: Authorized Subhan Care Personnel Only</span>
              </div>
              <p className="copyright-text">
                © {new Date().getFullYear()} Subhan Care Hospital Management System. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


