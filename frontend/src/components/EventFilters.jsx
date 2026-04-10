import React, { useState, useEffect } from "react";
import api from "../api/axios";

const RADIUS_OPTIONS = [1, 3, 5, 10, 30, 60];

export default function EventFilters({ onFilter }) {
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [city, setCity] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [radius, setRadius] = useState("");

  useEffect(() => {
    api.get("/events/categories/").then(({ data }) => setCategories(data.results ?? data)).catch(() => {});
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const params = {};
    if (search) params.search = search;
    if (category) params.category = category;
    if (city) params.city = city;
    if (dateFrom) params.date_from = dateFrom;
    if (radius) params.radius = parseInt(radius);
    onFilter(params);
  };

  const handleReset = () => {
    setSearch(""); setCategory(""); setCity(""); setDateFrom(""); setRadius("");
    onFilter({});
  };

  const inputStyle = {
    background: "#252525",
    border: "1px solid #3a3a3a",
    color: "#fff",
    fontFamily: "Poppins, sans-serif",
  };

  return (
    <form onSubmit={handleSubmit} style={{ background: "#1d191e", border: "1px solid #2a2a2a" }} className="rounded-xl p-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Search */}
        <div>
          <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Search</label>
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search events..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-9"
              style={inputStyle}
            />
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Category</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="input" style={inputStyle}>
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        {/* City */}
        <div>
          <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Location</label>
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <input
              type="text"
              placeholder="City or venue..."
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="input pl-9"
              style={inputStyle}
            />
          </div>
        </div>

        {/* Date */}
        <div>
          <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">From Date</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="input"
            style={{ ...inputStyle, colorScheme: "dark" }}
          />
        </div>

        {/* Radius */}
        <div>
          <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: radius ? "#ff00e0" : "#9ca3af" }}>
            📍 Radius
          </label>
          <select
            value={radius}
            onChange={(e) => setRadius(e.target.value)}
            className="input"
            style={{
              ...inputStyle,
              borderColor: radius ? "#ff00e0" : "#3a3a3a",
              color: radius ? "#ff00e0" : "#fff",
            }}
          >
            <option value="">Any Distance</option>
            {RADIUS_OPTIONS.map((r) => (
              <option key={r} value={r}>{r} mile{r !== 1 ? "s" : ""}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Radius hint */}
      {radius && (
        <p style={{ color: "#fff", fontSize: "11px", marginTop: "8px" }}>
          📍 Radius filter uses your device location. Make sure location access is allowed in your browser.
        </p>
      )}

      <div className="flex gap-3 mt-4">
        <button type="submit" className="btn-primary text-sm px-6">Search Events</button>
        <button type="button" onClick={handleReset} className="btn-secondary text-sm px-4">Reset</button>
      </div>
    </form>
  );
}
