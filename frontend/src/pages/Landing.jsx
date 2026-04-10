import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import api from "../api/axios";
import heroBg from "../images/HTPheader.jpg";
import EventFilters from "../components/EventFilters";
import { useFavorites } from "../context/FavoritesContext";

/* ── tiny EventCard used only on landing ── */
function LandingEventCard({ event }) {
  const navigate = useNavigate();
  const { isSaved, toggle } = useFavorites();
  const saved = isSaved(event.id);

  const imageUrl = event.image
    ? event.image.startsWith("http") ? event.image : `http://localhost:8000${event.image}`
    : null;

  const handleHeart = (e) => {
    e.stopPropagation();
    toggle(event.id);
  };

  return (
    <div
      onClick={() => navigate(`/events/${event.id}`)}
      style={{ background: "#252525", borderRadius: 10, overflow: "hidden", cursor: "pointer", transition: "transform .2s, box-shadow .2s" }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 8px 30px rgba(255,0,224,.18)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}
    >
      {/* Image */}
      <div style={{ position: "relative", height: 190, background: "#1a1a1a", overflow: "hidden" }}>
        {imageUrl
          ? <img src={imageUrl} alt={event.title} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform .4s" }} />
          : (
            <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="48" height="48" fill="none" stroke="#ff00e0" strokeWidth="1.5" opacity=".35" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        {/* gradient */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,.7) 0%, transparent 55%)" }} />
        {/* badges */}
        <div style={{ position: "absolute", top: 10, left: 10, display: "flex", gap: 6 }}>
          {event.is_featured && (
            <span style={{ background: "#ff00e0", color: "#fff", fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 4 }}>Featured</span>
          )}
          {event.category && (
            <span style={{ background: "rgba(102,0,255,.85)", color: "#fff", fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 4 }}>{event.category.name}</span>
          )}
        </div>
        {/* heart button — toggles save, shows popup for guests */}
        <button
          onClick={handleHeart}
          title={saved ? "Remove from favorites" : "Save to favorites"}
          style={{
            position: "absolute", top: 10, right: 10,
            background: saved ? "#ff00e0" : "rgba(0,0,0,.55)",
            border: "none", borderRadius: "50%",
            width: 34, height: 34,
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer",
            transition: "background 0.2s, transform 0.15s",
          }}
          onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.15)")}
          onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
        >
          <svg width="16" height="16" viewBox="0 0 24 24"
            fill={saved ? "#fff" : "none"}
            stroke="#fff" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
      </div>

      {/* Body */}
      <div style={{ padding: "14px 16px 16px" }}>
        <h3 style={{ color: "#fff", fontWeight: 700, fontSize: 15, lineHeight: 1.35, marginBottom: 10, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {event.title}
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <svg width="14" height="14" fill="none" stroke="#ff00e0" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span style={{ color: "#aaa", fontSize: 12 }}>{format(new Date(event.date), "EEE, MMM d · h:mm a")}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <svg width="14" height="14" fill="none" stroke="#ff00e0" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span style={{ color: "#aaa", fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{event.city || event.location}</span>
          </div>
        </div>
        {/* share strip */}
        <div style={{ display: "flex", gap: 8, marginTop: 12, paddingTop: 12, borderTop: "1px solid #333" }}>
          <button onClick={e => e.stopPropagation()} style={{ background: "#333", border: "none", borderRadius: 4, padding: "4px 10px", color: "#aaa", fontSize: 11, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
            <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
            Share
          </button>
          <button onClick={e => e.stopPropagation()} style={{ background: "#333", border: "none", borderRadius: 4, padding: "4px 10px", color: "#aaa", fontSize: 11, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
            <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            Email
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   MAIN LANDING PAGE
══════════════════════════════════════════ */
const PAGE_SIZE = 12;

/* Returns array of page items: numbers or "…" strings */
function buildPageItems(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const items = [];
  const left  = Math.max(2, current - 1);
  const right = Math.min(total - 1, current + 1);
  items.push(1);
  if (left > 2) items.push("…");
  for (let i = left; i <= right; i++) items.push(i);
  if (right < total - 1) items.push("…");
  items.push(total);
  return items;
}

export default function Landing() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [activeFilters, setActiveFilters] = useState({});

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const fetchEvents = useCallback(async (params = {}, pageNum = 1) => {
    setLoading(true);
    try {
      const { data } = await api.get("/events/", { params: { ...params, page: pageNum } });
      setEvents(data.results ?? data);
      setTotalCount(data.count ?? 0);
      setPage(pageNum);
    } catch {
      setEvents([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  const handleFilter = (params) => {
    setActiveFilters(params);
    fetchEvents(params, 1);
  };

  const goToPage = (pageNum) => {
    if (pageNum < 1 || pageNum > totalPages || pageNum === page) return;
    fetchEvents(activeFilters, pageNum);
    document.getElementById("event-listings")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div style={{ background: "#191919", minHeight: "100vh", fontFamily: "Poppins, sans-serif" }}>

      {/* ── HERO TEXT ── */}
      <div style={{ background: "#191919", paddingTop: 48, paddingBottom: 0, textAlign: "center" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 16px" }}>
          <h1 style={{ color: "#fff", fontSize: "clamp(28px, 5vw, 46px)", fontWeight: 800, marginBottom: 12, lineHeight: 1.2 }}>
            💥 Reno events and poster art 💥
          </h1>
          <h2 style={{ color: "#e0e0e0", fontSize: "clamp(16px, 2.5vw, 24px)", fontWeight: 400, marginBottom: 28, lineHeight: 1.4 }}>
            share listings to rally a crowd<br />have fun &amp; support local
          </h2>

          {/* POST EVENTS HERE button */}
          <Link
            to="/events/new"
            style={{
              display: "inline-block",
              background: "#ff00e0",
              color: "#fff",
              fontWeight: 700,
              fontSize: 15,
              padding: "12px 36px",
              borderRadius: 6,
              textDecoration: "none",
              letterSpacing: "0.05em",
              marginBottom: 32,
              transition: "background .2s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.outline = "2px solid #ff00e0"; e.currentTarget.style.color = "#ff00e0"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "#ff00e0"; e.currentTarget.style.outline = "none"; e.currentTarget.style.color = "#fff"; }}
          >
            POST EVENTS HERE
          </Link>
        </div>
      </div>

      {/* ── HEADER IMAGE ── */}
      <div style={{ width: "100%", lineHeight: 0 }}>
        <img
          src={heroBg}
          alt="Reno's Hometown Post"
          style={{ width: "100%", display: "block", maxHeight: 440, objectFit: "cover" }}
        />
      </div>

      {/* ── CONTACT STRIP ── */}
      <div style={{ background: "#1d191e", borderBottom: "1px solid #2a2a2a", textAlign: "center", padding: "18px 16px" }}>
        <p style={{ color: "#e0e0e0", margin: 0, fontSize: 14, lineHeight: 1.8 }}>
          🏁&nbsp; Goodtimes &amp; Rock'n'Roll &nbsp;🏁<br />
          <span style={{ color: "#aaa" }}>call or text for any reason</span><br />
          <a href="tel:7755048090" style={{ color: "#ff00e0", textDecoration: "none", fontWeight: 600 }}>775-504-8090</a>
          &nbsp;&nbsp;·&nbsp;&nbsp;
          <Link to="/about" style={{ color: "#ff00e0", textDecoration: "none", fontWeight: 600 }}>About us</Link>
        </p>
      </div>

      {/* ── CHECK EVENT LISTINGS button ── */}
      <div style={{ textAlign: "center", padding: "28px 16px 8px" }}>
        <a
          href="#event-listings"
          style={{
            display: "inline-block",
            background: "transparent",
            border: "2px solid #ff00e0",
            color: "#ff00e0",
            fontWeight: 700,
            fontSize: 14,
            padding: "10px 32px",
            borderRadius: 6,
            textDecoration: "none",
            letterSpacing: "0.05em",
            transition: "background .2s, color .2s",
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "#ff00e0"; e.currentTarget.style.color = "#fff"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#ff00e0"; }}
        >
          Check Event Listings
        </a>
      </div>

      {/* ── EVENT LISTINGS ── */}
      <div id="event-listings" style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 20px 60px" }}>

        {/* Event Filters */}
        <div style={{ marginBottom: 32 }}>
          <EventFilters onFilter={handleFilter} />
        </div>

        {/* Section heading */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
          <h2 style={{ color: "#fff", fontSize: 22, fontWeight: 700, margin: 0 }}>Upcoming Events</h2>
          <div style={{ flex: 1, height: 1, background: "#2a2a2a" }} />
          {!loading && totalCount > 0 && (
            <span style={{ color: "#555", fontSize: 13 }}>
              {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, totalCount)} of {totalCount}
            </span>
          )}
        </div>

        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "80px 0" }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", border: "3px solid transparent", borderTopColor: "#ff00e0", borderRightColor: "#ff00e0", animation: "spin 0.8s linear infinite" }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        ) : events.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0", color: "#555" }}>
            <p style={{ fontSize: 18, color: "#888" }}>No events found.</p>
            <p style={{ fontSize: 14, marginTop: 8 }}>Be the first to <Link to="/events/new" style={{ color: "#ff00e0" }}>post an event</Link>!</p>
          </div>
        ) : (
          <>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              gap: 20,
            }}>
              {events.map(event => <LandingEventCard key={event.id} event={event} />)}
            </div>

            {/* ── PAGINATION ── */}
            {totalPages > 1 && (
              <div style={{ marginTop: 40, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, flexWrap: "wrap" }}>

                {/* Previous */}
                <button
                  onClick={() => goToPage(page - 1)}
                  disabled={page === 1}
                  style={{
                    padding: "8px 16px", borderRadius: 6, fontSize: 13, fontWeight: 600,
                    border: "1px solid #2a2a2a", background: "#1d191e",
                    color: page === 1 ? "#444" : "#e0e0e0",
                    cursor: page === 1 ? "not-allowed" : "pointer",
                    opacity: page === 1 ? 0.5 : 1,
                    transition: "all .2s", fontFamily: "Poppins, sans-serif",
                  }}
                  onMouseEnter={e => { if (page !== 1) { e.currentTarget.style.borderColor = "#ff00e0"; e.currentTarget.style.color = "#ff00e0"; }}}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "#2a2a2a"; e.currentTarget.style.color = page === 1 ? "#444" : "#e0e0e0"; }}
                >
                  ← Prev
                </button>

                {/* Page numbers */}
                {buildPageItems(page, totalPages).map((item, idx) =>
                  item === "…" ? (
                    <span key={`ellipsis-${idx}`} style={{ color: "#444", padding: "0 4px", fontSize: 13 }}>…</span>
                  ) : (
                    <button
                      key={item}
                      onClick={() => goToPage(item)}
                      style={{
                        width: 36, height: 36, borderRadius: 6, fontSize: 13, fontWeight: 600,
                        border: item === page ? "1px solid #ff00e0" : "1px solid #2a2a2a",
                        background: item === page ? "rgba(255,0,224,0.15)" : "#1d191e",
                        color: item === page ? "#ff00e0" : "#aaa",
                        cursor: item === page ? "default" : "pointer",
                        transition: "all .2s", fontFamily: "Poppins, sans-serif",
                      }}
                      onMouseEnter={e => { if (item !== page) { e.currentTarget.style.borderColor = "#ff00e0"; e.currentTarget.style.color = "#ff00e0"; }}}
                      onMouseLeave={e => { if (item !== page) { e.currentTarget.style.borderColor = "#2a2a2a"; e.currentTarget.style.color = "#aaa"; }}}
                    >
                      {item}
                    </button>
                  )
                )}

                {/* Next */}
                <button
                  onClick={() => goToPage(page + 1)}
                  disabled={page === totalPages}
                  style={{
                    padding: "8px 16px", borderRadius: 6, fontSize: 13, fontWeight: 600,
                    border: "1px solid #2a2a2a", background: "#1d191e",
                    color: page === totalPages ? "#444" : "#e0e0e0",
                    cursor: page === totalPages ? "not-allowed" : "pointer",
                    opacity: page === totalPages ? 0.5 : 1,
                    transition: "all .2s", fontFamily: "Poppins, sans-serif",
                  }}
                  onMouseEnter={e => { if (page !== totalPages) { e.currentTarget.style.borderColor = "#ff00e0"; e.currentTarget.style.color = "#ff00e0"; }}}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "#2a2a2a"; e.currentTarget.style.color = page === totalPages ? "#444" : "#e0e0e0"; }}
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── PROMO BANNER ── */}
      <div style={{ background: "#1d191e", borderTop: "1px solid #2a2a2a", borderBottom: "1px solid #2a2a2a", padding: "48px 20px", textAlign: "center" }}>
        <p style={{ color: "#ff00e0", fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 10 }}>Organizers</p>
        <h3 style={{ color: "#fff", fontSize: 28, fontWeight: 800, marginBottom: 12 }}>Promote Your Event</h3>
        <p style={{ color: "#aaa", fontSize: 14, maxWidth: 500, margin: "0 auto 24px", lineHeight: 1.7 }}>
          Create an account to SAVE listings to your calendar and ADD events to The Post for FREE
        </p>
        <Link
          to="/register"
          style={{
            display: "inline-block",
            background: "#ff00e0",
            color: "#fff",
            fontWeight: 700,
            fontSize: 14,
            padding: "12px 36px",
            borderRadius: 6,
            textDecoration: "none",
            letterSpacing: "0.05em",
            transition: "all .2s",
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.outline = "2px solid #ff00e0"; e.currentTarget.style.color = "#ff00e0"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "#ff00e0"; e.currentTarget.style.outline = "none"; e.currentTarget.style.color = "#fff"; }}
        >
          SIGNUP HERE
        </Link>
      </div>
    </div>
  );
}
