from django.contrib import admin
from .models import Event, Category, Venue, SavedEvent


@admin.register(Venue)
class VenueAdmin(admin.ModelAdmin):
    list_display = ["name", "city", "address", "phone", "capacity"]
    list_filter = ["city"]
    search_fields = ["name", "city", "address"]
    ordering = ["city", "name"]


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ["name", "slug"]
    prepopulated_fields = {"slug": ("name",)}


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ["title", "organizer", "date", "location", "venue", "category", "status", "is_featured"]
    list_filter = ["status", "is_featured", "category", "venue"]
    search_fields = ["title", "location", "city", "organizer__email"]
    ordering = ["-created_at"]
    actions = ["approve_events", "reject_events", "feature_events"]

    def approve_events(self, request, queryset):
        queryset.update(status=Event.STATUS_APPROVED)
    approve_events.short_description = "Approve selected events"

    def reject_events(self, request, queryset):
        queryset.update(status=Event.STATUS_REJECTED)
    reject_events.short_description = "Reject selected events"

    def feature_events(self, request, queryset):
        queryset.update(is_featured=True)
    feature_events.short_description = "Mark as featured"


@admin.register(SavedEvent)
class SavedEventAdmin(admin.ModelAdmin):
    list_display = ["user", "event", "saved_at"]
    list_filter = ["saved_at"]
    search_fields = ["user__username", "event__title"]
    ordering = ["-saved_at"]
