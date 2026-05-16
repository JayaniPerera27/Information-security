import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import DashboardHeader from "../components/DashboardHeader.jsx";
import http from "../api/http";

function ExamOfficerReceived() {
  const [submissions, setSubmissions] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadSubmissions = async () => {
      try {
        const response = await http.get("/submissions");
        setSubmissions(response.data.submissions);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load assigned submissions");
      }
    };

    loadSubmissions();
  }, []);

  return (
    <main className="dashboard-shell">
      <section className="dashboard-panel">
        <DashboardHeader title="Received Papers" subtitle="View exam papers assigned to your account." />

        {error && <p className="form-error">{error}</p>}

        <div className="table-list">
          {submissions.map((submission) => (
            <article className="table-card" key={submission._id}>
              <div>
                <strong>{submission.title}</strong>
                <small>
                  {submission.courseCode} | From {submission.lecturer?.name} | {submission.originalFileName}
                </small>
              </div>
              <span className="status-pill success">{submission.status}</span>
            </article>
          ))}

          {submissions.length === 0 && !error && (
            <article className="table-card">
              <div>
                <strong>No received papers</strong>
                <small>Assigned exam papers will appear here after lecturers submit them.</small>
              </div>
            </article>
          )}
        </div>

        <div className="key-actions">
          <Link className="icon-text-button back-link" to="/exam-officer">
            <ArrowLeft size={18} />
            Back
          </Link>
        </div>
      </section>
    </main>
  );
}

export default ExamOfficerReceived;
