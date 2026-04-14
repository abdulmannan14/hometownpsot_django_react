import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const STATUS_STYLE = {
  approved: { background: "rgba(0,255,100,0.1)", color: "#00ff64", border: "1px solid rgba(0,255,100,0.3)" },
  pending:  { background: "rgba(255,200,0,0.1)", color: "#ffc800",  border: "1px solid rgba(255,200,0,0.3)" },
  rejected: { background: "rgba(255,0,0,0.1)",   color: "#ff4444",  border: "1px solid rgba(255,0,0,0.3)" },
};

export default function MyListings() {
  const { user } = useAuth();
  const [events, setEvents]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  const fetchMyEvents = async () => {
    try {
      const { data } = await api.get("/events/mine/");
      setEvents(data.results ?? data);
    } catch {
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMyEvents(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Permanently delete this event?")) return;
    setDeletingId(id);
    try {
      await api.delete(`/events/${id}/`);
      setEvents(prev => prev.filter(e => e.id !== id));
    } catch {
      alert("Failed to delete event.");
    } finally {
      setDeletingId(null);
    }
  };

  const totalViews = events.reduce((sum, e) => sum + (e.view_count || 0), 0);

  const stats = [
    { label: "Total Listings",   value: events.length,                                        color: "#ffffff" },
    { label: "Published",        value: events.filter(e => e.status === "approved").length,   color: "#00ff64" },
    { label: "Pending Review",   value: events.filter(e => e.status === "pending").length,    color: "#ffc800" },
    { label: "Total Views",      value: totalViews,                                           color: "#ff00e0" },
  ];

  return (
    <div style={{ background: "#191919", minHeight: "100vh", fontFamily: "Poppins, sans-serif" }}>

      {/* Header */}
      <div style={{ background: "#0a0a0a", borderBottom: "1px solid #2a2a2a", padding: "32px 20px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div>
            <p style={{ color: "#ff00e0", fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 4 }}>
              My Account
            </p>
            <h1 style={{ color: "#fff", fontSize: 26, fontWeight: 800, margin: 0 }}>My Listings</h1>
            <p style={{ color: "#666", fontSize: 13, marginTop: 4 }}>
              Events posted by <span style={{ color: "#ff00e0" }}>{user?.username}</span>
            </p>
          </div>
          <Link to="/events/new"
            style={{ background: "#ff00e0", color: "#fff", fontWeight: 700, fontSize: 13, padding: "10px 22px", borderRadius: 6, textDecoration: "none", transition: "opacity .2s" }}
            onMouseEnter={e => e.currentTarget.style.opacity = ".85"}
            onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
            + Post New Event
          </Link>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 20px 60px" }}>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 32 }}>
          {stats.map(s => (
            <div key={s.label} style={{ background: "#1d191e", border: "1px solid #2a2a2a", borderRadius: 12, padding: "18px 16px", textAlign: "center" }}>
              <p style={{ color: s.color, fontSize: 28, fontWeight: 800, margin: 0 }}>{s.value}</p>
              <p style={{ color: "#555", fontSize: 11, marginTop: 4 }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Table */}
        <div style={{ background: "#1d191e", border: "1px solid #2a2a2a", borderRadius: 14, overflow: "hidden" }}>
          <div style={{ padding: "16px 24px", borderBottom: "1px solid #2a2a2a", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <h2 style={{ color: "#fff", fontSize: 15, fontWeight: 700, margin: 0 }}>
              Your Events <span style={{ color: "#555", fontWeight: 400, fontSize: 13 }}>({events.length})</span>
            </h2>
          </div>

          {loading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: "60px 0" }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", border: "3px solid transparent", borderTopColor: "#ff00e0", borderRightColor: "#ff00e0", animation: "spin .8s linear infinite" }} />
              <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            </div>
          ) : events.length === 0 ? (
            <div style={{ textAlign: "center", padding: "64px 0" }}>
              <p style={{ fontSize: 40, opacity: 0.3 }}>📋</p>
              <p style={{ color: "#888", fontSize: 16, marginTop: 12 }}>No listings yet</p>
              <p style={{ color: "#555", fontSize: 13, marginTop: 6 }}>Post your first event and it will appear here.</p>
              <Link to="/events/new"
                style={{ display: "inline-block", marginTop: 20, background: "#ff00e0", color: "#fff", fontWeight: 700, fontSize: 13, padding: "10px 22px", borderRadius: 6, textDecoration: "none" }}>
                Post an Event
              </Link>
            </div>
          ) : (
            <div>
              {events.map((event, i) => (
                <div
                  key={event.id}
                  style={{
                    display: "flex", alignItems: "center", gap: 16,
                    padding: "16px 24px",
                    borderBottom: i < events.length - 1 ? "1px solid #252525" : "none",
                    transition: "background .15s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.02)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  {/* Thumbnail */}
                  <div style={{ width: 56, height: 56, borderRadius: 8, overflow: "hidden", flexShrink: 0, background: "#252525", border: "1px solid #2a2a2a" }}>
                    {event.image
                      ? <img src={event.image.startsWith("http") ? event.image : `http://localhost:8000${event.image}`} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <svg width="20" height="20" fill="none" stroke="#555" strokeWidth="1.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                    }
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <Link to={`/events/${event.id}`}
                        style={{ color: "#fff", fontWeight: 600, fontSize: 14, textDecoration: "none", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                        onMouseEnter={e => e.currentTarget.style.color = "#ff00e0"}
                        onMouseLeave={e => e.currentTarget.style.color = "#fff"}>
                        {event.title}
                      </Link>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 20, ...STATUS_STYLE[event.status] }}>
                        {event.status}
                      </span>
                      {event.is_featured && (
                        <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 20, background: "rgba(255,0,224,0.12)", color: "#ff00e0", border: "1px solid rgba(255,0,224,0.3)" }}>
                          ⭐ Featured
                        </span>
                      )}
                    </div>
                    <p style={{ color: "#666", fontSize: 12, marginTop: 4 }}>
                      {format(new Date(event.date), "MMM d, yyyy · h:mm a")}
                      {(event.city || event.location) && ` · ${event.city || event.location}`}
                    </p>
                    {event.view_count > 0 && (
                      <p style={{ color: "#ff00e0", fontSize: 11, marginTop: 3 }}>
                        👁 {event.view_count} view{event.view_count !== 1 ? "s" : ""}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                    <Link to={`/events/${event.id}/edit`}
                      title="Edit event"
                      style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 14px", borderRadius: 6, fontSize: 12, fontWeight: 600, textDecoration: "none", background: "#252525", color: "#e0e0e0", border: "1px solid #3a3a3a", transition: "all .2s" }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = "#ff00e0"; e.currentTarget.style.color = "#ff00e0"; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = "#3a3a3a"; e.currentTarget.style.color = "#e0e0e0"; }}>
                      {/* Pencil icon */}
                      <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(event.id)}
                      disabled={deletingId === event.id}
                      title="Delete event"
                      style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 14px", borderRadius: 6, fontSize: 12, fontWeight: 600, background: "rgba(255,0,0,0.06)", color: "#ff4444", border: "1px solid rgba(255,0,0,0.2)", cursor: deletingId === event.id ? "default" : "pointer", opacity: deletingId === event.id ? 0.6 : 1, transition: "all .2s" }}
                      onMouseEnter={e => { if (deletingId !== event.id) { e.currentTarget.style.background = "rgba(255,0,0,0.14)"; e.currentTarget.style.borderColor = "#ff4444"; }}}
                      onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,0,0,0.06)"; e.currentTarget.style.borderColor = "rgba(255,0,0,0.2)"; }}>
                      {/* Trash icon */}
                      <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      {deletingId === event.id ? "Deleting…" : "Delete"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
