import { Link } from "react-router-dom";
import { format } from "date-fns";
import { useFavorites } from "../context/FavoritesContext";

export default function EventCard({ event }) {
  const { isSaved, toggle } = useFavorites();
  const saved = isSaved(event.id);

  const imageUrl = event.image
    ? event.image.startsWith("http") ? event.image : `http://localhost:8000${event.image}`
    : null;

  const handleHeart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggle(event.id);
  };

  return (
    <Link to={`/events/${event.id}`} className="card block group">
      {/* Image */}
      <div className="relative overflow-hidden" style={{ height: "200px" }}>
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ background: "#1d191e" }}>
            <svg className="w-14 h-14" style={{ color: "#ff00e0", opacity: 0.4 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}

        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 50%)" }} />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2 flex-wrap">
          {event.is_featured && (
            <span className="text-xs font-semibold px-2 py-0.5 rounded" style={{ background: "#ff00e0", color: "#fff" }}>
              Featured
            </span>
          )}
          {event.category && (
            <span className="text-xs font-semibold px-2 py-0.5 rounded" style={{ background: "rgba(102,0,255,0.85)", color: "#fff" }}>
              {event.category.name}
            </span>
          )}
        </div>

        {/* Heart button */}
        <button
          onClick={handleHeart}
          title={saved ? "Remove from favorites" : "Save to favorites"}
          style={{
            position: "absolute", top: "10px", right: "10px",
            width: "34px", height: "34px", borderRadius: "50%",
            border: "none", cursor: "pointer",
            background: saved ? "#ff00e0" : "rgba(0,0,0,0.55)",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "background 0.2s, transform 0.15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.15)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          <svg width="16" height="16" viewBox="0 0 24 24"
            fill={saved ? "#fff" : "none"}
            stroke={saved ? "#fff" : "#fff"}
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-bold text-white text-base leading-snug line-clamp-2 group-hover:text-[#ff00e0] transition-colors duration-200 mb-3">
          {event.title}
        </h3>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 shrink-0" style={{ color: "#ff00e0" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-xs text-gray-400">{format(new Date(event.date), "EEE, MMM d · h:mm a")}</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 shrink-0" style={{ color: "#ff00e0" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-xs text-gray-400 truncate">{event.city || event.location}</span>
          </div>
        </div>

        <div className="mt-4 pt-3" style={{ borderTop: "1px solid #333" }}>
          <span className="text-xs font-semibold" style={{ color: "#ff00e0" }}>
            View Details →
          </span>
        </div>
      </div>
    </Link>
  );
}
