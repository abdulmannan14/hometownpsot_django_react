import React, { useState, useEffect } from "react";
import axios from "../api/axios";
import LocationAutocomplete from "../components/LocationAutocomplete";

const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: "6px",
  border: "1px solid #2a2a2a",
  background: "#252525",
  color: "#fff",
  fontSize: "14px",
};

const labelStyle = {
  display: "block",
  color: "#999",
  fontSize: "12px",
  fontWeight: 600,
  marginBottom: "6px",
};

export default function AdminVenues() {
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editingVenue, setEditingVenue] = useState(null);
  const [actioningId, setActioningId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Image state
  const [mainImage, setMainImage] = useState(null);
  const [existingMainImage, setExistingMainImage] = useState(null);
  const [existingGallery, setExistingGallery] = useState([]);
  const [newGalleryImages, setNewGalleryImages] = useState([]);
  const [newGalleryPreviews, setNewGalleryPreviews] = useState([]);

  const emptyForm = {
    name: "", address: "", city: "", latitude: "", longitude: "",
    website: "", phone: "", description: "", capacity: "",
    facebook: "", instagram: "", twitter: "", youtube: "", tiktok: "", linkedin: "",
    weekday_open: "", weekday_close: "", weekday_is_24h: false,
    saturday_open: "", saturday_close: "", saturday_is_24h: false,
    sunday_open: "", sunday_close: "", sunday_is_24h: false,
  };
  const [formData, setFormData] = useState(emptyForm);

  const itemsPerPage = 10;

  useEffect(() => {
    fetchVenues();
  }, []);

  const fetchVenues = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/events/venues/");
      const venuesData = Array.isArray(response.data)
        ? response.data
        : response.data.results || [];
      setVenues(venuesData);
    } catch (error) {
      console.error("Error fetching venues:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleNewGalleryImages = (e) => {
    const files = Array.from(e.target.files);
    setNewGalleryImages((prev) => [...prev, ...files]);
    setNewGalleryPreviews((prev) => [...prev, ...files.map((f) => URL.createObjectURL(f))]);
    e.target.value = "";
  };

  const removeNewGalleryImage = (index) => {
    URL.revokeObjectURL(newGalleryPreviews[index]);
    setNewGalleryImages((prev) => prev.filter((_, i) => i !== index));
    setNewGalleryPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const deleteGalleryImage = async (imgId) => {
    try {
      await axios.delete(`/events/venue-images/${imgId}/`);
      setExistingGallery((prev) => prev.filter((img) => img.id !== imgId));
    } catch {
      alert("Failed to delete image");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("name", formData.name);
      fd.append("address", formData.address);
      fd.append("city", formData.city);
      if (formData.website)   fd.append("website",   formData.website);
      if (formData.phone)     fd.append("phone",     formData.phone);
      ["facebook","instagram","twitter","youtube","tiktok","linkedin"].forEach((k) => {
        fd.append(k, formData[k] || "");
      });
      if (formData.description) fd.append("description", formData.description);
      if (formData.capacity) fd.append("capacity", parseInt(formData.capacity));
      if (formData.latitude) fd.append("latitude", parseFloat(formData.latitude));
      if (formData.longitude) fd.append("longitude", parseFloat(formData.longitude));
      if (mainImage) fd.append("image", mainImage);
      // Hours
      ["weekday_open","weekday_close","saturday_open","saturday_close","sunday_open","sunday_close"].forEach((k) => {
        fd.append(k, formData[k] || "");
      });
      fd.append("weekday_is_24h",  formData.weekday_is_24h  ? "true" : "false");
      fd.append("saturday_is_24h", formData.saturday_is_24h ? "true" : "false");
      fd.append("sunday_is_24h",   formData.sunday_is_24h   ? "true" : "false");

      let venueId;
      if (editingVenue) {
        const res = await axios.patch(`/events/venues/${editingVenue.id}/`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        venueId = res.data.id;
      } else {
        const res = await axios.post("/events/venues/", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        venueId = res.data.id;
      }

      // Upload new gallery images
      if (newGalleryImages.length > 0) {
        const galleryFd = new FormData();
        newGalleryImages.forEach((img) => galleryFd.append("images", img));
        await axios.post(`/events/venues/${venueId}/images/`, galleryFd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      handleCancel();
      fetchVenues();
    } catch (error) {
      console.error("Error saving venue:", error);
      alert("Failed to save venue: " + (error.response?.data?.detail || JSON.stringify(error.response?.data) || error.message));
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (venue) => {
    setEditingVenue(venue);
    setFormData({
      name: venue.name,
      address: venue.address,
      city: venue.city,
      latitude: venue.latitude || "",
      longitude: venue.longitude || "",
      website: venue.website || "",
      phone: venue.phone || "",
      description: venue.description || "",
      capacity: venue.capacity || "",
      facebook:  venue.facebook  || "",
      instagram: venue.instagram || "",
      twitter:   venue.twitter   || "",
      youtube:   venue.youtube   || "",
      tiktok:    venue.tiktok    || "",
      linkedin:  venue.linkedin  || "",
      weekday_open: venue.weekday_open || "",
      weekday_close: venue.weekday_close || "",
      weekday_is_24h: venue.weekday_is_24h || false,
      saturday_open: venue.saturday_open || "",
      saturday_close: venue.saturday_close || "",
      saturday_is_24h: venue.saturday_is_24h || false,
      sunday_open: venue.sunday_open || "",
      sunday_close: venue.sunday_close || "",
      sunday_is_24h: venue.sunday_is_24h || false,
    });
    setExistingMainImage(venue.image || null);
    setExistingGallery(venue.images || []);
    setMainImage(null);
    setNewGalleryImages([]);
    setNewGalleryPreviews([]);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this venue?")) return;
    setActioningId(id);
    try {
      await axios.delete(`/events/venues/${id}/`);
      fetchVenues();
    } catch (error) {
      alert("Failed to delete venue");
    } finally {
      setActioningId(null);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingVenue(null);
    setFormData(emptyForm);
    setMainImage(null);
    setExistingMainImage(null);
    setExistingGallery([]);
    setNewGalleryImages([]);
    setNewGalleryPreviews([]);
  };

  const totalPages = Math.ceil(venues.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedVenues = venues.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div style={{ background: "#191919", minHeight: "100vh", padding: "32px" }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div style={{ marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 className="text-3xl font-bold text-white">Venues</h1>
            <p className="text-gray-500 text-sm mt-1">Manage event venues</p>
          </div>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              style={{ padding: "8px 16px", borderRadius: "6px", border: "none", background: "#ff00e0", color: "#fff", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}
            >
              + New Venue
            </button>
          )}
        </div>

        {/* Inline Form */}
        {showForm && (
          <div style={{ marginBottom: "24px", borderRadius: "8px", padding: "20px", background: "#1d191e", border: "1px solid #2a2a2a" }}>
            <h3 className="text-lg font-semibold text-white mb-4">
              {editingVenue ? "Edit Venue" : "Create New Venue"}
            </h3>
            <form onSubmit={handleSubmit}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                {/* Name */}
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={labelStyle}>Venue Name *</label>
                  <input type="text" name="name" value={formData.name} onChange={handleInputChange} required placeholder="e.g., Reno Events Center" style={inputStyle} />
                </div>

                {/* Address */}
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={labelStyle}>Address *</label>
                  <LocationAutocomplete
                    value={formData.address}
                    onChange={(e) => setFormData(f => ({ ...f, address: e.target.value }))}
                    onPlaceSelect={({ formatted_address, city, latitude, longitude }) =>
                      setFormData(f => ({ ...f, address: formatted_address, city, latitude, longitude }))
                    }
                    style={inputStyle}
                    placeholder="Start typing an address…"
                    required
                    className=""
                  />
                  <p style={{ color: "#555", fontSize: "11px", marginTop: "5px" }}>
                    Pick a suggestion to auto-fill city, latitude &amp; longitude
                  </p>
                </div>

                {/* City */}
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={labelStyle}>City *</label>
                  <input type="text" name="city" value={formData.city} onChange={handleInputChange} required placeholder="e.g., Reno" style={{ ...inputStyle, borderColor: formData.city ? "#ff00e0" : "#2a2a2a" }} />
                </div>

                {/* Latitude */}
                <div>
                  <label style={{ ...labelStyle, display: "flex", alignItems: "center", gap: "6px" }}>
                    Latitude {formData.latitude && <span style={{ color: "#ff00e0", fontSize: "10px", fontWeight: 700 }}>● AUTO</span>}
                  </label>
                  <input type="number" name="latitude" value={formData.latitude} onChange={handleInputChange} step="any" placeholder="Auto-filled from address" style={{ ...inputStyle, borderColor: formData.latitude ? "#ff00e0" : "#2a2a2a", color: formData.latitude ? "#fff" : "#555" }} />
                </div>

                {/* Longitude */}
                <div>
                  <label style={{ ...labelStyle, display: "flex", alignItems: "center", gap: "6px" }}>
                    Longitude {formData.longitude && <span style={{ color: "#ff00e0", fontSize: "10px", fontWeight: 700 }}>● AUTO</span>}
                  </label>
                  <input type="number" name="longitude" value={formData.longitude} onChange={handleInputChange} step="any" placeholder="Auto-filled from address" style={{ ...inputStyle, borderColor: formData.longitude ? "#ff00e0" : "#2a2a2a", color: formData.longitude ? "#fff" : "#555" }} />
                </div>

                {/* Phone */}
                <div>
                  <label style={labelStyle}>Phone</label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="e.g., (775) 123-4567" style={inputStyle} />
                </div>

                {/* Capacity */}
                <div>
                  <label style={labelStyle}>Capacity</label>
                  <input type="number" name="capacity" value={formData.capacity} onChange={handleInputChange} placeholder="e.g., 1000" style={inputStyle} />
                </div>

                {/* Website */}
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={labelStyle}>Website</label>
                  <input type="url" name="website" value={formData.website} onChange={handleInputChange} placeholder="e.g., https://example.com" style={inputStyle} />
                </div>

                {/* Description */}
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={labelStyle}>Description</label>
                  <textarea name="description" value={formData.description} onChange={handleInputChange} rows={3} placeholder="Describe the venue..." style={{ ...inputStyle, resize: "vertical" }} />
                </div>

                {/* Social Media */}
                <div style={{ gridColumn: "1 / -1" }}>
                  <div style={{ borderTop: "1px solid #2a2a2a", paddingTop: "14px", marginBottom: "14px" }}>
                    <p style={{ color: "#fff", fontSize: "13px", fontWeight: 600, marginBottom: "4px" }}>Social Media</p>
                    <p style={{ color: "#555", fontSize: "11px" }}>Paste full profile URLs (e.g. https://instagram.com/venuename)</p>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    {[
                      { key: "facebook",  label: "Facebook",  icon: "📘", placeholder: "https://facebook.com/…" },
                      { key: "instagram", label: "Instagram", icon: "📸", placeholder: "https://instagram.com/…" },
                      { key: "twitter",   label: "X / Twitter", icon: "🐦", placeholder: "https://x.com/…" },
                      { key: "youtube",   label: "YouTube",   icon: "▶️",  placeholder: "https://youtube.com/…" },
                      { key: "tiktok",    label: "TikTok",    icon: "🎵", placeholder: "https://tiktok.com/@…" },
                      { key: "linkedin",  label: "LinkedIn",  icon: "💼", placeholder: "https://linkedin.com/…" },
                    ].map(({ key, label, icon, placeholder }) => (
                      <div key={key}>
                        <label style={labelStyle}>{icon} {label}</label>
                        <input
                          type="url"
                          name={key}
                          value={formData[key]}
                          onChange={handleInputChange}
                          placeholder={placeholder}
                          style={inputStyle}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Operational Hours */}
                <div style={{ gridColumn: "1 / -1" }}>
                  <div style={{ borderTop: "1px solid #2a2a2a", paddingTop: "14px", marginBottom: "14px" }}>
                    <p style={{ color: "#fff", fontSize: "13px", fontWeight: 600, marginBottom: "4px" }}>Operational Hours</p>
                    <p style={{ color: "#555", fontSize: "11px" }}>Leave both fields blank to show as Closed for that day.</p>
                  </div>

                  {[
                    { label: "Weekdays (Mon – Fri)", openKey: "weekday_open", closeKey: "weekday_close", h24Key: "weekday_is_24h" },
                    { label: "Saturday",             openKey: "saturday_open", closeKey: "saturday_close", h24Key: "saturday_is_24h" },
                    { label: "Sunday",               openKey: "sunday_open",   closeKey: "sunday_close",   h24Key: "sunday_is_24h" },
                  ].map(({ label, openKey, closeKey, h24Key }) => {
                    const is24h = formData[h24Key];
                    const isClosed = !is24h && !formData[openKey] && !formData[closeKey];
                    return (
                      <div key={openKey} style={{ marginBottom: "14px", padding: "12px", borderRadius: "6px", background: "#252525", border: "1px solid #2a2a2a" }}>
                        {/* Row header: day label + 24h toggle */}
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: is24h ? 0 : "10px" }}>
                          <span style={{ color: "#ccc", fontSize: "12px", fontWeight: 700 }}>{label}</span>
                          <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", userSelect: "none" }}>
                            <input
                              type="checkbox"
                              name={h24Key}
                              checked={is24h}
                              onChange={handleInputChange}
                              style={{ accentColor: "#ff00e0", width: "14px", height: "14px", cursor: "pointer" }}
                            />
                            <span style={{ color: is24h ? "#ff00e0" : "#666", fontSize: "11px", fontWeight: 700 }}>
                              24 Hours
                            </span>
                          </label>
                        </div>

                        {/* Time pickers — hidden when 24h is on */}
                        {!is24h && (
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                            <div>
                              <label style={{ ...labelStyle, marginBottom: "4px" }}>Open</label>
                              <input type="time" name={openKey} value={formData[openKey]} onChange={handleInputChange}
                                style={{ ...inputStyle, colorScheme: "dark" }} />
                            </div>
                            <div>
                              <label style={{ ...labelStyle, marginBottom: "4px", display: "flex", alignItems: "center", gap: "6px" }}>
                                Close
                                {isClosed && <span style={{ color: "#666", fontSize: "10px", fontWeight: 700 }}>CLOSED</span>}
                              </label>
                              <input type="time" name={closeKey} value={formData[closeKey]} onChange={handleInputChange}
                                style={{ ...inputStyle, colorScheme: "dark" }} />
                            </div>
                          </div>
                        )}

                        {/* 24h badge */}
                        {is24h && (
                          <div style={{ marginTop: "8px", display: "inline-flex", alignItems: "center", gap: "5px", background: "#ff00e020", border: "1px solid #ff00e040", borderRadius: "4px", padding: "4px 10px" }}>
                            <span style={{ color: "#ff00e0", fontSize: "11px", fontWeight: 700 }}>✓ Open 24 Hours</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Main Image */}
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={labelStyle}>Main Venue Image</label>
                  {existingMainImage && !mainImage && (
                    <div style={{ marginBottom: "10px" }}>
                      <img src={existingMainImage} alt="Current" style={{ width: "120px", height: "80px", objectFit: "cover", borderRadius: "6px", border: "2px solid #ff00e0" }} />
                      <p style={{ color: "#555", fontSize: "11px", marginTop: "4px" }}>Current main image</p>
                    </div>
                  )}
                  {mainImage && (
                    <div style={{ marginBottom: "10px" }}>
                      <img src={URL.createObjectURL(mainImage)} alt="New" style={{ width: "120px", height: "80px", objectFit: "cover", borderRadius: "6px", border: "2px solid #ff00e0" }} />
                      <p style={{ color: "#ff00e0", fontSize: "11px", marginTop: "4px" }}>New: {mainImage.name}</p>
                    </div>
                  )}
                  <div style={{ background: "#252525", border: "2px dashed #3a3a3a", borderRadius: "6px", padding: "12px" }}>
                    <input type="file" accept="image/*" onChange={(e) => setMainImage(e.target.files[0])}
                      className="block w-full text-sm text-gray-500 file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:cursor-pointer" />
                    <p style={{ color: "#555", fontSize: "11px", marginTop: "6px" }}>Upload to set the main venue image</p>
                  </div>
                </div>

                {/* Gallery Images */}
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={labelStyle}>Gallery Images</label>

                  {/* Existing gallery */}
                  {existingGallery.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "10px" }}>
                      {existingGallery.map((img) => (
                        <div key={img.id} style={{ position: "relative", width: "80px", height: "80px" }}>
                          <img src={img.image} alt="" style={{ width: "80px", height: "80px", objectFit: "cover", borderRadius: "6px", border: "2px solid #3a3a3a" }} />
                          <button type="button" onClick={() => deleteGalleryImage(img.id)}
                            style={{ position: "absolute", top: "3px", right: "3px", width: "18px", height: "18px", borderRadius: "50%", border: "none", background: "rgba(0,0,0,0.8)", color: "#fff", fontSize: "11px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* New gallery previews */}
                  {newGalleryPreviews.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "10px" }}>
                      {newGalleryPreviews.map((src, i) => (
                        <div key={i} style={{ position: "relative", width: "80px", height: "80px" }}>
                          <img src={src} alt="" style={{ width: "80px", height: "80px", objectFit: "cover", borderRadius: "6px", border: "2px solid #ff00e0", opacity: 0.85 }} />
                          <span style={{ position: "absolute", top: "3px", left: "3px", background: "#ff00e0", color: "#fff", fontSize: "8px", fontWeight: 700, padding: "1px 4px", borderRadius: "3px" }}>NEW</span>
                          <button type="button" onClick={() => removeNewGalleryImage(i)}
                            style={{ position: "absolute", top: "3px", right: "3px", width: "18px", height: "18px", borderRadius: "50%", border: "none", background: "rgba(0,0,0,0.8)", color: "#fff", fontSize: "11px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div style={{ background: "#252525", border: "2px dashed #3a3a3a", borderRadius: "6px", padding: "12px" }}>
                    <input type="file" accept="image/*" multiple onChange={handleNewGalleryImages}
                      className="block w-full text-sm text-gray-500 file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:cursor-pointer" />
                    <p style={{ color: "#555", fontSize: "11px", marginTop: "6px" }}>Add multiple gallery images</p>
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: "8px" }}>
                <button type="submit" disabled={submitting}
                  style={{ padding: "8px 16px", borderRadius: "6px", border: "none", background: "#ff00e0", color: "#fff", fontSize: "13px", fontWeight: 600, cursor: "pointer", opacity: submitting ? 0.5 : 1 }}>
                  {submitting ? "Saving..." : (editingVenue ? "Update" : "Create")}
                </button>
                <button type="button" onClick={handleCancel}
                  style={{ padding: "8px 16px", borderRadius: "6px", border: "1px solid #666", background: "transparent", color: "#999", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Venues Table */}
        <div className="rounded-xl overflow-hidden" style={{ background: "#1d191e", border: "1px solid #2a2a2a" }}>
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="w-10 h-10 rounded-full border-2 border-transparent animate-spin"
                style={{ borderTopColor: "#ff00e0", borderRightColor: "#ff00e0" }} />
            </div>
          ) : venues.length === 0 ? (
            <div className="text-center py-24">
              <p className="text-white font-semibold">No venues created</p>
              <p className="text-gray-500 text-sm mt-1">Create your first venue to get started</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #2a2a2a" }}>
                    <th style={{ padding: "16px", textAlign: "left", color: "#666", fontSize: "12px", fontWeight: 600 }}>Venue</th>
                    <th style={{ padding: "16px", textAlign: "left", color: "#666", fontSize: "12px", fontWeight: 600 }}>City</th>
                    <th style={{ padding: "16px", textAlign: "left", color: "#666", fontSize: "12px", fontWeight: 600 }}>Address</th>
                    <th style={{ padding: "16px", textAlign: "left", color: "#666", fontSize: "12px", fontWeight: 600 }}>Phone</th>
                    <th style={{ padding: "16px", textAlign: "left", color: "#666", fontSize: "12px", fontWeight: 600 }}>Capacity</th>
                    <th style={{ padding: "16px", textAlign: "left", color: "#666", fontSize: "12px", fontWeight: 600 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedVenues.map((venue, i) => (
                    <tr key={venue.id} style={{ borderBottom: i < paginatedVenues.length - 1 ? "1px solid #252525" : "none" }}>
                      <td style={{ padding: "16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          {venue.image ? (
                            <img src={venue.image} alt={venue.name} style={{ width: "40px", height: "40px", objectFit: "cover", borderRadius: "6px", border: "1px solid #3a3a3a", flexShrink: 0 }} />
                          ) : (
                            <div style={{ width: "40px", height: "40px", borderRadius: "6px", background: "#252525", border: "1px solid #3a3a3a", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                              <span style={{ fontSize: "18px" }}>🏛️</span>
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-white">{venue.name}</p>
                            {venue.images?.length > 0 && (
                              <p style={{ color: "#666", fontSize: "11px" }}>{venue.images.length} gallery {venue.images.length === 1 ? "image" : "images"}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "16px" }}>
                        <p className="text-gray-400 text-sm">{venue.city}</p>
                      </td>
                      <td style={{ padding: "16px" }}>
                        <p className="text-gray-400 text-sm">{venue.address}</p>
                      </td>
                      <td style={{ padding: "16px" }}>
                        <p className="text-gray-400 text-sm">{venue.phone || "—"}</p>
                      </td>
                      <td style={{ padding: "16px" }}>
                        <p className="text-white text-sm">{venue.capacity ? venue.capacity.toLocaleString() : "—"}</p>
                      </td>
                      <td style={{ padding: "16px" }}>
                        <div style={{ display: "flex", gap: "8px" }}>
                          <button onClick={() => handleEdit(venue)}
                            style={{ padding: "6px 12px", fontSize: "11px", fontWeight: 600, borderRadius: "4px", border: "1px solid #ff00e0", background: "transparent", color: "#ff00e0", cursor: "pointer" }}>
                            Edit
                          </button>
                          <button onClick={() => handleDelete(venue.id)} disabled={actioningId === venue.id}
                            style={{ padding: "6px 12px", fontSize: "11px", fontWeight: 600, borderRadius: "4px", border: "1px solid #666", background: "transparent", color: "#999", cursor: "pointer", opacity: actioningId === venue.id ? 0.5 : 1 }}>
                            {actioningId === venue.id ? "..." : "Delete"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {!loading && venues.length > 0 && (
          <div style={{ marginTop: "24px", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px", background: "#1d191e", borderRadius: "6px", border: "1px solid #2a2a2a" }}>
            <div style={{ color: "#999", fontSize: "13px" }}>
              Page <span style={{ color: "#ff00e0", fontWeight: 600 }}>{currentPage}</span> of{" "}
              <span style={{ color: "#ff00e0", fontWeight: 600 }}>{totalPages || 1}</span> • Showing{" "}
              <span style={{ color: "#ff00e0", fontWeight: 600 }}>{paginatedVenues.length}</span> of{" "}
              <span style={{ color: "#ff00e0", fontWeight: 600 }}>{venues.length}</span> venues
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}
                style={{ padding: "8px 16px", borderRadius: "4px", border: "1px solid #2a2a2a", background: currentPage === 1 ? "#0a0a0a" : "#1d191e", color: currentPage === 1 ? "#444" : "#e0e0e0", fontSize: "12px", fontWeight: 600, cursor: currentPage === 1 ? "not-allowed" : "pointer", opacity: currentPage === 1 ? 0.5 : 1 }}>
                ← Previous
              </button>
              <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage >= totalPages}
                style={{ padding: "8px 16px", borderRadius: "4px", border: "1px solid #2a2a2a", background: currentPage >= totalPages ? "#0a0a0a" : "#1d191e", color: currentPage >= totalPages ? "#444" : "#e0e0e0", fontSize: "12px", fontWeight: 600, cursor: currentPage >= totalPages ? "not-allowed" : "pointer", opacity: currentPage >= totalPages ? 0.5 : 1 }}>
                Next →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
