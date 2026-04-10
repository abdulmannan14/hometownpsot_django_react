import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AdminLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      // For admin, we'll use the email field but pass username
      await login(form.username, form.password);
      navigate("/admin");
    } catch (err) {
      setError(err.response?.data?.detail || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "#0a0a0a" }}>
      <div className="w-full max-w-md">
        {/* Admin Header */}
        <div className="text-center mb-10">
          <div style={{
            fontSize: "48px",
            marginBottom: "12px",
            display: "inline-block",
            padding: "12px 16px",
            borderRadius: "8px",
            background: "rgba(255,0,224,0.1)",
          }}>
            ⚙️
          </div>
          <h1 className="text-2xl font-extrabold text-white">Admin Portal</h1>
          <p className="text-gray-500 text-sm mt-2">Restricted access only</p>
        </div>

        {/* Login Card */}
        <div className="rounded-2xl p-8" style={{ background: "#1d191e", border: "2px solid #2a2a2a" }}>
          {error && (
            <div className="mb-5 p-3 rounded-lg text-sm font-medium" style={{ background: "rgba(255,0,224,0.08)", border: "1px solid rgba(255,0,224,0.3)", color: "#ff00e0" }}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Username
              </label>
              <input
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
                required
                placeholder="maan"
                className="input w-full"
                style={{
                  padding: "10px 12px",
                  borderRadius: "6px",
                  border: "1px solid #2a2a2a",
                  background: "#252525",
                  color: "#fff",
                  fontSize: "14px",
                }}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                placeholder="••••••••"
                className="input w-full"
                style={{
                  padding: "10px 12px",
                  borderRadius: "6px",
                  border: "1px solid #2a2a2a",
                  background: "#252525",
                  color: "#fff",
                  fontSize: "14px",
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-md font-semibold text-sm transition-all duration-200"
              style={{
                background: "#ff00e0",
                color: "#fff",
                opacity: loading ? 0.7 : 1,
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "Authenticating..." : "Sign In"}
            </button>
          </form>

          {/* Security Notice */}
          <div style={{
            marginTop: "16px",
            padding: "12px",
            borderRadius: "6px",
            background: "rgba(100,100,255,0.05)",
            border: "1px solid rgba(100,100,255,0.2)",
          }}>
            <p style={{ fontSize: "11px", color: "#999", lineHeight: "1.4" }}>
              🔒 This is a restricted admin area. Unauthorized access is prohibited.
            </p>
          </div>
        </div>

        {/* Back to Site */}
        <div className="text-center mt-6">
          <Link
            to="/"
            style={{
              color: "#666",
              fontSize: "13px",
              textDecoration: "none",
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = "#ff00e0"}
            onMouseLeave={(e) => e.currentTarget.style.color = "#666"}
          >
            ← Back to Site
          </Link>
        </div>
      </div>
    </div>
  );
}
