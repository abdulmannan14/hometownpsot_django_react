from django.db import models


class SiteSettings(models.Model):
    """Singleton model — always use SiteSettings.get() to access."""
    default_radius_miles = models.PositiveIntegerField(
        default=10,
        help_text="Radius (in miles) used for 'Events Near You' on the homepage."
    )

    class Meta:
        verbose_name = "Site Settings"

    def save(self, *args, **kwargs):
        # Enforce singleton: only one row ever exists (pk=1)
        self.pk = 1
        super().save(*args, **kwargs)

    @classmethod
    def get(cls):
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj

    def __str__(self):
        return f"Site Settings (radius: {self.default_radius_miles} mi)"
