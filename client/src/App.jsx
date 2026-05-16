import React from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import LecturerDashboard from "./pages/LecturerDashboard.jsx";
import ExamOfficerDashboard from "./pages/ExamOfficerDashboard.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import FeaturePlaceholder from "./pages/FeaturePlaceholder.jsx";
import KeyManagement from "./pages/KeyManagement.jsx";
import PublicKeys from "./pages/PublicKeys.jsx";
import LecturerUpload from "./pages/LecturerUpload.jsx";
import LecturerSubmissions from "./pages/LecturerSubmissions.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/account/keys"
          element={
            <ProtectedRoute allowedRoles={["admin", "lecturer", "exam_officer"]}>
              <KeyManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/lecturer"
          element={
            <ProtectedRoute allowedRoles={["lecturer"]}>
              <LecturerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/lecturer/upload"
          element={
            <ProtectedRoute allowedRoles={["lecturer"]}>
              <LecturerUpload />
            </ProtectedRoute>
          }
        />
        <Route
          path="/lecturer/submissions"
          element={
            <ProtectedRoute allowedRoles={["lecturer"]}>
              <LecturerSubmissions />
            </ProtectedRoute>
          }
        />
        <Route
          path="/exam-officer"
          element={
            <ProtectedRoute allowedRoles={["exam_officer"]}>
              <ExamOfficerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/exam-officer/received"
          element={
            <ProtectedRoute allowedRoles={["exam_officer"]}>
              <FeaturePlaceholder
                title="Received Papers"
                subtitle="Only exam officers can access papers assigned to them."
                backTo="/exam-officer"
              />
            </ProtectedRoute>
          }
        />
        <Route
          path="/exam-officer/verify"
          element={
            <ProtectedRoute allowedRoles={["exam_officer"]}>
              <FeaturePlaceholder
                title="Verify Papers"
                subtitle="Only exam officers can verify paper signatures and integrity."
                backTo="/exam-officer"
              />
            </ProtectedRoute>
          }
        />
        <Route
          path="/exam-officer/decrypt"
          element={
            <ProtectedRoute allowedRoles={["exam_officer"]}>
              <FeaturePlaceholder
                title="Decrypt Papers"
                subtitle="Only exam officers can decrypt papers intended for them."
                backTo="/exam-officer"
              />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <FeaturePlaceholder
                title="Users"
                subtitle="Only admins can manage users and roles."
                backTo="/admin"
              />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/public-keys"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <PublicKeys />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/audit-logs"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <FeaturePlaceholder
                title="Audit Logs"
                subtitle="Only admins can view system audit records."
                backTo="/admin"
              />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
