import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, FileWarning, RefreshCw, RotateCcw, ShieldAlert } from "lucide-react";
import DashboardHeader from "../components/DashboardHeader.jsx";
import http from "../api/http";

function SecurityTests() {
  const [checklist, setChecklist] = useState({ normalTests: [], attackTests: [] });
  const [submissions, setSubmissions] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    setError("");
    setLoading(true);

    try {
      const [checklistResponse, submissionsResponse] = await Promise.all([
        http.get("/security-tests/checklist"),
        http.get("/security-tests/submissions")
      ]);

      setChecklist(checklistResponse.data);
      setSubmissions(submissionsResponse.data.submissions);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load security tests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const runAction = async (endpoint) => {
    setMessage("");
    setError("");
    setLoading(true);

    try {
      const response = await http.post(`/security-tests/submissions/${selectedId}/${endpoint}`);
      setMessage(response.data.message);
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Security test failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="dashboard-shell">
      <section className="dashboard-panel">
        <DashboardHeader title="Security Tests" subtitle="Run controlled checks for normal and attack scenarios." />

        <div className="test-grid">
          <section className="test-panel">
            <h2>Normal Cases</h2>
            {checklist.normalTests.map((item) => (
              <label className="check-row" key={item}>
                <input type="checkbox" />
                {item}
              </label>
            ))}
          </section>

          <section className="test-panel">
            <h2>Attack Cases</h2>
            {checklist.attackTests.map((item) => (
              <label className="check-row" key={item}>
                <input type="checkbox" />
                {item}
              </label>
            ))}
          </section>
        </div>

        <section className="test-panel">
          <h2>Attack Simulation</h2>
          <p>Use a test submission. Tamper actions intentionally modify selected submission data.</p>

          <label className="test-select">
            Submission
            <select value={selectedId} onChange={(event) => setSelectedId(event.target.value)}>
              <option value="">Select submission</option>
              {submissions.map((submission) => (
                <option value={submission._id} key={submission._id}>
                  {submission.courseCode} - {submission.title} - {submission.status}
                </option>
              ))}
            </select>
          </label>

          {message && <p className="form-success">{message}</p>}
          {error && <p className="form-error">{error}</p>}

          <div className="key-actions">
            <button
              className="icon-text-button"
              type="button"
              disabled={!selectedId || loading}
              onClick={() => runAction("replay")}
            >
              <RotateCcw size={18} />
              Simulate replay
            </button>
            <button
              className="icon-text-button"
              type="button"
              disabled={!selectedId || loading}
              onClick={() => runAction("tamper-signature")}
            >
              <ShieldAlert size={18} />
              Modify signature
            </button>
            <button
              className="icon-text-button"
              type="button"
              disabled={!selectedId || loading}
              onClick={() => runAction("tamper-encrypted-file")}
            >
              <FileWarning size={18} />
              Modify encrypted file
            </button>
            <button className="icon-text-button" type="button" onClick={loadData} disabled={loading}>
              <RefreshCw size={18} />
              Refresh
            </button>
          </div>
        </section>

        <div className="key-actions">
          <Link className="icon-text-button back-link" to="/admin">
            <ArrowLeft size={18} />
            Back
          </Link>
        </div>
      </section>
    </main>
  );
}

export default SecurityTests;
