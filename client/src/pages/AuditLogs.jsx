import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, RefreshCw } from "lucide-react";
import DashboardHeader from "../components/DashboardHeader.jsx";
import http from "../api/http";

function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const loadLogs = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await http.get("/audit-logs");
      setLogs(response.data.logs);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load audit logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  return (
    <main className="dashboard-shell">
      <section className="dashboard-panel">
        <DashboardHeader title="Audit Logs" subtitle="Review important authentication and exam paper events." />

        <div className="key-actions">
          <button className="icon-text-button" type="button" onClick={loadLogs} disabled={loading}>
            <RefreshCw size={18} />
            {loading ? "Refreshing..." : "Refresh"}
          </button>
          <Link className="icon-text-button back-link" to="/admin">
            <ArrowLeft size={18} />
            Back
          </Link>
        </div>

        {error && <p className="form-error">{error}</p>}

        <div className="audit-list">
          {logs.map((log) => (
            <article className="audit-card" key={log._id}>
              <div className="audit-main">
                <div>
                  <strong>{log.action.replaceAll("_", " ")}</strong>
                  <small>
                    {log.user ? `${log.user.name} | ${log.user.email} | ${log.user.role.replace("_", " ")}` : "System or unknown user"}
                  </small>
                </div>
                <span className={log.status === "success" ? "status-pill success" : "status-pill danger"}>
                  {log.status}
                </span>
              </div>
              <p>{log.details || "No details recorded"}</p>
              <small>
                {new Date(log.createdAt).toLocaleString()} | {log.resourceType || "N/A"}
                {log.ipAddress ? ` | ${log.ipAddress}` : ""}
              </small>
            </article>
          ))}

          {logs.length === 0 && !error && (
            <article className="audit-card">
              <strong>No audit logs yet</strong>
              <p>System events will appear here after users register, login, upload, verify, or decrypt papers.</p>
            </article>
          )}
        </div>
      </section>
    </main>
  );
}

export default AuditLogs;
