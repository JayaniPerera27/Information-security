import React, { useEffect, useState } from "react";
import DashboardHeader from "../components/DashboardHeader.jsx";
import http from "../api/http";

function PublicKeys() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadPublicKeys = async () => {
      try {
        const response = await http.get("/users/public-keys");
        setUsers(response.data.users);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load public keys");
      }
    };

    loadPublicKeys();
  }, []);

  return (
    <main className="dashboard-shell">
      <section className="dashboard-panel">
        <DashboardHeader title="Public Keys" subtitle="Review public keys registered by system users." />

        {error && <p className="form-error">{error}</p>}

        <div className="table-list">
          {users.map((item) => (
            <article className="table-card" key={item._id}>
              <div>
                <strong>{item.name}</strong>
                <small>{item.email} | {item.role.replace("_", " ")}</small>
              </div>
              <span className={item.publicKey ? "status-pill success" : "status-pill warning"}>
                {item.publicKey ? "Public key registered" : "No public key"}
              </span>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

export default PublicKeys;
