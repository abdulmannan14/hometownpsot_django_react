import React, { useState, useEffect } from "react";
import api from "../api/axios";

const RADIUS_OPTIONS = [1, 3, 5, 10, 20, 30, 50, 60, 100];

export default function AdminSettings() {
  const [radius, setRadius] = useState(10);
  const [customRadius, setCustomRadius] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/admin/settings/")
      .then(({ data }) => {
        setRadius(data.default_radius_miles);
        if (!RADIUS_OPTIONS.includes(data.default_radius_miles)) {
          setCustomRadius(String(data.default_radius_miles));
        }
      })
      .catch(() => setError("Failed to load settings."))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    const value = customRadius ? parseInt(customRadius) : radius;
    if (!value || value <= 0) {
      setError("Please enter a valid radius greater than 0.");
      return;
    }
    setSaving(true);
    setError("");
    setSuccess(false);
    try {
      const { data } = await api.patch("/admin/settings/", { default_radius_miles: value });
      setRadius(data.default_radius_miles);
      setCustomRadius("");
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setError("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const activeValue = customRadius ? parseInt(customRadius) || null : radius;

  return (
    <div style={{ background: "#191919", minHeight: "100vh", padding: "32px" }}>
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div style={{ marginBottom: "32px" }}>
          <h1 className="text-3xl font-bold text-white">Site Settings</h1>
          <p className="text-gray-500 text-sm mt-1">Configure global settings for THE HOMETOWN POST platform.</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-10 h-10 rounded-full border-2 border-transparent animate-spin"
              style={{ borderTopColor: "#ff00e0", borderRightColor: "#ff00e0" }} />
          </div>
        ) : (
          <div className="space-y-6">

            {/* Radius Card */}
            <div className="rounded-xl p-6" style={{ background: "#1d191e", border: "1px solid #2a2a2a" }}>
              <div style={{ marginBottom: "20px" }}>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  📍 Upcoming Events — Default Radius
                </h2>
                <p className="text-gray-500 text-sm mt-1">
                  This radius is used on the homepage to show events near a user's GPS location.
                  Users will see all approved upcoming events within this many miles of them.
                </p>
              </div>

              {/* Current value display */}
              <div style={{ background: "#252525", borderRadius: "8px", padding: "16px", marginBottom: "24px", display: "flex", alignItems: "center", gap: "12px" }}>
                <span style={{ fontSize: "32px" }}>🗺️</span>
                <div>
                  <p style={{ color: "#999", fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Current Radius</p>
                  <p style={{ color: "#ff00e0", fontSize: "28px", fontWeight: 800, lineHeight: 1 }}>
                    {radius} <span style={{ fontSize: "16px", color: "#888", fontWeight: 400 }}>miles</span>
                  </p>
                </div>
              </div>

              {/* Quick-pick buttons */}
              <p style={{ color: "#999", fontSize: "12px", fontWeight: 600, marginBottom: "10px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Quick Select
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "20px" }}>
                {RADIUS_OPTIONS.map((r) => (
                  <button
                    key={r}
                    onClick={() => { setCustomRadius(""); setRadius(r); }}
                    style={{
                      padding: "8px 18px",
                      borderRadius: "6px",
                      border: activeValue === r ? "2px solid #ff00e0" : "1px solid #3a3a3a",
                      background: activeValue === r ? "rgba(255,0,224,0.15)" : "#252525",
                      color: activeValue === r ? "#ff00e0" : "#aaa",
                      fontSize: "13px",
                      fontWeight: 700,
                      cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                  >
                    {r} mi
                  </button>
                ))}
              </div>

              {/* Custom input */}
              <p style={{ color: "#999", fontSize: "12px", fontWeight: 600, marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Or Enter Custom Miles
              </p>
              <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "24px" }}>
                <input
                  type="number"
                  min="1"
                  max="500"
                  value={customRadius}
                  onChange={(e) => setCustomRadius(e.target.value)}
                  placeholder="e.g. 25"
                  style={{
                    width: "120px",
                    padding: "10px 12px",
                    borderRadius: "6px",
                    border: customRadius ? "1px solid #ff00e0" : "1px solid #3a3a3a",
                    background: "#252525",
                    color: "#fff",
                    fontSize: "14px",
                  }}
                />
                <span style={{ color: "#555", fontSize: "13px" }}>miles</span>
              </div>

              {/* Error / success */}
              {error && (
                <p style={{ color: "#ef4444", fontSize: "13px", marginBottom: "16px" }}>{error}</p>
              )}
              {success && (
                <div style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: "6px", padding: "10px 14px", marginBottom: "16px" }}>
                  <p style={{ color: "#22c55e", fontSize: "13px", fontWeight: 600 }}>✓ Radius updated successfully to {radius} miles.</p>
                </div>
              )}

              {/* Save button */}
              <button
                onClick={handleSave}
                disabled={saving}
                style={{
                  padding: "10px 28px",
                  borderRadius: "6px",
                  border: "none",
                  background: "#ff00e0",
                  color: "#fff",
                  fontSize: "14px",
                  fontWeight: 700,
                  cursor: saving ? "not-allowed" : "pointer",
                  opacity: saving ? 0.6 : 1,
                  transition: "opacity 0.2s",
                }}
              >
                {saving ? "Saving..." : "Save Settings"}
              </button>
            </div>

            {/* Info card */}
            <div className="rounded-xl p-5" style={{ background: "#1d191e", border: "1px solid #2a2a2a" }}>
              <h3 className="text-sm font-bold text-white mb-3">ℹ️ How It Works</h3>
              <ul style={{ color: "#666", fontSize: "13px", lineHeight: "1.8", paddingLeft: "16px" }}>
                <li>When a user visits the homepage, their browser requests their GPS location.</li>
                <li>If they allow it, the site fetches approved events within the configured radius.</li>
                <li>These events appear in the <strong style={{ color: "#aaa" }}>"Upcoming Events"</strong> section above the main listings.</li>
                <li>Only events with saved latitude/longitude coordinates are shown in this section.</li>
                <li>If a user denies location access, the section is hidden gracefully.</li>
              </ul>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
