import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import LocationAutocomplete from "../components/LocationAutocomplete";

export default function CreateEvent() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [venues, setVenues] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]); // array of File objects
  const [imagePreviews, setImagePreviews] = useState([]);
  const [form, setForm] = useState({
    title: "", description: "", date: "", end_date: "",
    location: "", city: "", category: "", venue: "",
    organizer_name: "", organizer_email: "", organizer_phone: "", website: "",
    latitude: "", longitude: "",
  });

  useEffect(() => {
    api.get("/events/categories/").then(({ data }) => setCategories(data.results ?? data)).catch(() => {});
    api.get("/events/venues/").then(({ data }) => {
      const venuesData = Array.isArray(data) ? data : (data.results || []);
      setVenues(venuesData);
    }).catch(() => {});
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages((prev) => [...prev, ...files]);
    const previews = files.map((f) => URL.createObjectURL(f));
    setImagePreviews((prev) => [...prev, ...previews]);
    e.target.value = "";
  };

  const removeImage = (index) => {
    URL.revokeObjectURL(imagePreviews[index]);
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);
    const formData = new FormData();
    Object.entries(form).forEach(([k, v]) => {
      if (v !== "" && v !== null && v !== undefined) formData.append(k, v);
    });
    // First image goes as the main `image` field; rest go to gallery
    if (images.length > 0) formData.append("image", images[0]);
    try {
      const { data } = await api.post("/events/", formData, { headers: { "Content-Type": "multipart/form-data" } });
      // Upload remaining images to gallery
      if (images.length > 1) {
        const galleryForm = new FormData();
        images.slice(1).forEach((img) => galleryForm.append("images", img));
        await api.post(`/events/${data.id}/images/`, galleryForm, { headers: { "Content-Type": "multipart/form-data" } });
      }
      navigate(`/events/${data.id}`);
    } catch (err) {
      const errData = err.response?.data || {};
      console.error("Event creation error:", errData);
      setErrors(errData);
    } finally {
      setLoading(false);
    }
  };

  const fieldError = (field) =>
    errors[field] ? <p className="text-xs mt-1" style={{ color: "#ff00e0" }}>{errors[field][0] || errors[field]}</p> : null;

  const inputStyle = { background: "#252525", border: "1px solid #3a3a3a", color: "#fff" };
  const labelClass = "block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2";

  return (
    <div style={{ background: "#191919", minHeight: "100vh" }}>
      <div style={{ background: "#0a0a0a", borderBottom: "1px solid #2a2a2a" }} className="px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "#ff00e0" }}>Organizers</p>
          <h1 className="text-2xl font-bold text-white">Post a New Event</h1>
          <p className="text-gray-500 text-sm mt-1">Events are reviewed before being published publicly.</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="rounded-2xl p-6 sm:p-8" style={{ background: "#1d191e", border: "1px solid #2a2a2a" }}>
          <form onSubmit={handleSubmit} className="space-y-6">

            <div>
              <label className={labelClass}>Event Title *</label>
              <input type="text" name="title" value={form.title} onChange={handleChange} required className="input w-full" style={inputStyle} placeholder="e.g. Summer Jazz Festival" />
              {fieldError("title")}
            </div>

            <div>
              <label className={labelClass}>Description *</label>
              <textarea name="description" value={form.description} onChange={handleChange} required rows={5} className="input w-full resize-none" style={inputStyle} placeholder="Tell people what to expect..." />
              {fieldError("description")}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className={labelClass}>Start Date &amp; Time *</label>
                <input type="datetime-local" name="date" value={form.date} onChange={handleChange} required className="input w-full" style={{ ...inputStyle, colorScheme: "dark" }} />
                {fieldError("date")}
              </div>
              <div>
                <label className={labelClass}>End Date &amp; Time</label>
                <input type="datetime-local" name="end_date" value={form.end_date} onChange={handleChange} className="input w-full" style={{ ...inputStyle, colorScheme: "dark" }} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className={labelClass}>Venue / Location *</label>
                <LocationAutocomplete
                  value={form.location}
                  onChange={(e) => setForm(f => ({ ...f, location: e.target.value }))}
                  onPlaceSelect={({ location, city, latitude, longitude }) =>
                    setForm(f => ({ ...f, location, city, latitude, longitude }))
                  }
                  style={inputStyle}
                  placeholder="e.g. Central Park Amphitheater"
                  required
                />
                {fieldError("location")}
              </div>
              <div>
                <label className={labelClass}>City</label>
                <input type="text" name="city" value={form.city} onChange={handleChange} className="input w-full" style={inputStyle} placeholder="e.g. Reno, NV" />
                <p className="text-xs mt-1 text-gray-500">Auto-filled when you pick a suggestion</p>
              </div>
            </div>

            <div>
              <label className={labelClass}>Category</label>
              <select name="category" value={form.category} onChange={handleChange} className="input w-full" style={inputStyle}>
                <option value="">Select a category</option>
                {categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
              </select>
            </div>

            <div>
              <label className={labelClass}>Venue</label>
              <select name="venue" value={form.venue} onChange={handleChange} className="input w-full" style={inputStyle}>
                <option value="">Select a venue (optional)</option>
                {venues.map((v) => <option key={v.id} value={v.id}>{v.name} - {v.city}</option>)}
              </select>
              <p className="text-xs mt-1 text-gray-500">Select an existing venue or leave blank to use custom location</p>
            </div>

            <div>
              <label className={labelClass}>Event Images (up to 10)</label>
              <div className="rounded-lg p-4" style={{ background: "#252525", border: "2px dashed #3a3a3a" }}>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="block w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:cursor-pointer"
                />
                <p className="text-xs mt-2 text-gray-500">First image will be the main poster. You can add multiple.</p>
              </div>
              {imagePreviews.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "12px" }}>
                  {imagePreviews.map((src, i) => (
                    <div key={i} style={{ position: "relative", width: "100px", height: "100px" }}>
                      <img src={src} alt="" style={{ width: "100px", height: "100px", objectFit: "cover", borderRadius: "6px", border: i === 0 ? "2px solid #ff00e0" : "2px solid #3a3a3a" }} />
                      {i === 0 && (
                        <span style={{ position: "absolute", top: "4px", left: "4px", background: "#ff00e0", color: "#fff", fontSize: "9px", fontWeight: 700, padding: "2px 5px", borderRadius: "3px" }}>MAIN</span>
                      )}
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        style={{ position: "absolute", top: "4px", right: "4px", width: "20px", height: "20px", borderRadius: "50%", border: "none", background: "rgba(0,0,0,0.7)", color: "#fff", fontSize: "12px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1 }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ borderTop: "1px solid #2a2a2a" }} className="pt-6">
              <h3 className="text-sm font-bold text-white mb-4">Organizer Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className={labelClass}>Organizer Name</label>
                  <input type="text" name="organizer_name" value={form.organizer_name} onChange={handleChange} className="input w-full" style={inputStyle} placeholder="Your name or org" />
                </div>
                <div>
                  <label className={labelClass}>Contact Email</label>
                  <input type="email" name="organizer_email" value={form.organizer_email} onChange={handleChange} className="input w-full" style={inputStyle} placeholder="contact@example.com" />
                </div>
                <div>
                  <label className={labelClass}>Phone</label>
                  <input type="tel" name="organizer_phone" value={form.organizer_phone} onChange={handleChange} className="input w-full" style={inputStyle} placeholder="+1 555 0000" />
                </div>
                <div>
                  <label className={labelClass}>Website</label>
                  <input type="url" name="website" value={form.website} onChange={handleChange} className="input w-full" style={inputStyle} placeholder="https://..." />
                </div>
              </div>
            </div>

            {errors.non_field_errors && (
              <p className="text-sm" style={{ color: "#ff4444" }}>{errors.non_field_errors}</p>
            )}
            {errors.detail && (
              <p className="text-sm" style={{ color: "#ff4444" }}>{errors.detail}</p>
            )}

            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={loading}
                className="px-8 py-3 rounded-md font-semibold text-sm transition-all"
                style={{ background: "#ff00e0", color: "#fff", opacity: loading ? 0.7 : 1 }}>
                {loading ? "Submitting..." : "Submit Event"}
              </button>
              <button type="button" onClick={() => navigate(-1)} className="btn-secondary px-6 py-3 text-sm">
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
