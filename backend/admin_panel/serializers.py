from rest_framework import serializers
from events.models import Event, Category
from users.models import User


class AdminEventSerializer(serializers.ModelSerializer):
    organizer_email = serializers.EmailField(source="organizer.email", read_only=True)
    organizer_username = serializers.CharField(source="organizer.username", read_only=True)
    category_name = serializers.CharField(source="category.name", read_only=True)

    class Meta:
        model = Event
        fields = [
            "id", "title", "description", "date", "end_date",
            "location", "city", "category", "category_name",
            "organizer", "organizer_username", "organizer_email",
            "image", "status", "is_featured",
            "organizer_name", "organizer_phone",
            "website", "view_count", "created_at", "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class AdminUserSerializer(serializers.ModelSerializer):
    total_events = serializers.SerializerMethodField()
    approved_events = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id", "username", "email", "role", "is_active",
            "is_staff", "bio", "avatar", "date_joined",
            "total_events", "approved_events",
        ]
        read_only_fields = ["id", "date_joined"]

    def get_total_events(self, obj):
        return obj.events.count()

    def get_approved_events(self, obj):
        return obj.events.filter(status=Event.STATUS_APPROVED).count()


class AdminCategorySerializer(serializers.ModelSerializer):
    event_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ["id", "name", "slug", "event_count"]

    def get_event_count(self, obj):
        return obj.events.count()


class AdminDashboardSerializer(serializers.Serializer):
    total_events = serializers.IntegerField()
    pending_events = serializers.IntegerField()
    approved_events = serializers.IntegerField()
    rejected_events = serializers.IntegerField()
    total_users = serializers.IntegerField()
    active_users = serializers.IntegerField()
    total_categories = serializers.IntegerField()
    featured_events = serializers.IntegerField()
