import React, { useState, useEffect } from "react";
import api from "../api/axios";

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: "", slug: "" });
  const [errors, setErrors] = useState({});
  const [actioningId, setActioningId] = useState(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/admin/categories/");
      setCategories(data.results || data);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setActioningId(editingId || "new");
    
    try {
      if (editingId) {
        await api.put(`/admin/categories/${editingId}/`, formData);
      } else {
        await api.post("/admin/categories/", formData);
      }
      fetchCategories();
      setShowForm(false);
      setFormData({ name: "", slug: "" });
      setEditingId(null);
    } catch (err) {
      setErrors(err.response?.data || {});
    } finally {
      setActioningId(null);
    }
  };

  const handleEdit = (category) => {
    setEditingId(category.id);
    setFormData({ name: category.name, slug: category.slug });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this category? Events will still exist.")) return;
    setActioningId(id);
    try {
      await api.delete(`/admin/categories/${id}/`);
      fetchCategories();
    } catch (err) {
      alert("Failed to delete category");
    } finally {
      setActioningId(null);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ name: "", slug: "" });
    setErrors({});
  };

  return (
    <div style={{ background: "#191919", minHeight: "100vh", padding: "32px" }}>
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div style={{ marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h1 className="text-3xl font-bold text-white">Categories</h1>
              <p className="text-gray-500 text-sm mt-1">Manage event categories</p>
            </div>
            {!showForm && (
              <button
                onClick={() => {
                  setShowForm(true);
                  setEditingId(null);
                  setFormData({ name: "", slug: "" });
                }}
                style={{
                  padding: "8px 16px",
                  borderRadius: "6px",
                  border: "none",
                  background: "#ff00e0",
                  color: "#fff",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                + New Category
              </button>
            )}
          </div>

          {/* Form */}
          {showForm && (
            <div style={{ marginBottom: "24px", borderRadius: "8px", padding: "20px", background: "#1d191e", border: "1px solid #2a2a2a" }}>
              <h3 className="text-lg font-semibold text-white mb-4">
                {editingId ? "Edit Category" : "Create New Category"}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label style={{ display: "block", color: "#999", fontSize: "12px", fontWeight: 600, marginBottom: "6px" }}>
                    Category Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    placeholder="e.g. Music"
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: "6px",
                      border: "1px solid #2a2a2a",
                      background: "#252525",
                      color: "#fff",
                      fontSize: "14px",
                    }}
                  />
                  {errors.name && <p style={{ color: "#ff00e0", fontSize: "12px", marginTop: "4px" }}>{errors.name}</p>}
                </div>

                <div>
                  <label style={{ display: "block", color: "#999", fontSize: "12px", fontWeight: 600, marginBottom: "6px" }}>
                    Slug (auto-generated) *
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    required
                    placeholder="e.g. music"
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: "6px",
                      border: "1px solid #2a2a2a",
                      background: "#252525",
                      color: "#fff",
                      fontSize: "14px",
                    }}
                  />
                  {errors.slug && <p style={{ color: "#ff00e0", fontSize: "12px", marginTop: "4px" }}>{errors.slug}</p>}
                </div>

                <div style={{ display: "flex", gap: "8px", marginTop: "16px" }}>
                  <button
                    type="submit"
                    disabled={actioningId !== null}
                    style={{
                      padding: "8px 16px",
                      borderRadius: "6px",
                      border: "none",
                      background: "#ff00e0",
                      color: "#fff",
                      fontSize: "13px",
                      fontWeight: 600,
                      cursor: "pointer",
                      opacity: actioningId !== null ? 0.5 : 1,
                    }}
                  >
                    {actioningId !== null ? "..." : (editingId ? "Update" : "Create")}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    style={{
                      padding: "8px 16px",
                      borderRadius: "6px",
                      border: "1px solid #666",
                      background: "transparent",
                      color: "#999",
                      fontSize: "13px",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Categories List */}
          <div className="rounded-xl overflow-hidden" style={{ background: "#1d191e", border: "1px solid #2a2a2a" }}>
            {loading ? (
              <div className="flex justify-center py-16">
                <div className="w-10 h-10 rounded-full border-2 border-transparent animate-spin"
                  style={{ borderTopColor: "#ff00e0", borderRightColor: "#ff00e0" }} />
              </div>
            ) : categories.length === 0 ? (
              <div className="text-center py-24">
                <p className="text-white font-semibold">No categories created</p>
                <p className="text-gray-500 text-sm mt-1">Create your first category to get started</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid #2a2a2a" }}>
                      <th style={{ padding: "16px", textAlign: "left", color: "#666", fontSize: "12px", fontWeight: 600 }}>Name</th>
                      <th style={{ padding: "16px", textAlign: "left", color: "#666", fontSize: "12px", fontWeight: 600 }}>Slug</th>
                      <th style={{ padding: "16px", textAlign: "left", color: "#666", fontSize: "12px", fontWeight: 600 }}>Events</th>
                      <th style={{ padding: "16px", textAlign: "left", color: "#666", fontSize: "12px", fontWeight: 600 }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map((category, i) => (
                      <tr
                        key={category.id}
                        style={{
                          borderBottom: i < categories.length - 1 ? "1px solid #252525" : "none",
                        }}
                      >
                        <td style={{ padding: "16px" }}>
                          <p className="font-semibold text-white">{category.name}</p>
                        </td>
                        <td style={{ padding: "16px" }}>
                          <p className="text-gray-400 text-sm">{category.slug}</p>
                        </td>
                        <td style={{ padding: "16px" }}>
                          <p className="text-white text-sm">{category.event_count}</p>
                        </td>
                        <td style={{ padding: "16px" }}>
                          <div style={{ display: "flex", gap: "8px" }}>
                            <button
                              onClick={() => handleEdit(category)}
                              style={{
                                padding: "6px 12px",
                                fontSize: "11px",
                                fontWeight: 600,
                                borderRadius: "4px",
                                border: "1px solid #ff00e0",
                                background: "transparent",
                                color: "#ff00e0",
                                cursor: "pointer",
                              }}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(category.id)}
                              disabled={actioningId === category.id}
                              style={{
                                padding: "6px 12px",
                                fontSize: "11px",
                                fontWeight: 600,
                                borderRadius: "4px",
                                border: "1px solid #666",
                                background: "transparent",
                                color: "#999",
                                cursor: "pointer",
                                opacity: actioningId === category.id ? 0.5 : 1,
                              }}
                            >
                              {actioningId === category.id ? "..." : "Delete"}
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
        </div>
      </div>
    );
  }
