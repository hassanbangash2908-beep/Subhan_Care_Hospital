import { useAuth } from "../context/AuthContext";
import { User, Clock, Search, Bell, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [time, setTime] = useState(new Date().toLocaleTimeString());
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const notifications = [
    { id: 1, title: "Emergency Triage", desc: "Patient #P-8802 registered in ER", time: "2 min ago", unread: true },
    { id: 2, title: "Lab Results Ready", desc: "CBC report uploaded for Patient Tariq", time: "15 min ago", unread: true },
    { id: 3, title: "Pharmacy Restock", desc: "Amoxicillin stock reordered", time: "1 hour ago", unread: false },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Keyboard shortcut Ctrl+K or Cmd+K to trigger search modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setShowSearchModal((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (!user) return null;

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setShowSearchModal(false);
    navigate(`/patients?search=${encodeURIComponent(searchQuery)}`);
    setSearchQuery("");
  };

  return (
    <>
      <header className="navbar">
        {/* Left: Greeting + Operational Live Status */}
        <div className="navbar-left" style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <h2 className="navbar-greeting">
            Welcome back, <span className="highlight">{user.username}</span>
          </h2>
          <div className="live-badge" title="Real-time Synchronization Active">
            <span className="pulse-dot" />
            <span>SYSTEM LIVE</span>
          </div>
        </div>

        {/* Center/Right: Quick Search Trigger, Notifications & User Info */}
        <div className="navbar-right">
          <button
            className="btn btn-secondary"
            style={{
              padding: "6px 14px",
              fontSize: "13px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              borderRadius: "99px",
              background: "rgba(255,255,255,0.03)",
            }}
            onClick={() => setShowSearchModal(true)}
          >
            <Search size={14} color="#94a3b8" />
            <span style={{ color: "#94a3b8" }}>Search patients, doctors...</span>
            <span className="search-kbd">⌘K</span>
          </button>

          <div className="navbar-clock">
            <Clock size={15} />
            <span className="clock-text">{time}</span>
          </div>

          {/* Notifications Drawer Toggle */}
          <div style={{ position: "relative" }}>
            <button
              className="btn btn-secondary"
              style={{
                width: "36px",
                height: "36px",
                padding: 0,
                borderRadius: "50%",
                position: "relative",
              }}
              onClick={() => setShowNotifications(!showNotifications)}
              aria-label="Notifications"
            >
              <Bell size={16} />
              {notifications.some((n) => n.unread) && (
                <span
                  style={{
                    position: "absolute",
                    top: "2px",
                    right: "2px",
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: "#ef4444",
                  }}
                />
              )}
            </button>

            {showNotifications && (
              <div
                style={{
                  position: "absolute",
                  top: "46px",
                  right: "0",
                  width: "320px",
                  background: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "var(--radius-md)",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
                  zIndex: 300,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    padding: "12px 16px",
                    borderBottom: "1px solid var(--color-border)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    fontWeight: "600",
                    fontSize: "14px",
                  }}
                >
                  <span>Notifications</span>
                  <span className="badge badge-success" style={{ fontSize: "10px" }}>
                    Live Feeds
                  </span>
                </div>
                <div style={{ maxHeight: "280px", overflowY: "auto" }}>
                  {notifications.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        padding: "12px 16px",
                        borderBottom: "1px solid rgba(255,255,255,0.05)",
                        background: item.unread ? "rgba(124, 58, 237, 0.05)" : "transparent",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", fontWeight: "600" }}>
                        <span>{item.title}</span>
                        <span style={{ fontSize: "10px", color: "var(--color-text-muted)" }}>{item.time}</span>
                      </div>
                      <p style={{ fontSize: "12px", color: "var(--color-text-muted)", marginTop: "4px" }}>
                        {item.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="navbar-divider" />

          <div className="navbar-profile">
            <User size={15} />
            <span>{user.role}</span>
          </div>
        </div>
      </header>

      {/* Global Quick Search Modal */}
      {showSearchModal && (
        <div className="global-search-modal" onClick={() => setShowSearchModal(false)}>
          <div className="global-search-box" onClick={(e) => e.stopPropagation()}>
            <form onSubmit={handleSearchSubmit}>
              <div className="global-search-input-wrap">
                <Search size={20} color="#a78bfa" />
                <input
                  type="text"
                  placeholder="Type to search patients, doctors, appointments, or medical records..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                />
                <button type="button" className="btn btn-muted" onClick={() => setShowSearchModal(false)}>
                  ESC
                </button>
              </div>
            </form>
            <div style={{ padding: "16px 20px", fontSize: "12px", color: "var(--color-text-muted)" }}>
              <span>Press <strong style={{ color: "#fff" }}>Enter</strong> to search across all hospital modules</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

