import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function EventsByVenue() {
  const navigate = useNavigate();
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVenues = async () => {
      try {
        const res = await api.get('/events/venues/');
        const data = Array.isArray(res.data) ? res.data : (res.data.results || []);
        setVenues(data);
      } catch (error) {
        console.error('Failed to fetch venues:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchVenues();
  }, []);

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

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        {venues.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {venues.map((venue) => (
              <div
                key={venue.id}
                onClick={() => navigate(`/venues/${venue.id}`)}
                className="rounded-xl overflow-hidden cursor-pointer group transition-all hover:shadow-xl"
                style={{ background: '#1d191e', border: '1px solid #2a2a2a' }}
              >
                {/* Image */}
                <div className="relative overflow-hidden" style={{ height: '220px' }}>
                  {venue.image ? (
                    <img
                      src={venue.image}
                      alt={venue.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"
                      style={{ background: 'linear-gradient(135deg, #1d191e 0%, #252525 100%)' }}>
                      <span style={{ fontSize: '56px', opacity: 0.4 }}>🏛️</span>
                    </div>
                  )}
                  {/* Overlay gradient */}
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 50%)' }} />
                  {/* City badge */}
                  {venue.city && (
                    <div className="absolute bottom-3 left-3 px-2 py-1 rounded text-xs font-semibold text-white"
                      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
                      📍 {venue.city}
                    </div>
                  )}
                  {/* Capacity badge */}
                  {venue.capacity && (
                    <div className="absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-bold text-white"
                      style={{ background: '#ff00e0' }}>
                      Cap. {venue.capacity.toLocaleString()}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-5">
                  <h3 className="text-lg font-bold text-white mb-1 truncate">{venue.name}</h3>
                  <p className="text-gray-500 text-sm mb-3 line-clamp-1">{venue.address}</p>

                  {venue.description && (
                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">{venue.description}</p>
                  )}

                  <div className="flex items-center justify-between">
                    {venue.phone && (
                      <span className="text-xs text-gray-500">{venue.phone}</span>
                    )}
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
            <p className="text-gray-400 text-lg mt-4">No venues listed yet</p>
            <p className="text-gray-600 text-sm mt-1">Check back soon as we add more venues.</p>
          </div>
        )}
      </div>
    </div>
  );
}
