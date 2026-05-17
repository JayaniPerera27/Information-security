import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, RefreshCw, Users } from "lucide-react";
import DashboardHeader from "../components/DashboardHeader.jsx";
import http from "../api/http";

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const loadUsers = async () => {
    setError("");
    setLoading(true);

    try {
      const response = await http.get("/users");
      setUsers(response.data.users);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  return (
    <main className="dashboard-shell">
      <section className="dashboard-panel">
        <DashboardHeader title="User Management" subtitle="Review registered users, roles, and key readiness." />

        <div className="key-actions">
          <button className="icon-text-button" type="button" onClick={loadUsers} disabled={loading}>
            <RefreshCw size={18} />
            {loading ? "Refreshing..." : "Refresh"}
          </button>
          <Link className="icon-text-button back-link" to="/admin">
            <ArrowLeft size={18} />
            Back
          </Link>
        </div>

        {error && <p className="form-error">{error}</p>}

        <div className="table-list">
          {users.map((user) => (
            <article className="table-card user-card" key={user._id}>
              <span className="feature-icon small-icon" aria-hidden="true">
                <Users size={18} />
              </span>
              <div className="table-main">
                <strong>{user.name}</strong>
                <small>{user.email}</small>
              </div>
              <span className="status-pill neutral">{user.role.replace("_", " ")}</span>
              <span className={user.publicKey ? "status-pill success" : "status-pill warning"}>
                {user.publicKey ? "Key ready" : "No key"}
              </span>
            </article>
          ))}

          {users.length === 0 && !error && (
            <article className="table-card">
              <div>
                <strong>No users found</strong>
                <small>Registered users will appear here.</small>
              </div>
            </article>
          )}
        </div>
      </section>
    </main>
  );
}

export default UserManagement;
