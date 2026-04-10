import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { format } from "date-fns";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [lightbox, setLightbox] = useState(null);

  useEffect(() => {
    api.get(`/events/${id}/`)
      .then(({ data }) => setEvent(data))
      .catch(() => navigate("/", { replace: true }))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleDelete = async () => {
    if (!window.confirm("Delete this event?")) return;
    setDeleting(true);
    try {
      await api.delete(`/events/${id}/`);
      navigate("/dashboard");
    } catch {
      alert("Failed to delete event.");
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]" style={{ background: "#191919" }}>
        <div className="w-10 h-10 rounded-full border-2 border-transparent animate-spin"
          style={{ borderTopColor: "#ff00e0", borderRightColor: "#ff00e0" }} />
      </div>
    );
  }

  if (!event) return null;

  const isOwner = user && event.organizer?.id === user.id;
  const isAdmin = user?.role === "admin" || user?.is_staff;

  const resolveUrl = (url) =>
    url ? (url.startsWith("http") ? url : `http://localhost:8000${url}`) : null;

  const imageUrl = resolveUrl(event.image);
  const galleryImages = (event.images || []).map((img) => ({
    ...img,
    image: resolveUrl(img.image),
  }));

  const allImages = [
    ...(imageUrl ? [{ image: imageUrl }] : []),
    ...galleryImages,
  ];

  return (
    <div style={{ background: "#191919", minHeight: "100vh" }}>
      {/* Hero image */}
      <div className="relative w-full" style={{ height: "380px", background: "#0a0a0a" }}>
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={event.title}
            className="w-full h-full object-cover"
            style={{ opacity: 0.7, cursor: allImages.length > 1 ? "pointer" : "default" }}
            onClick={() => allImages.length > 0 && setLightbox(0)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ background: "#1d191e" }}>
            <svg className="w-20 h-20" style={{ color: "#ff00e0", opacity: 0.3 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(25,25,25,1) 0%, rgba(0,0,0,0.4) 60%, transparent 100%)" }} />

        {/* Title overlay */}
        <div className="absolute bottom-0 left-0 right-0 px-4 sm:px-8 pb-8 max-w-5xl mx-auto w-full">
          <div className="flex flex-wrap gap-2 mb-3">
            {event.category_detail && (
              <span className="text-xs font-semibold px-3 py-1 rounded-full" style={{ background: "#6600ff", color: "#fff" }}>
                {event.category_detail.name}
              </span>
            )}
            {event.is_featured && (
              <span className="text-xs font-semibold px-3 py-1 rounded-full" style={{ background: "#ff00e0", color: "#fff" }}>
                ★ Featured
              </span>
            )}
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">{event.title}</h1>
        </div>
      </div>

      {/* Gallery grid — shown inside content area below hero, rendered inline with main content */}

      {/* Lightbox */}
      {lightbox !== null && (
        <div
          onClick={() => setLightbox(null)}
          style={{
            position: "fixed", inset: 0, zIndex: 1000,
            background: "rgba(0,0,0,0.92)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          {/* Prev */}
          {lightbox > 0 && (
            <button
              onClick={(e) => { e.stopPropagation(); setLightbox(lightbox - 1); }}
              style={{
                position: "absolute", left: "20px",
                background: "rgba(255,0,224,0.15)", border: "1px solid #ff00e0",
                color: "#ff00e0", fontSize: "24px", borderRadius: "50%",
                width: "48px", height: "48px", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >‹</button>
          )}

          <img
            src={allImages[lightbox]?.image}
            alt=""
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "90vw", maxHeight: "88vh", objectFit: "contain", borderRadius: "8px" }}
          />

          {/* Next */}
          {lightbox < allImages.length - 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); setLightbox(lightbox + 1); }}
              style={{
                position: "absolute", right: "20px",
                background: "rgba(255,0,224,0.15)", border: "1px solid #ff00e0",
                color: "#ff00e0", fontSize: "24px", borderRadius: "50%",
                width: "48px", height: "48px", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >›</button>
          )}

          {/* Close */}
          <button
            onClick={() => setLightbox(null)}
            style={{
              position: "absolute", top: "20px", right: "20px",
              background: "rgba(0,0,0,0.5)", border: "1px solid #666",
              color: "#fff", fontSize: "20px", borderRadius: "50%",
              width: "40px", height: "40px", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >×</button>

          {/* Counter */}
          <div style={{
            position: "absolute", bottom: "20px",
            color: "#999", fontSize: "13px",
            background: "rgba(0,0,0,0.5)", padding: "4px 12px", borderRadius: "20px",
          }}>
            {lightbox + 1} / {allImages.length}
          </div>
        </div>
      )}

      {/* Breadcrumb */}
      <div style={{ background: "#0a0a0a", borderBottom: "1px solid #2a2a2a" }} className="px-4 sm:px-8 py-3">
        <div className="max-w-5xl mx-auto flex items-center gap-2 text-xs text-gray-500">
          <Link to="/" className="hover:text-[#ff00e0] transition-colors">Home</Link>
          <span>/</span>
          <span className="text-gray-400">Events</span>
          {event.category_detail && <><span>/</span><span className="text-gray-400">{event.category_detail.name}</span></>}
          <span>/</span>
          <span style={{ color: "#ff00e0" }}>{event.title}</span>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Main */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-xl p-6" style={{ background: "#1d191e", border: "1px solid #2a2a2a" }}>
              <h2 className="text-lg font-bold text-white mb-4">About This Event</h2>
              <p className="text-gray-400 text-sm leading-relaxed whitespace-pre-wrap">{event.description}</p>
            </div>

            {/* Photo Gallery */}
            {galleryImages.length > 0 && (
              <div className="rounded-xl p-6" style={{ background: "#1d191e", border: "1px solid #2a2a2a" }}>
                <h2 className="text-lg font-bold text-white mb-4">Photos</h2>
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: "6px",
                }}>
                  {galleryImages.map((img, i) => (
                    <div
                      key={img.id || i}
                      onClick={() => setLightbox(i + 1)}
                      style={{
                        aspectRatio: "1 / 1",
                        overflow: "hidden",
                        cursor: "pointer",
                        borderRadius: "4px",
                        position: "relative",
                      }}
                    >
                      <img
                        src={img.image}
                        alt=""
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          transition: "transform 0.25s",
                          display: "block",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.06)")}
                        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Organizer */}
            <div className="rounded-xl p-6" style={{ background: "#1d191e", border: "1px solid #2a2a2a" }}>
              <h2 className="text-lg font-bold text-white mb-4">Organizer</h2>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg"
                  style={{ background: "#ff00e0", color: "#fff" }}>
                  {(event.organizer_name || event.organizer?.username || "?")[0].toUpperCase()}
                </div>
                <div>
                  <p className="text-white font-semibold">{event.organizer_name || event.organizer?.username}</p>
                  {event.organizer_email && (
                    <a href={`mailto:${event.organizer_email}`} className="text-sm" style={{ color: "#ff00e0" }}>
                      {event.organizer_email}
                    </a>
                  )}
                  {event.organizer_phone && <p className="text-xs text-gray-500 mt-0.5">{event.organizer_phone}</p>}
                </div>
              </div>
              {event.website && (
                <a href={event.website} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 mt-4 text-sm font-medium transition-colors"
                  style={{ color: "#ff00e0" }}>
                  Visit Website
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              )}
            </div>

            {/* Owner actions */}
            {(isOwner || isAdmin) && (
              <div className="flex gap-3">
                <Link to={`/events/${id}/edit`} className="btn-secondary text-sm px-5 py-2.5">Edit Event</Link>
                <button onClick={handleDelete} disabled={deleting}
                  className="px-5 py-2.5 text-sm font-semibold rounded-md transition-all"
                  style={{ background: "rgba(255,0,0,0.15)", color: "#ff4444", border: "1px solid rgba(255,0,0,0.3)" }}>
                  {deleting ? "Deleting..." : "Delete Event"}
                </button>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="rounded-xl p-6 space-y-5" style={{ background: "#1d191e", border: "1px solid #2a2a2a" }}>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Date &amp; Time</p>
                <p className="text-white font-semibold">{format(new Date(event.date), "EEEE, MMMM d, yyyy")}</p>
                <p className="text-gray-400 text-sm">
                  {format(new Date(event.date), "h:mm a")}
                  {event.end_date && ` – ${format(new Date(event.end_date), "h:mm a")}`}
                </p>
              </div>
              <div style={{ borderTop: "1px solid #2a2a2a" }} className="pt-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Location</p>
                <p className="text-white font-semibold">{event.location}</p>
                {event.city && <p className="text-gray-400 text-sm">{event.city}</p>}
              </div>
              <div style={{ borderTop: "1px solid #2a2a2a" }} className="pt-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Status</p>
                <span className="text-xs font-semibold px-3 py-1 rounded-full"
                  style={{
                    background: event.status === "approved" ? "rgba(0,255,100,0.1)" : "rgba(255,200,0,0.1)",
                    color: event.status === "approved" ? "#00ff64" : "#ffc800",
                    border: `1px solid ${event.status === "approved" ? "rgba(0,255,100,0.3)" : "rgba(255,200,0,0.3)"}`
                  }}>
                  {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                </span>
              </div>
            </div>

            <Link to="/" className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#ff00e0] transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to all events
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
