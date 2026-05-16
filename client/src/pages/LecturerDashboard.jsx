import React from "react";
import { FileUp, FolderClock, KeyRound } from "lucide-react";
import DashboardHeader from "../components/DashboardHeader.jsx";
import FeatureGrid from "../components/FeatureGrid.jsx";

const lecturerFeatures = [
  {
    title: "Upload Paper",
    description: "Submit an exam paper for encryption and signing.",
    path: "/lecturer/upload",
    icon: FileUp
  },
  {
    title: "My Submissions",
    description: "View papers submitted from your lecturer account.",
    path: "/lecturer/submissions",
    icon: FolderClock
  },
  {
    title: "Key Management",
    description: "Generate your key pair and save your public key.",
    path: "/account/keys",
    icon: KeyRound
  }
];

function LecturerDashboard() {
  return (
    <main className="dashboard-shell">
      <section className="dashboard-panel">
        <DashboardHeader
          title="Lecturer Dashboard"
          subtitle="Upload, encrypt, and sign exam papers from here."
        />
        <FeatureGrid features={lecturerFeatures} />
      </section>
    </main>
  );
}

export default LecturerDashboard;
