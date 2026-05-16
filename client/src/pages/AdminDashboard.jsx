import React from "react";
import { KeySquare, ScrollText, Users } from "lucide-react";
import DashboardHeader from "../components/DashboardHeader.jsx";
import FeatureGrid from "../components/FeatureGrid.jsx";

const adminFeatures = [
  {
    title: "Users",
    description: "Manage lecturer, exam officer, and admin accounts.",
    path: "/admin/users",
    icon: Users
  },
  {
    title: "Public Keys",
    description: "Review registered public keys for users.",
    path: "/admin/public-keys",
    icon: KeySquare
  },
  {
    title: "Audit Logs",
    description: "Inspect authentication and paper workflow events.",
    path: "/admin/audit-logs",
    icon: ScrollText
  }
];

function AdminDashboard() {
  return (
    <main className="dashboard-shell">
      <section className="dashboard-panel">
        <DashboardHeader
          title="Admin Dashboard"
          subtitle="Manage users, roles, public keys, and audit logs from here."
        />
        <FeatureGrid features={adminFeatures} />
      </section>
    </main>
  );
}

export default AdminDashboard;
