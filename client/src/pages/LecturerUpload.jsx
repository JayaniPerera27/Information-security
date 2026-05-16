import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Send } from "lucide-react";
import DashboardHeader from "../components/DashboardHeader.jsx";
import http from "../api/http";

function LecturerUpload() {
  const [examOfficers, setExamOfficers] = useState([]);
  const [form, setForm] = useState({
    title: "",
    courseCode: "",
    examOfficerId: "",
    paper: null,
    privateKey: ""
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadExamOfficers = async () => {
      try {
        const response = await http.get("/users/exam-officers");
        setExamOfficers(response.data.users);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load exam officers");
      }
    };

    loadExamOfficers();
  }, []);

  const handleChange = (event) => {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value
    }));
  };

  const handlePaperChange = (event) => {
    setForm((current) => ({ ...current, paper: event.target.files[0] || null }));
  };

  const handlePrivateKeyFile = async (event) => {
    const file = event.target.files[0];

    if (!file) {
      return;
    }

    const text = await file.text();
    setForm((current) => ({ ...current, privateKey: text }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");
    setSubmitting(true);

    try {
      const payload = new FormData();
      payload.append("title", form.title);
      payload.append("courseCode", form.courseCode);
      payload.append("examOfficerId", form.examOfficerId);
      payload.append("privateKey", form.privateKey);
      payload.append("paper", form.paper);

      await http.post("/submissions", payload, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      setMessage("Exam paper encrypted, signed, and submitted successfully.");
      setForm({
        title: "",
        courseCode: "",
        examOfficerId: "",
        paper: null,
        privateKey: ""
      });
      event.target.reset();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit exam paper");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="dashboard-shell">
      <section className="dashboard-panel">
        <DashboardHeader
          title="Upload Paper"
          subtitle="Select an exam officer, attach the paper, and sign it with your private key."
        />

        <form className="workflow-form" onSubmit={handleSubmit}>
          <label>
            Paper title
            <input name="title" value={form.title} onChange={handleChange} required />
          </label>

          <label>
            Course/module code
            <input name="courseCode" value={form.courseCode} onChange={handleChange} required />
          </label>

          <label>
            Exam officer
            <select name="examOfficerId" value={form.examOfficerId} onChange={handleChange} required>
              <option value="">Select exam officer</option>
              {examOfficers.map((officer) => (
                <option value={officer._id} key={officer._id} disabled={!officer.publicKey}>
                  {officer.name} - {officer.email}
                  {!officer.publicKey ? " (no public key)" : ""}
                </option>
              ))}
            </select>
          </label>

          <label>
            Exam paper file
            <input name="paper" type="file" onChange={handlePaperChange} required />
          </label>

          <label>
            Lecturer private key file
            <input type="file" accept=".pem,.key,.txt" onChange={handlePrivateKeyFile} required />
          </label>

          {message && <p className="form-success">{message}</p>}
          {error && <p className="form-error">{error}</p>}

          <div className="key-actions">
            <button className="primary-button inline-button" type="submit" disabled={submitting}>
              <Send size={18} />
              {submitting ? "Submitting..." : "Submit securely"}
            </button>
            <Link className="icon-text-button back-link" to="/lecturer">
              <ArrowLeft size={18} />
              Back
            </Link>
          </div>
        </form>
      </section>
    </main>
  );
}

export default LecturerUpload;
