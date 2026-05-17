import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import DashboardHeader from "../components/DashboardHeader.jsx";

function FeaturePlaceholder({ title, subtitle, backTo }) {
  return (
    <main className="dashboard-shell">
      <section className="dashboard-panel">
        <DashboardHeader title={title} subtitle={subtitle} />

        <div className="placeholder-area">
          <p>This feature is protected by role-based access control and will be implemented in the next steps.</p>
          <Link className="icon-text-button back-link" to={backTo}>
            <ArrowLeft size={18} />
            Back
          </Link>
        </div>
      </section>
    </main>
  );
}

export default FeaturePlaceholder;
