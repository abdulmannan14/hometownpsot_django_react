import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useFavorites } from "../context/FavoritesContext";
import EventCard from "../components/EventCard";

export default function Dashboard() {
  const { user } = useAuth();
  const { savedIds } = useFavorites();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading]     = useState(true);

  const fetchFavorites = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/events/saved/");
      setFavorites((data.results ?? data).map(s => s.event));
    } catch {
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFavorites(); }, []);

  // Remove un-hearted events instantly
  useEffect(() => {
    setFavorites(prev => prev.filter(e => e && savedIds.has(e.id)));
  }, [savedIds]);

  return (
    <div style={{ background: "#191919", minHeight: "100vh", fontFamily: "Poppins, sans-serif" }}>
      {/* Header */}
      <div style={{ background: "#0a0a0a", borderBottom: "1px solid #2a2a2a", padding: "32px 20px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div>
            <p style={{ color: "#ff00e0", fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 4 }}>
              My Account
            </p>
            <h1 style={{ color: "#fff", fontSize: 26, fontWeight: 800, margin: 0 }}>My Calendar</h1>
            <p style={{ color: "#666", fontSize: 13, marginTop: 4 }}>
              Saved events for <span style={{ color: "#ff00e0" }}>{user?.username}</span>
              {savedIds.size > 0 && <span style={{ color: "#555" }}> · {savedIds.size} saved</span>}
            </p>
          </div>
          <Link to="/my-listings"
            style={{ background: "transparent", border: "1px solid #ff00e0", color: "#ff00e0", fontWeight: 700, fontSize: 13, padding: "10px 22px", borderRadius: 6, textDecoration: "none", transition: "all .2s" }}
            onMouseEnter={e => { e.currentTarget.style.background = "#ff00e0"; e.currentTarget.style.color = "#fff"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#ff00e0"; }}>
            My Listings →
          </Link>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 20px 60px" }}>
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "80px 0" }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", border: "3px solid transparent", borderTopColor: "#ff00e0", borderRightColor: "#ff00e0", animation: "spin .8s linear infinite" }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        ) : favorites.length === 0 ? (
          <div style={{ background: "#1d191e", border: "1px solid #2a2a2a", borderRadius: 14, textAlign: "center", padding: "64px 20px" }}>
            <p style={{ fontSize: 40, opacity: 0.3 }}>❤️</p>
            <p style={{ color: "#888", fontSize: 16, marginTop: 12 }}>No saved events yet</p>
            <p style={{ color: "#555", fontSize: 13, marginTop: 6 }}>Tap the heart on any event to save it here.</p>
            <Link to="/"
              style={{ display: "inline-block", marginTop: 20, background: "#ff00e0", color: "#fff", fontWeight: 700, fontSize: 13, padding: "10px 22px", borderRadius: 6, textDecoration: "none" }}>
              Browse Events
            </Link>
          </div>
        ) : (
          <div className="event-grid">
            {favorites.map(event => event && <EventCard key={event.id} event={event} />)}
          </div>
        )}
      </div>
    </div>
  );
}
