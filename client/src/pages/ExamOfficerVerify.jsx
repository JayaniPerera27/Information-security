import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import DashboardHeader from "../components/DashboardHeader.jsx";
import http from "../api/http";

function ExamOfficerVerify() {
  const [submissions, setSubmissions] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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

  const handleVerify = async () => {
    setError("");
    setResult(null);
    setLoading(true);

    try {
      const response = await http.post(`/submissions/${selectedId}/verify`);
      setResult(response.data.result);
    } catch (err) {
      setError(err.response?.data?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="dashboard-shell">
      <section className="dashboard-panel">
        <DashboardHeader title="Verify Papers" subtitle="Check whether the lecturer signature is valid." />

        <div className="workflow-form">
          <label>
            Submission
            <select value={selectedId} onChange={(event) => setSelectedId(event.target.value)}>
              <option value="">Select submission</option>
              {submissions.map((submission) => (
                <option value={submission._id} key={submission._id}>
                  {submission.courseCode} - {submission.title}
                </option>
              ))}
            </select>
          </label>

          {error && <p className="form-error">{error}</p>}

          {result && (
            <div className="result-grid">
              <span className={result.signatureValid ? "result-box pass" : "result-box fail"}>
                Signature {result.signatureValid ? "valid" : "invalid"}
              </span>
            </div>
          )}

          <div className="key-actions">
            <button className="primary-button inline-button" type="button" onClick={handleVerify} disabled={!selectedId || loading}>
              <ShieldCheck size={18} />
              {loading ? "Verifying..." : "Verify signature"}
            </button>
            <Link className="icon-text-button back-link" to="/exam-officer">
              <ArrowLeft size={18} />
              Back
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

export default ExamOfficerVerify;
