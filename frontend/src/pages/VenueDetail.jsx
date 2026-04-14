import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import EventCard from '../components/EventCard';
import {
  FaFacebook, FaTwitter, FaWhatsapp, FaLink, FaCheck,
  FaPhone, FaGlobe, FaMapMarkerAlt,
  FaInstagram, FaYoutube, FaTiktok, FaLinkedin,
} from 'react-icons/fa';
import api from '../api/axios';

export default function VenueDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [venue, setVenue] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    const load = async () => {
      try {
        const [venueRes, eventsRes] = await Promise.all([
          api.get(`/events/venues/${id}/`),
          api.get('/events/', { params: { venue: id } }),
        ]);
        setVenue(venueRes.data);
        setActiveImage(venueRes.data.image || null);
        const evData = eventsRes.data.results ?? eventsRes.data;
        setEvents(Array.isArray(evData) ? evData : []);
      } catch {
        navigate('/events/venues');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, navigate]);

  const handleShare = (platform) => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(venue?.name || 'Check out this venue');
    const shares = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      twitter: `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
      whatsapp: `https://wa.me/?text=${text}%20${url}`,
    };
    window.open(shares[platform], '_blank', 'noopener,noreferrer');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const fmt12 = (t) => {
    if (!t) return null;
    const [h, m] = t.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour = h % 12 || 12;
    return `${hour}:${String(m).padStart(2, '0')} ${ampm}`;
  };

  const hoursRow = (open, close, is24h) => {
    if (is24h) return <span style={{ color: '#ff00e0', fontWeight: 600 }}>Open 24 Hours</span>;
    if (!open && !close) return <span style={{ color: '#ef4444' }}>Closed</span>;
    return <span className="text-white">{fmt12(open)} – {fmt12(close)}</span>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]" style={{ background: '#191919' }}>
        <div className="w-10 h-10 rounded-full border-2 border-transparent animate-spin"
          style={{ borderTopColor: '#ff00e0', borderRightColor: '#ff00e0' }} />
      </div>
    );
  }

  if (!venue) return null;

  // All images: main + gallery
  const allImages = [
    ...(venue.image ? [{ id: 'main', image: venue.image }] : []),
    ...(venue.images || []),
  ];

  const mapSrc = venue.latitude && venue.longitude
    ? `https://www.google.com/maps/embed/v1/place?key=AIzaSyCGqJe_MpsYcdtPljKugcBG_-X5LpftnrA&q=${venue.latitude},${venue.longitude}&zoom=15`
    : `https://www.google.com/maps/embed/v1/place?key=AIzaSyCGqJe_MpsYcdtPljKugcBG_-X5LpftnrA&q=${encodeURIComponent(venue.address + ' ' + venue.city)}`;

  return (
    <div style={{ background: '#191919', minHeight: '100vh' }}>

      {/* Hero */}
      <div style={{ background: '#0a0a0a', borderBottom: '1px solid #2a2a2a' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <button onClick={() => navigate('/events/venues')}
            className="text-sm text-gray-500 hover:text-white transition-colors mb-6 flex items-center gap-2">
            ← Back to Venues
          </button>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Main image */}
            <div className="lg:w-1/2">
              <div className="rounded-2xl overflow-hidden" style={{ aspectRatio: '16/9', background: '#1d191e' }}>
                {activeImage ? (
                  <img src={activeImage} alt={venue.name}
                    className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, #1d191e 0%, #252525 100%)' }}>
                    <span style={{ fontSize: '72px', opacity: 0.3 }}>🏛️</span>
                  </div>
                )}
              </div>

              {/* Gallery thumbnails */}
              {allImages.length > 1 && (
                <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                  {allImages.map((img, i) => (
                    <button key={img.id || i} onClick={() => setActiveImage(img.image)}
                      className="flex-shrink-0 rounded-lg overflow-hidden transition-all"
                      style={{
                        width: '72px', height: '52px',
                        border: activeImage === img.image ? '2px solid #ff00e0' : '2px solid #2a2a2a',
                        opacity: activeImage === img.image ? 1 : 0.6,
                      }}>
                      <img src={img.image} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Info panel */}
            <div className="lg:w-1/2 flex flex-col justify-between gap-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#ff00e0' }}>Venue</p>
                <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">{venue.name}</h1>

                <div className="space-y-2 mb-4">
                  <div className="flex items-start gap-2 text-gray-400 text-sm">
                    <FaMapMarkerAlt style={{ color: '#ff00e0', marginTop: '3px', flexShrink: 0 }} />
                    <span>{venue.address}{venue.city ? `, ${venue.city}` : ''}</span>
                  </div>
                  {venue.phone && (
                    <div className="flex items-center gap-2 text-gray-400 text-sm">
                      <FaPhone style={{ color: '#ff00e0', flexShrink: 0 }} />
                      <span>{venue.phone}</span>
                    </div>
                  )}
                  {venue.website && (
                    <div className="flex items-center gap-2 text-sm">
                      <FaGlobe style={{ color: '#ff00e0', flexShrink: 0 }} />
                      <a href={venue.website} target="_blank" rel="noopener noreferrer"
                        className="hover:underline" style={{ color: '#ff00e0' }}>
                        {venue.website.replace(/^https?:\/\//, '')}
                      </a>
                    </div>
                  )}
                  {venue.capacity && (
                    <div className="flex items-center gap-2 text-gray-400 text-sm">
                      <span style={{ color: '#ff00e0' }}>👥</span>
                      <span>Capacity: {venue.capacity.toLocaleString()}</span>
                    </div>
                  )}
                </div>

                {venue.description && (
                  <p className="text-gray-300 text-sm leading-relaxed">{venue.description}</p>
                )}
              </div>

              {/* Social links */}
              {(venue.facebook || venue.instagram || venue.twitter || venue.youtube || venue.tiktok || venue.linkedin) && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">Follow Us</p>
                  <div className="flex gap-2 flex-wrap">
                    {[
                      { key: 'facebook',  Icon: FaFacebook,  color: '#1877F2', label: 'Facebook' },
                      { key: 'instagram', Icon: FaInstagram, color: '#E1306C', label: 'Instagram' },
                      { key: 'twitter',   Icon: FaTwitter,   color: '#e7e7e7', label: 'X', textColor: '#0f0f0f' },
                      { key: 'youtube',   Icon: FaYoutube,   color: '#FF0000', label: 'YouTube' },
                      { key: 'tiktok',    Icon: FaTiktok,    color: '#010101', label: 'TikTok', border: '1px solid #333' },
                      { key: 'linkedin',  Icon: FaLinkedin,  color: '#0A66C2', label: 'LinkedIn' },
                    ].filter(({ key }) => venue[key]).map(({ key, Icon, color, label, textColor, border }) => (
                      <a key={key} href={venue[key]} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-80"
                        style={{ background: color, color: textColor || '#fff', border: border || 'none', textDecoration: 'none' }}>
                        <Icon size={13} /> {label}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Share buttons */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">Share this venue</p>
                <div className="flex gap-2 flex-wrap">
                  <button onClick={() => handleShare('facebook')}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-80"
                    style={{ background: '#1877F2' }}>
                    <FaFacebook /> Facebook
                  </button>
                  <button onClick={() => handleShare('twitter')}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all hover:opacity-80"
                    style={{ background: '#e7e7e7', color: '#0f0f0f' }}>
                    <FaTwitter /> X
                  </button>
                  <button onClick={() => handleShare('whatsapp')}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-80"
                    style={{ background: '#25D366' }}>
                    <FaWhatsapp /> WhatsApp
                  </button>
                  <button onClick={handleCopy}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-80"
                    style={{ background: copied ? '#22c55e' : '#3a3a3a' }}>
                    {copied ? <FaCheck /> : <FaLink />}
                    {copied ? 'Copied!' : 'Copy Link'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Events at this venue */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold text-white" style={{ marginBottom: 24 }}>
              Upcoming Events
              {events.length > 0 && (
                <span className="ml-2 text-sm font-normal px-2 py-0.5 rounded-full"
                  style={{ background: '#ff00e020', color: '#ff00e0' }}>
                  {events.length}
                </span>
              )}
            </h2>

            {events.length > 0 ? (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
                  {events.slice(0, 4).map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
                {events.length > 4 && (
                  <div style={{ textAlign: 'center', marginTop: 20 }}>
                    <Link to="/"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 24px', borderRadius: 8, border: '1px solid #ff00e0', color: '#ff00e0', fontWeight: 700, fontSize: 13, textDecoration: 'none', background: 'rgba(255,0,224,0.07)', transition: 'all .2s' }}
                      onMouseEnter={e => { e.currentTarget.style.background = '#ff00e0'; e.currentTarget.style.color = '#fff'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,0,224,0.07)'; e.currentTarget.style.color = '#ff00e0'; }}>
                      See More →
                    </Link>
                  </div>
                )}
              </>
            ) : (
              <div className="rounded-xl p-12 text-center" style={{ background: '#1d191e', border: '1px solid #2a2a2a' }}>
                <span style={{ fontSize: '36px', opacity: 0.3 }}>🎉</span>
                <p className="text-gray-500 mt-4">No upcoming events at this venue</p>
              </div>
            )}
          </div>

          {/* Sidebar: Map + Details */}
          <div className="space-y-6">
            {/* Map */}
            <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #2a2a2a' }}>
              <div style={{ height: '260px' }}>
                <iframe
                  title="Venue location"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                  src={mapSrc}
                />
              </div>
              <div className="p-3" style={{ background: '#1d191e' }}>
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <FaMapMarkerAlt style={{ color: '#ff00e0' }} />
                  {venue.address}{venue.city ? `, ${venue.city}` : ''}
                </p>
              </div>
            </div>

            {/* Venue details card */}
            <div className="rounded-xl p-5 space-y-4" style={{ background: '#1d191e', border: '1px solid #2a2a2a' }}>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Venue Details</h3>

              {venue.capacity && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Capacity</span>
                  <span className="text-white font-semibold">{venue.capacity.toLocaleString()}</span>
                </div>
              )}
              {venue.phone && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Phone</span>
                  <span className="text-white">{venue.phone}</span>
                </div>
              )}
              {venue.city && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">City</span>
                  <span className="text-white">{venue.city}</span>
                </div>
              )}
              {venue.latitude && venue.longitude && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Coordinates</span>
                  <span className="text-gray-400 text-xs font-mono">
                    {Number(venue.latitude).toFixed(4)}, {Number(venue.longitude).toFixed(4)}
                  </span>
                </div>
              )}
              {venue.website && (
                <a href={venue.website} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-2 rounded-lg text-sm font-semibold transition-all hover:opacity-80"
                  style={{ background: '#ff00e0', color: '#fff' }}>
                  <FaGlobe /> Visit Website
                </a>
              )}
            </div>

            {/* Hours card */}
            {(venue.weekday_open || venue.weekday_close || venue.weekday_is_24h ||
              venue.saturday_open || venue.saturday_close || venue.saturday_is_24h ||
              venue.sunday_open || venue.sunday_close || venue.sunday_is_24h) && (
              <div className="rounded-xl p-5 space-y-3" style={{ background: '#1d191e', border: '1px solid #2a2a2a' }}>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <span>🕐</span> Hours
                </h3>
                <div className="space-y-2">
                  {[
                    { label: 'Mon – Fri', open: venue.weekday_open,  close: venue.weekday_close,  is24h: venue.weekday_is_24h },
                    { label: 'Saturday',  open: venue.saturday_open, close: venue.saturday_close, is24h: venue.saturday_is_24h },
                    { label: 'Sunday',    open: venue.sunday_open,   close: venue.sunday_close,   is24h: venue.sunday_is_24h },
                  ].map(({ label, open, close, is24h }) => (
                    <div key={label} className="flex justify-between items-center text-sm">
                      <span className="text-gray-500 w-20">{label}</span>
                      {hoursRow(open, close, is24h)}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
