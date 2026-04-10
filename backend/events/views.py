from rest_framework import generics, permissions, status, filters
from rest_framework.response import Response
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import F
from .models import Event, Category, Venue, EventImage, VenueImage
from .serializers import EventSerializer, EventListSerializer, CategorySerializer, VenueSerializer, EventImageSerializer, VenueImageSerializer
from .filters import EventFilter


class IsAdminOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return bool(request.user and (request.user.is_staff or getattr(request.user, 'role', None) == 'admin'))


class IsOwnerOrAdmin(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.organizer == request.user or request.user.is_staff or getattr(request.user, 'role', None) == 'admin'


class EventListCreateView(generics.ListCreateAPIView):
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = EventFilter
    search_fields = ["title", "description", "location", "city"]
    ordering_fields = ["date", "created_at", "is_featured"]
    ordering = ["date"]

    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated and (user.is_staff or getattr(user, 'role', None) == 'admin'):
            return Event.objects.select_related("organizer", "category").prefetch_related("images").all()
        if user.is_authenticated:
            from django.db.models import Q
            return Event.objects.select_related("organizer", "category").prefetch_related("images").filter(
                Q(status=Event.STATUS_APPROVED) | Q(organizer=user)
            )
        return Event.objects.select_related("organizer", "category").prefetch_related("images").filter(status=Event.STATUS_APPROVED)

    def get_serializer_class(self):
        if self.request.method == "GET":
            return EventListSerializer
        return EventSerializer

    def get_permissions(self):
        if self.request.method == "POST":
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]


class EventDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = EventSerializer
    permission_classes = [IsOwnerOrAdmin]

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        # Increment atomically — avoids race conditions under concurrent requests
        Event.objects.filter(pk=instance.pk).update(view_count=F("view_count") + 1)
        instance.refresh_from_db(fields=["view_count"])
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated and (user.is_staff or getattr(user, 'role', None) == 'admin'):
            return Event.objects.select_related("organizer", "category").prefetch_related("images").all()
        if user.is_authenticated:
            from django.db.models import Q
            return Event.objects.select_related("organizer", "category").prefetch_related("images").filter(
                Q(status=Event.STATUS_APPROVED) | Q(organizer=user)
            )
        return Event.objects.select_related("organizer", "category").prefetch_related("images").filter(status=Event.STATUS_APPROVED)


class MyEventsView(generics.ListAPIView):
    serializer_class = EventListSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Event.objects.filter(organizer=self.request.user).select_related("category")


class EventApproveView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def post(self, request, pk):
        try:
            event = Event.objects.get(pk=pk)
        except Event.DoesNotExist:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        event.status = Event.STATUS_APPROVED
        event.save()
        return Response({"detail": "Event approved."})


class EventRejectView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def post(self, request, pk):
        try:
            event = Event.objects.get(pk=pk)
        except Event.DoesNotExist:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        event.status = Event.STATUS_REJECTED
        event.save()
        return Response({"detail": "Event rejected."})


class CategoryListView(generics.ListAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]


class VenueListCreateView(generics.ListCreateAPIView):
    queryset = Venue.objects.prefetch_related("images").all()
    serializer_class = VenueSerializer
    permission_classes = [IsAdminOrReadOnly]
    pagination_class = None
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["name", "city", "address"]
    ordering_fields = ["name", "city"]
    ordering = ["city", "name"]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        venue = serializer.save()
        # Handle main image upload via multipart
        if "image" in request.FILES:
            venue.image = request.FILES["image"]
            venue.save(update_fields=["image"])
        return Response(self.get_serializer(venue).data, status=status.HTTP_201_CREATED)


class VenueDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Venue.objects.prefetch_related("images").all()
    serializer_class = VenueSerializer
    permission_classes = [IsAdminOrReadOnly]

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop("partial", False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        venue = serializer.save()
        if "image" in request.FILES:
            venue.image = request.FILES["image"]
            venue.save(update_fields=["image"])
        return Response(self.get_serializer(venue).data)


class EventImageUploadView(APIView):
    """Upload one or more images to an event's gallery."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            event = Event.objects.get(pk=pk)
        except Event.DoesNotExist:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

        is_admin = request.user.is_staff or getattr(request.user, "role", None) == "admin"
        if event.organizer != request.user and not is_admin:
            return Response({"detail": "Permission denied."}, status=status.HTTP_403_FORBIDDEN)

        files = request.FILES.getlist("images")
        if not files:
            return Response({"detail": "No images provided."}, status=status.HTTP_400_BAD_REQUEST)

        created = []
        for f in files:
            img = EventImage.objects.create(event=event, image=f)
            created.append(EventImageSerializer(img, context={"request": request}).data)

        return Response(created, status=status.HTTP_201_CREATED)


class EventImageDeleteView(APIView):
    """Delete a single event image."""
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, pk):
        try:
            img = EventImage.objects.select_related("event").get(pk=pk)
        except EventImage.DoesNotExist:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

        is_admin = request.user.is_staff or getattr(request.user, "role", None) == "admin"
        if img.event.organizer != request.user and not is_admin:
            return Response({"detail": "Permission denied."}, status=status.HTTP_403_FORBIDDEN)

        img.image.delete(save=False)
        img.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class VenueImageUploadView(APIView):
    """Upload one or more images to a venue's gallery."""
    permission_classes = [permissions.IsAdminUser]

    def post(self, request, pk):
        try:
            venue = Venue.objects.get(pk=pk)
        except Venue.DoesNotExist:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

        files = request.FILES.getlist("images")
        if not files:
            return Response({"detail": "No images provided."}, status=status.HTTP_400_BAD_REQUEST)

        created = []
        for f in files:
            img = VenueImage.objects.create(venue=venue, image=f)
            created.append(VenueImageSerializer(img, context={"request": request}).data)

        return Response(created, status=status.HTTP_201_CREATED)


class VenueImageDeleteView(APIView):
    """Delete a single venue gallery image."""
    permission_classes = [permissions.IsAdminUser]

    def delete(self, request, pk):
        try:
            img = VenueImage.objects.get(pk=pk)
        except VenueImage.DoesNotExist:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

        img.image.delete(save=False)
        img.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
