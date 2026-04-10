import React, { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import api from "../api/axios";

const STATUS_STYLE = {
  approved: { bg: "rgba(0,255,100,0.1)", color: "#00ff64", text: "Approved" },
  pending:  { bg: "rgba(255,200,0,0.1)",  color: "#ffc800", text: "Pending"  },
  rejected: { bg: "rgba(255,0,0,0.1)",    color: "#ff4444", text: "Rejected" },
};

export default function AdminExpiredEvents() {
  const [data, setData]       = useState({ count: 0, events: [] });
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [deleted, setDeleted]   = useState(null); // number deleted, shown in success banner

  const fetchExpired = useCallback(async () => {
    setLoading(true);
    try {
      const { data: res } = await api.get("/admin/events/expired/");
      setData(res);
    } catch (err) {
      console.error("Failed to fetch expired events:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchExpired(); }, [fetchExpired]);

  const handleDeleteAll = async () => {
    if (!window.confirm(
      `Permanently delete all ${data.count} expired event${data.count !== 1 ? "s" : ""}?\n\nThis cannot be undone.`
    )) return;

    setDeleting(true);
    try {
      const { data: res } = await api.delete("/admin/events/expired/");
      setDeleted(res.deleted);
      setData({ count: 0, events: [] });
    } catch (err) {
      alert("Failed to delete expired events. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div style={{ background: "#191919", minHeight: "100vh", padding: "32px" }}>
        <div className="max-w-7xl mx-auto">

          {/* Header */}
          <div style={{ marginBottom: "28px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <h1 className="text-3xl font-bold text-white">Expired Events</h1>
              <p className="text-gray-500 text-sm mt-1">
                Events whose date has already passed
              </p>
            </div>
            {data.count > 0 && (
              <button
                onClick={handleDeleteAll}
                disabled={deleting}
                style={{
                  padding: "10px 22px",
                  borderRadius: "6px",
                  border: "1px solid #ff4444",
                  background: deleting ? "rgba(255,68,68,0.05)" : "rgba(255,68,68,0.1)",
                  color: "#ff4444",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: deleting ? "not-allowed" : "pointer",
                  transition: "all .2s",
                  opacity: deleting ? 0.6 : 1,
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
                onMouseEnter={(e) => { if (!deleting) e.currentTarget.style.background = "rgba(255,68,68,0.2)"; }}
                onMouseLeave={(e) => { if (!deleting) e.currentTarget.style.background = "rgba(255,68,68,0.1)"; }}
              >
                {deleting ? (
                  <>
                    <span style={{ width: 14, height: 14, borderRadius: "50%", border: "2px solid transparent", borderTopColor: "#ff4444", display: "inline-block", animation: "spin 0.7s linear infinite" }} />
                    Deleting…
                  </>
                ) : (
                  <>🗑 Delete All Expired ({data.count})</>
                )}
              </button>
            )}
          </div>

          {/* Success banner */}
          {deleted !== null && (
            <div style={{
              marginBottom: "20px",
              padding: "14px 18px",
              borderRadius: "8px",
              background: "rgba(0,255,100,0.08)",
              border: "1px solid rgba(0,255,100,0.25)",
              color: "#00ff64",
              fontSize: "14px",
              fontWeight: 500,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}>
              <span>✓ Successfully deleted {deleted} expired event{deleted !== 1 ? "s" : ""}.</span>
              <button
                onClick={() => setDeleted(null)}
                style={{ background: "none", border: "none", color: "#00ff64", cursor: "pointer", fontSize: "16px", lineHeight: 1 }}
              >×</button>
            </div>
          )}

          {/* Stats card */}
          <div style={{
            marginBottom: "28px",
            padding: "20px 24px",
            borderRadius: "10px",
            background: "#1d191e",
            border: "1px solid #2a2a2a",
            display: "inline-flex",
            alignItems: "center",
            gap: "16px",
          }}>
            <div style={{
              width: 48, height: 48, borderRadius: "10px",
              background: data.count > 0 ? "rgba(255,68,68,0.12)" : "rgba(0,255,100,0.1)",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px",
            }}>
              {data.count > 0 ? "⏰" : "✓"}
            </div>
            <div>
              <p style={{ color: "#666", fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", margin: 0 }}>
                Expired Events
              </p>
              <p style={{
                fontSize: "32px", fontWeight: 800, margin: "2px 0 0",
                color: data.count > 0 ? "#ff4444" : "#00ff64",
              }}>
                {loading ? "—" : data.count}
              </p>
            </div>
          </div>

          {/* Table */}
          <div className="rounded-xl overflow-hidden" style={{ background: "#1d191e", border: "1px solid #2a2a2a" }}>
            {loading ? (
              <div className="flex justify-center py-16">
                <div className="w-10 h-10 rounded-full border-2 border-transparent animate-spin"
                  style={{ borderTopColor: "#ff00e0", borderRightColor: "#ff00e0" }} />
              </div>
            ) : data.events.length === 0 ? (
              <div className="text-center py-24">
                <div style={{ fontSize: "48px", marginBottom: "12px" }}>🎉</div>
                <p className="text-white font-semibold">No expired events</p>
                <p className="text-gray-500 text-sm mt-1">All events are current or upcoming</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid #2a2a2a" }}>
                      {["Event", "Location", "Event Date", "End Date", "Organizer", "Status"].map((h) => (
                        <th key={h} style={{ padding: "14px 16px", textAlign: "left", color: "#666", fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.events.map((event, i) => (
                      <tr
                        key={event.id}
                        style={{ borderBottom: i < data.events.length - 1 ? "1px solid #252525" : "none" }}
                      >
                        <td style={{ padding: "14px 16px" }}>
                          <p style={{ color: "#fff", fontSize: "13px", fontWeight: 600, margin: 0 }}>{event.title}</p>
                          <p style={{ color: "#555", fontSize: "11px", margin: "2px 0 0" }}>#{event.id}</p>
                        </td>
                        <td style={{ padding: "14px 16px" }}>
                          <p style={{ color: "#aaa", fontSize: "13px", margin: 0 }}>{event.city || event.location || "—"}</p>
                        </td>
                        <td style={{ padding: "14px 16px" }}>
                          <p style={{ color: "#ff4444", fontSize: "13px", margin: 0 }}>
                            {format(new Date(event.date), "MMM d, yyyy")}
                          </p>
                          <p style={{ color: "#555", fontSize: "11px", margin: "2px 0 0" }}>
                            {format(new Date(event.date), "h:mm a")}
                          </p>
                        </td>
                        <td style={{ padding: "14px 16px" }}>
                          {event.end_date ? (
                            <>
                              <p style={{ color: "#888", fontSize: "13px", margin: 0 }}>
                                {format(new Date(event.end_date), "MMM d, yyyy")}
                              </p>
                              <p style={{ color: "#555", fontSize: "11px", margin: "2px 0 0" }}>
                                {format(new Date(event.end_date), "h:mm a")}
                              </p>
                            </>
                          ) : (
                            <p style={{ color: "#444", fontSize: "13px", margin: 0 }}>—</p>
                          )}
                        </td>
                        <td style={{ padding: "14px 16px" }}>
                          <p style={{ color: "#aaa", fontSize: "13px", margin: 0 }}>{event.organizer_username || "—"}</p>
                        </td>
                        <td style={{ padding: "14px 16px" }}>
                          <span style={{
                            padding: "3px 10px",
                            borderRadius: "4px",
                            fontSize: "11px",
                            fontWeight: 600,
                            background: STATUS_STYLE[event.status]?.bg,
                            color: STATUS_STYLE[event.status]?.color,
                          }}>
                            {STATUS_STYLE[event.status]?.text ?? event.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {!loading && data.events.length > 0 && (
            <p style={{ color: "#555", fontSize: "12px", marginTop: "12px", textAlign: "right" }}>
              Showing all {data.count} expired event{data.count !== 1 ? "s" : ""}
            </p>
          )}
        </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
