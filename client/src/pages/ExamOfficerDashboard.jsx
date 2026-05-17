import React from "react";
import { FileCheck2, FolderInput, KeyRound } from "lucide-react";
import DashboardHeader from "../components/DashboardHeader.jsx";
import FeatureGrid from "../components/FeatureGrid.jsx";

const examOfficerFeatures = [
  {
    title: "Received Papers",
    description: "View exam papers assigned to your account.",
    path: "/exam-officer/received",
    icon: FolderInput
  },
  {
    title: "Verify Papers",
    description: "Check digital signatures and integrity results.",
    path: "/exam-officer/verify",
    icon: FileCheck2
  },
  {
    title: "Decrypt Papers",
    description: "Decrypt papers intended for your private key.",
    path: "/exam-officer/decrypt",
    icon: KeyRound
  },
  {
    title: "Key Management",
    description: "Generate your key pair and save your public key.",
    path: "/account/keys",
    icon: KeyRound
  }
];

function ExamOfficerDashboard() {
  return (
    <main className="dashboard-shell">
      <section className="dashboard-panel">
        <DashboardHeader
          title="Exam Officer Dashboard"
          subtitle="Receive, verify, and decrypt submitted exam papers from here."
        />
        <FeatureGrid features={examOfficerFeatures} />
      </section>
    </main>
  );
}

export default ExamOfficerDashboard;
