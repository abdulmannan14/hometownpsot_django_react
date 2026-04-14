import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import api from "../api/axios";
import LocationAutocomplete from "../components/LocationAutocomplete";

export default function EditEvent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const fromAdmin = searchParams.get("from") === "admin";
  const [categories, setCategories] = useState([]);
  const [venues, setVenues] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [mainImage, setMainImage] = useState(null); // File for replacing main image
  const [existingMainImage, setExistingMainImage] = useState(null); // current main image URL
  const [existingGallery, setExistingGallery] = useState([]); // [{id, image}]
  const [newImages, setNewImages] = useState([]); // File[] to add
  const [newPreviews, setNewPreviews] = useState([]); // blob URLs
  const [form, setForm] = useState({
    title: "", description: "", date: "", end_date: "",
    location: "", city: "", category: "", venue: "",
    organizer_name: "", organizer_email: "", organizer_phone: "", website: "",
    ticket_price: "", ticket_purchase_link: "",
    latitude: "", longitude: "",
  });

  useEffect(() => {
    Promise.all([api.get(`/events/${id}/`), api.get("/events/categories/"), api.get("/events/venues/")])
      .then(([{ data: event }, { data: cats }, { data: vens }]) => {
        setCategories(cats.results ?? cats);
        const venuesData = Array.isArray(vens) ? vens : (vens.results || []);
        setVenues(venuesData);
        setExistingMainImage(event.image || null);
        setExistingGallery(event.images || []);
        setForm({
          title: event.title || "", description: event.description || "",
          date: event.date ? event.date.slice(0, 16) : "",
          end_date: event.end_date ? event.end_date.slice(0, 16) : "",
          location: event.location || "", city: event.city || "",
          category: event.category_detail?.id || "",
          venue: event.venue_detail?.id || "",
          organizer_name: event.organizer_name || "",
          organizer_email: event.organizer_email || "",
          organizer_phone: event.organizer_phone || "",
          website: event.website || "",
          ticket_price: event.ticket_price != null ? event.ticket_price : "",
          ticket_purchase_link: event.ticket_purchase_link || "",
          latitude: event.latitude || "",
          longitude: event.longitude || "",
        });
      })
      .catch(() => navigate("/"))
      .finally(() => setFetching(false));
  }, [id, navigate]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleNewImages = (e) => {
    const files = Array.from(e.target.files);
    setNewImages((prev) => [...prev, ...files]);
    setNewPreviews((prev) => [...prev, ...files.map((f) => URL.createObjectURL(f))]);
    e.target.value = "";
  };

  const removeNewImage = (index) => {
    URL.revokeObjectURL(newPreviews[index]);
    setNewImages((prev) => prev.filter((_, i) => i !== index));
    setNewPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const deleteGalleryImage = async (imgId) => {
    try {
      await api.delete(`/events/images/${imgId}/`);
      setExistingGallery((prev) => prev.filter((img) => img.id !== imgId));
    } catch {
      alert("Failed to delete image");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);
    const formData = new FormData();
    Object.entries(form).forEach(([k, v]) => {
      if (v !== "" && v !== null && v !== undefined) formData.append(k, v);
    });
    if (mainImage) formData.append("image", mainImage);
    try {
      await api.patch(`/events/${id}/`, formData, { headers: { "Content-Type": "multipart/form-data" } });
      // Upload new gallery images
      if (newImages.length > 0) {
        const galleryForm = new FormData();
        newImages.forEach((img) => galleryForm.append("images", img));
        await api.post(`/events/${id}/images/`, galleryForm, { headers: { "Content-Type": "multipart/form-data" } });
      }
      navigate(fromAdmin ? "/admin/events" : `/events/${id}`);
    } catch (err) {
      setErrors(err.response?.data || {});
    } finally {
      setLoading(false);
    }
  };

  const fieldError = (field) =>
    errors[field] ? <p className="text-xs mt-1" style={{ color: "#ff00e0" }}>{errors[field][0] || errors[field]}</p> : null;

  const inputStyle = { background: "#252525", border: "1px solid #3a3a3a", color: "#fff" };
  const labelClass = "block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2";

  if (fetching) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]" style={{ background: "#191919" }}>
        <div className="w-10 h-10 rounded-full border-2 border-transparent animate-spin"
          style={{ borderTopColor: "#ff00e0", borderRightColor: "#ff00e0" }} />
      </div>
    );
  }

  return (
    <div style={{ background: "#191919", minHeight: "100vh" }}>
      <div style={{ background: "#0a0a0a", borderBottom: "1px solid #2a2a2a" }} className="px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold text-white">Edit Event</h1>
          <p className="text-gray-500 text-sm mt-1">Update your event details below.</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="rounded-2xl p-6 sm:p-8" style={{ background: "#1d191e", border: "1px solid #2a2a2a" }}>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className={labelClass}>Event Title *</label>
              <input type="text" name="title" value={form.title} onChange={handleChange} required className="input w-full" style={inputStyle} />
              {fieldError("title")}
            </div>
            <div>
              <label className={labelClass}>Description *</label>
              <textarea name="description" value={form.description} onChange={handleChange} required rows={5} className="input w-full resize-none" style={inputStyle} />
              {fieldError("description")}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className={labelClass}>Start Date &amp; Time *</label>
                <input type="datetime-local" name="date" value={form.date} onChange={handleChange} required className="input w-full" style={{ ...inputStyle, colorScheme: "dark" }} />
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
                  placeholder="Start typing a venue or address…"
                  required
                />
              </div>
              <div>
                <label className={labelClass}>City</label>
                <input type="text" name="city" value={form.city} onChange={handleChange} className="input w-full" style={inputStyle} />
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
            {/* Main image */}
            <div>
              <label className={labelClass}>Main Poster Image</label>
              {existingMainImage && !mainImage && (
                <div style={{ marginBottom: "10px" }}>
                  <img src={existingMainImage} alt="Current" style={{ width: "120px", height: "120px", objectFit: "cover", borderRadius: "6px", border: "2px solid #ff00e0" }} />
                  <p className="text-xs mt-1 text-gray-500">Current main image</p>
                </div>
              )}
              {mainImage && (
                <div style={{ marginBottom: "10px" }}>
                  <img src={URL.createObjectURL(mainImage)} alt="New main" style={{ width: "120px", height: "120px", objectFit: "cover", borderRadius: "6px", border: "2px solid #ff00e0" }} />
                  <p className="text-xs mt-1" style={{ color: "#ff00e0" }}>New: {mainImage.name}</p>
                </div>
              )}
              <div className="rounded-lg p-4" style={{ background: "#252525", border: "2px dashed #3a3a3a" }}>
                <input type="file" accept="image/*" onChange={(e) => setMainImage(e.target.files[0])}
                  className="block w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:cursor-pointer" />
                <p className="text-xs mt-2 text-gray-500">Upload to replace the main poster image</p>
              </div>
            </div>

            {/* Gallery images */}
            <div>
              <label className={labelClass}>Gallery Images</label>
              {existingGallery.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: "12px" }}>
                  {existingGallery.map((img) => (
                    <div key={img.id} style={{ position: "relative", width: "100px", height: "100px" }}>
                      <img src={img.image} alt="" style={{ width: "100px", height: "100px", objectFit: "cover", borderRadius: "6px", border: "2px solid #3a3a3a" }} />
                      <button
                        type="button"
                        onClick={() => deleteGalleryImage(img.id)}
                        style={{ position: "absolute", top: "4px", right: "4px", width: "20px", height: "20px", borderRadius: "50%", border: "none", background: "rgba(0,0,0,0.7)", color: "#fff", fontSize: "12px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1 }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {/* New images to add */}
              {newPreviews.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: "12px" }}>
                  {newPreviews.map((src, i) => (
                    <div key={i} style={{ position: "relative", width: "100px", height: "100px" }}>
                      <img src={src} alt="" style={{ width: "100px", height: "100px", objectFit: "cover", borderRadius: "6px", border: "2px solid #ff00e0", opacity: 0.8 }} />
                      <span style={{ position: "absolute", top: "4px", left: "4px", background: "#ff00e0", color: "#fff", fontSize: "9px", fontWeight: 700, padding: "2px 5px", borderRadius: "3px" }}>NEW</span>
                      <button
                        type="button"
                        onClick={() => removeNewImage(i)}
                        style={{ position: "absolute", top: "4px", right: "4px", width: "20px", height: "20px", borderRadius: "50%", border: "none", background: "rgba(0,0,0,0.7)", color: "#fff", fontSize: "12px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1 }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className="rounded-lg p-4" style={{ background: "#252525", border: "2px dashed #3a3a3a" }}>
                <input type="file" accept="image/*" multiple onChange={handleNewImages}
                  className="block w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:cursor-pointer" />
                <p className="text-xs mt-2 text-gray-500">Add more images to the gallery</p>
              </div>
            </div>
            <div style={{ borderTop: "1px solid #2a2a2a" }} className="pt-6">
              <h3 className="text-sm font-bold text-white mb-4">Tickets</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className={labelClass}>Ticket Price (USD)</label>
                  <div style={{ position: "relative" }}>
                    <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#888", fontSize: 14, pointerEvents: "none" }}>$</span>
                    <input
                      type="number" name="ticket_price" value={form.ticket_price} onChange={handleChange}
                      min="0" step="0.01" className="input w-full" style={{ ...inputStyle, paddingLeft: 26 }}
                      placeholder="0.00 — leave blank if free"
                    />
                  </div>
                  {fieldError("ticket_price")}
                </div>
                <div>
                  <label className={labelClass}>Ticket Purchase Link</label>
                  <input
                    type="url" name="ticket_purchase_link" value={form.ticket_purchase_link} onChange={handleChange}
                    className="input w-full" style={inputStyle} placeholder="https://eventbrite.com/..."
                  />
                  {fieldError("ticket_purchase_link")}
                </div>
              </div>
            </div>

            <div style={{ borderTop: "1px solid #2a2a2a" }} className="pt-6">
              <h3 className="text-sm font-bold text-white mb-4">Organizer Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className={labelClass}>Organizer Name</label>
                  <input type="text" name="organizer_name" value={form.organizer_name} onChange={handleChange} className="input w-full" style={inputStyle} />
                </div>
                <div>
                  <label className={labelClass}>Contact Email</label>
                  <input type="email" name="organizer_email" value={form.organizer_email} onChange={handleChange} className="input w-full" style={inputStyle} />
                </div>
                <div>
                  <label className={labelClass}>Phone</label>
                  <input type="tel" name="organizer_phone" value={form.organizer_phone} onChange={handleChange} className="input w-full" style={inputStyle} />
                </div>
                <div>
                  <label className={labelClass}>Website</label>
                  <input type="url" name="website" value={form.website} onChange={handleChange} className="input w-full" style={inputStyle} />
                </div>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={loading}
                className="px-8 py-3 rounded-md font-semibold text-sm transition-all"
                style={{ background: "#ff00e0", color: "#fff", opacity: loading ? 0.7 : 1 }}>
                {loading ? "Saving..." : "Save Changes"}
              </button>
              <button type="button" onClick={() => navigate(-1)} className="btn-secondary px-6 py-3 text-sm">Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
