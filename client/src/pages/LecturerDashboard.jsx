import React from "react";
import DashboardHeader from "../components/DashboardHeader.jsx";

function LecturerDashboard() {
  return (
    <main className="dashboard-shell">
      <section className="dashboard-panel">
        <DashboardHeader
          title="Lecturer Dashboard"
          subtitle="Upload, encrypt, and sign exam papers from here."
        />
      </section>
    </main>
  );
}

export default LecturerDashboard;
