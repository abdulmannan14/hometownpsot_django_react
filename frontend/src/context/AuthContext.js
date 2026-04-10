import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    try {
      const { data } = await api.get("/auth/profile/");
      setUser(data);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [fetchProfile]);

  const login = async (username, password) => {
    const { data } = await api.post("/auth/login/", { username, password });
    localStorage.setItem("access_token", data.access);
    localStorage.setItem("refresh_token", data.refresh);
    await fetchProfile();
  };

  const register = async (username, email, password, password2, locationData = {}) => {
    await api.post("/auth/register/", { username, email, password, password2, ...locationData });
    await login(username, password);
  };

  const logout = async () => {
    try {
      const refresh = localStorage.getItem("refresh_token");
      if (refresh) {
        await api.post("/auth/logout/", { refresh });
      }
    } catch (err) {
      // Silently ignore logout errors - we still want to clear tokens
      console.log("Logout API error (non-critical):", err.message);
    } finally {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
