from django.db import models
from django.conf import settings


class Venue(models.Model):
    """Event venues with location data"""
    name = models.CharField(max_length=255, unique=True)
    address = models.TextField()
    city = models.CharField(max_length=100)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    website = models.URLField(blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    capacity = models.IntegerField(blank=True, null=True)
    image = models.ImageField(upload_to="venues/", blank=True, null=True)
    # Social media
    facebook = models.URLField(blank=True, null=True)
    instagram = models.URLField(blank=True, null=True)
    twitter = models.URLField(blank=True, null=True)
    youtube = models.URLField(blank=True, null=True)
    tiktok = models.URLField(blank=True, null=True)
    linkedin = models.URLField(blank=True, null=True)
    # Operational hours
    weekday_open = models.TimeField(null=True, blank=True)
    weekday_close = models.TimeField(null=True, blank=True)
    weekday_is_24h = models.BooleanField(default=False)
    saturday_open = models.TimeField(null=True, blank=True)
    saturday_close = models.TimeField(null=True, blank=True)
    saturday_is_24h = models.BooleanField(default=False)
    sunday_open = models.TimeField(null=True, blank=True)
    sunday_close = models.TimeField(null=True, blank=True)
    sunday_is_24h = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["city", "name"]
        unique_together = ("name", "city")

    def __str__(self):
        return f"{self.name}, {self.city}"


class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(unique=True)

    class Meta:
        verbose_name_plural = "categories"
        ordering = ["name"]

    def __str__(self):
        return self.name


class Event(models.Model):
    STATUS_PENDING = "pending"
    STATUS_APPROVED = "approved"
    STATUS_REJECTED = "rejected"

    STATUS_CHOICES = [
        (STATUS_PENDING, "Pending"),
        (STATUS_APPROVED, "Approved"),
        (STATUS_REJECTED, "Rejected"),
    ]

    title = models.CharField(max_length=255)
    description = models.TextField()
    date = models.DateTimeField()
    end_date = models.DateTimeField(blank=True, null=True)
    location = models.CharField(max_length=255)
    city = models.CharField(max_length=100, blank=True)
    venue = models.ForeignKey(Venue, on_delete=models.SET_NULL, null=True, blank=True, related_name="events")
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, related_name="events")
    organizer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="events")
    image = models.ImageField(upload_to="events/", blank=True, null=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default=STATUS_PENDING)
    is_featured = models.BooleanField(default=False)
    organizer_name = models.CharField(max_length=255, blank=True)
    organizer_email = models.EmailField(blank=True)
    organizer_phone = models.CharField(max_length=20, blank=True)
    website = models.URLField(blank=True)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    is_archived = models.BooleanField(default=False)
    view_count = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["date"]

    def __str__(self):
        return self.title


class EventImage(models.Model):
    """Additional images for an event"""
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name="images")
    image = models.ImageField(upload_to="events/gallery/")
    order = models.PositiveIntegerField(default=0)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["order", "uploaded_at"]

    def __str__(self):
        return f"Image for {self.event.title} (#{self.order})"


class VenueImage(models.Model):
    """Additional images for a venue"""
    venue = models.ForeignKey(Venue, on_delete=models.CASCADE, related_name="images")
    image = models.ImageField(upload_to="venues/gallery/")
    order = models.PositiveIntegerField(default=0)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["order", "uploaded_at"]

    def __str__(self):
        return f"Image for {self.venue.name} (#{self.order})"


class SavedEvent(models.Model):
    """User bookmarked events for their calendar"""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="saved_events")
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name="saved_by_users")
    saved_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'event')
        ordering = ['-saved_at']

    def __str__(self):
        return f"{self.user.username} saved {self.event.title}"
