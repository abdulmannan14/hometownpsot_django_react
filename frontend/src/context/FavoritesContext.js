import { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "../api/axios";
import { useAuth } from "./AuthContext";

const FavoritesContext = createContext(null);

export function FavoritesProvider({ children }) {
  const { user } = useAuth();
  const [savedIds, setSavedIds] = useState(new Set());
  const [showSignupPrompt, setShowSignupPrompt] = useState(false);

  const loadSaved = useCallback(async () => {
    if (!user) { setSavedIds(new Set()); return; }
    try {
      const { data } = await api.get("/events/saved/");
      const items = data.results ?? data;
      setSavedIds(new Set(items.map((s) => s.event?.id ?? s.event)));
    } catch {
      setSavedIds(new Set());
    }
  }, [user]);

  useEffect(() => { loadSaved(); }, [loadSaved]);

  const toggle = async (eventId) => {
    if (!user) {
      setShowSignupPrompt(true);
      return;
    }

    const alreadySaved = savedIds.has(eventId);

    // Optimistic update
    setSavedIds((prev) => {
      const next = new Set(prev);
      alreadySaved ? next.delete(eventId) : next.add(eventId);
      return next;
    });

    try {
      // POST is now a toggle — returns { saved: true/false }
      const { data } = await api.post(`/events/${eventId}/save/`);
      // Sync with server truth
      setSavedIds((prev) => {
        const next = new Set(prev);
        data.saved ? next.add(eventId) : next.delete(eventId);
        return next;
      });
    } catch {
      // Revert optimistic update on network error
      setSavedIds((prev) => {
        const next = new Set(prev);
        alreadySaved ? next.add(eventId) : next.delete(eventId);
        return next;
      });
    }
  };

  const isSaved = (eventId) => savedIds.has(eventId);

  return (
    <FavoritesContext.Provider value={{ savedIds, toggle, isSaved, showSignupPrompt, setShowSignupPrompt }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export const useFavorites = () => useContext(FavoritesContext);
