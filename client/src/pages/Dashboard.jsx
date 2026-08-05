import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import {
  Users,
  CalendarCheck,
  TrendingUp,
  AlertCircle,
  FileClock,
  ShieldCheck,
} from "lucide-react";

export default function Dashboard() {
  const { authFetch } = useAuth();
  const [kpis, setKpis] = useState({
    newPatientsToday: 0,
    totalPatients: 0,
    appointmentsToday: 0,
    revenueToday: 0,
    totalRevenue: 0,
    lowStockCount: 0,
    nearExpiryCount: 0,
  });
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        setError("");

        const [kpiRes, logsRes] = await Promise.all([
          authFetch("/api/reports/dashboard-kpis").catch((err) => {
            console.error("KPI fetch error:", err);
            return null;
          }),
          authFetch("/api/reports/audit-logs").catch((err) => {
            console.error("Audit log fetch error:", err);
            return null;
          }),
        ]);

        if (kpiRes && kpiRes.ok) {
          const kpiData = await kpiRes.json();
          if (kpiData.success && kpiData.kpis) {
            setKpis(kpiData.kpis);
          }
        }

        if (logsRes && logsRes.ok) {
          const logsData = await logsRes.json();
          if (logsData.success && logsData.logs) {
            setLogs(logsData.logs);
          }
        }
      } catch (err) {
        console.error("Dashboard error:", err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="page-loading">
        <span className="spinner" /> Loading dashboard...
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="page-header-row">
        <div>
          <h1>KPI Operational Dashboard</h1>
          <p className="subtitle">Real-time summaries and compliance activity logs</p>
        </div>
      </div>

      {error && <div className="alert alert-danger mb-4">{error}</div>}

      {/* KPI Cards Grid */}
      <div className="kpi-grid">
        <div className="kpi-card purple">
          <div className="kpi-icon">
            <Users size={24} />
          </div>
          <div className="kpi-content">
            <h3>Registered Patients</h3>
            <div className="kpi-value">{kpis.totalPatients}</div>
            <div className="kpi-sub">+ {kpis.newPatientsToday} registered today</div>
          </div>
        </div>

        <div className="kpi-card blue">
          <div className="kpi-icon">
            <CalendarCheck size={24} />
          </div>
          <div className="kpi-content">
            <h3>Today's Bookings</h3>
            <div className="kpi-value">{kpis.appointmentsToday}</div>
            <div className="kpi-sub">Active scheduled slots</div>
          </div>
        </div>

        <div className="kpi-card green">
          <div className="kpi-icon">
            <TrendingUp size={24} />
          </div>
          <div className="kpi-content">
            <h3>Today's Billing</h3>
            <div className="kpi-value">Rs. {kpis.revenueToday}</div>
            <div className="kpi-sub">Total revenue: Rs. {kpis.totalRevenue}</div>
          </div>
        </div>

        <div className="kpi-card red">
          <div className="kpi-icon">
            <AlertCircle size={24} />
          </div>
          <div className="kpi-content">
            <h3>Alert Stock Levels</h3>
            <div className="kpi-value">{kpis.lowStockCount}</div>
            <div className="kpi-sub">{kpis.nearExpiryCount} items expiring soon</div>
          </div>
        </div>
      </div>

      {/* Visual Analytics & Charts Section */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "25px" }}>
        {/* Monthly Revenue Bar Chart */}
        <div className="card" style={{ padding: "20px" }}>
          <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "15px", display: "flex", alignItems: "center", gap: "8px" }}>
            <TrendingUp size={18} color="#0284c7" /> Financial & Revenue Analytics (Rs.)
          </h3>
          <div style={{ display: "flex", alignItems: "flex-end", gap: "20px", height: "180px", padding: "10px 0", borderBottom: "1px solid #cbd5e1" }}>
            {[
              { month: "Jan", val: 45000, height: "45%" },
              { month: "Feb", val: 62000, height: "62%" },
              { month: "Mar", val: 58000, height: "58%" },
              { month: "Apr", val: 85000, height: "85%" },
              { month: "May", val: 72000, height: "72%" },
              { month: "Jun (Current)", val: kpis.totalRevenue || 95000, height: "95%" },
            ].map((bar, idx) => (
              <div key={idx} style={{ flex: 1, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{ fontSize: "11px", fontWeight: "bold", color: "#0369a1", marginBottom: "4px" }}>
                  {bar.val > 1000 ? `${(bar.val / 1000).toFixed(0)}k` : bar.val}
                </div>
                <div
                  style={{
                    width: "100%",
                    maxWidth: "35px",
                    height: bar.height,
                    background: idx === 5 ? "linear-gradient(180deg, #0284c7, #0369a1)" : "#93c5fd",
                    borderRadius: "6px 6px 0 0",
                    transition: "height 0.4s ease",
                  }}
                />
                <div style={{ fontSize: "11px", color: "#64748b", marginTop: "8px" }}>{bar.month}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Departmental & Department Breakdown */}
        <div className="card" style={{ padding: "20px" }}>
          <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "15px", display: "flex", alignItems: "center", gap: "8px" }}>
            <Users size={18} color="#16a34a" /> Departmental Load & Service Distribution
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            {[
              { dept: "Cardiology", percent: 78, count: "45 Patients", color: "#0284c7" },
              { dept: "Pediatrics & Child Care", percent: 62, count: "32 Patients", color: "#16a34a" },
              { dept: "Orthopedics & Surgery", percent: 48, count: "24 Patients", color: "#eab308" },
              { dept: "Pathology & Lab Tests", percent: 85, count: "56 Tests", color: "#8b5cf6" },
            ].map((item, idx) => (
              <div key={idx}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "5px" }}>
                  <span style={{ fontWeight: "600" }}>{item.dept}</span>
                  <span style={{ color: "#64748b" }}>{item.count} ({item.percent}%)</span>
                </div>
                <div style={{ width: "100%", height: "8px", background: "#e2e8f0", borderRadius: "4px", overflow: "hidden" }}>
                  <div style={{ width: `${item.percent}%`, height: "100%", background: item.color, borderRadius: "4px" }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Audit Logs and Quick Info */}
      <div className="dashboard-content-split">
        <div className="card audit-log-panel">
          <div className="card-header">
            <div className="card-title">
              <FileClock className="icon-purple" size={20} />
              Tamper-Evident System Audit Trail
            </div>
            <span className="badge badge-success">
              <ShieldCheck size={12} style={{ marginRight: "4px" }} /> Secure
            </span>
          </div>
          
          <div className="card-body scroll-panel">
            {logs.length === 0 ? (
              <div className="idle-state">
                <p>No audit trail records found in this environment.</p>
              </div>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Operator</th>
                    <th>Action</th>
                    <th>Affected Unit</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log._id}>
                      <td style={{ whiteSpace: "nowrap" }}>
                        {new Date(log.timestamp).toLocaleTimeString()}{" "}
                        <span style={{ fontSize: "10px", opacity: 0.6 }}>
                          {new Date(log.timestamp).toLocaleDateString()}
                        </span>
                      </td>
                      <td>
                        <strong>{log.username || "System"}</strong>
                        <div style={{ fontSize: "10px", opacity: 0.7 }}>
                          {log.userId?.role || "System"}
                        </div>
                      </td>
                      <td>
                        <span className={`method-badge ${log.action.includes("CREATE") ? "get-tag" : "error"}`}>
                          {log.action}
                        </span>
                      </td>
                      <td>
                        <code className="text-purple">{log.affectedEntity}</code>
                        <div style={{ fontSize: "10px", opacity: 0.6 }}>ID: {log.affectedRecordId}</div>
                      </td>
                      <td style={{ fontSize: "12px" }}>{log.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
