from rest_framework import serializers
from .models import Event, Category, Venue, EventImage, VenueImage
from users.serializers import UserSerializer


class EventImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = EventImage
        fields = ["id", "image", "order", "uploaded_at"]
        read_only_fields = ["id", "uploaded_at"]


class VenueImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = VenueImage
        fields = ["id", "image", "order", "uploaded_at"]
        read_only_fields = ["id", "uploaded_at"]


VENUE_HOUR_FIELDS = [
    "weekday_open", "weekday_close",
    "saturday_open", "saturday_close",
    "sunday_open", "sunday_close",
]


class VenueSerializer(serializers.ModelSerializer):
    images = VenueImageSerializer(many=True, read_only=True)

    class Meta:
        model = Venue
        fields = [
            "id", "name", "address", "city", "latitude", "longitude",
            "website", "phone", "description", "capacity", "image", "images",
            "facebook", "instagram", "twitter", "youtube", "tiktok", "linkedin",
            "weekday_open", "weekday_close", "weekday_is_24h",
            "saturday_open", "saturday_close", "saturday_is_24h",
            "sunday_open", "sunday_close", "sunday_is_24h",
        ]

    def validate(self, attrs):
        # Convert empty strings sent from the frontend to None for TimeFields
        for field in VENUE_HOUR_FIELDS:
            if field in attrs and attrs[field] == "":
                attrs[field] = None
        return attrs


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name", "slug"]


class EventSerializer(serializers.ModelSerializer):
    organizer = UserSerializer(read_only=True)
    category_detail = CategorySerializer(source="category", read_only=True)
    venue_detail = VenueSerializer(source="venue", read_only=True)
    category = serializers.PrimaryKeyRelatedField(queryset=Category.objects.all(), write_only=True, required=False, allow_null=True)
    venue = serializers.PrimaryKeyRelatedField(queryset=Venue.objects.all(), write_only=True, required=False, allow_null=True)
    images = EventImageSerializer(many=True, read_only=True)

    class Meta:
        model = Event
        fields = [
            "id", "title", "description", "date", "end_date",
            "location", "city", "category", "category_detail",
            "venue", "venue_detail", "latitude", "longitude",
            "organizer", "image", "images", "status", "is_featured",
            "organizer_name", "organizer_email", "organizer_phone",
            "website", "view_count", "created_at", "updated_at",
        ]
        read_only_fields = ["id", "organizer", "status", "view_count", "created_at", "updated_at"]

    def create(self, validated_data):
        validated_data["organizer"] = self.context["request"].user
        # Auto-populate lat/lng from venue if available
        if "venue" in validated_data and validated_data["venue"]:
            venue = validated_data["venue"]
            if venue.latitude and venue.longitude:
                validated_data["latitude"] = venue.latitude
                validated_data["longitude"] = venue.longitude
                validated_data["city"] = venue.city
        return super().create(validated_data)


class EventListSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    venue = VenueSerializer(read_only=True)
    organizer_name_display = serializers.SerializerMethodField()
    images = EventImageSerializer(many=True, read_only=True)

    class Meta:
        model = Event
        fields = [
            "id", "title", "date", "location", "city",
            "category", "venue", "image", "images", "is_featured", "status",
            "organizer_name_display", "latitude", "longitude", "view_count"
        ]

    def get_organizer_name_display(self, obj):
        if obj.organizer_name:
            return obj.organizer_name
        return obj.organizer.get_full_name() or obj.organizer.username
