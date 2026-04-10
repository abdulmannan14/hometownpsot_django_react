import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AdminLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };
  
  const navItems = [
    { to: "/admin", label: "Dashboard", icon: "📊" },
    { to: "/admin/events", label: "Events", icon: "📅" },
    { to: "/admin/expired", label: "Expired Events", icon: "⏰" },
    { to: "/admin/venues", label: "Venues", icon: "🏟️" },
    { to: "/admin/users", label: "Users", icon: "👥" },
    { to: "/admin/categories", label: "Categories", icon: "🏷️" },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#191919", flexDirection: "column" }}>
      {/* Top Header */}
      <header
        style={{
          background: "#0a0a0a",
          borderBottom: "1px solid #2a2a2a",
          padding: "0 24px",
          height: "60px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          zIndex: 40,
        }}
      >
        <Link
          to="/"
          style={{
            textDecoration: "none",
            color: "#fff",
            fontSize: "16px",
            fontWeight: 800,
            letterSpacing: "0.02em",
          }}
        >
          Hometown<span style={{ color: "#ff00e0" }}>Post</span>
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <span style={{ color: "#666", fontSize: "12px" }}>Admin: {user?.username}</span>
          <button
            onClick={handleLogout}
            style={{
              padding: "8px 16px",
              borderRadius: "4px",
              border: "1px solid #444",
              background: "transparent",
              color: "#e0e0e0",
              fontSize: "12px",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s",
              fontFamily: "Poppins, sans-serif",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#ff00e0";
              e.currentTarget.style.color = "#ff00e0";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#444";
              e.currentTarget.style.color = "#e0e0e0";
            }}
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Content with Sidebar */}
      <div style={{ display: "flex", flex: 1 }}>
      {/* Sidebar */}
      <aside
        style={{
          width: "280px",
          background: "#0a0a0a",
          borderRight: "1px solid #2a2a2a",
          padding: "24px 16px",
          overflowY: "auto",
        }}
      >
        <div style={{ marginBottom: "24px" }}>
          <p style={{ color: "#888", fontSize: "11px", margin: "0", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 600 }}>
            Navigation
          </p>
        </div>

        <nav style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {navItems.map(({ to, label, icon }) => (
            <Link
              key={to}
              to={to}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "10px 14px",
                borderRadius: "6px",
                textDecoration: "none",
                fontSize: "14px",
                fontWeight: 500,
                color: isActive(to) ? "#ff00e0" : "#999",
                background: isActive(to) ? "rgba(255,0,224,0.1)" : "transparent",
                borderLeft: isActive(to) ? "3px solid #ff00e0" : "3px solid transparent",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                if (!isActive(to)) {
                  e.currentTarget.style.color = "#ff00e0";
                  e.currentTarget.style.background = "rgba(255,0,224,0.05)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive(to)) {
                  e.currentTarget.style.color = "#999";
                  e.currentTarget.style.background = "transparent";
                }
              }}
            >
              <span style={{ fontSize: "18px" }}>{icon}</span>
              {label}
            </Link>
          ))}
        </nav>

        <div style={{ marginTop: "24px", borderTop: "1px solid #2a2a2a", paddingTop: "16px" }}>
          <Link
            to="/"
            style={{
              display: "block",
              padding: "10px 14px",
              borderRadius: "6px",
              textDecoration: "none",
              fontSize: "13px",
              fontWeight: 500,
              color: "#666",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#999";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "#666";
            }}
          >
            ← Back to Site
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, overflowY: "auto" }}>
        {children}
      </main>
    </div>
    </div>
  );
}
