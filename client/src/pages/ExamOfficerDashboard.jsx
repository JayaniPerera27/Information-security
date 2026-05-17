import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, FileCheck2, FolderInput, KeyRound, LockOpen, ShieldCheck } from "lucide-react";
import DashboardHeader from "../components/DashboardHeader.jsx";
import http from "../api/http";
import { useAuth } from "../context/AuthContext.jsx";

const examOfficerFeatures = [
  {
    title: "Received Papers",
    description: "View exam papers assigned to your account.",
    path: "/exam-officer/received",
    icon: FolderInput
  },
  {
    title: "Verify Papers",
    description: "Check digital signatures and integrity results.",
    path: "/exam-officer/verify",
    icon: FileCheck2
  },
  {
    title: "Decrypt Papers",
    description: "Decrypt papers intended for your private key.",
    path: "/exam-officer/decrypt",
    icon: KeyRound
  },
  {
    title: "Key Management",
    description: "Generate your key pair and save your public key.",
    path: "/account/keys",
    icon: KeyRound
  }
];

function ExamOfficerDashboard() {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadSubmissions = async () => {
      try {
        const response = await http.get("/submissions");
        setSubmissions(response.data.submissions);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load exam officer dashboard data");
      }
    };

    loadSubmissions();
  }, []);

  const metrics = useMemo(() => {
    const verified = submissions.filter((submission) => submission.status === "verified").length;
    const decrypted = submissions.filter((submission) => submission.status === "decrypted").length;
    const pending = submissions.filter((submission) => submission.status === "submitted").length;

    return {
      total: submissions.length,
      verified,
      decrypted,
      pending,
      keyReady: Boolean(user?.publicKey)
    };
  }, [submissions, user]);

  const recentSubmissions = submissions.slice(0, 4);

  return (
    <main className="dashboard-shell">
      <section className="dashboard-panel admin-command">
        <DashboardHeader
          title="Exam Officer Console"
          subtitle="Receive assigned papers, verify signatures, and decrypt approved submissions."
        />

        {error && <p className="form-error">{error}</p>}

        <section className="admin-overview">
          <article className="admin-metric primary-metric">
            <span className="metric-icon">
              <FolderInput size={22} />
            </span>
            <div>
              <strong>{metrics.total}</strong>
              <small>Assigned papers</small>
            </div>
          </article>
          <article className="admin-metric">
            <span className="metric-icon warning-icon">
              <FileCheck2 size={22} />
            </span>
            <div>
              <strong>{metrics.pending}</strong>
              <small>Waiting review</small>
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
            <span className={metrics.keyReady ? "metric-icon success-icon" : "metric-icon warning-icon"}>
              <KeyRound size={22} />
            </span>
            <div>
              <strong>{metrics.keyReady ? "Ready" : "Missing"}</strong>
              <small>Decryption key status</small>
            </div>
          </article>
        </section>

        <section className="admin-layout">
          <div className="admin-action-grid">
            {examOfficerFeatures.map((feature) => {
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
                <LockOpen size={18} />
              </span>
              <div>
                <strong>Assigned Queue</strong>
                <small>Most recent papers routed to you</small>
              </div>
            </div>

            <div className="activity-feed">
              {recentSubmissions.map((submission) => (
                <article className="activity-item" key={submission._id}>
                  <span className={submission.status === "rejected" ? "activity-dot danger-dot" : "activity-dot success-dot"} />
                  <div>
                    <strong>{submission.courseCode} - {submission.title}</strong>
                    <small>
                      {submission.status} | From {submission.lecturer?.name || "lecturer"}
                    </small>
                  </div>
                </article>
              ))}

              {recentSubmissions.length === 0 && (
                <article className="activity-item">
                  <span className="activity-dot danger-dot" />
                  <div>
                    <strong>No assigned papers</strong>
                    <small>Lecturer submissions assigned to you will appear here.</small>
                  </div>
                </article>
              )}
            </div>
          </aside>
        </section>

        <section className="admin-posture">
          <div>
            <p className="eyebrow">Officer readiness</p>
            <h2>Verification Pipeline</h2>
          </div>
          <div className="posture-checks">
            <span className={metrics.keyReady ? "posture-item" : "posture-item warning-posture"}>
              <CheckCircle2 size={18} />
              Private key {metrics.keyReady ? "ready" : "needed"}
            </span>
            <span className="posture-item">
              <CheckCircle2 size={18} />
              Signature verification
            </span>
            <span className="posture-item">
              <CheckCircle2 size={18} />
              AES-GCM decryption checks
            </span>
          </div>
        </section>
      </section>
    </main>
  );
}

export default ExamOfficerDashboard;
