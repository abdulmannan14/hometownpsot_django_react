from django.urls import path
from .views import (
    AdminDashboardView,
    AdminEventListView,
    AdminEventDetailView,
    AdminEventApproveView,
    AdminEventRejectView,
    AdminEventFeatureView,
    AdminEventStatisticsView,
    AdminEventBulkActionView,
    AdminUserListView,
    AdminUserDetailView,
    AdminUserDeactivateView,
    AdminCategoryListView,
    AdminCategoryDetailView,
    ExpiredEventsView,
)

app_name = "admin_panel"

urlpatterns = [
    # Dashboard
    path("dashboard/", AdminDashboardView.as_view(), name="dashboard"),
    
    # Events
    path("events/", AdminEventListView.as_view(), name="event-list"),
    path("events/<int:pk>/", AdminEventDetailView.as_view(), name="event-detail"),
    path("events/<int:pk>/approve/", AdminEventApproveView.as_view(), name="event-approve"),
    path("events/<int:pk>/reject/", AdminEventRejectView.as_view(), name="event-reject"),
    path("events/<int:pk>/feature/", AdminEventFeatureView.as_view(), name="event-feature"),
    path("events/bulk/", AdminEventBulkActionView.as_view(), name="events-bulk"),
    path("events/expired/", ExpiredEventsView.as_view(), name="events-expired"),
    path("events/statistics/", AdminEventStatisticsView.as_view(), name="event-statistics"),
    
    # Users
    path("users/", AdminUserListView.as_view(), name="user-list"),
    path("users/<int:pk>/", AdminUserDetailView.as_view(), name="user-detail"),
    path("users/<int:pk>/deactivate/", AdminUserDeactivateView.as_view(), name="user-deactivate"),
    
    # Categories
    path("categories/", AdminCategoryListView.as_view(), name="category-list"),
    path("categories/<int:pk>/", AdminCategoryDetailView.as_view(), name="category-detail"),
]
