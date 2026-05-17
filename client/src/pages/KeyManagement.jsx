import React, { useEffect, useState } from "react";
import { Download, KeyRound, Save } from "lucide-react";
import DashboardHeader from "../components/DashboardHeader.jsx";
import http from "../api/http";
import { useAuth } from "../context/AuthContext.jsx";
import { getRouteForRole } from "../utils/roleRoutes";

function KeyManagement() {
  const { user } = useAuth();
  const [publicKey, setPublicKey] = useState("");
  const [privateKey, setPrivateKey] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setPublicKey(user?.publicKey || "");
  }, [user]);

  const handleGenerate = async () => {
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await http.post("/users/me/key-pair");
      setPublicKey(response.data.publicKey);
      setPrivateKey(response.data.privateKey);
      setMessage("Key pair generated. Download the private key now because it is not stored in the database.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to generate key pair");
    } finally {
      setLoading(false);
    }
  };

  const handleSavePublicKey = async () => {
    setLoading(true);
    setMessage("");
    setError("");

    try {
      await http.put("/users/me/public-key", { publicKey });
      setMessage("Public key saved successfully.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save public key");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPrivateKey = () => {
    const blob = new Blob([privateKey], { type: "application/x-pem-file" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `${user.email}-private-key.pem`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="dashboard-shell">
      <section className="dashboard-panel">
        <DashboardHeader
          title="Key Management"
          subtitle="Generate a public/private key pair and keep the private key protected."
        />

        <div className="key-warning">
          Private keys are shown only after generation so you can download them. In a real system, private keys should be stored in a secure key store or protected device, not in the database.
        </div>

        <div className="key-actions">
          <button className="primary-button inline-button" type="button" onClick={handleGenerate} disabled={loading}>
            <KeyRound size={18} />
            Generate key pair
          </button>

          {privateKey && (
            <button className="icon-text-button" type="button" onClick={handleDownloadPrivateKey}>
              <Download size={18} />
              Download private key
            </button>
          )}
        </div>

        {message && <p className="form-success">{message}</p>}
        {error && <p className="form-error">{error}</p>}

        <div className="key-grid">
          <label>
            Public key stored in MongoDB
            <textarea
              value={publicKey}
              onChange={(event) => setPublicKey(event.target.value)}
              placeholder="Generate a key pair or paste an existing PEM public key."
            />
          </label>

          <label>
            Private key for download only
            <textarea
              value={privateKey}
              readOnly
              placeholder="Your private key appears here only immediately after generation."
            />
          </label>
        </div>

        <div className="key-actions">
          <button className="icon-text-button" type="button" onClick={handleSavePublicKey} disabled={loading}>
            <Save size={18} />
            Save public key
          </button>
          <a className="icon-text-button back-link" href={getRouteForRole(user.role)}>
            Back to dashboard
          </a>
        </div>
      </section>
    </main>
  );
}

export default KeyManagement;
