import React, { useState, useRef, useEffect } from "react";
import {
  format, addMonths, subMonths, startOfMonth, endOfMonth,
  startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, isToday,
} from "date-fns";

export default function PinkDatePicker({ value, onChange, placeholder = "Pick a date" }) {
  const [open, setOpen] = useState(false);
  const [viewDate, setViewDate] = useState(value ? new Date(value) : new Date());
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Sync viewDate when value changes externally
  useEffect(() => {
    if (value) setViewDate(new Date(value));
  }, [value]);

  const selected = value ? new Date(value) : null;

  // Build calendar grid
  const monthStart = startOfMonth(viewDate);
  const monthEnd = endOfMonth(viewDate);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const days = [];
  let day = gridStart;
  while (day <= gridEnd) { days.push(day); day = addDays(day, 1); }

  const weeks = [];
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7));

  const selectDay = (d) => {
    onChange(format(d, "yyyy-MM-dd"));
    setOpen(false);
  };

  // ── styles ──
  const S = {
    wrapper: { position: "relative", display: "inline-block" },

    trigger: {
      display: "flex", alignItems: "center", gap: 8,
      background: "linear-gradient(135deg,#c4006e 0%,#f01572 50%,#ff00e0 100%)",
      border: "2px solid rgba(255,255,255,0.25)",
      borderRadius: 10, padding: "9px 14px",
      color: "#fff", fontFamily: "Poppins,sans-serif", fontWeight: 600, fontSize: 13,
      cursor: "pointer", userSelect: "none",
      boxShadow: "0 4px 18px rgba(255,0,224,0.28)",
      transition: "box-shadow .2s, border-color .2s",
      minWidth: 165,
    },

    popup: {
      position: "absolute", top: "calc(100% + 8px)", right: 0, zIndex: 9999,
      background: "#1a0a1a",
      border: "1px solid rgba(255,0,224,0.35)",
      borderRadius: 14,
      boxShadow: "0 16px 48px rgba(255,0,224,0.25), 0 4px 16px rgba(0,0,0,0.6)",
      overflow: "hidden", minWidth: 300,
      fontFamily: "Poppins,sans-serif",
    },

    header: {
      background: "linear-gradient(135deg,#c4006e 0%,#f01572 60%,#ff00e0 100%)",
      padding: "14px 16px",
      display: "flex", alignItems: "center", justifyContent: "space-between",
    },

    navBtn: {
      background: "rgba(255,255,255,0.15)", border: "none", borderRadius: 7,
      color: "#fff", cursor: "pointer", width: 30, height: 30,
      display: "flex", alignItems: "center", justifyContent: "center",
      transition: "background .15s", fontSize: 16,
    },

    monthLabel: { color: "#fff", fontWeight: 700, fontSize: 15, letterSpacing: "0.02em" },

    weekdays: {
      display: "grid", gridTemplateColumns: "repeat(7,1fr)",
      padding: "10px 12px 4px",
      borderBottom: "1px solid rgba(255,0,224,0.15)",
    },

    weekday: { textAlign: "center", color: "#ff00e0", fontSize: 11, fontWeight: 700, padding: "4px 0" },

    grid: { padding: "8px 12px 12px", display: "flex", flexDirection: "column", gap: 2 },

    week: { display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 2 },

    todayStrip: {
      padding: "10px 16px",
      borderTop: "1px solid rgba(255,0,224,0.15)",
      display: "flex", justifyContent: "space-between", alignItems: "center",
    },
  };

  const dayStyle = (d) => {
    const sel = selected && isSameDay(d, selected);
    const tod = isToday(d);
    const cur = isSameMonth(d, viewDate);
    return {
      textAlign: "center", borderRadius: 7, padding: "7px 0",
      fontSize: 13, fontWeight: cur ? 600 : 400, cursor: "pointer",
      transition: "background .15s, color .15s",
      background: sel
        ? "linear-gradient(135deg,#c4006e,#ff00e0)"
        : tod ? "rgba(255,0,224,0.12)" : "transparent",
      color: sel ? "#fff" : cur ? (tod ? "#ff00e0" : "#e0e0e0") : "#444",
      border: tod && !sel ? "1px solid rgba(255,0,224,0.4)" : "1px solid transparent",
      boxShadow: sel ? "0 2px 10px rgba(255,0,224,0.4)" : "none",
    };
  };

  return (
    <div style={S.wrapper} ref={ref}>
      {/* Trigger button */}
      <button
        style={S.trigger}
        onClick={() => setOpen(o => !o)}
        onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 6px 28px rgba(255,0,224,0.5)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.5)"; }}
        onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 4px 18px rgba(255,0,224,0.28)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)"; }}
      >
        {/* Calendar icon */}
        <svg width="15" height="15" fill="none" stroke="#fff" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span style={{ flex: 1 }}>
          {selected ? format(selected, "MMM d, yyyy") : placeholder}
        </span>
        {/* Chevron */}
        <svg width="12" height="12" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2.5" viewBox="0 0 24 24"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0)", transition: "transform .2s" }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Popup calendar */}
      {open && (
        <div style={S.popup}>
          {/* Header */}
          <div style={S.header}>
            <button style={S.navBtn}
              onClick={() => setViewDate(subMonths(viewDate, 1))}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.28)"}
              onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.15)"}>
              ‹
            </button>
            <span style={S.monthLabel}>{format(viewDate, "MMMM yyyy")}</span>
            <button style={S.navBtn}
              onClick={() => setViewDate(addMonths(viewDate, 1))}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.28)"}
              onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.15)"}>
              ›
            </button>
          </div>

          {/* Weekday labels */}
          <div style={S.weekdays}>
            {["Su","Mo","Tu","We","Th","Fr","Sa"].map(d => (
              <div key={d} style={S.weekday}>{d}</div>
            ))}
          </div>

          {/* Day grid */}
          <div style={S.grid}>
            {weeks.map((week, wi) => (
              <div key={wi} style={S.week}>
                {week.map((d, di) => (
                  <div
                    key={di}
                    style={dayStyle(d)}
                    onClick={() => selectDay(d)}
                    onMouseEnter={e => {
                      if (!(selected && isSameDay(d, selected))) {
                        e.currentTarget.style.background = "rgba(255,0,224,0.18)";
                        e.currentTarget.style.color = "#ff00e0";
                      }
                    }}
                    onMouseLeave={e => {
                      const s = dayStyle(d);
                      e.currentTarget.style.background = s.background;
                      e.currentTarget.style.color = s.color;
                    }}
                  >
                    {format(d, "d")}
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Footer strip */}
          <div style={S.todayStrip}>
            <button
              onClick={() => { setViewDate(new Date()); selectDay(new Date()); }}
              style={{ background: "rgba(255,0,224,0.12)", border: "1px solid rgba(255,0,224,0.35)", color: "#ff00e0", borderRadius: 7, padding: "5px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "Poppins,sans-serif" }}>
              Today
            </button>
            {selected && (
              <button
                onClick={() => { onChange(""); setOpen(false); }}
                style={{ background: "transparent", border: "none", color: "#666", fontSize: 12, cursor: "pointer", fontFamily: "Poppins,sans-serif" }}>
                ✕ Clear
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
