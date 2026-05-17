import React from "react";
import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

function DashboardHeader({ title, subtitle }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  return (
    <header className="dashboard-header">
      <div>
        <p className="eyebrow">{user?.role?.replace("_", " ")}</p>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
      <button className="icon-text-button" type="button" onClick={handleLogout}>
        <LogOut size={18} />
        Logout
      </button>
    </header>
  );
}

export default DashboardHeader;
