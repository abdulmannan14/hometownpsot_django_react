import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", email: "", password: "", password2: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState("detecting"); // detecting | found | denied

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationStatus("denied");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        let city = "";
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          const data = await res.json();
          city =
            data.address?.city ||
            data.address?.town ||
            data.address?.village ||
            data.address?.county ||
            "";
        } catch {
          // lat/lng still saved even if reverse geocode fails
        }
        setLocation({ latitude, longitude, city });
        setLocationStatus("found");
      },
      () => setLocationStatus("denied"),
      { timeout: 8000 }
    );
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);
    try {
      const locationData = location
        ? { latitude: location.latitude, longitude: location.longitude, city: location.city }
        : {};
      await register(form.username, form.email, form.password, form.password2, locationData);
      navigate("/");
    } catch (err) {
      setErrors(err.response?.data || { non_field_errors: ["Registration failed."] });
    } finally {
      setLoading(false);
    }
  };

  const fieldError = (field) =>
    errors[field] ? <p className="text-xs mt-1" style={{ color: "#ff00e0" }}>{errors[field][0]}</p> : null;

  const inputStyle = { background: "#252525", border: "1px solid #3a3a3a", color: "#fff" };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-10" style={{ background: "#191919" }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-white font-bold text-2xl tracking-wide mb-2">
            THE HOMETOWN <span style={{ color: "#ff00e0" }}>POST</span>
          </div>
          <h1 className="text-xl font-semibold text-white">Create an Account</h1>
          <p className="text-gray-500 text-sm mt-1">Start posting events in your community</p>
        </div>

        <div className="rounded-2xl p-8" style={{ background: "#1d191e", border: "1px solid #2a2a2a" }}>
          {errors.non_field_errors && (
            <div className="mb-5 p-3 rounded-lg text-sm font-medium" style={{ background: "rgba(255,0,224,0.08)", border: "1px solid rgba(255,0,224,0.3)", color: "#ff00e0" }}>
              {errors.non_field_errors[0]}
            </div>
          )}

          {/* Location status pill */}
          <div className="mb-5 flex items-center gap-2 px-3 py-2 rounded-lg text-xs" style={{ background: "#252525" }}>
            {locationStatus === "detecting" && (
              <>
                <div className="w-3 h-3 rounded-full border-2 border-transparent animate-spin flex-shrink-0"
                  style={{ borderTopColor: "#ff00e0", borderRightColor: "#ff00e0" }} />
                <span className="text-gray-400">Detecting your location…</span>
              </>
            )}
            {locationStatus === "found" && (
              <>
                <span style={{ color: "#ff00e0" }}>📍</span>
                <span className="text-gray-300">
                  {location?.city ? `Location: ${location.city}` : "Location detected"}
                </span>
              </>
            )}
            {locationStatus === "denied" && (
              <>
                <span>⚠️</span>
                <span className="text-gray-500">Location unavailable — you can still register</span>
              </>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Username</label>
              <input type="text" name="username" value={form.username} onChange={handleChange} required placeholder="johndoe" className="input w-full" style={inputStyle} />
              {fieldError("username")}
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Email</label>
              <input type="email" name="email" value={form.email} onChange={handleChange} required placeholder="you@example.com" className="input w-full" style={inputStyle} />
              {fieldError("email")}
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Password</label>
              <input type="password" name="password" value={form.password} onChange={handleChange} required placeholder="••••••••" className="input w-full" style={inputStyle} />
              {fieldError("password")}
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Confirm Password</label>
              <input type="password" name="password2" value={form.password2} onChange={handleChange} required placeholder="••••••••" className="input w-full" style={inputStyle} />
              {fieldError("password2")}
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-md font-semibold text-sm transition-all duration-200 mt-2"
              style={{ background: "#ff00e0", color: "#fff", opacity: loading ? 0.7 : 1 }}
            >
              {loading ? "Creating account…" : "Create Account"}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-5">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold" style={{ color: "#ff00e0" }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
