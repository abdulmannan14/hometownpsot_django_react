import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import EventCard from "../components/EventCard";
import EventFilters from "../components/EventFilters";
import heroBg from "../images/HTPheader.jpg";

export default function Home() {
  const [events, setEvents] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nextPage, setNextPage] = useState(null);
  const [activeFilters, setActiveFilters] = useState({});

  const fetchEvents = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const { data } = await api.get("/events/", { params });
      setEvents(data.results ?? data);
      setNextPage(data.next ?? null);
    } catch {
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchFeatured = useCallback(async () => {
    try {
      const { data } = await api.get("/events/", { params: { is_featured: true } });
      setFeatured((data.results ?? data).slice(0, 3));
    } catch {
      setFeatured([]);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
    fetchFeatured();
  }, [fetchEvents, fetchFeatured]);

  const handleFilter = (params) => {
    setActiveFilters(params);
    fetchEvents(params);
  };

  const loadMore = async () => {
    if (!nextPage) return;
    const url = new URL(nextPage);
    const page = url.searchParams.get("page");
    const { data } = await api.get("/events/", { params: { ...activeFilters, page } });
    setEvents((prev) => [...prev, ...(data.results ?? data)]);
    setNextPage(data.next ?? null);
  };

  return (
    <div style={{ background: "#191919", minHeight: "100vh" }}>

      {/* Hero */}
      <div style={{ backgroundImage: `url(${heroBg})`, backgroundSize: "cover", backgroundPosition: "center", borderBottom: "1px solid #2a2a2a", position: "relative" }}
        className="py-20 px-4">
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.62)" }} />
        <div className="max-w-4xl mx-auto text-center" style={{ position: "relative", zIndex: 1 }}>
          <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: "#ff00e0" }}>
            Local Event Listings &amp; Poster Art
          </p>
          <h1 className="text-5xl font-extrabold text-white mb-5 leading-tight">
            Discover Events<br />
            <span style={{ color: "#ff00e0" }}>In Your Hometown</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto mb-8">
            Find concerts, markets, comedy shows, festivals and more happening right in your community.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/events/new" className="btn-primary px-8 py-3 text-base font-semibold">
              Promote Your Event
            </Link>
            <a href="#listings" className="btn-secondary px-8 py-3 text-base font-semibold">
              Browse Events
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Featured Events */}
        {featured.length > 0 && (
          <section className="mb-14">
            <div className="flex items-center gap-3 mb-6">
              <span style={{ color: "#ff00e0", fontSize: "20px" }}>★</span>
              <h2 className="text-2xl font-bold text-white">Featured Events</h2>
              <div className="flex-1 h-px" style={{ background: "#2a2a2a" }} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featured.map((event) => <EventCard key={event.id} event={event} />)}
            </div>
          </section>
        )}

        {/* Filters */}
        <div className="mb-10">
          <EventFilters onFilter={handleFilter} />
        </div>

        {/* All Events */}
        <section id="listings">
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-2xl font-bold text-white">All Events</h2>
            <div className="flex-1 h-px" style={{ background: "#2a2a2a" }} />
            {!loading && (
              <span className="text-sm text-gray-500">{events.length} event{events.length !== 1 ? "s" : ""}</span>
            )}
          </div>

          {loading ? (
            <div className="flex justify-center py-24">
              <div className="w-10 h-10 rounded-full border-2 border-transparent animate-spin"
                style={{ borderTopColor: "#ff00e0", borderRightColor: "#ff00e0" }} />
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-24">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5"
                style={{ background: "#252525" }}>
                <svg className="w-10 h-10 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-white font-semibold text-lg">No events found</p>
              <p className="text-gray-500 mt-2 text-sm">Try adjusting your search or filters.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {events.map((event) => <EventCard key={event.id} event={event} />)}
              </div>
              {nextPage && (
                <div className="text-center mt-10">
                  <button onClick={loadMore} className="btn-secondary px-10 py-3">
                    Load More Events
                  </button>
                </div>
              )}
            </>
          )}
        </section>

        {/* Promo Banner */}
        <div className="mt-20 rounded-2xl overflow-hidden"
          style={{ background: "linear-gradient(135deg, #1d191e, #0a0a0a)", border: "1px solid #2a2a2a" }}>
          <div className="px-8 py-12 text-center">
            <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: "#ff00e0" }}>
              Organizers
            </p>
            <h3 className="text-3xl font-bold text-white mb-4">Promote Your Event</h3>
            <p className="text-gray-400 max-w-xl mx-auto mb-8">
              Reach thousands of local event-goers. Get your event featured and boost attendance with our promotion packages.
            </p>
            <Link to="/events/new" className="btn-primary px-8 py-3 text-base font-semibold">
              Sign Up Here →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
