import React, { useState } from "react";
import { ShieldCheck, LockKeyhole, FileCheck2, History, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { getRouteForRole } from "../utils/roleRoutes";

function Landing() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [modal, setModal] = useState(null);
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "lecturer"
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const openModal = (type) => {
    setError("");
    setModal(type);
  };

  const closeModal = () => {
    setError("");
    setSubmitting(false);
    setModal(null);
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const user = await login(loginForm);
      navigate(getRouteForRole(user.role), { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const user = await register(registerForm);
      navigate(getRouteForRole(user.role), { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="landing-shell">
      <nav className="landing-nav">
        <div className="brand-mark">
          <ShieldCheck size={22} />
          <span>SecureExam</span>
        </div>
        <div className="landing-nav-actions">
          <button className="icon-text-button" type="button" onClick={() => openModal("login")}>
            Login
          </button>
          <button className="primary-button inline-button" type="button" onClick={() => openModal("register")}>
            Register
          </button>
        </div>
      </nav>

      <section className="landing-hero">
        <div className="hero-copy">
          <p className="eyebrow">Information Security Project</p>
          <h1>Secure Exam Paper Distribution System</h1>
          <p>
            A cryptography-focused MERN application for safely submitting, verifying, and decrypting exam papers
            between lecturers and exam officers.
          </p>
          <div className="hero-actions">
            <button className="primary-button inline-button" type="button" onClick={() => openModal("login")}>
              Login to dashboard
            </button>
            <button className="icon-text-button" type="button" onClick={() => openModal("register")}>
              Create account
            </button>
          </div>
        </div>

        <div className="hero-panel" aria-label="Security workflow summary">
          <div className="hero-stat">
            <LockKeyhole size={24} />
            <span>
              <strong>AES-256-GCM</strong>
              <small>Encrypts exam papers before storage.</small>
            </span>
          </div>
          <div className="hero-stat">
            <FileCheck2 size={24} />
            <span>
              <strong>Digital Signatures</strong>
              <small>Prove sender identity and detect tampering.</small>
            </span>
          </div>
          <div className="hero-stat">
            <History size={24} />
            <span>
              <strong>Audit Logs</strong>
              <small>Track login, upload, verify, and decrypt events.</small>
            </span>
          </div>
        </div>
      </section>

      <section className="landing-feature-strip">
        <article>
          <strong>Lecturer</strong>
          <small>Upload paper, sign hash, and submit securely.</small>
        </article>
        <article>
          <strong>Exam Officer</strong>
          <small>Receive assigned papers, verify signatures, and decrypt.</small>
        </article>
        <article>
          <strong>Admin</strong>
          <small>Review users, public keys, audit logs, and security tests.</small>
        </article>
      </section>

      {modal && (
        <div className="modal-backdrop" role="presentation">
          <section className="auth-modal" role="dialog" aria-modal="true" aria-label={modal === "login" ? "Login" : "Register"}>
            <button className="modal-close" type="button" onClick={closeModal} aria-label="Close">
              <X size={20} />
            </button>

            {modal === "login" ? (
              <>
                <div>
                  <p className="eyebrow">Secure access</p>
                  <h2>Login</h2>
                  <p>Enter your credentials to continue to your dashboard.</p>
                </div>
                <form className="auth-form" onSubmit={handleLogin}>
                  <label>
                    Email
                    <input
                      type="email"
                      value={loginForm.email}
                      onChange={(event) => setLoginForm((current) => ({ ...current, email: event.target.value }))}
                      required
                    />
                  </label>
                  <label>
                    Password
                    <input
                      type="password"
                      value={loginForm.password}
                      onChange={(event) => setLoginForm((current) => ({ ...current, password: event.target.value }))}
                      required
                    />
                  </label>
                  {error && <p className="form-error">{error}</p>}
                  <button className="primary-button" type="submit" disabled={submitting}>
                    {submitting ? "Signing in..." : "Login"}
                  </button>
                </form>
                <p className="auth-switch">
                  Need an account? <button type="button" onClick={() => openModal("register")}>Register</button>
                </p>
              </>
            ) : (
              <>
                <div>
                  <p className="eyebrow">Create account</p>
                  <h2>Register</h2>
                  <p>Select the correct role because it controls system access.</p>
                </div>
                <form className="auth-form" onSubmit={handleRegister}>
                  <label>
                    Full name
                    <input
                      value={registerForm.name}
                      onChange={(event) => setRegisterForm((current) => ({ ...current, name: event.target.value }))}
                      required
                    />
                  </label>
                  <label>
                    Email
                    <input
                      type="email"
                      value={registerForm.email}
                      onChange={(event) => setRegisterForm((current) => ({ ...current, email: event.target.value }))}
                      required
                    />
                  </label>
                  <label>
                    Password
                    <input
                      type="password"
                      value={registerForm.password}
                      onChange={(event) => setRegisterForm((current) => ({ ...current, password: event.target.value }))}
                      minLength={8}
                      required
                    />
                  </label>
                  <label>
                    Role
                    <select
                      value={registerForm.role}
                      onChange={(event) => setRegisterForm((current) => ({ ...current, role: event.target.value }))}
                    >
                      <option value="lecturer">Lecturer</option>
                      <option value="exam_officer">Exam Officer</option>
                      <option value="admin">Admin</option>
                    </select>
                  </label>
                  {error && <p className="form-error">{error}</p>}
                  <button className="primary-button" type="submit" disabled={submitting}>
                    {submitting ? "Creating..." : "Create account"}
                  </button>
                </form>
                <p className="auth-switch">
                  Already registered? <button type="button" onClick={() => openModal("login")}>Login</button>
                </p>
              </>
            )}
          </section>
        </div>
      )}
    </main>
  );
}

export default Landing;
