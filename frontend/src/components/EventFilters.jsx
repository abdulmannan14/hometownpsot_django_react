import React, { useState, useEffect } from "react";
import api from "../api/axios";

const RADIUS_OPTIONS = [1, 3, 5, 10, 30, 60];

const ipt = {
  background: "#1a1a1a",
  border: "1px solid #2e2e2e",
  color: "#fff",
  fontFamily: "Poppins, sans-serif",
  fontSize: 13,
  padding: "8px 12px",
  borderRadius: 6,
  outline: "none",
  width: "100%",
};

export default function EventFilters({ onFilter, loading = false }) {
  const [categories, setCategories] = useState([]);
  const [search, setSearch]       = useState("");
  const [category, setCategory]   = useState("");
  const [city, setCity]           = useState("");
  const [dateFrom, setDateFrom]   = useState("");
  const [radius, setRadius]       = useState("");
  const [expanded, setExpanded]   = useState(false);

  useEffect(() => {
    api.get("/events/categories/").then(({ data }) => setCategories(data.results ?? data)).catch(() => {});
  }, []);

  const activeCount = [search, category, city, dateFrom, radius].filter(Boolean).length;

  const doSearch = (overrides = {}) => {
    const params = {};
    const s  = overrides.search   !== undefined ? overrides.search   : search;
    const c  = overrides.category !== undefined ? overrides.category : category;
    const ci = overrides.city     !== undefined ? overrides.city     : city;
    const d  = overrides.dateFrom !== undefined ? overrides.dateFrom : dateFrom;
    const r  = overrides.radius   !== undefined ? overrides.radius   : radius;
    if (s)  params.search    = s;
    if (c)  params.category  = c;
    if (ci) params.city      = ci;
    if (d)  params.date_from = d;
    if (r)  params.radius    = parseInt(r);
    onFilter(params);
  };

  const handleSubmit = (e) => { e.preventDefault(); doSearch(); };

  const handleReset = () => {
    setSearch(""); setCategory(""); setCity(""); setDateFrom(""); setRadius("");
    onFilter({});
  };

  // Pressing Enter in search fires immediately
  const handleSearchKey = (e) => {
    if (e.key === "Enter") { e.preventDefault(); doSearch(); }
  };

  return (
    <div style={{
      position: "sticky",
      top: 60,           // below the 60px navbar
      zIndex: 40,
      background: "#0f0f0f",
      borderBottom: `1px solid ${expanded ? "#ff00e040" : "#1e1e1e"}`,
      transition: "border-color .25s",
    }}>
      <form onSubmit={handleSubmit}>

        {/* ── Collapsed row (always visible) ── */}
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "10px 20px", display: "flex", alignItems: "center", gap: 10 }}>

          {/* Search input */}
          <div style={{ position: "relative", flex: 1, minWidth: 0 }}>
            <svg style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", opacity: .45, pointerEvents: "none" }}
              width="15" height="15" fill="none" stroke="#fff" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search events, venues, cities…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={handleSearchKey}
              style={{ ...ipt, paddingLeft: 34 }}
            />
          </div>

          {/* Filters toggle */}
          <button
            type="button"
            onClick={() => setExpanded(v => !v)}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              background: expanded ? "rgba(255,0,224,0.12)" : "#1a1a1a",
              border: `1px solid ${expanded ? "#ff00e0" : "#2e2e2e"}`,
              color: expanded ? "#ff00e0" : "#aaa",
              fontFamily: "Poppins, sans-serif",
              fontSize: 12, fontWeight: 600,
              padding: "8px 14px", borderRadius: 6,
              cursor: "pointer", whiteSpace: "nowrap",
              transition: "all .2s",
            }}
          >
            {/* Sliders icon */}
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h10M4 18h6" />
            </svg>
            Filters
            {activeCount > 0 && (
              <span style={{ background: "#ff00e0", color: "#fff", fontSize: 10, fontWeight: 800, borderRadius: "50%", width: 17, height: 17, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {activeCount}
              </span>
            )}
            {/* Chevron */}
            <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"
              style={{ transition: "transform .2s", transform: expanded ? "rotate(180deg)" : "rotate(0deg)" }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Search button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              background: "#ff00e0", color: "#fff",
              fontFamily: "Poppins, sans-serif",
              fontSize: 12, fontWeight: 700,
              padding: "8px 20px", borderRadius: 6,
              border: "none", cursor: loading ? "default" : "pointer",
              whiteSpace: "nowrap",
              opacity: loading ? 0.75 : 1,
              display: "flex", alignItems: "center", gap: 6,
              transition: "opacity .2s",
            }}
          >
            {loading ? (
              <>
                <span style={{ width: 12, height: 12, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", display: "inline-block", animation: "spin .7s linear infinite" }} />
                Searching…
              </>
            ) : "Search"}
          </button>
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>

        {/* ── Expanded row ── */}
        {expanded && (
          <div style={{ borderTop: "1px solid #1e1e1e", background: "#0a0a0a" }}>
            <div style={{ maxWidth: 1280, margin: "0 auto", padding: "14px 20px", display: "flex", alignItems: "flex-end", gap: 12, flexWrap: "wrap" }}>

              {/* Category */}
              <div style={{ flex: "1 1 160px", minWidth: 140 }}>
                <label style={{ display: "block", color: "#666", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 5 }}>Category</label>
                <select value={category} onChange={e => setCategory(e.target.value)} style={ipt}>
                  <option value="">All Categories</option>
                  {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                </select>
              </div>

              {/* City */}
              <div style={{ flex: "1 1 160px", minWidth: 140 }}>
                <label style={{ display: "block", color: "#666", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 5 }}>City / Location</label>
                <div style={{ position: "relative" }}>
                  <svg style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", opacity: .4, pointerEvents: "none" }}
                    width="13" height="13" fill="none" stroke="#fff" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <input type="text" placeholder="e.g. Reno, NV" value={city} onChange={e => setCity(e.target.value)} style={{ ...ipt, paddingLeft: 30 }} />
                </div>
              </div>

              {/* Date from */}
              <div style={{ flex: "1 1 150px", minWidth: 140 }}>
                <label style={{ display: "block", color: "#666", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 5 }}>From Date</label>
                <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} style={{ ...ipt, colorScheme: "dark" }} />
              </div>

              {/* Radius */}
              <div style={{ flex: "1 1 150px", minWidth: 140 }}>
                <label style={{ display: "block", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 5, color: radius ? "#ff00e0" : "#666" }}>
                  📍 Radius
                </label>
                <select value={radius} onChange={e => setRadius(e.target.value)}
                  style={{ ...ipt, borderColor: radius ? "#ff00e0" : "#2e2e2e", color: radius ? "#ff00e0" : "#fff" }}>
                  <option value="">Any Distance</option>
                  {RADIUS_OPTIONS.map(r => <option key={r} value={r}>{r} mile{r !== 1 ? "s" : ""}</option>)}
                </select>
              </div>

              {/* Action buttons */}
              <div style={{ display: "flex", gap: 8, alignItems: "flex-end", paddingBottom: 1 }}>
                <button type="submit"
                  style={{ background: "#ff00e0", color: "#fff", fontFamily: "Poppins, sans-serif", fontSize: 12, fontWeight: 700, padding: "8px 18px", borderRadius: 6, border: "none", cursor: "pointer" }}
                  onMouseEnter={e => e.currentTarget.style.opacity = ".85"}
                  onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
                  Apply
                </button>
                {(search || activeCount > 0) && (
                  <button type="button" onClick={handleReset}
                    style={{ background: "transparent", border: "1px solid #2e2e2e", color: "#666", fontFamily: "Poppins, sans-serif", fontSize: 12, fontWeight: 600, padding: "8px 14px", borderRadius: 6, cursor: "pointer" }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = "#ff00e040"; e.currentTarget.style.color = "#aaa"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "#2e2e2e"; e.currentTarget.style.color = "#666"; }}>
                    Reset
                  </button>
                )}
              </div>

              {/* Radius hint */}
              {radius && (
                <p style={{ width: "100%", color: "#fff", fontSize: 11, margin: 0 }}>
                  📍 Radius filter uses your device location. Make sure location access is allowed in your browser.
                </p>
              )}
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
