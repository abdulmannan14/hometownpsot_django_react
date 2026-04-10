import django_filters
from .models import Event


class EventFilter(django_filters.FilterSet):
    date_from = django_filters.DateFilter(field_name="date", lookup_expr="gte")
    date_to = django_filters.DateFilter(field_name="date", lookup_expr="lte")
    city = django_filters.CharFilter(lookup_expr="icontains")
    location = django_filters.CharFilter(lookup_expr="icontains")
    category = django_filters.NumberFilter(field_name="category__id")
    venue = django_filters.NumberFilter(field_name="venue__id")
    is_featured = django_filters.BooleanFilter()

    class Meta:
        model = Event
        fields = ["category", "venue", "city", "location", "is_featured", "date_from", "date_to"]
