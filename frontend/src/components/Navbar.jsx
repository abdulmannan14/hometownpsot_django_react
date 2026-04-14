import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function SignupModal({ onClose }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(0,0,0,0.75)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 20,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "#1d191e",
          border: "1px solid #2a2a2a",
          borderRadius: 14,
          padding: "36px 32px",
          maxWidth: 400,
          width: "100%",
          textAlign: "center",
          position: "relative",
        }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          style={{ position: "absolute", top: 14, right: 16, background: "none", border: "none", color: "#555", fontSize: 22, cursor: "pointer", lineHeight: 1 }}
        >
          ×
        </button>

        {/* Icon */}
        <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(255,0,224,0.12)", border: "1px solid rgba(255,0,224,0.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
          <svg width="24" height="24" fill="none" stroke="#ff00e0" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        </div>

        <h2 style={{ color: "#fff", fontSize: 22, fontWeight: 800, marginBottom: 8 }}>Post Your Event</h2>
        <p style={{ color: "#888", fontSize: 16, lineHeight: 1.6, marginBottom: 28 }}>
          Create a free account to list your event on THE HOMETOWN POST and reach your local crowd.
        </p>

        <Link
          to="/register"
          onClick={onClose}
          style={{
            display: "block",
            background: "#ff00e0",
            color: "#fff",
            fontWeight: 700,
            fontSize: 16,
            padding: "12px",
            borderRadius: 7,
            textDecoration: "none",
            marginBottom: 12,
            transition: "opacity .2s",
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = ".85"}
          onMouseLeave={e => e.currentTarget.style.opacity = "1"}
        >
          Create Free Account
        </Link>

        <Link
          to="/login"
          onClick={onClose}
          style={{
            display: "block",
            background: "transparent",
            border: "1px solid #3a3a3a",
            color: "#aaa",
            fontWeight: 600,
            fontSize: 16,
            padding: "11px",
            borderRadius: 7,
            textDecoration: "none",
            transition: "border-color .2s, color .2s",
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "#ff00e0"; e.currentTarget.style.color = "#ff00e0"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "#3a3a3a"; e.currentTarget.style.color = "#aaa"; }}
        >
          Already have an account? Sign In
        </Link>
      </div>
    </div>
  );
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/");
    setMenuOpen(false);
  };

  const handlePostEvent = () => {
    if (user) {
      navigate("/events/new");
    } else {
      setShowModal(true);
    }
    setMenuOpen(false);
  };

  const navLink = {
    color: "#e0e0e0",
    fontSize: 15,
    fontWeight: 500,
    textDecoration: "none",
    transition: "color .2s",
    whiteSpace: "nowrap",
  };

  return (
    <>
      <nav style={{ background: "#0a0a0a", borderBottom: "1px solid #1e1e1e", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 20px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 60 }}>

          {/* Logo */}
          <Link to="/" style={{ textDecoration: "none", flexShrink: 0 }}>
            <span style={{ color: "#fff", fontWeight: 800, fontSize: 20, letterSpacing: "0.02em", fontFamily: "Poppins, sans-serif" }}>
              THE HOMETOWN <span style={{ color: "#ff00e0" }}>POST</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div style={{ display: "flex", alignItems: "center", gap: 24 }} className="desktop-nav">
            <Link to="/" style={navLink}
              onMouseEnter={e => e.currentTarget.style.color = "#ff00e0"}
              onMouseLeave={e => e.currentTarget.style.color = "#e0e0e0"}>
              Event Listings
            </Link>
            <Link to="/categories" style={navLink}
              onMouseEnter={e => e.currentTarget.style.color = "#ff00e0"}
              onMouseLeave={e => e.currentTarget.style.color = "#e0e0e0"}>
              Categories
            </Link>
          <Link to="/events/venues" style={navLink}
              onMouseEnter={e => e.currentTarget.style.color = "#ff00e0"}
              onMouseLeave={e => e.currentTarget.style.color = "#e0e0e0"}>
              Events by Venue
            </Link>
            {user && (
              <Link to="/dashboard" style={navLink}
                onMouseEnter={e => e.currentTarget.style.color = "#ff00e0"}
                onMouseLeave={e => e.currentTarget.style.color = "#e0e0e0"}>
                My Favourite
              </Link>
            )}
            {user && (
              <Link to="/my-listings" style={navLink}
                onMouseEnter={e => e.currentTarget.style.color = "#ff00e0"}
                onMouseLeave={e => e.currentTarget.style.color = "#e0e0e0"}>
                My Listings
              </Link>
            )}

            {/* Divider */}
            <div style={{ width: 1, height: 18, background: "#333" }} />

            {/* + Post Event — always visible */}
            <button
              onClick={handlePostEvent}
              style={{
                background: "#ff00e0",
                color: "#fff",
                fontWeight: 700,
                fontSize: 14,
                padding: "6px 16px",
                borderRadius: 4,
                border: "none",
                cursor: "pointer",
                fontFamily: "Poppins, sans-serif",
                transition: "opacity .2s",
                whiteSpace: "nowrap",
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = ".85"}
              onMouseLeave={e => e.currentTarget.style.opacity = "1"}
            >
              + Post Event
            </button>

            {/* Auth */}
            {user ? (
              <>
                <span style={{ color: "#888", fontSize: 15 }}>{user.username}</span>
                {(user.role === "admin" || user.is_staff) && (
                  <Link to="/admin" style={{ background: "rgba(255,0,224,0.1)", border: "1px solid #ff00e0", color: "#ff00e0", fontWeight: 600, fontSize: 14, padding: "6px 16px", borderRadius: 4, textDecoration: "none", transition: "all .2s" }}
                    onMouseEnter={e => { e.currentTarget.style.background = "#ff00e0"; e.currentTarget.style.color = "#000"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,0,224,0.1)"; e.currentTarget.style.color = "#ff00e0"; }}>
                    Admin
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  style={{ background: "transparent", border: "1px solid #444", color: "#e0e0e0", fontWeight: 600, fontSize: 14, padding: "6px 16px", borderRadius: 4, cursor: "pointer", fontFamily: "Poppins, sans-serif", transition: "border-color .2s, color .2s" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "#ff00e0"; e.currentTarget.style.color = "#ff00e0"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "#444"; e.currentTarget.style.color = "#e0e0e0"; }}
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link to="/login"
                  style={{ background: "transparent", border: "1px solid #444", color: "#e0e0e0", fontWeight: 600, fontSize: 14, padding: "6px 16px", borderRadius: 4, textDecoration: "none", transition: "border-color .2s, color .2s" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "#ff00e0"; e.currentTarget.style.color = "#ff00e0"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "#444"; e.currentTarget.style.color = "#e0e0e0"; }}>
                  Sign In
                </Link>
                <Link to="/register"
                  style={{ background: "transparent", border: "1px solid #ff00e0", color: "#ff00e0", fontWeight: 700, fontSize: 14, padding: "6px 16px", borderRadius: 4, textDecoration: "none", transition: "all .2s" }}
                  onMouseEnter={e => { e.currentTarget.style.background = "#ff00e0"; e.currentTarget.style.color = "#fff"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#ff00e0"; }}>
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            style={{ background: "transparent", border: "none", color: "#aaa", cursor: "pointer", padding: 4, display: "none" }}
            className="mobile-burger"
          >
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              {menuOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div style={{ background: "#111", borderTop: "1px solid #2a2a2a", padding: "16px 20px" }}>
            {[
              { to: "/", label: "Event Listings" },
              { to: "/categories", label: "Categories" },
            { to: "/events/venues", label: "Events by Venue" },
              ...(user ? [{ to: "/dashboard", label: "My Favourite" }] : []),
              ...(user ? [{ to: "/my-listings", label: "My Listings" }] : []),
            ].map(({ to, label }) => (
              <Link key={to} to={to} onClick={() => setMenuOpen(false)}
                style={{ display: "block", color: "#e0e0e0", textDecoration: "none", fontSize: 16, padding: "8px 0", borderBottom: "1px solid #1e1e1e" }}>
                {label}
              </Link>
            ))}

            {/* + Post Event in mobile menu */}
            <button
              onClick={handlePostEvent}
              style={{
                display: "block", width: "100%", textAlign: "left",
                background: "none", border: "none",
                color: "#ff00e0", fontWeight: 700, fontSize: 16,
                padding: "10px 0", borderBottom: "1px solid #1e1e1e",
                cursor: "pointer", fontFamily: "Poppins, sans-serif",
              }}
            >
              + Post Event
            </button>

            <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
              {user ? (
                <button onClick={handleLogout} style={{ flex: 1, background: "transparent", border: "1px solid #444", color: "#e0e0e0", fontWeight: 600, fontSize: 15, padding: "8px", borderRadius: 4, cursor: "pointer", fontFamily: "Poppins, sans-serif" }}>
                  Sign Out
                </button>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMenuOpen(false)} style={{ flex: 1, textAlign: "center", background: "transparent", border: "1px solid #444", color: "#e0e0e0", fontWeight: 600, fontSize: 15, padding: "8px", borderRadius: 4, textDecoration: "none" }}>
                    Sign In
                  </Link>
                  <Link to="/register" onClick={() => setMenuOpen(false)} style={{ flex: 1, textAlign: "center", background: "#ff00e0", color: "#fff", fontWeight: 700, fontSize: 15, padding: "8px", borderRadius: 4, textDecoration: "none" }}>
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}

        {/* Responsive styles */}
        <style>{`
          @media (max-width: 768px) {
            .desktop-nav { display: none !important; }
            .mobile-burger { display: block !important; }
          }
        `}</style>
      </nav>

      {/* Auth-gate modal for guests */}
      {showModal && <SignupModal onClose={() => setShowModal(false)} />}
    </>
  );
}
