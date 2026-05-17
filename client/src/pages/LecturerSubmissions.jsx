import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import DashboardHeader from "../components/DashboardHeader.jsx";
import http from "../api/http";

function LecturerSubmissions() {
  const [submissions, setSubmissions] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadSubmissions = async () => {
      try {
        const response = await http.get("/submissions");
        setSubmissions(response.data.submissions);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load submissions");
      }
    };

    loadSubmissions();
  }, []);

  return (
    <main className="dashboard-shell">
      <section className="dashboard-panel">
        <DashboardHeader title="My Submissions" subtitle="View exam papers submitted from your lecturer account." />

        {error && <p className="form-error">{error}</p>}

        <div className="table-list">
          {submissions.map((submission) => (
            <article className="table-card" key={submission._id}>
              <div>
                <strong>{submission.title}</strong>
                <small>
                  {submission.courseCode} | To {submission.examOfficer?.name} | {submission.originalFileName}
                </small>
              </div>
              <span className="status-pill success">{submission.status}</span>
            </article>
          ))}

          {submissions.length === 0 && !error && (
            <article className="table-card">
              <div>
                <strong>No submissions yet</strong>
                <small>Uploaded exam papers will appear here after secure submission.</small>
              </div>
            </article>
          )}
        </div>

        <div className="key-actions">
          <Link className="icon-text-button back-link" to="/lecturer">
            <ArrowLeft size={18} />
            Back
          </Link>
        </div>
      </section>
    </main>
  );
}

export default LecturerSubmissions;
