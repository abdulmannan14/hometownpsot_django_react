import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(form.username, form.password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.detail || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4" style={{ background: "#191919" }}>
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-white font-bold text-2xl tracking-wide mb-2">
            THE HOMETOWN <span style={{ color: "#ff00e0" }}>POST</span>
          </div>
          <h1 className="text-xl font-semibold text-white">Welcome Back</h1>
          <p className="text-gray-500 text-sm mt-1">Sign in to manage your events</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl p-8" style={{ background: "#1d191e", border: "1px solid #2a2a2a" }}>
          {error && (
            <div className="mb-5 p-3 rounded-lg text-sm font-medium" style={{ background: "rgba(255,0,224,0.08)", border: "1px solid rgba(255,0,224,0.3)", color: "#ff00e0" }}>
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Username</label>
              <input
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
                required
                placeholder="your username"
                className="input w-full"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Password</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                placeholder="••••••••"
                className="input w-full"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-md font-semibold text-sm transition-all duration-200"
              style={{ background: "#ff00e0", color: "#fff", opacity: loading ? 0.7 : 1 }}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-5">
          Don't have an account?{" "}
          <Link to="/register" className="font-semibold transition-colors" style={{ color: "#ff00e0" }}>
            Sign up free
          </Link>
        </p>
      </div>
    </div>
  );
}
