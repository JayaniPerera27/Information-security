import React from "react";
import DashboardHeader from "../components/DashboardHeader.jsx";

function AdminDashboard() {
  return (
    <main className="dashboard-shell">
      <section className="dashboard-panel">
        <DashboardHeader
          title="Admin Dashboard"
          subtitle="Manage users, roles, public keys, and audit logs from here."
        />
      </section>
    </main>
  );
}

export default AdminDashboard;
