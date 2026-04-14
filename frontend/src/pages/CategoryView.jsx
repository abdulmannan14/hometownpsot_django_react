import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import EventCard, { haversineMiles } from "../components/EventCard";
import EventFilters from "../components/EventFilters";

const PAGE_SIZE = 12;

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

export default function CategoryView() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [categories, setCategories]       = useState([]);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [events, setEvents]               = useState([]);
  const [loading, setLoading]             = useState(true);
  const [page, setPage]                   = useState(1);
  const [totalCount, setTotalCount]       = useState(0);
  const [activeFilters, setActiveFilters] = useState({});
  const [radiusFilterActive, setRadiusFilterActive] = useState(false);
  const [locationDenied, setLocationDenied] = useState(false);

  // GPS
  const [userCoords, setUserCoords] = useState(null);

  // Featured venues (footer widget)
  const [featuredVenues, setFeaturedVenues] = useState([]);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  // ── Load all categories once ──
  useEffect(() => {
    api.get("/events/categories/").then(({ data }) => {
      const list = data.results ?? data;
      setCategories(list);
      if (!slug && list.length > 0) {
        // No slug → redirect to first category
        navigate(`/categories/${list[0].slug}`, { replace: true });
      }
    }).catch(() => {});
  }, []); // eslint-disable-line

  // ── Scroll to top when category changes ──
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  // ── Resolve current category from slug ──
  useEffect(() => {
    if (!slug || categories.length === 0) return;
    const found = categories.find(c => c.slug === slug);
    setCurrentCategory(found || null);
  }, [slug, categories]);

  // ── GPS on mount ──
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {},
      { timeout: 8000 }
    );
  }, []);

  // ── Featured venues ──
  useEffect(() => {
    api.get("/events/venues/").then(({ data }) => {
      const list = Array.isArray(data) ? data : (data.results || []);
      setFeaturedVenues(list.filter(v => v.is_featured));
    }).catch(() => {});
  }, []);

  // ── Fetch events for this category ──
  const fetchEvents = useCallback(async (extraParams = {}, pageNum = 1) => {
    if (!currentCategory) return;
    setLoading(true);
    try {
      const { data } = await api.get("/events/", {
        params: { category: currentCategory.id, ...extraParams, page: pageNum },
      });
      setEvents(data.results ?? data);
      setTotalCount(data.count ?? 0);
      setPage(pageNum);
    } catch {
      setEvents([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [currentCategory]);

  useEffect(() => {
    if (currentCategory) {
      setActiveFilters({});
      setRadiusFilterActive(false);
      fetchEvents({}, 1);
    }
  }, [currentCategory]); // eslint-disable-line

  const scrollToListings = () =>
    document.getElementById("category-listings")?.scrollIntoView({ behavior: "smooth", block: "start" });

  const handleFilter = async (params) => {
    const { radius, ...restParams } = params;

    if (radius) {
      setRadiusFilterActive(true);
      setActiveFilters(params);

      const doNearbyFetch = async (lat, lng) => {
        setLoading(true);
        try {
          const { data } = await api.get("/events/nearby/", {
            params: { lat, lng, radius, category: currentCategory?.id },
          });
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
        setLocationDenied(true); scrollToListings();
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
      setRadiusFilterActive(false);
      setActiveFilters(restParams);
      fetchEvents(restParams, 1);
      scrollToListings();
    }
  };

  const goToPage = (pageNum) => {
    if (pageNum < 1 || pageNum > totalPages || pageNum === page) return;
    fetchEvents(activeFilters, pageNum);
    scrollToListings();
  };

  return (
    <div style={{ background: "#191919", minHeight: "100vh", fontFamily: "Poppins, sans-serif" }}>

      {/* ── STICKY SEARCH BAR ── */}
      <EventFilters onFilter={handleFilter} loading={loading} />

      {/* ── CATEGORY HEADER ── */}
      <div style={{ background: "#0a0a0a", borderBottom: "1px solid #2a2a2a", padding: "32px 20px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <p style={{ color: "#ff00e0", fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 8 }}>
            Browse by Category
          </p>

          <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
            {/* Category title */}
            <h1 style={{ color: "#fff", fontSize: "clamp(22px, 4vw, 36px)", fontWeight: 800, margin: 0 }}>
              {currentCategory ? currentCategory.name : "All Events"}
            </h1>

            {/* Category switcher dropdown */}
            {categories.length > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ color: "#555", fontSize: 13 }}>Switch:</span>
                <select
                  value={slug || ""}
                  onChange={e => navigate(`/categories/${e.target.value}`)}
                  style={{
                    background: "#1d191e",
                    border: "1px solid #ff00e040",
                    color: "#ff00e0",
                    fontFamily: "Poppins, sans-serif",
                    fontSize: 13,
                    fontWeight: 600,
                    padding: "7px 14px",
                    borderRadius: 6,
                    cursor: "pointer",
                    outline: "none",
                  }}
                >
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.slug}>{cat.name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Event count */}
            {!loading && (
              <span style={{ color: "#555", fontSize: 13, marginLeft: "auto" }}>
                {totalCount} event{totalCount !== 1 ? "s" : ""}
              </span>
            )}
          </div>

          {/* Category tab strip */}
          {categories.length > 0 && (
            <div style={{ display: "flex", gap: 8, marginTop: 20, overflowX: "auto", paddingBottom: 4 }}>
              {categories.map(cat => (
                <Link
                  key={cat.id}
                  to={`/categories/${cat.slug}`}
                  style={{
                    flexShrink: 0,
                    padding: "5px 14px",
                    borderRadius: 20,
                    fontSize: 12,
                    fontWeight: 600,
                    textDecoration: "none",
                    background: cat.slug === slug ? "#ff00e0" : "rgba(255,255,255,0.05)",
                    color: cat.slug === slug ? "#fff" : "#aaa",
                    border: `1px solid ${cat.slug === slug ? "#ff00e0" : "#2a2a2a"}`,
                    transition: "all .2s",
                  }}
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── EVENTS GRID ── */}
      <div id="category-listings" style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 20px 60px" }}>

        {/* Location denied */}
        {locationDenied && radiusFilterActive && (
          <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, padding: "12px 16px", marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 18 }}>📍</span>
            <p style={{ color: "#f87171", fontSize: 13, margin: 0 }}>
              Location access was denied. Please allow location access to use the radius filter.
            </p>
          </div>
        )}

        {/* Section heading */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
          <h2 style={{ color: "#fff", fontSize: 20, fontWeight: 700, margin: 0 }}>
            {radiusFilterActive && activeFilters.radius
              ? `Events Within ${activeFilters.radius} Mile${activeFilters.radius !== 1 ? "s" : ""}`
              : currentCategory ? `${currentCategory.name} Events` : "Events"}
          </h2>
          {radiusFilterActive && (
            <span style={{ color: "#ff00e0", fontSize: 12, fontWeight: 600, background: "rgba(255,0,224,0.1)", border: "1px solid rgba(255,0,224,0.3)", borderRadius: 4, padding: "2px 10px" }}>
              📍 Near You
            </span>
          )}
          <div style={{ flex: 1, height: 1, background: "#2a2a2a" }} />
          {!loading && !radiusFilterActive && totalCount > 0 && (
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
            <div style={{ width: 40, height: 40, borderRadius: "50%", border: "3px solid transparent", borderTopColor: "#ff00e0", borderRightColor: "#ff00e0", animation: "spin .8s linear infinite" }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        ) : events.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0", color: "#555" }}>
            <p style={{ fontSize: 48, opacity: 0.3 }}>🎟️</p>
            <p style={{ fontSize: 18, color: "#888", marginTop: 16 }}>No events found.</p>
            <p style={{ fontSize: 14, marginTop: 8 }}>
              <Link to="/" style={{ color: "#ff00e0" }}>Back to all events</Link>
            </p>
          </div>
        ) : (
          <>
            <div className="event-grid">
              {events.map(event => (
                <EventCard key={event.id} event={event} userCoords={userCoords} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && !radiusFilterActive && (
              <div style={{ marginTop: 40, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, flexWrap: "wrap" }}>
                <button onClick={() => goToPage(page - 1)} disabled={page === 1}
                  style={{ padding: "8px 16px", borderRadius: 6, fontSize: 13, fontWeight: 600, border: "1px solid #2a2a2a", background: "#1d191e", color: page === 1 ? "#444" : "#e0e0e0", cursor: page === 1 ? "not-allowed" : "pointer", opacity: page === 1 ? 0.5 : 1, fontFamily: "Poppins, sans-serif" }}
                  onMouseEnter={e => { if (page !== 1) { e.currentTarget.style.borderColor = "#ff00e0"; e.currentTarget.style.color = "#ff00e0"; }}}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "#2a2a2a"; e.currentTarget.style.color = page === 1 ? "#444" : "#e0e0e0"; }}>
                  ← Prev
                </button>
                {buildPageItems(page, totalPages).map((item, idx) =>
                  item === "…" ? (
                    <span key={`e${idx}`} style={{ color: "#444", padding: "0 4px", fontSize: 13 }}>…</span>
                  ) : (
                    <button key={item} onClick={() => goToPage(item)}
                      style={{ width: 36, height: 36, borderRadius: 6, fontSize: 13, fontWeight: 600, border: item === page ? "1px solid #ff00e0" : "1px solid #2a2a2a", background: item === page ? "rgba(255,0,224,0.15)" : "#1d191e", color: item === page ? "#ff00e0" : "#aaa", cursor: item === page ? "default" : "pointer", fontFamily: "Poppins, sans-serif" }}
                      onMouseEnter={e => { if (item !== page) { e.currentTarget.style.borderColor = "#ff00e0"; e.currentTarget.style.color = "#ff00e0"; }}}
                      onMouseLeave={e => { if (item !== page) { e.currentTarget.style.borderColor = "#2a2a2a"; e.currentTarget.style.color = "#aaa"; }}}>
                      {item}
                    </button>
                  )
                )}
                <button onClick={() => goToPage(page + 1)} disabled={page === totalPages}
                  style={{ padding: "8px 16px", borderRadius: 6, fontSize: 13, fontWeight: 600, border: "1px solid #2a2a2a", background: "#1d191e", color: page === totalPages ? "#444" : "#e0e0e0", cursor: page === totalPages ? "not-allowed" : "pointer", opacity: page === totalPages ? 0.5 : 1, fontFamily: "Poppins, sans-serif" }}
                  onMouseEnter={e => { if (page !== totalPages) { e.currentTarget.style.borderColor = "#ff00e0"; e.currentTarget.style.color = "#ff00e0"; }}}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "#2a2a2a"; e.currentTarget.style.color = page === totalPages ? "#444" : "#e0e0e0"; }}>
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
                  <Link key={venue.id} to={`/venues/${venue.id}`} style={{ textDecoration: "none", flexShrink: 0, width: 220 }}>
                    <div style={{ background: "#1d191e", border: "1px solid #2a2a2a", borderRadius: 10, overflow: "hidden", transition: "transform .2s, box-shadow .2s" }}
                      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(255,0,224,.18)"; }}
                      onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}>
                      <div style={{ background: "#252525", position: "relative", overflow: "hidden" }}>
                        {venue.image
                          ? <img src={venue.image} alt={venue.name} style={{ width: "100%", height: "auto", display: "block" }} />
                          : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                              <span style={{ fontSize: 36, opacity: 0.3 }}>🏛️</span>
                            </div>
                        }
                        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,.6) 0%, transparent 60%)" }} />
                        {dist !== null && (
                          <div style={{ position: "absolute", bottom: 8, right: 8, background: "#ff00e0", color: "#fff", fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 4 }}>
                            {dist < 0.1 ? "< 0.1" : dist.toFixed(1)} mi
                          </div>
                        )}
                        {venue.upcoming_event_count > 0 && (
                          <div style={{ position: "absolute", top: 8, right: 8, background: "rgba(0,0,0,0.7)", color: "#ff00e0", fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 4, border: "1px solid rgba(255,0,224,0.4)" }}>
                            {venue.upcoming_event_count} upcoming
                          </div>
                        )}
                      </div>
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
    </div>
  );
}
