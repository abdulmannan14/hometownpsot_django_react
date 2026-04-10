import React, { useState, useEffect } from "react";
import api from "../api/axios";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get("/admin/dashboard/");
        setStats(data);
      } catch (err) {
        console.error("Failed to fetch dashboard stats:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-10 h-10 rounded-full border-2 border-transparent animate-spin"
          style={{ borderTopColor: "#ff00e0", borderRightColor: "#ff00e0" }} />
      </div>
    );
  }

  const statCards = [
    { label: "Total Events", value: stats?.total_events || 0, color: "#fff", icon: "📅" },
    { label: "Pending Review", value: stats?.pending_events || 0, color: "#ffc800", icon: "⏳" },
    { label: "Approved", value: stats?.approved_events || 0, color: "#00ff64", icon: "✓" },
    { label: "Rejected", value: stats?.rejected_events || 0, color: "#ff4444", icon: "✕" },
    { label: "Total Users", value: stats?.total_users || 0, color: "#fff", icon: "👥" },
    { label: "Active Users", value: stats?.active_users || 0, color: "#00ffff", icon: "⚡" },
    { label: "Categories", value: stats?.total_categories || 0, color: "#fff", icon: "🏷️" },
    { label: "Featured Events", value: stats?.featured_events || 0, color: "#ff00e0", icon: "⭐" },
  ];

  return (
    <div style={{ background: "#191919", minHeight: "100vh", padding: "32px" }}>
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div style={{ marginBottom: "32px" }}>
            <h1 className="text-3xl font-bold text-white">Dashboard</h1>
            <p className="text-gray-500 text-sm mt-1">Welcome to the Admin Portal</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {statCards.map((card, i) => (
              <div
                key={i}
                className="rounded-xl p-6"
                style={{ background: "#1d191e", border: "1px solid #2a2a2a" }}
              >
                <div style={{
                  fontSize: "28px",
                  marginBottom: "12px",
                }}>
                  {card.icon}
                </div>
                <p style={{ color: card.color, fontSize: "28px", fontWeight: "bold", marginBottom: "4px" }}>
                  {card.value}
                </p>
                <p style={{ color: "#666", fontSize: "12px", fontWeight: 500 }}>
                  {card.label}
                </p>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div style={{ marginTop: "32px" }}>
            <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <a
                href="/admin/events"
                className="p-6 rounded-xl cursor-pointer transition-all"
                style={{
                  background: "#1d191e",
                  border: "1px solid #2a2a2a",
                  textDecoration: "none",
                  color: "#e0e0e0",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#ff00e0";
                  e.currentTarget.style.background = "rgba(255,0,224,0.05)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#2a2a2a";
                  e.currentTarget.style.background = "#1d191e";
                }}
              >
                <div style={{ fontSize: "24px", marginBottom: "8px" }}>📋</div>
                <p style={{ fontWeight: 600, marginBottom: "4px" }}>Review Events</p>
                <p style={{ fontSize: "13px", color: "#666" }}>Approve or reject pending events</p>
              </a>

              <a
                href="/admin/events"
                className="p-6 rounded-xl cursor-pointer transition-all"
                style={{
                  background: "#1d191e",
                  border: "1px solid #2a2a2a",
                  textDecoration: "none",
                  color: "#e0e0e0",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#ff00e0";
                  e.currentTarget.style.background = "rgba(255,0,224,0.05)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#2a2a2a";
                  e.currentTarget.style.background = "#1d191e";
                }}
              >
                <div style={{ fontSize: "24px", marginBottom: "8px" }}>⭐</div>
                <p style={{ fontWeight: 600, marginBottom: "4px" }}>Featured Events</p>
                <p style={{ fontSize: "13px", color: "#666" }}>Manage featured listings</p>
              </a>

              <a
                href="/admin/users"
                className="p-6 rounded-xl cursor-pointer transition-all"
                style={{
                  background: "#1d191e",
                  border: "1px solid #2a2a2a",
                  textDecoration: "none",
                  color: "#e0e0e0",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#ff00e0";
                  e.currentTarget.style.background = "rgba(255,0,224,0.05)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#2a2a2a";
                  e.currentTarget.style.background = "#1d191e";
                }}
              >
                <div style={{ fontSize: "24px", marginBottom: "8px" }}>👥</div>
                <p style={{ fontWeight: 600, marginBottom: "4px" }}>Manage Users</p>
                <p style={{ fontSize: "13px", color: "#666" }}>Control user access and roles</p>
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }
