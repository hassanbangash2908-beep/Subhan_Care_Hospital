import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Loader2, Mail, KeyRound, Lock, ArrowLeft, ShieldCheck, Hospital, CheckCircle2 } from "lucide-react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [step, setStep] = useState(1); // 1 = request OTP, 2 = reset password
  const [devCode, setDevCode] = useState(""); // Dev code helper for local testing
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      setLoading(false);

      if (res.ok) {
        setMessage(data.message);
        if (data.dev_code) {
          setDevCode(data.dev_code);
        }
        setStep(2);
      } else {
        setError(data.message || "Failed to send reset request");
      }
    } catch (err) {
      setLoading(false);
      setError("Network error. Please try again.");
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otp, newPassword }),
      });
      const data = await res.json();
      setLoading(false);

      if (res.ok) {
        setMessage("Password updated successfully! Redirecting to login...");
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        setError(data.message || "Failed to reset password");
      }
    } catch (err) {
      setLoading(false);
      setError("Network error. Please try again.");
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-bg-glow glow-top-left" />
      <div className="auth-bg-glow glow-bottom-right" />
      <div className="auth-grid-pattern" />

      <div className="auth-centered-container">
        <div className="auth-card-modern">
          <div className="auth-card-header text-center">
            <div className="auth-centered-logo">
              <Hospital size={28} className="text-primary-light" />
            </div>
            <h2>Password Recovery</h2>
            <p>Subhan Care Personnel Security Portal</p>
          </div>

          {error && (
            <div className="auth-alert alert-error">
              <Lock size={16} className="alert-icon" />
              <span>{error}</span>
            </div>
          )}

          {message && (
            <div className="auth-alert alert-success">
              <CheckCircle2 size={16} className="alert-icon" />
              <span>{message}</span>
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleRequestOtp} className="auth-form-modern">
              <div className="form-field-group">
                <label htmlFor="email">Registered Email Address</label>
                <div className="modern-input-wrapper">
                  <Mail className="input-icon-left" size={18} />
                  <input
                    type="email"
                    id="email"
                    placeholder="e.g. staff@subhancare.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="submit-btn-gradient" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="spinner-icon animate-spin" size={19} />
                    <span>Sending Code...</span>
                  </>
                ) : (
                  <span>Request Verification Code</span>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="auth-form-modern">
              {devCode && (
                <div className="auth-alert alert-info">
                  <strong>Development Mode Code:</strong> Use OTP <code>{devCode}</code>
                </div>
              )}

              <div className="form-field-group">
                <label htmlFor="otp">6-Digit Verification Code (OTP)</label>
                <div className="modern-input-wrapper">
                  <KeyRound className="input-icon-left" size={18} />
                  <input
                    type="text"
                    id="otp"
                    placeholder="Enter code"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-field-group">
                <label htmlFor="newPassword">New Security Password</label>
                <div className="modern-input-wrapper">
                  <Lock className="input-icon-left" size={18} />
                  <input
                    type="password"
                    id="newPassword"
                    placeholder="Min 8 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="submit-btn-gradient" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="spinner-icon animate-spin" size={19} />
                    <span>Updating Password...</span>
                  </>
                ) : (
                  <span>Reset & Update Password</span>
                )}
              </button>
            </form>
          )}

          <div className="auth-card-footer">
            <Link to="/login" className="back-login-link">
              <ArrowLeft size={16} />
              <span>Back to Login</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

