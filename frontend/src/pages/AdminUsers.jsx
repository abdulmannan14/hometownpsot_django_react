import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import api from "../api/axios";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actioningId, setActioningId] = useState(null);

  const fetchUsers = async (searchQuery = "") => {
    try {
      setLoading(true);
      const params = {};
      if (searchQuery) params.search = searchQuery;
      const { data } = await api.get("/admin/users/", { params });
      setUsers(data.results || data);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers(search);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const handleDeactivateUser = async (id) => {
    if (!window.confirm("Deactivate this user?")) return;
    setActioningId(id);
    try {
      await api.post(`/admin/users/${id}/deactivate/`);
      fetchUsers(search);
    } catch (err) {
      alert("Failed to deactivate user");
    } finally {
      setActioningId(null);
    }
  };

  return (
    <div style={{ background: "#191919", minHeight: "100vh", padding: "32px" }}>
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div style={{ marginBottom: "24px" }}>
            <h1 className="text-3xl font-bold text-white">User Management</h1>
            <p className="text-gray-500 text-sm mt-1">View and manage platform users</p>
          </div>

          {/* Search */}
          <div style={{ marginBottom: "24px" }}>
            <input
              type="text"
              placeholder="Search users by username or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%",
                maxWidth: "400px",
                padding: "10px 14px",
                borderRadius: "6px",
                border: "1px solid #2a2a2a",
                background: "#1d191e",
                color: "#fff",
                fontSize: "14px",
              }}
            />
          </div>

          {/* Users Table */}
          <div className="rounded-xl overflow-hidden" style={{ background: "#1d191e", border: "1px solid #2a2a2a" }}>
            {loading ? (
              <div className="flex justify-center py-16">
                <div className="w-10 h-10 rounded-full border-2 border-transparent animate-spin"
                  style={{ borderTopColor: "#ff00e0", borderRightColor: "#ff00e0" }} />
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-24">
                <p className="text-white font-semibold">No users found</p>
                <p className="text-gray-500 text-sm mt-1">Try adjusting your search</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid #2a2a2a" }}>
                      <th style={{ padding: "16px", textAlign: "left", color: "#666", fontSize: "12px", fontWeight: 600 }}>Username</th>
                      <th style={{ padding: "16px", textAlign: "left", color: "#666", fontSize: "12px", fontWeight: 600 }}>Email</th>
                      <th style={{ padding: "16px", textAlign: "left", color: "#666", fontSize: "12px", fontWeight: 600 }}>Role</th>
                      <th style={{ padding: "16px", textAlign: "left", color: "#666", fontSize: "12px", fontWeight: 600 }}>Status</th>
                      <th style={{ padding: "16px", textAlign: "left", color: "#666", fontSize: "12px", fontWeight: 600 }}>Events</th>
                      <th style={{ padding: "16px", textAlign: "left", color: "#666", fontSize: "12px", fontWeight: 600 }}>Joined</th>
                      <th style={{ padding: "16px", textAlign: "left", color: "#666", fontSize: "12px", fontWeight: 600 }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user, i) => (
                      <tr
                        key={user.id}
                        style={{
                          borderBottom: i < users.length - 1 ? "1px solid #252525" : "none",
                        }}
                      >
                        <td style={{ padding: "16px" }}>
                          <p className="font-semibold text-white">{user.username}</p>
                        </td>
                        <td style={{ padding: "16px" }}>
                          <p className="text-gray-400 text-sm">{user.email}</p>
                        </td>
                        <td style={{ padding: "16px" }}>
                          <span style={{
                            padding: "4px 10px",
                            borderRadius: "4px",
                            fontSize: "11px",
                            fontWeight: 600,
                            background: user.role === "admin" ? "rgba(255,0,224,0.1)" : "rgba(100,100,255,0.1)",
                            color: user.role === "admin" ? "#ff00e0" : "#6464ff",
                          }}>
                            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                          </span>
                        </td>
                        <td style={{ padding: "16px" }}>
                          <span style={{
                            padding: "4px 10px",
                            borderRadius: "4px",
                            fontSize: "11px",
                            fontWeight: 600,
                            background: user.is_active ? "rgba(0,255,100,0.1)" : "rgba(255,0,0,0.1)",
                            color: user.is_active ? "#00ff64" : "#ff4444",
                          }}>
                            {user.is_active ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td style={{ padding: "16px" }}>
                          <div>
                            <p className="text-white text-sm">{user.total_events}</p>
                            <p className="text-gray-500 text-xs">
                              {user.approved_events} approved
                            </p>
                          </div>
                        </td>
                        <td style={{ padding: "16px" }}>
                          <p className="text-gray-400 text-sm">
                            {format(new Date(user.date_joined), "MMM d, yyyy")}
                          </p>
                        </td>
                        <td style={{ padding: "16px" }}>
                          <div style={{ display: "flex", gap: "8px" }}>
                            <button
                              onClick={() => handleDeactivateUser(user.id)}
                              disabled={actioningId === user.id}
                              style={{
                                padding: "6px 12px",
                                fontSize: "11px",
                                fontWeight: 600,
                                borderRadius: "4px",
                                border: "1px solid " + (user.is_active ? "#ff4444" : "#00ff64"),
                                background: "transparent",
                                color: user.is_active ? "#ff4444" : "#00ff64",
                                cursor: "pointer",
                                opacity: actioningId === user.id ? 0.5 : 1,
                              }}
                            >
                              {actioningId === user.id ? "..." : (user.is_active ? "Deactivate" : "Activate")}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
