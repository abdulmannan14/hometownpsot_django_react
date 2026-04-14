import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const RADIUS_OPTIONS = [1, 3, 5, 10, 30, 60];

function haversineMiles(lat1, lon1, lat2, lon2) {
  const R = 3958.8;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

export default function EventsByVenue() {
  const navigate = useNavigate();
  const [allVenues, setAllVenues] = useState([]);
  const [loading, setLoading] = useState(true);

  // Radius filter
  const [radius, setRadius] = useState("");
  const [userCoords, setUserCoords] = useState(null);
  const [geoStatus, setGeoStatus] = useState("idle"); // idle | requesting | done | denied
  const [filteredVenues, setFilteredVenues] = useState([]);

  // Request GPS on mount so list is sorted immediately
  useEffect(() => {
    if (!navigator.geolocation) return;
    setGeoStatus("requesting");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGeoStatus("done");
      },
      () => setGeoStatus("denied"),
      { timeout: 8000 }
    );
  }, []);

  useEffect(() => {
    api.get('/events/venues/')
      .then(({ data }) => {
        const list = Array.isArray(data) ? data : (data.results || []);
        setAllVenues(list);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Re-apply filter + sort whenever radius, coords, or venues list changes
  useEffect(() => {
    let list = radius && userCoords
      ? allVenues.filter(
          (v) =>
            v.latitude != null &&
            v.longitude != null &&
            haversineMiles(userCoords.lat, userCoords.lng, v.latitude, v.longitude) <= parseInt(radius)
        )
      : [...allVenues];

    // Sort by distance if we have coords
    if (userCoords) {
      list.sort((a, b) => {
        const da = a.latitude != null && a.longitude != null
          ? haversineMiles(userCoords.lat, userCoords.lng, a.latitude, a.longitude)
          : Infinity;
        const db = b.latitude != null && b.longitude != null
          ? haversineMiles(userCoords.lat, userCoords.lng, b.latitude, b.longitude)
          : Infinity;
        return da - db;
      });
    }

    setFilteredVenues(list);
  }, [radius, userCoords, allVenues]);

  const handleRadiusChange = (e) => {
    const value = e.target.value;
    setRadius(value);

    if (!value || userCoords) return; // already have coords or clearing filter

    if (!navigator.geolocation) {
      setGeoStatus("denied");
      return;
    }

    setGeoStatus("requesting");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGeoStatus("done");
      },
      () => setGeoStatus("denied"),
      { timeout: 8000 }
    );
  };

  const handleClearRadius = () => {
    setRadius("");
    setFilteredVenues(allVenues);
  };

  if (loading) {
    return (
      <div style={{ background: '#191919' }} className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-2 border-transparent animate-spin"
          style={{ borderTopColor: '#ff00e0', borderRightColor: '#ff00e0' }} />
      </div>
    );
  }

  return (
    <div style={{ background: '#191919' }} className="min-h-screen">
      {/* Header */}
      <div className="border-b" style={{ borderColor: '#2a2a2a', background: '#0a0a0a', padding: '32px 24px' }}>
        <div className="max-w-7xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: '#ff00e0' }}>Browse</p>
          <h1 className="text-4xl font-bold text-white mb-2">Events by Venue</h1>
          <p className="text-gray-400">Discover amazing venues hosting events in your area</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">

        {/* Filter bar */}
        <div style={{ background: '#1d191e', border: '1px solid #2a2a2a', borderRadius: '12px', padding: '16px 20px', marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: radius ? '#ff00e0' : '#9ca3af', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
                📍 Radius
              </span>
              <select
                value={radius}
                onChange={handleRadiusChange}
                style={{
                  background: '#252525',
                  border: `1px solid ${radius ? '#ff00e0' : '#3a3a3a'}`,
                  color: radius ? '#ff00e0' : '#fff',
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: '13px',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  outline: 'none',
                }}
              >
                <option value="">Any Distance</option>
                {RADIUS_OPTIONS.map((r) => (
                  <option key={r} value={r}>{r} mile{r !== 1 ? 's' : ''}</option>
                ))}
              </select>
            </div>

            {/* GPS status indicators */}
            {geoStatus === 'requesting' && (
              <span style={{ color: '#aaa', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className="inline-block w-3 h-3 rounded-full border-2 border-transparent animate-spin"
                  style={{ borderTopColor: '#ff00e0', borderRightColor: '#ff00e0' }} />
                Getting your location…
              </span>
            )}
            {geoStatus === 'denied' && (
              <span style={{ color: '#f87171', fontSize: '12px' }}>
                ⚠️ Location access denied. Please allow it in your browser to use radius filter.
              </span>
            )}
            {geoStatus === 'done' && radius && (
              <span style={{ color: '#22c55e', fontSize: '12px' }}>✓ Location found</span>
            )}

            {/* Active filter badge + clear */}
            {radius && (
              <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ color: '#ff00e0', fontSize: '12px', fontWeight: 600, background: 'rgba(255,0,224,0.1)', border: '1px solid rgba(255,0,224,0.3)', borderRadius: '4px', padding: '3px 10px' }}>
                  Within {radius} mile{parseInt(radius) !== 1 ? 's' : ''}
                  {filteredVenues.length > 0 ? ` · ${filteredVenues.length} venue${filteredVenues.length !== 1 ? 's' : ''}` : ''}
                </span>
                <button
                  onClick={handleClearRadius}
                  style={{ background: 'transparent', border: '1px solid #3a3a3a', color: '#666', fontSize: '12px', padding: '3px 10px', borderRadius: '4px', cursor: 'pointer' }}
                >
                  Clear
                </button>
              </div>
            )}
          </div>

          {/* Hint — always white */}
          {radius && geoStatus !== 'denied' && (
            <p style={{ color: '#fff', fontSize: '11px', marginTop: '10px' }}>
              📍 Radius filter uses your device location. Make sure location access is allowed in your browser.
            </p>
          )}
        </div>

        {/* Results heading */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <h2 style={{ color: '#fff', fontSize: 20, fontWeight: 700, margin: 0 }}>
            {radius
              ? `Venues Within ${radius} Mile${parseInt(radius) !== 1 ? 's' : ''}`
              : 'All Venues'}
          </h2>
          <div style={{ flex: 1, height: 1, background: '#2a2a2a' }} />
          <span style={{ color: '#555', fontSize: 13 }}>{filteredVenues.length} venue{filteredVenues.length !== 1 ? 's' : ''}</span>
        </div>

        {/* Grid */}
        {filteredVenues.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVenues.map((venue) => (
              <div
                key={venue.id}
                onClick={() => navigate(`/venues/${venue.id}`)}
                className="rounded-xl overflow-hidden cursor-pointer group transition-all hover:shadow-xl"
                style={{ background: '#1d191e', border: '1px solid #2a2a2a' }}
              >
                {/* Image */}
                <div className="relative overflow-hidden" style={{ height: '220px' }}>
                  {venue.image ? (
                    <img src={venue.image} alt={venue.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"
                      style={{ background: 'linear-gradient(135deg, #1d191e 0%, #252525 100%)' }}>
                      <span style={{ fontSize: '56px', opacity: 0.4 }}>🏛️</span>
                    </div>
                  )}
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 50%)' }} />
                  {venue.city && (
                    <div className="absolute bottom-3 left-3 px-2 py-1 rounded text-xs font-semibold text-white"
                      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
                      📍 {venue.city}
                    </div>
                  )}
                  {/* Capacity — top left */}
                  {venue.capacity && (
                    <div className="absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-bold text-white"
                      style={{ background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.2)' }}>
                      Cap. {venue.capacity.toLocaleString()}
                    </div>
                  )}
                  {/* Upcoming events badge — top right */}
                  {venue.upcoming_event_count > 0 && (
                    <div className="absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-bold text-white"
                      style={{ background: '#ff00e0' }}>
                      {venue.upcoming_event_count} upcoming event{venue.upcoming_event_count !== 1 ? 's' : ''}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-5">
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 4 }}>
                    <h3 className="text-lg font-bold text-white truncate">{venue.name}</h3>
                    {userCoords && venue.latitude != null && venue.longitude != null && (
                      <span style={{ flexShrink: 0, fontSize: 11, fontWeight: 700, color: '#ff00e0', background: 'rgba(255,0,224,0.1)', border: '1px solid rgba(255,0,224,0.3)', borderRadius: 20, padding: '2px 8px', whiteSpace: 'nowrap' }}>
                        {(() => { const d = haversineMiles(userCoords.lat, userCoords.lng, venue.latitude, venue.longitude); return d < 0.1 ? '< 0.1 mi' : `${d.toFixed(1)} mi`; })()}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-500 text-sm mb-3 line-clamp-1">{venue.address}</p>
                  {venue.description && (
                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">{venue.description}</p>
                  )}
                  <div className="flex items-center justify-between">
                    {venue.phone && <span className="text-xs text-gray-500">{venue.phone}</span>}
                    <button
                      className="ml-auto text-sm font-semibold px-4 py-2 rounded-lg transition-all"
                      style={{ background: 'transparent', border: '1px solid #ff00e0', color: '#ff00e0' }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = '#ff00e0'; e.currentTarget.style.color = '#fff'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#ff00e0'; }}
                    >
                      View Venue →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-24">
            <span style={{ fontSize: '48px', opacity: 0.3 }}>🏛️</span>
            {radius ? (
              <>
                <p className="text-gray-400 text-lg mt-4">No venues found within {radius} miles.</p>
                <p className="text-gray-600 text-sm mt-1">Try a larger radius or clear the filter.</p>
                <button onClick={handleClearRadius} className="mt-4 text-sm font-semibold px-5 py-2 rounded-lg"
                  style={{ background: 'rgba(255,0,224,0.1)', border: '1px solid rgba(255,0,224,0.3)', color: '#ff00e0' }}>
                  Clear Radius Filter
                </button>
              </>
            ) : (
              <>
                <p className="text-gray-400 text-lg mt-4">No venues listed yet</p>
                <p className="text-gray-600 text-sm mt-1">Check back soon as we add more venues.</p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
