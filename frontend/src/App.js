import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { FavoritesProvider } from "./context/FavoritesContext";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminLogin from "./pages/AdminLogin";
import EventDetailNew from "./pages/EventDetailNew";
import CreateEvent from "./pages/CreateEvent";
import EditEvent from "./pages/EditEvent";
import Dashboard from "./pages/Dashboard";
import EventsByVenue from "./pages/EventsByVenue";
import VenueDetail from "./pages/VenueDetail";
import AdminDashboard from "./pages/AdminDashboard";
import AdminEvents from "./pages/AdminEvents";
import AdminVenues from "./pages/AdminVenues";
import AdminUsers from "./pages/AdminUsers";
import AdminCategories from "./pages/AdminCategories";
import AdminExpiredEvents from "./pages/AdminExpiredEvents";
import RegisterPopup from "./components/RegisterPopup";

function Footer() {
  return (
    <footer style={{ background: "#0a0a0a", borderTop: "1px solid #2a2a2a" }} className="mt-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
          {/* Brand */}
          <div>
            <div className="text-white font-bold text-xl tracking-wide mb-3">
              Hometown<span style={{ color: "#ff00e0" }}>Post</span>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed">
              Local Event Listings &amp; Poster Art.<br />
              Discover what's happening in your community.
            </p>
            <div className="flex gap-3 mt-5">
              <a href="#!" className="w-9 h-9 rounded-full flex items-center justify-center transition-colors"
                style={{ background: "#252525" }}
                onMouseEnter={e => e.currentTarget.style.background = "#ff00e0"}
                onMouseLeave={e => e.currentTarget.style.background = "#252525"}>
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Navigation</h4>
            <ul className="space-y-2">
              {[
                { to: "/", label: "Event Listings" },
                { to: "/events/new", label: "Promote your Event" },
                { to: "/dashboard", label: "My Events" },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} className="text-sm text-gray-500 transition-colors hover:text-[#ff00e0]">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* CTA */}
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Get Started</h4>
            <p className="text-gray-500 text-sm mb-4">
              Have an event? Reach your local audience today.
            </p>
            <Link to="/events/new"
              className="inline-flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-md transition-all"
              style={{ background: "#ff00e0", color: "#fff" }}
              onMouseEnter={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#ff00e0"; e.currentTarget.style.outline = "2px solid #ff00e0"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "#ff00e0"; e.currentTarget.style.color = "#fff"; e.currentTarget.style.outline = "none"; }}>
              Signup Here →
            </Link>
          </div>
        </div>

        <div style={{ borderTop: "1px solid #2a2a2a" }} className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-600">&copy; {new Date().getFullYear()} HomeTownPost Events. All rights reserved.</p>
          <div className="flex gap-5">
            <a href="#!" className="text-xs text-gray-600 hover:text-[#ff00e0] transition-colors">Privacy Policy</a>
            <a href="#!" className="text-xs text-gray-600 hover:text-[#ff00e0] transition-colors">Terms of Use</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

function AppContent() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#191919" }}>
      {!isAdminRoute && <Navbar />}
      {!isAdminRoute && <RegisterPopup />}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/events/venues" element={<EventsByVenue />} />
          <Route path="/venues/:id" element={<VenueDetail />} />
          <Route path="/events/:id" element={<EventDetailNew />} />
          <Route path="/events/new" element={<ProtectedRoute><CreateEvent /></ProtectedRoute>} />
          <Route path="/events/:id/edit" element={<ProtectedRoute><EditEvent /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/admin/events" element={<AdminRoute><AdminEvents /></AdminRoute>} />
          <Route path="/admin/venues" element={<AdminRoute><AdminVenues /></AdminRoute>} />
          <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
          <Route path="/admin/categories" element={<AdminRoute><AdminCategories /></AdminRoute>} />
          <Route path="/admin/expired" element={<AdminRoute><AdminExpiredEvents /></AdminRoute>} />
        </Routes>
      </main>
      {!isAdminRoute && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <FavoritesProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </FavoritesProvider>
    </AuthProvider>
  );
}