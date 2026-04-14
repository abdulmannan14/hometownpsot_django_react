import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

const STATUS_STYLE = {
  approved: { bg: "rgba(0,255,100,0.1)", color: "#00ff64", text: "Approved" },
  pending:  { bg: "rgba(255,200,0,0.1)", color: "#ffc800", text: "Pending" },
  rejected: { bg: "rgba(255,0,0,0.1)", color: "#ff4444", text: "Rejected" },
};

export default function AdminEvents() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: "" });
  const [actioningId, setActioningId] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [nextPage, setNextPage] = useState(null);
  const [prevPage, setPrevPage] = useState(null);

  // Bulk selection
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);

  const allSelected = events.length > 0 && events.every(e => selectedIds.has(e.id));
  const someSelected = selectedIds.size > 0;

  const toggleSelect = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(events.map(e => e.id)));
    }
  };

  const handleBulkAction = async (action) => {
    const label = action === "delete"
      ? `Permanently delete ${selectedIds.size} event(s)?`
      : `${action.charAt(0).toUpperCase() + action.slice(1)} ${selectedIds.size} event(s)?`;
    if (!window.confirm(label)) return;

    setBulkLoading(true);
    try {
      await api.post("/admin/events/bulk/", { action, ids: Array.from(selectedIds) });
      setSelectedIds(new Set());
      fetchEvents(page, filters.status);
    } catch {
      alert(`Bulk ${action} failed.`);
    } finally {
      setBulkLoading(false);
    }
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  const fetchEvents = async (pageNum = 1, filterStatus = "") => {
    try {
      setLoading(true);
      const params = { page: pageNum };
      if (filterStatus) params.status = filterStatus;
      const { data } = await api.get("/admin/events/", { params });
      setEvents(data.results || data);
      setTotalCount(data.count || events.length);
      setNextPage(data.next || null);
      setPrevPage(data.previous || null);
      setPage(pageNum);
      setSelectedIds(new Set()); // clear selection on every page load
    } catch (err) {
      console.error("Failed to fetch events:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents(1, filters.status);
  }, [filters.status]);

  const handleApprove = async (id) => {
    setActioningId(id);
    try {
      await api.post(`/admin/events/${id}/approve/`);
      fetchEvents(page, filters.status);
    } catch (err) {
      alert("Failed to approve event");
    } finally {
      setActioningId(null);
    }
  };

  const handleReject = async (id) => {
    setActioningId(id);
    try {
      await api.post(`/admin/events/${id}/reject/`);
      fetchEvents(page, filters.status);
    } catch (err) {
      alert("Failed to reject event");
    } finally {
      setActioningId(null);
    }
  };

  const handleFeature = async (id) => {
    setActioningId(id);
    try {
      await api.post(`/admin/events/${id}/feature/`);
      fetchEvents(page, filters.status);
    } catch (err) {
      alert("Failed to update featured status");
    } finally {
      setActioningId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this event permanently?")) return;
    setActioningId(id);
    try {
      await api.delete(`/admin/events/${id}/`);
      fetchEvents(page, filters.status);
    } catch (err) {
      alert("Failed to delete event");
    } finally {
      setActioningId(null);
    }
  };

  const handleCreateEvent = () => {
    navigate("/events/new?from=admin");
  };

  const handleEditEvent = (eventId) => {
    navigate(`/events/${eventId}/edit?from=admin`);
  };

  const handlePreviousPage = () => {
    if (page > 1) {
      fetchEvents(page - 1, filters.status);
    }
  };

  const handleNextPage = () => {
    if (nextPage) {
      fetchEvents(page + 1, filters.status);
    }
  };

  return (
    <div style={{ background: "#191919", minHeight: "100vh", padding: "32px" }}>
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div style={{ marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h1 className="text-3xl font-bold text-white">Events Management</h1>
              <p className="text-gray-500 text-sm mt-1">Review and manage all events</p>
            </div>
            <button
              onClick={handleCreateEvent}
              style={{
                padding: "10px 20px",
                borderRadius: "6px",
                border: "none",
                background: "#ff00e0",
                color: "#fff",
                fontSize: "14px",
                fontWeight: 600,
                cursor: "pointer",
                transition: "opacity .2s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.85"; }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
            >
              + Create Event
            </button>
          </div>

          {/* Filters */}
          <div style={{ marginBottom: "24px", display: "flex", gap: "12px" }}>
            {["", "pending", "approved", "rejected"].map((status) => (
              <button
                key={status}
                onClick={() => setFilters({ status })}
                style={{
                  padding: "8px 16px",
                  borderRadius: "6px",
                  border: "1px solid " + (filters.status === status ? "#ff00e0" : "#2a2a2a"),
                  background: filters.status === status ? "rgba(255,0,224,0.1)" : "#1d191e",
                  color: filters.status === status ? "#ff00e0" : "#999",
                  fontSize: "13px",
                  fontWeight: 500,
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  if (filters.status !== status) {
                    e.currentTarget.style.borderColor = "#ff00e0";
                    e.currentTarget.style.color = "#ff00e0";
                  }
                }}
                onMouseLeave={(e) => {
                  if (filters.status !== status) {
                    e.currentTarget.style.borderColor = "#2a2a2a";
                    e.currentTarget.style.color = "#999";
                  }
                }}
              >
                {status ? status.charAt(0).toUpperCase() + status.slice(1) : "All"}
              </button>
            ))}
          </div>

          {/* Bulk Action Toolbar */}
          {someSelected && (
            <div style={{
              marginBottom: "16px", padding: "12px 16px",
              borderRadius: "8px", border: "1px solid #ff00e0",
              background: "rgba(255,0,224,0.07)",
              display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap",
            }}>
              <span style={{ color: "#ff00e0", fontSize: "13px", fontWeight: 600 }}>
                {selectedIds.size} event{selectedIds.size !== 1 ? "s" : ""} selected
              </span>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {[
                  { action: "approve", label: "✓ Approve All", bg: "rgba(0,255,100,0.1)", border: "#00ff64", color: "#00ff64" },
                  { action: "reject",  label: "✕ Reject All",  bg: "rgba(255,68,68,0.1)", border: "#ff4444", color: "#ff4444" },
                  { action: "delete",  label: "🗑 Delete All",  bg: "rgba(100,100,100,0.1)", border: "#666", color: "#999" },
                ].map(({ action, label, bg, border, color }) => (
                  <button
                    key={action}
                    onClick={() => handleBulkAction(action)}
                    disabled={bulkLoading}
                    style={{
                      padding: "6px 14px", borderRadius: "6px", fontSize: "12px",
                      fontWeight: 600, cursor: bulkLoading ? "not-allowed" : "pointer",
                      border: `1px solid ${border}`, background: bg, color,
                      opacity: bulkLoading ? 0.5 : 1, transition: "opacity .2s",
                      fontFamily: "Poppins, sans-serif",
                    }}
                  >
                    {bulkLoading ? "..." : label}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setSelectedIds(new Set())}
                style={{ marginLeft: "auto", background: "none", border: "none", color: "#666", fontSize: "18px", cursor: "pointer", lineHeight: 1 }}
              >×</button>
            </div>
          )}

          {/* Events Table */}
          <div className="rounded-xl overflow-hidden" style={{ background: "#1d191e", border: "1px solid #2a2a2a" }}>
            {loading ? (
              <div className="flex justify-center py-16">
                <div className="w-10 h-10 rounded-full border-2 border-transparent animate-spin"
                  style={{ borderTopColor: "#ff00e0", borderRightColor: "#ff00e0" }} />
              </div>
            ) : events.length === 0 ? (
              <div className="text-center py-24">
                <p className="text-white font-semibold">No events found</p>
                <p className="text-gray-500 text-sm mt-1">Try adjusting your filters</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid #2a2a2a" }}>
                      <th style={{ padding: "16px", width: 40 }}>
                        <input
                          type="checkbox"
                          checked={allSelected}
                          onChange={toggleSelectAll}
                          style={{ cursor: "pointer", accentColor: "#ff00e0", width: 15, height: 15 }}
                          title="Select all on this page"
                        />
                      </th>
                      <th style={{ padding: "16px", textAlign: "left", color: "#666", fontSize: "12px", fontWeight: 600 }}>Title</th>
                      <th style={{ padding: "16px", textAlign: "left", color: "#666", fontSize: "12px", fontWeight: 600 }}>Organizer</th>
                      <th style={{ padding: "16px", textAlign: "left", color: "#666", fontSize: "12px", fontWeight: 600 }}>Date</th>
                      <th style={{ padding: "16px", textAlign: "left", color: "#666", fontSize: "12px", fontWeight: 600 }}>Status</th>
                      <th style={{ padding: "16px", textAlign: "left", color: "#666", fontSize: "12px", fontWeight: 600 }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {events.map((event, i) => (
                      <tr
                        key={event.id}
                        style={{
                          borderBottom: i < events.length - 1 ? "1px solid #252525" : "none",
                          background: selectedIds.has(event.id) ? "rgba(255,0,224,0.04)" : "transparent",
                        }}
                      >
                        <td style={{ padding: "16px", width: 40 }}>
                          <input
                            type="checkbox"
                            checked={selectedIds.has(event.id)}
                            onChange={() => toggleSelect(event.id)}
                            style={{ cursor: "pointer", accentColor: "#ff00e0", width: 15, height: 15 }}
                          />
                        </td>
                        <td style={{ padding: "16px" }}>
                          <div>
                            <p className="font-semibold text-white text-sm truncate">{event.title}</p>
                            <p className="text-gray-500 text-xs mt-1">{event.city || event.location}</p>
                          </div>
                        </td>
                        <td style={{ padding: "16px" }}>
                          <div>
                            <p className="text-white text-sm">{event.organizer_username}</p>
                            <p className="text-gray-500 text-xs">{event.organizer_email}</p>
                          </div>
                        </td>
                        <td style={{ padding: "16px" }}>
                          <p className="text-gray-400 text-sm">
                            {format(new Date(event.date), "MMM d, yyyy")}
                          </p>
                        </td>
                        <td style={{ padding: "16px" }}>
                          <div style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            flexWrap: "wrap",
                          }}>
                            <span
                              style={{
                                padding: "4px 10px",
                                borderRadius: "4px",
                                fontSize: "11px",
                                fontWeight: 600,
                                background: STATUS_STYLE[event.status]?.bg,
                                color: STATUS_STYLE[event.status]?.color,
                              }}
                            >
                              {STATUS_STYLE[event.status]?.text}
                            </span>
                            {event.is_featured && (
                              <span style={{
                                padding: "4px 10px",
                                borderRadius: "4px",
                                fontSize: "11px",
                                fontWeight: 600,
                                background: "rgba(255,0,224,0.1)",
                                color: "#ff00e0",
                              }}>
                                ⭐ Featured
                              </span>
                            )}
                          </div>
                        </td>
                        <td style={{ padding: "16px" }}>
                          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                            <button
                              onClick={() => handleEditEvent(event.id)}
                              disabled={actioningId === event.id}
                              style={{
                                padding: "6px 12px",
                                fontSize: "11px",
                                fontWeight: 600,
                                borderRadius: "4px",
                                border: "1px solid #ff00e0",
                                background: "rgba(255,0,224,0.1)",
                                color: "#ff00e0",
                                cursor: "pointer",
                                opacity: actioningId === event.id ? 0.5 : 1,
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = "rgba(255,0,224,0.2)";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = "rgba(255,0,224,0.1)";
                              }}
                            >
                              Edit
                            </button>
                            {event.status === "pending" && (
                              <>
                                <button
                                  onClick={() => handleApprove(event.id)}
                                  disabled={actioningId === event.id}
                                  style={{
                                    padding: "6px 12px",
                                    fontSize: "11px",
                                    fontWeight: 600,
                                    borderRadius: "4px",
                                    border: "none",
                                    background: "#00ff64",
                                    color: "#000",
                                    cursor: "pointer",
                                    opacity: actioningId === event.id ? 0.5 : 1,
                                  }}
                                >
                                  {actioningId === event.id ? "..." : "✓"}
                                </button>
                                <button
                                  onClick={() => handleReject(event.id)}
                                  disabled={actioningId === event.id}
                                  style={{
                                    padding: "6px 12px",
                                    fontSize: "11px",
                                    fontWeight: 600,
                                    borderRadius: "4px",
                                    border: "1px solid #ff4444",
                                    background: "rgba(255,0,0,0.05)",
                                    color: "#ff4444",
                                    cursor: "pointer",
                                    opacity: actioningId === event.id ? 0.5 : 1,
                                  }}
                                >
                                  ✕
                                </button>
                              </>
                            )}
                            {event.status === "approved" && (
                              <button
                                onClick={() => handleFeature(event.id)}
                                disabled={actioningId === event.id}
                                style={{
                                  padding: "6px 12px",
                                  fontSize: "11px",
                                  fontWeight: 600,
                                  borderRadius: "4px",
                                  border: "1px solid #ff00e0",
                                  background: event.is_featured ? "rgba(255,0,224,0.2)" : "transparent",
                                  color: "#ff00e0",
                                  cursor: "pointer",
                                  opacity: actioningId === event.id ? 0.5 : 1,
                                }}
                              >
                                {actioningId === event.id ? "..." : (event.is_featured ? "Unfeature" : "Feature")}
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(event.id)}
                              disabled={actioningId === event.id}
                              style={{
                                padding: "6px 12px",
                                fontSize: "11px",
                                fontWeight: 600,
                                borderRadius: "4px",
                                border: "1px solid #666",
                                background: "transparent",
                                color: "#999",
                                cursor: "pointer",
                                opacity: actioningId === event.id ? 0.5 : 1,
                              }}
                            >
                              Delete
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

          {/* Pagination Controls */}
          {!loading && events.length > 0 && (
            <div style={{
              marginTop: "24px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "16px",
              background: "#1d191e",
              borderRadius: "6px",
              border: "1px solid #2a2a2a",
            }}>
              <div style={{ color: "#999", fontSize: "13px" }}>
                Page <span style={{ color: "#ff00e0", fontWeight: 600 }}>{page}</span> of{" "}
                <span style={{ color: "#ff00e0", fontWeight: 600 }}>{totalPages || 1}</span> • Showing{" "}
                <span style={{ color: "#ff00e0", fontWeight: 600 }}>{events.length}</span> of{" "}
                <span style={{ color: "#ff00e0", fontWeight: 600 }}>{totalCount}</span> events
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  onClick={handlePreviousPage}
                  disabled={page === 1}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "4px",
                    border: "1px solid #2a2a2a",
                    background: page === 1 ? "#0a0a0a" : "#1d191e",
                    color: page === 1 ? "#444" : "#e0e0e0",
                    fontSize: "12px",
                    fontWeight: 600,
                    cursor: page === 1 ? "not-allowed" : "pointer",
                    opacity: page === 1 ? 0.5 : 1,
                    transition: "all .2s",
                  }}
                  onMouseEnter={(e) => {
                    if (page !== 1) {
                      e.currentTarget.style.borderColor = "#ff00e0";
                      e.currentTarget.style.color = "#ff00e0";
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "#2a2a2a";
                    e.currentTarget.style.color = page === 1 ? "#444" : "#e0e0e0";
                  }}
                >
                  ← Previous
                </button>
                <button
                  onClick={handleNextPage}
                  disabled={!nextPage}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "4px",
                    border: "1px solid #2a2a2a",
                    background: !nextPage ? "#0a0a0a" : "#1d191e",
                    color: !nextPage ? "#444" : "#e0e0e0",
                    fontSize: "12px",
                    fontWeight: 600,
                    cursor: !nextPage ? "not-allowed" : "pointer",
                    opacity: !nextPage ? 0.5 : 1,
                    transition: "all .2s",
                  }}
                  onMouseEnter={(e) => {
                    if (nextPage) {
                      e.currentTarget.style.borderColor = "#ff00e0";
                      e.currentTarget.style.color = "#ff00e0";
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "#2a2a2a";
                    e.currentTarget.style.color = !nextPage ? "#444" : "#e0e0e0";
                  }}
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
