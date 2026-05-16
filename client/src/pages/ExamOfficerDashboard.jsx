import React from "react";
import DashboardHeader from "../components/DashboardHeader.jsx";

function ExamOfficerDashboard() {
  return (
    <main className="dashboard-shell">
      <section className="dashboard-panel">
        <DashboardHeader
          title="Exam Officer Dashboard"
          subtitle="Receive, verify, and decrypt submitted exam papers from here."
        />
      </section>
    </main>
  );
}

export default ExamOfficerDashboard;
