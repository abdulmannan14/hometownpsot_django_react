from django.urls import path
from .views import (
    EventListCreateView,
    EventDetailView,
    MyEventsView,
    EventApproveView,
    EventRejectView,
    CategoryListView,
    VenueListCreateView,
    VenueDetailView,
    EventImageUploadView,
    EventImageDeleteView,
    VenueImageUploadView,
    VenueImageDeleteView,
)
from .views_saved import SavedEventListView, SaveEventView

urlpatterns = [
    path("", EventListCreateView.as_view(), name="event-list-create"),
    path("<int:pk>/", EventDetailView.as_view(), name="event-detail"),
    path("mine/", MyEventsView.as_view(), name="my-events"),
    path("saved/", SavedEventListView.as_view(), name="saved-events"),
    path("<int:event_id>/save/", SaveEventView.as_view(), name="save-event"),
    path("<int:pk>/approve/", EventApproveView.as_view(), name="event-approve"),
    path("<int:pk>/reject/", EventRejectView.as_view(), name="event-reject"),
    path("categories/", CategoryListView.as_view(), name="category-list"),
    path("venues/", VenueListCreateView.as_view(), name="venue-list-create"),
    path("venues/<int:pk>/", VenueDetailView.as_view(), name="venue-detail"),
    path("venues/<int:pk>/images/", VenueImageUploadView.as_view(), name="venue-image-upload"),
    path("venue-images/<int:pk>/", VenueImageDeleteView.as_view(), name="venue-image-delete"),
    path("<int:pk>/images/", EventImageUploadView.as_view(), name="event-image-upload"),
    path("images/<int:pk>/", EventImageDeleteView.as_view(), name="event-image-delete"),
]
