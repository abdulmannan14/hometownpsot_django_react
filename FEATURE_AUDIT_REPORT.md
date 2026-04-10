# HomeTownPost Event Application - Feature Audit & Gap Analysis Report

**Report Date:** April 8, 2026  
**Project:** HomeTownPost - Event-based Web/Mobile Application  
**Analysis Period:** Complete codebase review

---

## Executive Summary

This report analyzes the current implementation status of 13 core features in the HomeTownPost application. The application has a **solid foundation** with most event management features implemented, but is missing several critical user-facing features related to geolocation, saved events, and automated cleanup processes.

**Current Status:**
- ✅ **Fully Implemented:** 8 features
- ⚠️ **Partially Implemented:** 1 feature
- ❌ **Not Implemented:** 4 features

---

## Detailed Feature Analysis

### 1. Homepage Feed

**Status:** ✅ **Fully Implemented**

**Details:**
- **File Location:** [frontend/src/pages/Home.jsx](frontend/src/pages/Home.jsx) & [frontend/src/pages/Landing.jsx](frontend/src/pages/Landing.jsx)
- **Backend:** [backend/events/views.py](backend/events/views.py) - `EventListCreateView`
- **Features:**
  - ✅ Chronological event display (ordered by `date` field)
  - ✅ Featured events section at top
  - ✅ Pagination with "Load More" functionality
  - ✅ Two route options: `/` (Landing page) and `/home` (Home page with filters)

**Missing Parts:**
- ❌ **User-selected radius filtering:**
  - Event model lacks `latitude` and `longitude` fields
  - No geolocation API integration
  - Filters available: search, category, city (text-based location), date range
  - No distance-based sorting

**Implementation Gaps:**
- No frontend geolocation request (navigator.geolocation)
- No backend distance calculation (e.g., using PostGIS or Haversine formula)
- No radius input dropdown in filter UI

**Recommended Next Steps:**
1. Add `latitude` and `longitude` fields to Event model
2. Integrate Google Maps Geolocation API on frontend
3. Add backend distance calculation (PostGIS recommended for Django)
4. Implement radius-based filtering in EventFilters component
5. Add radius dropdown (1mi, 5mi, 10mi, 25mi, etc.)

---

### 2. Event Creation (Frontend)

**Status:** ✅ **Fully Implemented**

**Details:**
- **File Location:** [frontend/src/pages/CreateEvent.jsx](frontend/src/pages/CreateEvent.jsx)
- **Backend:** [backend/events/views.py](backend/events/views.py) - `EventListCreateView` (POST)
- **Features:**
  - ✅ Multi-field form with validation
  - ✅ Image upload (file input with multipart/form-data)
  - ✅ DateTime picker for start/end times
  - ✅ Category selection dropdown
  - ✅ Organizer details (name, email, phone, website)
  - ✅ Form validation with error display
  - ✅ Events saved with `status: 'pending'` (awaiting admin approval)
  - ✅ Redirect to event detail page on success
  - ✅ Protected route (requires authentication)

**Missing Parts:** None

**Implementation Gaps:** None

**Recommended Next Steps:** None required

---

### 3. My Calendar (Saved/Bookmarked Events)

**Status:** ❌ **Not Implemented**

**Details:**
- **Current Implementation:** Dashboard page exists at [frontend/src/pages/Dashboard.jsx](frontend/src/pages/Dashboard.jsx)
- **What It Actually Shows:** User's **created/posted events** (via `/events/mine/` endpoint), NOT saved events
- **Navbar Label:** "My Favorites" - misleading, as this shows created events not bookmarks

**Missing Components:**
- ❌ No `SavedEvent` model linking users to events they've bookmarked
- ❌ No "Save Event" button on event cards
- ❌ No bookmark toggle in EventDetailNew page
- ❌ No API endpoint for saving/unsaving events
- ❌ No persistent bookmark storage

**Database Schema Needed:**
```python
class SavedEvent(models.Model):
    user = ForeignKey(User, on_delete=models.CASCADE, related_name="saved_events")
    event = ForeignKey(Event, on_delete=models.CASCADE)
    saved_at = DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('user', 'event')
```

**API Endpoints Needed:**
- `POST /events/{id}/save/` - Save an event
- `DELETE /events/{id}/save/` - Unsave an event
- `GET /events/saved/` - Get user's saved events

**Recommended Next Steps:**
1. Create `SavedEvent` model in Django
2. Add migrations
3. Create save/unsave API endpoints
4. Add "Save Event" button to EventCard and EventDetailNew components
5. Create separate "My Calendar" section showing saved events
6. Update Dashboard to distinguish between created and saved events
7. Add visual indicator (heart icon) for saved status

---

### 4. Category View

**Status:** ✅ **Fully Implemented**

**Details:**
- **File Location:** [backend/events/views.py](backend/events/views.py) - `CategoryListView`
- **Admin Panel:** [frontend/src/pages/AdminCategories.jsx](frontend/src/pages/AdminCategories.jsx)
- **Features:**
  - ✅ Categories managed in admin panel (create, edit, delete)
  - ✅ Category filtering on main event listings
  - ✅ Categories displayed on event cards as badges
  - ✅ Event detail page shows category
  - ✅ Category search field in admin

**Missing Parts:** 
- ❌ No public-facing "Events by Category" page (users can filter by category but no dedicated page)
- ❌ Category-based URL routing (e.g., `/events/category/nightlife/`)

**Implementation Gaps:**
- No CategoryDetail frontend component

**Recommended Next Steps:**
1. (Optional) Create dedicated category pages for better SEO and UX
2. (Optional) Add category landing pages with filtered events

---

### 5. Venues View

**Status:** ✅ **Fully Implemented**

**Details:**
- **File Location:** [frontend/src/pages/EventsByVenue.jsx](frontend/src/pages/EventsByVenue.jsx)
- **Features:**
  - ✅ Groups events by `location` field (venue name)
  - ✅ Displays venue cards with event count
  - ✅ Shows venue image from any event at that location
  - ✅ Venue click filters home page to show only that venue's events
  - ✅ Proper grouping and sorting (by event count)
  - ✅ Location tags and address display

**Missing Parts:**
- ⚠️ **Distance-based sorting:** Venues not sorted by user proximity (see radius feature gap)
- ⚠️ **Venue data model:** Currently venues are inferred from event locations; no dedicated Venue model exists

**Implementation Gaps:**
- No dedicated Venue model - venues are generated dynamically from Event.location field

**Recommended Next Steps:**
1. (Optional) Create dedicated Venue model if detailed venue info is needed
2. Implement distance sorting once geolocation is added

---

### 6. Event Search Module

**Status:** ⚠️ **Partially Implemented**

**Details:**
- **File Location:** [frontend/src/components/EventFilters.jsx](frontend/src/components/EventFilters.jsx)
- **Backend Filter:** [backend/events/filters.py](backend/events/filters.py) & views.py
- **Search Fields:**
  - ✅ Title search
  - ✅ Description search
  - ✅ Location (venue name) search
  - ✅ City search

**Missing Parts:**
- ❌ **Keyword-based search across multiple fields** - Works but limited to exact backends fields
- ❌ **Advanced search options:**
  - Category-specific search
  - Price range (no price model exists)
  - Organizer name search
- ❌ **Geolocation search** - No radius/distance filtering available

**Implementation Gaps:**
- Only basic text search; no fuzzy matching or full-text search optimization

**Recommended Next Steps:**
1. Implement full-text search on title, description, location
2. Add Organizer name to search fields
3. Implement distance-based search once geolocation is integrated

---

### 7. Venue Sorting by Distance

**Status:** ❌ **Not Implemented**

**Details:**
- **Current Implementation:** Venues display on [frontend/src/pages/EventsByVenue.jsx](frontend/src/pages/EventsByVenue.jsx)
- **Sorting:** Sorted by **event count** (most events first), NOT by distance

**Missing Components:**
- ❌ User geolocation capture
- ❌ Latitude/longitude storage in Event/Venue models
- ❌ Backend distance calculation
- ❌ Frontend distance display
- ❌ Distance-based sorting/filtering

**Recommended Next Steps:**
1. Add geolocation fields to models
2. Implement user geolocation on app load
3. Calculate distance using Haversine formula or PostGIS
4. Display distance on venue cards
5. Sort venues by proximity to user

---

### 8. Event Cards

**Status:** ✅ **Fully Implemented**

**Details:**
- **File Location:** [frontend/src/components/EventCard.jsx](frontend/src/components/EventCard.jsx)
- **Features:**
  - ✅ Title (truncated to 2 lines)
  - ✅ Date & Time (formatted with date-fns)
  - ✅ Location/Venue name
  - ✅ Category badge
  - ✅ Featured badge (if is_featured=true)
  - ✅ Event image with fallback placeholder
  - ✅ Hover effects (image scale-up, title color change)
  - ✅ Click navigation to event detail page
  - ✅ Links as root component (semantic HTML)

**Additional Card Implementations:**
- LandingEventCard in [frontend/src/pages/Landing.jsx](frontend/src/pages/Landing.jsx) - Compact variant with share buttons
- Mini cards in related events section

**Missing Parts:** None

**Implementation Gaps:** None

**Recommended Next Steps:** None required

---

### 9. Search Bar

**Status:** ✅ **Fully Implemented**

**Details:**
- **File Locations:**
  - [frontend/src/components/EventFilters.jsx](frontend/src/components/EventFilters.jsx) - Main search form with filters
  - [frontend/src/components/Navbar.jsx](frontend/src/components/Navbar.jsx) - Navigation search link
- **Features:**
  - ✅ Search input field with icon
  - ✅ Category dropdown filter
  - ✅ Location/City filter
  - ✅ Date range filter (date_from)
  - ✅ Reset button to clear filters
  - ✅ Works across event listings

**Missing Parts:**
- ⚠️ Global search bar in navbar (just navigation links, not search)
- ⚠️ Search suggestions/autocomplete

**Recommended Next Steps:**
1. Add global search bar to navbar for quick search
2. Implement search suggestions/autocomplete

---

### 10. Signup Popup

**Status:** ❌ **Not Implemented**

**Details:**
- **Current State:** No auto-triggered signup popup exists
- **Current Signup Routes:** 
  - [frontend/src/pages/Register.jsx](frontend/src/pages/Register.jsx) - Traditional signup form page
  - Navbar CTA buttons for "Sign Up"
  - Landing page CTA section

**Missing Components:**
- ❌ No modal/popup component
- ❌ No 5-second delay trigger
- ❌ No localStorage flag to prevent repeat showing
- ❌ No logic to check user auth status before showing

**Implementation Requirements:**
```javascript
// Pseudo-code structure needed:
useEffect(() => {
  if (!user && !sessionStorage.getItem("signupPopupShown")) {
    setTimeout(() => {
      setShowSignupPopup(true);
      sessionStorage.setItem("signupPopupShown", true);
    }, 5000);
  }
}, [user]);
```

**Recommended Next Steps:**
1. Create SignupPopup component
2. Add modal styling and animation
3. Implement 5-second trigger logic
4. Add session storage to prevent repeat displays
5. Close button and redirect to /register on signup click

---

### 11. Google Maps Integration

**Status:** ✅ **Fully Implemented (Read-Only)**

**Details:**
- **File Location:** [frontend/src/pages/EventDetailNew.jsx](frontend/src/pages/EventDetailNew.jsx) - Lines 262-278
- **Implementation:** Google Maps Embed API
- **Features:**
  - ✅ Displays interactive map embedded on event detail page
  - ✅ Maps event location from `event.location` + `event.city`
  - ✅ "Open in Maps" link to full Google Maps
  - ✅ Proper iframe restrictions (frameborder, loading)

**Code:**
```jsx
<iframe
  width="100%"
  height="100%"
  frameBorder="0"
  src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyDTfNfCx9x0W9fjVvh_v_p8J4zGaWlwAnA&q=${encodeURIComponent(
    event.location + ', ' + event.city
  )}`}
/>
```

**Missing Parts:**
- ❌ No custom markers
- ❌ No multiple event markers on a map
- ❌ No advanced map features (directions, nearby places)
- ⚠️ **API Key visible in frontend code** - Security concern!

**Implementation Gaps:**
- API key should be proxied through backend
- Hard-coded API key in production code is a security risk

**Recommended Next Steps:**
1. Move API key to backend environment variable
2. Create backend endpoint to proxy map requests
3. Implement multi-marker map for venue pages
4. Add directions feature

---

### 12. Google Address Autofill

**Status:** ❌ **Not Implemented**

**Details:**
- **Current Implementation:** [frontend/src/pages/CreateEvent.jsx](frontend/src/pages/CreateEvent.jsx)
- **Fields:** Manual text inputs:
  - "Venue / Location" (plain text input)
  - "City" (plain text input)

**Missing Components:**
- ❌ Google Places Autocomplete API
- ❌ Address suggestion dropdown
- ❌ Auto-fill city/state based on address
- ❌ Address validation
- ❌ Coordinate extraction

**Implementation Requirements:**
- Google Places API integration
- Separate Input component with autocomplete
- Store selected place ID and coordinates
- Populate coordinates in Event model (currently missing)

**Recommended Next Steps:**
1. Add latitude/longitude fields to Event model
2. Integrate Google Places Autocomplete API
3. Create AddressAutocomplete component
4. Extract and store coordinates from selected place
5. Update EventSerializer to include geographic data

---

### 13. Backend API – Remove Expired Events

**Status:** ❌ **Not Implemented**

**Details:**
- **Current State:** No API endpoint, management command, or cron job exists
- **No deletion logic** for past events
- **Models:** Event date field exists but no archival/deletion process

**Missing Implementation:**
- ❌ Django management command for cleanup
- ❌ Rest API endpoint for manual cleanup
- ❌ Celery task or APScheduler for scheduled cleanup
- ❌ Logic to soft-delete or hard-delete expired events
- ❌ Cron job configuration

**Required Database Logic:**
```python
# Filter logic needed (e.g., in Event manager):
expired_events = Event.objects.filter(
    date__lt=timezone.now(),
    status='approved'
)
```

**Implementation Options:**
1. **Management Command** (simplest):
   ```bash
   python manage.py remove_expired_events
   ```
2. **Celery Task** (for periodic execution):
   ```python
   @periodic_task(run_every=crontab(hour=0, minute=0))
   def cleanup_expired_events():
       # deletion logic
   ```
3. **API Endpoint** (manual admin trigger):
   ```
   POST /admin/events/cleanup/
   ```

**Recommended Next Steps:**
1. Create Django management command
2. Implement soft-delete or archival (safer than hard-delete)
3. Add `is_archived` Boolean field to Event model (optional but recommended)
4. Set up Celery + Beat for automatic daily cleanup at 12 AM UTC
5. Add cleanup stats to admin dashboard
6. Create API endpoint for manual cleanup with logging
7. Add email notification to organizers before deletion

---

## Summary Table

| Feature | Status | File Location | Priority |
|---------|--------|---------------|----------|
| Homepage Feed | ✅ | Home.jsx, Landing.jsx | - |
| Event Creation | ✅ | CreateEvent.jsx | - |
| My Calendar | ❌ | N/A | 🔴 HIGH |
| Category View | ✅ | AdminCategories.jsx | - |
| Venues View | ✅ | EventsByVenue.jsx | - |
| Event Search | ⚠️ | EventFilters.jsx | 🟡 MEDIUM |
| Venue Sorting by Distance | ❌ | N/A | 🟡 MEDIUM |
| Event Cards | ✅ | EventCard.jsx | - |
| Search Bar | ✅ | EventFilters.jsx, Navbar.jsx | - |
| Signup Popup | ❌ | N/A | 🟡 MEDIUM |
| Google Maps | ✅ | EventDetailNew.jsx | - |
| Google Address Autofill | ❌ | CreateEvent.jsx | 🔴 HIGH |
| Remove Expired Events API | ❌ | N/A | 🔴 HIGH |

---

## Priority Development Roadmap

### Phase 1: Critical Features (2-3 weeks)
1. **My Calendar / Saved Events** - High user value
2. **Google Address Autofill** - Better UX for event creation
3. **Remove Expired Events** - Data integrity & operational necessity

### Phase 2: Core Enhancements (2-3 weeks)
1. **Geolocation & Radius Filtering** - Geographic feature set
2. **Venue Sorting by Distance** - Location-aware UX
3. **Advanced Search** - Better discoverability

### Phase 3: Polish & Optimization (1-2 weeks)
1. **Signup Popup** - User conversion
2. **Search Bar Enhancements** - Autocomplete
3. **Map Improvements** - Multi-marker support

---

## Technical Debt & Security Issues

### 🔴 Critical

1. **Google Maps API Key Exposed** in frontend code
   - **File:** EventDetailNew.jsx, line 263
   - **Risk:** API key in production source code is a major security vulnerability
   - **Fix:** Move to backend proxy endpoint with environment variable

2. **No Saved Events Model**
   - Required for My Calendar feature
   - Needs database migration and API redesign

### 🟡 Medium

1. **Geolocation Data Missing**
   - No latitude/longitude fields in Event model
   - Blocks distance-based features

2. **No Address Validation**
   - User can enter invalid addresses
   - No coordinate extraction

3. **No Event Expiration Handling**
   - Old events remain in database indefinitely
   - Could impact search performance over time

---

## Notes for Development Team

### Backend Improvements Needed
- Add geolocation fields to Event model
- Create SavedEvent model for bookmarks
- Implement distance calculation utilities
- Add management command for cleanup
- Create API endpoints for saved events
- Add proper logging for all admin operations

### Frontend Improvements Needed
- Create SaveEvent/Bookmark component
- Implement geolocation permission handling
- Add Google Places Autocomplete
- Create SignupPopup modal
- Add distance display on cards
- Improve search experience

### DevOps/Infrastructure
- Set up environment variables for API keys
- Configure Celery + Beat for scheduled tasks
- Add monitoring for expired events cleanup
- Create backup strategy before bulk deletions

---

## Questions for Product Owner

1. Should expired events be **hard-deleted**, **soft-deleted**, or **archived**?
2. Should users be **notified** before their event is deleted/archived?
3. What is the **minimum event date threshold** for expiration (e.g., end_date < now)?
4. Should **My Calendar** include shared/attended events or just bookmarks?
5. What **radius options** should users see (1, 5, 10, 25, custom)?

---

**Report Generated:** April 8, 2026  
**Reviewed By:** AI Code Audit System  
**Next Review Date:** Upon completion of Phase 1 features
