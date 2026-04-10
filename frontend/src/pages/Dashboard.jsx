import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useFavorites } from "../context/FavoritesContext";
import EventCard from "../components/EventCard";

const STATUS_STYLE = {
  approved: { background: "rgba(0,255,100,0.1)", color: "#00ff64", border: "1px solid rgba(0,255,100,0.3)" },
  pending:  { background: "rgba(255,200,0,0.1)", color: "#ffc800",  border: "1px solid rgba(255,200,0,0.3)" },
  rejected: { background: "rgba(255,0,0,0.1)",   color: "#ff4444",  border: "1px solid rgba(255,0,0,0.3)" },
};

export default function Dashboard() {
  const { user } = useAuth();
  const { savedIds } = useFavorites();
  const [tab, setTab] = useState("events"); // "events" | "favorites"
  const [events, setEvents] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favLoading, setFavLoading] = useState(false);
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

  const fetchFavorites = async () => {
    setFavLoading(true);
    try {
      const { data } = await api.get("/events/saved/");
      const items = data.results ?? data;
      setFavorites(items.map((s) => s.event));
    } catch {
      setFavorites([]);
    } finally {
      setFavLoading(false);
    }
  };

  useEffect(() => { fetchMyEvents(); }, []);

  useEffect(() => {
    if (tab === "favorites") fetchFavorites();
  }, [tab]); // fetch when switching to favorites tab

  // When an event is un-favourited, remove it from local list instantly
  useEffect(() => {
    if (tab === "favorites") {
      setFavorites((prev) => prev.filter((e) => e && savedIds.has(e.id)));
    }
  }, [savedIds, tab]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this event?")) return;
    setDeletingId(id);
    try {
      await api.delete(`/events/${id}/`);
      setEvents((prev) => prev.filter((e) => e.id !== id));
    } catch {
      alert("Failed to delete event.");
    } finally {
      setDeletingId(null);
    }
  };

  const totalViews = events.reduce((sum, e) => sum + (e.view_count || 0), 0);

  const stats = [
    { label: "Total Events",   value: events.length,                                            color: "#ffffff" },
    { label: "Published",      value: events.filter((e) => e.status === "approved").length,     color: "#00ff64" },
    { label: "Pending Review", value: events.filter((e) => e.status === "pending").length,      color: "#ffc800" },
    { label: "Total Views",    value: totalViews,                                               color: "#ff00e0" },
  ];

  const tabStyle = (active) => ({
    padding: "8px 20px",
    borderRadius: "6px",
    border: "none",
    fontWeight: 600,
    fontSize: "13px",
    cursor: "pointer",
    background: active ? "#ff00e0" : "transparent",
    color: active ? "#fff" : "#888",
    transition: "all 0.15s",
  });

  return (
    <div style={{ background: "#191919", minHeight: "100vh" }}>
      {/* Page header */}
      <div style={{ background: "#0a0a0a", borderBottom: "1px solid #2a2a2a" }} className="px-4 sm:px-8 py-8">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">My Dashboard</h1>
            <p className="text-gray-500 text-sm mt-1">Welcome back, <span style={{ color: "#ff00e0" }}>{user?.username}</span></p>
          </div>
          <Link to="/events/new" className="btn-primary px-6 py-2.5 text-sm">
            + Post New Event
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-10">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {stats.map((s) => (
            <div key={s.label} className="rounded-xl p-5 text-center" style={{ background: "#1d191e", border: "1px solid #2a2a2a" }}>
              <p className="text-3xl font-extrabold" style={{ color: s.color }}>{s.value}</p>
              <p className="text-xs text-gray-500 mt-1 font-medium">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: "4px", marginBottom: "20px", background: "#1d191e", padding: "4px", borderRadius: "8px", border: "1px solid #2a2a2a", width: "fit-content" }}>
          <button style={tabStyle(tab === "events")} onClick={() => setTab("events")}>My Events</button>
          <button style={tabStyle(tab === "favorites")} onClick={() => setTab("favorites")}>
            ❤️ Favorites {savedIds.size > 0 && <span style={{ marginLeft: "4px", background: "rgba(255,255,255,0.15)", borderRadius: "10px", padding: "1px 7px", fontSize: "11px" }}>{savedIds.size}</span>}
          </button>
        </div>

        {/* My Events tab */}
        {tab === "events" && (
          <div className="rounded-2xl overflow-hidden" style={{ background: "#1d191e", border: "1px solid #2a2a2a" }}>
            <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid #2a2a2a" }}>
              <h2 className="text-base font-bold text-white">Your Events</h2>
            </div>

            {loading ? (
              <div className="flex justify-center py-16">
                <div className="w-9 h-9 rounded-full border-2 border-transparent animate-spin"
                  style={{ borderTopColor: "#ff00e0", borderRightColor: "#ff00e0" }} />
              </div>
            ) : events.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-white font-semibold">No events yet</p>
                <p className="text-gray-500 text-sm mt-1">Post your first event to get started.</p>
                <Link to="/events/new" className="btn-primary text-sm mt-5 inline-flex px-6 py-2.5">Post an Event</Link>
              </div>
            ) : (
              <div>
                {events.map((event, i) => (
                  <div
                    key={event.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-4"
                    style={{ borderBottom: i < events.length - 1 ? "1px solid #252525" : "none" }}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link to={`/events/${event.id}`} className="font-semibold text-white hover:text-[#ff00e0] transition-colors truncate text-sm">
                          {event.title}
                        </Link>
                        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full"
                          style={STATUS_STYLE[event.status] || STATUS_STYLE.pending}>
                          {event.status}
                        </span>
                        {event.is_featured && (
                          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full"
                            style={{ background: "rgba(255,0,224,0.12)", color: "#ff00e0", border: "1px solid rgba(255,0,224,0.3)" }}>
                            ★ Featured
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {format(new Date(event.date), "MMM d, yyyy")} · {event.city || event.location}
                      </p>
                      {event.view_count > 0 && (
                        <p className="text-xs mt-1" style={{ color: "#ff00e0" }}>
                          👁 {event.view_count} view{event.view_count !== 1 ? "s" : ""}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Link to={`/events/${event.id}/edit`}
                        className="px-3 py-1.5 text-xs font-semibold rounded-md transition-all"
                        style={{ background: "#252525", color: "#e0e0e0", border: "1px solid #3a3a3a" }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = "#ff00e0"; e.currentTarget.style.color = "#ff00e0"; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = "#3a3a3a"; e.currentTarget.style.color = "#e0e0e0"; }}>
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(event.id)}
                        disabled={deletingId === event.id}
                        className="px-3 py-1.5 text-xs font-semibold rounded-md"
                        style={{ background: "rgba(255,0,0,0.08)", color: "#ff4444", border: "1px solid rgba(255,0,0,0.2)" }}>
                        {deletingId === event.id ? "..." : "Delete"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Favorites tab */}
        {tab === "favorites" && (
          <div>
            {favLoading ? (
              <div className="flex justify-center py-16">
                <div className="w-9 h-9 rounded-full border-2 border-transparent animate-spin"
                  style={{ borderTopColor: "#ff00e0", borderRightColor: "#ff00e0" }} />
              </div>
            ) : favorites.length === 0 ? (
              <div className="rounded-2xl text-center py-20" style={{ background: "#1d191e", border: "1px solid #2a2a2a" }}>
                <div style={{ fontSize: "40px", marginBottom: "12px" }}>❤️</div>
                <p className="text-white font-semibold">No saved events yet</p>
                <p className="text-gray-500 text-sm mt-1">Tap the heart on any event to save it here.</p>
                <Link to="/" className="btn-primary text-sm mt-5 inline-flex px-6 py-2.5">Browse Events</Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {favorites.map((event) => event && <EventCard key={event.id} event={event} />)}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
