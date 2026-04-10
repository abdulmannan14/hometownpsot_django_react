import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useFavorites } from "../context/FavoritesContext";

const STORAGE_KEY = "htp_register_popup_shown";

export default function RegisterPopup() {
  const { user } = useAuth();
  const { showSignupPrompt, setShowSignupPrompt } = useFavorites();
  const navigate = useNavigate();
  const location = useLocation();
  const [timerVisible, setTimerVisible] = useState(false);

  // 5-second timer popup (once ever, for guests)
  useEffect(() => {
    const isAuthPage = ["/register", "/login", "/admin"].some((p) =>
      location.pathname.startsWith(p)
    );
    if (user || isAuthPage || localStorage.getItem(STORAGE_KEY)) return;

    const timer = setTimeout(() => setTimerVisible(true), 5000);
    return () => clearTimeout(timer);
  }, [user, location.pathname]);

  const visible = timerVisible || showSignupPrompt;

  const handleClose = () => {
    localStorage.setItem(STORAGE_KEY, "1");
    setTimerVisible(false);
    setShowSignupPrompt(false);
  };

  const handleRegister = () => {
    localStorage.setItem(STORAGE_KEY, "1");
    setTimerVisible(false);
    setShowSignupPrompt(false);
    navigate("/register");
  };

  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "rgba(0,0,0,0.75)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "16px",
      }}
      onClick={handleClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#1d191e",
          border: "1px solid #2a2a2a",
          borderRadius: "16px",
          padding: "40px 32px",
          maxWidth: "420px",
          width: "100%",
          position: "relative",
          textAlign: "center",
        }}
      >
        <button
          onClick={handleClose}
          style={{
            position: "absolute", top: "14px", right: "16px",
            background: "transparent", border: "none",
            color: "#666", fontSize: "22px", cursor: "pointer", lineHeight: 1,
          }}
        >×</button>

        <div style={{
          width: "56px", height: "56px", borderRadius: "50%",
          background: "rgba(255,0,224,0.12)",
          border: "1px solid rgba(255,0,224,0.3)",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 20px", fontSize: "26px",
        }}>
          {showSignupPrompt ? "❤️" : "💥"}
        </div>

        <h2 style={{ color: "#fff", fontWeight: 700, fontSize: "20px", marginBottom: "8px" }}>
          {showSignupPrompt
            ? "Save your favorites"
            : <>Join Hometown<span style={{ color: "#ff00e0" }}>Post</span></>}
        </h2>
        <p style={{ color: "#888", fontSize: "14px", lineHeight: 1.6, marginBottom: "28px" }}>
          {showSignupPrompt
            ? "Create a free account to save events and build your personal favorites list."
            : "Discover local events, save your favorites, and promote your own events to the Reno community."}
        </p>

        <button
          onClick={handleRegister}
          style={{
            width: "100%", padding: "12px", borderRadius: "8px",
            border: "none", background: "#ff00e0",
            color: "#fff", fontWeight: 700, fontSize: "14px",
            cursor: "pointer", marginBottom: "12px",
          }}
        >
          Sign Up — It's Free
        </button>

        <button
          onClick={() => { handleClose(); navigate("/login"); }}
          style={{
            width: "100%", padding: "11px", borderRadius: "8px",
            border: "1px solid #333", background: "transparent",
            color: "#aaa", fontWeight: 600, fontSize: "13px", cursor: "pointer",
            marginBottom: "8px",
          }}
        >
          Already have an account? Sign In
        </button>

        <button
          onClick={handleClose}
          style={{
            background: "transparent", border: "none",
            color: "#555", fontSize: "12px", cursor: "pointer",
          }}
        >
          Maybe later
        </button>
      </div>
    </div>
  );
}
