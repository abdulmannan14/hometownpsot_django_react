import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]" style={{ background: "#191919" }}>
        <div className="w-10 h-10 rounded-full border-2 border-transparent animate-spin"
          style={{ borderTopColor: "#ff00e0", borderRightColor: "#ff00e0" }} />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
