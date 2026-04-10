from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import SavedEvent, Event
from .serializers_saved import SavedEventSerializer


class SavedEventListView(generics.ListAPIView):
    serializer_class = SavedEventSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return (
            SavedEvent.objects
            .filter(user=self.request.user)
            .select_related('event', 'event__category', 'event__venue', 'event__organizer')
            .prefetch_related('event__images')
        )


class SaveEventView(APIView):
    """
    POST  → toggle: saves if not saved, unsaves if already saved.
    Returns { saved: true/false } so the frontend always knows the new state.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, event_id):
        event = Event.objects.filter(pk=event_id).first()
        if not event:
            return Response({'detail': 'Event not found.'}, status=status.HTTP_404_NOT_FOUND)

        existing = SavedEvent.objects.filter(user=request.user, event=event).first()
        if existing:
            existing.delete()
            return Response({'saved': False}, status=status.HTTP_200_OK)
        else:
            SavedEvent.objects.create(user=request.user, event=event)
            return Response({'saved': True}, status=status.HTTP_201_CREATED)

    # Keep DELETE for backward-compat but it just delegates to POST logic
    def delete(self, request, event_id):
        event = Event.objects.filter(pk=event_id).first()
        if not event:
            return Response({'detail': 'Event not found.'}, status=status.HTTP_404_NOT_FOUND)
        SavedEvent.objects.filter(user=request.user, event=event).delete()
        return Response({'saved': False}, status=status.HTTP_200_OK)
