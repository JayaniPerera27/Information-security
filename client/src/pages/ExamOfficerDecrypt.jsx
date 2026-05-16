import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Download, LockOpen } from "lucide-react";
import DashboardHeader from "../components/DashboardHeader.jsx";
import http from "../api/http";

function ExamOfficerDecrypt() {
  const [submissions, setSubmissions] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [privateKey, setPrivateKey] = useState("");
  const [result, setResult] = useState(null);
  const [file, setFile] = useState(null);
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

  const handlePrivateKeyFile = async (event) => {
    const selectedFile = event.target.files[0];

    if (!selectedFile) {
      return;
    }

    setPrivateKey(await selectedFile.text());
  };

  const handleDecrypt = async () => {
    setError("");
    setResult(null);
    setFile(null);
    setLoading(true);

    try {
      const response = await http.post(`/submissions/${selectedId}/decrypt`, { privateKey });
      setResult(response.data.result);
      setFile(response.data.file);
    } catch (err) {
      setError(err.response?.data?.message || "Decryption failed");
    } finally {
      setLoading(false);
    }
  };

  const downloadDecryptedFile = () => {
    const binary = atob(file.contentBase64);
    const bytes = new Uint8Array(binary.length);

    for (let index = 0; index < binary.length; index += 1) {
      bytes[index] = binary.charCodeAt(index);
    }

    const blob = new Blob([bytes], { type: file.mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = file.fileName;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="dashboard-shell">
      <section className="dashboard-panel">
        <DashboardHeader title="Decrypt Papers" subtitle="Use your private key to decrypt papers assigned to you." />

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

          <label>
            Exam officer private key file
            <input type="file" accept=".pem,.key,.txt" onChange={handlePrivateKeyFile} />
          </label>

          {error && <p className="form-error">{error}</p>}

          {result && (
            <div className="result-grid">
              <span className={result.signatureValid ? "result-box pass" : "result-box fail"}>
                Signature {result.signatureValid ? "valid" : "invalid"}
              </span>
              <span className={result.integrityPassed ? "result-box pass" : "result-box fail"}>
                Integrity check {result.integrityPassed ? "passed" : "failed"}
              </span>
              <span className={result.decryptedSuccessfully ? "result-box pass" : "result-box fail"}>
                Paper decrypt {result.decryptedSuccessfully ? "successful" : "failed"}
              </span>
            </div>
          )}

          <div className="key-actions">
            <button
              className="primary-button inline-button"
              type="button"
              onClick={handleDecrypt}
              disabled={!selectedId || !privateKey || loading}
            >
              <LockOpen size={18} />
              {loading ? "Decrypting..." : "Decrypt paper"}
            </button>

            {file && (
              <button className="icon-text-button" type="button" onClick={downloadDecryptedFile}>
                <Download size={18} />
                Download decrypted paper
              </button>
            )}

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

export default ExamOfficerDecrypt;
