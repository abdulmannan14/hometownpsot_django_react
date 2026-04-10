from rest_framework import serializers
from .models import SavedEvent
from .serializers import EventListSerializer

class SavedEventSerializer(serializers.ModelSerializer):
    event = EventListSerializer(read_only=True)
    event_id = serializers.PrimaryKeyRelatedField(queryset=SavedEvent.objects.all(), source='event', write_only=True)

    class Meta:
        model = SavedEvent
        fields = ['id', 'event', 'event_id', 'saved_at']
        read_only_fields = ['id', 'event', 'saved_at']
