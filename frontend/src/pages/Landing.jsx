import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import heroBg from "../images/HTPheader.jpg";
import EventFilters from "../components/EventFilters";
import EventCard, { haversineMiles } from "../components/EventCard";

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

  // ── Stored GPS coords (for EventCard distance display + radius filter) ──
  const [userCoords, setUserCoords] = useState(null); // { lat, lng }
  const [radiusFilterActive, setRadiusFilterActive] = useState(false);
  const [locationDenied, setLocationDenied] = useState(false);

  // ── Featured venues ──
  const [featuredVenues, setFeaturedVenues] = useState([]);

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

  // Fetch featured venues once
  useEffect(() => {
    api.get("/events/venues/").then(({ data }) => {
      const list = Array.isArray(data) ? data : (data.results || []);
      setFeaturedVenues(list.filter(v => v.is_featured));
    }).catch(() => {});
  }, []);

  // Request GPS on mount (for EventCard distance badges + radius filter)
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        setUserCoords({ lat, lng });
      },
      () => {},
      { timeout: 8000 }
    );
  }, []);

  const scrollToListings = () => {
    document.getElementById("event-listings")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleFilter = async (params) => {
    const { radius, ...restParams } = params;

    if (radius) {
      // Radius filter: use nearby endpoint
      setRadiusFilterActive(true);
      setActiveFilters(params);

      const doNearbyFetch = async (lat, lng) => {
        setLoading(true);
        try {
          const { data } = await api.get("/events/nearby/", { params: { lat, lng, radius } });
          setEvents(data.results || []);
          setTotalCount(data.count || 0);
          setPage(1);
        } catch {
          setEvents([]);
          setTotalCount(0);
        } finally {
          setLoading(false);
          scrollToListings();
        }
      };

      if (userCoords) {
        doNearbyFetch(userCoords.lat, userCoords.lng);
      } else if (!navigator.geolocation) {
        setLocationDenied(true);
        scrollToListings();
      } else {
        setLoading(true);
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const { latitude: lat, longitude: lng } = pos.coords;
            setUserCoords({ lat, lng });
            setLocationDenied(false);
            doNearbyFetch(lat, lng);
          },
          () => { setLocationDenied(true); setLoading(false); scrollToListings(); },
          { timeout: 8000 }
        );
      }
    } else {
      // Normal filter
      setRadiusFilterActive(false);
      setActiveFilters(restParams);
      fetchEvents(restParams, 1);
      scrollToListings();
    }
  };

  const goToPage = (pageNum) => {
    if (pageNum < 1 || pageNum > totalPages || pageNum === page) return;
    fetchEvents(activeFilters, pageNum);
    document.getElementById("event-listings")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div style={{ background: "#191919", minHeight: "100vh", fontFamily: "Poppins, sans-serif" }}>

      {/* ── SEARCH BAR (sticky, top of page) ── */}
      <EventFilters onFilter={handleFilter} loading={loading} />

      {/* ── HERO TEXT ── */}
      <div style={{ background: "#191919", paddingTop: 48, paddingBottom: 0, textAlign: "center" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 16px" }}>
          <h1 style={{ color: "#fff", fontSize: "clamp(30px, 5vw, 48px)", fontWeight: 800, marginBottom: 12, lineHeight: 1.2 }}>
            💥 Local events and poster art 💥
          </h1>
          <h2 style={{ color: "#e0e0e0", fontSize: "clamp(18px, 2.5vw, 26px)", fontWeight: 400, marginBottom: 28, lineHeight: 1.4 }}>
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
              fontSize: 17,
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
          alt="THE HOMETOWN POST"
          style={{ width: "100%", display: "block", height: "auto" }}
        />
      </div>

      {/* ── CONTACT STRIP ── */}
      <div style={{ background: "#1d191e", borderBottom: "1px solid #2a2a2a", textAlign: "center", padding: "24px 16px" }}>
        <p style={{ color: "#e0e0e0", margin: "0 0 4px", fontSize: 16, fontWeight: 600 }}>
          🏁&nbsp;&nbsp; Goodtimes &amp; Rock'n'Roll &nbsp;&nbsp;🏁
        </p>
        <p style={{ color: "#aaa", margin: "0 0 4px", fontSize: 15 }}>
          call or text for any reason
        </p>
        <p style={{ margin: "0 0 4px" }}>
          <a href="tel:7755048090" style={{ color: "#fff", textDecoration: "none", fontWeight: 700, fontSize: 16 }}>775-504-8090</a>
        </p>
        <p style={{ margin: 0 }}>
          <Link to="/about" style={{ color: "#fff", textDecoration: "none", fontWeight: 600, fontSize: 16 }}>About us</Link>
        </p>
      </div>


      {/* ── EVENT LISTINGS ── */}
      <div id="event-listings" style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 20px 60px" }}>

        {/* Location denied warning */}
        {locationDenied && radiusFilterActive && (
          <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "8px", padding: "12px 16px", marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "18px" }}>📍</span>
            <p style={{ color: "#f87171", fontSize: "13px", margin: 0 }}>
              Location access was denied. Please allow location access in your browser settings to use the radius filter.
            </p>
          </div>
        )}

        {/* Section heading */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
          <h2 style={{ color: "#fff", fontSize: 22, fontWeight: 700, margin: 0 }}>
            {radiusFilterActive && activeFilters.radius
              ? `Events Within ${activeFilters.radius} Mile${activeFilters.radius !== 1 ? "s" : ""}`
              : "Upcoming Events"}
          </h2>
          {radiusFilterActive && activeFilters.radius && (
            <span style={{ color: "#ff00e0", fontSize: 12, fontWeight: 600, background: "rgba(255,0,224,0.1)", border: "1px solid rgba(255,0,224,0.3)", borderRadius: 4, padding: "2px 10px" }}>
              📍 Near You
            </span>
          )}
          <div style={{ flex: 1, height: 1, background: "#2a2a2a" }} />
          {!loading && totalCount > 0 && !radiusFilterActive && (
            <span style={{ color: "#555", fontSize: 13 }}>
              {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, totalCount)} of {totalCount}
            </span>
          )}
          {!loading && radiusFilterActive && (
            <span style={{ color: "#555", fontSize: 13 }}>{events.length} found</span>
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
            <div className="event-grid">
              {events.map(event => <EventCard key={event.id} event={event} userCoords={userCoords} />)}
            </div>

            {/* ── PAGINATION ── */}
            {totalPages > 1 && !radiusFilterActive && (
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

      {/* ── FEATURED NEARBY VENUES ── */}
      {featuredVenues.length > 0 && (
        <div style={{ background: "#0a0a0a", borderTop: "1px solid #2a2a2a", borderBottom: "1px solid #2a2a2a", padding: "40px 20px" }}>
          <div style={{ maxWidth: 1280, margin: "0 auto" }}>
            {/* Heading */}
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
              <span style={{ fontSize: 22 }}>🏛️</span>
              <h2 style={{ color: "#fff", fontSize: 22, fontWeight: 700, margin: 0 }}>Nearby Venues</h2>
              {userCoords && (
                <span style={{ color: "#ff00e0", fontSize: 13, fontWeight: 600, background: "rgba(255,0,224,0.1)", border: "1px solid rgba(255,0,224,0.3)", borderRadius: 4, padding: "2px 10px" }}>
                  sorted by distance
                </span>
              )}
              <div style={{ flex: 1, height: 1, background: "#2a2a2a" }} />
              <Link to="/events/venues" style={{ color: "#ff00e0", fontSize: 13, fontWeight: 600, textDecoration: "none" }}
                onMouseEnter={e => e.currentTarget.style.textDecoration = "underline"}
                onMouseLeave={e => e.currentTarget.style.textDecoration = "none"}>
                View All →
              </Link>
            </div>

            {/* Horizontal scroll strip */}
            <div style={{ display: "flex", gap: 16, overflowX: "auto", paddingBottom: 8, scrollbarWidth: "thin", scrollbarColor: "#ff00e0 #1d191e" }}>
              {(userCoords
                ? [...featuredVenues].sort((a, b) => {
                    const da = a.latitude && a.longitude ? haversineMiles(userCoords.lat, userCoords.lng, a.latitude, a.longitude) : Infinity;
                    const db = b.latitude && b.longitude ? haversineMiles(userCoords.lat, userCoords.lng, b.latitude, b.longitude) : Infinity;
                    return da - db;
                  })
                : featuredVenues
              ).map(venue => {
                const dist = userCoords && venue.latitude && venue.longitude
                  ? haversineMiles(userCoords.lat, userCoords.lng, venue.latitude, venue.longitude)
                  : null;
                return (
                  <Link
                    key={venue.id}
                    to={`/venues/${venue.id}`}
                    style={{ textDecoration: "none", flexShrink: 0, width: 220 }}
                  >
                    <div style={{ background: "#1d191e", border: "1px solid #2a2a2a", borderRadius: 10, overflow: "hidden", transition: "transform .2s, box-shadow .2s" }}
                      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(255,0,224,.18)"; }}
                      onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}>
                      {/* Image */}
                      <div style={{ background: "#252525", position: "relative", overflow: "hidden" }}>
                        {venue.image
                          ? <img src={venue.image} alt={venue.name} style={{ width: "100%", height: "auto", display: "block" }} />
                          : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                              <span style={{ fontSize: 36, opacity: 0.3 }}>🏛️</span>
                            </div>
                        }
                        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,.6) 0%, transparent 60%)" }} />
                        {/* Distance badge */}
                        {dist !== null && (
                          <div style={{ position: "absolute", bottom: 8, right: 8, background: "#ff00e0", color: "#fff", fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 4 }}>
                            {dist < 0.1 ? "< 0.1" : dist.toFixed(1)} mi
                          </div>
                        )}
                        {/* Upcoming badge */}
                        {venue.upcoming_event_count > 0 && (
                          <div style={{ position: "absolute", top: 8, right: 8, background: "rgba(0,0,0,0.7)", color: "#ff00e0", fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 4, border: "1px solid rgba(255,0,224,0.4)" }}>
                            {venue.upcoming_event_count} upcoming
                          </div>
                        )}
                      </div>
                      {/* Info */}
                      <div style={{ padding: "10px 12px 12px" }}>
                        <p style={{ color: "#fff", fontWeight: 700, fontSize: 13, marginBottom: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{venue.name}</p>
                        <p style={{ color: "#666", fontSize: 11, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{venue.city}</p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}

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
