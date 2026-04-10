import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaMapPin, FaClock, FaCalendar, FaPhone, FaGlobe, FaFacebook, FaTwitter, FaWhatsapp, FaLink, FaCheck, FaHeart, FaStar } from 'react-icons/fa';
import api from '../api/axios';
import EventCard from '../components/EventCard';
import { useFavorites } from '../context/FavoritesContext';

export default function EventDetailNew() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [relatedEvents, setRelatedEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const { isSaved, toggle } = useFavorites();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        const response = await api.get(`/events/${id}/`);
        setEvent(response.data);

        // Fetch related events in the same category - limit to 20
        const relatedResponse = await api.get('/events/', {
          params: { category: response.data.category, limit: 20 }
        });
        setRelatedEvents((relatedResponse.data.results || relatedResponse.data).filter(evt => evt.id !== id));
      } catch (error) {
        console.error('Failed to fetch event:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEventDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#191919' }}>
        <p className="text-gray-400">Loading event details...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#191919' }}>
        <p className="text-gray-400">Event not found</p>
      </div>
    );
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = (platform) => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(event.title);
    const shares = {
      facebook:  `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      twitter:   `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
      whatsapp:  `https://wa.me/?text=${text}%20${url}`,
    };
    window.open(shares[platform], '_blank', 'noopener,noreferrer');
  };

  const resolveUrl = (url) =>
    url ? (url.startsWith('http') ? url : `http://localhost:8000${url}`) : null;

  // Main image + gallery images combined
  const images = [
    ...(event.image ? [resolveUrl(event.image)] : []),
    ...((event.images || []).map((img) => resolveUrl(img.image))),
  ];
  if (images.length === 0) images.push('https://via.placeholder.com/800x600?text=No+Image');

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div style={{ background: '#191919' }} className="min-h-screen pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid #2a2a2a', background: '#191919' }}>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-300 hover:text-[#ff00e0] transition-colors"
        >
          <FaArrowLeft /> Back
        </button>

        <div className="flex items-center gap-3">
          {event.is_featured && (
            <div className="flex items-center gap-1 px-3 py-1 rounded-full" style={{ background: '#ff00e0', color: '#fff' }}>
              <FaStar size={12} />
              <span className="text-xs font-semibold">FEATURED</span>
            </div>
          )}
          {/* Favourite button */}
          <button
            onClick={() => toggle(Number(id))}
            title={isSaved(Number(id)) ? "Remove from favorites" : "Save to favorites"}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '7px 14px', borderRadius: '20px', border: 'none', cursor: 'pointer',
              background: isSaved(Number(id)) ? '#ff00e0' : 'rgba(255,0,224,0.1)',
              color: isSaved(Number(id)) ? '#fff' : '#ff00e0',
              fontWeight: 600, fontSize: '13px',
              transition: 'background 0.2s',
            }}
          >
            <FaHeart size={13} />
            {isSaved(Number(id)) ? 'Saved' : 'Save'}
          </button>
        </div>
      </div>

      {/* Hero Title */}
      <div className="px-6 py-8 max-w-7xl mx-auto">
        <h1 className="text-5xl font-bold text-white mb-4">{event.title}</h1>
        <div className="flex items-center gap-3">
          <span
            style={{ background: '#ff00e0' }}
            className="px-3 py-1 text-xs font-bold text-white rounded-md uppercase"
          >
            {event.category}
          </span>
          <p className="text-gray-400">{event.location}</p>
        </div>
      </div>

      {/* Main 2-Column Layout */}
      <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* LEFT SIDE - Images and Description */}
        <div className="lg:col-span-2">
          {/* Photo Gallery */}
          <div className="mb-8">
            <div className="relative rounded-lg overflow-hidden" style={{ background: '#1a1a1a', height: '400px' }}>
              <img
                src={images[currentImageIndex]}
                alt={event.title}
                className="w-full h-full object-cover"
              />
              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-3 rounded-full transition-all"
                  >
                    ←
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-3 rounded-full transition-all"
                  >
                    →
                  </button>
                </>
              )}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                {images.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      idx === currentImageIndex ? 'bg-[#ff00e0] w-6' : 'bg-gray-600'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Photo grid - shown below main image when gallery exists */}
            {images.length > 1 && (
              <div className="mt-2">
                <h3 className="text-white font-bold text-lg mb-3">Photos</h3>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '6px',
                }}>
                  {images.map((img, idx) => (
                    <div
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      style={{
                        aspectRatio: '1 / 1',
                        overflow: 'hidden',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        border: idx === currentImageIndex ? '2px solid #ff00e0' : '2px solid transparent',
                        transition: 'border-color 0.2s',
                      }}
                    >
                      <img
                        src={img}
                        alt=""
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          display: 'block',
                          transition: 'transform 0.25s',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.06)')}
                        onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Description Section */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">About This Event</h2>
            <p className="text-gray-400 leading-relaxed">{event.description}</p>
          </div>
        </div>

        {/* RIGHT SIDE - All Details */}
        <div className="lg:col-span-1">
          {/* Event Details Card */}
          <div
            className="rounded-lg p-6 mb-6"
            style={{ background: '#222222', border: '1px solid #333' }}
          >
            <h3 className="text-lg font-bold text-white mb-6">Event Details</h3>
            <div className="space-y-4">
              <div className="flex gap-3">
                <FaCalendar size={20} style={{ color: '#ff00e0' }} className="flex-shrink-0" />
                <div>
                  <p className="text-gray-500 text-xs">Date</p>
                  <p className="text-white font-semibold text-sm">
                    {new Date(event.date).toLocaleDateString('en-US', {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
              {event.time && (
                <div className="flex gap-3">
                  <FaClock size={20} style={{ color: '#ff00e0' }} className="flex-shrink-0" />
                  <div>
                    <p className="text-gray-500 text-xs">Time</p>
                    <p className="text-white font-semibold text-sm">{event.time}</p>
                  </div>
                </div>
              )}
              <div className="flex gap-3">
                <FaMapPin size={20} style={{ color: '#ff00e0' }} className="flex-shrink-0" />
                <div>
                  <p className="text-gray-500 text-xs">Location</p>
                  <p className="text-white font-semibold text-sm">{event.location}</p>
                </div>
              </div>
              {event.city && (
                <div className="flex gap-3">
                  <span style={{ color: '#ff00e0' }} className="text-lg">🏙️</span>
                  <div>
                    <p className="text-gray-500 text-xs">City</p>
                    <p className="text-white font-semibold text-sm">{event.city}</p>
                  </div>
                </div>
              )}
              <div className="flex gap-3">
                <span style={{ color: '#ff00e0' }} className="text-lg">👁</span>
                <div>
                  <p className="text-gray-500 text-xs">Views</p>
                  <p className="text-white font-semibold text-sm">{event.view_count ?? 0}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Organizer Details */}
          <div
            className="rounded-lg p-6 mb-6"
            style={{ background: '#222222', border: '1px solid #333' }}
          >
            <h3 className="text-lg font-bold text-white mb-4">Organizer</h3>
            <div className="space-y-3">
              <div>
                <p className="text-gray-500 text-xs">Name</p>
                <p className="text-white font-semibold text-sm">{event.organizer_name || 'N/A'}</p>
              </div>
              {event.organizer_email && (
                <div>
                  <p className="text-gray-500 text-xs">Email</p>
                  <a
                    href={`mailto:${event.organizer_email}`}
                    className="text-[#ff00e0] hover:underline font-semibold text-sm"
                  >
                    {event.organizer_email}
                  </a>
                </div>
              )}
              {event.organizer_phone && (
                <div>
                  <p className="text-gray-500 text-xs">Phone</p>
                  <a
                    href={`tel:${event.organizer_phone}`}
                    className="text-[#ff00e0] hover:underline font-semibold flex items-center gap-2 text-sm"
                  >
                    <FaPhone size={14} />
                    {event.organizer_phone}
                  </a>
                </div>
              )}
              {event.website && (
                <div>
                  <p className="text-gray-500 text-xs">Website</p>
                  <a
                    href={event.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#ff00e0] hover:underline font-semibold flex items-center gap-2 text-sm truncate"
                  >
                    <FaGlobe size={14} />
                    Visit Website
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Venue Map */}
          <div
            className="rounded-lg p-6 mb-6 overflow-hidden"
            style={{ background: '#222222', border: '1px solid #333' }}
          >
            <h3 className="text-lg font-bold text-white mb-4">Venue Map</h3>
            <div className="relative rounded-lg overflow-hidden" style={{ height: '250px' }}>
              <iframe
                width="100%"
                height="100%"
                style={{ border: 0 }}
                src={
                  event.latitude && event.longitude
                    ? `https://www.google.com/maps/embed/v1/place?key=AIzaSyCGqJe_MpsYcdtPljKugcBG_-X5LpftnrA&q=${event.latitude},${event.longitude}&zoom=15`
                    : `https://www.google.com/maps/embed/v1/place?key=AIzaSyCGqJe_MpsYcdtPljKugcBG_-X5LpftnrA&q=${encodeURIComponent(event.location + ', ' + event.city)}`
                }
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            <a
              href={`https://www.google.com/maps/search/${encodeURIComponent(
                event.location + ', ' + event.city
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-[#ff00e0] hover:underline font-semibold text-sm mt-3"
            >
              Open in Maps →
            </a>
          </div>

          {/* Share Section */}
          <div
            className="rounded-lg p-6 mb-6"
            style={{ background: '#222222', border: '1px solid #333' }}
          >
            <h3 className="text-lg font-bold text-white mb-4">Share This Event</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { platform: 'facebook', icon: <FaFacebook size={15} />, label: 'Share on Facebook',  color: '#1877f2' },
                { platform: 'twitter',  icon: <FaTwitter  size={15} />, label: 'Share on X',         color: '#e7e9ea' },
                { platform: 'whatsapp', icon: <FaWhatsapp size={15} />, label: 'Share on WhatsApp',  color: '#25d366' },
              ].map(({ platform, icon, label, color }) => (
                <button
                  key={platform}
                  onClick={() => handleShare(platform)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    width: '100%', padding: '9px 14px', borderRadius: '8px',
                    border: '1px solid #2a2a2a', background: '#1a1a1a',
                    color: '#ccc', fontSize: '13px', fontWeight: 500,
                    cursor: 'pointer', transition: 'border-color .2s, color .2s',
                    fontFamily: 'Poppins, sans-serif',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = color; e.currentTarget.style.color = color; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#2a2a2a'; e.currentTarget.style.color = '#ccc'; }}
                >
                  <span style={{ color }}>{icon}</span>
                  {label}
                </button>
              ))}

              {/* Copy link */}
              <button
                onClick={handleCopyLink}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  width: '100%', padding: '9px 14px', borderRadius: '8px',
                  border: copied ? '1px solid #00ff64' : '1px solid #2a2a2a',
                  background: copied ? 'rgba(0,255,100,0.07)' : '#1a1a1a',
                  color: copied ? '#00ff64' : '#ccc', fontSize: '13px', fontWeight: 500,
                  cursor: 'pointer', transition: 'all .2s',
                  fontFamily: 'Poppins, sans-serif',
                }}
              >
                {copied
                  ? <><FaCheck size={13} style={{ color: '#00ff64' }} /> Link Copied!</>
                  : <><FaLink  size={13} style={{ color: '#ff00e0' }} /> Copy Link</>
                }
              </button>
            </div>
          </div>

          {/* Status Badge */}
          <div
            className="rounded-lg p-6"
            style={{ background: '#222222', border: '1px solid #333' }}
          >
            <p className="text-gray-500 text-xs mb-2">Status</p>
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{
                  background:
                    event.status === 'approved'
                      ? '#10b981'
                      : event.status === 'rejected'
                      ? '#ef4444'
                      : '#f59e0b'
                }}
              />
              <p className="text-white font-semibold capitalize text-sm">{event.status}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Related Events */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-white mb-8">More Events in {event.category}</h2>
        {relatedEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedEvents.slice(0, 20).map((evt) => (
              <EventCard key={evt.id} event={evt} />
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-center py-8">No related events found.</p>
        )}
      </div>
    </div>
  );
}