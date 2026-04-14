import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { format } from "date-fns";
import { useFavorites } from "../context/FavoritesContext";
import { useAuth } from "../context/AuthContext";

const DESC_LIMIT = 150;

export function haversineMiles(lat1, lon1, lat2, lon2) {
  const R = 3958.8;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

export default function EventCard({ event, userCoords }) {
  const navigate = useNavigate();
  const { isSaved, toggle } = useFavorites();
  const { user } = useAuth();
  const saved = isSaved(event.id);
  const isOwner = user && (user.id === event.organizer || user.id === event.organizer?.id);
  const [descExpanded, setDescExpanded] = useState(false);

  const distanceMiles =
    userCoords && event.latitude && event.longitude
      ? haversineMiles(userCoords.lat, userCoords.lng, event.latitude, event.longitude)
      : null;

  const desc = event.description || "";
  const isLong = desc.length > DESC_LIMIT;
  const displayDesc = !isLong || descExpanded ? desc : desc.slice(0, DESC_LIMIT).trimEnd() + "…";

  const imageUrl = event.image
    ? event.image.startsWith("http") ? event.image : `http://localhost:8000${event.image}`
    : null;

  const eventUrl = `${window.location.origin}/events/${event.id}`;
  const smsBody = [
    "Check out this upcoming event. See you there!",
    "",
    event.title,
    ...(imageUrl ? [imageUrl] : []),
    eventUrl,
  ].join("\n");

  const [imageBlob, setImageBlob] = useState(null);

  // Pre-fetch poster so it's ready for Web Share API the instant the button is tapped
  useEffect(() => {
    if (!imageUrl) return;
    let active = true;
    fetch(imageUrl, { mode: "cors", cache: "reload" })
      .then(r => r.blob())
      .then(b => { if (active) setImageBlob(b); })
      .catch(() => {});
    return () => { active = false; };
  }, [imageUrl]);

  const handleTextShare = (e) => {
    e.stopPropagation();
    const shareText = `Check out this upcoming event. See you there!\n\n${event.title}`;
    // Web Share API with image file — opens native share sheet with poster attached
    if (navigator.share && imageBlob) {
      const file = new File([imageBlob], "event-poster.jpg", { type: imageBlob.type });
      navigator.share({ files: [file], text: shareText, url: eventUrl })
        .catch(() => {
          // File sharing not supported — try without the image
          navigator.share({ text: shareText, url: eventUrl })
            .catch(() => {
              window.location.href = `sms:?body=${encodeURIComponent(smsBody)}`;
            });
        });
      return;
    }
    // No Web Share API or image not loaded yet — sms: fallback
    window.location.href = `sms:?body=${encodeURIComponent(smsBody)}`;
  };

  return (
    <div
      onClick={() => navigate(`/events/${event.id}`)}
      style={{ background: "#252525", borderRadius: 10, overflow: "hidden", cursor: "pointer", transition: "transform .2s, box-shadow .2s" }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 8px 30px rgba(255,0,224,.18)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}
    >
      {/* Image */}
      <div style={{ position: "relative", background: "#1a1a1a", overflow: "hidden" }}>
        {imageUrl
          ? <img src={imageUrl} alt={event.title} crossOrigin="anonymous" style={{ width: "100%", height: "auto", display: "block", transition: "transform .4s" }} />
          : (
            <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="48" height="48" fill="none" stroke="#ff00e0" strokeWidth="1.5" opacity=".35" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,.7) 0%, transparent 55%)" }} />
        <div style={{ position: "absolute", top: 10, left: 10, display: "flex", gap: 6 }}>
          {event.is_featured && (
            <span style={{ background: "#ff00e0", color: "#fff", fontSize: 13, fontWeight: 700, padding: "2px 8px", borderRadius: 4 }}>Featured</span>
          )}
          {event.category?.slug && (
            <Link
              to={`/categories/${event.category.slug}`}
              onClick={e => e.stopPropagation()}
              style={{ background: "rgba(102,0,255,.85)", color: "#fff", fontSize: 13, fontWeight: 700, padding: "2px 8px", borderRadius: 4, textDecoration: "none", transition: "background 0.2s" }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(102,0,255,1)"}
              onMouseLeave={e => e.currentTarget.style.background = "rgba(102,0,255,.85)"}
            >
              {event.category.name}
            </Link>
          )}
        </div>
        <div style={{ position: "absolute", top: 10, right: 10, display: "flex", flexDirection: "column", gap: 6 }}>
          <button
            onClick={e => { e.stopPropagation(); toggle(event.id); }}
            title={saved ? "Remove from favorites" : "Save to favorites"}
            style={{ background: saved ? "#ff00e0" : "rgba(0,0,0,.55)", border: "none", borderRadius: "50%", width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "background 0.2s, transform 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.transform = "scale(1.15)"}
            onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill={saved ? "#fff" : "none"} stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>
          {isOwner && (
            <button
              onClick={e => { e.stopPropagation(); navigate(`/events/${event.id}/edit`); }}
              title="Edit your event"
              style={{ background: "rgba(0,0,0,.55)", border: "none", borderRadius: "50%", width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "background 0.2s, transform 0.15s" }}
              onMouseEnter={e => { e.currentTarget.style.background = "#ff00e0"; e.currentTarget.style.transform = "scale(1.15)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(0,0,0,.55)"; e.currentTarget.style.transform = "scale(1)"; }}
            >
              <svg width="15" height="15" fill="none" stroke="#fff" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: "14px 16px 16px" }}>
        <h3 style={{ color: "#fff", fontWeight: 700, fontSize: 17, lineHeight: 1.35, marginBottom: 8, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {event.title}
        </h3>

        {desc && (
          <div style={{ marginBottom: 10 }}>
            <span style={{ color: "#bbb", fontSize: 14, lineHeight: 1.5 }}>{displayDesc}</span>
            {isLong && (
              <button onClick={e => { e.stopPropagation(); setDescExpanded(v => !v); }}
                style={{ background: "none", border: "none", color: "#ff00e0", fontSize: 14, fontWeight: 700, cursor: "pointer", padding: "0 0 0 4px" }}>
                {descExpanded ? "less" : "more"}
              </button>
            )}
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <svg width="14" height="14" fill="none" stroke="#ff00e0" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span style={{ color: "#aaa", fontSize: 14 }}>{format(new Date(event.date), "EEE, MMM d · h:mm a")}</span>
          </div>
          {(event.venue?.name || event.location) && (
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <svg width="14" height="14" fill="none" stroke="#ff00e0" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <span style={{ color: "#aaa", fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {event.venue?.name || event.location}
              </span>
            </div>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <svg width="14" height="14" fill="none" stroke="#ff00e0" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span style={{ color: "#aaa", fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {event.city || event.location}
            </span>
          </div>
          {distanceMiles !== null && (
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <svg width="14" height="14" fill="none" stroke="#ff00e0" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 9m0 8V9m0 0L9 7" />
              </svg>
              <span style={{ color: "#ff00e0", fontSize: 14, fontWeight: 600 }}>
                {distanceMiles < 0.1 ? "< 0.1" : distanceMiles.toFixed(1)} mi away
              </span>
            </div>
          )}
          {event.category?.slug && (
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <svg width="14" height="14" fill="none" stroke="#ff00e0" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a2 2 0 012-2z" />
              </svg>
              <Link
                to={`/categories/${event.category.slug}`}
                onClick={e => e.stopPropagation()}
                style={{ color: "#a855f7", fontSize: 14, fontWeight: 600, textDecoration: "none", transition: "color 0.2s" }}
                onMouseEnter={e => e.currentTarget.style.color = "#c084fc"}
                onMouseLeave={e => e.currentTarget.style.color = "#a855f7"}
              >
                {event.category.name}
              </Link>
            </div>
          )}
          {event.ticket_price != null && (
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <svg width="14" height="14" fill="none" stroke="#ff00e0" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
              <span style={{ color: parseFloat(event.ticket_price) === 0 ? "#00ff64" : "#aaa", fontSize: 14, fontWeight: parseFloat(event.ticket_price) === 0 ? 700 : 400 }}>
                {parseFloat(event.ticket_price) === 0 ? "Free" : `$${parseFloat(event.ticket_price).toFixed(2)}`}
              </span>
            </div>
          )}
        </div>

        {/* GO button */}
        <a
          href={
            event.latitude && event.longitude
              ? `https://www.google.com/maps/dir/?api=1&destination=${event.latitude},${event.longitude}`
              : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((event.venue?.name ? event.venue.name + " " : "") + (event.city || event.location || ""))}`
          }
          target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
          style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 10, padding: "8px", borderRadius: 6, background: "rgba(255,0,224,0.1)", border: "1px solid rgba(255,0,224,0.35)", color: "#ff00e0", fontSize: 14, fontWeight: 700, textDecoration: "none", letterSpacing: "0.04em", transition: "background 0.2s" }}
          onMouseEnter={e => { e.currentTarget.style.background = "#ff00e0"; e.currentTarget.style.color = "#fff"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,0,224,0.1)"; e.currentTarget.style.color = "#ff00e0"; }}
        >
          <svg width="13" height="13" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
          </svg>
          GO — Get Directions
        </a>

        {/* SMS share — small inline button */}
        <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px solid #2a2a2a", display: "flex", justifyContent: "flex-start" }}>
          <button
            onClick={handleTextShare}
            style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 20, background: "rgba(37,211,102,0.1)", border: "1px solid rgba(37,211,102,0.3)", color: "#25D366", fontSize: 13, fontWeight: 700, cursor: "pointer", transition: "all 0.2s", fontFamily: "Poppins, sans-serif" }}
            onMouseEnter={e => { e.currentTarget.style.background = "#25D366"; e.currentTarget.style.color = "#fff"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(37,211,102,0.1)"; e.currentTarget.style.color = "#25D366"; }}
          >
            <svg width="11" height="11" fill="currentColor" viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" /></svg>
            SMS
          </button>
        </div>
      </div>
    </div>
  );
}
