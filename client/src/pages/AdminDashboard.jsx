import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  KeySquare,
  ScrollText,
  ShieldAlert,
  Users
} from "lucide-react";
import DashboardHeader from "../components/DashboardHeader.jsx";
import http from "../api/http";

const adminFeatures = [
  {
    title: "Users",
    description: "Manage lecturer, exam officer, and admin accounts.",
    path: "/admin/users",
    icon: Users
  },
  {
    title: "Public Keys",
    description: "Review registered public keys for users.",
    path: "/admin/public-keys",
    icon: KeySquare
  },
  {
    title: "Audit Logs",
    description: "Inspect authentication and paper workflow events.",
    path: "/admin/audit-logs",
    icon: ScrollText
  },
  {
    title: "Security Tests",
    description: "Run normal and attack scenario checks.",
    path: "/admin/security-tests",
    icon: ShieldAlert
  }
];

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [usersResponse, logsResponse] = await Promise.all([
          http.get("/users"),
          http.get("/audit-logs")
        ]);

        setUsers(usersResponse.data.users);
        setLogs(logsResponse.data.logs);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load admin dashboard data");
      }
    };

    loadDashboard();
  }, []);

  const metrics = useMemo(() => {
    const keyReadyUsers = users.filter((user) => Boolean(user.publicKey)).length;
    const failedEvents = logs.filter((log) => log.status === "failure").length;
    const unauthorizedEvents = logs.filter((log) => log.action === "UNAUTHORIZED_ACCESS_ATTEMPT").length;

    return {
      totalUsers: users.length,
      keyReadyUsers,
      failedEvents,
      unauthorizedEvents
    };
  }, [users, logs]);

  const recentLogs = logs.slice(0, 4);

  return (
    <main className="dashboard-shell">
      <section className="dashboard-panel admin-command">
        <DashboardHeader
          title="Admin Command Center"
          subtitle="Monitor identities, key readiness, audit activity, and controlled security tests."
        />

        {error && <p className="form-error">{error}</p>}

        <section className="admin-overview">
          <article className="admin-metric primary-metric">
            <span className="metric-icon">
              <Users size={22} />
            </span>
            <div>
              <strong>{metrics.totalUsers}</strong>
              <small>Registered users</small>
            </div>
          </article>
          <article className="admin-metric">
            <span className="metric-icon success-icon">
              <KeySquare size={22} />
            </span>
            <div>
              <strong>{metrics.keyReadyUsers}</strong>
              <small>Users with public keys</small>
            </div>
          </article>
          <article className="admin-metric">
            <span className="metric-icon warning-icon">
              <AlertTriangle size={22} />
            </span>
            <div>
              <strong>{metrics.failedEvents}</strong>
              <small>Failed security events</small>
            </div>
          </article>
          <article className="admin-metric">
            <span className="metric-icon danger-icon">
              <ShieldAlert size={22} />
            </span>
            <div>
              <strong>{metrics.unauthorizedEvents}</strong>
              <small>Unauthorized attempts</small>
            </div>
          </article>
        </section>

        <section className="admin-layout">
          <div className="admin-action-grid">
            {adminFeatures.map((feature) => {
              const Icon = feature.icon;

              return (
                <Link className="admin-action-card" to={feature.path} key={feature.path}>
                  <span className="feature-icon" aria-hidden="true">
                    <Icon size={22} />
                  </span>
                  <span>
                    <strong>{feature.title}</strong>
                    <small>{feature.description}</small>
                  </span>
                </Link>
              );
            })}
          </div>

          <aside className="admin-side-panel">
            <div className="admin-side-header">
              <span className="feature-icon small-icon">
                <Activity size={18} />
              </span>
              <div>
                <strong>Recent Activity</strong>
                <small>Latest audit signals</small>
              </div>
            </div>

            <div className="activity-feed">
              {recentLogs.map((log) => (
                <article className="activity-item" key={log._id}>
                  <span className={log.status === "success" ? "activity-dot success-dot" : "activity-dot danger-dot"} />
                  <div>
                    <strong>{log.action.replaceAll("_", " ")}</strong>
                    <small>{log.details || "No details recorded"}</small>
                  </div>
                </article>
              ))}

              {recentLogs.length === 0 && (
                <article className="activity-item">
                  <span className="activity-dot success-dot" />
                  <div>
                    <strong>No activity yet</strong>
                    <small>Audit events will appear after users interact with the system.</small>
                  </div>
                </article>
              )}
            </div>
          </aside>
        </section>

        <section className="admin-posture">
          <div>
            <p className="eyebrow">Security posture</p>
            <h2>Operational Readiness</h2>
          </div>
          <div className="posture-checks">
            <span className="posture-item">
              <CheckCircle2 size={18} />
              Role based access
            </span>
            <span className="posture-item">
              <CheckCircle2 size={18} />
              Public key registry
            </span>
            <span className="posture-item">
              <CheckCircle2 size={18} />
              Audit trail enabled
            </span>
          </div>
        </section>
      </section>
    </main>
  );
}

export default AdminDashboard;
