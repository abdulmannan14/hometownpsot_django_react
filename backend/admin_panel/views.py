from rest_framework import generics, permissions, status, filters
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.pagination import PageNumberPagination
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q
from django.utils import timezone

from events.models import Event, Category
from users.models import User
from .serializers import (
    AdminEventSerializer,
    AdminUserSerializer,
    AdminCategorySerializer,
    AdminDashboardSerializer,
)


class AdminPermission(permissions.BasePermission):
    """Only admins can access admin endpoints"""
    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            (request.user.is_staff or request.user.role == User.ROLE_ADMIN)
        )


class AdminDashboardView(APIView):
    permission_classes = [AdminPermission]

    def get(self, request):
        stats = {
            "total_events": Event.objects.count(),
            "pending_events": Event.objects.filter(status=Event.STATUS_PENDING).count(),
            "approved_events": Event.objects.filter(status=Event.STATUS_APPROVED).count(),
            "rejected_events": Event.objects.filter(status=Event.STATUS_REJECTED).count(),
            "total_users": User.objects.count(),
            "active_users": User.objects.filter(is_active=True).count(),
            "total_categories": Category.objects.count(),
            "featured_events": Event.objects.filter(is_featured=True).count(),
        }
        serializer = AdminDashboardSerializer(stats)
        return Response(serializer.data)


class AdminEventListView(generics.ListAPIView):
    queryset = Event.objects.select_related("organizer", "category").all()
    serializer_class = AdminEventSerializer
    permission_classes = [AdminPermission]
    pagination_class = PageNumberPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["status", "is_featured", "category"]
    search_fields = ["title", "location", "city", "organizer__email"]
    ordering_fields = ["date", "created_at"]
    ordering = ["-created_at"]


class AdminEventDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Event.objects.select_related("organizer", "category").all()
    serializer_class = AdminEventSerializer
    permission_classes = [AdminPermission]


class AdminEventApproveView(APIView):
    permission_classes = [AdminPermission]

    def post(self, request, pk):
        try:
            event = Event.objects.get(pk=pk)
        except Event.DoesNotExist:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        
        event.status = Event.STATUS_APPROVED
        event.save()
        serializer = AdminEventSerializer(event)
        return Response(serializer.data)


class AdminEventRejectView(APIView):
    permission_classes = [AdminPermission]

    def post(self, request, pk):
        try:
            event = Event.objects.get(pk=pk)
        except Event.DoesNotExist:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        
        event.status = Event.STATUS_REJECTED
        event.save()
        serializer = AdminEventSerializer(event)
        return Response(serializer.data)


class AdminEventFeatureView(APIView):
    permission_classes = [AdminPermission]

    def post(self, request, pk):
        try:
            event = Event.objects.get(pk=pk)
            event.is_featured = not event.is_featured
            event.save()
            serializer = AdminEventSerializer(event)
            return Response(serializer.data)
        except Event.DoesNotExist:
            return Response({"detail": "Event not found."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"detail": f"Failed to update event: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)


class AdminUserListView(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = AdminUserSerializer
    permission_classes = [AdminPermission]
    pagination_class = PageNumberPagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["username", "email"]
    ordering_fields = ["date_joined", "email"]
    ordering = ["-date_joined"]


class AdminUserDetailView(generics.RetrieveUpdateAPIView):
    queryset = User.objects.all()
    serializer_class = AdminUserSerializer
    permission_classes = [AdminPermission]


class AdminUserDeactivateView(APIView):
    permission_classes = [AdminPermission]

    def post(self, request, pk):
        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        
        user.is_active = not user.is_active
        user.save()
        return Response({
            "id": user.id,
            "username": user.username,
            "is_active": user.is_active,
        })


class AdminCategoryListView(generics.ListCreateAPIView):
    queryset = Category.objects.all()
    serializer_class = AdminCategorySerializer
    permission_classes = [AdminPermission]


class AdminCategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Category.objects.all()
    serializer_class = AdminCategorySerializer
    permission_classes = [AdminPermission]


class AdminEventStatisticsView(APIView):
    permission_classes = [AdminPermission]

    def get(self, request):
        stats = {
            "events_by_status": {
                "pending": Event.objects.filter(status=Event.STATUS_PENDING).count(),
                "approved": Event.objects.filter(status=Event.STATUS_APPROVED).count(),
                "rejected": Event.objects.filter(status=Event.STATUS_REJECTED).count(),
            },
            "events_by_category": Event.objects.values("category__name").annotate(
                count=__import__("django.db.models", fromlist=["Count"]).Count("id")
            ).order_by("-count"),
            "top_organizers": User.objects.annotate(
                event_count=__import__("django.db.models", fromlist=["Count"]).Count("events")
            ).order_by("-event_count")[:5].values("id", "username", "email", "event_count"),
        }
        
        from django.db.models import Count
        stats["events_by_category"] = list(
            Event.objects.values("category__name").annotate(count=Count("id")).order_by("-count")
        )
        stats["top_organizers"] = list(
            User.objects.annotate(event_count=Count("events")).order_by("-event_count")[:5]
            .values("id", "username", "email", "event_count")
        )
        
        return Response(stats)


class AdminEventBulkActionView(APIView):
    """
    POST /api/admin/events/bulk/
    Body: { "action": "approve"|"reject"|"delete", "ids": [1, 2, 3] }
    """
    permission_classes = [AdminPermission]

    def post(self, request):
        action = request.data.get("action")
        ids = request.data.get("ids", [])

        if not ids or action not in ("approve", "reject", "delete"):
            return Response({"detail": "Provide a valid action and a non-empty ids list."}, status=status.HTTP_400_BAD_REQUEST)

        events = Event.objects.filter(pk__in=ids)

        if action == "approve":
            affected = events.update(status=Event.STATUS_APPROVED)
        elif action == "reject":
            affected = events.update(status=Event.STATUS_REJECTED)
        else:
            affected, _ = events.delete()

        return Response({"affected": affected})


class ExpiredEventsView(APIView):
    """
    GET  /api/admin/events/expired/  — list all expired events + count
    DELETE /api/admin/events/expired/  — permanently delete all expired events
    An event is expired when end_date < now, or (end_date is null and date < now).
    """
    permission_classes = [AdminPermission]

    def _expired_qs(self):
        now = timezone.now()
        return Event.objects.filter(
            Q(end_date__lt=now) | Q(end_date__isnull=True, date__lt=now)
        ).select_related("organizer", "category").order_by("date")

    def get(self, request):
        expired = self._expired_qs()
        events = [
            {
                "id": e.id,
                "title": e.title,
                "date": e.date,
                "end_date": e.end_date,
                "location": e.location,
                "city": e.city,
                "organizer_username": e.organizer.username if e.organizer else "",
                "status": e.status,
            }
            for e in expired
        ]
        return Response({"count": len(events), "events": events})

    def delete(self, request):
        expired = self._expired_qs()
        count, _ = expired.delete()
        return Response({"deleted": count}, status=status.HTTP_200_OK)
