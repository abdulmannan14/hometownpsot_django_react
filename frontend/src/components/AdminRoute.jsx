import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AdminLayout from "./AdminLayout";

export default function AdminRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: "#191919" }}>
        <div className="w-10 h-10 rounded-full border-2 border-transparent animate-spin"
          style={{ borderTopColor: "#ff00e0", borderRightColor: "#ff00e0" }} />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  const isAdmin = user.role === "admin" || user.is_staff;
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <AdminLayout>{children}</AdminLayout>;
}
