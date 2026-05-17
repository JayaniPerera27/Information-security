import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, FileLock2, FileUp, FolderClock, KeyRound, Send, ShieldCheck } from "lucide-react";
import DashboardHeader from "../components/DashboardHeader.jsx";
import http from "../api/http";
import { useAuth } from "../context/AuthContext.jsx";

const lecturerFeatures = [
  {
    title: "Upload Paper",
    description: "Submit an exam paper for encryption and signing.",
    path: "/lecturer/upload",
    icon: FileUp
  },
  {
    title: "My Submissions",
    description: "View papers submitted from your lecturer account.",
    path: "/lecturer/submissions",
    icon: FolderClock
  },
  {
    title: "Key Management",
    description: "Generate your key pair and save your public key.",
    path: "/account/keys",
    icon: KeyRound
  }
];

function LecturerDashboard() {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadSubmissions = async () => {
      try {
        const response = await http.get("/submissions");
        setSubmissions(response.data.submissions);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load lecturer dashboard data");
      }
    };

    loadSubmissions();
  }, []);

  const metrics = useMemo(() => {
    const verified = submissions.filter((submission) => submission.status === "verified").length;
    const decrypted = submissions.filter((submission) => submission.status === "decrypted").length;

    return {
      total: submissions.length,
      verified,
      decrypted,
      keyReady: Boolean(user?.publicKey)
    };
  }, [submissions, user]);

  const recentSubmissions = submissions.slice(0, 4);

  return (
    <main className="dashboard-shell">
      <section className="dashboard-panel admin-command">
        <DashboardHeader
          title="Lecturer Workspace"
          subtitle="Prepare, sign, encrypt, and track exam paper submissions."
        />

        {error && <p className="form-error">{error}</p>}

        <section className="admin-overview">
          <article className="admin-metric primary-metric">
            <span className="metric-icon">
              <FileLock2 size={22} />
            </span>
            <div>
              <strong>{metrics.total}</strong>
              <small>Total submissions</small>
            </div>
          </article>
          <article className="admin-metric">
            <span className="metric-icon success-icon">
              <ShieldCheck size={22} />
            </span>
            <div>
              <strong>{metrics.verified}</strong>
              <small>Verified papers</small>
            </div>
          </article>
          <article className="admin-metric">
            <span className="metric-icon success-icon">
              <CheckCircle2 size={22} />
            </span>
            <div>
              <strong>{metrics.decrypted}</strong>
              <small>Decrypted by officer</small>
            </div>
          </article>
          <article className="admin-metric">
            <span className={metrics.keyReady ? "metric-icon success-icon" : "metric-icon warning-icon"}>
              <KeyRound size={22} />
            </span>
            <div>
              <strong>{metrics.keyReady ? "Ready" : "Missing"}</strong>
              <small>Signing key status</small>
            </div>
          </article>
        </section>

        <section className="admin-layout">
          <div className="admin-action-grid">
            {lecturerFeatures.map((feature) => {
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
                <Send size={18} />
              </span>
              <div>
                <strong>Recent Submissions</strong>
                <small>Your latest secure paper transfers</small>
              </div>
            </div>

            <div className="activity-feed">
              {recentSubmissions.map((submission) => (
                <article className="activity-item" key={submission._id}>
                  <span className={submission.status === "rejected" ? "activity-dot danger-dot" : "activity-dot success-dot"} />
                  <div>
                    <strong>{submission.courseCode} - {submission.title}</strong>
                    <small>
                      {submission.status} | To {submission.examOfficer?.name || "exam officer"}
                    </small>
                  </div>
                </article>
              ))}

              {recentSubmissions.length === 0 && (
                <article className="activity-item">
                  <span className="activity-dot danger-dot" />
                  <div>
                    <strong>No submissions yet</strong>
                    <small>Upload your first exam paper after generating a key pair.</small>
                  </div>
                </article>
              )}
            </div>
          </aside>
        </section>

        <section className="admin-posture">
          <div>
            <p className="eyebrow">Lecturer readiness</p>
            <h2>Submission Pipeline</h2>
          </div>
          <div className="posture-checks">
            <span className={metrics.keyReady ? "posture-item" : "posture-item warning-posture"}>
              <CheckCircle2 size={18} />
              Key pair {metrics.keyReady ? "ready" : "needed"}
            </span>
            <span className="posture-item">
              <CheckCircle2 size={18} />
              AES encryption enabled
            </span>
            <span className="posture-item">
              <CheckCircle2 size={18} />
              Digital signature workflow
            </span>
          </div>
        </section>
      </section>
    </main>
  );
}

export default LecturerDashboard;
